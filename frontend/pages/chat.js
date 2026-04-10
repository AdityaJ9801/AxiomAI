/* ─────────────────────────────────────────────────────────────────────────────
   AxiomAI — Agentic Chat  (chat.js)
   Full agentic chatbot with:
     • MCP tool execution on backend (EDA, quality, histogram, scatter, bar)
     • Inline Chart.js visualizations rendered inside chat bubbles
     • Inline data tables
     • Multi-turn conversation history
     • LLM (OpenAI / Groq / Ollama) with smart fallback
───────────────────────────────────────────────────────────────────────────── */

// State
const chatHistory   = [];         // { role, content, time, chart_data?, table_data?, tools_used? }
const chatCharts    = {};         // Map canvasId → Chart instance (for cleanup)
let   llmProvider   = '';

// ── Greeting ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const dsLine = AppState.datasetLoaded
    ? `**Dataset loaded:** ${AppState.datasetInfo?.shape?.[0]?.toLocaleString()} rows × ${AppState.datasetInfo?.shape?.[1]} columns — ${AppState.datasetInfo?.filename || ''}`
    : '**No dataset loaded.** Upload one from the sidebar to get started.';
  return `Hello! I'm **Axiom Agent** — your agentic AI data analyst.\n\nI automatically execute analysis tools based on what you ask. Try:\n- *"Show me the distribution of ApplicantIncome"*\n- *"What is the ratio of Male to Female?"*\n- *"Check data quality issues"*\n- *"Correlations between numeric columns"*\n\n${dsLine}`;
}

// ── Page render ───────────────────────────────────────────────────────────────
function renderChat(container) {
  // Destroy old chart instances
  Object.values(chatCharts).forEach(c => { try { c.destroy(); } catch {} });
  Object.keys(chatCharts).forEach(k => delete chatCharts[k]);

  container.innerHTML = `
    <div style="display:flex;gap:16px;height:calc(100vh - 120px);min-height:560px;">

      <!-- Sidebar -->
      <div style="width:240px;flex-shrink:0;display:flex;flex-direction:column;gap:12px;overflow-y:auto;">
        <div class="card">
          <div class="card-title mb-8" style="font-size:13px;">⚡ Quick Prompts</div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${[
              ['📊 Summarize dataset',        'Summarize my dataset with key statistics'],
              ['🔍 Run EDA',                  'Run exploratory data analysis and describe the results'],
              ['🧹 Data quality check',       'Check data quality issues — missing values, duplicates, outliers'],
              ['📈 Best visualization',       'What is the best chart to visualize this dataset?'],
              ['🔗 Top correlations',         'Show me the top correlations in the dataset'],
              ['⚧ Gender ratio',             'What is the ratio of male and female in the data?'],
              ['💰 Income distribution',      'Show me the distribution of ApplicantIncome'],
              ['📝 Generate report',          'Help me generate a full analysis report'],
              ['🤖 ML recommendation',        'What machine learning approach is best for this data?'],
            ].map(([label, prompt]) => `
              <button class="btn btn-ghost btn-sm" style="text-align:left;justify-content:flex-start;font-size:11px;padding:6px 8px;border-radius:6px;"
                onclick="sendSuggestion(${JSON.stringify(prompt)})">${label}</button>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-title mb-6" style="font-size:12px;">📂 Dataset</div>
          <div style="font-size:11px;color:var(--text-secondary);line-height:1.7;">
            ${AppState.datasetLoaded ? `
              <div>📄 <strong>${AppState.datasetInfo?.filename || 'dataset'}</strong></div>
              <div>${(AppState.datasetInfo?.shape?.[0]||0).toLocaleString()} rows</div>
              <div>${AppState.datasetInfo?.shape?.[1] || 0} columns</div>
            ` : '<span class="text-muted">No dataset loaded</span>'}
          </div>
        </div>

        <div class="card">
          <div class="card-title mb-6" style="font-size:12px;">🤖 Agent Status</div>
          <div style="font-size:11px;color:var(--text-secondary);">
            <div>Provider: <span id="chat-provider-label" style="color:var(--accent-primary);">Checking...</span></div>
            <div>Backend: <span id="chat-backend-label" style="color:var(--success);">—</span></div>
          </div>
        </div>

        <button class="btn btn-ghost btn-sm" onclick="clearChat()" style="font-size:11px;">
          🗑 Clear Conversation
        </button>
      </div>

      <!-- Chat main -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
        <!-- Messages -->
        <div id="chat-messages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:4px 2px 16px;"></div>

        <!-- Input area -->
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${['Key Insights','Data Quality','Distributions','Correlations','Best Chart'].map(l => `
              <span class="chat-suggestion-chip" style="cursor:pointer;font-size:11px;"
                onclick="sendSuggestion(${JSON.stringify(l === 'Key Insights' ? 'What are the key insights from my dataset?' : l === 'Data Quality' ? 'Check data quality issues' : l === 'Distributions' ? 'Explain the distribution of numeric columns' : l === 'Correlations' ? 'Show me the top correlations' : 'What is the best chart for this data?')})">${l}</span>
            `).join('')}
          </div>
          <div style="display:flex;gap:8px;align-items:flex-end;">
            <textarea id="chat-input" class="chat-textarea"
              placeholder="Ask me anything about your data…"
              rows="1"
              onkeydown="handleChatKey(event)"
              oninput="autoResize(this)"
              style="flex:1;resize:none;min-height:42px;max-height:120px;"></textarea>
            <button class="btn btn-primary" onclick="sendChat()" id="send-btn" style="height:42px;padding:0 18px;flex-shrink:0;">
              ${svgIcon('send',14)} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add greeting if fresh
  if (chatHistory.length === 0) {
    chatHistory.push({ role: 'assistant', content: getGreeting(), time: ts() });
  }
  renderMessages();
  checkAgentStatus();
}

// ── Status ────────────────────────────────────────────────────────────────────
async function checkAgentStatus() {
  const providerEl = document.getElementById('chat-provider-label');
  const backendEl  = document.getElementById('chat-backend-label');
  try {
    await api.health();
    if (backendEl) backendEl.textContent = 'Connected ✓';
  } catch {
    if (backendEl) { backendEl.textContent = 'Offline ✗'; backendEl.style.color = 'var(--error)'; }
  }
  try {
    const r = await api.request('POST', '/api/chat', { message: '__ping__', history: [] });
    llmProvider = r.provider || 'fallback';
    if (providerEl) providerEl.textContent = llmProvider.toUpperCase() + (r.provider === 'fallback' ? ' (no key)' : ' ✓');
  } catch {
    if (providerEl) providerEl.textContent = 'Unavailable';
  }
}

function ts() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function autoResize(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
function handleChatKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }
function sendSuggestion(text) { const inp = document.getElementById('chat-input'); if (inp) inp.value = text; sendChat(); }
function clearChat() {
  chatHistory.length = 0;
  Object.values(chatCharts).forEach(c => { try { c.destroy(); } catch {} });
  Object.keys(chatCharts).forEach(k => delete chatCharts[k]);
  chatHistory.push({ role: 'assistant', content: getGreeting(), time: ts() });
  renderMessages();
}

// ── Message rendering ─────────────────────────────────────────────────────────
function renderMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  // Destroy charts from previous render cycle
  Object.values(chatCharts).forEach(c => { try { c.destroy(); } catch {} });
  Object.keys(chatCharts).forEach(k => delete chatCharts[k]);

  container.innerHTML = chatHistory.map((msg, idx) => {
    if (msg.role === 'user') {
      return `
        <div style="display:flex;justify-content:flex-end;">
          <div style="max-width:75%;">
            <div class="msg-bubble-user" style="background:var(--accent-primary);color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:13px;line-height:1.5;">
              ${escHtml(msg.content)}
            </div>
            <div class="text-muted" style="font-size:10px;text-align:right;margin-top:3px;">${msg.time}</div>
          </div>
        </div>`;
    }
    // Agent message
    const toolBadges = (msg.tools_used || []).map(t =>
      `<span style="background:rgba(79,70,229,0.15);color:#a5b4fc;font-size:10px;padding:2px 7px;border-radius:10px;border:1px solid rgba(79,70,229,0.3);">${t.replace(/_/g,' ')}</span>`
    ).join(' ');
    const chartHtml  = msg.chart_data ? buildInlineChart(msg.chart_data, `chat-chart-${idx}`) : '';
    const tableHtml  = msg.table_data ? buildInlineTable(msg.table_data) : '';
    return `
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#06B6D4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;">⚡</div>
        <div style="flex:1;min-width:0;">
          <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px 16px 16px 16px;padding:12px 14px;font-size:13px;line-height:1.6;color:var(--text-primary);">
            ${fmtMd(msg.content)}
          </div>
          ${toolBadges ? `<div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap;">${toolBadges}</div>` : ''}
          ${chartHtml}
          ${tableHtml}
          <div class="text-muted" style="font-size:10px;margin-top:3px;">${msg.time}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;

  // Init Chart.js instances AFTER DOM is ready
  chatHistory.forEach((msg, idx) => {
    if (msg.chart_data) {
      setTimeout(() => initChatChart(msg.chart_data, `chat-chart-${idx}`), 60);
    }
  });
}

// ── Inline chart builder ──────────────────────────────────────────────────────
function buildInlineChart(cd, canvasId) {
  if (!cd) return '';
  const title = cd.column || cd.x_column
    ? (cd.type === 'scatter' ? `${cd.x_column} vs ${cd.y_column}` : cd.column)
    : 'Chart';
  const stats = cd.statistics;
  const statRow = stats ? `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
      ${['mean','median','std','min','max'].filter(k=>stats[k]!=null).map(k=>`
        <div style="background:var(--bg-tertiary);border-radius:6px;padding:4px 8px;font-size:11px;">
          <span style="color:var(--text-muted);text-transform:uppercase;">${k}</span>
          <div style="font-weight:600;color:var(--text-primary);">${Number(stats[k]).toFixed(2)}</div>
        </div>`).join('')}
    </div>` : '';
  return `
    <div style="margin-top:10px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:10px;padding:12px;">
      <div style="font-size:12px;font-weight:600;color:var(--accent-secondary);margin-bottom:8px;">📊 ${title}</div>
      <div style="position:relative;height:200px;">
        <canvas id="${canvasId}"></canvas>
      </div>
      ${statRow}
    </div>`;
}

function initChatChart(cd, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (chatCharts[canvasId]) { try { chatCharts[canvasId].destroy(); } catch {} }

  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { size: 11 } } },
      tooltip: { backgroundColor: '#1F2937', titleColor: '#E5E7EB', bodyColor: '#9CA3AF' }
    },
    scales: {
      x: { ticks: { color: '#6B7280', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: 'rgba(55,65,81,0.4)' } },
      y: { ticks: { color: '#6B7280', font: { size: 10 } }, grid: { color: 'rgba(55,65,81,0.4)' } }
    }
  };

  let config;
  if (cd.type === 'histogram' || cd.type === 'bar_cat') {
    const items = cd.data || [];
    config = {
      type: 'bar',
      data: {
        labels:   items.map(d => d.label || d.bin_start?.toFixed(1) || ''),
        datasets: [{ label: cd.column || 'Count', data: items.map(d => d.count),
          backgroundColor: 'rgba(79,70,229,0.65)', borderColor: '#4F46E5', borderWidth: 1, borderRadius: 3 }]
      },
      options: opts
    };
  } else if (cd.type === 'scatter') {
    config = {
      type: 'scatter',
      data: {
        datasets: [{ label: `${cd.x_column} vs ${cd.y_column}`,
          data: (cd.data || []).map(d => ({ x: d.x, y: d.y })),
          backgroundColor: 'rgba(79,70,229,0.45)', pointRadius: 2.5, borderColor: '#4F46E5' }]
      },
      options: { ...opts, plugins: { ...opts.plugins,
        title: { display: !!cd.correlation, text: `Pearson r = ${cd.correlation}`, color: '#9CA3AF', font: { size: 11 } }
      }}
    };
  } else {
    return; // unsupported
  }

  try { chatCharts[canvasId] = new Chart(canvas.getContext('2d'), config); }
  catch (e) { console.warn('[ChatChart]', e); }
}

// ── Inline table builder ──────────────────────────────────────────────────────
function buildInlineTable(td) {
  if (!td || !td.headers || !td.rows) return '';
  return `
    <div style="margin-top:10px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:10px;padding:12px;overflow-x:auto;">
      <div style="font-size:12px;font-weight:600;color:var(--accent-secondary);margin-bottom:8px;">📋 ${td.title || 'Results'}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr>${td.headers.map(h => `<th style="padding:5px 10px;background:rgba(79,70,229,0.1);color:#a5b4fc;text-align:left;border-bottom:1px solid var(--border);">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${td.rows.map((row, i) => `
            <tr style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'};">
              ${row.map(cell => `<td style="padding:5px 10px;color:var(--text-primary);border-bottom:1px solid rgba(55,65,81,0.3);">${cell}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Markdown formatter ────────────────────────────────────────────────────────
function fmtMd(text) {
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code style="background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px;font-size:11px;">$1</code>')
    .replace(/^• /gm,          '&bull; ')
    .replace(/\n/g,            '<br/>');
}
function escHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Send message ──────────────────────────────────────────────────────────────
async function sendChat() {
  const input  = document.getElementById('chat-input');
  const text   = (input?.value || '').trim();
  if (!text || text === '__ping__') return;

  input.value = '';
  if (input) autoResize(input);

  // Push user msg
  chatHistory.push({ role: 'user', content: text, time: ts() });
  renderMessages();

  // Disable send + show typing
  const btn = document.getElementById('send-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span>'; }

  const typingId = 'typing-' + Date.now();
  const msgBox   = document.getElementById('chat-messages');
  if (msgBox) {
    msgBox.insertAdjacentHTML('beforeend', `
      <div id="${typingId}" style="display:flex;gap:8px;align-items:flex-start;">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#06B6D4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;">⚡</div>
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px 16px 16px 16px;padding:10px 14px;color:var(--text-muted);font-size:13px;">
          <span class="spinner" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
          Analyzing with tools…
        </div>
      </div>`);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  // Build history for API
  const apiHistory = chatHistory
    .slice(0, -1)
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  try {
    const data = await api.request('POST', '/api/chat', { message: text, history: apiHistory });
    document.getElementById(typingId)?.remove();
    chatHistory.push({
      role:       'assistant',
      content:    data.reply || 'No response.',
      time:       ts(),
      chart_data: data.chart_data || null,
      table_data: data.table_data || null,
      tools_used: data.tools_used || [],
    });
    // Update provider badge
    if (data.provider) {
      const lbl = document.getElementById('chat-provider-label');
      if (lbl) lbl.textContent = data.provider.toUpperCase() + (data.tools_used?.length ? ` (${data.tools_used.length} tools)` : '');
    }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    chatHistory.push({
      role: 'assistant',
      content: `**Connection error:** ${err.message}\n\nMake sure the backend is running at http://localhost:8000.`,
      time: ts()
    });
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = `${svgIcon('send',14)} Send`; }
    renderMessages();
  }
}

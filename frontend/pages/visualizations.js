/* Visualizations Page */
let currentChartType = 'histogram';
let vizChart = null;

function renderVisualizations(container) {
  const cols = AppState.datasetInfo?.columns || [];
  const numericCols = cols.filter(c => {
    const t = AppState.datasetInfo?.dtypes?.[c] || '';
    return t.includes('float') || t.includes('int');
  });

  container.innerHTML = `
    <div class="flex items-center justify-between mb-16">
      <div>
        <h1 class="page-title">Visualizations</h1>
        <p class="page-subtitle">Interactive charts and Power BI-style dashboard. Choose a type or get AI suggestions.</p>
      </div>
    </div>

    <div style="display:flex;gap:16px;min-height:600px;">
      <!-- Chart Builder Panel -->
      <div style="width:260px;flex-shrink:0;display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <div class="card-title mb-12">Chart Type</div>
          <div class="chart-type-grid">
            ${[
              { id: 'histogram', label: 'Histogram', icon: 'M3 17l4-8 4 5 4-10 4 13'},
              { id: 'scatter',   label: 'Scatter',   icon: 'M2 12h2M10 7h2M14 17h2M6 4h2M18 10h2'},
              { id: 'line',      label: 'Line',      icon: 'M3 12l4-6 4 9 4-5 4 2'},
              { id: 'bar',       label: 'Bar',       icon: 'M18 20V10M12 20V4M6 20v-6'},
            ].map(ct => `
              <button class="chart-type-btn ${currentChartType === ct.id ? 'active' : ''}"
                      id="ct-${ct.id}" onclick="selectChartType('${ct.id}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="${ct.icon}"/>
                </svg>
                ${ct.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-title mb-12">Configuration</div>

          <div class="form-group">
            <label class="form-label" id="x-label">Column (X-axis)</label>
            <select class="form-select" id="x-col">
              ${numericCols.map(c => `<option>${c}</option>`).join('') || cols.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" id="y-group">
            <label class="form-label">Y-axis Column</label>
            <select class="form-select" id="y-col">
              ${numericCols.map(c => `<option>${c}</option>`).join('') || cols.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" id="bins-group">
            <label class="form-label">Bins: <span id="bins-val">30</span></label>
            <input type="range" id="bins-slider" min="5" max="100" value="30" style="width:100%;accent-color:var(--accent-primary);"
              oninput="document.getElementById('bins-val').textContent=this.value" />
          </div>

          <button class="btn btn-primary btn-full" onclick="generateChart()" id="gen-chart-btn">
            ${svgIcon('chart',14)} Generate Chart
          </button>
        </div>

        <div class="card">
          <div class="card-title mb-8">AI Suggestions</div>
          <div id="viz-suggestions">
            ${!AppState.datasetLoaded
              ? '<div class="text-muted text-sm">Upload dataset first.</div>'
              : '<button class="btn btn-ghost btn-sm btn-full" onclick="loadVizSuggestions()">Get AI Suggestions</button>'}
          </div>
        </div>
      </div>

      <!-- Chart Area -->
      <div style="flex:1;display:flex;flex-direction:column;gap:16px;">
        <!-- Tabs -->
        <div class="flex gap-8" style="border-bottom:1px solid var(--border);padding-bottom:8px;">
          <button class="btn btn-secondary btn-sm active-tab" id="tab-current" onclick="switchVizTab('current')" style="border-color:var(--accent-primary);color:#a5b4fc;">Current Chart</button>
          <button class="btn btn-ghost btn-sm" id="tab-saved" onclick="switchVizTab('saved')">Saved Charts</button>
          <button class="btn btn-ghost btn-sm" id="tab-dashboard" onclick="switchVizTab('dashboard')">Dashboard View</button>
        </div>

        <!-- Current Chart -->
        <div id="viz-tab-current">
          <div class="card" style="min-height:480px;">
            <div class="flex items-center justify-between mb-12">
              <div>
                <div class="card-title" id="chart-title">Generate a chart to get started</div>
                <div class="text-muted text-sm" id="chart-subtitle">Select a chart type and column, then click Generate Chart</div>
              </div>
              <div class="flex gap-8">
                <button class="btn btn-ghost btn-sm" onclick="saveCurrentChart()">${svgIcon('download',14)} Save</button>
              </div>
            </div>

            <div id="chart-loading" style="display:none;text-align:center;padding:80px;">
              <div class="spinner" style="width:32px;height:32px;margin:0 auto 16px;"></div>
              <div class="text-muted">Generating visualization...</div>
            </div>

            <div id="chart-empty" style="text-align:center;padding:80px;color:var(--text-muted);">
              <div style="margin-bottom:12px;">${svgIcon('chart',40)}</div>
              <div class="text-lg font-600 mb-8">No chart generated yet</div>
              <div class="text-sm">Configure options on the left and click "Generate Chart"</div>
            </div>

            <div id="chart-canvas-wrap" style="display:none;">
              <div class="chart-wrap" style="height:360px;">
                <canvas id="main-viz-chart"></canvas>
              </div>
              <div class="grid-4 mt-12" id="chart-stats"></div>
            </div>
          </div>
        </div>

        <!-- Saved Charts Tab -->
        <div id="viz-tab-saved" style="display:none;">
          <div class="card">
            <div class="card-title mb-12">Saved Charts</div>
            <div id="saved-charts-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="text-muted text-sm">No saved charts yet. Generate and save a chart first.</div>
            </div>
          </div>
        </div>

        <!-- Dashboard Tab -->
        <div id="viz-tab-dashboard" style="display:none;">
          <div class="card">
            <div class="flex items-center justify-between mb-12">
              <span class="card-title">My Dashboard</span>
              <div class="flex gap-8">
                <button class="btn btn-ghost btn-sm">Edit Layout</button>
                <button class="btn btn-secondary btn-sm">Export</button>
              </div>
            </div>
            <div id="dashboard-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:300px;">
              <div class="card-sm" style="text-align:center;padding:40px;color:var(--text-muted);">
                <div>Save charts to populate dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Init chart type UI
  updateChartTypeUI();
}

const savedCharts = [];

function selectChartType(type) {
  currentChartType = type;
  updateChartTypeUI();
}

function updateChartTypeUI() {
  ['histogram','scatter','line','bar'].forEach(id => {
    const btn = document.getElementById('ct-' + id);
    if (btn) btn.className = `chart-type-btn ${currentChartType === id ? 'active' : ''}`;
  });

  // Toggle y-axis and bins based on type
  const yGroup = document.getElementById('y-group');
  const binsGroup = document.getElementById('bins-group');
  if (yGroup) yGroup.style.display = ['scatter','line'].includes(currentChartType) ? 'block' : 'none';
  if (binsGroup) binsGroup.style.display = currentChartType === 'histogram' ? 'block' : 'none';
}

function switchVizTab(tab) {
  ['current','saved','dashboard'].forEach(t => {
    const el = document.getElementById(`viz-tab-${t}`);
    const btn = document.getElementById(`tab-${t}`);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.className = t === tab ? 'btn btn-secondary btn-sm' : 'btn btn-ghost btn-sm';
      if (t === tab) { btn.style.borderColor = 'var(--accent-primary)'; btn.style.color = '#a5b4fc'; }
      else { btn.style.borderColor = ''; btn.style.color = ''; }
    }
  });
}

// generateChart: accepts optional overrides so AI suggestions bypass DOM state
async function generateChart(overrideType, overrideX, overrideY) {
  if (!AppState.datasetLoaded) { showToast('Upload a dataset first', 'error'); return; }

  const chartType = overrideType || currentChartType;
  const xCol = overrideX || document.getElementById('x-col')?.value;
  const yCol = overrideY || document.getElementById('y-col')?.value;
  const bins = parseInt(document.getElementById('bins-slider')?.value || '30');

  // Keep global state in sync
  if (overrideType) {
    currentChartType = overrideType;
    updateChartTypeUI();
  }
  // Sync selects to override values so UI reflects what's shown
  if (overrideX) {
    const xSel = document.getElementById('x-col');
    if (xSel) for (const o of xSel.options) { if (o.value === overrideX) { o.selected = true; break; } }
  }
  if (overrideY && ['scatter','line'].includes(chartType)) {
    const ySel = document.getElementById('y-col');
    if (ySel) for (const o of ySel.options) { if (o.value === overrideY) { o.selected = true; break; } }
  }

  const loadEl  = document.getElementById('chart-loading');
  const emptyEl = document.getElementById('chart-empty');
  const wrapEl  = document.getElementById('chart-canvas-wrap');

  if (emptyEl) emptyEl.style.display = 'none';
  if (wrapEl)  wrapEl.style.display = 'none';
  if (loadEl)  { loadEl.style.display = 'flex'; loadEl.style.flexDirection = 'column'; }

  try {
    let chartConfig;

    if (chartType === 'histogram') {
      const data = await api.histogram(xCol, bins);
      document.getElementById('chart-title').textContent    = `${xCol} — Distribution`;
      document.getElementById('chart-subtitle').textContent = `${data.statistics?.count || 0} observations • ${bins} bins`;
      document.getElementById('chart-stats').innerHTML      = buildStatCards(data.statistics);
      chartConfig = buildHistogramConfig(data);

    } else if (chartType === 'scatter') {
      const data = await api.scatter(xCol, yCol);
      document.getElementById('chart-title').textContent    = `${xCol} vs ${yCol}`;
      document.getElementById('chart-subtitle').textContent = `Correlation: ${Number(data.correlation || 0).toFixed(2)} • ${data.data?.length || 0} points`;
      document.getElementById('chart-stats').innerHTML      = '';
      chartConfig = buildScatterConfig(data, xCol, yCol);

    } else if (chartType === 'line') {
      const data = await api.line(xCol, yCol);
      document.getElementById('chart-title').textContent    = `${yCol} over ${xCol}`;
      document.getElementById('chart-subtitle').textContent = `Line chart • ${data.data?.length || 0} points`;
      document.getElementById('chart-stats').innerHTML      = '';
      chartConfig = buildLineConfig(data, xCol, yCol);

    } else if (chartType === 'bar') {
      const data = await api.histogram(xCol, Math.min(bins, 20));
      document.getElementById('chart-title').textContent    = `${xCol} — Bar Chart`;
      document.getElementById('chart-subtitle').textContent = `${data.statistics?.count || 0} observations`;
      document.getElementById('chart-stats').innerHTML      = buildStatCards(data.statistics);
      chartConfig = buildBarConfig(data);
    }

    if (loadEl) loadEl.style.display = 'none';
    if (wrapEl) wrapEl.style.display = 'block';

    if (vizChart) { try { vizChart.destroy(); } catch {} }
    const canvas = document.getElementById('main-viz-chart');
    if (!canvas) return;
    vizChart = new Chart(canvas.getContext('2d'), chartConfig);
    AppState.charts['viz'] = vizChart;

  } catch (err) {
    if (loadEl)  loadEl.style.display  = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    showToast('Chart error: ' + err.message, 'error');
  }
}

function buildHistogramConfig(data) {
  return {
    type: 'bar',
    data: {
      labels: data.data.map(d => d.bin_start.toFixed(0)),
      datasets: [{ label: data.column, data: data.data.map(d => d.count), backgroundColor: 'rgba(79,70,229,0.7)', borderColor: '#4F46E5', borderWidth: 1, borderRadius: 3 }]
    },
    options: darkChartOptions('Count', data.column)
  };
}

function buildScatterConfig(data, x, y) {
  return {
    type: 'scatter',
    data: {
      datasets: [{ label: `${x} vs ${y}`, data: (data.data || []).slice(0,500).map(d => ({ x: d.x, y: d.y })), backgroundColor: 'rgba(79,70,229,0.5)', borderColor: '#4F46E5', pointRadius: 3 }]
    },
    options: darkChartOptions(y, x)
  };
}

function buildLineConfig(data, x, y) {
  return {
    type: 'line',
    data: {
      labels: (data.data || []).map(d => d.x),
      datasets: [{ label: y, data: (data.data || []).map(d => d.y), borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.08)', fill: true, tension: 0.4, pointRadius: 2 }]
    },
    options: darkChartOptions(y, x)
  };
}

function buildBarConfig(data) {
  return {
    type: 'bar',
    data: {
      labels: data.data.map(d => d.label?.split('-')[0] || d.bin_start?.toFixed(0)),
      datasets: [{ label: data.column, data: data.data.map(d => d.count), backgroundColor: 'rgba(6,182,212,0.6)', borderColor: '#06B6D4', borderWidth: 1, borderRadius: 4 }]
    },
    options: darkChartOptions('Count', 'Value')
  };
}

function darkChartOptions(yLabel = '', xLabel = '') {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: '#1F2937', titleColor: '#E5E7EB', bodyColor: '#9CA3AF', borderColor: '#374151', borderWidth: 1 }
    },
    scales: {
      x: { title: { display: !!xLabel, text: xLabel, color: '#6B7280' }, ticks: { color: '#6B7280', maxTicksLimit: 10 }, grid: { color: 'rgba(31,41,55,0.6)' } },
      y: { title: { display: !!yLabel, text: yLabel, color: '#6B7280' }, ticks: { color: '#6B7280' }, grid: { color: 'rgba(31,41,55,0.6)' } }
    }
  };
}

function buildStatCards(stats) {
  if (!stats) return '';
  return ['mean','std','min','max'].map(k => `
    <div class="kpi-card" style="padding:12px;">
      <span class="kpi-label">${k.toUpperCase()}</span>
      <div style="font-size:16px;font-weight:600;">${Number(stats[k] || 0).toFixed(2)}</div>
    </div>
  `).join('');
}

function saveCurrentChart() {
  if (!vizChart) { showToast('No chart to save', 'error'); return; }
  const title = document.getElementById('chart-title')?.textContent || 'Chart';
  savedCharts.push({ title, type: currentChartType });
  showToast('Chart saved to dashboard!', 'success');
  renderSavedCharts();
}

function renderSavedCharts() {
  const grid = document.getElementById('saved-charts-grid');
  if (!grid) return;
  if (savedCharts.length === 0) {
    grid.innerHTML = '<div class="text-muted text-sm">No saved charts yet.</div>';
    return;
  }
  grid.innerHTML = savedCharts.map((c, i) => `
    <div class="card-sm" style="background:var(--bg-tertiary);">
      <div class="text-sm font-600 mb-4">${c.title}</div>
      <div class="text-muted text-xs">${c.type}</div>
    </div>
  `).join('');
}

async function loadVizSuggestions() {
  try {
    const data = await api.vizOptions();
    const suggestions = data.suggestions || [];
    const cols = data.columns || {};
    const numericCols = cols.numeric || [];
    const dateCols    = cols.date   || [];
    const el = document.getElementById('viz-suggestions');
    if (!el) return;

    if (suggestions.length === 0) {
      el.innerHTML = '<div class="text-muted text-sm">No suggestions available.</div>';
      return;
    }

    el.innerHTML = suggestions.slice(0, 6).map(s => {
      // Decide which columns to pass based on suggestion type
      let x = numericCols[0] || '';
      let y = numericCols[1] || numericCols[0] || '';
      if (s.type === 'time_series' && dateCols.length > 0) {
        x = dateCols[0]; y = numericCols[0] || '';
      }
      return `
        <div class="insight-card" style="margin-bottom:6px;cursor:pointer;transition:border-color .15s;"
             onmouseenter="this.style.borderColor='var(--accent-primary)'"
             onmouseleave="this.style.borderColor=''"
             onclick="applySuggestion_viz('${s.type}','${x}','${y}')">
          <div class="text-sm font-600">${s.title || s.type}</div>
          <div class="text-xs text-muted mt-4">${s.description || ''}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    showToast('Could not load suggestions: ' + err.message, 'error');
  }
}

function applySuggestion_viz(type, x, y) {
  const typeMap = {
    'histogram':          'histogram',
    'box_plot':           'histogram',
    'scatter_plot':       'scatter',
    'scatter':            'scatter',
    'correlation_matrix': 'scatter',
    'time_series':        'line',
    'line_chart':         'line',
    'line':               'line',
    'bar':                'bar',
    'bar_chart':          'bar',
  };
  const mapped = typeMap[type] || 'histogram';
  showToast(`✓ Applying: ${type.replace(/_/g,' ')} → ${mapped} chart`, '');
  // Pass overrides directly — generateChart handles DOM sync internally
  generateChart(mapped, x || undefined, y || undefined);
}

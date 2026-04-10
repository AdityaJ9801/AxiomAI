/* Insights & KPIs Page */
function renderInsights(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-24">
      <div>
        <h1 class="page-title">Insights &amp; KPIs</h1>
        <p class="page-subtitle">AI-generated dataset insights, key performance indicators, and business metrics.</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-sm" onclick="navigate('reports')">${svgIcon('file',14)} Export Report</button>
        <button class="btn btn-primary btn-sm" id="gen-insights-btn" onclick="generateInsightsPage()">
          ${svgIcon('zap',14)} Generate Insights
        </button>
      </div>
    </div>

    ${!AppState.datasetLoaded ? `
      <div class="card" style="text-align:center;padding:48px;">
        <div style="color:var(--text-muted);margin-bottom:16px;">${svgIcon('activity',32)}</div>
        <div class="text-lg font-600 mb-8">No dataset loaded</div>
        <p class="text-muted mb-16">Load a dataset and run EDA to generate insights.</p>
        <button class="btn btn-primary" onclick="navigate('upload')">${svgIcon('upload',14)} Upload Dataset</button>
      </div>
    ` : ''}

    <!-- KPI Row -->
    <div id="kpi-row" class="grid-4 mb-24" style="${AppState.datasetLoaded ? '' : 'display:none;'}">
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Mean Value</span>
          <span class="kpi-icon">${svgIcon('chart',18)}</span>
        </div>
        <div class="kpi-value text-accent" id="kpi-mean">—</div>
        <div class="kpi-meta"><span class="text-muted" id="kpi-mean-col">Run analysis first</span></div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Max Value</span>
          <span class="kpi-icon">${svgIcon('activity',18)}</span>
        </div>
        <div class="kpi-value text-success" id="kpi-max">—</div>
        <div class="kpi-meta"><span class="text-muted" id="kpi-max-col"></span></div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Data Points</span>
          <span class="kpi-icon">${svgIcon('database',18)}</span>
        </div>
        <div class="kpi-value" id="kpi-rows">
          ${AppState.datasetInfo?.shape?.[0]?.toLocaleString() || '—'}
        </div>
        <div class="kpi-meta"><span class="text-muted">${AppState.datasetInfo?.shape?.[1] || 0} columns</span></div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Data Quality</span>
          <span class="kpi-icon">${svgIcon('shield',18)}</span>
        </div>
        <div class="kpi-value text-success" id="kpi-dq">—</div>
        <div class="kpi-meta"><span class="text-muted">Quality score</span></div>
      </div>
    </div>

    <div class="grid-2-1 mb-16" id="insights-grid" style="${AppState.datasetLoaded ? '' : 'display:none;'}">
      <!-- Left: AI Insights -->
      <div class="card">
        <div class="flex items-center justify-between mb-16">
          <div class="flex items-center gap-8">
            <span class="card-title">AI-Generated Insights</span>
            <span class="badge badge-accent">AI</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="generateInsightsPage()">Re-generate</button>
        </div>
        <div id="insights-content">
          <div style="text-align:center;padding:40px;color:var(--text-muted);">
            <div class="spinner" style="width:24px;height:24px;margin:0 auto 12px;" id="insights-spinner" style="display:none;"></div>
            <div class="text-sm">Click "Generate Insights" to run AI analysis.</div>
          </div>
        </div>
      </div>

      <!-- Right: Metrics -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <div class="card-title mb-12">Statistical Metrics</div>
          <div id="stat-metrics">
            <div class="text-muted text-sm">Run analysis to populate metrics.</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title mb-12">Dataset Overview</div>
          <div id="dataset-metrics">
            ${AppState.datasetInfo ? `
              ${buildMetricRow('Rows', (AppState.datasetInfo.shape?.[0]||0).toLocaleString())}
              ${buildMetricRow('Columns', AppState.datasetInfo.shape?.[1] || '—')}
              ${buildMetricRow('Memory', (AppState.datasetInfo.memory_usage_mb||0).toFixed(3) + ' MB')}
              ${buildMetricRow('File', AppState.datasetInfo.filename || 'dataset')}
            ` : '<div class="text-muted text-sm">No dataset loaded.</div>'}
          </div>
        </div>
      </div>
    </div>

    <!-- Forecast + Column Insights -->
    <div class="grid-2 mb-16" id="forecast-grid" style="${AppState.datasetLoaded ? '' : 'display:none;'}">
      <div class="card">
        <div class="card-title mb-12">Forecast Summary</div>
        <div id="forecast-content">
          <div class="text-muted text-sm">Run time series analysis to see forecasts. Go to EDA &amp; Analysis.</div>
          <button class="btn btn-ghost btn-sm mt-8" onclick="navigate('eda')">Go to EDA</button>
        </div>
        <div class="chart-wrap mt-12" style="height:160px;display:none;" id="forecast-chart-wrap">
          <canvas id="forecast-chart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-title mb-12">Column Insights</div>
        <div id="col-insights">
          ${AppState.datasetInfo?.columns?.slice(0,6).map(c => {
            const dtype = AppState.datasetInfo?.dtypes?.[c] || '';
            const missing = AppState.datasetInfo?.missing_values?.[c] || 0;
            return `
              <div class="activity-item" style="cursor:pointer;" onclick="showColInsight('${c}')">
                <div class="activity-icon" style="background:rgba(79,70,229,0.1);">
                  ${dtype.includes('float')||dtype.includes('int') ? svgIcon('chart',14) : svgIcon('file',14)}
                </div>
                <div class="activity-body">
                  <div class="activity-text font-600">${c}</div>
                  <div class="activity-time">${dtype} • ${missing > 0 ? `<span class="text-warning">${missing} missing</span>` : '<span class="text-success">complete</span>'}</div>
                </div>
                ${svgIcon('arrow',14)}
              </div>
            `;
          }).join('') || '<div class="text-muted text-sm">No dataset columns available.</div>'}
        </div>
      </div>
    </div>
  `;
}

function buildMetricRow(label, value) {
  return `
    <div class="status-row">
      <span class="status-row-label">${label}</span>
      <span class="font-600 text-primary">${value}</span>
    </div>
  `;
}

async function generateInsightsPage() {
  if (!AppState.datasetLoaded) { showToast('Upload a dataset first', 'error'); return; }
  const btn = document.getElementById('gen-insights-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Analyzing...'; }

  try {
    const data = await api.descriptive();
    const res = data.results;
    const numeric = res.numeric_summary || {};
    const numCols = Object.keys(numeric);

    // Update KPI cards
    if (numCols.length > 0) {
      const firstCol = numCols[0];
      document.getElementById('kpi-mean').textContent = Number(numeric[firstCol]?.mean || 0).toFixed(2);
      document.getElementById('kpi-mean-col').textContent = firstCol;
      document.getElementById('kpi-max').textContent  = Number(numeric[firstCol]?.max  || 0).toFixed(2);
      document.getElementById('kpi-max-col').textContent = firstCol;
    }

    // Quality
    try {
      const qData = await api.qualityReport();
      const score = Math.round(qData.report?.data_quality_score || 0);
      document.getElementById('kpi-dq').textContent = score + '/100';
      document.getElementById('kpi-dq').className = score >= 85 ? 'kpi-value text-success' : 'kpi-value text-warning';
    } catch {}

    // Statistical metrics
    const corr = res.correlation_matrix || {};
    const corrCols = Object.keys(corr);
    let maxCorr = 0, maxPair = ['—', '—'];
    corrCols.forEach(r => corrCols.forEach(c => {
      if (r !== c) {
        const v = Math.abs(corr[r]?.[c] || 0);
        if (v > maxCorr) { maxCorr = v; maxPair = [r, c]; }
      }
    }));

    document.getElementById('stat-metrics').innerHTML = [
      buildMetricRow('Max Correlation', maxCorr > 0 ? `${maxCorr.toFixed(2)} (${maxPair[0]} / ${maxPair[1]})` : '—'),
      ...numCols.slice(0,3).map(c => buildMetricRow(`${c} Mean`, Number(numeric[c]?.mean||0).toFixed(2))),
      buildMetricRow('Total Missing', Object.values(res.missing_values||{}).reduce((a,b)=>a+b,0))
    ].join('');

    // Generate insights
    const insights = generateInsights(res);
    document.getElementById('insights-content').innerHTML = insights.map(ins => `
      <div class="insight-card mb-8">
        <div class="insight-header">
          <span class="insight-title">${ins.title}</span>
          <span class="badge ${ins.badge}">${ins.type}</span>
        </div>
        <div class="insight-body">${ins.body}</div>
      </div>
    `).join('');

    showToast('Insights generated!', 'success');
  } catch (err) {
    showToast('Analysis failed: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = `${svgIcon('zap',14)} Generate Insights`; }
  }
}

function showColInsight(colName) {
  const info = AppState.datasetInfo;
  if (!info) return;
  const dtype = info.dtypes?.[colName] || '—';
  const missing = info.missing_values?.[colName] || 0;
  showToast(`${colName}: ${dtype}, ${missing} missing values`);
}

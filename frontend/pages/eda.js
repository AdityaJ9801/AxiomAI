/* EDA & Analysis Page */
let edaResults = null;

function renderEDA(container) {
  const cols = AppState.datasetInfo?.columns || [];
  const numericCols = cols.filter(c => {
    const t = AppState.datasetInfo?.dtypes?.[c] || '';
    return t.includes('float') || t.includes('int');
  });

  container.innerHTML = `
    <div class="flex items-center justify-between mb-16">
      <div>
        <h1 class="page-title">EDA &amp; Analysis</h1>
        <p class="page-subtitle">Automated exploratory data analysis powered by AI agents.</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-sm" onclick="navigate('reports')">${svgIcon('file',14)} Export Report</button>
      </div>
    </div>

    <!-- Pipeline -->
    <div class="pipeline" id="eda-pipeline">
      <div class="pipeline-step">
        <div class="step-dot ${AppState.datasetLoaded ? 'step-done' : 'step-pending'}">${AppState.datasetLoaded ? '✓' : '1'}</div>
        <span class="step-label">Dataset Loaded</span>
      </div>
      <div class="pipeline-step">
        <div class="step-dot step-pending" id="step-desc">2</div>
        <span class="step-label">Descriptive Stats</span>
      </div>
      <div class="pipeline-step">
        <div class="step-dot step-pending" id="step-corr">3</div>
        <span class="step-label">Correlation</span>
      </div>
      <div class="pipeline-step">
        <div class="step-dot step-pending" id="step-dist">4</div>
        <span class="step-label">Distribution</span>
      </div>
      <div class="pipeline-step">
        <div class="step-dot step-pending" id="step-insights">5</div>
        <span class="step-label">AI Insights</span>
      </div>
    </div>

    ${!AppState.datasetLoaded ? `
      <div class="card" style="text-align:center;padding:48px;">
        <div style="color:var(--text-muted);margin-bottom:16px;">${svgIcon('upload',32)}</div>
        <div class="text-lg font-600 mb-8">No dataset loaded</div>
        <p class="text-muted mb-16">Upload a dataset first to run EDA analysis.</p>
        <button class="btn btn-primary" onclick="navigate('upload')">${svgIcon('upload',14)} Upload Dataset</button>
      </div>
    ` : ''}

    <div id="eda-content" class="${AppState.datasetLoaded ? '' : 'hidden'}">
      <div class="grid-2-1 mb-16">
        <!-- Left Column -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Descriptive Stats -->
          <div class="card">
            <div class="flex items-center justify-between mb-12">
              <span class="card-title">Descriptive Statistics</span>
              <span id="loading-desc" class="spinner" style="display:none;"></span>
            </div>
            <div id="desc-stats-content" style="overflow-x:auto;">
              <div style="color:var(--text-muted);font-size:13px;">Click "Run Analysis" to compute statistics.</div>
            </div>
          </div>

          <!-- Correlation Matrix -->
          <div class="card">
            <div class="flex items-center justify-between mb-12">
              <span class="card-title">Correlation Matrix</span>
              <span id="loading-corr" class="spinner" style="display:none;"></span>
            </div>
            <div id="corr-matrix-content">
              <div style="color:var(--text-muted);font-size:13px;">Computed as part of descriptive analysis.</div>
            </div>
          </div>

          <!-- Distribution chart -->
          <div class="card">
            <div class="card-title mb-12">Distribution Charts</div>
            <div id="dist-content">
              <div style="color:var(--text-muted);font-size:13px;">Select a column and run analysis to see distributions.</div>
            </div>
          </div>
        </div>

        <!-- Right column: Options + Insights -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Analysis Options -->
          <div class="card">
            <div class="card-title mb-12">Analysis Options</div>

            <div class="form-group">
              <label class="form-label">Analysis Type</label>
              <select class="form-select" id="analysis-type" onchange="toggleAnalysisParams()">
                <option value="descriptive">Descriptive Analysis</option>
                <option value="regression">Linear Regression</option>
                <option value="timeseries">Time Series / Forecast</option>
              </select>
            </div>

            <!-- Regression Params -->
            <div id="regression-params" style="display:none;">
              <div class="form-group">
                <label class="form-label">Dependent Variable (Y)</label>
                <select class="form-select" id="dep-var">
                  ${numericCols.map(c => `<option>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Independent Variables (X)</label>
                <select class="form-select" id="indep-vars" multiple style="height:80px;">
                  ${numericCols.map(c => `<option>${c}</option>`).join('')}
                </select>
                <small class="text-muted">Hold Ctrl to select multiple</small>
              </div>
            </div>

            <!-- Time Series Params -->
            <div id="ts-params" style="display:none;">
              <div class="form-group">
                <label class="form-label">Date Column</label>
                <select class="form-select" id="date-col">
                  ${cols.filter(c => {
                    const t = AppState.datasetInfo?.dtypes?.[c] || '';
                    return t.includes('datetime') || c.toLowerCase().includes('date') || c.toLowerCase().includes('time');
                  }).map(c => `<option>${c}</option>`).join('') || cols.map(c => `<option>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Value Column</label>
                <select class="form-select" id="ts-value-col">
                  ${numericCols.map(c => `<option>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Forecast Periods</label>
                <input class="form-input" type="number" id="forecast-periods" value="12" min="1" max="100" />
              </div>
            </div>

            <div class="flex gap-8 mt-8">
              <button class="btn btn-primary flex-1" id="run-btn" onclick="runCurrentAnalysis()">
                ${svgIcon('activity',14)} Run Analysis
              </button>
              <button class="btn btn-secondary" onclick="runAllAnalysis()">Run All</button>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="card">
            <div class="flex items-center gap-8 mb-12">
              <span class="card-title">AI Insights</span>
              <span class="badge badge-accent">Auto</span>
            </div>
            <div id="ai-insights-content">
              <div style="color:var(--text-muted);font-size:13px;">Run analysis to generate AI-powered insights.</div>
            </div>
          </div>

          <!-- Categorical summary -->
          <div class="card" id="cat-summary-card" style="display:none;">
            <div class="card-title mb-12">Categorical Summary</div>
            <div id="cat-summary-content"></div>
          </div>
        </div>
      </div>

      <!-- Regression Results -->
      <div id="regression-results" style="display:none;" class="card mb-16">
        <div class="card-title mb-12">Regression Results</div>
        <div id="regression-results-content"></div>
      </div>

      <!-- Time Series Results -->
      <div id="ts-results" style="display:none;" class="card mb-16">
        <div class="card-title mb-12">Time Series &amp; Forecast</div>
        <div id="ts-results-content"></div>
        <div class="chart-wrap mt-16" style="height:200px;">
          <canvas id="ts-chart"></canvas>
        </div>
      </div>
    </div>
  `;

  if (AppState.datasetLoaded) {
    toggleAnalysisParams();
  }
}

function toggleAnalysisParams() {
  const type = document.getElementById('analysis-type')?.value;
  document.getElementById('regression-params').style.display = type === 'regression' ? 'block' : 'none';
  document.getElementById('ts-params').style.display = type === 'timeseries' ? 'block' : 'none';
}

async function runCurrentAnalysis() {
  const type = document.getElementById('analysis-type')?.value || 'descriptive';
  const btn = document.getElementById('run-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;"></span> Running...`;

  try {
    if (type === 'descriptive') await runDescriptive();
    else if (type === 'regression') await runRegression();
    else if (type === 'timeseries') await runTimeSeries();
  } catch (err) {
    showToast('Analysis failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${svgIcon('activity',14)} Run Analysis`;
  }
}

async function runAllAnalysis() {
  if (!AppState.datasetLoaded) { showToast('Upload a dataset first', 'error'); return; }
  showToast('Running full EDA pipeline...');
  await runDescriptive();
  showToast('Full analysis complete!', 'success');
}

async function runDescriptive() {
  document.getElementById('loading-desc').style.display = 'inline-block';
  document.getElementById('step-desc').className = 'step-dot step-active';

  const data = await api.descriptive();
  const res = data.results;
  edaResults = res;

  document.getElementById('loading-desc').style.display = 'none';
  document.getElementById('step-desc').className = 'step-dot step-done';
  document.getElementById('step-desc').textContent = '✓';

  // Render descriptive stats table
  const numeric = res.numeric_summary || {};
  const numCols = Object.keys(numeric);
  if (numCols.length > 0) {
    const stats = ['count','mean','std','min','25%','50%','75%','max'];
    document.getElementById('desc-stats-content').innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Column</th>${stats.map(s => `<th>${s}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${numCols.map(c => `
              <tr>
                <td class="text-primary font-600">${c}</td>
                ${stats.map(s => `<td>${numeric[c]?.[s] !== undefined ? Number(numeric[c][s]).toFixed(2) : '—'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render correlation matrix
  document.getElementById('step-corr').className = 'step-dot step-active';
  const corr = res.correlation_matrix || {};
  const corrCols = Object.keys(corr);
  if (corrCols.length > 1) {
    const grid = corrCols.map(r =>
      corrCols.map(c => {
        const val = corr[r]?.[c] ?? 0;
        const abs = Math.abs(val);
        const alpha = (abs * 0.8 + 0.1).toFixed(2);
        const color = val >= 0 ? `rgba(79,70,229,${alpha})` : `rgba(239,68,68,${alpha})`;
        return `<div class="corr-cell" style="background:${color};min-width:50px;min-height:36px;">${val.toFixed(2)}</div>`;
      }).join('')
    ).join('');

    document.getElementById('corr-matrix-content').innerHTML = `
      <div style="overflow-x:auto;">
        <div style="display:inline-block;">
          <div style="display:flex;gap:4px;margin-bottom:4px;">
            <div style="width:50px;"></div>
            ${corrCols.map(c => `<div style="width:50px;font-size:10px;color:var(--text-muted);text-align:center;overflow:hidden;text-overflow:ellipsis;">${c.substring(0,6)}</div>`).join('')}
          </div>
          ${corrCols.map((r,i) => `
            <div style="display:flex;gap:4px;margin-bottom:4px;">
              <div style="width:50px;font-size:10px;color:var(--text-muted);display:flex;align-items:center;">${r.substring(0,6)}</div>
              ${corrCols.map(c => {
                const val = corr[r]?.[c] ?? 0;
                const abs = Math.abs(val);
                const alpha = (abs * 0.8 + 0.1).toFixed(2);
                const bg = val >= 0 ? `rgba(79,70,229,${alpha})` : `rgba(239,68,68,${alpha})`;
                return `<div class="corr-cell" style="background:${bg};width:50px;">${val.toFixed(2)}</div>`;
              }).join('')}
            </div>
          `).join('')}
          <div style="display:flex;gap:12px;margin-top:8px;">
            <span style="font-size:11px;color:var(--text-muted);">◼ Positive</span>
            <span class="badge badge-error" style="font-size:10px;">◼ Negative</span>
          </div>
        </div>
      </div>
    `;
  }
  document.getElementById('step-corr').className = 'step-dot step-done';
  document.getElementById('step-corr').textContent = '✓';

  // Distribution
  document.getElementById('step-dist').className = 'step-dot step-active';
  const catSummary = res.categorical_summary || {};
  const catCols = Object.keys(catSummary);
  if (catCols.length > 0) {
    const card = document.getElementById('cat-summary-card');
    card.style.display = 'block';
    const col = catCols[0];
    const vals = catSummary[col];
    const total = Object.values(vals).reduce((a,b) => a+b, 0);
    document.getElementById('cat-summary-content').innerHTML = `
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Column: ${col}</div>
      ${Object.entries(vals).slice(0,8).map(([k,v]) => `
        <div class="col-quality-row">
          <span class="col-name">${k}</span>
          <div class="col-bar"><div class="col-fill" style="width:${(v/total*100).toFixed(0)}%;background:var(--accent-primary);"></div></div>
          <span class="col-value">${v} (${(v/total*100).toFixed(0)}%)</span>
        </div>
      `).join('')}
    `;
  }
  document.getElementById('step-dist').className = 'step-dot step-done';
  document.getElementById('step-dist').textContent = '✓';

  // Distribution charts for numeric
  if (numCols.length > 0) {
    document.getElementById('dist-content').innerHTML = `
      ${numCols.slice(0,3).map(c => `
        <div class="mb-12">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">${c}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge badge-neutral">Mean: ${Number(numeric[c]?.mean||0).toFixed(1)}</span>
            <span class="badge badge-neutral">Std: ${Number(numeric[c]?.std||0).toFixed(1)}</span>
            <span class="badge badge-neutral">Min: ${Number(numeric[c]?.min||0).toFixed(1)}</span>
            <span class="badge badge-neutral">Max: ${Number(numeric[c]?.max||0).toFixed(1)}</span>
          </div>
        </div>
      `).join('')}
    `;
  }

  // AI insights
  document.getElementById('step-insights').className = 'step-dot step-active';
  const insights = generateInsights(res);
  document.getElementById('ai-insights-content').innerHTML = insights.map((ins, i) => `
    <div class="insight-card">
      <div class="insight-header">
        <span class="insight-title">${i+1}. ${ins.title}</span>
        <span class="badge ${ins.badge}">${ins.type}</span>
      </div>
      <div class="insight-body">${ins.body}</div>
    </div>
  `).join('');
  document.getElementById('step-insights').className = 'step-dot step-done';
  document.getElementById('step-insights').textContent = '✓';
}

function generateInsights(res) {
  const insights = [];
  const corr = res.correlation_matrix || {};
  const corrCols = Object.keys(corr);

  // Find strongest correlation
  let maxCorr = 0, maxPair = ['', ''];
  corrCols.forEach(r => corrCols.forEach(c => {
    if (r !== c) {
      const v = Math.abs(corr[r]?.[c] || 0);
      if (v > maxCorr) { maxCorr = v; maxPair = [r, c]; }
    }
  }));
  if (maxCorr > 0.4) {
    insights.push({
      title: 'Strong Correlation Detected',
      type: 'Statistical Finding',
      badge: 'badge-accent',
      body: `Strong ${maxCorr > 0 ? 'positive' : 'negative'} correlation (ρ=${maxCorr.toFixed(2)}) between <strong>${maxPair[0]}</strong> and <strong>${maxPair[1]}</strong>.`
    });
  }

  // Missing values
  const missing = res.missing_values || {};
  const hasMissing = Object.entries(missing).filter(([,v]) => v > 0);
  if (hasMissing.length > 0) {
    insights.push({
      title: 'Missing Values Detected',
      type: 'Data Issue',
      badge: 'badge-warning',
      body: `${hasMissing.map(([c,v]) => `<strong>${c}</strong> (${v} missing)`).join(', ')}. Consider imputation before modeling.`
    });
  }

  // Numeric distribution
  const numeric = res.numeric_summary || {};
  const numCols = Object.keys(numeric);
  numCols.forEach(c => {
    const mean = numeric[c]?.mean || 0;
    const median = numeric[c]?.['50%'] || 0;
    const skew = ((mean - median) / (numeric[c]?.std || 1));
    if (Math.abs(skew) > 0.5) {
      insights.push({
        title: `${c} Distribution Skew`,
        type: 'Distribution',
        badge: 'badge-neutral',
        body: `<strong>${c}</strong> shows ${skew > 0 ? 'right' : 'left'}-skewed distribution (skew≈${skew.toFixed(2)}). Consider log transformation.`
      });
      return; // only report first skewed col
    }
  });

  if (insights.length === 0) {
    insights.push({ title: 'Dataset Looks Clean', type: 'Quality', badge: 'badge-success', body: 'No major issues detected. Data appears well-distributed with minimal missing values.' });
  }

  return insights;
}

async function runRegression() {
  const depVar = document.getElementById('dep-var')?.value;
  const indepSel = document.getElementById('indep-vars');
  const indepVars = indepSel ? Array.from(indepSel.selectedOptions).map(o => o.value) : [];

  if (!depVar || indepVars.length === 0) {
    showToast('Select dependent and independent variables', 'error');
    return;
  }

  const data = await api.regression(depVar, indepVars);
  const res = data.results;

  document.getElementById('regression-results').style.display = 'block';
  document.getElementById('regression-results-content').innerHTML = `
    <div class="grid-4 mb-16">
      <div class="kpi-card">
        <span class="kpi-label">R² Score</span>
        <div class="kpi-value text-accent">${(res.r_squared * 100).toFixed(1)}%</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">MSE</span>
        <div class="kpi-value">${Number(res.mse).toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Intercept</span>
        <div class="kpi-value">${Number(res.intercept).toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Observations</span>
        <div class="kpi-value">${res.n_observations?.toLocaleString()}</div>
      </div>
    </div>
    <div class="card-title mb-8">Coefficients</div>
    <table class="data-table">
      <thead><tr><th>Variable</th><th>Coefficient</th></tr></thead>
      <tbody>
        ${Object.entries(res.coefficients).map(([k,v]) => `
          <tr><td>${k}</td><td class="${v >= 0 ? 'text-success' : 'text-error'}">${Number(v).toFixed(4)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function runTimeSeries() {
  const dateCol  = document.getElementById('date-col')?.value;
  const valueCol = document.getElementById('ts-value-col')?.value;
  const periods  = parseInt(document.getElementById('forecast-periods')?.value || '12');

  if (!dateCol || !valueCol) { showToast('Select date and value columns', 'error'); return; }

  const data = await api.timeseries(dateCol, valueCol, periods);
  const res = data.results;

  document.getElementById('ts-results').style.display = 'block';
  document.getElementById('ts-results-content').innerHTML = `
    <div class="grid-4 mb-12">
      <div class="kpi-card"><span class="kpi-label">Data Points</span><div class="kpi-value">${res.series_length}</div></div>
      <div class="kpi-card"><span class="kpi-label">Start Date</span><div class="kpi-value" style="font-size:14px;">${res.start_date?.substring(0,10)}</div></div>
      <div class="kpi-card"><span class="kpi-label">End Date</span><div class="kpi-value" style="font-size:14px;">${res.end_date?.substring(0,10)}</div></div>
      <div class="kpi-card"><span class="kpi-label">Trend</span><div class="kpi-value ${res.trend === 'increasing' ? 'text-success' : 'text-error'}">${res.trend}</div></div>
    </div>
  `;

  // Draw forecast chart
  const forecast = res.forecast;
  if (forecast && AppState.charts) {
    const ctx = document.getElementById('ts-chart').getContext('2d');
    if (AppState.charts.ts) AppState.charts.ts.destroy();
    AppState.charts.ts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: forecast.dates.map(d => d.substring(0,10)),
        datasets: [{
          label: `${valueCol} Forecast`,
          data: forecast.values,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79,70,229,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#4F46E5',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9CA3AF', font: { family: 'Inter' } } } },
        scales: {
          x: { ticks: { color: '#6B7280', maxTicksLimit: 8 }, grid: { color: 'rgba(31,41,55,0.5)' } },
          y: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(31,41,55,0.5)' } }
        }
      }
    });
  }
}

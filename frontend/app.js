/* AxiomAI — Main App Router & State */

const AppState = {
  datasetLoaded: false,
  datasetInfo: null,
  currentPage: 'dashboard',
  charts: {},
};

const pages = {
  dashboard: { title: 'Dashboard', breadcrumb: 'Home › <strong>Dashboard</strong>', render: renderDashboard },
  upload:    { title: 'Upload Dataset', breadcrumb: 'Home › <strong>Upload Dataset</strong>', render: renderUpload },
  eda:       { title: 'EDA & Analysis', breadcrumb: 'Home › <strong>EDA & Analysis</strong>', render: renderEDA },
  quality:   { title: 'Data Quality', breadcrumb: 'Home › <strong>Data Quality</strong>', render: renderQuality },
  visualizations: { title: 'Visualizations', breadcrumb: 'Home › <strong>Visualizations</strong>', render: renderVisualizations },
  insights:  { title: 'Insights & KPIs', breadcrumb: 'Home › <strong>Insights & KPIs</strong>', render: renderInsights },
  reports:   { title: 'Reports', breadcrumb: 'Home › <strong>Reports</strong>', render: renderReports },
  chat:      { title: 'Chat with AI', breadcrumb: 'Home › <strong>Chat with AI</strong>', render: renderChat },
};

function navigate(page) {
  if (!pages[page]) return;
  AppState.currentPage = page;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = pages[page].breadcrumb;

  // Destroy active charts to prevent canvas reuse errors
  Object.values(AppState.charts).forEach(c => { try { c.destroy(); } catch {} });
  AppState.charts = {};

  // Render page
  const content = document.getElementById('page-content');
  content.innerHTML = '';
  content.classList.remove('fade-in');
  void content.offsetWidth;
  content.classList.add('fade-in');
  pages[page].render(content);
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

function el(tag, cls, html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function svgIcon(name, size = 16) {
  const icons = {
    upload: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
    database: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    activity: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    file: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    check: `<polyline points="20 6 9 17 4 12"/>`,
    x: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    arrow: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    refresh: `<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>`,
    download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
    send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    chart: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icons[name] || ''}</svg>`;
}

async function checkBackendHealth() {
  const statusEl = document.getElementById('backend-status');
  const labelEl = document.getElementById('status-label');
  try {
    await api.health();
    statusEl.className = 'status-chip status-connected';
    labelEl.textContent = 'Backend: Connected';
  } catch {
    statusEl.className = 'status-chip status-error';
    labelEl.textContent = 'Backend: Offline';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  navigate('dashboard');
  checkBackendHealth();
  setInterval(checkBackendHealth, 30000);
});

/* ──────────────────────────────────────────────────────────────────────────
   generateInsights — converts raw EDA results into natural-language insight
   objects. Used by insights.js and eda.js.
   Returns: Array<{ title, body, type, badge }>
────────────────────────────────────────────────────────────────────────── */
function generateInsights(results) {
  const insights = [];
  const numeric  = results.numeric_summary  || {};
  const categ    = results.categorical_summary || {};
  const corr     = results.correlation_matrix  || {};
  const missing  = results.missing_values || {};
  const numCols  = Object.keys(numeric);
  const catCols  = Object.keys(categ);

  // ── Distribution insights ────────────────────────────────────────────────
  numCols.forEach(col => {
    const s  = numeric[col];
    if (!s) return;
    const mean = +s.mean, std = +s.std, min = +s.min, max = +s.max;
    const cv   = std / Math.abs(mean || 1); // coefficient of variation
    const skew = s['50%'] ? (mean - +s['50%']) / (std || 1) : 0;

    if (Math.abs(skew) > 0.5) {
      insights.push({
        title: `${col} is ${skew > 0 ? 'right' : 'left'}-skewed`,
        body: `The mean (${mean.toFixed(2)}) is ${skew > 0 ? 'higher' : 'lower'} than the median, suggesting a ${skew > 0 ? 'right' : 'left'}-skewed distribution. ${skew > 0 ? 'A few high outliers are pulling the average up.' : 'Some very low values are pulling the average down.'}`,
        type: 'Distribution',
        badge: Math.abs(skew) > 1 ? 'badge-warning' : 'badge-neutral'
      });
    }

    if (cv > 0.5) {
      insights.push({
        title: `High variability in ${col}`,
        body: `${col} has a coefficient of variation of ${(cv * 100).toFixed(0)}%, ranging from ${min.toFixed(2)} to ${max.toFixed(2)}. This indicates significant spread — consider segmenting the data or normalising before modelling.`,
        type: 'Variability',
        badge: 'badge-warning'
      });
    }
  });

  // ── Correlation insights ─────────────────────────────────────────────────
  const corrPairs = [];
  numCols.forEach(r => numCols.forEach(c => {
    if (r < c) {
      const v = corr[r]?.[c];
      if (v != null) corrPairs.push({ r, c, v: +v });
    }
  }));
  corrPairs.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));

  corrPairs.slice(0, 3).forEach(({ r, c, v }) => {
    if (Math.abs(v) < 0.3) return;
    const strength = Math.abs(v) > 0.7 ? 'strong' : Math.abs(v) > 0.5 ? 'moderate' : 'weak';
    const dir      = v > 0 ? 'positive' : 'negative';
    insights.push({
      title: `${strength.charAt(0).toUpperCase()+strength.slice(1)} ${dir} correlation: ${r} ↔ ${c}`,
      body: `Pearson r = ${v.toFixed(3)}. As <strong>${r}</strong> increases, <strong>${c}</strong> tends to ${v > 0 ? 'increase' : 'decrease'}. ${Math.abs(v) > 0.7 ? 'This is a strong relationship worth investigating as a potential predictor or causal factor.' : 'This relationship is worth exploring further.'}`,
      type: 'Correlation',
      badge: Math.abs(v) > 0.7 ? 'badge-accent' : 'badge-neutral'
    });
  });

  // ── Missing values insight ───────────────────────────────────────────────
  const missCols = Object.entries(missing).filter(([, v]) => v > 0);
  if (missCols.length > 0) {
    const total = missCols.reduce((a, [, v]) => a + v, 0);
    insights.push({
      title: `${missCols.length} column${missCols.length > 1 ? 's' : ''} have missing data`,
      body: `A total of <strong>${total} missing values</strong> found across: ${missCols.map(([col, cnt]) => `${col} (${cnt})`).join(', ')}. Recommend applying median imputation for numeric columns and mode imputation for categorical ones.`,
      type: 'Data Quality',
      badge: 'badge-warning'
    });
  }

  // ── Categorical insight ──────────────────────────────────────────────────
  catCols.slice(0, 2).forEach(col => {
    const s = categ[col];
    if (!s) return;
    const unique = s.unique_count || s.nunique || '?';
    const top    = s.top_value || s.most_common || '?';
    const topCnt = s.top_count || '';
    insights.push({
      title: `${col} has ${unique} unique categories`,
      body: `The most common category is "<strong>${top}</strong>"${topCnt ? ` (${topCnt} occurrences)` : ''}. ${+unique > 20 ? 'High cardinality — consider grouping rare categories before encoding.' : 'Suitable for one-hot encoding without causing dimensionality issues.'}`,
      type: 'Categorical',
      badge: 'badge-neutral'
    });
  });

  // ── Fallback if no insights generated ───────────────────────────────────
  if (insights.length === 0) {
    insights.push({
      title: 'Dataset looks clean and structured',
      body: 'No significant distributional issues, extreme correlations, or data quality problems were detected. The dataset appears ready for modelling or further analysis.',
      type: 'Summary',
      badge: 'badge-success'
    });
  }

  return insights;
}

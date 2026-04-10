/* AxiomAI — Backend API Service
   Base URL: http://localhost:8000
*/

const API_BASE = 'http://localhost:8000';

const api = {
  async request(method, path, body = null, isForm = false) {
    const opts = { method };
    if (body && !isForm) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    } else if (body) {
      opts.body = body; // FormData
    }
    const res = await fetch(API_BASE + path, opts);
    if (!res.ok) {
      let err = `HTTP ${res.status}`;
      try { const d = await res.json(); err = d.detail || d.message || err; } catch {}
      throw new Error(err);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.blob(); // for file downloads
  },

  // Health
  health: () => api.request('GET', '/api/health'),
  capabilities: () => api.request('GET', '/api/capabilities'),

  // Dataset
  uploadDataset(file) {
    const fd = new FormData();
    fd.append('file', file);
    return api.request('POST', '/api/dataset/upload', fd, true);
  },
  getDatasetInfo: () => api.request('GET', '/api/dataset/info'),
  getDatasetSample: (n = 10) => api.request('GET', `/api/dataset/sample/${n}`),

  // Analysis
  descriptive: () => api.request('POST', '/api/analysis/descriptive', { analysis_type: 'descriptive', parameters: {} }),
  regression(depVar, indepVars) {
    return api.request('POST', '/api/analysis/regression', {
      analysis_type: 'regression',
      parameters: { dependent_variable: depVar, independent_variables: indepVars }
    });
  },
  timeseries(dateCol, valueCol, periods = 12) {
    return api.request('POST', '/api/analysis/timeseries', {
      analysis_type: 'timeseries',
      parameters: { date_column: dateCol, value_column: valueCol, forecast_periods: periods }
    });
  },

  // Cleaning
  qualityReport: () => api.request('GET', '/api/cleaning/quality-report'),
  suggestions:   () => api.request('GET', '/api/cleaning/suggestions'),
  fixMissing(column, strategy = 'median') {
    return api.request('POST', '/api/cleaning/fix-missing', {
      operation: 'fix_missing',
      parameters: { strategy, column }
    });
  },
  removeDuplicates(keep = 'first') {
    return api.request('POST', '/api/cleaning/remove-duplicates', {
      operation: 'remove_duplicates',
      parameters: { keep }
    });
  },
  handleOutliers(method = 'iqr', columns = null, threshold = 1.5) {
    return api.request('POST', '/api/cleaning/handle-outliers', {
      operation: 'handle_outliers',
      parameters: { method, columns, threshold }
    });
  },
  automatedCleaning: (aggressive = false) => api.request('POST', `/api/cleaning/automated?aggressive=${aggressive}`),

  // Visualization
  histogram: (column, bins = 30) => api.request('POST', `/api/visualization/histogram?column=${encodeURIComponent(column)}&bins=${bins}`),
  scatter: (x, y) => api.request('POST', `/api/visualization/scatter?x_column=${encodeURIComponent(x)}&y_column=${encodeURIComponent(y)}`),
  line: (x, y) => api.request('POST', `/api/visualization/line?x_column=${encodeURIComponent(x)}&y_column=${encodeURIComponent(y)}`),
  vizOptions: () => api.request('GET', '/api/visualization/options'),

  // Reports
  createReport(title, author, sections = []) {
    return api.request('POST', '/api/reports/create', { title, author, sections });
  },
  getReport: () => api.request('GET', '/api/reports/data'),
  exportWord: (filename = 'axiom_report.docx') => api.request('POST', `/api/reports/export/word?filename=${filename}`),
  exportPDF:  (filename = 'axiom_report.pdf')  => api.request('POST', `/api/reports/export/pdf?filename=${filename}`)
};

// Download helper
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

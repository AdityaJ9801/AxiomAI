/* Upload Dataset Page */
let uploadedFile = null;

function renderUpload(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-24">
      <div>
        <h1 class="page-title">Upload Dataset</h1>
        <p class="page-subtitle">Load your data files for AI-powered analysis. Supports CSV, Excel, and JSON.</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div class="card mb-16" id="upload-card">
      <div class="upload-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
        <div class="upload-icon">${svgIcon('upload', 44)}</div>
        <div class="upload-title">Drag &amp; drop your dataset here</div>
        <div class="upload-sub">or click to browse files</div>
        <button class="btn btn-primary" style="pointer-events:none;">Browse Files</button>
        <div class="upload-hint">Supported: CSV, XLSX, XLS, JSON &nbsp;•&nbsp; Max size: 100 MB</div>
      </div>
      <input type="file" id="file-input" accept=".csv,.xlsx,.xls,.json" style="display:none;" onchange="handleFileSelect(event)" />
    </div>

    <!-- File Preview (hidden until file selected) -->
    <div id="file-preview-area" style="display:none;"></div>

    <!-- Upload Progress -->
    <div id="upload-progress" style="display:none;" class="card mb-16">
      <div class="flex items-center gap-12 mb-8">
        <div class="spinner"></div>
        <span class="font-600">Uploading and processing dataset...</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="upload-bar" style="width:0%"></div></div>
    </div>

    <!-- Dataset Info (shown after upload) -->
    <div id="dataset-result" style="display:none;"></div>
  `;

  // Drag & drop
  const zone = document.getElementById('drop-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFileSelection(file);
  });
}

function handleFileSelect(evt) {
  const file = evt.target.files[0];
  if (file) processFileSelection(file);
}

function processFileSelection(file) {
  uploadedFile = file;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['csv','xlsx','xls','json'].includes(ext)) {
    showToast('Unsupported file type. Use CSV, XLSX, or JSON.', 'error');
    return;
  }

  const area = document.getElementById('file-preview-area');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="file-preview">
      <div class="file-icon">${svgIcon('file', 24)}</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;•&nbsp; ${ext.toUpperCase()}</div>
      </div>
      <span class="file-remove" onclick="clearFile()">${svgIcon('x', 18)}</span>
    </div>
    <div class="flex gap-8">
      <button class="btn btn-primary" onclick="doUpload()">
        ${svgIcon('upload', 14)} Upload &amp; Analyze
      </button>
      <button class="btn btn-ghost" onclick="clearFile()">Cancel</button>
    </div>
  `;
}

function clearFile() {
  uploadedFile = null;
  document.getElementById('file-preview-area').style.display = 'none';
  document.getElementById('dataset-result').style.display = 'none';
  document.getElementById('file-input').value = '';
}

async function doUpload() {
  if (!uploadedFile) return;

  const prog = document.getElementById('upload-progress');
  const bar  = document.getElementById('upload-bar');
  prog.style.display = 'block';

  // Animate bar
  let pct = 0;
  const tick = setInterval(() => {
    pct = Math.min(pct + 8, 90);
    bar.style.width = pct + '%';
  }, 150);

  try {
    const data = await api.uploadDataset(uploadedFile);
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => { prog.style.display = 'none'; }, 500);

    // Save state
    AppState.datasetLoaded = true;
    AppState.datasetInfo = { ...data.dataset_info, filename: uploadedFile.name };

    showToast('Dataset uploaded successfully!', 'success');
    renderDatasetInfo(data);
  } catch (err) {
    clearInterval(tick);
    prog.style.display = 'none';
    showToast('Upload failed: ' + err.message, 'error');
  }
}

function renderDatasetInfo(data) {
  const info = data.dataset_info;
  const resultDiv = document.getElementById('dataset-result');
  resultDiv.style.display = 'block';

  const cols = info.columns || [];
  const dtypes = info.dtypes || {};
  const missing = info.missing_values || {};
  const sample = info.sample_data || [];

  resultDiv.innerHTML = `
    <!-- Metadata cards -->
    <div class="grid-4 mb-16">
      <div class="kpi-card">
        <span class="kpi-label">Rows</span>
        <div class="kpi-value text-accent">${(info.shape?.[0] || 0).toLocaleString()}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Columns</span>
        <div class="kpi-value">${info.shape?.[1] || 0}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Memory Usage</span>
        <div class="kpi-value">${info.memory_usage_mb?.toFixed(3) || '—'} <span style="font-size:14px;font-weight:400;">MB</span></div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Missing Values</span>
        <div class="kpi-value text-warning">${Object.values(missing).reduce((a,b) => a+b, 0)}</div>
      </div>
    </div>

    <div class="grid-2 mb-16">
      <!-- Column Types -->
      <div class="card">
        <div class="card-title mb-12">Column Types</div>
        <div style="max-height:220px;overflow-y:auto;">
          <table class="data-table">
            <thead><tr><th>Column</th><th>Type</th><th>Missing</th></tr></thead>
            <tbody>
              ${cols.map(c => `
                <tr>
                  <td class="text-primary">${c}</td>
                  <td><span class="badge ${getDTypeBadge(dtypes[c])}">${dtypes[c] || '—'}</span></td>
                  <td>${missing[c] > 0 ? `<span class="text-warning">${missing[c]}</span>` : `<span class="text-success">0</span>`}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Missing Values visual -->
      <div class="card">
        <div class="card-title mb-12">Missing Values Per Column</div>
        <div>
          ${cols.map(c => {
            const m = missing[c] || 0;
            const pct = info.shape?.[0] ? ((m / info.shape[0]) * 100).toFixed(1) : 0;
            return `
              <div class="col-quality-row">
                <span class="col-name">${c}</span>
                <div class="col-bar"><div class="col-fill" style="width:${pct}%"></div></div>
                <span class="col-value">${m > 0 ? pct + '%' : '0 missing'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Sample Data Table -->
    <div class="card mb-16">
      <div class="card-title mb-12">Dataset Preview (first ${sample.length} rows)</div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${sample.map(row => `
              <tr>${cols.map(c => `<td>${row[c] !== null && row[c] !== undefined ? String(row[c]).substring(0,50) : '<span class="text-muted">—</span>'}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-8">
      <button class="btn btn-primary" onclick="navigate('eda')">
        ${svgIcon('activity', 14)} Run EDA Analysis
      </button>
      <button class="btn btn-secondary" onclick="navigate('quality')">
        ${svgIcon('shield', 14)} Check Data Quality
      </button>
      <button class="btn btn-ghost" onclick="navigate('visualizations')">
        ${svgIcon('chart', 14)} Visualize
      </button>
      <button class="btn btn-ghost" onclick="navigate('reports')">
        ${svgIcon('file', 14)} Generate Report
      </button>
    </div>
  `;
}

function getDTypeBadge(dtype) {
  if (!dtype) return 'badge-neutral';
  if (dtype.includes('float') || dtype.includes('int')) return 'badge-accent';
  if (dtype.includes('datetime')) return 'badge-cyan';
  if (dtype.includes('object') || dtype.includes('str')) return 'badge-neutral';
  return 'badge-neutral';
}

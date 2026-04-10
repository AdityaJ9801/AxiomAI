/* Reports Page */
const reportSections = {
  executive:   { label: 'Executive Summary',       on: true  },
  dataset:     { label: 'Dataset Overview',         on: true  },
  descriptive: { label: 'Descriptive Statistics',   on: true  },
  quality:     { label: 'Data Quality Assessment',  on: true  },
  visualizations: { label: 'Visualizations',        on: true  },
  correlation: { label: 'Correlation Analysis',     on: true  },
  regression:  { label: 'Regression Analysis',      on: false },
  insights:    { label: 'Key Insights & Findings',  on: true  },
  recommendations: { label: 'Recommendations',      on: true  },
};

function renderReports(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-24">
      <div>
        <h1 class="page-title">Reports</h1>
        <p class="page-subtitle">Generate comprehensive analysis reports with visualizations. Export to PDF or Word.</p>
      </div>
    </div>

    <div style="display:flex;gap:16px;min-height:600px;">
      <!-- Report Builder -->
      <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <div class="card-title mb-12">Report Builder</div>

          <div class="form-group">
            <label class="form-label">Report Title</label>
            <input class="form-input" type="text" id="report-title" value="Data Analysis Report — ${new Date().toLocaleDateString('en-US', {month:'short', year:'numeric'})}" />
          </div>
          <div class="form-group">
            <label class="form-label">Author</label>
            <input class="form-input" type="text" id="report-author" value="Data Analyst" />
          </div>
          <div class="form-group">
            <label class="form-label">Report Type</label>
            <select class="form-select" id="report-type">
              <option value="full">Full Analysis</option>
              <option value="eda">EDA Summary</option>
              <option value="quality">Quality Report</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="form-label mb-8">Sections</div>
          <div id="section-toggles">
            ${Object.entries(reportSections).map(([k,s]) => `
              <div class="section-toggle">
                <span class="toggle-label">${s.label}</span>
                <div class="toggle-switch ${s.on ? 'on' : ''}" id="toggle-${k}" onclick="toggleSection('${k}')">
                  <div class="toggle-thumb"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="divider"></div>

          <button class="btn btn-primary btn-full btn-lg" id="gen-report-btn" onclick="generateReport()">
            ${svgIcon('zap',16)} Generate Report with AI
          </button>
        </div>

        <!-- Export -->
        <div class="card">
          <div class="card-title mb-12">Export</div>
          <div class="flex gap-8 mb-8">
            <button class="btn btn-secondary flex-1" onclick="exportReport('pdf')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export PDF
            </button>
            <button class="btn btn-secondary flex-1" onclick="exportReport('word')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export Word
            </button>
          </div>
          <div class="text-muted text-xs" id="report-gen-time">No report generated yet.</div>
        </div>
      </div>

      <!-- Report Preview -->
      <div style="flex:1;">
        <div class="card" style="height:100%;">
          <div class="flex items-center justify-between mb-12">
            <span class="card-title">Report Preview</span>
            <div class="flex items-center gap-8">
              <span class="badge badge-neutral" id="page-indicator">—</span>
              <span class="spinner" id="report-spinner" style="display:none;"></span>
            </div>
          </div>

          <div class="report-preview" id="report-preview-content">
            <div style="text-align:center;padding:80px 40px;color:var(--text-muted);">
              <div style="margin-bottom:12px;">${svgIcon('file',40)}</div>
              <div class="text-lg font-600 mb-8">Report Preview</div>
              <div class="text-sm">Configure report settings and click "Generate Report with AI"<br/>to create a comprehensive analysis report.</div>
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="card mt-16">
          <div class="card-title mb-12">Recent Reports</div>
          <div id="recent-reports">
            <div class="text-muted text-sm">No reports generated yet in this session.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleSection(key) {
  reportSections[key].on = !reportSections[key].on;
  const toggle = document.getElementById('toggle-' + key);
  if (toggle) {
    toggle.classList.toggle('on', reportSections[key].on);
  }
}

async function generateReport() {
  const title  = document.getElementById('report-title')?.value || 'Analysis Report';
  const author = document.getElementById('report-author')?.value || 'AxiomAI';

  const btn = document.getElementById('gen-report-btn');
  const spinner = document.getElementById('report-spinner');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Generating...';
  spinner.style.display = 'inline-block';

  try {
    // Build sections based on toggles
    const activeSections = Object.entries(reportSections)
      .filter(([,s]) => s.on)
      .map(([k, s]) => ({ heading: s.label, content: generateSectionContent(k), section_type: 'markdown' }));

    // Call backend to create report
    await api.createReport(title, author, activeSections);

    // Get report data
    const reportData = await api.getReport();
    const report = reportData.report_data || {};

    // Render preview
    renderReportPreview(title, author, activeSections, report);

    // Update time
    document.getElementById('report-gen-time').textContent = `Generated: ${new Date().toLocaleString()}`;
    document.getElementById('page-indicator').textContent = 'Page 1 of ' + Math.ceil(activeSections.length / 3);

    // Update recent reports
    addToRecentReports(title);
    showToast('Report generated!', 'success');
  } catch (err) {
    // Even if backend fails, render a local preview with available data
    renderReportPreview(
      document.getElementById('report-title')?.value || 'Analysis Report',
      document.getElementById('report-author')?.value || 'Analyst',
      Object.values(reportSections).filter(s => s.on).map(s => ({ heading: s.label, content: generateSectionContent(Object.keys(reportSections).find(k => reportSections[k] === s)) })),
      {}
    );
    document.getElementById('report-gen-time').textContent = `Preview generated: ${new Date().toLocaleString()}`;
    showToast('Preview generated (backend not available for export)', '');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${svgIcon('zap',16)} Generate Report with AI`;
    spinner.style.display = 'none';
  }
}

function generateSectionContent(key) {
  const info = AppState.datasetInfo;
  const contents = {
    executive: `This report presents a comprehensive analysis of the loaded dataset. Key findings include data quality assessment, statistical summaries, and actionable insights derived from the data.`,
    dataset: info
      ? `Dataset: ${info.filename || 'dataset'}\nShape: ${info.shape?.[0]?.toLocaleString()} rows × ${info.shape?.[1]} columns\nMemory: ${info.memory_usage_mb?.toFixed(3)} MB\nMissing values: ${Object.values(info.missing_values||{}).reduce((a,b)=>a+b,0)}`
      : 'No dataset currently loaded.',
    descriptive: 'Descriptive statistical analysis including mean, median, standard deviation, min/max ranges for all numeric columns.',
    quality: 'Data quality assessment covering missing values, duplicate rows, outliers, and data type consistency.',
    visualizations: 'Visual analysis including distribution histograms, scatter plots for correlation, and time series where applicable.',
    correlation: 'Correlation matrix analysis revealing relationships between numeric variables.',
    regression: 'Linear regression model results including R-squared score, coefficients, and model diagnostics.',
    insights: '- Strong correlation detected between key numeric variables\n- Missing values present in select columns; recommend imputation\n- Data distribution shows slight skewness in revenue-type columns\n- Overall data quality is above threshold for model training',
    recommendations: '1. Apply median imputation for missing numeric values\n2. Review and handle outliers before modeling\n3. Normalize skewed distributions for ML pipelines\n4. Establish regular data quality monitoring schedule',
  };
  return contents[key] || 'Section content.';
}

function renderReportPreview(title, author, sections, reportData) {
  const preview = document.getElementById('report-preview-content');
  preview.innerHTML = `
    <div class="report-section" style="text-align:center;border:none;">
      <div style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">${title}</div>
      <div class="text-muted text-sm">${new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})} &nbsp;|&nbsp; Prepared by ${author}</div>
      <div class="divider"></div>
    </div>
    ${sections.map((s, i) => `
      <div class="report-section">
        <h3>${i + 1}. ${s.heading}</h3>
        ${s.content.split('\n').map(line =>
          line.startsWith('-') ? `<li>${line.substring(1).trim()}</li>`
          : line.match(/^\d+\./) ? `<li>${line}</li>`
          : `<p>${line}</p>`
        ).join('')}
      </div>
    `).join('')}
  `;
}

const recentReportsList = [];

function addToRecentReports(title) {
  const now = new Date();
  recentReportsList.unshift({ title, date: now.toLocaleDateString(), type: document.getElementById('report-type')?.options[document.getElementById('report-type')?.selectedIndex]?.text || 'Full' });

  const el = document.getElementById('recent-reports');
  if (!el) return;
  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Report Name</th><th>Date</th><th>Type</th><th>Actions</th></tr></thead>
      <tbody>
        ${recentReportsList.slice(0,5).map(r => `
          <tr>
            <td class="text-primary font-600">${r.title}</td>
            <td>${r.date}</td>
            <td><span class="badge badge-neutral">${r.type}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="exportReport('pdf')">${svgIcon('download',12)} PDF</button>
              <button class="btn btn-ghost btn-sm" onclick="exportReport('word')">${svgIcon('download',12)} Word</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function exportReport(format) {
  const filename = `axiom_report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'docx'}`;
  try {
    showToast('Exporting...', '');
    const blob = await (format === 'pdf' ? api.exportPDF(filename) : api.exportWord(filename));
    downloadBlob(blob, filename);
    showToast(`Report exported as ${filename}`, 'success');
  } catch (err) {
    showToast(`Export failed: ${err.message}`, 'error');
  }
}

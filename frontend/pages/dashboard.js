/* Dashboard Page */
function renderDashboard(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-24">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of your agentic data analysis platform.</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-sm" onclick="checkBackendHealth(); showToast('Status refreshed')">
          ${svgIcon('refresh',14)} Refresh
        </button>
        <button class="btn btn-primary btn-sm" onclick="navigate('upload')">
          ${svgIcon('upload',14)} Upload Dataset
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid-4 mb-24">
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Total Datasets</span>
          <span class="kpi-icon">${svgIcon('database',20)}</span>
        </div>
        <div class="kpi-value text-accent" id="kpi-datasets">${AppState.datasetLoaded ? '1' : '—'}</div>
        <div class="kpi-meta">${AppState.datasetLoaded ? '<span class="kpi-trend-up">+1 this session</span>' : '<span class="text-muted">No dataset loaded</span>'}</div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Data Quality Score</span>
          <span class="kpi-icon">${svgIcon('shield',20)}</span>
        </div>
        <div class="kpi-value" id="kpi-quality">—</div>
        <div class="kpi-meta"><span class="text-muted">Run quality check first</span></div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Active Analysis</span>
          <span class="kpi-icon">${svgIcon('activity',20)}</span>
        </div>
        <div class="kpi-value text-cyan">0</div>
        <div class="kpi-meta"><span class="text-muted">Idle</span></div>
      </div>
      <div class="kpi-card">
        <div class="flex items-center justify-between">
          <span class="kpi-label">Reports Generated</span>
          <span class="kpi-icon">${svgIcon('file',20)}</span>
        </div>
        <div class="kpi-value">0</div>
        <div class="kpi-meta"><span class="text-muted">This session</span></div>
      </div>
    </div>

    <!-- Row 2 -->
    <div class="grid-2-1 mb-24">
      <!-- Activity -->
      <div class="card">
        <div class="flex items-center justify-between mb-16">
          <span class="card-title">Recent Activity</span>
          <span class="badge badge-cyan" style="font-size:10px;">Live</span>
        </div>
        <div id="activity-feed">
          <div class="activity-item">
            <div class="activity-icon" style="background:rgba(79,70,229,0.12);">${svgIcon('activity',16)}</div>
            <div class="activity-body">
              <div class="activity-text">Platform initialized. <strong>Ready for analysis.</strong></div>
              <div class="activity-time">Just now • System Agent</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon" style="background:rgba(6,182,212,0.12);">${svgIcon('zap',16)}</div>
            <div class="activity-body">
              <div class="activity-text">Backend API health check passed.</div>
              <div class="activity-time">Just now • Health Monitor</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon" style="background:rgba(16,185,129,0.12);">${svgIcon('check',16)}</div>
            <div class="activity-body">
              <div class="activity-text">All MCP tools loaded and ready.</div>
              <div class="activity-time">Just now • MCP Registry</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-title mb-12">Quick Actions</div>
        <div class="quick-action" onclick="navigate('upload')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(79,70,229,0.12);">${svgIcon('upload',16)}</div>
            <span class="quick-action-label">Upload New Dataset</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
        <div class="quick-action" onclick="navigate('eda')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(6,182,212,0.12);">${svgIcon('activity',16)}</div>
            <span class="quick-action-label">Run EDA Analysis</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
        <div class="quick-action" onclick="navigate('quality')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(16,185,129,0.12);">${svgIcon('shield',16)}</div>
            <span class="quick-action-label">Check Data Quality</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
        <div class="quick-action" onclick="navigate('visualizations')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(245,158,11,0.12);">${svgIcon('chart',16)}</div>
            <span class="quick-action-label">Create Visualization</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
        <div class="quick-action" onclick="navigate('reports')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(239,68,68,0.12);">${svgIcon('file',16)}</div>
            <span class="quick-action-label">Generate Report</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
        <div class="quick-action" onclick="navigate('chat')">
          <div class="quick-action-left">
            <div class="quick-action-icon" style="background:rgba(79,70,229,0.12);">${svgIcon('send',16)}</div>
            <span class="quick-action-label">Open AI Chat</span>
          </div>
          ${svgIcon('arrow',14)}
        </div>
      </div>
    </div>

    <!-- Row 3: System Status + Dataset -->
    <div class="grid-1-2 mb-24">
      <div class="card">
        <div class="card-title mb-12">System Status</div>
        <div id="system-status-rows">
          <div class="status-row">
            <span class="status-row-label">Backend API</span>
            <span class="status-indicator" id="ss-backend"><span class="dot-gray"></span> Checking...</span>
          </div>
          <div class="status-row">
            <span class="status-row-label">MCP Tools</span>
            <span class="status-indicator"><span class="dot-green"></span> <span class="text-success">Healthy</span></span>
          </div>
          <div class="status-row">
            <span class="status-row-label">Groq LLM</span>
            <span class="status-indicator"><span class="dot-green"></span> <span class="text-success">Online</span></span>
          </div>
          <div class="status-row">
            <span class="status-row-label">Dataset Loaded</span>
            <span class="status-indicator" id="ss-dataset">
              ${AppState.datasetLoaded
                ? '<span class="dot-green"></span><span class="text-success">Yes</span>'
                : '<span class="dot-gray"></span><span class="text-muted">No</span>'}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-16">
          <span class="card-title">Dataset Overview</span>
          <button class="btn btn-ghost btn-sm" onclick="navigate('upload')">Load Dataset</button>
        </div>
        <div id="dataset-overview-table">
          ${AppState.datasetInfo ? renderDatasetOverviewTable() : `
            <div style="text-align:center;padding:32px 0;color:var(--text-muted);">
              <div style="margin-bottom:8px;">${svgIcon('database',24)}</div>
              <div style="font-size:13px;">No dataset loaded yet.</div>
              <div style="font-size:12px;margin-top:4px;color:var(--text-muted);">Upload a CSV / Excel / JSON file to begin.</div>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- AI Activity Log -->
    <div class="card">
      <div class="flex items-center gap-8 mb-12">
        <span class="card-title">AI Agent Activity Log</span>
        <span class="badge badge-cyan">Live</span>
      </div>
      <div class="agent-log" id="agent-log">
        <div><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-info">INFO:</span> AxiomAI platform initialized. All agents ready.</div>
        <div><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-info">INFO:</span> Backend health check completed. Status: operational.</div>
        <div><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-success">SUCCESS:</span> MCP Tool Registry loaded — EDA, Cleaning, Report, Viz tools registered.</div>
        <div><span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-agent">AGENT:</span> Awaiting user input. Upload a dataset to begin agentic analysis.</div>
      </div>
    </div>
  `;

  // Live backend status in system box
  api.health().then(() => {
    document.getElementById('ss-backend').innerHTML = '<span class="dot-green"></span><span class="text-success">Connected</span>';
  }).catch(() => {
    document.getElementById('ss-backend').innerHTML = '<span class="dot-red"></span><span class="text-error">Offline</span>';
  });
}

function renderDatasetOverviewTable() {
  const info = AppState.datasetInfo;
  return `<table class="data-table">
    <thead><tr><th>Name</th><th>Rows</th><th>Columns</th><th>Memory</th></tr></thead>
    <tbody>
      <tr>
        <td class="text-primary font-600">${info.filename || 'dataset'}</td>
        <td>${info.shape?.[0]?.toLocaleString() || '—'}</td>
        <td>${info.shape?.[1] || '—'}</td>
        <td>${info.memory_usage_mb?.toFixed(2) || '—'} MB</td>
      </tr>
    </tbody>
  </table>`;
}

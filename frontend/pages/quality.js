/* Data Quality Page */
function renderQuality(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-24">
      <div>
        <h1 class="page-title">Data Quality</h1>
        <p class="page-subtitle">Detect issues, get AI-powered fix suggestions, and apply automated cleaning.</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-primary" onclick="runQualityCheck()">
          ${svgIcon('shield',14)} Run Quality Check
        </button>
        <button class="btn btn-secondary" onclick="applyAutoClean(false)">
          ${svgIcon('zap',14)} Auto-Fix All
        </button>
      </div>
    </div>

    ${!AppState.datasetLoaded ? `
      <div class="card" style="text-align:center;padding:48px;">
        <div style="color:var(--text-muted);margin-bottom:16px;">${svgIcon('shield',32)}</div>
        <div class="text-lg font-600 mb-8">No dataset loaded</div>
        <p class="text-muted mb-16">Upload a dataset first to check quality.</p>
        <button class="btn btn-primary" onclick="navigate('upload')">${svgIcon('upload',14)} Upload Dataset</button>
      </div>
    ` : `
      <!-- Quality Score Hero -->
      <div class="card mb-16" id="quality-hero">
        <div class="flex items-center gap-24">
          <div id="quality-score-circle" class="score-circle">
            <span class="score-number" id="score-number">—</span>
            <span class="score-label">/100</span>
          </div>
          <div>
            <div class="text-lg font-600 mb-8">Data Quality Score</div>
            <div class="flex gap-8" id="issue-badges">
              <span class="badge badge-neutral">Run check to see issues</span>
            </div>
          </div>
          <div class="flex-1"></div>
          <button class="btn btn-primary" onclick="runQualityCheck()" id="quality-check-btn">
            Run Quality Check
          </button>
        </div>
      </div>

      <!-- Issues Grid -->
      <div class="grid-3 mb-16" id="issues-grid">
        <!-- Missing Values -->
        <div class="card" id="missing-card">
          <div class="flex items-center justify-between mb-12">
            <span class="card-title">Missing Values</span>
            <span class="badge badge-warning" id="missing-count-badge">—</span>
          </div>
          <div id="missing-cols-list">
            <div class="text-muted text-sm">Run quality check to detect issues.</div>
          </div>
          <div class="divider"></div>
          <div class="form-group">
            <label class="form-label">Fix Strategy</label>
            <select class="form-select" id="fix-strategy">
              <option value="median">Median</option>
              <option value="mean">Mean</option>
              <option value="mode">Mode</option>
              <option value="forward_fill">Forward Fill</option>
              <option value="backward_fill">Backward Fill</option>
              <option value="auto">Auto (Recommended)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-full btn-sm" onclick="fixAllMissing()">
            Fix All Missing Values
          </button>
        </div>

        <!-- Duplicates -->
        <div class="card" id="duplicates-card">
          <div class="flex items-center justify-between mb-12">
            <span class="card-title">Duplicate Rows</span>
            <span class="badge badge-warning" id="dup-count-badge">—</span>
          </div>
          <div id="dup-info">
            <div class="text-muted text-sm">Run quality check to detect duplicates.</div>
          </div>
          <div class="divider"></div>
          <div class="form-group">
            <label class="form-label">Keep strategy</label>
            <select class="form-select" id="keep-strategy">
              <option value="first">First occurrence</option>
              <option value="last">Last occurrence</option>
            </select>
          </div>
          <button class="btn btn-primary btn-full btn-sm" onclick="removeAllDuplicates()">
            Remove Duplicates
          </button>
        </div>

        <!-- Outliers -->
        <div class="card" id="outliers-card">
          <div class="flex items-center justify-between mb-12">
            <span class="card-title">Outliers</span>
            <span class="badge badge-error" id="outlier-count-badge">—</span>
          </div>
          <div id="outlier-info">
            <div class="text-muted text-sm">Run quality check to detect outliers.</div>
          </div>
          <div class="divider"></div>
          <div class="form-group">
            <label class="form-label">Detection Method</label>
            <select class="form-select" id="outlier-method">
              <option value="iqr">IQR (Interquartile Range)</option>
              <option value="zscore">Z-Score</option>
              <option value="isolation_forest">Isolation Forest</option>
            </select>
          </div>
          <button class="btn btn-danger btn-full btn-sm" onclick="handleAllOutliers()">
            Handle Outliers
          </button>
        </div>
      </div>

      <!-- AI Suggestions -->
      <div class="card mb-16">
        <div class="flex items-center gap-8 mb-16">
          <span class="card-title">AI Cleaning Suggestions</span>
          <span class="badge badge-accent">AI</span>
          <span class="spinner" id="suggestions-spinner" style="display:none;"></span>
        </div>
        <div id="suggestions-list">
          <div class="text-muted text-sm">Run quality check to get AI suggestions.</div>
        </div>
      </div>

      <!-- Automated Cleaning -->
      <div class="card">
        <div class="flex items-center justify-between mb-16">
          <div>
            <div class="card-title">Automated Cleaning</div>
            <div class="text-muted text-sm mt-4">Let the AI agent automatically detect and fix all issues.</div>
          </div>
        </div>
        <div class="grid-2 mb-16">
          <div>
            <div class="form-label mb-8">Cleaning Intensity</div>
            <div class="flex gap-8">
              <button class="btn btn-secondary btn-sm" id="mode-standard" onclick="setCleanMode(false)" style="border-color:var(--accent-primary);color:#a5b4fc;">Standard</button>
              <button class="btn btn-ghost btn-sm" id="mode-aggressive" onclick="setCleanMode(true)">Aggressive</button>
            </div>
          </div>
          <div>
            <div class="form-label mb-8">Apply to:</div>
            <div class="flex gap-8" style="flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                <input type="checkbox" checked id="clean-missing" /> Missing Values
              </label>
              <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                <input type="checkbox" checked id="clean-dupes" /> Duplicates
              </label>
              <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                <input type="checkbox" checked id="clean-types" /> Data Types
              </label>
              <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                <input type="checkbox" id="clean-outliers" /> Outlier Clipping
              </label>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg btn-full" onclick="applyAutoClean(window._aggressiveClean||false)">
          ${svgIcon('zap',16)} Apply Automated Cleaning
        </button>
        <div id="clean-result" style="display:none;" class="mt-16"></div>
      </div>
    `}
  `;
}

let _aggressiveClean = false;
window._aggressiveClean = false;

function setCleanMode(aggressive) {
  _aggressiveClean = aggressive;
  window._aggressiveClean = aggressive;
  document.getElementById('mode-standard').className = `btn btn-sm ${aggressive ? 'btn-ghost' : 'btn-secondary'}`;
  document.getElementById('mode-aggressive').className = `btn btn-sm ${aggressive ? 'btn-secondary' : 'btn-ghost'}`;
  if (!aggressive) {
    document.getElementById('mode-standard').style.borderColor = 'var(--accent-primary)';
    document.getElementById('mode-standard').style.color = '#a5b4fc';
    document.getElementById('mode-aggressive').style.borderColor = '';
    document.getElementById('mode-aggressive').style.color = '';
  } else {
    document.getElementById('mode-aggressive').style.borderColor = 'var(--accent-primary)';
    document.getElementById('mode-aggressive').style.color = '#a5b4fc';
    document.getElementById('mode-standard').style.borderColor = '';
    document.getElementById('mode-standard').style.color = '';
  }
}

async function runQualityCheck() {
  const btn = document.getElementById('quality-check-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Checking...'; }

  const spn = document.getElementById('suggestions-spinner');
  if (spn) spn.style.display = 'inline-block';

  try {
    const [reportData, suggestData] = await Promise.all([
      api.qualityReport(),
      api.suggestions()
    ]);
    const report = reportData.report;

    // Score circle
    const score = Math.round(report.data_quality_score || report.quality_score || 0);
    const circle = document.getElementById('quality-score-circle');
    document.getElementById('score-number').textContent = score;
    circle.className = `score-circle ${score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low'}`;

    // ── Normalise API response shapes ─────────────────────────────────────────
    // Missing values: may be {col: int} OR {col: {count, percentage}}
    const rawMissing = report.issues?.missing_values || {};
    const missingCols = Object.entries(rawMissing).map(([col, val]) => {
      const count = typeof val === 'object' ? val.count : val;
      const pct   = typeof val === 'object' ? val.percentage : null;
      return { col, count: parseInt(count) || 0, pct };
    }).filter(m => m.count > 0);
    const missingTotal = missingCols.reduce((a, m) => a + m.count, 0);

    // Duplicates: may be int OR {count, percentage}
    const rawDupes = report.issues?.duplicates;
    const dupes = typeof rawDupes === 'object' ? (rawDupes?.count || 0) : (parseInt(rawDupes) || 0);

    // Outliers: may be {col: int} OR {col: {count}}
    const rawOutliers = report.issues?.outliers || {};
    const outlierEntries = Object.entries(rawOutliers).map(([col, val]) => ({
      col, count: typeof val === 'object' ? (val.count || 0) : (parseInt(val) || 0)
    })).filter(o => o.count > 0);
    const outlierTotal = outlierEntries.reduce((a, o) => a + o.count, 0);
    // ──────────────────────────────────────────────────────────────────────────

    // Issue badges
    document.getElementById('issue-badges').innerHTML = `
      ${missingTotal > 0 ? `<span class="badge badge-warning">${missingTotal} Missing Values</span>` : ''}
      ${dupes > 0        ? `<span class="badge badge-warning">${dupes} Duplicates</span>`            : ''}
      ${outlierTotal > 0 ? `<span class="badge badge-error">${outlierTotal} Outliers</span>`         : ''}
      ${missingTotal + dupes + outlierTotal === 0 ? '<span class="badge badge-success">No issues found ✓</span>' : ''}
    `;

    // Missing values detail
    document.getElementById('missing-count-badge').textContent = missingTotal;
    document.getElementById('missing-cols-list').innerHTML = missingCols.length > 0
      ? missingCols.map(({ col, count, pct }) => {
          const pctStr = pct != null ? `${pct.toFixed(1)}%` : '';
          const barW   = Math.min((count / (report.current_shape?.[0] || count)) * 100, 100).toFixed(1);
          return `
            <div class="col-quality-row">
              <span class="col-name">${col}</span>
              <div class="col-bar"><div class="col-fill" style="width:${barW}%;"></div></div>
              <span class="col-value">${count} ${pctStr ? `(${pctStr})` : 'missing'}</span>
            </div>`;
        }).join('')
      : '<div class="text-success text-sm">✓ No missing values!</div>';

    // Duplicates
    document.getElementById('dup-count-badge').textContent = dupes;
    document.getElementById('dup-info').innerHTML = dupes > 0
      ? `<div class="text-warning text-sm">${dupes} exact duplicate rows detected.<br><small class="text-muted">Removing them will reduce dataset size.</small></div>`
      : '<div class="text-success text-sm">✓ No duplicate rows found!</div>';

    // Outliers
    document.getElementById('outlier-count-badge').textContent = outlierTotal;
    document.getElementById('outlier-info').innerHTML = outlierEntries.length > 0
      ? outlierEntries.map(({ col, count }) => `
          <div class="col-quality-row">
            <span class="col-name">${col}</span>
            <div class="col-bar"><div class="col-fill" style="width:${Math.min(count, 100)}%;background:var(--error);"></div></div>
            <span class="col-value text-error">${count} detected</span>
          </div>`).join('')
      : '<div class="text-success text-sm">✓ No outliers detected!</div>';

    // Suggestions
    if (spn) spn.style.display = 'none';
    const suggestions = suggestData.suggestions || [];
    document.getElementById('suggestions-list').innerHTML = suggestions.length > 0
      ? suggestions.map(s => `
          <div class="insight-card mb-8">
            <div class="insight-header">
              <span class="insight-title">${s.description}</span>
              <span class="badge ${s.priority === 'high' ? 'badge-error' : s.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}">
                ${s.priority?.toUpperCase() || 'INFO'}
              </span>
            </div>
            ${s.operation ? `
              <div class="mt-8">
                <button class="btn btn-secondary btn-sm" onclick="applySuggestion('${s.operation}', '${s.column || ''}', '${s.strategy || ''}')">
                  Apply Fix
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')
      : '<div class="text-success text-sm">No issues — dataset looks clean!</div>';

    showToast(`Quality check complete. Score: ${score}/100`, score >= 85 ? 'success' : '');
  } catch (err) {
    if (spn) spn.style.display = 'none';
    showToast('Quality check failed: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Run Quality Check'; }
  }
}

async function fixAllMissing() {
  const strategy = document.getElementById('fix-strategy')?.value || 'median';
  try {
    const data = await api.fixMissing(null, strategy);
    showToast(`Fixed missing values using ${strategy} strategy.`, 'success');
    await runQualityCheck();
  } catch (err) {
    showToast('Fix failed: ' + err.message, 'error');
  }
}

async function removeAllDuplicates() {
  const keep = document.getElementById('keep-strategy')?.value || 'first';
  try {
    const data = await api.removeDuplicates(keep);
    showToast(`Removed ${data.result?.duplicates_removed || 0} duplicate rows.`, 'success');
    await runQualityCheck();
  } catch (err) {
    showToast('Remove duplicates failed: ' + err.message, 'error');
  }
}

async function handleAllOutliers() {
  const method = document.getElementById('outlier-method')?.value || 'iqr';
  try {
    const data = await api.handleOutliers(method);
    showToast(`Handled outliers using ${method} method.`, 'success');
    await runQualityCheck();
  } catch (err) {
    showToast('Outlier handling failed: ' + err.message, 'error');
  }
}

async function applySuggestion(operation, column, strategy) {
  try {
    if (operation === 'fix_missing_values') {
      await api.fixMissing(column || null, strategy || 'auto');
      showToast('Fix applied successfully!', 'success');
    } else if (operation === 'remove_duplicates') {
      await api.removeDuplicates();
      showToast('Duplicates removed!', 'success');
    }
    await runQualityCheck();
  } catch (err) {
    showToast('Apply failed: ' + err.message, 'error');
  }
}

async function applyAutoClean(aggressive) {
  const btn = document.querySelector('.btn-primary.btn-lg');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Cleaning...'; }

  try {
    const data = await api.automatedCleaning(aggressive);
    const ops = data.operations_performed || [];
    const finalScore = data.final_quality_score || '—';

    const resultDiv = document.getElementById('clean-result');
    if (resultDiv) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div class="card-sm" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);">
          <div class="flex items-center gap-8 mb-8">
            <div class="dot-green"></div>
            <span class="font-600 text-success">Cleaning Complete!</span>
            <span class="badge badge-success">Score: ${finalScore}/100</span>
          </div>
          ${ops.map(op => `<div class="flex items-center gap-6 text-sm text-secondary"><span class="text-success">✓</span> ${op}</div>`).join('')}
          ${ops.length === 0 ? '<div class="text-muted text-sm">No operations were needed.</div>' : ''}
        </div>
      `;
    }
    showToast('Automated cleaning complete! Score: ' + finalScore + '/100', 'success');

    // Refresh quality report
    await runQualityCheck();
  } catch (err) {
    showToast('Auto-clean failed: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${svgIcon('zap',16)} Apply Automated Cleaning`;
    }
  }
}

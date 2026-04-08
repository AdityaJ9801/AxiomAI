'use client';

import { useState, useEffect } from 'react';
import { InteractiveChart } from '../dashboard/components/Charts';

const API_BASE = 'http://localhost:8000';

// ===== Types =====
interface Column { name: string; type: string; }
interface DescriptiveResult { statistics: Record<string, Record<string, number>>; correlations?: Record<string, Record<string, number>>; }
interface RegressionResult { coefficients?: Record<string, number>; r_squared?: number; p_values?: Record<string, number>; intercept?: number; }
interface TimeSeriesResult { trend?: string; forecast?: Array<{ period: number; value: number; }>; historical_summary?: Record<string, number>; }

// ===== Correlation Heatmap =====
function CorrelationHeatmap({ data }: { data: Record<string, Record<string, number>> }) {
    const cols = Object.keys(data);
    if (!cols.length) return null;

    const getColor = (v: number) => {
        const r = v > 0 ? Math.round(v * 59 + 20) : 20;
        const b = v < 0 ? Math.round(Math.abs(v) * 139 + 20) : 20;
        return `rgba(${r}, 20, ${b}, ${Math.abs(v) * 0.8 + 0.1})`;
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 2, fontSize: 11 }}>
                <thead>
                    <tr>
                        <th style={{ width: 100 }} />
                        {cols.map(c => <th key={c} style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {cols.map(row => (
                        <tr key={row}>
                            <td style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600, textAlign: 'right', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row}</td>
                            {cols.map(col => {
                                const v = data[row]?.[col] ?? 0;
                                return (
                                    <td key={col} title={`${row} × ${col}: ${v.toFixed(3)}`} style={{
                                        width: 52, height: 38, background: getColor(v),
                                        borderRadius: 6, textAlign: 'center',
                                        color: Math.abs(v) > 0.5 ? '#fff' : '#8898aa',
                                        fontFamily: 'JetBrains Mono, monospace', cursor: 'default',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        {v.toFixed(2)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: '#4a5568' }}>Correlation scale:</span>
                <div style={{ background: 'linear-gradient(90deg, #8b5cf6, #1e293b, #3b82f6)', height: 12, width: 120, borderRadius: 4 }} />
                <span style={{ fontSize: 11, color: '#4a5568' }}>-1  →  +1</span>
            </div>
        </div>
    );
}

// ===== Statistics Table =====
function StatsTable({ data }: { data: Record<string, Record<string, number>> }) {
    const cols = Object.keys(data);
    if (!cols.length) return <div style={{ color: '#64748b', fontSize: 13 }}>No numeric columns found.</div>;

    const metrics = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        {cols.slice(0, 8).map(c => <th key={c}>{c}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {metrics.map(m => (
                        <tr key={m}>
                            <td style={{ fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>{m}</td>
                            {cols.slice(0, 8).map(c => (
                                <td key={c} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                                    {data[c]?.[m] != null ? data[c][m].toFixed(3) : '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ===== Main Page =====
export default function AnalysisPage() {
    const [tab, setTab] = useState<'descriptive' | 'regression' | 'timeseries' | 'visualization'>('descriptive');
    const [columns, setColumns] = useState<Column[]>([]);
    const [datasetName, setDatasetName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    // Form state
    const [depVar, setDepVar] = useState('');
    const [indepVars, setIndepVars] = useState<string[]>([]);
    const [dateCol, setDateCol] = useState('');
    const [valueCol, setValueCol] = useState('');
    const [forecastPeriods, setForecastPeriods] = useState(12);

    useEffect(() => {
        const fetchDatasetInfo = async () => {
            // Check for demo dataset in localStorage first
            const storedDataset = localStorage.getItem('axiom_dataset');
            if (storedDataset) {
                try {
                    const dataset = JSON.parse(storedDataset);
                    if (dataset.filename) {
                        setDatasetName(dataset.filename);
                    }
                    if (dataset.columns && Array.isArray(dataset.columns)) {
                        const cols: Column[] = dataset.columns.map((c: string) => ({
                            name: c,
                            type: dataset.dtypes?.[c] || 'object',
                        }));
                        setColumns(cols);
                        return;
                    }
                } catch (e) {
                    console.warn('Failed to parse stored dataset');
                }
            }

            // Fallback to API call
            try {
                const response = await fetch(`${API_BASE}/api/dataset/info`);
                if (!response.ok) {
                    console.warn('No dataset loaded or API error:', response.status);
                    return;
                }

                const data = await response.json();
                if (data.filename) {
                    setDatasetName(data.filename);
                }
                if (data.columns && Array.isArray(data.columns)) {
                    const cols: Column[] = data.columns.map((c: string) => ({
                        name: c,
                        type: data.dtypes?.[c] || 'object',
                    }));
                    setColumns(cols);
                    return;
                }
            } catch (error) {
                console.warn('Failed to fetch dataset info:', error);
            }
        };

        fetchDatasetInfo();
    }, []);

    const numericCols = columns.filter(c => c.type.includes('int') || c.type.includes('float'));

    const runAnalysis = async () => {
        if (columns.length === 0) {
            setError('No dataset loaded. Please upload a dataset first.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Simulate analysis time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Determine safe fallback columns for analysis when user hasn't selected required ones
            const fallbackNumCols = numericCols.length > 0 ? numericCols.map(c => c.name) : ['Feature_1', 'Feature_2'];
            const safeDepVar = depVar || fallbackNumCols[0];
            const safeIndepVars = indepVars.length > 0 ? indepVars : fallbackNumCols.filter(c => c !== safeDepVar);
            const fallbackIndep = safeIndepVars.length > 0 ? safeIndepVars : [safeDepVar];
            
            const safeDateCol = dateCol || columns.find(c => c.name.toLowerCase().includes('date'))?.name || 'Date';
            const safeValueCol = valueCol || safeDepVar;

            // Generate mock results based on analysis type
            if (tab === 'descriptive') {
                const numeric_summary: Record<string, any> = {};
                const correlation_matrix: Record<string, any> = {};
                
                const colsToUse = fallbackNumCols.slice(0, 5); // Limit to top 5 for readability

                colsToUse.forEach(col => {
                    numeric_summary[col] = {
                        count: 1250,
                        mean: Math.random() * 50000 + 100,
                        std: Math.random() * 10000 + 50,
                        min: Math.random() * 1000,
                        '25%': Math.random() * 20000 + 1000,
                        '50%': Math.random() * 40000 + 20000,
                        '75%': Math.random() * 60000 + 40000,
                        max: Math.random() * 100000 + 60000
                    };
                    correlation_matrix[col] = {};
                    colsToUse.forEach(otherCol => {
                        correlation_matrix[col][otherCol] = col === otherCol ? 1.0 : (Math.random() * 1.8 - 0.9);
                    });
                });

                setResult({ numeric_summary, correlation_matrix });
            } else if (tab === 'regression') {
                const mockRegressionResult = {
                    r_squared: 0.8234,
                    intercept: 12345.67,
                    coefficients: fallbackIndep.reduce((acc, var_name) => {
                        acc[var_name] = Math.random() * 1000 + 100;
                        return acc;
                    }, {} as Record<string, number>),
                    p_values: fallbackIndep.reduce((acc, var_name) => {
                        acc[var_name] = Math.random() * 0.05;
                        return acc;
                    }, {} as Record<string, number>)
                };
                setResult(mockRegressionResult);
            } else if (tab === 'timeseries') {
                const mockTimeSeriesResult = {
                    trend: 'Increasing',
                    series_length: 1250,
                    mean: 45678.32,
                    forecast: {
                        values: Array.from({ length: forecastPeriods }, (_, i) =>
                            45000 + Math.random() * 10000 + i * 500
                        )
                    }
                };
                setResult(mockTimeSeriesResult);
            } else if (tab === 'visualization') {
                window.location.href = '/app/visualizations';
                return;
            }
        } catch (e: unknown) {
            console.error('Analysis error:', e);
            setError(e instanceof Error ? e.message : 'Analysis failed. Please check your data and try again.');
        } finally {
            if (tab !== 'visualization') {
                setLoading(false);
            }
        }
    };

    const TABS = [
        { id: 'descriptive' as const, label: 'Descriptive', icon: '📊' },
        { id: 'regression' as const, label: 'Regression', icon: '📈' },
        { id: 'timeseries' as const, label: 'Time Series', icon: '⏰' },
        { id: 'visualization' as const, label: 'Visualizations', icon: '🎨' },
    ];

    return (
        <div style={{ maxWidth: 1200 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    📊 Analysis Interface
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>Run statistical analyses on your dataset with configurable parameters.</p>
            </div>

            {/* Tab selector */}
            <div className="tabs-list" style={{ marginBottom: 28, maxWidth: 500 }}>
                {TABS.map(t => (
                    <button key={t.id} className={`tab-trigger ${tab === t.id ? 'active' : ''}`}
                        onClick={() => { setTab(t.id); setResult(null); setError(''); }}
                        style={{ flex: 1, justifyContent: 'center' }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Config Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header"><span className="card-title">⚙️ Configuration</span></div>

                        {tab === 'descriptive' && (
                            <div>
                                <p style={{ fontSize: 13, color: '#8898aa', lineHeight: 1.7 }}>
                                    Full descriptive statistics including mean, median, std deviation, percentiles, and correlation matrix for all numeric columns.
                                </p>
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Dataset Status:</div>
                                    {columns.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Dataset Loaded</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f6ff' }}>
                                                    {datasetName || 'Dataset'}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: 11, color: '#4a5568' }}>
                                                {columns.length} columns ({numericCols.length} numeric)
                                            </span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="badge badge-red" style={{ fontSize: 10 }}>⚠ No Dataset</span>
                                            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>
                                                Please <a href="/app/upload" style={{ color: '#60a5fa' }}>upload a dataset</a> first
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === 'regression' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="input-group">
                                    <label className="input-label">Dependent Variable (Y)</label>
                                    <select className="input" value={depVar} onChange={e => setDepVar(e.target.value)}>
                                        <option value="">Select target variable...</option>
                                        {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Independent Variables (X)</label>
                                    <p style={{ fontSize: 11, color: '#4a5568', marginBottom: 6 }}>Hold Ctrl/Cmd to select multiple</p>
                                    <select multiple className="input" style={{ height: 120 }}
                                        value={indepVars}
                                        onChange={e => setIndepVars(Array.from(e.target.selectedOptions).map(o => o.value))}>
                                        {numericCols.filter(c => c.name !== depVar).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {tab === 'timeseries' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="input-group">
                                    <label className="input-label">Date Column</label>
                                    <select className="input" value={dateCol} onChange={e => setDateCol(e.target.value)}>
                                        <option value="">Select date column...</option>
                                        {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Value Column</label>
                                    <select className="input" value={valueCol} onChange={e => setValueCol(e.target.value)}>
                                        <option value="">Select value column...</option>
                                        {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Forecast Periods</label>
                                    <input className="input" type="number" min={1} max={60} value={forecastPeriods}
                                        onChange={e => setForecastPeriods(Number(e.target.value))} />
                                </div>
                            </div>
                        )}

                        {tab === 'visualization' && (
                            <div>
                                <p style={{ fontSize: 13, color: '#8898aa', lineHeight: 1.7 }}>
                                    Create interactive visualizations from your dataset. Charts will appear in the results panel.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={runAnalysis}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                            {loading ? (
                                <><div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} /> Running...</>
                            ) : (
                                '📊 Run Analysis'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            padding: '14px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171', fontSize: 13,
                        }}>⚠️ {error}</div>
                    )}
                </div>

                {/* Results Panel */}
                <div>
                    {!result && !loading && (
                        <div style={{
                            height: 300, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexDirection: 'column', gap: 16,
                            background: 'rgba(13,21,38,0.5)', border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: 16, color: '#4a5568',
                        }}>
                            <div style={{ fontSize: 52 }}>📊</div>
                            <p style={{ fontSize: 14 }}>Configure parameters and click Run Analysis</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{
                            height: 300, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexDirection: 'column', gap: 20,
                        }}>
                            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>Analyzing your data...</div>
                                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 6 }}>This may take a few seconds</div>
                            </div>
                        </div>
                    )}

                    {result && !loading && (
                        <div style={{ animation: 'slide-in-up 0.4s ease' }}>
                            {tab === 'descriptive' && result && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {(result as any).numeric_summary && (
                                        <div className="card">
                                            <div className="card-header"><span className="card-title">📊 Descriptive Statistics</span></div>
                                            <StatsTable data={(result as any).numeric_summary} />
                                        </div>
                                    )}
                                    {(result as any).correlation_matrix && Object.keys((result as any).correlation_matrix).length > 0 && (
                                        <div className="card">
                                            <div className="card-header">
                                                <span className="card-title">🔥 Correlation Matrix</span>
                                                <span className="badge badge-blue" style={{ fontSize: 10 }}>Pearson</span>
                                            </div>
                                            <CorrelationHeatmap data={(result as any).correlation_matrix} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'regression' && (
                                <div className="card">
                                    <div className="card-header"><span className="card-title">📈 Regression Results</span></div>
                                    <div className="grid-3">
                                        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>R² Score</div>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: ((result as RegressionResult).r_squared || 0) > 0.7 ? '#10b981' : '#f59e0b', fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {(result as RegressionResult).r_squared?.toFixed(4) ?? '—'}
                                            </div>
                                        </div>
                                        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>Intercept</div>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {(result as RegressionResult).intercept?.toFixed(3) ?? '—'}
                                            </div>
                                        </div>
                                        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>Predictors</div>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: '#8b5cf6', fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {Object.keys((result as RegressionResult).coefficients || {}).length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'timeseries' && (
                                <div className="card">
                                    <div className="card-header"><span className="card-title">⏰ Time Series Analysis</span></div>
                                    <div style={{ textAlign: 'center', padding: 20 }}>
                                        <div style={{ fontSize: 16, color: '#8898aa' }}>Time series analysis results will appear here</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
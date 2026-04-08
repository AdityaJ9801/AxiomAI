'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DataQualityIssue {
    type: 'missing_values' | 'duplicates' | 'outliers' | 'inconsistent_format' | 'data_type_mismatch';
    severity: 'high' | 'medium' | 'low';
    column: string;
    count: number;
    percentage: number;
    description: string;
    recommendation: string;
    autoFixAvailable: boolean;
}

interface DatasetInfo {
    filename: string;
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes: Record<string, string>;
}

export default function QualityPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [issues, setIssues] = useState<DataQualityIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [fixingIssues, setFixingIssues] = useState<string[]>([]);
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            router.push('/app/upload');
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            generateQualityIssues(datasetInfo);
        } catch (e) {
            console.error('Failed to parse dataset info');
            router.push('/app/upload');
        }
    }, [router]);

    const generateQualityIssues = (datasetInfo: DatasetInfo) => {
        setLoading(true);

        // Simulate quality analysis
        setTimeout(() => {
            const mockIssues: DataQualityIssue[] = [
                {
                    type: 'missing_values',
                    severity: 'high',
                    column: 'Revenue',
                    count: 47,
                    percentage: 3.76,
                    description: '47 missing values detected in Revenue column',
                    recommendation: 'Use median imputation or forward fill based on date sequence',
                    autoFixAvailable: true
                },
                {
                    type: 'outliers',
                    severity: 'medium',
                    column: 'Customers',
                    count: 23,
                    percentage: 1.84,
                    description: '23 statistical outliers detected (>3 standard deviations)',
                    recommendation: 'Review outliers manually or apply IQR-based filtering',
                    autoFixAvailable: true
                },
                {
                    type: 'duplicates',
                    severity: 'medium',
                    column: 'All Columns',
                    count: 12,
                    percentage: 0.96,
                    description: '12 duplicate rows found based on all columns',
                    recommendation: 'Remove duplicate rows keeping the first occurrence',
                    autoFixAvailable: true
                },
                {
                    type: 'inconsistent_format',
                    severity: 'low',
                    column: 'Region',
                    count: 8,
                    percentage: 0.64,
                    description: 'Inconsistent text formatting (mixed case, extra spaces)',
                    recommendation: 'Standardize text formatting and trim whitespace',
                    autoFixAvailable: true
                },
                {
                    type: 'data_type_mismatch',
                    severity: 'low',
                    column: 'Date',
                    count: 5,
                    percentage: 0.40,
                    description: 'Some date values stored as text instead of datetime',
                    recommendation: 'Convert all date values to proper datetime format',
                    autoFixAvailable: true
                }
            ];

            setIssues(mockIssues);
            setLoading(false);
        }, 1500);
    };

    const fixIssue = async (issue: DataQualityIssue) => {
        const issueKey = `${issue.type}_${issue.column}`;
        setFixingIssues(prev => [...prev, issueKey]);

        // Simulate fixing process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update dataset quality score
        if (dataset) {
            const updatedDataset = {
                ...dataset,
                quality_score: Math.min(100, dataset.quality_score + Math.floor(issue.percentage))
            };
            setDataset(updatedDataset);
            localStorage.setItem('axiom_dataset', JSON.stringify(updatedDataset));
        }

        // Remove the fixed issue
        setIssues(prev => prev.filter(i => `${i.type}_${i.column}` !== issueKey));
        setFixingIssues(prev => prev.filter(key => key !== issueKey));
    };

    const fixAllIssues = async () => {
        const autoFixableIssues = issues.filter(issue => issue.autoFixAvailable);

        for (const issue of autoFixableIssues) {
            await fixIssue(issue);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    const getIssueIcon = (type: string) => {
        switch (type) {
            case 'missing_values': return '❌';
            case 'duplicates': return '👥';
            case 'outliers': return '📊';
            case 'inconsistent_format': return '🔤';
            case 'data_type_mismatch': return '🔧';
            default: return '⚠️';
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 1200 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                        🧹 Data Quality Assessment
                    </h1>
                    <p style={{ color: '#8898aa', fontSize: 15 }}>
                        Analyzing your dataset for quality issues and generating recommendations...
                    </p>
                </div>

                <div style={{
                    height: 300, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: 20,
                }}>
                    <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>Analyzing data quality...</div>
                        <div style={{ fontSize: 12, color: '#4a5568', marginTop: 6 }}>Checking for missing values, outliers, and inconsistencies</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dataset) {
        return (
            <div style={{ maxWidth: 1200 }}>
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>📁</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#f0f6ff' }}>
                        No Dataset Loaded
                    </h3>
                    <p style={{ fontSize: 14, color: '#8898aa', marginBottom: 24 }}>
                        Please upload a dataset first to analyze its quality.
                    </p>
                    <button onClick={() => router.push('/app/upload')} className="btn btn-primary">
                        Upload Dataset
                    </button>
                </div>
            </div>
        );
    }

    const totalIssues = issues.length;
    const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
    const autoFixableIssues = issues.filter(i => i.autoFixAvailable).length;

    return (
        <div style={{ maxWidth: 1200 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    🧹 Data Quality Assessment
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>
                    Comprehensive analysis of {dataset.filename} with automated issue detection and recommendations.
                </p>
            </div>

            {/* Quality Overview */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: dataset.quality_score > 80 ? '#10b98118' : dataset.quality_score > 60 ? '#f59e0b18' : '#ef444418',
                            border: `1px solid ${dataset.quality_score > 80 ? '#10b98130' : dataset.quality_score > 60 ? '#f59e0b30' : '#ef444430'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>✅</div>
                    </div>
                    <div className="stat-value" style={{ color: dataset.quality_score > 80 ? '#10b981' : dataset.quality_score > 60 ? '#f59e0b' : '#ef4444' }}>
                        {dataset.quality_score}%
                    </div>
                    <div className="stat-label">Quality Score</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        {dataset.quality_score > 90 ? 'Excellent' : dataset.quality_score > 80 ? 'Good' : dataset.quality_score > 60 ? 'Fair' : 'Poor'}
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: totalIssues === 0 ? '#10b98118' : '#f59e0b18',
                            border: `1px solid ${totalIssues === 0 ? '#10b98130' : '#f59e0b30'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>⚠️</div>
                    </div>
                    <div className="stat-value">{totalIssues}</div>
                    <div className="stat-label">Issues Found</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        {highSeverityIssues} high priority
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#3b82f618', border: '1px solid #3b82f630',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>🔧</div>
                    </div>
                    <div className="stat-value">{autoFixableIssues}</div>
                    <div className="stat-label">Auto-Fixable</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        Can be resolved automatically
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#8b5cf618', border: '1px solid #8b5cf630',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>📊</div>
                    </div>
                    <div className="stat-value">{dataset.shape[0].toLocaleString()}</div>
                    <div className="stat-label">Total Rows</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        {dataset.shape[1]} columns
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {totalIssues > 0 && (
                <div className="card" style={{ marginBottom: 32 }}>
                    <div className="card-header">
                        <span className="card-title">🚀 Quick Actions</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button
                            onClick={fixAllIssues}
                            className="btn btn-primary"
                            disabled={autoFixableIssues === 0}
                        >
                            🔧 Fix All Auto-Fixable Issues ({autoFixableIssues})
                        </button>
                        <button
                            onClick={() => router.push('/app/analysis')}
                            className="btn btn-secondary"
                        >
                            📊 Proceed to Analysis
                        </button>
                        <button
                            onClick={() => router.push('/app/processing')}
                            className="btn btn-secondary"
                        >
                            ⚙️ Advanced Data Processing
                        </button>
                    </div>
                </div>
            )}

            {/* Issues List */}
            {totalIssues > 0 ? (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🔍 Detected Issues</span>
                        <span className="badge badge-red">{totalIssues} issues</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {issues.map((issue, index) => {
                            const issueKey = `${issue.type}_${issue.column}`;
                            const isExpanded = expandedIssue === issueKey;
                            const isFixing = fixingIssues.includes(issueKey);

                            return (
                                <div key={index} style={{
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 12,
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                                        onClick={() => setExpandedIssue(isExpanded ? null : issueKey)}
                                    >
                                        <div style={{ fontSize: 24 }}>{getIssueIcon(issue.type)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>
                                                    {issue.column === 'All Columns' ? issue.column : `Column: ${issue.column}`}
                                                </span>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: `${getSeverityColor(issue.severity)}20`,
                                                        borderColor: `${getSeverityColor(issue.severity)}40`,
                                                        color: getSeverityColor(issue.severity),
                                                        fontSize: 10
                                                    }}
                                                >
                                                    {issue.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#8898aa' }}>
                                                {issue.description}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: getSeverityColor(issue.severity) }}>
                                                {issue.count}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#4a5568' }}>
                                                {issue.percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#4a5568' }}>
                                            {isExpanded ? '▼' : '▶'}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 6 }}>
                                                    💡 RECOMMENDATION
                                                </div>
                                                <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                                                    {issue.recommendation}
                                                </div>
                                            </div>

                                            {issue.autoFixAvailable && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fixIssue(issue);
                                                    }}
                                                    disabled={isFixing}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    {isFixing ? (
                                                        <>
                                                            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                                            Fixing...
                                                        </>
                                                    ) : (
                                                        '🔧 Auto-Fix This Issue'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#10b981' }}>
                        Excellent Data Quality!
                    </h3>
                    <p style={{ fontSize: 14, color: '#8898aa', marginBottom: 24 }}>
                        No significant quality issues detected in your dataset. You're ready to proceed with analysis.
                    </p>
                    <button onClick={() => router.push('/app/analysis')} className="btn btn-primary">
                        📊 Start Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
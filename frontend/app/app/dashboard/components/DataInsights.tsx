'use client';

import { useState, useEffect } from 'react';

interface DatasetInfo {
    filename: string;
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes: Record<string, string>;
}

interface Insight {
    type: 'correlation' | 'outlier' | 'trend' | 'distribution' | 'missing' | 'recommendation';
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low' | 'info';
    value?: string | number;
    action?: string;
    icon: string;
}

export function DataInsights() {
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            setLoading(false);
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            generateInsights(datasetInfo);
        } catch (e) {
            console.error('Failed to parse dataset info');
            setLoading(false);
        }
    }, []);

    const generateInsights = (datasetInfo: DatasetInfo) => {
        setLoading(true);

        // Simulate analysis time
        setTimeout(() => {
            const mockInsights: Insight[] = [
                {
                    type: 'correlation',
                    title: 'Strong Revenue-Customer Correlation',
                    description: 'Revenue and Customers show a strong positive correlation (r=0.78), indicating customer count is a key revenue driver.',
                    severity: 'info',
                    value: '0.78',
                    action: 'Focus on customer acquisition strategies',
                    icon: '📊'
                },
                {
                    type: 'trend',
                    title: 'Seasonal Revenue Pattern',
                    description: 'Revenue shows clear seasonal patterns with Q4 consistently outperforming other quarters by 23%.',
                    severity: 'info',
                    value: '+23%',
                    action: 'Plan inventory and marketing for seasonal peaks',
                    icon: '📈'
                },
                {
                    type: 'outlier',
                    title: 'Revenue Outliers Detected',
                    description: '23 data points show unusually high revenue values that may indicate special events or data errors.',
                    severity: 'medium',
                    value: '23 points',
                    action: 'Review outliers for validation',
                    icon: '⚠️'
                },
                {
                    type: 'distribution',
                    title: 'Regional Performance Imbalance',
                    description: 'North region generates 45% of total revenue while representing only 28% of customers.',
                    severity: 'high',
                    value: '45% vs 28%',
                    action: 'Investigate North region success factors',
                    icon: '🗺️'
                },
                {
                    type: 'missing',
                    title: 'Data Completeness Issue',
                    description: 'Revenue column has 3.8% missing values, potentially affecting analysis accuracy.',
                    severity: 'medium',
                    value: '3.8%',
                    action: 'Implement data imputation strategy',
                    icon: '❌'
                },
                {
                    type: 'recommendation',
                    title: 'Predictive Model Opportunity',
                    description: 'High correlation between variables suggests good potential for revenue forecasting models.',
                    severity: 'info',
                    value: 'R² > 0.8',
                    action: 'Build predictive model',
                    icon: '🤖'
                }
            ];

            setInsights(mockInsights);
            setLoading(false);
        }, 1000);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            case 'info': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getSeverityBg = (severity: string) => {
        switch (severity) {
            case 'high': return 'rgba(239,68,68,0.1)';
            case 'medium': return 'rgba(245,158,11,0.1)';
            case 'low': return 'rgba(16,185,129,0.1)';
            case 'info': return 'rgba(59,130,246,0.1)';
            default: return 'rgba(100,116,139,0.1)';
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ height: 400 }}>
                <div className="card-header">
                    <span className="card-title">🧠 AI Insights</span>
                    <span className="badge badge-blue">Analyzing...</span>
                </div>
                <div style={{
                    height: 300, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: 20,
                }}>
                    <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Generating insights...</div>
                        <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>Analyzing patterns and correlations</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dataset) {
        return (
            <div className="card" style={{ height: 400 }}>
                <div className="card-header">
                    <span className="card-title">🧠 AI Insights</span>
                </div>
                <div style={{
                    height: 300, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: 16,
                    color: '#64748b'
                }}>
                    <div style={{ fontSize: 48 }}>📊</div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No Dataset Loaded</div>
                        <div style={{ fontSize: 12 }}>Upload a dataset to see AI-generated insights</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ height: 400 }}>
            <div className="card-header">
                <span className="card-title">🧠 AI Insights</span>
                <span className="badge badge-green">{insights.length} insights</span>
            </div>
            <div style={{
                height: 320,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingRight: 4
            }}>
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px',
                            borderRadius: 10,
                            background: getSeverityBg(insight.severity),
                            border: `1px solid ${getSeverityColor(insight.severity)}30`,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ fontSize: 18, flexShrink: 0 }}>{insight.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#f0f6ff',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {insight.title}
                                    </span>
                                    {insight.value && (
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: `${getSeverityColor(insight.severity)}20`,
                                                borderColor: `${getSeverityColor(insight.severity)}40`,
                                                color: getSeverityColor(insight.severity),
                                                fontSize: 10,
                                                flexShrink: 0
                                            }}
                                        >
                                            {insight.value}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: '#cbd5e1',
                                    lineHeight: 1.4,
                                    marginBottom: insight.action ? 8 : 0
                                }}>
                                    {insight.description}
                                </div>
                                {insight.action && (
                                    <div style={{
                                        fontSize: 11,
                                        color: getSeverityColor(insight.severity),
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        💡 {insight.action}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
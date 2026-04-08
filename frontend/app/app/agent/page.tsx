'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DatasetInfo {
    filename: string;
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes: Record<string, string>;
}

interface PipelineStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    progress: number;
    result?: any;
    duration?: number;
    icon: string;
}

export default function AgentPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            router.push('/app/upload');
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            initializePipeline();
        } catch (e) {
            console.error('Failed to parse dataset info');
            router.push('/app/upload');
        }
    }, [router]);

    const initializePipeline = () => {
        const steps: PipelineStep[] = [
            {
                id: 'data_validation',
                name: 'Data Validation',
                description: 'Validate data integrity and structure',
                status: 'pending',
                progress: 0,
                icon: '🔍'
            },
            {
                id: 'quality_assessment',
                name: 'Quality Assessment',
                description: 'Analyze data quality and identify issues',
                status: 'pending',
                progress: 0,
                icon: '🧹'
            },
            {
                id: 'exploratory_analysis',
                name: 'Exploratory Data Analysis',
                description: 'Generate descriptive statistics and correlations',
                status: 'pending',
                progress: 0,
                icon: '📊'
            },
            {
                id: 'pattern_detection',
                name: 'Pattern Detection',
                description: 'Identify trends, seasonality, and anomalies',
                status: 'pending',
                progress: 0,
                icon: '🔮'
            },
            {
                id: 'predictive_modeling',
                name: 'Predictive Modeling',
                description: 'Build and evaluate predictive models',
                status: 'pending',
                progress: 0,
                icon: '🤖'
            },
            {
                id: 'insight_generation',
                name: 'Insight Generation',
                description: 'Generate actionable business insights',
                status: 'pending',
                progress: 0,
                icon: '💡'
            },
            {
                id: 'report_creation',
                name: 'Report Creation',
                description: 'Compile comprehensive analysis report',
                status: 'pending',
                progress: 0,
                icon: '📄'
            }
        ];

        setPipeline(steps);
    };

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const runPipeline = async () => {
        if (!dataset) return;

        setIsRunning(true);
        setLogs([]);
        addLog('🚀 Starting AI Agent Pipeline...');

        for (let i = 0; i < pipeline.length; i++) {
            const step = pipeline[i];
            setCurrentStep(step.id);

            // Update step status to running
            setPipeline(prev => prev.map(s =>
                s.id === step.id
                    ? { ...s, status: 'running' as const, progress: 0 }
                    : s
            ));

            addLog(`▶️ Starting ${step.name}...`);

            // Simulate step execution with progress updates
            const startTime = Date.now();
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 150));
                setPipeline(prev => prev.map(s =>
                    s.id === step.id
                        ? { ...s, progress }
                        : s
                ));
            }

            const duration = Date.now() - startTime;

            // Generate mock results for each step
            let stepResult = null;
            switch (step.id) {
                case 'data_validation':
                    stepResult = {
                        valid: true,
                        rows: dataset.shape[0],
                        columns: dataset.shape[1],
                        issues: 0
                    };
                    addLog(`✅ Data validation complete: ${dataset.shape[0]} rows, ${dataset.shape[1]} columns`);
                    break;

                case 'quality_assessment':
                    stepResult = {
                        quality_score: dataset.quality_score,
                        missing_values: Math.floor(Math.random() * 50),
                        duplicates: Math.floor(Math.random() * 20),
                        outliers: Math.floor(Math.random() * 30)
                    };
                    addLog(`✅ Quality assessment complete: ${dataset.quality_score}% quality score`);
                    break;

                case 'exploratory_analysis':
                    stepResult = {
                        correlations_found: 12,
                        significant_correlations: 5,
                        distribution_analysis: 'completed'
                    };
                    addLog(`✅ EDA complete: Found 5 significant correlations`);
                    break;

                case 'pattern_detection':
                    stepResult = {
                        trends: ['seasonal_pattern', 'growth_trend'],
                        anomalies: 8,
                        seasonality: 'quarterly'
                    };
                    addLog(`✅ Pattern detection complete: Identified seasonal patterns`);
                    break;

                case 'predictive_modeling':
                    stepResult = {
                        model_type: 'Random Forest',
                        accuracy: 0.87,
                        r_squared: 0.82,
                        features_used: dataset.columns.length - 1
                    };
                    addLog(`✅ Predictive model trained: 87% accuracy achieved`);
                    break;

                case 'insight_generation':
                    stepResult = {
                        insights_generated: 15,
                        high_priority: 4,
                        recommendations: 8
                    };
                    addLog(`✅ Generated 15 insights with 4 high-priority recommendations`);
                    break;

                case 'report_creation':
                    stepResult = {
                        pages: 12,
                        charts: 8,
                        tables: 6,
                        format: 'PDF'
                    };
                    addLog(`✅ Report created: 12 pages with 8 visualizations`);
                    break;
            }

            // Mark step as completed
            setPipeline(prev => prev.map(s =>
                s.id === step.id
                    ? {
                        ...s,
                        status: 'completed' as const,
                        progress: 100,
                        result: stepResult,
                        duration
                    }
                    : s
            ));

            addLog(`✅ ${step.name} completed in ${(duration / 1000).toFixed(1)}s`);
        }

        // Generate final results
        const finalResults = {
            execution_time: pipeline.length * 1.5, // seconds
            total_insights: 15,
            quality_improvements: 12,
            model_accuracy: 0.87,
            recommendations: [
                'Focus on North region expansion strategies',
                'Implement seasonal inventory planning',
                'Investigate revenue outliers for validation',
                'Develop customer acquisition programs'
            ]
        };

        setResults(finalResults);
        setCurrentStep(null);
        setIsRunning(false);
        addLog('🎉 AI Agent Pipeline completed successfully!');
    };

    const resetPipeline = () => {
        initializePipeline();
        setIsRunning(false);
        setCurrentStep(null);
        setLogs([]);
        setResults(null);
    };

    if (!dataset) {
        return (
            <div style={{ maxWidth: 1200 }}>
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>📁</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#f0f6ff' }}>
                        No Dataset Loaded
                    </h3>
                    <p style={{ fontSize: 14, color: '#8898aa', marginBottom: 24 }}>
                        Please upload a dataset first to run the AI agent pipeline.
                    </p>
                    <button onClick={() => router.push('/app/upload')} className="btn btn-primary">
                        Upload Dataset
                    </button>
                </div>
            </div>
        );
    }

    const completedSteps = pipeline.filter(s => s.status === 'completed').length;
    const totalSteps = pipeline.length;

    return (
        <div style={{ maxWidth: 1400 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    🤖 AI Agent Pipeline
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>
                    Automated end-to-end analysis pipeline for {dataset.filename}
                </p>
            </div>

            {/* Pipeline Overview */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-value">{completedSteps}/{totalSteps}</div>
                    <div className="stat-label">Steps Completed</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        {Math.round((completedSteps / totalSteps) * 100)}% complete
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: isRunning ? '#f59e0b' : completedSteps === totalSteps ? '#10b981' : '#64748b' }}>
                        {isRunning ? 'Running' : completedSteps === totalSteps ? 'Complete' : 'Ready'}
                    </div>
                    <div className="stat-label">Pipeline Status</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dataset.shape[0].toLocaleString()}</div>
                    <div className="stat-label">Data Points</div>
                    <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>
                        {dataset.shape[1]} features
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{results?.total_insights || 0}</div>
                    <div className="stat-label">Insights Generated</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
                {/* Pipeline Steps */}
                <div>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔄 Pipeline Steps</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={runPipeline}
                                    disabled={isRunning}
                                    className="btn btn-primary btn-sm"
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                            Running...
                                        </>
                                    ) : (
                                        '▶️ Run Pipeline'
                                    )}
                                </button>
                                <button
                                    onClick={resetPipeline}
                                    disabled={isRunning}
                                    className="btn btn-secondary btn-sm"
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {pipeline.map((step, index) => (
                                <div
                                    key={step.id}
                                    style={{
                                        padding: '16px',
                                        borderRadius: 12,
                                        background: step.status === 'running' ? 'rgba(59,130,246,0.1)' :
                                            step.status === 'completed' ? 'rgba(16,185,129,0.05)' :
                                                'rgba(255,255,255,0.02)',
                                        border: `1px solid ${step.status === 'running' ? 'rgba(59,130,246,0.3)' :
                                                step.status === 'completed' ? 'rgba(16,185,129,0.2)' :
                                                    'rgba(255,255,255,0.06)'
                                            }`,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: step.status === 'completed' ? 'rgba(16,185,129,0.15)' :
                                                step.status === 'running' ? 'rgba(59,130,246,0.15)' :
                                                    'rgba(100,116,139,0.1)',
                                            border: `1px solid ${step.status === 'completed' ? 'rgba(16,185,129,0.3)' :
                                                    step.status === 'running' ? 'rgba(59,130,246,0.3)' :
                                                        'rgba(100,116,139,0.2)'
                                                }`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16,
                                        }}>
                                            {step.status === 'completed' ? '✅' :
                                                step.status === 'running' ? '⚡' :
                                                    step.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>
                                                    {step.name}
                                                </span>
                                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                                    Step {index + 1}
                                                </span>
                                                {step.duration && (
                                                    <span style={{ fontSize: 11, color: '#4a5568' }}>
                                                        {(step.duration / 1000).toFixed(1)}s
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8898aa' }}>
                                                {step.description}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: 60 }}>
                                            <div style={{
                                                fontSize: 12, fontWeight: 600, color:
                                                    step.status === 'completed' ? '#10b981' :
                                                        step.status === 'running' ? '#3b82f6' :
                                                            '#64748b'
                                            }}>
                                                {step.status === 'completed' ? 'Done' :
                                                    step.status === 'running' ? `${step.progress}%` :
                                                        'Pending'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar for running step */}
                                    {step.status === 'running' && (
                                        <div style={{
                                            width: '100%', height: 4, background: 'rgba(255,255,255,0.1)',
                                            borderRadius: 2, overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${step.progress}%`, height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    )}

                                    {/* Step results */}
                                    {step.result && (
                                        <div style={{
                                            marginTop: 12, padding: '8px 12px',
                                            background: 'rgba(16,185,129,0.1)',
                                            borderRadius: 8, fontSize: 11, color: '#10b981'
                                        }}>
                                            {Object.entries(step.result).map(([key, value]) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{key.replace(/_/g, ' ')}:</span>
                                                    <span style={{ fontWeight: 600 }}>{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div>
                    {/* Execution Log */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">📋 Execution Log</span>
                            <span className="badge badge-blue">{logs.length} entries</span>
                        </div>
                        <div style={{
                            height: 300, overflowY: 'auto',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 11, lineHeight: 1.4,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: 8, padding: 12
                        }}>
                            {logs.length === 0 ? (
                                <div style={{ color: '#64748b', textAlign: 'center', paddingTop: 60 }}>
                                    No logs yet. Click "Run Pipeline" to start.
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} style={{
                                        color: log.includes('✅') ? '#10b981' :
                                            log.includes('▶️') ? '#3b82f6' :
                                                log.includes('🚀') ? '#8b5cf6' :
                                                    log.includes('🎉') ? '#ec4899' :
                                                        '#cbd5e1',
                                        marginBottom: 4
                                    }}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Results Summary */}
                    {results && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">📊 Results Summary</span>
                                <span className="badge badge-green">Complete</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="stat-card" style={{ textAlign: 'center' }}>
                                    <div className="stat-value" style={{ color: '#10b981' }}>
                                        {results.model_accuracy * 100}%
                                    </div>
                                    <div className="stat-label">Model Accuracy</div>
                                </div>

                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 8 }}>
                                    Key Recommendations:
                                </div>
                                {results.recommendations.map((rec: string, i: number) => (
                                    <div key={i} style={{
                                        fontSize: 11, color: '#cbd5e1', lineHeight: 1.4,
                                        padding: '6px 8px', background: 'rgba(59,130,246,0.1)',
                                        borderRadius: 6, border: '1px solid rgba(59,130,246,0.2)'
                                    }}>
                                        💡 {rec}
                                    </div>
                                ))}

                                <button
                                    onClick={() => router.push('/app/reports')}
                                    className="btn btn-primary btn-sm"
                                    style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                                >
                                    📄 View Full Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
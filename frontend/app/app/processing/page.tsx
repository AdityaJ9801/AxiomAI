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

interface ProcessingOperation {
    id: string;
    type: 'filter' | 'transform' | 'aggregate' | 'merge' | 'clean';
    name: string;
    description: string;
    parameters: Record<string, any>;
    applied: boolean;
}

export default function ProcessingPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [operations, setOperations] = useState<ProcessingOperation[]>([]);
    const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            router.push('/app/upload');
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            generateSampleData(datasetInfo);
            initializeOperations(datasetInfo);
        } catch (e) {
            console.error('Failed to parse dataset info');
            router.push('/app/upload');
        }
    }, [router]);

    const generateSampleData = (datasetInfo: DatasetInfo) => {
        // Generate sample data for preview
        const sampleRows = [];
        for (let i = 0; i < 10; i++) {
            const row: Record<string, any> = {};
            datasetInfo.columns.forEach(col => {
                if (col.toLowerCase().includes('date')) {
                    row[col] = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
                } else if (col.toLowerCase().includes('revenue') || col.toLowerCase().includes('price')) {
                    row[col] = (Math.random() * 50000 + 10000).toFixed(2);
                } else if (col.toLowerCase().includes('customer') || col.toLowerCase().includes('count')) {
                    row[col] = Math.floor(Math.random() * 1000) + 50;
                } else if (col.toLowerCase().includes('region')) {
                    row[col] = ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)];
                } else if (col.toLowerCase().includes('category')) {
                    row[col] = ['Electronics', 'Clothing', 'Food', 'Books'][Math.floor(Math.random() * 4)];
                } else {
                    row[col] = `Sample ${i + 1}`;
                }
            });
            sampleRows.push(row);
        }
        setPreviewData(sampleRows);
    };

    const initializeOperations = (datasetInfo: DatasetInfo) => {
        const availableOperations: ProcessingOperation[] = [
            {
                id: 'remove_duplicates',
                type: 'clean',
                name: 'Remove Duplicates',
                description: 'Remove duplicate rows from the dataset',
                parameters: { keep: 'first' },
                applied: false
            },
            {
                id: 'handle_missing',
                type: 'clean',
                name: 'Handle Missing Values',
                description: 'Fill or remove missing values using various strategies',
                parameters: { strategy: 'median', columns: [] },
                applied: false
            },
            {
                id: 'filter_outliers',
                type: 'filter',
                name: 'Filter Outliers',
                description: 'Remove statistical outliers using IQR method',
                parameters: { method: 'iqr', threshold: 1.5 },
                applied: false
            },
            {
                id: 'normalize_text',
                type: 'transform',
                name: 'Normalize Text',
                description: 'Standardize text formatting (case, whitespace)',
                parameters: { case: 'title', trim: true },
                applied: false
            },
            {
                id: 'create_features',
                type: 'transform',
                name: 'Feature Engineering',
                description: 'Create new features from existing columns',
                parameters: { features: ['date_parts', 'ratios'] },
                applied: false
            },
            {
                id: 'aggregate_data',
                type: 'aggregate',
                name: 'Aggregate Data',
                description: 'Group and aggregate data by specified columns',
                parameters: { groupby: [], aggregations: {} },
                applied: false
            }
        ];

        setOperations(availableOperations);
    };

    const applyOperation = async (operationId: string) => {
        setProcessing(true);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        setOperations(prev =>
            prev.map(op =>
                op.id === operationId ? { ...op, applied: true } : op
            )
        );

        // Update dataset info (simulate changes)
        if (dataset) {
            let updatedDataset = { ...dataset };

            if (operationId === 'remove_duplicates') {
                updatedDataset.shape[0] = Math.floor(updatedDataset.shape[0] * 0.98); // Remove ~2%
            } else if (operationId === 'filter_outliers') {
                updatedDataset.shape[0] = Math.floor(updatedDataset.shape[0] * 0.95); // Remove ~5%
            } else if (operationId === 'create_features') {
                updatedDataset.shape[1] += 3; // Add 3 new features
                updatedDataset.columns = [...updatedDataset.columns, 'Year', 'Month', 'Revenue_Per_Customer'];
            }

            updatedDataset.quality_score = Math.min(100, updatedDataset.quality_score + 5);

            setDataset(updatedDataset);
            localStorage.setItem('axiom_dataset', JSON.stringify(updatedDataset));
        }

        setProcessing(false);
    };

    const resetOperations = () => {
        setOperations(prev => prev.map(op => ({ ...op, applied: false })));

        // Reset dataset to original state
        const originalDataset = localStorage.getItem('axiom_dataset_original');
        if (originalDataset) {
            const parsed = JSON.parse(originalDataset);
            setDataset(parsed);
            localStorage.setItem('axiom_dataset', originalDataset);
        }
    };

    const saveChanges = () => {
        // Save current state as the new baseline
        if (dataset) {
            localStorage.setItem('axiom_dataset_original', JSON.stringify(dataset));
        }
        router.push('/app/analysis');
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
                        Please upload a dataset first to access data processing tools.
                    </p>
                    <button onClick={() => router.push('/app/upload')} className="btn btn-primary">
                        Upload Dataset
                    </button>
                </div>
            </div>
        );
    }

    const appliedOperations = operations.filter(op => op.applied);

    return (
        <div style={{ maxWidth: 1400 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    ⚙️ Data Processing Tools
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>
                    Advanced data manipulation and transformation tools for {dataset.filename}
                </p>
            </div>

            {/* Dataset Overview */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-value">{dataset.shape[0].toLocaleString()}</div>
                    <div className="stat-label">Rows</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dataset.shape[1]}</div>
                    <div className="stat-label">Columns</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dataset.quality_score}%</div>
                    <div className="stat-label">Quality Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{appliedOperations.length}</div>
                    <div className="stat-label">Operations Applied</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
                {/* Main Processing Panel */}
                <div>
                    {/* Data Preview */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">👁️ Data Preview</span>
                            <span className="badge badge-blue">First 10 rows</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {dataset.columns.slice(0, 6).map(col => (
                                            <th key={col}>{col}</th>
                                        ))}
                                        {dataset.columns.length > 6 && <th>...</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i}>
                                            {dataset.columns.slice(0, 6).map(col => (
                                                <td key={col} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row[col]}
                                                </td>
                                            ))}
                                            {dataset.columns.length > 6 && <td>...</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Processing Operations */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔧 Available Operations</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {operations.map(operation => (
                                <div key={operation.id} style={{
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 12,
                                    padding: '16px',
                                    background: operation.applied ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                                    borderColor: operation.applied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: operation.applied ? 'rgba(16,185,129,0.15)' : getOperationColor(operation.type),
                                            border: `1px solid ${operation.applied ? 'rgba(16,185,129,0.3)' : getOperationBorderColor(operation.type)}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 18,
                                        }}>
                                            {getOperationIcon(operation.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>
                                                    {operation.name}
                                                </span>
                                                {operation.applied && (
                                                    <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Applied</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#8898aa' }}>
                                                {operation.description}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => applyOperation(operation.id)}
                                            disabled={operation.applied || processing}
                                            className={`btn btn-sm ${operation.applied ? 'btn-secondary' : 'btn-primary'}`}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                                    Processing...
                                                </>
                                            ) : operation.applied ? (
                                                '✓ Applied'
                                            ) : (
                                                'Apply'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div>
                    {/* Applied Operations */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">📋 Applied Operations</span>
                            <span className="badge badge-green">{appliedOperations.length}</span>
                        </div>
                        {appliedOperations.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {appliedOperations.map((op, i) => (
                                    <div key={op.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 12px', background: 'rgba(16,185,129,0.1)',
                                        borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)',
                                    }}>
                                        <span style={{ fontSize: 16 }}>{getOperationIcon(op.type)}</span>
                                        <span style={{ fontSize: 13, color: '#10b981', flex: 1 }}>{op.name}</span>
                                        <span style={{ fontSize: 11, color: '#4a5568' }}>#{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                No operations applied yet
                            </div>
                        )}
                    </div>

                    {/* Column Information */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">📊 Column Info</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                            {dataset.columns.map(col => (
                                <div key={col} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)',
                                }}>
                                    <span style={{ fontSize: 13, color: '#f0f6ff', fontWeight: 500 }}>{col}</span>
                                    <span style={{
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: getDataTypeColor(dataset.dtypes[col]),
                                        color: '#fff'
                                    }}>
                                        {getDataTypeLabel(dataset.dtypes[col])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🚀 Actions</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button
                                onClick={saveChanges}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                💾 Save & Continue to Analysis
                            </button>
                            <button
                                onClick={resetOperations}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                disabled={appliedOperations.length === 0}
                            >
                                🔄 Reset All Operations
                            </button>
                            <button
                                onClick={() => router.push('/app/quality')}
                                className="btn btn-ghost"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                🧹 Back to Quality Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getOperationIcon(type: string) {
    switch (type) {
        case 'clean': return '🧹';
        case 'filter': return '🔍';
        case 'transform': return '🔄';
        case 'aggregate': return '📊';
        case 'merge': return '🔗';
        default: return '⚙️';
    }
}

function getOperationColor(type: string) {
    switch (type) {
        case 'clean': return 'rgba(16,185,129,0.1)';
        case 'filter': return 'rgba(59,130,246,0.1)';
        case 'transform': return 'rgba(139,92,246,0.1)';
        case 'aggregate': return 'rgba(245,158,11,0.1)';
        case 'merge': return 'rgba(236,72,153,0.1)';
        default: return 'rgba(100,116,139,0.1)';
    }
}

function getOperationBorderColor(type: string) {
    switch (type) {
        case 'clean': return 'rgba(16,185,129,0.3)';
        case 'filter': return 'rgba(59,130,246,0.3)';
        case 'transform': return 'rgba(139,92,246,0.3)';
        case 'aggregate': return 'rgba(245,158,11,0.3)';
        case 'merge': return 'rgba(236,72,153,0.3)';
        default: return 'rgba(100,116,139,0.3)';
    }
}

function getDataTypeColor(dtype: string) {
    if (dtype?.includes('int')) return '#3b82f6';
    if (dtype?.includes('float')) return '#10b981';
    if (dtype?.includes('datetime')) return '#8b5cf6';
    if (dtype?.includes('object')) return '#f59e0b';
    return '#64748b';
}

function getDataTypeLabel(dtype: string) {
    if (dtype?.includes('int')) return 'INT';
    if (dtype?.includes('float')) return 'FLOAT';
    if (dtype?.includes('datetime')) return 'DATE';
    if (dtype?.includes('object')) return 'TEXT';
    return 'UNKNOWN';
}
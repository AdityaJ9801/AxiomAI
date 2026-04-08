'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            setError('Please upload a CSV, Excel, or JSON file');
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            setError('File size must be less than 100MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Demo mode: simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time

            // Store mock dataset info in localStorage for demo
            const mockDatasetInfo = {
                filename: file.name,
                size: file.size,
                columns: ['Date', 'Revenue', 'Customers', 'Region', 'Product_Category', 'Sales_Rep'],
                shape: [1250, 6],
                quality_score: 94,
                dtypes: {
                    'Date': 'datetime64',
                    'Revenue': 'float64',
                    'Customers': 'int64',
                    'Region': 'object',
                    'Product_Category': 'object',
                    'Sales_Rep': 'object'
                },
                upload_time: new Date().toISOString()
            };

            localStorage.setItem('axiom_dataset', JSON.stringify(mockDatasetInfo));

            // Show success message briefly then redirect to quality check
            setTimeout(() => {
                router.push('/app/quality');
            }, 500);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [router]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const loadSampleDataset = useCallback(async (sample: any) => {
        setUploading(true);
        setError('');

        try {
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create mock dataset info based on sample
            const mockDatasetInfo = {
                filename: `${sample.name.toLowerCase().replace(/\s+/g, '_')}.csv`,
                size: parseFloat(sample.size) * 1024, // Convert KB to bytes
                columns: sample.columns,
                shape: [Math.floor(Math.random() * 1000) + 500, sample.columns.length],
                quality_score: Math.floor(Math.random() * 20) + 80, // 80-100%
                dtypes: sample.columns.reduce((acc: any, col: string) => {
                    // Assign realistic data types
                    if (col.toLowerCase().includes('date')) acc[col] = 'datetime64';
                    else if (col.toLowerCase().includes('id')) acc[col] = 'int64';
                    else if (['Revenue', 'GDP', 'Inflation', 'Open', 'High', 'Low', 'Close', 'Volume', 'Age', 'Income', 'Purchases'].includes(col)) acc[col] = 'float64';
                    else if (['Customers', 'Unemployment', 'Interest_Rate'].includes(col)) acc[col] = 'int64';
                    else acc[col] = 'object';
                    return acc;
                }, {}),
                upload_time: new Date().toISOString()
            };

            localStorage.setItem('axiom_dataset', JSON.stringify(mockDatasetInfo));

            // Redirect to quality check first
            setTimeout(() => {
                router.push('/app/quality');
            }, 500);

        } catch (err) {
            setError('Failed to load sample dataset. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [router]);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    📁 Upload Dataset
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>
                    Upload your data file to begin analysis. Supports CSV, Excel, and JSON formats.
                </p>
            </div>

            {/* Upload Area */}
            <div
                className="card"
                style={{
                    padding: '60px 40px',
                    textAlign: 'center',
                    border: dragActive ? '2px dashed #3b82f6' : '2px dashed rgba(255,255,255,0.1)',
                    background: dragActive ? 'rgba(59,130,246,0.05)' : 'rgba(13,21,38,0.6)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                />

                {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: '#f0f6ff', marginBottom: 8 }}>
                                Uploading your dataset...
                            </div>
                            <div style={{ fontSize: 14, color: '#8898aa' }}>
                                This may take a few moments
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 48, marginBottom: 20 }}>📁</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#f0f6ff' }}>
                            Drop your file here or click to browse
                        </h3>
                        <p style={{ fontSize: 14, color: '#8898aa', marginBottom: 24 }}>
                            Supports CSV, Excel (.xlsx, .xls), and JSON files up to 100MB
                        </p>
                        <button className="btn btn-primary">
                            Choose File
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    marginTop: 20,
                    padding: '16px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 12,
                    color: '#f87171',
                    fontSize: 14,
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Format Guide */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <span className="card-title">📋 Format Requirements</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { format: 'CSV', desc: 'Comma-separated values with headers in first row', icon: '📄' },
                        { format: 'Excel', desc: 'XLSX or XLS files with data in first sheet', icon: '📊' },
                        { format: 'JSON', desc: 'Array of objects or nested structure', icon: '🔧' },
                    ].map((fmt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 20 }}>{fmt.icon}</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff' }}>{fmt.format}</div>
                                <div style={{ fontSize: 12, color: '#8898aa' }}>{fmt.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
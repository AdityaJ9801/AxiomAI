'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveChart } from '../dashboard/components/Charts';

interface DatasetInfo {
    filename: string;
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes: Record<string, string>;
}

interface ChartConfig {
    id: string;
    type: 'line' | 'bar' | 'scatter' | 'pie';
    title: string;
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'mean' | 'count' | 'max' | 'min';
    data?: any;
}

export default function VisualizationsPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [charts, setCharts] = useState<ChartConfig[]>([]);
    const [selectedChart, setSelectedChart] = useState<string>('');
    const [chartConfig, setChartConfig] = useState<Partial<ChartConfig>>({
        type: 'line',
        title: '',
        xAxis: '',
        yAxis: '',
        aggregation: 'sum'
    });
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            router.push('/app/upload');
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            generateSampleCharts(datasetInfo);
        } catch (e) {
            console.error('Failed to parse dataset info');
            router.push('/app/upload');
        }
    }, [router]);

    const generateSampleCharts = (datasetInfo: DatasetInfo) => {
        const sampleCharts: ChartConfig[] = [
            {
                id: 'revenue_trend',
                type: 'line',
                title: 'Revenue Trend Over Time',
                xAxis: 'Date',
                yAxis: 'Revenue',
                data: generateMockData('line', 'Date', 'Revenue')
            },
            {
                id: 'regional_performance',
                type: 'bar',
                title: 'Revenue by Region',
                xAxis: 'Region',
                yAxis: 'Revenue',
                aggregation: 'sum',
                data: generateMockData('bar', 'Region', 'Revenue')
            },
            {
                id: 'customer_revenue_correlation',
                type: 'scatter',
                title: 'Customer Count vs Revenue',
                xAxis: 'Customers',
                yAxis: 'Revenue',
                data: generateMockData('scatter', 'Customers', 'Revenue')
            },
            {
                id: 'category_distribution',
                type: 'pie',
                title: 'Revenue Distribution by Category',
                groupBy: 'Product_Category',
                yAxis: 'Revenue',
                data: generateMockData('pie', 'Product_Category', 'Revenue')
            }
        ];

        setCharts(sampleCharts);
    };

    const generateMockData = (type: string, xAxis: string, yAxis: string) => {
        switch (type) {
            case 'line':
                return {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: yAxis,
                        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50000) + 30000),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                };

            case 'bar':
                return {
                    labels: ['North', 'South', 'East', 'West'],
                    datasets: [{
                        label: yAxis,
                        data: [180000, 145000, 120000, 95000],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    }]
                };

            case 'scatter':
                return {
                    datasets: [{
                        label: `${xAxis} vs ${yAxis}`,
                        data: Array.from({ length: 50 }, () => ({
                            x: Math.floor(Math.random() * 500) + 100,
                            y: Math.floor(Math.random() * 80000) + 20000
                        })),
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6'
                    }]
                };

            case 'pie':
                return {
                    labels: ['Electronics', 'Clothing', 'Food', 'Books'],
                    datasets: [{
                        data: [35, 28, 22, 15],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    }]
                };

            default:
                return null;
        }
    };

    const createChart = async () => {
        if (!chartConfig.type || !chartConfig.title) return;

        setGenerating(true);

        // Simulate chart generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newChart: ChartConfig = {
            id: `chart_${Date.now()}`,
            type: chartConfig.type,
            title: chartConfig.title,
            xAxis: chartConfig.xAxis,
            yAxis: chartConfig.yAxis,
            groupBy: chartConfig.groupBy,
            aggregation: chartConfig.aggregation,
            data: generateMockData(chartConfig.type, chartConfig.xAxis || '', chartConfig.yAxis || '')
        };

        setCharts(prev => [...prev, newChart]);
        setChartConfig({
            type: 'line',
            title: '',
            xAxis: '',
            yAxis: '',
            aggregation: 'sum'
        });
        setGenerating(false);
    };

    const deleteChart = (chartId: string) => {
        setCharts(prev => prev.filter(c => c.id !== chartId));
        if (selectedChart === chartId) {
            setSelectedChart('');
        }
    };

    const exportChart = (chartId: string, format: 'png' | 'svg' | 'pdf') => {
        const chart = charts.find(c => c.id === chartId);
        if (!chart) return;

        // Simulate export
        alert(`Exporting "${chart.title}" as ${format.toUpperCase()}...`);
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
                        Please upload a dataset first to create visualizations.
                    </p>
                    <button onClick={() => router.push('/app/upload')} className="btn btn-primary">
                        Upload Dataset
                    </button>
                </div>
            </div>
        );
    }

    const numericColumns = dataset.columns.filter(col =>
        dataset.dtypes[col]?.includes('int') || dataset.dtypes[col]?.includes('float')
    );
    const categoricalColumns = dataset.columns.filter(col =>
        dataset.dtypes[col]?.includes('object') || col.toLowerCase().includes('category')
    );

    return (
        <div style={{ maxWidth: 1400 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
                    📈 Data Visualizations
                </h1>
                <p style={{ color: '#8898aa', fontSize: 15 }}>
                    Create interactive charts and visualizations from {dataset.filename}
                </p>
            </div>

            {/* Visualization Overview */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-value">{charts.length}</div>
                    <div className="stat-label">Charts Created</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{numericColumns.length}</div>
                    <div className="stat-label">Numeric Columns</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{categoricalColumns.length}</div>
                    <div className="stat-label">Categorical Columns</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">PNG, SVG</div>
                    <div className="stat-label">Export Formats</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Chart Builder */}
                <div>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">🎨 Chart Builder</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="input-group">
                                <label className="input-label">Chart Type</label>
                                <select
                                    className="input"
                                    value={chartConfig.type}
                                    onChange={e => setChartConfig(prev => ({ ...prev, type: e.target.value as any }))}
                                >
                                    <option value="line">📈 Line Chart</option>
                                    <option value="bar">📊 Bar Chart</option>
                                    <option value="scatter">🔵 Scatter Plot</option>
                                    <option value="pie">🥧 Pie Chart</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Chart Title</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Enter chart title..."
                                    value={chartConfig.title}
                                    onChange={e => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            {chartConfig.type !== 'pie' && (
                                <div className="input-group">
                                    <label className="input-label">X-Axis</label>
                                    <select
                                        className="input"
                                        value={chartConfig.xAxis}
                                        onChange={e => setChartConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                                    >
                                        <option value="">Select column...</option>
                                        {dataset.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">
                                    {chartConfig.type === 'pie' ? 'Value Column' : 'Y-Axis'}
                                </label>
                                <select
                                    className="input"
                                    value={chartConfig.yAxis}
                                    onChange={e => setChartConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                                >
                                    <option value="">Select column...</option>
                                    {numericColumns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>

                            {(chartConfig.type === 'bar' || chartConfig.type === 'pie') && (
                                <div className="input-group">
                                    <label className="input-label">Group By</label>
                                    <select
                                        className="input"
                                        value={chartConfig.groupBy}
                                        onChange={e => setChartConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                                    >
                                        <option value="">Select column...</option>
                                        {categoricalColumns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {chartConfig.type === 'bar' && (
                                <div className="input-group">
                                    <label className="input-label">Aggregation</label>
                                    <select
                                        className="input"
                                        value={chartConfig.aggregation}
                                        onChange={e => setChartConfig(prev => ({ ...prev, aggregation: e.target.value as any }))}
                                    >
                                        <option value="sum">Sum</option>
                                        <option value="mean">Average</option>
                                        <option value="count">Count</option>
                                        <option value="max">Maximum</option>
                                        <option value="min">Minimum</option>
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={createChart}
                                disabled={generating || !chartConfig.title || !chartConfig.yAxis}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {generating ? (
                                    <>
                                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                        Creating...
                                    </>
                                ) : (
                                    '🎨 Create Chart'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Chart List */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📋 Chart Library</span>
                            <span className="badge badge-blue">{charts.length}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                            {charts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                                    No charts created yet
                                </div>
                            ) : (
                                charts.map(chart => (
                                    <div
                                        key={chart.id}
                                        style={{
                                            padding: '12px',
                                            borderRadius: 8,
                                            background: selectedChart === chart.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedChart === chart.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setSelectedChart(chart.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 16 }}>
                                                {chart.type === 'line' ? '📈' :
                                                    chart.type === 'bar' ? '📊' :
                                                        chart.type === 'scatter' ? '🔵' :
                                                            chart.type === 'pie' ? '🥧' : '📊'}
                                            </span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', flex: 1 }}>
                                                {chart.title}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChart(chart.id);
                                                }}
                                                style={{
                                                    background: 'none', border: 'none', color: '#ef4444',
                                                    cursor: 'pointer', fontSize: 12, padding: 4
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div style={{ fontSize: 11, color: '#8898aa' }}>
                                            {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} • {chart.xAxis || chart.groupBy} vs {chart.yAxis}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Display */}
                <div>
                    {selectedChart ? (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">
                                    {charts.find(c => c.id === selectedChart)?.title}
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => exportChart(selectedChart, 'png')}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        📷 PNG
                                    </button>
                                    <button
                                        onClick={() => exportChart(selectedChart, 'svg')}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        🎨 SVG
                                    </button>
                                </div>
                            </div>
                            <div style={{ height: 400, padding: 20 }}>
                                {(() => {
                                    const chart = charts.find(c => c.id === selectedChart);
                                    if (!chart || !chart.data) return null;

                                    return (
                                        <InteractiveChart
                                            type={chart.type}
                                            data={chart.data}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        labels: { color: '#cbd5e1' }
                                                    }
                                                },
                                                scales: chart.type !== 'pie' ? {
                                                    x: {
                                                        ticks: { color: '#8898aa' },
                                                        grid: { color: 'rgba(255,255,255,0.1)' }
                                                    },
                                                    y: {
                                                        ticks: { color: '#8898aa' },
                                                        grid: { color: 'rgba(255,255,255,0.1)' }
                                                    }
                                                } : undefined
                                            }}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            height: 500, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexDirection: 'column', gap: 16,
                            background: 'rgba(13,21,38,0.5)', border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: 16, color: '#4a5568',
                        }}>
                            <div style={{ fontSize: 64 }}>📈</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Chart Selected</div>
                                <div style={{ fontSize: 14 }}>Create a new chart or select one from the library</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
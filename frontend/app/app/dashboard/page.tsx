'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveChart } from './components/Charts';

interface DatasetInfo {
    filename: string;
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes: Record<string, string>;
}

interface KPI {
    id: string;
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    icon: string;
    color: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('12M');
    const [selectedRegion, setSelectedRegion] = useState('All');

    useEffect(() => {
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (!storedDataset) {
            router.push('/app/upload');
            return;
        }

        try {
            const datasetInfo = JSON.parse(storedDataset);
            setDataset(datasetInfo);
            generateDashboardData();
        } catch (e) {
            console.error('Failed to parse dataset info');
            router.push('/app/upload');
        }
    }, [router]);

    const generateDashboardData = () => {
        setLoading(true);

        setTimeout(() => {
            const mockKPIs: KPI[] = [
                {
                    id: 'total_revenue',
                    title: 'Total Revenue',
                    value: '$2.4M',
                    change: 12.5,
                    trend: 'up',
                    icon: '💰',
                    color: '#10b981'
                },
                {
                    id: 'customers',
                    title: 'Active Customers',
                    value: '15,847',
                    change: 8.2,
                    trend: 'up',
                    icon: '👥',
                    color: '#3b82f6'
                },
                {
                    id: 'avg_order',
                    title: 'Avg Order Value',
                    value: '$156',
                    change: -2.1,
                    trend: 'down',
                    icon: '🛒',
                    color: '#f59e0b'
                },
                {
                    id: 'conversion',
                    title: 'Conversion Rate',
                    value: '3.2%',
                    change: 0.5,
                    trend: 'up',
                    icon: '📈',
                    color: '#8b5cf6'
                }
            ];

            setKpis(mockKPIs);
            setLoading(false);
        }, 1000);
    };

    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Revenue',
                data: [180000, 195000, 210000, 185000, 220000, 235000, 250000, 240000, 265000, 280000, 295000, 310000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Target',
                data: [200000, 200000, 200000, 200000, 220000, 220000, 240000, 240000, 260000, 260000, 280000, 280000],
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4
            }
        ]
    };

    const regionalData = {
        labels: ['North', 'South', 'East', 'West'],
        datasets: [{
            label: 'Revenue by Region',
            data: [850000, 620000, 480000, 390000],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    };

    const customerSegmentData = {
        labels: ['Enterprise', 'SMB', 'Startup', 'Individual'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 0
        }]
    };

    const performanceData = {
        datasets: [{
            label: 'Customer Count vs Revenue',
            data: Array.from({ length: 50 }, () => ({
                x: Math.floor(Math.random() * 500) + 100,
                y: Math.floor(Math.random() * 80000) + 20000
            })),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6'
        }]
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
                        Please upload a dataset first to view the dashboard.
                    </p>
                    <button onClick={() => router.push('/app/upload')} className="btn btn-primary">
                        Upload Dataset
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1600 }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 20, padding: '24px 28px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16,
            }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
                        📊 Power BI Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: '#8898aa' }}>
                        Interactive analytics workspace for {dataset.filename} • {dataset.shape[0].toLocaleString()} records
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select className="input" style={{ width: 120, fontSize: 12 }} value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)}>
                        <option value="1M">Last Month</option>
                        <option value="3M">Last 3 Months</option>
                        <option value="6M">Last 6 Months</option>
                        <option value="12M">Last 12 Months</option>
                        <option value="YTD">Year to Date</option>
                    </select>
                    <select className="input" style={{ width: 120, fontSize: 12 }} value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                        <option value="All">All Regions</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>
                    <button className="btn btn-primary btn-sm">🔄 Refresh Data</button>
                </div>
            </div>

            <div className="grid-4" style={{ marginBottom: 28 }}>
                {kpis.map(kpi => (
                    <div key={kpi.id} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: 60, height: 60,
                            background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}10)`,
                            borderRadius: '0 0 0 60px'
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `${kpi.color}18`, border: `1px solid ${kpi.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                            }}>{kpi.icon}</div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 8px', borderRadius: 12,
                                background: kpi.trend === 'up' ? 'rgba(16,185,129,0.15)' : kpi.trend === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)',
                                border: `1px solid ${kpi.trend === 'up' ? 'rgba(16,185,129,0.3)' : kpi.trend === 'down' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.3)'}`
                            }}>
                                <span style={{ fontSize: 10 }}>{kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '➡️'}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : '#64748b' }}>
                                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                                </span>
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: kpi.color }}>{kpi.value}</div>
                        <div className="stat-label">{kpi.title}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📈 Revenue Trend</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span className="badge badge-blue">Actual</span>
                            <span className="badge badge-red">Target</span>
                        </div>
                    </div>
                    <div style={{ height: 300, padding: '0 16px 16px' }}>
                        <InteractiveChart type="line" data={revenueData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: '#8898aa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: { ticks: { color: '#8898aa', callback: (value: any) => '$' + (Number(value) / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                            }
                        }} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🗺️ Regional Performance</span>
                    </div>
                    <div style={{ height: 300, padding: '0 16px 16px' }}>
                        <InteractiveChart type="bar" data={regionalData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: '#8898aa' }, grid: { display: false } },
                                y: { ticks: { color: '#8898aa', callback: (value: any) => '$' + (Number(value) / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">👥 Customer Segments</span>
                    </div>
                    <div style={{ height: 250, padding: '0 16px 16px' }}>
                        <InteractiveChart type="pie" data={customerSegmentData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 }, padding: 15 } } }
                        }} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🔵 Performance Correlation</span>
                    </div>
                    <div style={{ height: 250, padding: '0 16px 16px' }}>
                        <InteractiveChart type="scatter" data={performanceData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { title: { display: true, text: 'Customers', color: '#8898aa' }, ticks: { color: '#8898aa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: { title: { display: true, text: 'Revenue', color: '#8898aa' }, ticks: { color: '#8898aa', callback: (value: any) => '$' + (Number(value) / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                            }
                        }} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">💡 Quick Insights</span>
                    </div>
                    <div style={{ padding: '0 16px 16px', height: 250, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { icon: '📈', text: 'Revenue up 12.5% vs last period', color: '#10b981' },
                                { icon: '🎯', text: 'Q4 target exceeded by 8%', color: '#3b82f6' },
                                { icon: '🏆', text: 'North region leads performance', color: '#f59e0b' },
                                { icon: '⚠️', text: 'West region needs attention', color: '#ef4444' },
                                { icon: '👥', text: 'Customer growth accelerating', color: '#8b5cf6' },
                                { icon: '💰', text: 'AOV slightly declining', color: '#f59e0b' }
                            ].map((insight, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px', borderRadius: 8,
                                    background: `${insight.color}10`,
                                    border: `1px solid ${insight.color}20`
                                }}>
                                    <span style={{ fontSize: 16 }}>{insight.icon}</span>
                                    <span style={{ fontSize: 12, color: '#cbd5e1', flex: 1 }}>{insight.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
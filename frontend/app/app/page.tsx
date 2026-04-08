'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataInsights } from './dashboard/components/DataInsights';

interface DatasetInfo {
    columns: string[];
    shape: [number, number];
    quality_score: number;
    dtypes?: Record<string, string>;
}

function StatCard({ icon, value, label, sub, color }: { icon: string; value: string; label: string; sub?: string; color: string }) {
    return (
        <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{icon}</div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

function RecentActivity() {
    const activities = [
        { icon: '📁', text: 'Dataset uploaded', time: '2m ago', color: '#3b82f6' },
        { icon: '🧹', text: 'Data cleaned — 97% quality', time: '5m ago', color: '#10b981' },
        { icon: '📊', text: 'Descriptive analysis complete', time: '12m ago', color: '#8b5cf6' },
        { icon: '🤖', text: 'AI insights generated', time: '18m ago', color: '#ec4899' },
        { icon: '📄', text: 'Report exported (PDF)', time: '25m ago', color: '#f59e0b' },
    ];

    return (
        <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
                <span className="card-title">Recent Activity</span>
                <span className="badge badge-blue">Live</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activities.map((a, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 0', borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: `${a.color}15`, border: `1px solid ${a.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
                        }}>{a.icon}</div>
                        <span style={{ fontSize: 13, color: '#cbd5e1', flex: 1 }}>{a.text}</span>
                        <span style={{ fontSize: 11, color: '#4a5568', whiteSpace: 'nowrap' }}>{a.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuickActions() {
    const actions = [
        { href: '/app/upload', icon: '📁', label: 'Upload Dataset', desc: 'CSV, Excel, JSON', color: '#3b82f6' },
        { href: '/app/dashboard', icon: '📊', label: 'Power BI Dashboard', desc: 'Interactive analytics', color: '#667eea' },
        { href: '/app/visualizations', icon: '📈', label: 'Create Charts', desc: 'Custom visualizations', color: '#8b5cf6' },
        { href: '/app/quality', icon: '🧹', label: 'Check Quality', desc: 'Inspect & clean', color: '#10b981' },
        { href: '/app/analysis', icon: '🔬', label: 'Run Analysis', desc: 'EDA & Regression', color: '#f59e0b' },
        { href: '/app/agent', icon: '🤖', label: 'AI Agent', desc: 'Auto-pilot mode', color: '#ec4899' },
    ];

    return (
        <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="grid-2" style={{ gap: 10 }}>
                {actions.slice(0, 6).map(a => (
                    <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '16px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            transition: 'all 0.2s', cursor: 'pointer',
                        }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.background = `${a.color}10`;
                                el.style.borderColor = `${a.color}30`;
                                el.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.background = 'rgba(255,255,255,0.03)';
                                el.style.borderColor = 'rgba(255,255,255,0.06)';
                                el.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ fontSize: 22, marginBottom: 8 }}>{a.icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f6ff', marginBottom: 3 }}>{a.label}</div>
                            <div style={{ fontSize: 11, color: '#4a5568' }}>{a.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Featured Dashboard Link */}
            <div style={{ marginTop: 16 }}>
                <Link href="/app/dashboard" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '20px', borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08))',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        transition: 'all 0.3s', cursor: 'pointer',
                        textAlign: 'center'
                    }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = 'translateY(-3px)';
                            el.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 12 }}>🚀</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#667eea', marginBottom: 6 }}>Launch Power BI Dashboard</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Complete analytics workspace with AI assistant</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for demo dataset in localStorage first
        const storedDataset = localStorage.getItem('axiom_dataset');
        if (storedDataset) {
            try {
                const dataset = JSON.parse(storedDataset);
                setDatasetInfo(dataset);
                setLoading(false);
                return;
            } catch (e) {
                console.warn('Failed to parse stored dataset');
            }
        }

        // Fallback to API call (will fail in demo mode)
        fetch('http://localhost:8000/api/dataset/info')
            .then(async r => {
                if (!r.ok) throw new Error('No dataset');
                return r.json();
            })
            .then(d => { setDatasetInfo(d.shape ? d : null); setLoading(false); })
            .catch(() => { setDatasetInfo(null); setLoading(false); });
    }, []);

    return (
        <div style={{ maxWidth: 1400 }}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 20, padding: '28px 32px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16,
            }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
                        Welcome back! 👋
                    </h1>
                    <p style={{ fontSize: 14, color: '#8898aa' }}>
                        Your agentic data analysis workspace is ready.
                        {datasetInfo && datasetInfo.shape ? ` Active dataset: ${datasetInfo.shape[0].toLocaleString()} rows × ${datasetInfo.shape[1]} columns.` : ' Upload a dataset to get started.'}
                    </p>
                </div>
                <Link href="/app/agent" className="btn btn-primary" style={{ fontSize: 14 }}>
                    🤖 Run Full AI Agent Pipeline →
                </Link>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard
                    icon="📊" label="Dataset Rows" color="#3b82f6"
                    value={loading ? '—' : (datasetInfo && datasetInfo.shape) ? datasetInfo.shape[0].toLocaleString() : 'No data'}
                    sub={(datasetInfo && datasetInfo.shape) ? `${datasetInfo.shape[1]} columns` : 'Upload to begin'}
                />
                <StatCard
                    icon="✅" label="Quality Score" color="#10b981"
                    value={loading ? '—' : (datasetInfo && datasetInfo.quality_score !== undefined) ? `${datasetInfo.quality_score}%` : '—'}
                    sub={(datasetInfo && datasetInfo.quality_score !== undefined) ? (datasetInfo.quality_score > 80 ? 'Excellent' : datasetInfo.quality_score > 60 ? 'Good' : 'Needs cleaning') : 'No dataset loaded'}
                />
                <StatCard icon="🧠" label="AI Analyses Run" color="#8b5cf6" value="0" sub="This session" />
                <StatCard icon="📄" label="Reports Generated" color="#f59e0b" value="0" sub="Available to export" />
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
                {/* Main panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <QuickActions />

                    {/* Pipeline guide */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🤖 Agentic Pipeline Guide</span>
                            <span className="badge badge-purple" style={{ fontSize: 10 }}>Recommended</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { n: 1, label: 'Upload Dataset', href: '/app/upload', done: !!(datasetInfo && datasetInfo.shape) },
                                { n: 2, label: 'Launch Power BI Dashboard', href: '/app/dashboard', done: false },
                                { n: 3, label: 'Create Custom Visualizations', href: '/app/visualizations', done: false },
                                { n: 4, label: 'Review Data Quality', href: '/app/quality', done: false },
                                { n: 5, label: 'Run Descriptive Analysis', href: '/app/analysis', done: false },
                                { n: 6, label: 'Launch AI Agent for insights', href: '/app/agent', done: false },
                                { n: 7, label: 'Export Comprehensive Report', href: '/app/reports', done: false },
                            ].map((step, i) => (
                                <Link key={i} href={step.href} style={{ textDecoration: 'none' }}>
                                    <div className="pipeline-step" style={{ cursor: 'pointer' }}>
                                        <div className="step-icon" style={{
                                            background: step.done ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)',
                                            border: `1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'}`,
                                            fontSize: 13, fontWeight: 700,
                                            color: step.done ? '#10b981' : '#60a5fa',
                                        }}>
                                            {step.done ? '✓' : step.n}
                                        </div>
                                        <span style={{ fontSize: 13, color: step.done ? '#10b981' : '#cbd5e1', fontWeight: step.done ? 600 : 400 }}>
                                            {step.label}
                                        </span>
                                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4a5568' }}>→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <DataInsights />
                    <RecentActivity />

                    {/* System status */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">System Status</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Backend API', endpoint: 'http://localhost:8000/api/health' },
                                { label: 'Analysis Engine', endpoint: 'http://localhost:8000/api/capabilities' },
                            ].map((s, i) => (
                                <StatusRow key={i} label={s.label} endpoint={s.endpoint} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusRow({ label, endpoint }: { label: string; endpoint: string }) {
    const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
    useEffect(() => {
        fetch(endpoint).then(r => setStatus(r.ok ? 'ok' : 'fail')).catch(() => setStatus('fail'));
    }, [endpoint]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: status === 'ok' ? '#10b981' : status === 'fail' ? '#ef4444' : '#f59e0b',
            }} />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: status === 'ok' ? '#10b981' : status === 'fail' ? '#ef4444' : '#f59e0b' }}>
                {status === 'ok' ? 'Online' : status === 'fail' ? 'Offline' : 'Checking...'}
            </span>
        </div>
    );
}
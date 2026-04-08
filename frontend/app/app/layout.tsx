'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/app' },
    { id: 'upload', label: 'Upload Data', icon: '📁', href: '/app/upload' },
    { id: 'quality', label: 'Data Quality', icon: '🧹', href: '/app/quality' },
    { id: 'processing', label: 'Data Processing', icon: '⚙️', href: '/app/processing' },
    { id: 'analysis', label: 'Analysis', icon: '📊', href: '/app/analysis' },
    { id: 'agent', label: 'AI Agent', icon: '🤖', href: '/app/agent' },
    { id: 'reports', label: 'Reports', icon: '📄', href: '/app/reports' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        const stored = localStorage.getItem('axiom_user');
        if (!stored) { router.push('/login'); return; }
        setUser(JSON.parse(stored));

        // Check backend health
        fetch('http://localhost:8000/api/health')
            .then(r => r.ok ? setBackendStatus('online') : setBackendStatus('offline'))
            .catch(() => setBackendStatus('offline'));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('axiom_user');
        router.push('/');
    };

    const activeId = NAV_ITEMS.find(n => n.href === pathname)?.id || 'dashboard';

    if (!user) {
        return (
            <div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            </div>
        );
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 17, boxShadow: '0 0 15px rgba(59,130,246,0.3)',
                        }}>⬡</div>
                        <span style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#f0f6ff' }}>
                            AXIOM <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '16px 12px', flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#4a5568', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 8 }}>
                        Workspace
                    </div>
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`nav-item ${activeId === item.id ? 'active' : ''}`}
                            style={{ marginBottom: 2 }}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon" style={{ fontSize: 16 }}>{item.icon}</span>
                            {item.label}
                            {item.id === 'agent' && (
                                <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px' }}>AI</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Backend Status */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: backendStatus === 'online' ? '#10b981' : backendStatus === 'offline' ? '#ef4444' : '#f59e0b',
                            boxShadow: `0 0 8px ${backendStatus === 'online' ? '#10b981' : backendStatus === 'offline' ? '#ef4444' : '#f59e0b'}`,
                            animation: backendStatus === 'checking' ? 'pulse-glow 1.5s infinite' : 'none',
                        }} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                            API: {backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Offline' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                {/* User Profile */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        style={{ display: 'none', background: 'none', border: 'none', color: '#8898aa', cursor: 'pointer', fontSize: 20, marginRight: 16 }}
                        id="sidebar-toggle"
                    >
                        ☰
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>
                            {NAV_ITEMS.find(n => n.id === activeId)?.icon}{' '}
                            {NAV_ITEMS.find(n => n.id === activeId)?.label}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link href="/app/upload" className="btn btn-primary btn-sm">
                            + New Analysis
                        </Link>
                        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            API Docs ↗
                        </a>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 99,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    }}
                />
            )}
        </div>
    );
}
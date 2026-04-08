'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<'signin' | 'signup'>('signin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Demo user data
    const demoUser = {
        name: 'Demo User',
        email: 'demo@axiom.ai',
        password: 'demo123'
    };

    // Auto-fill demo user data on component mount
    useEffect(() => {
        setFormData({
            name: demoUser.name,
            email: demoUser.email,
            password: demoUser.password,
            confirmPassword: demoUser.password,
        });
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'signup') setTab('signup');
    }, [searchParams]);

    const loginWithDemo = () => {
        setFormData({
            name: demoUser.name,
            email: demoUser.email,
            password: demoUser.password,
            confirmPassword: demoUser.password,
        });
        // Auto-submit with demo credentials
        setTimeout(() => {
            const userData = {
                name: demoUser.name,
                email: demoUser.email,
            };
            localStorage.setItem('axiom_user', JSON.stringify(userData));
            router.push('/app');
        }, 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (tab === 'signup') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (formData.password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store user data (in real app, this would come from API)
            const userData = {
                name: formData.name || formData.email.split('@')[0],
                email: formData.email,
            };

            localStorage.setItem('axiom_user', JSON.stringify(userData));
            router.push('/app');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #050810 0%, #0a1628 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background effects */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                filter: 'blur(40px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />

            <div style={{
                width: '100%',
                maxWidth: 420,
                position: 'relative',
                zIndex: 2,
            }}>
                {/* Logo */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 40,
                }}>
                    <Link href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 12,
                        textDecoration: 'none',
                        marginBottom: 16,
                    }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            fontWeight: 800,
                            color: 'white',
                            boxShadow: '0 0 30px rgba(59,130,246,0.4)',
                        }}>
                            ⬡
                        </div>
                        <span style={{
                            fontSize: 24,
                            fontWeight: 800,
                            fontFamily: 'Space Grotesk, sans-serif',
                            color: '#f0f6ff',
                        }}>
                            AXIOM <span className="gradient-text">AI</span>
                        </span>
                    </Link>
                    <p style={{
                        fontSize: 16,
                        color: '#8898aa',
                        margin: 0,
                    }}>
                        {tab === 'signin' ? 'Welcome back to your analysis workspace' : 'Start your data analysis journey'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="glass-card" style={{
                    padding: '32px',
                    background: 'rgba(13,21,38,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Tab Switcher */}
                    <div className="tabs-list" style={{ marginBottom: 32 }}>
                        <button
                            className={`tab-trigger ${tab === 'signin' ? 'active' : ''}`}
                            onClick={() => setTab('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            className={`tab-trigger ${tab === 'signup' ? 'active' : ''}`}
                            onClick={() => setTab('signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {tab === 'signup' && (
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder={tab === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />
                        </div>

                        {tab === 'signup' && (
                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8,
                                color: '#f87171',
                                fontSize: 14,
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '14px',
                                fontSize: 16,
                                marginTop: 8,
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} />
                                    {tab === 'signin' ? 'Signing In...' : 'Creating Account...'}
                                </>
                            ) : (
                                <>
                                    {tab === 'signin' ? '🚀 Sign In to Dashboard' : '✨ Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Login Button */}
                    <div style={{ marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={loginWithDemo}
                            className="btn btn-secondary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '12px',
                                fontSize: 14,
                                background: 'rgba(139,92,246,0.1)',
                                borderColor: 'rgba(139,92,246,0.3)',
                                color: '#a78bfa',
                            }}
                        >
                            🎯 Quick Demo Login
                        </button>
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: 24,
                        paddingTop: 24,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                            {tab === 'signin' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#60a5fa',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                {tab === 'signin' ? 'Sign up for free' : 'Sign in instead'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Demo Notice */}
                <div style={{
                    marginTop: 24,
                    padding: '20px',
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                    <p style={{ fontSize: 14, color: '#a78bfa', margin: 0, fontWeight: 600 }}>
                        <strong>Demo Mode Active:</strong> Click "Quick Demo Login" or use any email/password to access the platform
                    </p>
                    <p style={{ fontSize: 12, color: '#8b5cf6', margin: '8px 0 0 0' }}>
                        Demo credentials: demo@axiom.ai / demo123
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #050810 0%, #0a1628 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
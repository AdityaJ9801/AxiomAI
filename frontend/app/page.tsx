'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ===== Particle System =====
function Particles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; opacity: number; color: string;
        }> = [];

        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#60a5fa'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.6 + 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        let animFrame: number;
        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                // Draw connections
                particles.slice(i + 1).forEach(p2 => {
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = (1 - dist / 120) * 0.15;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
                ctx.globalAlpha = 1;
            });

            animFrame = requestAnimationFrame(animate);
        }
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />
    );
}

// ===== Typing Effect =====
function TypedText({ texts }: { texts: string[] }) {
    const [currentText, setCurrentText] = useState('');
    const [index, setIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const target = texts[index];
        let timeout: NodeJS.Timeout;

        if (!deleting && charIndex < target.length) {
            timeout = setTimeout(() => setCharIndex(c => c + 1), 60);
        } else if (!deleting && charIndex === target.length) {
            timeout = setTimeout(() => setDeleting(true), 2000);
        } else if (deleting && charIndex > 0) {
            timeout = setTimeout(() => setCharIndex(c => c - 1), 30);
        } else if (deleting && charIndex === 0) {
            setDeleting(false);
            setIndex(i => (i + 1) % texts.length);
        }

        setCurrentText(target.slice(0, charIndex));
        return () => clearTimeout(timeout);
    }, [charIndex, deleting, index, texts]);

    return (
        <span style={{ color: '#60a5fa' }}>
            {currentText}
            <span style={{ animation: 'pulse-glow 1s infinite', color: '#8b5cf6' }}>|</span>
        </span>
    );
}

// ===== Feature Card =====
function FeatureCard({
    icon, title, description, gradient, delay
}: {
    icon: string; title: string; description: string; gradient: string; delay: number;
}) {
    return (
        <div
            className="glass-card"
            style={{
                padding: '28px',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.4s ease',
                animationDelay: `${delay}ms`,
                cursor: 'default',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.3)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(59,130,246,0.12)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
        >
            <div style={{
                width: 54, height: 54, borderRadius: 14,
                background: gradient, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 18,
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#f0f6ff' }}>{title}</h3>
            <p style={{ fontSize: 14, color: '#8898aa', lineHeight: 1.7 }}>{description}</p>
        </div>
    );
}

// ===== Stat Item =====
function StatItem({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontSize: 44, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1,
            }}>
                {value}{suffix}
            </div>
            <div style={{ fontSize: 14, color: '#8898aa', marginTop: 8, fontWeight: 500 }}>{label}</div>
        </div>
    );
}

// ===== Pipeline Preview =====
function PipelinePreview() {
    const steps = [
        { icon: '📁', label: 'Upload Dataset', color: '#3b82f6' },
        { icon: '🧹', label: 'Auto Data Cleaning', color: '#8b5cf6' },
        { icon: '🔍', label: 'EDA & Profiling', color: '#06b6d4' },
        { icon: '📈', label: 'Run Analysis', color: '#10b981' },
        { icon: '🤖', label: 'AI Recommendations', color: '#ec4899' },
        { icon: '📄', label: 'Generate Report', color: '#f59e0b' },
    ];

    return (
        <div style={{
            background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '28px 20px', backdropFilter: 'blur(20px)',
        }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 20, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Agentic Pipeline
            </div>
            {steps.map((step, i) => (
                <div key={i}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                        borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${step.color}20`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 17, border: `1px solid ${step.color}40`,
                        }}>
                            {step.icon}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1' }}>{step.label}</span>
                        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: step.color, boxShadow: `0 0 8px ${step.color}` }} />
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.06)', marginLeft: 32 }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ===== Main Landing Page =====
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const features = [
        {
            icon: '🤖', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            title: 'Agentic AI Orchestration',
            description: 'Multi-step autonomous agents that plan, execute, and iterate across your entire data pipeline without manual intervention.',
            delay: 0,
        },
        {
            icon: '🧹', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            title: 'Intelligent Data Cleaning',
            description: 'Auto-detect and fix missing values, duplicates, outliers, and type inconsistencies with configurable strategies.',
            delay: 80,
        },
        {
            icon: '📊', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            title: 'Deep Exploratory Analysis',
            description: 'Full EDA with interactive histograms, box plots, correlation heatmaps, and distribution analysis in seconds.',
            delay: 160,
        },
        {
            icon: '📈', gradient: 'linear-gradient(135deg, #10b981, #059669)',
            title: 'Econometric Modeling',
            description: 'Linear, polynomial regression, time-series forecasting, and statistical hypothesis testing out of the box.',
            delay: 240,
        },
        {
            icon: '💡', gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
            title: 'AI-Generated Insights',
            description: 'The agent synthesizes all analysis phases and produces ranked recommendations with supporting evidence.',
            delay: 320,
        },
        {
            icon: '📄', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            title: 'Professional Reports',
            description: 'Export polished PDF/Word reports combining narrative, charts, tables, and conclusions automatically.',
            delay: 400,
        },
    ];

    return (
        <div style={{ background: '#050810', minHeight: '100vh', overflow: 'hidden' }}>
            {/* ===== NAV ===== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: '0 40px', height: 68,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(5,8,16,0.95)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                transition: 'all 0.3s ease',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, color: 'white',
                        boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                    }}>
                        ⬡
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#f0f6ff' }}>
                        AXIOM <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                    </span>
                </div>

                {/* Nav links */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    {['Features', 'Pipeline', 'Pricing'].map(link => (
                        <a key={link} href={`#${link.toLowerCase()}`} style={{
                            color: '#8898aa', fontSize: 14, fontWeight: 500,
                            textDecoration: 'none', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = '#f0f6ff'}
                            onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = '#8898aa'}
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                    <Link href="/login?tab=signup" className="btn btn-primary btn-sm">Get Started Free</Link>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section style={{
                position: 'relative', minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '80px 40px 60px',
                overflow: 'hidden',
            }}>
                <Particles />

                {/* Background glow effects */}
                <div style={{
                    position: 'absolute', top: '20%', left: '15%',
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', right: '10%',
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                }} />

                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 60, maxWidth: 1200, width: '100%',
                    alignItems: 'center', position: 'relative', zIndex: 2,
                }}>
                    {/* Left Content */}
                    <div style={{ animation: 'slide-in-up 0.8s ease' }}>
                        <div className="badge badge-blue" style={{ marginBottom: 24, fontSize: 11 }}>
                            <span>⚡</span> Powered by Multi-Agent AI
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900,
                            lineHeight: 1.1, marginBottom: 24,
                            fontFamily: 'Space Grotesk, sans-serif',
                        }}>
                            Automate Your
                            <br />
                            Data Analysis with
                            <br />
                            <TypedText texts={['AI Agents', 'Smart Insights', 'Auto Reports', 'Deep EDA']} />
                        </h1>

                        <p style={{
                            fontSize: 18, color: '#8898aa', lineHeight: 1.8,
                            marginBottom: 40, maxWidth: 500,
                        }}>
                            Upload any dataset. AXIOM's autonomous AI agents clean, analyze,
                            generate insights, and produce professional reports — automatically.
                        </p>

                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 50 }}>
                            <Link href="/login?tab=signup" className="btn btn-primary btn-lg" style={{ fontSize: 16 }}>
                                🚀 Start Analyzing Free
                            </Link>
                            <Link href="#features" className="btn btn-secondary btn-lg" style={{ fontSize: 16 }}>
                                See How It Works →
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            {['✅ No credit card required', '✅ CSV, Excel, JSON', '✅ 100% Private'].map(t => (
                                <span key={t} style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Right - Pipeline Visualization */}
                    <div style={{ animation: 'slide-in-up 0.8s ease 0.2s both' }}>
                        <PipelinePreview />
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section style={{
                padding: '60px 40px',
                background: 'rgba(13,21,38,0.5)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{
                    maxWidth: 900, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40,
                }}>
                    <StatItem value="95" suffix="%" label="Analysis Accuracy" />
                    <StatItem value="10x" label="Faster Than Manual" />
                    <StatItem value="6" label="Agent Pipeline Steps" />
                    <StatItem value="∞" label="Dataset Rows Supported" />
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" style={{ padding: '100px 40px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <div className="badge badge-purple" style={{ marginBottom: 16, fontSize: 11 }}>
                            Core Capabilities
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 18, fontFamily: 'Space Grotesk, sans-serif' }}>
                            Everything You Need to{' '}
                            <span className="gradient-text">Understand Your Data</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#8898aa', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
                            A complete agentic analysis suite that takes your raw data and returns
                            actionable intelligence, automatically.
                        </p>
                    </div>

                    <div className="grid-3">
                        {features.map((f) => (
                            <FeatureCard key={f.title} {...f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="pipeline" style={{
                padding: '100px 40px',
                background: 'rgba(10,15,30,0.8)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <div className="badge badge-blue" style={{ marginBottom: 16, fontSize: 11 }}>
                        Automated Workflow
                    </div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 60, fontFamily: 'Space Grotesk, sans-serif' }}>
                        How AXIOM Works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            { step: '01', icon: '📁', title: 'Upload Your Data', desc: 'Drag & drop CSV, Excel, or JSON. Up to 100MB supported.' },
                            { step: '02', icon: '🤖', title: 'AI Agents Activate', desc: 'Six specialized agents clean, analyze, and interpret your dataset autonomously.' },
                            { step: '03', icon: '📊', title: 'Get Full Report', desc: 'Receive AI conclusions, recommendations, and an exportable professional report.' },
                        ].map(s => (
                            <div key={s.step} className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 800, color: '#3b82f6',
                                    letterSpacing: '0.15em', marginBottom: 16,
                                }}>{s.step}</div>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                                <p style={{ fontSize: 14, color: '#8898aa', lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section style={{ padding: '100px 40px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 28, padding: '60px 48px',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                            borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)',
                        }} />
                        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, fontFamily: 'Space Grotesk, sans-serif' }}>
                            Ready to Automate Your Analysis?
                        </h2>
                        <p style={{ fontSize: 16, color: '#8898aa', marginBottom: 36, lineHeight: 1.7 }}>
                            Join analysts using AXIOM AI to turn raw data into deep insights in minutes.
                        </p>
                        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                            <Link href="/login?tab=signup" className="btn btn-primary btn-xl">
                                🚀 Get Started Free
                            </Link>
                            <Link href="/login" className="btn btn-secondary btn-xl">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{
                padding: '32px 40px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                    }}>⬡</div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f6ff' }}>AXIOM AI</span>
                </div>
                <div style={{ fontSize: 13, color: '#4a5568' }}>
                    © 2026 AXIOM AI — Agentic Data Analysis Platform
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    {['Privacy', 'Terms', 'Docs'].map(l => (
                        <a key={l} href="#" style={{ fontSize: 13, color: '#4a5568', textDecoration: 'none' }}>{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
import { useNavigate } from 'react-router-dom'

export default function Landing({ user }) {
    const navigate = useNavigate()

    const handleCTA = () => {
        if (user) navigate('/dashboard')
        else navigate('/login')
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .cta-btn:hover { background: #0b7a70 !important; }
        .gh-btn:hover { background: #000 !important; }
        .feat-card:hover { border-color: var(--accent-mid) !important; transform: translateY(-2px); }
        .feat-card { transition: border-color 0.15s, transform 0.15s; }
        .nav-link { font-size: 13px; color: var(--text2); font-weight: 500; cursor: pointer; }
        .nav-link:hover { color: var(--text1); }
      `}</style>

            {/* Nav */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Logo size={26} fontSize={15} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <span className="nav-link">How it works</span>
                    <span className="nav-link">Features</span>
                    <span className="nav-link">Open source</span>
                </div>
                <button onClick={handleCTA} className="cta-btn" style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, transition: 'background 0.15s' }}>
                    {user ? 'Go to Dashboard' : 'Get started free'}
                </button>
            </nav>

            {/* Hero */}
            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 48px 64px', animation: 'fadeUp 0.5s ease' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--accent-light)', border: '1px solid var(--accent-mid)', color: 'var(--accent2)', fontSize: '12px', fontWeight: 600, padding: '5px 16px', borderRadius: '99px', marginBottom: '28px', letterSpacing: '.01em' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    AI-powered README automation
                </div>

                <h1 style={{ fontSize: '62px', fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1.08, marginBottom: '22px', maxWidth: '720px' }}>
                    Your README,<br />
                    <span style={{ color: 'var(--accent)' }}>always in sync.</span>
                </h1>

                <p style={{ fontSize: '18px', color: 'var(--text2)', maxWidth: '520px', lineHeight: 1.7, marginBottom: '40px', fontWeight: 400 }}>
                    Connect your GitHub repo once. ReadmePilot watches every push and automatically updates only the sections that changed — powered by AI.
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={handleCTA} className="gh-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: '#24292f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, transition: 'background 0.15s' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
                        Continue with GitHub
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 500 }}>Free forever · No card needed</span>
                </div>
            </section>

            {/* Terminal mockup */}
            <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 72px' }}>
                <div style={{ background: '#0d1117', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2d333b', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
                    <div style={{ background: '#161b22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #2d333b' }}>
                        {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />)}
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#4b5563', fontFamily: 'DM Mono, monospace' }}>readmepilot — server logs</span>
                    </div>
                    <div style={{ padding: '20px 24px', fontFamily: 'DM Mono, monospace', fontSize: '12.5px', lineHeight: '1.8' }}>
                        {[
                            { t: '$ node src/index.js', c: '#4b5563' },
                            { t: '✓  Redis connected', c: '#2dd4bf' },
                            { t: '✓  MongoDB connected', c: '#2dd4bf' },
                            { t: '✓  Server running on port 5000', c: '#2dd4bf' },
                            { t: '', c: '' },
                            { t: 'Push received: SudeepKagi/Simon-Says → main', c: '#e2e8f0' },
                            { t: 'Fetching repo files...', c: '#94a3b8' },
                            { t: 'Calling AI API (llama-3.3-70b)...', c: '#94a3b8' },
                            { t: 'Generated 10 sections in 2.3s', c: '#22c55e' },
                            { t: 'Committing README...', c: '#94a3b8' },
                            { t: '✓  README committed · Health score: 100/100', c: '#22c55e' },
                        ].map((l, i) => <div key={i} style={{ color: l.c }}>{l.t || '\u00a0'}</div>)}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
                <SectionLabel>How it works</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginTop: '28px' }}>
                    {[
                        { n: '01', title: 'Connect your repo', desc: 'Sign in with GitHub and select any repo. ReadmePilot registers a webhook automatically — no manual config.' },
                        { n: '02', title: 'Push your code', desc: 'Every git push triggers ReadmePilot. It reads your files and identifies exactly which README sections are affected.' },
                        { n: '03', title: 'README updates itself', desc: 'AI rewrites only the changed sections and commits the update back. Your documentation stays accurate forever.' },
                    ].map(s => (
                        <div key={s.n} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', marginBottom: '16px', fontFamily: 'DM Mono, monospace' }}>{s.n}</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-.3px' }}>{s.title}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.65 }}>{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ background: 'var(--bg)', padding: '64px 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <SectionLabel>Features</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginTop: '28px' }}>
                        {[
                            { icon: '⚡', title: 'Webhook-powered', desc: 'GitHub calls ReadmePilot instantly on every push. No polling, no cron jobs, no delays.' },
                            { icon: '🧠', title: 'Smart section patching', desc: 'Only affected sections get rewritten. The AI never touches content that didn\'t change.' },
                            { icon: '📊', title: 'README health score', desc: 'Every repo gets a live 0–100 score measuring completeness, accuracy, and freshness.' },
                            { icon: '🔒', title: 'Secure by design', desc: 'Tokens are AES-256 encrypted. Webhooks are HMAC-verified. Your code never leaves GitHub.' },
                            { icon: '⚙️', title: 'Manual regenerate', desc: 'Need a fresh README right now? Hit Regenerate from your dashboard — no push needed.' },
                            { icon: '🔗', title: 'Multi-repo support', desc: 'Connect as many repos as you need. Each one gets its own webhook, queue, and history.' },
                        ].map(f => (
                            <div key={f.title} className="feat-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px 24px', display: 'flex', gap: '16px' }}>
                                <div style={{ fontSize: '22px', lineHeight: 1 }}>{f.icon}</div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-.2px' }}>{f.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section style={{ padding: '0 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--accent)', borderRadius: '20px', padding: '56px 48px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', letterSpacing: '-1.2px', marginBottom: '14px' }}>
                        Ship better docs, automatically.
                    </h2>
                    <p style={{ color: '#a7f3d0', fontSize: '15px', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px' }}>
                        Join developers who never write README updates manually again.
                    </p>
                    <button onClick={handleCTA} style={{ padding: '14px 32px', background: '#fff', color: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Get started free →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                <Logo size={22} fontSize={14} />
                <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Built with Node.js · BullMQ · Groq AI · GitHub API</p>
                <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Free forever · Open source</p>
            </footer>
        </div>
    )
}

function Logo({ size = 26, fontSize = 15 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize }}>
            <div style={{ width: size, height: size, background: 'var(--accent)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="none">
                    <path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="#fff" strokeWidth="1.4" />
                    <path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            </div>
            ReadmePilot
        </div>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{children}</span>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api, { logout } from '../api.js'

function renderMarkdown(md) {
    if (!md) return ''
    let html = md
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
        .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/\n\n+/g, '</p><p>')
    return `<p>${html}</p>`
}

function HealthRing({ score }) {
    const r = 28, circ = 2 * Math.PI * r
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    return (
        <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={`${circ * score / 100} ${circ}`}
                strokeLinecap="round" transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dasharray 0.8s ease' }} />
            <text x="36" y="41" textAnchor="middle" fill={color}
                style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>{score}</text>
        </svg>
    )
}

function formatRelativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function RepoDetail({ user, setUser }) {
    const { repoId } = useParams()
    const navigate = useNavigate()
    const [repo, setRepo] = useState(null)
    const [readme, setReadme] = useState(null)
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState(false)
    const [regenStatus, setRegenStatus] = useState(null)

    useEffect(() => {
        Promise.all([
            api.get('/api/repos').then(res => {
                const found = res.data.find(r => r._id === repoId)
                setRepo(found)
                return found
            }),
            api.get(`/api/repos/${repoId}/readme`)
                .then(r => setReadme(r.data.content))
                .catch(() => setReadme(null))
        ]).finally(() => setLoading(false))
    }, [repoId])

    const handleRegen = async () => {
        setRegenerating(true)
        setRegenStatus(null)
        try {
            await api.post(`/api/repos/${repoId}/regenerate`)
            setRegenStatus('queued')
        } catch {
            setRegenStatus('error')
        } finally {
            setRegenerating(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        setUser(null)
        navigate('/')
    }

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '14px' }}>
            Loading…
        </div>
    )

    if (!repo) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px' }}>🔍</div>
            <p style={{ color: 'var(--text2)' }}>Repo not found or not connected.</p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>← Back to Dashboard</button>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .readme-body { font-size: 14px; line-height: 1.75; color: var(--text1); }
        .readme-body p { margin: 0 0 14px; }
        .readme-body h1 { font-size: 24px; font-weight: 700; margin: 0 0 18px; letter-spacing: -.6px; }
        .readme-body h2 { font-size: 17px; font-weight: 700; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .readme-body h3 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
        .readme-body code { font-family: 'DM Mono', monospace; font-size: 12px; background: #f4f4f5; padding: 2px 7px; border-radius: 5px; color: var(--accent2); }
        .readme-body pre { background: #f4f4f5; border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; overflow-x: auto; margin: 14px 0; }
        .readme-body pre code { background: none; padding: 0; color: var(--text1); }
        .readme-body li { margin: 5px 0; padding-left: 4px; }
        .readme-body a { color: var(--accent2); text-decoration: underline; text-underline-offset: 2px; }
        .readme-body hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
      `}</style>

            {/* Topbar */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ← Dashboard
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'var(--accent-light)', border: '1px solid var(--accent-mid)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--accent2)' }}>
                            {(repo.name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{repo.name}</span>
                        <span style={{ fontSize: '11px', padding: '1px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '99px', fontWeight: 600 }}>live</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={user.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text2)' }}>Sign out</button>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '84px' }}>

                    {/* Health card */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                        <HealthRing score={repo.healthScore || 0} />
                        <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '12px' }}>README Health</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
                            {repo.healthScore >= 70 ? 'Excellent' : repo.healthScore >= 40 ? 'Needs work' : 'Poor'}
                        </div>
                    </div>

                    {/* Meta card */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Details</div>
                        {[
                            { label: 'Repository', value: repo.fullName },
                            { label: 'Branch', value: repo.defaultBranch || 'main' },
                            { label: 'Language', value: repo.language || 'Unknown' },
                            { label: 'Last generated', value: repo.lastGeneratedAt ? formatRelativeTime(repo.lastGeneratedAt) : 'Never' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.label}</span>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text1)', fontFamily: item.label === 'Repository' || item.label === 'Branch' ? 'DM Mono, monospace' : 'inherit', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={handleRegen} disabled={regenerating} style={{ width: '100%', padding: '11px', background: regenerating ? 'var(--accent-light)' : 'var(--accent)', color: regenerating ? 'var(--accent2)' : '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: regenerating ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" style={{ animation: regenerating ? 'spin 0.8s linear infinite' : 'none' }}>
                                <path d="M4 10a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M4 6v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {regenerating ? 'Queuing…' : 'Regenerate README'}
                        </button>
                        <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noreferrer" style={{ width: '100%', padding: '11px', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
                            View on GitHub
                        </a>
                    </div>

                    {regenStatus === 'queued' && (
                        <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '12px', color: '#15803d', fontWeight: 500 }}>
                            ✓ Job queued — README updating in a few seconds.
                        </div>
                    )}
                    {regenStatus === 'error' && (
                        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>
                            ✗ Failed to queue. Try again.
                        </div>
                    )}
                </div>

                {/* README panel */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="var(--text3)" strokeWidth="1.4" /><path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="var(--text3)" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            README.md
                        </span>
                        {repo.lastGeneratedAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Last updated {formatRelativeTime(repo.lastGeneratedAt)}</span>
                        )}
                    </div>
                    <div style={{ padding: '32px 36px', minHeight: '400px' }}>
                        {readme ? (
                            <div className="readme-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(readme) }} />
                        ) : (
                            <div style={{ textAlign: 'center', paddingTop: '64px', color: 'var(--text3)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '14px' }}>📄</div>
                                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>No README yet</div>
                                <div style={{ fontSize: '12px' }}>Push a commit or click Regenerate to create one.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
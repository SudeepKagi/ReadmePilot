import { useEffect, useState, useCallback } from 'react'
import api, { getRepos, logout } from '../api.js'
import { useNavigate } from 'react-router-dom'

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
    const r = 20
    const circ = 2 * Math.PI * r
    const fill = circ * (score / 100)
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    return (
        <svg width="54" height="54" viewBox="0 0 54 54" style={{ flexShrink: 0 }}>
            <circle cx="27" cy="27" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
                cx="27" cy="27" r={r} fill="none"
                stroke={color} strokeWidth="4"
                strokeDasharray={`${fill} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 27 27)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <text x="27" y="32" textAnchor="middle" fill={color}
                style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
                {score}
            </text>
        </svg>
    )
}

function ReadmePanel({ repo, onClose, onRegenerate }) {
    const [readme, setReadme] = useState(null)
    const [loadingReadme, setLoadingReadme] = useState(true)
    const [regenerating, setRegenerating] = useState(false)
    const [regenStatus, setRegenStatus] = useState(null)

    const repoId = repo._id || repo.id

    useEffect(() => {
        setLoadingReadme(true)
        setReadme(null)
        api.get(`/api/repos/${repoId}/readme`)
            .then(r => setReadme(r.data.content))
            .catch(() => setReadme(null))
            .finally(() => setLoadingReadme(false))
    }, [repoId])

    const handleRegen = async () => {
        setRegenerating(true)
        setRegenStatus(null)
        try {
            await api.post(`/api/repos/${repoId}/regenerate`)
            setRegenStatus('queued')
            onRegenerate(repoId)
        } catch {
            setRegenStatus('error')
        } finally {
            setRegenerating(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            animation: 'fadeIn 0.18s ease'
        }} onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '820px',
                    height: '88vh',
                    background: 'var(--surface)',
                    borderRadius: '18px 18px 0 0',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 -8px 48px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.22s cubic-bezier(.32,1.2,.5,1)'
                }}>

                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    flexShrink: 0
                }}>
                    <div style={{
                        width: '36px', height: '36px', background: 'var(--accent-light)',
                        borderRadius: '9px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '14px', fontWeight: 700,
                        color: 'var(--accent2)', flexShrink: 0
                    }}>
                        {(repo.repoName || repo.name || '?')[0].toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{repo.repoName || repo.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                            {repo.repoFullName || repo.fullName}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <HealthRing score={repo.healthScore || 0} />

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Last generated</div>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>
                                {repo.lastGeneratedAt ? formatRelativeTime(repo.lastGeneratedAt) : 'Never'}
                            </div>
                        </div>

                        <button
                            onClick={handleRegen}
                            disabled={regenerating}
                            style={{
                                padding: '8px 16px',
                                background: regenerating ? 'var(--accent-light)' : 'var(--accent)',
                                color: regenerating ? 'var(--accent2)' : '#fff',
                                border: 'none', borderRadius: '9px',
                                fontSize: '12px', fontWeight: 600,
                                cursor: regenerating ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                transition: 'opacity 0.15s'
                            }}>
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"
                                style={{ animation: regenerating ? 'spin 0.8s linear infinite' : 'none' }}>
                                <path d="M4 10a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M4 6v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {regenerating ? 'Queuing…' : 'Regenerate'}
                        </button>

                        <button onClick={onClose} style={{
                            width: '30px', height: '30px', border: '1px solid var(--border)',
                            borderRadius: '8px', background: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'var(--text3)'
                        }}>
                            <svg width="12" height="12" viewBox="0 0 12 12">
                                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {regenStatus === 'queued' && (
                    <div style={{
                        padding: '10px 24px', background: '#f0fdf4',
                        borderBottom: '1px solid #bbf7d0',
                        fontSize: '12px', color: '#15803d', fontWeight: 500
                    }}>
                        ✓ Job queued — README will update in a few seconds.
                    </div>
                )}
                {regenStatus === 'error' && (
                    <div style={{
                        padding: '10px 24px', background: '#fef2f2',
                        borderBottom: '1px solid #fecaca',
                        fontSize: '12px', color: '#dc2626', fontWeight: 500
                    }}>
                        ✗ Failed to queue job. Check that the repo is still connected.
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                    {loadingReadme ? (
                        <div style={{ color: 'var(--text3)', fontSize: '14px', textAlign: 'center', paddingTop: '48px' }}>
                            Loading README…
                        </div>
                    ) : readme ? (
                        <div
                            className="readme-body"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(readme) }}
                        />
                    ) : (
                        <div style={{
                            textAlign: 'center', paddingTop: '48px',
                            color: 'var(--text3)', fontSize: '14px'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                            No README found yet.
                            <br />
                            <span style={{ fontSize: '12px' }}>Push a commit or click Regenerate to create one.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Dashboard({ user, setUser }) {
    const [repos, setRepos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedRepo, setSelectedRepo] = useState(null)
    const navigate = useNavigate()

    const fetchRepos = useCallback(() => {
        return api.get('/api/repos')
            .then(res => setRepos(res.data))
            .catch(() => setError('Failed to load repos'))
    }, [])

    useEffect(() => {
        fetchRepos().finally(() => setLoading(false))
    }, [fetchRepos])

    const handleLogout = async () => {
        await logout()
        setUser(null)
        navigate('/')
    }

    const handleConnect = async (repo, e) => {
        e.stopPropagation()
        try {
            await api.post(`/api/repos/${repo.id}/connect`, {
                fullName: repo.fullName,
                defaultBranch: repo.defaultBranch
            })
            await fetchRepos()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to connect')
        }
    }

    const handleDisconnect = async (repo) => {
        try {
            await api.delete(`/api/repos/${repo._id}/disconnect`)
            setSelectedRepo(null)
            await fetchRepos()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to disconnect')
        }
    }

    // Navigate to dedicated repo page instead of opening panel
    const handleRepoClick = (repo) => {
        if (repo._id) navigate(`/repo/${repo._id}`)
    }

    const handleRegenerate = (repoId) => {
        setRepos(prev => prev.map(r =>
            r._id === repoId ? { ...r, lastGeneratedAt: new Date().toISOString() } : r
        ))
    }

    const connectedRepos = repos.filter(r => r.isConnected)
    const unconnectedRepos = repos.filter(r => !r.isConnected)

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes spin { to { transform: rotate(360deg) } }

                .readme-body { font-size: 13.5px; line-height: 1.7; color: var(--text1); }
                .readme-body p { margin: 0 0 12px; }
                .readme-body h1 { font-size: 22px; font-weight: 700; margin: 0 0 16px; letter-spacing: -.5px; }
                .readme-body h2 { font-size: 16px; font-weight: 600; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
                .readme-body h3 { font-size: 14px; font-weight: 600; margin: 18px 0 8px; }
                .readme-body h4 { font-size: 13px; font-weight: 600; margin: 14px 0 6px; }
                .readme-body code { font-family: 'DM Mono', monospace; font-size: 11.5px; background: var(--code-bg, #f4f4f5); padding: 2px 6px; border-radius: 4px; color: var(--accent2); }
                .readme-body pre { background: var(--code-bg, #f4f4f5); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; overflow-x: auto; margin: 12px 0; }
                .readme-body pre code { background: none; padding: 0; color: var(--text1); }
                .readme-body li { margin: 4px 0; padding-left: 4px; }
                .readme-body a { color: var(--accent2); text-decoration: underline; text-underline-offset: 2px; }
                .readme-body hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

                .repo-row { transition: border-color 0.15s, box-shadow 0.15s; }
                .repo-row:hover { border-color: var(--accent-mid) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

                {/* Topbar */}
                <div style={{
                    background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                    padding: '14px 32px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' }}>
                        <div style={{
                            width: '26px', height: '26px', background: 'var(--accent)',
                            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                                <path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="#fff" strokeWidth="1.4" />
                                <path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                        </div>
                        ReadmePilot
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={user.avatar} alt={user.username}
                            style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.username}</span>
                        <button onClick={handleLogout} style={{
                            padding: '6px 14px', background: 'transparent',
                            border: '1px solid var(--border)', borderRadius: '7px',
                            fontSize: '12px', cursor: 'pointer',
                            fontFamily: 'inherit', color: 'var(--text2)'
                        }}>Sign out</button>
                    </div>
                </div>

                {/* Main content */}
                <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
                    <div style={{ marginBottom: '28px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-.4px' }}>
                            Your repositories
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '3px' }}>
                            {connectedRepos.length > 0
                                ? `${connectedRepos.length} connected · click any connected repo to view details`
                                : 'Connect a repo to start auto-generating READMEs on every push'}
                        </p>
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text3)', fontSize: '14px' }}>
                            Loading your repos…
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '16px', background: '#fee2e2',
                            border: '1px solid #fca5a5', borderRadius: '10px',
                            color: '#dc2626', fontSize: '13px'
                        }}>{error}</div>
                    )}

                    {!loading && !error && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {connectedRepos.length > 0 && (
                                <>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '4px', marginTop: '4px' }}>
                                        Connected
                                    </div>
                                    {connectedRepos.map(repo => (
                                        <RepoRow
                                            key={repo.id}
                                            repo={repo}
                                            onClick={() => handleRepoClick(repo)}
                                            onConnect={handleConnect}
                                            onDisconnect={handleDisconnect}
                                        />
                                    ))}
                                    {unconnectedRepos.length > 0 && (
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '4px', marginTop: '16px' }}>
                                            Not connected
                                        </div>
                                    )}
                                </>
                            )}
                            {unconnectedRepos.map(repo => (
                                <RepoRow
                                    key={repo.id}
                                    repo={repo}
                                    onClick={() => { }}
                                    onConnect={handleConnect}
                                    onDisconnect={handleDisconnect}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedRepo && (
                <ReadmePanel
                    repo={selectedRepo}
                    onClose={() => setSelectedRepo(null)}
                    onRegenerate={handleRegenerate}
                />
            )}
        </>
    )
}

function RepoRow({ repo, onClick, onConnect, onDisconnect }) {
    const isConnected = repo.isConnected
    const [disconnecting, setDisconnecting] = useState(false)

    const handleDisconnect = async (e) => {
        e.stopPropagation()
        if (!confirm(`Disconnect ${repo.name}? This will remove the webhook from GitHub.`)) return
        setDisconnecting(true)
        try {
            await onDisconnect(repo)
        } finally {
            setDisconnecting(false)
        }
    }

    return (
        <div
            className="repo-row"
            onClick={onClick}
            style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: '14px',
                cursor: isConnected ? 'pointer' : 'default',
            }}
        >
            <div style={{
                width: '38px', height: '38px',
                background: isConnected ? 'var(--accent-light)' : 'var(--bg)',
                border: isConnected ? '1px solid var(--accent-mid)' : '1px solid var(--border)',
                borderRadius: '9px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '15px', fontWeight: 700,
                color: isConnected ? 'var(--accent2)' : 'var(--text3)', flexShrink: 0
            }}>
                {repo.name[0].toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                    {repo.name}
                    {isConnected && (
                        <span style={{
                            fontSize: '10px', padding: '1px 7px',
                            background: '#dcfce7', color: '#15803d',
                            border: '1px solid #bbf7d0', borderRadius: '99px', fontWeight: 600
                        }}>live</span>
                    )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'DM Mono, monospace' }}>
                    {repo.fullName} · {repo.language || 'Unknown'} · ⭐ {repo.stars}
                </div>
                {repo.description && (
                    <div style={{
                        fontSize: '12px', color: 'var(--text2)', marginTop: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {repo.description}
                    </div>
                )}
                {isConnected && (repo.lastGeneratedAt || repo.healthScore > 0) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        {repo.healthScore > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <HealthDot score={repo.healthScore} />
                                Health {repo.healthScore}/100
                            </span>
                        )}
                        {repo.lastGeneratedAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                Last updated {formatRelativeTime(repo.lastGeneratedAt)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isConnected ? (
                    <>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View details
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            style={{
                                padding: '7px 12px', background: 'transparent',
                                color: disconnecting ? 'var(--text3)' : '#ef4444',
                                border: '1px solid',
                                borderColor: disconnecting ? 'var(--border)' : '#fca5a5',
                                borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                                cursor: disconnecting ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                            }}>
                            {disconnecting ? 'Removing…' : 'Disconnect'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={(e) => onConnect(repo, e)}
                        style={{
                            padding: '7px 16px', background: 'var(--accent)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                        Connect
                    </button>
                )}
            </div>
        </div>
    )
}

function HealthDot({ score }) {
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    return <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block' }} />
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
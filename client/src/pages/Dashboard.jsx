import { useEffect, useState } from 'react'
import api, { getRepos, logout } from '../api.js'
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ user, setUser }) {
    const [repos, setRepos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // Fetch repos when dashboard loads
    useEffect(() => {
        getRepos()
            .then(res => setRepos(res.data))
            .catch(() => setError('Failed to load repos'))
            .finally(() => setLoading(false))
    }, [])

    const handleLogout = async () => {
        await logout()
        setUser(null)
        navigate('/')
    }

    const handleConnect = async (repo) => {
        try {
            await api.post(`/api/repos/${repo.id}/connect`, {
                fullName: repo.fullName,
                defaultBranch: repo.defaultBranch
            })
            // Refresh the repos list to show "Connected" status
            const res = await getRepos()
            setRepos(res.data)
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to connect')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Topbar */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: '14px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
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
                    {/* User avatar */}
                    <img
                        src={user.avatar}
                        alt={user.username}
                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.username}</span>
                    <button onClick={handleLogout} style={{
                        padding: '6px 14px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '7px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        color: 'var(--text2)'
                    }}>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '24px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-.4px' }}>
                            Your repositories
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '3px' }}>
                            Select a repo to connect ReadmePilot
                        </p>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text3)', fontSize: '14px' }}>
                        Loading your repos...
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div style={{
                        padding: '16px', background: '#fee2e2',
                        border: '1px solid #fca5a5', borderRadius: '10px',
                        color: '#dc2626', fontSize: '13px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Repos list */}
                {!loading && !error && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {repos.map(repo => (
                            <div key={repo.id} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                cursor: 'pointer',
                                transition: 'border-color 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-mid)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                {/* Repo avatar */}
                                <div style={{
                                    width: '38px', height: '38px',
                                    background: 'var(--accent-light)',
                                    borderRadius: '9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '15px', fontWeight: 700, color: 'var(--accent2)',
                                    flexShrink: 0
                                }}>
                                    {repo.name[0].toUpperCase()}
                                </div>

                                {/* Repo info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{repo.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'DM Mono, monospace' }}>
                                        {repo.fullName} · {repo.language || 'Unknown'} · ⭐ {repo.stars}
                                    </div>
                                    {repo.description && (
                                        <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                                            {repo.description}
                                        </div>
                                    )}
                                </div>

                                {/* Connect button */}
                                <button
                                    onClick={() => handleConnect(repo)}
                                    disabled={repo.isConnected}
                                    style={{
                                        padding: '7px 16px',
                                        background: repo.isConnected ? 'var(--accent-light)' : 'var(--accent)',
                                        color: repo.isConnected ? 'var(--accent2)' : '#fff',
                                        border: repo.isConnected ? '1px solid var(--accent-mid)' : 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        cursor: repo.isConnected ? 'default' : 'pointer',
                                        fontFamily: 'inherit',
                                        flexShrink: 0
                                    }}>
                                    {repo.isConnected ? '✓ Connected' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
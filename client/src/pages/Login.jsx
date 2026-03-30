export default function Login() {
    // This is the ONLY thing the login page does:
    // Send the user to your backend's GitHub OAuth route
    // Your backend handles everything from there
    const handleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/github'
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column'
        }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 48px',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '16px' }}>
                    <div style={{
                        width: '28px', height: '28px',
                        background: 'var(--accent)',
                        borderRadius: '7px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                            <path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="#fff" strokeWidth="1.4" />
                            <path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>
                    ReadmePilot
                </div>
                <button onClick={handleLogin} style={{
                    padding: '8px 18px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}>
                    Sign in with GitHub
                </button>
            </nav>

            {/* Hero */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 48px',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'var(--accent-light)', border: '1px solid var(--accent-mid)',
                    color: 'var(--accent2)', fontSize: '12px', fontWeight: 500,
                    padding: '4px 14px', borderRadius: '20px', marginBottom: '24px'
                }}>
                    <span style={{
                        width: '6px', height: '6px',
                        background: 'var(--accent)', borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }} />
                    Auto-pilot for your README
                </div>

                <h1 style={{
                    fontSize: '48px', fontWeight: 600,
                    letterSpacing: '-1.8px', lineHeight: 1.12,
                    marginBottom: '18px'
                }}>
                    Your README,<br />
                    always <span style={{ color: 'var(--accent)' }}>up to date.</span>
                </h1>

                <p style={{
                    fontSize: '16px', color: 'var(--text2)',
                    maxWidth: '460px', lineHeight: 1.65,
                    marginBottom: '36px'
                }}>
                    Connect your GitHub repo once. ReadmePilot patches your README
                    on every push — only updating what actually changed.
                </p>

                <button onClick={handleLogin} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '13px 28px',
                    background: '#24292f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s'
                }}
                    onMouseEnter={e => e.target.style.background = '#000'}
                    onMouseLeave={e => e.target.style.background = '#24292f'}
                >
                    {/* GitHub icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                    </svg>
                    Continue with GitHub
                </button>

                <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text3)' }}>
                    Free forever · No credit card needed
                </p>
            </div>
        </div>
    )
}
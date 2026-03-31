export function Logo() {
    return (
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
    )
}
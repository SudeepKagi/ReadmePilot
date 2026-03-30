import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { useEffect, useState } from 'react'
import { getMe } from './api.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on every page load
  // This runs once when the app first opens
  useEffect(() => {
    getMe()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))  // not logged in = null
      .finally(() => setLoading(false))
  }, [])

  // Show nothing while checking login status
  // Prevents a flash of the wrong page
  if (loading) return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text3)',
      fontSize: '14px'
    }}>
      Loading...
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        {/* If not logged in → show Login page */}
        {/* If logged in → redirect to dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Protected route — if not logged in, go back to home */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />}
        />

        {/* Catch any unknown URLs */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
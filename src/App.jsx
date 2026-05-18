import React, { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('studyflow_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('studyflow_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const handleLogin = (userData) => setUser(userData)
  const handleLogout = () => setUser(null)

  if (!user) return <AuthPage onLogin={handleLogin} />

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
}
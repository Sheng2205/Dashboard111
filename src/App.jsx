import React, { useState } from 'react'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

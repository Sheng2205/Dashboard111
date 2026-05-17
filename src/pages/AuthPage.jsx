import React, { useState } from 'react'
import './AuthPage.css'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const STORAGE_KEY = 'studyflow_users'

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
    catch { return [] }
  }

  const saveUsers = (users) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }

  const handleSubmit = () => {
    setError('')
    if (!form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    if (mode === 'register' && !form.name) {
      setError('Vui lòng nhập tên của bạn.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const users = getUsers()
      if (mode === 'register') {
        if (users.find(u => u.email === form.email)) {
          setError('Email này đã được đăng ký.')
          setLoading(false)
          return
        }
        const newUser = { id: Date.now(), name: form.name, email: form.email, password: form.password }
        saveUsers([...users, newUser])
        onLogin({ id: newUser.id, name: newUser.name, email: newUser.email })
      } else {
        const found = users.find(u => u.email === form.email && u.password === form.password)
        if (!found) {
          setError('Email hoặc mật khẩu không đúng.')
          setLoading(false)
          return
        }
        onLogin({ id: found.id, name: found.name, email: found.email })
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="3" fill="var(--accent-violet)" />
              <rect x="15" y="2" width="11" height="11" rx="3" fill="var(--accent-cyan)" opacity="0.7" />
              <rect x="2" y="15" width="11" height="11" rx="3" fill="var(--accent-green)" opacity="0.7" />
              <rect x="15" y="15" width="11" height="11" rx="3" fill="var(--accent-pink)" opacity="0.7" />
            </svg>
          </div>
          <span className="auth-logo-text">StudyFlow</span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Chào mừng trở lại' : 'Bắt đầu học tập'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Tiếp tục hành trình học tập của bạn' : 'Tạo tài khoản miễn phí ngay hôm nay'}
        </p>

        <div className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className={`auth-btn ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
            )}
          </button>
        </div>

        <p className="auth-switch">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button
            className="auth-switch-btn"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          >
            {mode === 'login' ? ' Đăng ký' : ' Đăng nhập'}
          </button>
        </p>

        <div className="auth-demo">
          <span>Demo nhanh →</span>
          <button onClick={() => onLogin({ id: 0, name: 'Demo User', email: 'demo@studyflow.vn' })}>
            Dùng tài khoản mẫu
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import './Navbar.css'

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'subjects',
    label: 'Môn học',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Lịch học',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'bookmarks',
    label: 'Bookmark',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
]

export default function Navbar({ activePage, onNavigate, user, onLogout }) {
  const [showTooltip, setShowTooltip] = useState(null)

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="navbar-logo-icon">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="11" height="11" rx="3" fill="var(--accent-violet)" />
            <rect x="15" y="2" width="11" height="11" rx="3" fill="var(--accent-cyan)" opacity="0.7" />
            <rect x="2" y="15" width="11" height="11" rx="3" fill="var(--accent-green)" opacity="0.7" />
            <rect x="15" y="15" width="11" height="11" rx="3" fill="var(--accent-pink)" opacity="0.7" />
          </svg>
        </div>
      </div>

      <div className="navbar-items">
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className="navbar-item-wrapper"
            onMouseEnter={() => setShowTooltip(item.id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              className={`navbar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {activePage === item.id && <span className="navbar-active-dot" />}
            </button>
            {showTooltip === item.id && (
              <div className="navbar-tooltip">{item.label}</div>
            )}
          </div>
        ))}
      </div>

      <div className="navbar-bottom">
        <div
          className="navbar-item-wrapper"
          onMouseEnter={() => setShowTooltip('logout')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <button className="navbar-avatar" onClick={onLogout} title="Đăng xuất">
            {initials}
          </button>
          {showTooltip === 'logout' && (
            <div className="navbar-tooltip">Đăng xuất</div>
          )}
        </div>
      </div>
    </nav>
  )
}

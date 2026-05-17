import React, { useState } from 'react'
import Navbar from '../components/Navbar/Navbar.jsx'
import TodoPanel from '../components/TodoPanel/TodoPanel.jsx'
import ChartPanel from '../components/ChartPanel/ChartPanel.jsx'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className="dashboard-root">
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={onLogout}
      />
      <main className="dashboard-main">
        <TodoPanel user={user} activePage={activePage} />
        <ChartPanel user={user} />
      </main>
    </div>
  )
}

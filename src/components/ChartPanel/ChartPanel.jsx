import React, { useMemo, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts'
import './ChartPanel.css'

const ALL_SUBJECTS = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'CNTT']
const COLORS = [
  'var(--accent-violet)', 'var(--accent-cyan)', 'var(--accent-green)',
  'var(--accent-pink)', 'var(--accent-amber)', 'var(--accent-red)',
  '#a78bfa', '#67e8f9', '#86efac',
]
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Get Mon–Sun date strings for the current week
function getCurrentWeekDates() {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10) // "YYYY-MM-DD"
  })
}

// Today's index in DAYS (0=Mon … 6=Sun)
function todayIndex() {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

// Count consecutive days (backwards from today) that had at least 1 task completed
function calcStreak(tasks) {
  if (!tasks.length) return { streak: 0, activeDays: [] }

  // Build a Set of date strings when tasks were completed
  // We use createdAt as a proxy for "active on this day" (task created OR toggled done)
  // To track done toggling we store completedAt — fall back to createdAt
  const doneDates = new Set()
  tasks.forEach(t => {
    if (t.done) {
      const dateStr = t.completedAt
        ? new Date(t.completedAt).toISOString().slice(0, 10)
        : new Date(t.createdAt).toISOString().slice(0, 10)
      doneDates.add(dateStr)
    }
  })

  // Walk backwards from today
  let streak = 0
  const today = new Date()
  const activeDays = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (doneDates.has(ds)) {
      streak++
      activeDays.push(ds)
    } else if (i > 0) {
      break // gap found, stop
    }
  }

  return { streak, activeDays: new Set(activeDays) }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ChartPanel({ user }) {
  const storageKey = `studyflow_tasks_${user.id}`

  // Re-read tasks from localStorage on every render so charts stay in sync
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const handler = () => setTick(t => t + 1)
    window.addEventListener('storage', handler)
    // Also poll every 2s to catch same-tab updates
    const id = setInterval(() => setTick(t => t + 1), 2000)
    return () => { window.removeEventListener('storage', handler); clearInterval(id) }
  }, [])

  const tasks = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') }
    catch { return [] }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, tick])

  // ── Completion rate ──────────────────────────────────────────
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0
  const radialData = [{ name: 'Hoàn thành', value: completionPct, fill: 'var(--accent-violet)' }]

  // ── Tasks completed per day this week ────────────────────────
  const weekDates = useMemo(() => getCurrentWeekDates(), [])
  const todayIdx = todayIndex()

  const weeklyData = useMemo(() => {
    return DAYS.map((day, i) => {
      const dateStr = weekDates[i]
      const count = tasks.filter(t => {
        if (!t.done) return false
        const d = t.completedAt
          ? new Date(t.completedAt).toISOString().slice(0, 10)
          : new Date(t.createdAt).toISOString().slice(0, 10)
        return d === dateStr
      }).length
      return { day, 'Task xong': count }
    })
  }, [tasks, weekDates])

  // ── Subject distribution (only subjects with tasks) ──────────
  const subjectData = useMemo(() => {
    const counts = {}
    tasks.forEach(t => {
      counts[t.subject] = (counts[t.subject] || 0) + 1
    })
    return ALL_SUBJECTS
      .map((name, i) => ({ name, value: counts[name] || 0, color: COLORS[i] }))
      .filter(s => s.value > 0)
  }, [tasks])

  const hasSubjects = subjectData.length > 0

  // ── Priority breakdown (no fallback) ────────────────────────
  const priorityData = useMemo(() => [
    { name: 'Cao', value: tasks.filter(t => t.priority === 'high').length, fill: 'var(--accent-red)' },
    { name: 'TB', value: tasks.filter(t => t.priority === 'medium').length, fill: 'var(--accent-amber)' },
    { name: 'Thấp', value: tasks.filter(t => t.priority === 'low').length, fill: 'var(--accent-green)' },
  ], [tasks])

  // ── Streak ────────────────────────────────────────────────────
  const { streak, activeDays } = useMemo(() => calcStreak(tasks), [tasks])

  // Which of the current week days are "active" for the streak dots
  const weekDayActive = weekDates.map(d => activeDays.has(d))

  return (
    <div className="chart-panel">
      <div className="chart-panel-header">
        <h2 className="chart-heading">Thống kê</h2>
        <span className="chart-period">Tuần này</span>
      </div>

      {/* Completion Ring */}
      <div className="chart-card completion-card">
        <div className="chart-card-title">Tỉ lệ hoàn thành</div>
        <div className="completion-wrap">
          <div className="completion-ring-wrap">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="65%" outerRadius="90%"
                startAngle={90} endAngle={-270}
                data={radialData}
              >
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--surface3)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="completion-center">
              <span className="completion-pct">{completionPct}%</span>
            </div>
          </div>
          <div className="completion-stats">
            <div className="completion-stat">
              <span className="c-val" style={{ color: 'var(--accent-green)' }}>{done}</span>
              <span className="c-label">Xong</span>
            </div>
            <div className="completion-stat">
              <span className="c-val" style={{ color: 'var(--accent-amber)' }}>{total - done}</span>
              <span className="c-label">Còn lại</span>
            </div>
            <div className="completion-stat">
              <span className="c-val" style={{ color: 'var(--accent-violet)' }}>{total}</span>
              <span className="c-label">Tổng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart — tasks completed each day */}
      <div className="chart-card">
        <div className="chart-card-title">Task hoàn thành trong tuần</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barGap={2}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,108,252,0.06)' }} />
            <Bar dataKey="Task xong" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell key={i} fill={i === todayIdx ? 'var(--accent-violet)' : 'var(--surface3)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {weeklyData.every(d => d['Task xong'] === 0) && (
          <p className="chart-empty">Hoàn thành task để thấy biểu đồ</p>
        )}
      </div>

      {/* Subject Pie Chart */}
      <div className="chart-card">
        <div className="chart-card-title">Phân bổ môn học</div>
        {hasSubjects ? (
          <div className="pie-wrap">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                  {subjectData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {subjectData.map((s, i) => (
                <div key={i} className="pie-legend-item">
                  <span className="pie-dot" style={{ background: s.color }} />
                  <span className="pie-name">{s.name}</span>
                  <span className="pie-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="chart-empty">Thêm task để thấy phân bổ môn học</p>
        )}
      </div>

      {/* Priority Breakdown */}
      <div className="chart-card">
        <div className="chart-card-title">Phân loại ưu tiên</div>
        {total === 0 ? (
          <p className="chart-empty">Chưa có task nào</p>
        ) : (
          <div className="priority-bars">
            {priorityData.map((p) => {
              const pct = total > 0 ? Math.round((p.value / total) * 100) : 0
              return (
                <div key={p.name} className="priority-row">
                  <span className="priority-name">{p.name}</span>
                  <div className="priority-bar-wrap">
                    <div className="priority-bar-fill" style={{ width: `${pct}%`, background: p.fill }} />
                  </div>
                  <span className="priority-count">{p.value}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Streak */}
      <div className="chart-card streak-card">
        <div className="chart-card-title">Chuỗi học tập</div>
        <div className="streak-display">
          <span className="streak-flame">{streak > 0 ? '🔥' : '💤'}</span>
          <div>
            <span className="streak-num">{streak}</span>
            <span className="streak-unit"> ngày</span>
          </div>
        </div>
        <div className="streak-dots">
          {DAYS.map((d, i) => (
            <div key={d} className="streak-dot-wrap">
              <div className={`streak-dot ${weekDayActive[i] ? 'active' : ''} ${i === todayIdx ? 'today' : ''}`} />
              <span className="streak-dot-label">{d}</span>
            </div>
          ))}
        </div>
        {streak === 0 && <p className="chart-empty" style={{marginTop: 8}}>Hoàn thành task hôm nay để bắt đầu streak!</p>}
      </div>
    </div>
  )
}
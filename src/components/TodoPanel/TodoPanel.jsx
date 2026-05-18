import React, { useState, useEffect, useRef } from 'react'
import './TodoPanel.css'

const QUOTES = [
  { text: "Học hỏi không bao giờ là đủ. Trí tuệ không bao giờ có giới hạn.", author: "Albert Einstein" },
  { text: "Sự khác biệt giữa người bình thường và người xuất sắc là sự nỗ lực.", author: "Vince Lombardi" },
  { text: "Đừng sợ thất bại. Hãy sợ bỏ cuộc.", author: "Michael Jordan" },
  { text: "Mỗi ngày đều là cơ hội để học điều gì đó mới.", author: "Khuyết danh" },
  { text: "Tri thức là sức mạnh. Thông tin là giải phóng.", author: "Kofi Annan" },
]

const SUBJECTS = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'CNTT']
const PRIORITIES = [
  { value: 'high', label: 'Cao', color: 'var(--accent-red)' },
  { value: 'medium', label: 'TB', color: 'var(--accent-amber)' },
  { value: 'low', label: 'Thấp', color: 'var(--accent-green)' },
]

function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? defaultVal }
    catch { return defaultVal }
  })
  const save = (v) => {
    setVal(v)
    localStorage.setItem(key, JSON.stringify(v))
  }
  return [val, save]
}

export default function TodoPanel({ user, activePage, theme, toggleTheme, onLogout }) {
  const storageKey = `studyflow_tasks_${user.id}`
  const notesKey = `studyflow_notes_${user.id}`
  const bookmarkKey = `studyflow_bookmarks_${user.id}`
  const scheduleKey = `studyflow_schedule_${user.id}`
  const statsKey = `studyflow_stats_${user.id}`
  const DEFAULT_SCHEDULE = { T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] }

  const [tasks, setTasks] = useLocalStorage(storageKey, [])
  const [notes, setNotes] = useLocalStorage(notesKey, '')
  const [bookmarks, setBookmarks] = useLocalStorage(bookmarkKey, [])
  const [schedule, setSchedule] = useLocalStorage(scheduleKey, DEFAULT_SCHEDULE)
  const [stats, setStats] = useLocalStorage(statsKey, { totalCreated: 0, totalDeleted: 0 })

  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [newTask, setNewTask] = useState({ title: '', subject: '', priority: '', deadline: '' })
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editingNote, setEditingNote] = useState(false)
  const [bookmarkInput, setBookmarkInput] = useState({ title: '', url: '' })
  const [showBMForm, setShowBMForm] = useState(false)
  const [editingDay, setEditingDay] = useState(null)
  const [newSubjectInput, setNewSubjectInput] = useState('')
  const [confirm, setConfirm] = useState(null) // { type: 'single'|'all', id?: number }
  const inputRef = useRef()

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus()
  }, [showForm])

  const quote = QUOTES[quoteIdx]

  const [taskFormError, setTaskFormError] = useState('')

  const addTask = () => {
    if (!newTask.title.trim()) {
      setTaskFormError('Vui lòng nhập tên nhiệm vụ.')
      return
    }
    if (!newTask.subject) {
      setTaskFormError('Vui lòng chọn môn học.')
      return
    }
    if (!newTask.priority) {
      setTaskFormError('Vui lòng chọn mức độ ưu tiên.')
      return
    }
    if (!newTask.deadline) {
      setTaskFormError('Vui lòng chọn ngày deadline.')
      return
    }
    setTaskFormError('')
    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      subject: newTask.subject,
      priority: newTask.priority,
      deadline: newTask.deadline,
      done: false,
      createdAt: Date.now(),
    }
    setTasks([task, ...tasks])
    setStats({ ...stats, totalCreated: stats.totalCreated + 1 })
    setNewTask({ title: '', subject: '', priority: '', deadline: '' })
    setShowForm(false)
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t
      const nowDone = !t.done
      return { ...t, done: nowDone, completedAt: nowDone ? Date.now() : null }
    }))
  }

  const requestDelete = (id) => setConfirm({ type: 'single', id })
  const requestDeleteAll = () => setConfirm({ type: 'all' })

  const confirmAction = () => {
    if (confirm.type === 'single') {
      setTasks(tasks.filter(t => t.id !== confirm.id))
      setStats({ ...stats, totalDeleted: stats.totalDeleted + 1 })
    }
    if (confirm.type === 'all') {
      const deletedCount = tasks.filter(t => t.done).length
      setTasks(tasks.filter(t => !t.done))
      setStats({ ...stats, totalDeleted: stats.totalDeleted + deletedCount })
    }
    setConfirm(null)
  }

  const addBookmark = () => {
    if (!bookmarkInput.title.trim()) return
    setBookmarks([{ id: Date.now(), ...bookmarkInput }, ...bookmarks])
    setBookmarkInput({ title: '', url: '' })
    setShowBMForm(false)
  }

  const removeBookmark = (id) => setBookmarks(bookmarks.filter(b => b.id !== id))

  const filtered = filter === 'all'
    ? tasks
    : filter === 'done'
      ? tasks.filter(t => t.done)
      : tasks.filter(t => !t.done)

  const getPriority = (val) => PRIORITIES.find(p => p.value === val)

  if (activePage === 'bookmarks') {
    return (
      <div className="todo-panel">
        <div className="todo-header">
          <div>
            <h2 className="todo-heading">Bookmark</h2>
            <p className="todo-subheading">Tài liệu đã lưu</p>
          </div>
          <button className="add-btn" onClick={() => setShowBMForm(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm
          </button>
        </div>

        {showBMForm && (
          <div className="task-form">
            <input
              className="form-input"
              placeholder="Tên tài liệu..."
              value={bookmarkInput.title}
              onChange={e => setBookmarkInput({ ...bookmarkInput, title: e.target.value })}
            />
            <input
              className="form-input"
              placeholder="URL (tuỳ chọn)"
              value={bookmarkInput.url}
              onChange={e => setBookmarkInput({ ...bookmarkInput, url: e.target.value })}
            />
            <div className="form-actions">
              <button className="form-save" onClick={addBookmark}>Lưu</button>
              <button className="form-cancel" onClick={() => setShowBMForm(false)}>Huỷ</button>
            </div>
          </div>
        )}

        <div className="bm-list">
          {bookmarks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <p>Chưa có bookmark nào</p>
            </div>
          )}
          {bookmarks.map(bm => (
            <div key={bm.id} className="bm-item">
              <div className="bm-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </div>
              <div className="bm-content">
                <span className="bm-title">{bm.title}</span>
                {bm.url && <a className="bm-url" href={bm.url} target="_blank" rel="noopener noreferrer">{bm.url}</a>}
              </div>
              <button className="bm-delete" onClick={() => removeBookmark(bm.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activePage === 'subjects') {
    const subjectStats = SUBJECTS.map(sub => ({
      name: sub,
      total: tasks.filter(t => t.subject === sub).length,
      done: tasks.filter(t => t.subject === sub && t.done).length,
    }))
    return (
      <div className="todo-panel">
        <div className="todo-header">
          <div>
            <h2 className="todo-heading">Môn học</h2>
            <p className="todo-subheading">Tiến độ theo môn</p>
          </div>
        </div>
        <div className="subjects-grid">
          {subjectStats.map(s => (
            <div key={s.name} className="subject-card">
              <span className="subject-name">{s.name}</span>
              <div className="subject-bar-wrap">
                <div
                  className="subject-bar-fill"
                  style={{ width: s.total > 0 ? `${(s.done / s.total) * 100}%` : '0%' }}
                />
              </div>
              <span className="subject-count">{s.done}/{s.total} task</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activePage === 'schedule') {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    const today = new Date().getDay()
    const todayIdx = today === 0 ? 6 : today - 1

    const addSubjectToDay = (day) => {
      const val = newSubjectInput.trim()
      if (!val) return
      const current = schedule[day] || []
      if (current.includes(val)) return
      setSchedule({ ...schedule, [day]: [...current, val] })
      setNewSubjectInput('')
      setEditingDay(null)
    }

    const removeSubjectFromDay = (day, sub) => {
      setSchedule({ ...schedule, [day]: (schedule[day] || []).filter(s => s !== sub) })
    }

    return (
      <div className="todo-panel">
        <div className="todo-header">
          <div>
            <h2 className="todo-heading">Lịch học</h2>
            <p className="todo-subheading">Nhấn vào ngày để chỉnh sửa môn học</p>
          </div>
          <button
            className="add-btn"
            onClick={() => { setSchedule({ T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] }); setEditingDay(null) }}
            style={{ background: 'var(--surface3)', color: 'var(--text-secondary)', fontSize: 12 }}
          >
            Xoá tất cả
          </button>
        </div>
        <div className="schedule-grid">
          {days.map((day, i) => {
            const subs = schedule[day] || []
            const isEditing = editingDay === day
            return (
              <div key={day} className={`schedule-day ${i === todayIdx ? 'today' : ''}`}>
                <div className="schedule-day-header">
                  <span className="schedule-day-label">{day}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i === todayIdx && <span className="today-badge">Hôm nay</span>}
                    <button
                      className="schedule-edit-btn"
                      onClick={() => { setEditingDay(isEditing ? null : day); setNewSubjectInput('') }}
                    >
                      {isEditing ? '✕' : '✏️'}
                    </button>
                  </div>
                </div>

                <div className="schedule-subjects">
                  {subs.length === 0 && !isEditing && (
                    <span className="schedule-free">Nghỉ</span>
                  )}
                  {subs.map(sub => (
                    <span key={sub} className="schedule-subject">
                      {sub}
                      {isEditing && (
                        <button
                          className="schedule-subject-del"
                          onClick={() => removeSubjectFromDay(day, sub)}
                        >×</button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="schedule-add-row">
                    <select
                      className="form-select schedule-select"
                      value={newSubjectInput}
                      onChange={e => setNewSubjectInput(e.target.value)}
                    >
                      <option value="">Chọn môn...</option>
                      {SUBJECTS.filter(s => !subs.includes(s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      className="schedule-add-confirm"
                      onClick={() => addSubjectToDay(day)}
                    >+</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (activePage === 'settings') {
    return (
      <div className="todo-panel">
        <div className="todo-header">
          <div>
            <h2 className="todo-heading">Cài đặt</h2>
            <p className="todo-subheading">Tài khoản & ứng dụng</p>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-user-card">
            <div className="settings-avatar">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="settings-user-name">{user.name}</p>
              <p className="settings-user-email">{user.email}</p>
            </div>
          </div>

          <div className="settings-stats">
            <div className="settings-stat">
              <span className="settings-stat-val">{stats.totalCreated}</span>
              <span className="settings-stat-label">Đã tạo</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-val">{tasks.filter(t => t.done).length + stats.totalDeleted}</span>
              <span className="settings-stat-label">Đã xong</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-val">{stats.totalDeleted}</span>
              <span className="settings-stat-label">Đã xoá</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-title">
                {theme === 'dark' ? '🌙 Giao diện tối' : '☀️ Giao diện sáng'}
              </span>
              <span className="settings-row-desc">
                {theme === 'dark' ? 'Đang dùng Dark Mode' : 'Đang dùng Light Mode'}
              </span>
            </div>
            <button
              className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="theme-toggle-thumb" />
            </button>
          </div>

          {/* Logout */}
          <button className="settings-logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }

  // Home (default)
  return (
    <div className="todo-panel">
      {/* Quote */}
      <div className="quote-card">
        <div className="quote-mark">"</div>
        <p className="quote-text">{quote.text}</p>
        <span className="quote-author">— {quote.author}</span>
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="confirm-overlay" onClick={() => setConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <p className="confirm-title">
              {confirm.type === 'all' ? 'Xoá tất cả task?' : 'Xoá task này?'}
            </p>
            <p className="confirm-desc">
              {confirm.type === 'all'
                ? `${tasks.filter(t => t.done).length} task đã hoàn thành sẽ bị xoá vĩnh viễn.`
                : `"${tasks.find(t => t.id === confirm.id)?.title}" sẽ bị xoá.`}
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirm(null)}>Huỷ</button>
              <button className="confirm-ok" onClick={confirmAction}>Xoá</button>
            </div>
          </div>
        </div>
      )}

      {/* Todo Header */}
      <div className="todo-header">
        <div>
          <h2 className="todo-heading">Nhiệm vụ học tập</h2>
          <p className="todo-subheading">
            {tasks.filter(t => t.done).length} hoàn thành · {stats.totalCreated} task tổng cộng
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tasks.filter(t => t.done).length > 0 && (
            <button className="delete-all-btn" onClick={requestDeleteAll}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Xoá đã hoàn thành
            </button>
          )}
          <button className="add-btn" onClick={() => setShowForm(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm task
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="task-form">
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Tên nhiệm vụ..."
            value={newTask.title}
            onChange={e => { setNewTask({ ...newTask, title: e.target.value }); setTaskFormError('') }}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <div className="form-row">
            <select
              className={`form-select ${taskFormError && !newTask.subject ? 'input-error' : ''}`}
              value={newTask.subject}
              onChange={e => { setNewTask({ ...newTask, subject: e.target.value }); setTaskFormError('') }}
            >
              <option value="">Chọn môn học</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className={`form-select ${taskFormError && !newTask.priority ? 'input-error' : ''}`}
              value={newTask.priority}
              onChange={e => { setNewTask({ ...newTask, priority: e.target.value }); setTaskFormError('') }}
            >
              <option value="">Chọn mức độ ưu tiên</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input
              type="date"
              className={`form-input form-date ${taskFormError && !newTask.deadline ? 'input-error' : ''}`}
              value={newTask.deadline}
              onChange={e => { setNewTask({ ...newTask, deadline: e.target.value }); setTaskFormError('') }}
            />
          </div>
          {taskFormError && (
            <div className="task-form-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {taskFormError}
            </div>
          )}
          <div className="form-actions">
            <button className="form-save" onClick={addTask}>Lưu</button>
            <button className="form-cancel" onClick={() => { setShowForm(false); setTaskFormError('') }}>Huỷ</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'todo', 'done'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tất cả' : f === 'todo' ? 'Chờ làm' : 'Xong'}
            <span className="filter-count">
              {f === 'all' ? tasks.length : f === 'done' ? tasks.filter(t => t.done).length : tasks.filter(t => !t.done).length}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>{filter === 'done' ? 'Chưa hoàn thành task nào' : 'Không có task nào'}</p>
          </div>
        )}
        {filtered.map(task => {
          const priority = getPriority(task.priority) || { color: 'var(--text-muted)', label: '—' }
          return (
            <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
              <button
                className={`task-check ${task.done ? 'checked' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  <span className="task-subject">{task.subject}</span>
                  <span className="task-priority" style={{ color: priority.color }}>
                    ● {priority.label}
                  </span>
                  {task.deadline && (
                    <span className="task-deadline">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {task.deadline}
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`task-delete ${!task.done ? 'task-delete-disabled' : ''}`}
                onClick={() => task.done && requestDelete(task.id)}
                disabled={!task.done}
                title={task.done ? 'Xoá task' : 'Chỉ xoá được task đã hoàn thành'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Quick Notes */}
      <div className="notes-section">
        <div className="notes-header">
          <span className="notes-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Ghi chú nhanh
          </span>
          <button
            className="notes-edit-btn"
            onClick={() => setEditingNote(v => !v)}
          >
            {editingNote ? 'Lưu' : 'Sửa'}
          </button>
        </div>
        {editingNote ? (
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ghi chú học tập của bạn ở đây..."
            rows={4}
          />
        ) : (
          <div className="notes-display">
            {notes || <span className="notes-placeholder">Nhấn "Sửa" để thêm ghi chú...</span>}
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useRef, useEffect, useMemo } from 'react'
import './App.css'

const SEED = [
  { id: 1, text: 'install openssh-server on the VM', done: true },
  { id: 2, text: 'connect with PuTTY over port 2222', done: true },
  { id: 3, text: 'write a Dockerfile for this app', done: false },
  { id: 4, text: 'docker build && docker run', done: false },
]

const FILTERS = ['all', 'active', 'done']

export default function App() {
  const [tasks, setTasks] = useState(SEED)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')
  const nextId = useRef(SEED.length + 1)
  const editInputRef = useRef(null)

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const doneCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.done)
    if (filter === 'done') return tasks.filter(t => t.done)
    return tasks
  }, [tasks, filter])

  function addTask(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTasks(prev => [{ id: nextId.current++, text, done: false }, ...prev])
    setDraft('')
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditDraft(task.text)
  }

  function commitEdit(id) {
    const text = editDraft.trim()
    if (text) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))
    }
    setEditingId(null)
  }

  function handleEditKey(e, id) {
    if (e.key === 'Enter') commitEdit(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className="app-shell">
      <div className="board">
        <header className="board-header">
          <div className="board-heading">
            <h1>Tasklog</h1>
            <p className="board-subtitle">
              {totalCount === 0 ? 'nothing tracked yet' : `${doneCount} of ${totalCount} tasks done`}
            </p>
          </div>
          <div className="progress-ring" style={{ '--progress': `${progress}%` }}>
            <span>{progress}%</span>
          </div>
        </header>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <form className="add-form" onSubmit={addTask}>
          <input
            className="add-input"
            type="text"
            placeholder="What needs to get done?"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            aria-label="new task"
          />
          <button className="add-button" type="submit">Add task</button>
        </form>

        <nav className="filter-tabs" aria-label="filter tasks">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </nav>

        <ul className="task-list">
          {visibleTasks.length === 0 && (
            <li className="empty-state">
              {filter === 'done' ? 'no completed tasks yet.' : filter === 'active' ? 'nothing left — nice work.' : 'add your first task above.'}
            </li>
          )}
          {visibleTasks.map(task => (
            <li key={task.id} className={`task-card ${task.done ? 'is-done' : ''}`}>
              <button
                className="task-check"
                onClick={() => toggleTask(task.id)}
                aria-pressed={task.done}
                title={task.done ? 'mark as active' : 'mark as done'}
              >
                {task.done && (
                  <svg viewBox="0 0 20 20" width="12" height="12" fill="none">
                    <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {editingId === task.id ? (
                <input
                  ref={editInputRef}
                  className="task-edit-input"
                  value={editDraft}
                  onChange={e => setEditDraft(e.target.value)}
                  onBlur={() => commitEdit(task.id)}
                  onKeyDown={e => handleEditKey(e, task.id)}
                />
              ) : (
                <span
                  className="task-text"
                  onDoubleClick={() => startEdit(task)}
                  title="double-click to edit"
                >
                  {task.text}
                </span>
              )}

              <span className="task-actions">
                <button className="icon-button" onClick={() => startEdit(task)} aria-label="edit task">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                    <path d="M13.5 3.5l3 3L6 17l-3.5.5L3 14 13.5 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="icon-button icon-button-danger" onClick={() => deleteTask(task.id)} aria-label="delete task">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                    <path d="M4 5.5h12M8 5.5V4a1 1 0 011-1h2a1 1 0 011 1v1.5M5.5 5.5l.7 10a1 1 0 001 .9h5.6a1 1 0 001-.9l.7-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>

        <footer className="board-footer">
          <span>tasklog · static frontend · in-memory state</span>
        </footer>
      </div>
    </div>
  )
}
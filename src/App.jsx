import { useState, useRef, useEffect } from 'react'
import './App.css'

const SEED = [
  { id: 1, text: 'install openssh-server on the VM', done: true },
  { id: 2, text: 'connect with PuTTY over port 2222', done: true },
  { id: 3, text: 'write a Dockerfile for this app', done: false },
  { id: 4, text: 'docker build && docker run', done: false },
]

function pad(n) {
  return String(n).padStart(3, '0')
}

export default function App() {
  const [tasks, setTasks] = useState(SEED)
  const [draft, setDraft] = useState('')
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

  const openCount = tasks.filter(t => !t.done).length
  const doneCount = tasks.length - openCount

  function addTask(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTasks(prev => [...prev, { id: nextId.current++, text, done: false }])
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
    <div className="page">
      <div className="log">
        <header className="log-header">
          <div className="log-title">
            <span className="log-title-mark">~/</span>
            <h1>tasklog</h1>
          </div>
          <div className="log-status" aria-label="task counts">
            <span className="status-chip status-open">{pad(openCount)} open</span>
            <span className="status-chip status-done">{pad(doneCount)} done</span>
          </div>
        </header>

        <form className="entry-bar" onSubmit={addTask}>
          <span className="entry-caret">&gt;</span>
          <input
            className="entry-input"
            type="text"
            placeholder="log a new task and press enter..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            aria-label="new task"
          />
          <button className="entry-submit" type="submit">add</button>
        </form>

        <ul className="entries">
          {tasks.length === 0 && (
            <li className="empty-state">no entries yet — log your first task above.</li>
          )}
          {tasks.map((task, i) => (
            <li key={task.id} className={`entry ${task.done ? 'is-done' : ''}`}>
              <span className="entry-index">[{pad(i + 1)}]</span>

              <button
                className="entry-toggle"
                onClick={() => toggleTask(task.id)}
                aria-pressed={task.done}
                title={task.done ? 'mark as open' : 'mark as done'}
              >
                <span className="entry-toggle-box">{task.done ? '✓' : ''}</span>
              </button>

              {editingId === task.id ? (
                <input
                  ref={editInputRef}
                  className="entry-edit-input"
                  value={editDraft}
                  onChange={e => setEditDraft(e.target.value)}
                  onBlur={() => commitEdit(task.id)}
                  onKeyDown={e => handleEditKey(e, task.id)}
                />
              ) : (
                <span
                  className="entry-text"
                  onDoubleClick={() => startEdit(task)}
                  title="double-click to edit"
                >
                  {task.text}
                </span>
              )}

              <span className="entry-actions">
                <button className="entry-action" onClick={() => startEdit(task)}>edit</button>
                <button className="entry-action entry-action-danger" onClick={() => deleteTask(task.id)}>delete</button>
              </span>
            </li>
          ))}
        </ul>

        <footer className="log-footer">
          <span className="session-tag">session:// static-frontend · in-memory state</span>
        </footer>
      </div>
    </div>
  )
}

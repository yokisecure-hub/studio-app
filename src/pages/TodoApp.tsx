import { useState, useEffect } from 'react'
import './TodoApp.css'

interface Todo {
  id: number
  text: string
  done: boolean
}

const STORAGE_KEY = 'studio-todo-items'

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggle = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const remove = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const pending = todos.filter((t) => !t.done)
  const completed = todos.filter((t) => t.done)

  return (
    <div className="todo-app">
      <div className="todo-header">
        <h2>メモ / ToDo</h2>
        <span className="todo-count">{pending.length} 件</span>
      </div>

      <form
        className="todo-form"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          className="todo-input"
          type="text"
          placeholder="新しいタスクを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button className="todo-add-btn" type="submit">追加</button>
      </form>

      <ul className="todo-list">
        {pending.map((t) => (
          <li key={t.id} className="todo-item">
            <button className="todo-check" onClick={() => toggle(t.id)}>○</button>
            <span className="todo-text">{t.text}</span>
            <button className="todo-delete" onClick={() => remove(t.id)}>×</button>
          </li>
        ))}
      </ul>

      {completed.length > 0 && (
        <>
          <p className="todo-section-label">完了済み ({completed.length})</p>
          <ul className="todo-list">
            {completed.map((t) => (
              <li key={t.id} className="todo-item done">
                <button className="todo-check" onClick={() => toggle(t.id)}>●</button>
                <span className="todo-text">{t.text}</span>
                <button className="todo-delete" onClick={() => remove(t.id)}>×</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

import type { Page } from '../App'
import './Home.css'

const templates: { id: Page; icon: string; title: string; desc: string }[] = [
  { id: 'todo', icon: '📝', title: 'メモ / ToDo', desc: 'タスク管理・メモアプリ' },
  { id: 'camera', icon: '📷', title: 'カメラ', desc: 'カメラ撮影・写真表示' },
  { id: 'game', icon: '🎮', title: 'タップゲーム', desc: '制限時間内にタップで高得点' },
  { id: 'calc', icon: '🔢', title: '電卓', desc: '四則演算の計算機' },
]

export default function Home({ onSelect }: { onSelect: (p: Page) => void }) {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-icon">S</div>
        <h1>Studio App</h1>
        <p>テンプレートを選んでアプリを試そう</p>
      </section>
      <section className="home-grid">
        {templates.map((t) => (
          <button key={t.id} className="template-card" onClick={() => onSelect(t.id)}>
            <span className="template-icon">{t.icon}</span>
            <span className="template-title">{t.title}</span>
            <span className="template-desc">{t.desc}</span>
          </button>
        ))}
      </section>
    </div>
  )
}

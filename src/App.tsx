import { useState } from 'react'
import './App.css'

const tabs = [
  { id: 'home', icon: '\u2302', label: 'Home' },
  { id: 'search', icon: '\u2315', label: 'Search' },
  { id: 'settings', icon: '\u2699', label: 'Settings' },
]

const features = [
  { icon: '\u26A1', title: 'PWA対応', desc: 'ホーム画面に追加してネイティブ風に使えます' },
  { icon: '\uD83D\uDCF1', title: 'モバイル最適化', desc: 'スマホ画面にフィットするレスポンシブUI' },
  { icon: '\uD83D\uDD12', title: 'オフライン対応', desc: 'Service Workerで一度読み込めば通信不要' },
  { icon: '\uD83C\uDFA8', title: 'ダークテーマ', desc: '目に優しいダークモードをデフォルト採用' },
]

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="app">
      <header className="header">
        <h1>Studio App</h1>
      </header>

      <main className="content">
        <section className="hero">
          <div className="hero-icon">S</div>
          <h2>Welcome</h2>
          <p>あなたのモバイルアプリが完成しました。<br />ここから自由にカスタマイズできます。</p>
        </section>

        <section className="cards">
          {features.map((f) => (
            <div className="card" key={f.title}>
              <div className="card-icon">{f.icon}</div>
              <div className="card-body">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <nav className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App

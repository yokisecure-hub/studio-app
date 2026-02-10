import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import TodoApp from './pages/TodoApp'
import CameraApp from './pages/CameraApp'
import GameApp from './pages/GameApp'
import CalcApp from './pages/CalcApp'

export type Page = 'home' | 'todo' | 'camera' | 'game' | 'calc'

function App() {
  const [page, setPage] = useState<Page>('home')

  const goHome = () => setPage('home')

  return (
    <div className="app">
      {page !== 'home' && (
        <header className="header">
          <button className="back-btn" onClick={goHome}>← 戻る</button>
        </header>
      )}
      <main className="content">
        {page === 'home' && <Home onSelect={setPage} />}
        {page === 'todo' && <TodoApp />}
        {page === 'camera' && <CameraApp />}
        {page === 'game' && <GameApp />}
        {page === 'calc' && <CalcApp />}
      </main>
    </div>
  )
}

export default App

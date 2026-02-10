import { useState, useEffect, useRef, useCallback } from 'react'
import './GameApp.css'

const GAME_DURATION = 10

export default function GameApp() {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [best, setBest] = useState(() => {
    return Number(localStorage.getItem('studio-game-best') || '0')
  })
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)

  const start = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setState('playing')
  }, [])

  useEffect(() => {
    if (state !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setState('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [state])

  useEffect(() => {
    if (state === 'done' && score > best) {
      setBest(score)
      localStorage.setItem('studio-game-best', String(score))
    }
  }, [state, score, best])

  const tap = () => {
    if (state === 'playing') setScore((s) => s + 1)
  }

  return (
    <div className="game-app">
      <h2>タップゲーム</h2>
      <p className="game-desc">
        {GAME_DURATION}秒間でできるだけ多くタップしよう!
      </p>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-value">{score}</span>
          <span className="stat-label">スコア</span>
        </div>
        <div className="stat">
          <span className="stat-value">{timeLeft}s</span>
          <span className="stat-label">残り時間</span>
        </div>
        <div className="stat">
          <span className="stat-value">{best}</span>
          <span className="stat-label">ベスト</span>
        </div>
      </div>

      {state === 'idle' && (
        <button className="game-start-btn" onClick={start}>
          スタート
        </button>
      )}

      {state === 'playing' && (
        <button className="game-tap-btn" onClick={tap}>
          TAP!
        </button>
      )}

      {state === 'done' && (
        <div className="game-result">
          <p className="result-score">{score} 回</p>
          {score >= best && score > 0 && (
            <p className="result-best">ハイスコア!</p>
          )}
          <button className="game-start-btn" onClick={start}>
            もう一回
          </button>
        </div>
      )}
    </div>
  )
}

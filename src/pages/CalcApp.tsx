import { useState } from 'react'
import './CalcApp.css'

const buttons = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

export default function CalcApp() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [reset, setReset] = useState(false)

  const calc = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handlePress = (btn: string) => {
    if (btn >= '0' && btn <= '9') {
      if (reset) {
        setDisplay(btn)
        setReset(false)
      } else {
        setDisplay(display === '0' ? btn : display + btn)
      }
      return
    }

    if (btn === '.') {
      if (reset) {
        setDisplay('0.')
        setReset(false)
      } else if (!display.includes('.')) {
        setDisplay(display + '.')
      }
      return
    }

    if (btn === 'C') {
      setDisplay('0')
      setPrev(null)
      setOp(null)
      setReset(false)
      return
    }

    if (btn === '±') {
      setDisplay(String(-parseFloat(display)))
      return
    }

    if (btn === '%') {
      setDisplay(String(parseFloat(display) / 100))
      return
    }

    if (btn === '=') {
      if (prev !== null && op) {
        const result = calc(prev, parseFloat(display), op)
        setDisplay(String(result))
        setPrev(null)
        setOp(null)
        setReset(true)
      }
      return
    }

    // Operator pressed
    if (prev !== null && op && !reset) {
      const result = calc(prev, parseFloat(display), op)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(parseFloat(display))
    }
    setOp(btn)
    setReset(true)
  }

  return (
    <div className="calc-app">
      <div className="calc-display">
        <span className="calc-value">{display}</span>
      </div>
      <div className="calc-buttons">
        {buttons.map((row, ri) => (
          <div key={ri} className="calc-row">
            {row.map((btn) => (
              <button
                key={btn}
                className={`calc-btn ${
                  ['+', '−', '×', '÷', '='].includes(btn) ? 'op' : ''
                } ${['C', '±', '%'].includes(btn) ? 'fn' : ''} ${
                  btn === '0' ? 'zero' : ''
                }`}
                onClick={() => handlePress(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

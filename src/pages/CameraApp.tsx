import { useState, useRef, useCallback } from 'react'
import './CameraApp.css'

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreaming(true)
      }
    } catch {
      setError('カメラにアクセスできません。権限を確認してください。')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setStreaming(false)
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.85))
    stopCamera()
  }, [stopCamera])

  return (
    <div className="camera-app">
      <h2>カメラ</h2>

      {error && <p className="camera-error">{error}</p>}

      {photo ? (
        <div className="camera-preview">
          <img src={photo} alt="撮影した写真" />
          <div className="camera-actions">
            <button className="cam-btn" onClick={() => { setPhoto(null); startCamera() }}>
              撮り直す
            </button>
            <a className="cam-btn primary" href={photo} download="photo.jpg">
              保存
            </a>
          </div>
        </div>
      ) : (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={streaming ? 'active' : ''}
          />
          {!streaming ? (
            <button className="cam-btn primary start-btn" onClick={startCamera}>
              カメラを起動
            </button>
          ) : (
            <button className="shutter-btn" onClick={takePhoto}>
              <span className="shutter-inner" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

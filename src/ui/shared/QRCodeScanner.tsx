import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface QRCodeScannerProps {
  onScan: (text: string) => void
  onCancel: () => void
}

export function QRCodeScanner({ onScan, onCancel }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let frameId: number
    let stopped = false
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    function tick() {
      const video = videoRef.current
      if (stopped || !video || !context) return
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(imageData.data, imageData.width, imageData.height)
        if (result?.data) {
          onScan(result.data)
          return
        }
      }
      frameId = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        if (stopped) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }
        stream = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
        frameId = requestAnimationFrame(tick)
      })
      .catch(() => setError("Impossible d'acceder a la camera."))

    return () => {
      stopped = true
      cancelAnimationFrame(frameId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onScan])

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    )
  }

  return (
    <div>
      <video ref={videoRef} muted playsInline style={{ width: '100%', maxWidth: 320, borderRadius: 8 }} />
      <button type="button" onClick={onCancel}>
        Annuler
      </button>
    </div>
  )
}

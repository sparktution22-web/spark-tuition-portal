import { useEffect, useRef, useState } from 'react'
import { FiCheckCircle, FiXCircle, FiLogOut, FiCamera } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { kioskCheckIn } from '../services/api/sheetsApi.js'

const SCANNER_ID = 'spark-kiosk-scanner'

export default function KioskCheckIn() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const busyRef = useRef(false) // prevents double-processing the same scan
  const [libReady, setLibReady] = useState(false)
  const [status, setStatus] = useState(null) // { ok, name, action, time, message }
  const [cameraError, setCameraError] = useState('')

  // Load the html5-qrcode library from CDN once, on mount
  useEffect(() => {
    if (window.Html5Qrcode) {
      setLibReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js'
    script.onload = () => setLibReady(true)
    script.onerror = () => setCameraError('Could not load the scanner library. Check your internet connection.')
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!libReady) return

    const scanner = new window.Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    const onScanSuccess = async (decodedText) => {
      if (busyRef.current) return
      const rollNo = decodedText.trim().toUpperCase()
      // Basic sanity check — expect something like SPK002, not a stray QR
      if (!/^[A-Z]+\d+$/.test(rollNo)) return

      busyRef.current = true
      try {
        const result = await kioskCheckIn(rollNo)
        setStatus({
          ok: true,
          name: result.studentName,
          action: result.action,
          time: result.time
        })
      } catch (err) {
        setStatus({ ok: false, message: err.message || 'Could not process this scan.' })
      }
      // Show the confirmation for a few seconds, then resume scanning
      setTimeout(() => {
        setStatus(null)
        busyRef.current = false
      }, 3000)
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        onScanSuccess,
        () => {} // ignore per-frame "no QR found" noise
      )
      .catch((err) => {
        setCameraError('Could not access the camera: ' + (err?.message || err))
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [libReady])

  const exitKiosk = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 bg-spark-dark flex flex-col items-center justify-center text-white overflow-hidden">
      <button
        onClick={exitKiosk}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors z-20"
      >
        <FiLogOut size={16} /> Exit Kiosk
      </button>

      <div className="text-center mb-6">
        <p className="font-display font-extrabold text-3xl text-spark-orange">SPARK</p>
        <p className="text-white/50 text-sm mt-1">Hold your QR card up to the camera</p>
      </div>

      <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-4 border-white/10 bg-black">
        <div id={SCANNER_ID} className="w-full h-full" />

        {!libReady && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-spark-dark">
            <FiCamera className="animate-pulse text-white/40" size={40} />
            <p className="text-white/50 text-sm">Starting camera...</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-spark-dark px-6 text-center">
            <FiXCircle className="text-red-400" size={40} />
            <p className="text-white/70 text-sm">{cameraError}</p>
          </div>
        )}

        {status && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center ${status.ok ? 'bg-emerald-600/95' : 'bg-red-600/95'}`}>
            {status.ok ? (
              <>
                <FiCheckCircle size={56} />
                <div>
                  <p className="font-display font-bold text-2xl">{status.name}</p>
                  <p className="text-white/90 mt-1 capitalize">{status.action.replace('-', ' ')} at {status.time}</p>
                </div>
              </>
            ) : (
              <>
                <FiXCircle size={56} />
                <p className="font-semibold text-lg">{status.message}</p>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-white/30 text-xs mt-8">Scanning automatically &middot; no need to tap anything</p>
    </div>
  )
}

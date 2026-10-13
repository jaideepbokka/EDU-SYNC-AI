'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play,
  RotateCcw,
  Download,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

export function WelcomeClient() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)

  const DURATION = 10.0 // 10 seconds total

  // Sound generator using Web Audio API
  const playAmbientSound = useCallback((time: number) => {
    if (isMuted) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Grand chord at text entrance (4.5s)
      if (time >= 4.45 && time <= 4.55) {
        const freqs = [220, 277.18, 329.63, 440, 554.37, 659.25] // A Major chord
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = i % 2 === 0 ? 'sine' : 'triangle'
          osc.frequency.setValueAtTime(f, ctx.currentTime)
          gain.gain.setValueAtTime(0.001, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), ctx.currentTime + 0.1)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 2.6)
        })
      }

      // Sub-bass sweep at start (0.1s)
      if (time >= 0.1 && time <= 0.2) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(65, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 1.2)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 1.6)
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isMuted])

  // Start video recording with MediaRecorder
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !window.MediaRecorder) return

    try {
      const stream = canvas.captureStream(60) // 60 FPS
      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      const supportedType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType: supportedType,
        videoBitsPerSecond: 8000000, // 8 Mbps high quality
      })

      recordedChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setHasRecorded(true)
        setIsRecording(false)

        // Automatically upload to server so it is saved in /public and artifacts directory
        try {
          const form = new FormData()
          form.append('video', blob, 'edusing_welcome_10s.webm')
          const res = await fetch('/api/save-video', {
            method: 'POST',
            body: form,
          })
          if (res.ok) {
            console.log('VIDEO_SAVED_SUCCESSFULLY')
            if (typeof window !== 'undefined') {
              ;(window as any).__VIDEO_SAVED = true
            }
          }
        } catch (err) {
          console.warn('Could not auto-save video to server:', err)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch (e) {
      console.warn('MediaRecorder error:', e)
    }
  }, [])

  // Canvas Motion Graphics Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High DPI setup
    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.parentElement?.clientWidth || 1280
      const height = canvas.parentElement?.clientHeight || 720
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Particles system (120 animated stars/nodes)
    const particleCount = 100
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      baseAlpha: number
      color: string
    }[] = []

    const colors = ['#8B6DE9', '#625BEB', '#38BDF8', '#10B981', '#F59E0B', '#FFFFFF']
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        radius: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Auto start recording on initial play
    if (!hasRecorded && !isRecording) {
      setTimeout(() => startRecording(), 100)
    }

    const render = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - pausedTimeRef.current * 1000
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000
      setCurrentTime(Math.min(elapsed, DURATION))
      playAmbientSound(elapsed)

      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2))
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2))
      const cx = w / 2
      const cy = h / 2

      // Clear with deep space gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.8)
      bgGrad.addColorStop(0, '#111322')
      bgGrad.addColorStop(0.5, '#0B0D18')
      bgGrad.addColorStop(1, '#05060A')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // ==========================================
      // STAGE 1: AMBIENT NEURAL CONSTELLATION
      // ==========================================
      ctx.lineWidth = 0.6
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        // Converge particles toward center after 2.5s
        let currentVx = p.vx
        let currentVy = p.vy
        if (elapsed > 2.2 && elapsed < 5.0) {
          const dx = 0.5 - p.x
          const dy = 0.5 - p.y
          currentVx += dx * 0.03
          currentVy += dy * 0.03
        }

        p.x = (p.x + currentVx * 0.01 + 1) % 1
        p.y = (p.y + currentVy * 0.01 + 1) % 1

        const px = p.x * w
        const py = p.y * h

        ctx.beginPath()
        ctx.arc(px, py, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.baseAlpha * Math.min(1, elapsed * 1.5)
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0

        // Connect nearby particles with luminous lines
        for (let j = i + 1; j < particles.length; j += 4) {
          const p2 = particles[j]
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 0.12) {
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(p2.x * w, p2.y * h)
            ctx.strokeStyle = '#8B6DE9'
            ctx.globalAlpha = (1 - dist / 0.12) * 0.18
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // ==========================================
      // STAGE 2: 3D ROTATING HOLOGRAPHIC RINGS
      // ==========================================
      const ringScale = Math.min(1, elapsed / 2.0)
      const ringRot = elapsed * 0.8
      const ringRadius = Math.min(w, h) * 0.22 * ringScale

      // Ring 1: Violet/Indigo Eclipse
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(ringRot)
      ctx.beginPath()
      ctx.ellipse(0, 0, ringRadius, ringRadius * 0.45, Math.PI / 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#8B6DE9'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#8B6DE9'
      ctx.shadowBlur = 20
      ctx.globalAlpha = Math.min(0.85, elapsed * 0.6)
      ctx.stroke()
      ctx.restore()

      // Ring 2: Emerald/Teal Harmonic Counter-Rotation
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-ringRot * 1.3)
      ctx.beginPath()
      ctx.ellipse(0, 0, ringRadius * 0.9, ringRadius * 0.35, -Math.PI / 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 1.8
      ctx.shadowColor = '#10B981'
      ctx.shadowBlur = 18
      ctx.globalAlpha = Math.min(0.75, elapsed * 0.5)
      ctx.stroke()
      ctx.restore()

      // Central Pulsing Starlight Core
      const pulse = 1 + Math.sin(elapsed * 4) * 0.12
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * pulse)
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      coreGrad.addColorStop(0.2, 'rgba(139, 109, 233, 0.7)')
      coreGrad.addColorStop(0.5, 'rgba(98, 91, 235, 0.25)')
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, 70 * pulse, 0, Math.PI * 2)
      ctx.fill()

      // ==========================================
      // STAGE 3: EMBLEM DRAWING (2.5s – 4.5s)
      // ==========================================
      if (elapsed > 2.0) {
        const emblemProgress = Math.min(1, (elapsed - 2.0) / 1.5)
        const emblemSize = 44 * Math.min(1, (elapsed - 2.0) * 1.5)

        ctx.save()
        ctx.translate(cx, cy - (elapsed >= 4.5 ? Math.min(75, (elapsed - 4.5) * 60) : 0))
        ctx.globalAlpha = Math.min(1, (elapsed - 2.0) * 1.2)
        ctx.shadowColor = '#8B6DE9'
        ctx.shadowBlur = 25

        // Outer Shield Silhouette
        ctx.beginPath()
        ctx.moveTo(0, -emblemSize)
        ctx.quadraticCurveTo(emblemSize, -emblemSize * 0.8, emblemSize, 0)
        ctx.quadraticCurveTo(emblemSize * 0.8, emblemSize, 0, emblemSize * 1.3)
        ctx.quadraticCurveTo(-emblemSize * 0.8, emblemSize, -emblemSize, 0)
        ctx.quadraticCurveTo(-emblemSize, -emblemSize * 0.8, 0, -emblemSize)
        ctx.closePath()

        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Inner Graduation / AI Sparkle
        ctx.beginPath()
        ctx.arc(0, 0, emblemSize * 0.35, 0, Math.PI * 2 * emblemProgress)
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.restore()
      }

      // ==========================================
      // STAGE 4: "Welcome to Edusing" ENTRANCE (4.5s – 7.5s)
      // ==========================================
      if (elapsed >= 4.2) {
        const textProgress = Math.min(1, (elapsed - 4.2) / 1.0)
        const textAlpha = textProgress
        const textYOffset = (1 - textProgress) * 25

        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Font calculation based on viewport
        const fontSize = Math.min(54, Math.max(30, w * 0.055))
        ctx.font = `900 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

        // Glowing backdrop behind text
        ctx.shadowColor = 'rgba(139, 109, 233, 0.9)'
        ctx.shadowBlur = 35 * textProgress
        ctx.globalAlpha = textAlpha

        // Metallic / Iridescent Silver Gradient
        const textGrad = ctx.createLinearGradient(cx - 250, cy + 10, cx + 250, cy + 10)
        textGrad.addColorStop(0, '#FFFFFF')
        textGrad.addColorStop(0.35, '#E0E7FF')
        textGrad.addColorStop(0.5, '#C4B5FD')
        textGrad.addColorStop(0.7, '#A78BFA')
        textGrad.addColorStop(1, '#FFFFFF')

        ctx.fillStyle = textGrad
        ctx.fillText('Welcome to Edusing', cx, cy + 20 + textYOffset)

        // Shimmer specular sweep across letters (5.4s – 6.6s)
        if (elapsed > 5.2 && elapsed < 6.8) {
          const sweepX = cx - 300 + ((elapsed - 5.2) / 1.6) * 600
          const sweepGrad = ctx.createLinearGradient(sweepX - 60, 0, sweepX + 60, 0)
          sweepGrad.addColorStop(0, 'rgba(255,255,255,0)')
          sweepGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)')
          sweepGrad.addColorStop(1, 'rgba(255,255,255,0)')

          ctx.fillStyle = sweepGrad
          ctx.fillText('Welcome to Edusing', cx, cy + 20 + textYOffset)
        }

        // Subtitle Entrance (5.0s+)
        if (elapsed >= 5.0) {
          const subProgress = Math.min(1, (elapsed - 5.0) / 0.8)
          ctx.globalAlpha = subProgress * (elapsed < 7.5 ? 0.9 : 0)
          ctx.font = `600 ${Math.max(12, fontSize * 0.32)}px "Inter", sans-serif`
          ctx.fillStyle = '#94A3B8'
          ctx.shadowBlur = 10
          ctx.fillText('Next-Gen AI Academic & Biometric Operations Suite', cx, cy + 70)
        }

        ctx.restore()
      }

      // ==========================================
      // STAGE 5: REDIRECTION TRANSITION (7.5s – 10.0s)
      // ==========================================
      if (elapsed >= 7.3) {
        const redProgress = Math.min(1, (elapsed - 7.3) / 0.8)
        const countdownPercent = Math.min(100, Math.floor(((elapsed - 7.3) / 2.7) * 100))

        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.globalAlpha = redProgress

        // Status Card Pill
        const pillY = cy + 75
        const pillW = Math.min(360, w * 0.85)
        const pillH = 46

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.strokeStyle = '#38BDF8'
        ctx.lineWidth = 1.5
        ctx.shadowColor = '#38BDF8'
        ctx.shadowBlur = 18

        // Rounded rect pill
        ctx.beginPath()
        ctx.roundRect(cx - pillW / 2, pillY - pillH / 2, pillW, pillH, 16)
        ctx.fill()
        ctx.stroke()

        // Circular progress ring inside pill
        const ringX = cx - pillW / 2 + 28
        const ringY = pillY
        ctx.beginPath()
        ctx.arc(ringX, ringY, 11, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 2.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(ringX, ringY, 11, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * countdownPercent) / 100)
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Redirection Text
        ctx.font = '700 13px "Inter", sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowBlur = 0
        ctx.fillText(`Redirecting to Login Portal... ${countdownPercent}%`, cx + 12, pillY)

        ctx.restore()
      }

      // ==========================================
      // STAGE 6: PORTAL WARP & REDIRECT (9.2s – 10.0s)
      // ==========================================
      if (elapsed >= 9.0) {
        const warpProgress = (elapsed - 9.0) / 1.0 // 0 to 1
        ctx.save()
        const warpRadius = Math.max(w, h) * warpProgress * 1.5
        const warpGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, warpRadius)
        warpGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
        warpGrad.addColorStop(0.4, 'rgba(139, 109, 233, 0.8)')
        warpGrad.addColorStop(0.8, 'rgba(98, 91, 235, 0.4)')
        warpGrad.addColorStop(1, 'rgba(15, 23, 42, 0)')

        ctx.fillStyle = warpGrad
        ctx.globalAlpha = Math.min(1, warpProgress * 1.3)
        ctx.beginPath()
        ctx.arc(cx, cy, warpRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Check if animation finished (10.0s)
      if (elapsed >= DURATION) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
        setIsRedirecting(true)

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const isNoRedirect = urlParams?.has('noredirect') || (typeof window !== 'undefined' && (window as any).__NO_REDIRECT)

        if (!isNoRedirect) {
          setTimeout(() => {
            router.push('/?from=welcome')
          }, 1800)
        }
        return
      }

      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(render)
      }
    }

    animationFrameId.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [isPlaying, DURATION, hasRecorded, isRecording, playAmbientSound, router, startRecording])

  const handleReplay = () => {
    startTimeRef.current = null
    pausedTimeRef.current = 0
    setCurrentTime(0)
    setIsRedirecting(false)
    setIsPlaying(true)
    startRecording()
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn)
    } else {
      document.exitFullscreen().catch(console.warn)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#07090E] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Controls Overlay */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#8B6DE9]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              EduSync <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#8B6DE9]/30 border border-[#8B6DE9]/50 text-purple-200">AI MOTION</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">10-Second Welcome Motion Graphics Sequence</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hidden sm:flex"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-slate-300" />
          </button>

          {downloadUrl ? (
            <a
              href={downloadUrl}
              download="edusing_welcome_10s.webm"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Video</span>
            </a>
          ) : (
            <a
              href="/edusing_welcome_10s.webm"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Video</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => router.push('/?from=skip')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B6DE9] hover:bg-[#7A5CE5] text-white text-xs font-black shadow-lg shadow-[#8B6DE9]/30 transition-all cursor-pointer active:scale-95"
          >
            <span>Skip to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Screen: High-FPS Canvas Motion Graphics Engine */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Replay Overlay when video finishes */}
          {currentTime >= DURATION && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white shadow-xl shadow-[#8B6DE9]/40 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Redirecting to University Login...</h2>
              <p className="text-xs text-slate-300 max-w-md text-center">
                Authentication terminal active. Click below to re-watch the motion graphics animation or enter the portal immediately.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Animation (10s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/?from=intro')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6DE9] hover:bg-[#7A5CE5] text-white text-xs font-black shadow-lg shadow-[#8B6DE9]/40 transition-all cursor-pointer"
                >
                  <span>Go to Login Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Timeline Bar */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-2">
        {/* Progress Scrub Bar */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#8B6DE9] via-[#38BDF8] to-[#10B981] transition-all duration-75"
            style={{ width: `${(currentTime / DURATION) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              {isPlaying ? <span className="font-bold">❚❚ Pause</span> : <Play className="w-3.5 h-3.5 fill-white" />}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span>
              {currentTime.toFixed(1)}s / {DURATION.toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Recording 60FPS WebM Video</span>
              </span>
            )}
            <span className="text-slate-500">Auto-redirects to SSO Login at 10.0s</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

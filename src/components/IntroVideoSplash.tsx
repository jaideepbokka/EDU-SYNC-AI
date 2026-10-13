'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, FastForward, Play, Sparkles } from 'lucide-react'

interface IntroVideoSplashProps {
  videoId?: string
  onComplete?: () => void
}

export function IntroVideoSplash({
  videoId = 'B6r1cPFUmWA',
  onComplete,
}: IntroVideoSplashProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoStarted, setVideoStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasEndedRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)

  const handleFinish = () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    // Begin smooth 700ms cinematic fade-out directly revealing the login page
    setIsFading(true)
    setTimeout(() => {
      setIsPlaying(false)
      onComplete?.()
    }, 700)
  }

  // Safe helper to send commands to YouTube IFrame via postMessage
  const sendYtCommand = (func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    } catch {
      // Ignore cross-origin error
    }
  }

  // Toggle Mute / Unmute via YouTube postMessage API
  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)

    if (newMuted) {
      sendYtCommand('mute')
    } else {
      sendYtCommand('unMute')
      sendYtCommand('setVolume', [100])
    }
  }

  // Handle iframe initial load
  const handleIframeLoad = () => {
    // Request YouTube player to send events and ensure 1080p quality
    sendYtCommand('listening')
    sendYtCommand('setPlaybackQuality', ['hd1080'])
    sendYtCommand('playVideo')
    setVideoStarted(true)
    startTimeRef.current = Date.now()
  }

  // Handle postMessage events from YouTube IFrame Player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }

        // When playback begins
        if (
          (data?.event === 'infoDelivery' && data?.info?.playerState === 1) ||
          (data?.event === 'onStateChange' && data?.info === 1)
        ) {
          setVideoStarted(true)
          if (!startTimeRef.current) {
            startTimeRef.current = Date.now()
          }
        }

        // Detect video playback completion (playerState === 0 is ENDED)
        if (
          (data?.event === 'onStateChange' && data?.info === 0) ||
          (data?.event === 'infoDelivery' && data?.info?.playerState === 0)
        ) {
          handleFinish()
        }
      } catch {
        // Ignore non-json postMessages from browser extensions
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Video duration is exactly 10.0 seconds. Run smooth progress bar & completion timer.
  useEffect(() => {
    const VIDEO_DURATION_MS = 10500 // 10.5 seconds for complete animation
    const interval = setInterval(() => {
      if (!startTimeRef.current) return
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(100, (elapsed / VIDEO_DURATION_MS) * 100)
      setProgress(pct)

      if (elapsed >= VIDEO_DURATION_MS) {
        clearInterval(interval)
        handleFinish()
      }
    }, 100)

    // Absolute fallback safety timeout (in case of network latency):
    const fallbackTimer = setTimeout(() => {
      handleFinish()
    }, 12500)

    return () => {
      clearInterval(interval)
      clearTimeout(fallbackTimer)
    }
  }, [])

  if (!isPlaying) return null

  // Embed URL with 1080p parameter, modestbranding, and JS API enabled
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&playsinline=1&vq=hd1080&loop=0`

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Intro Animation"
    >
      {/* Cinematic Fullscreen 16:9 Aspect Video Container (Scales to completely fill any screen with 0 black bars) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          onLoad={handleIframeLoad}
          title="EduSync AI Intro Animation"
          className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] object-cover pointer-events-auto border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Top Floating Glassmorphic Control Bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-auto">
        {/* Left Branding Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
            EduSync <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/50 text-purple-200">AI</span>
          </span>
          <span className="text-[10px] sm:text-xs text-white/70 font-medium border-l border-white/20 pl-2">
            1080p HD Intro
          </span>
        </div>

        {/* Right Controls: Unmute & Skip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute/Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-300" />
                <span className="hidden xs:inline">Unmute Sound</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline">Sound Playing</span>
              </>
            )}
          </button>

          {/* Skip Intro Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/95 hover:bg-white text-slate-950 text-xs font-black transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer border border-white"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Progress Bar & Status Hint */}
      <div className="absolute bottom-4 sm:bottom-6 left-6 right-6 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/80 text-[11px] font-medium shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>Opening login terminal automatically when animation completes...</span>
        </div>

        {/* 10-Second Progress Line */}
        <div className="w-full max-w-xs h-1 rounded-full bg-white/20 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-500 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

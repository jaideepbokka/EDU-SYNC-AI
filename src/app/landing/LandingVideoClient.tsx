'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Zap,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Users,
  Award
} from 'lucide-react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export function LandingVideoClient() {
  const router = useRouter()
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoEnded, setVideoEnded] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef<any>(null)
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleRedirectToMainSite = useCallback(() => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current)
    }
    router.push('/login')
  }, [router])

  const handleVideoCompleted = useCallback(() => {
    if (videoEnded) return
    setVideoEnded(true)
    setIsPlaying(false)
    setCountdown(3)

    let current = 3
    redirectTimerRef.current = setInterval(() => {
      current -= 1
      setCountdown(current)
      if (current <= 0) {
        if (redirectTimerRef.current) clearInterval(redirectTimerRef.current)
        router.push('/login')
      }
    }, 1000)
  }, [videoEnded, router])

  // Initialize YouTube Iframe Player API
  useEffect(() => {
    let isMounted = true

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return

      try {
        if (playerRef.current) {
          return
        }

        playerRef.current = new window.YT.Player('landing-yt-iframe', {
          events: {
            onReady: (event: any) => {
              if (!isMounted) return
              setIsPlayerReady(true)
              try {
                // Ensure muted autoplay complies with modern browser security policies
                event.target.mute()
                event.target.playVideo()
                setIsPlaying(true)
              } catch (e) {
                console.warn('Autoplay initiation:', e)
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return
              // YT.PlayerState.ENDED is 0
              if (event.data === 0 || (window.YT && event.data === window.YT.PlayerState?.ENDED)) {
                handleVideoCompleted()
              } else if (event.data === 1) {
                setIsPlaying(true)
              } else if (event.data === 2) {
                setIsPlaying(false)
              }
            },
          },
        })
      } catch (err) {
        console.warn('YT Player init error:', err)
      }
    }

    // Check if YouTube API script is already on page
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const existingScript = document.getElementById('youtube-iframe-api')
      if (!existingScript) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        } else {
          document.head.appendChild(tag)
        }
      }

      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) {
          initPlayer()
        }
      }
    }

    // Fallback: cross-origin window postMessage listener for YouTube state change events
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const parsed = JSON.parse(event.data)
          if (parsed?.event === 'onStateChange' && parsed?.info === 0) {
            handleVideoCompleted()
          }
        }
      } catch {
        // Not a JSON message, ignore
      }
    }
    window.addEventListener('message', handleWindowMessage)

    return () => {
      isMounted = false
      window.removeEventListener('message', handleWindowMessage)
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current)
      }
    }
  }, [handleVideoCompleted])

  const toggleSound = () => {
    if (!playerRef.current) return
    try {
      if (isMuted) {
        playerRef.current.unMute()
        playerRef.current.setVolume(100)
        setIsMuted(false)
      } else {
        playerRef.current.mute()
        setIsMuted(true)
      }
    } catch (e) {
      console.warn('Toggle audio exception:', e)
    }
  }

  const restartVideo = () => {
    if (!playerRef.current) return
    try {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current)
      }
      setVideoEnded(false)
      setCountdown(null)
      playerRef.current.seekTo(0)
      playerRef.current.playVideo()
      setIsPlaying(true)
    } catch (e) {
      console.warn('Restart video exception:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col selection:bg-purple-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background radial ambient lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] bg-purple-700/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#070913]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">EduSync AI</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full tracking-wide">
                  PORTAL PREVIEW
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Institutional Academic Intelligence & Campus OS
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium rounded-lg transition-all border ${
                isMuted
                  ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
              }`}
              title={isMuted ? 'Click to unmute video audio' : 'Click to mute video audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span className="hidden xs:inline">Muted (Autoplay)</span>
                  <span className="text-amber-400 font-semibold underline text-[11px]">Unmute 🔊</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Audio Playing</span>
                </>
              )}
            </button>

            {/* Direct Skip to Main Website Button */}
            <button
              onClick={handleRedirectToMainSite}
              type="button"
              className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-purple-600/25 border border-purple-400/30 hover:border-purple-300 transition-all duration-200 active:scale-95"
            >
              <span>Enter Main Website</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Showcase Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 max-w-7xl mx-auto w-full">
        {/* Title & Status Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Official Video Introduction</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[11px] text-emerald-400 font-semibold">Autoplaying</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Generation <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">AI Campus Portal</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Watch the video presentation below. Once the video finishes, you will automatically be redirected to the main website login terminal.
          </p>
        </div>

        {/* Video Player Theater Wrapper */}
        <div className="w-full max-w-4xl relative mx-auto group">
          {/* Neon Glow Rim */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 rounded-3xl opacity-40 blur-xl group-hover:opacity-60 transition duration-500" />

          {/* Player Container */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0c101d] border border-white/15 shadow-2xl ring-1 ring-white/10 flex flex-col">
            {/* Player Frame with exact user iframe attributes */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                id="landing-yt-iframe"
                width="560"
                height="315"
                src="https://www.youtube.com/embed/B6r1cPFUmwA?autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin=https://edu-sync-ai.vercel.app"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              />

              {/* Video Finished Completion Overlay */}
              {videoEnded && (
                <div className="absolute inset-0 bg-[#070913]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    Video Presentation Completed!
                  </h3>
                  <p className="text-gray-300 max-w-md text-sm sm:text-base mb-6">
                    Redirecting you to the main EduSync AI portal in{' '}
                    <span className="text-purple-400 font-bold text-lg">{countdown ?? 1}s</span>...
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleRedirectToMainSite}
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <span>Proceed to Main Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={restartVideo}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white font-medium rounded-xl text-sm border border-white/15 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Replay Video</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Control & Status Toolbar */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#090d19]/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-medium text-white">
                  {videoEnded
                    ? 'Video Finished — Transferring'
                    : isPlaying
                    ? 'Playing Presentation'
                    : 'Paused Presentation'}
                </span>
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-gray-400 hidden sm:inline">
                  Automatic redirection active on finish
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSound}
                  type="button"
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 underline font-semibold">Unmute Sound</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mute</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRedirectToMainSite}
                  type="button"
                  className="font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <span>Skip Video</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {/* Card 1 */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-purple-500/40 transition-all hover:bg-white/[0.06] group">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Instant Biometrics & RFID</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time attendance capture synchronized directly with faculty attendance registers without delay.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-indigo-500/40 transition-all hover:bg-white/[0.06] group">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Accurate Semester CGPA</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Live semester grade projections, grade card verifications, and credit tracking for students and advisors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-cyan-500/40 transition-all hover:bg-white/[0.06] group">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Unified Institutional Portal</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dedicated workspaces for Students, Faculty Members, and HOD with interactive assessments and messaging.
            </p>
          </div>
        </div>

        {/* Quick Portal Switcher Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-400">
          <span className="text-gray-500">Quick Entrance:</span>
          <button
            onClick={() => router.push('/login?role=STUDENT')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-purple-500/40 transition-all"
          >
            🎓 Student Portal
          </button>
          <button
            onClick={() => router.push('/login?role=FACULTY')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-purple-500/40 transition-all"
          >
            👨‍🏫 Faculty Desk
          </button>
          <button
            onClick={() => router.push('/login?role=HOD')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-purple-500/40 transition-all"
          >
            🏛️ HOD Office
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#070913]/90 py-4 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} EduSync AI Academic Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-Bit Encrypted</span>
            </span>
            <span>•</span>
            <button
              onClick={handleRedirectToMainSite}
              className="text-purple-400 hover:text-purple-300 font-medium underline"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

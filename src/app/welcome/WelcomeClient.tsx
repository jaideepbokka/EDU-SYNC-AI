'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'


export function WelcomeClient() {
  const router = useRouter()
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
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
  const isPlayingRef = useRef(true)
  const isRecordingRef = useRef(false)
  const hasRecordedRef = useRef(false)
  const recordCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const recordCtxRef = useRef<CanvasRenderingContext2D | null>(null)

  const DURATION = 10.0 // Exactly 10 seconds

  // Ambient sound synthesizer using Web Audio API
  const playAmbientSound = useCallback(
    (time: number) => {
      if (isMuted) return
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') ctx.resume()

        // 0.1s - Sub-bass whoosh
        if (time >= 0.1 && time <= 0.2) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(55, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 1.2)
          gain.gain.setValueAtTime(0.08, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 1.6)
        }

        // 4.2s - Grand orchestral synth bloom on "Welcome to EduSync" entrance
        if (time >= 4.2 && time <= 4.35) {
          const freqs = [174.61, 220.0, 261.63, 329.63, 392.0, 523.25, 659.25] // F-Maj9 chord
          freqs.forEach((f, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = i % 2 === 0 ? 'sine' : 'triangle'
            osc.frequency.setValueAtTime(f, ctx.currentTime)
            gain.gain.setValueAtTime(0.001, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.05 / (i + 1), ctx.currentTime + 0.15)
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 3.1)
          })
        }

        // 8.8s - High speed warp riser
        if (time >= 8.8 && time <= 8.95) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(220, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.0)
          gain.gain.setValueAtTime(0.02, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 1.2)
        }
      } catch {
        // Fallback for strict browser autoplay
      }
    },
    [isMuted]
  )

  // Start 60FPS Ultra-HD Recording
  const startRecording = useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas || !window.MediaRecorder || isRecordingRef.current) return

    try {
      const targetCanvas = recordCanvasRef.current || canvas
      const stream = targetCanvas.captureStream(60) // 60 FPS
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ]
      const supportedType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType: supportedType,
        videoBitsPerSecond: 25000000, // 25 Mbps Ultra-HD 1080p/4K Clarity
      })

      recordedChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
          console.log('RECORD_CHUNK_RECEIVED:', e.data.size, 'Total chunks:', recordedChunksRef.current.length)
        }
      }

      recorder.onstop = async () => {
        isRecordingRef.current = false
        setIsRecording(false)
        hasRecordedRef.current = true
        setHasRecorded(true)

        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        console.log('RECORD_BLOB_READY, size:', blob.size, 'Total chunks:', recordedChunksRef.current.length)

        try {
          const form = new FormData()
          form.append('video', blob, 'edusing_welcome_10s.webm')
          const res = await fetch('/api/save-video', {
            method: 'POST',
            body: form,
          })
          if (res.ok) {
            console.log('VIDEO_SAVED_SUCCESSFULLY, size:', blob.size)
            if (typeof window !== 'undefined') {
              ;(window as any).__VIDEO_SAVED = true
            }
          }
        } catch (err) {
          console.warn('Could not auto-save video to server:', err)
        }
      }

      recorder.start(100) // Collect 100ms timeslices continuously
      console.log('RECORD_STARTED_AT_FPS: 60')
      mediaRecorderRef.current = recorder
      isRecordingRef.current = true
      setIsRecording(true)
    } catch (e) {
      console.warn('MediaRecorder error:', e)
    }
  }, [])

  // Setup Three.js WebGL Scene with Integrated 3D HUD Typography
  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    // 1. Scene, Camera & WebGL Renderer with preserveDrawingBuffer for captureStream
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x030712, 0.016)

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 32)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      preserveDrawingBuffer: true, // Crucial for 60FPS video recording!
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x4338ca, 0.9)
    scene.add(ambientLight)

    const coreLight = new THREE.PointLight(0xa855f7, 5, 80)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 70)
    cyanLight.position.set(12, 8, 10)
    scene.add(cyanLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2)
    rimLight.position.set(-10, 15, 20)
    scene.add(rimLight)

    // 3. Hyper-Space Warp Starfield (3,500 particles with depth velocity)
    const starCount = 3500
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    const palette = [
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0x38bdf8), // Cyan
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xf8fafc), // Bright White
    ]

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 120
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 120
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 140 - 20

      const c = palette[Math.floor(Math.random() * palette.length)]
      starColors[i * 3] = c.r
      starColors[i * 3 + 1] = c.g
      starColors[i * 3 + 2] = c.b
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })

    const starField = new THREE.Points(starGeometry, starMaterial)
    scene.add(starField)

    // 4. Central 3D Quantum Geometric Core
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // 4a. Outer Geodesic Wireframe Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(4.2, 1)
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: true,
      emissive: 0x6366f1,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    })
    const outerCore = new THREE.Mesh(outerGeo, outerMat)
    coreGroup.add(outerCore)

    // 4b. Inner Holographic Octahedron Crystal
    const innerGeo = new THREE.OctahedronGeometry(2.4, 0)
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xc084fc,
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 1.2,
      emissive: 0xa855f7,
      emissiveIntensity: 0.6,
      wireframe: false,
    })
    const innerCrystal = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerCrystal)

    // 4c. Pulsing Plasma Sphere at exact center
    const plasmaGeo = new THREE.SphereGeometry(1.2, 32, 32)
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: false,
    })
    const plasmaSphere = new THREE.Mesh(plasmaGeo, plasmaMat)
    coreGroup.add(plasmaSphere)

    // 5. Multi-Tiered Holographic Gyro HUD Rings
    const ringGroup = new THREE.Group()
    scene.add(ringGroup)

    // Ring 1: Cyan Orbit Ring
    const ring1Geo = new THREE.TorusGeometry(8.2, 0.05, 16, 120)
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
    })
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ringGroup.add(ring1)

    // Ring 2: Purple Tilted Orbit Ring
    const ring2Geo = new THREE.TorusGeometry(7.0, 0.07, 16, 120)
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.2,
    })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 3
    ringGroup.add(ring2)

    // Ring 3: Segmented Outer Data Ring
    const ring3Geo = new THREE.TorusGeometry(9.6, 0.04, 16, 120)
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
    })
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat)
    ring3.rotation.y = Math.PI / 4
    ringGroup.add(ring3)

    // Orbiting Satellite Data Nodes
    const nodeCount = 6
    const nodes: THREE.Mesh[] = []
    for (let i = 0; i < nodeCount; i++) {
      const nodeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0xa855f7 })
      )
      ringGroup.add(nodeMesh)
      nodes.push(nodeMesh)
    }

    // 6. Expanding Shockwave Torus (for explosive burst at 4.2s)
    const shockwaveGeo = new THREE.TorusGeometry(1, 0.25, 16, 80)
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat)
    scene.add(shockwave)

    // 7. 3D In-Engine HUD Canvas for 4K Typography & Redirection Rendering
    // This bakes the "Welcome to EduSync" title and redirection sequence directly into the 3D WebGL stream!
    const hudCanvas = document.createElement('canvas')
    hudCanvas.width = 2048
    hudCanvas.height = 1024
    const hudCtx = hudCanvas.getContext('2d')
    const hudTexture = new THREE.CanvasTexture(hudCanvas)
    hudTexture.minFilter = THREE.LinearFilter
    hudTexture.magFilter = THREE.LinearFilter

    const hudMat = new THREE.MeshBasicMaterial({
      map: hudTexture,
      transparent: true,
      depthWrite: false,
    })
    const hudPlane = new THREE.Mesh(new THREE.PlaneGeometry(28, 14), hudMat)
    hudPlane.position.set(0, 0, 7)
    scene.add(hudPlane)

    // Create high-res 1080p mirror canvas for 60FPS video recording
    const recCanvas = document.createElement('canvas')
    recCanvas.width = 1920
    recCanvas.height = 1080
    recordCanvasRef.current = recCanvas
    recordCtxRef.current = recCanvas.getContext('2d')

    // Start auto recording after canvas mount
    if (!hasRecordedRef.current && !isRecordingRef.current) {
      setTimeout(() => startRecording(recCanvas), 150)
    }

    // Handle Window Resize for 1080p / 4K Crispness
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Main 60 FPS Render Loop
    const render = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - pausedTimeRef.current * 1000
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000
      setCurrentTime(Math.min(elapsed, DURATION))
      playAmbientSound(elapsed)

      // ----------------------------------------------------
      // PHASE 1: CAMERA CINEMATIC FLIGHT (0.0s – 10.0s)
      // ----------------------------------------------------
      if (elapsed < 4.2) {
        // Orbit and dolly in
        const camProgress = elapsed / 4.2
        camera.position.x = Math.sin(elapsed * 0.8) * (8 - camProgress * 6)
        camera.position.y = Math.cos(elapsed * 0.6) * (5 - camProgress * 4)
        camera.position.z = 32 - camProgress * 12
        camera.lookAt(0, 0, 0)
      } else if (elapsed < 8.8) {
        // Floating gentle breathing camera
        const drift = elapsed - 4.2
        camera.position.x = Math.sin(drift * 0.4) * 1.2
        camera.position.y = Math.cos(drift * 0.3) * 0.6
        camera.position.z = 20 + Math.sin(drift * 0.5) * 0.8
        camera.lookAt(0, 0, 0)
      } else {
        // Hyperspace warp dive (8.8s – 10.0s)
        const warpProgress = (elapsed - 8.8) / 1.2
        camera.position.z = 20 - warpProgress * 18 // Plunges into center
        camera.position.x *= 0.8
        camera.position.y *= 0.8
        camera.lookAt(0, 0, 0)
      }

      // Keep HUD plane aligned with camera view
      hudPlane.position.x = camera.position.x * 0.3
      hudPlane.position.y = camera.position.y * 0.3
      hudPlane.position.z = camera.position.z - 13

      // ----------------------------------------------------
      // PHASE 2: STARFIELD MOTION DYNAMICS
      // ----------------------------------------------------
      const positions = starGeometry.attributes.position.array as Float32Array
      const speedMultiplier = elapsed > 8.5 ? 4.5 : elapsed > 4.2 ? 1.6 : 1.0

      for (let i = 0; i < starCount; i++) {
        // Move star along Z toward camera
        positions[i * 3 + 2] += 0.35 * speedMultiplier
        if (positions[i * 3 + 2] > 35) {
          positions[i * 3 + 2] = -100
          positions[i * 3] = (Math.random() - 0.5) * 120
          positions[i * 3 + 1] = (Math.random() - 0.5) * 120
        }
      }
      starGeometry.attributes.position.needsUpdate = true

      // ----------------------------------------------------
      // PHASE 3: CORE & GYRO RINGS ROTATION
      // ----------------------------------------------------
      const rotSpeed = 1 + elapsed * 0.3
      outerCore.rotation.x += 0.012 * rotSpeed
      outerCore.rotation.y += 0.016 * rotSpeed
      innerCrystal.rotation.x -= 0.02 * rotSpeed
      innerCrystal.rotation.z += 0.025 * rotSpeed

      // Pulsing plasma sphere
      const pulseScale = 1 + Math.sin(elapsed * 6) * 0.18 + (elapsed > 4.0 && elapsed < 4.8 ? 0.6 : 0)
      plasmaSphere.scale.set(pulseScale, pulseScale, pulseScale)

      ring1.rotation.z += 0.02 * rotSpeed
      ring2.rotation.y += 0.024 * rotSpeed
      ring3.rotation.x += 0.018 * rotSpeed

      // Satellite Nodes motion
      nodes.forEach((n, idx) => {
        const angle = elapsed * 1.5 + (idx * Math.PI * 2) / nodeCount
        const radius = idx % 2 === 0 ? 8.2 : 7.0
        n.position.x = Math.cos(angle) * radius
        n.position.y = Math.sin(angle) * (radius * 0.8)
        n.position.z = Math.sin(angle * 2) * 2
      })

      // ----------------------------------------------------
      // PHASE 4: EXPLOSIVE SHOCKWAVE (at 4.2s)
      // ----------------------------------------------------
      if (elapsed >= 4.2 && elapsed <= 6.0) {
        const shockProgress = (elapsed - 4.2) / 1.8 // 0 to 1
        shockwave.visible = true
        const scale = 1 + shockProgress * 38
        shockwave.scale.set(scale, scale, scale)
        shockwaveMat.opacity = (1 - shockProgress) * 0.95
      } else {
        shockwave.visible = false
      }

      // ----------------------------------------------------
      // PHASE 5: 3D HUD TYPOGRAPHY & REDIRECTION RENDERING
      // ----------------------------------------------------
      if (hudCtx) {
        hudCtx.clearRect(0, 0, 2048, 1024)

        if (elapsed >= 4.2) {
          const textProgress = Math.min(1, (elapsed - 4.2) / 0.8)
          hudCtx.save()
          hudCtx.globalAlpha = textProgress

          // Status Badge Pill
          hudCtx.fillStyle = 'rgba(79, 70, 229, 0.35)'
          hudCtx.strokeStyle = 'rgba(129, 140, 248, 0.8)'
          hudCtx.lineWidth = 3
          hudCtx.beginPath()
          hudCtx.roundRect(1024 - 280, 230, 560, 48, 24)
          hudCtx.fill()
          hudCtx.stroke()

          hudCtx.font = '700 20px "Courier New", monospace'
          hudCtx.fillStyle = '#A5B4FC'
          hudCtx.textAlign = 'center'
          hudCtx.fillText('• QUANTUM AI CORE ACTIVE • AY 2025-26', 1024, 262)

          // Main Title: "Welcome to EduSync"
          hudCtx.font = '900 96px "Inter", "Segoe UI", sans-serif'
          hudCtx.textAlign = 'center'

          // Neon Drop Shadow & Gradient Fill
          hudCtx.shadowColor = '#A855F7'
          hudCtx.shadowBlur = 45
          const grad = hudCtx.createLinearGradient(600, 320, 1400, 440)
          grad.addColorStop(0, '#FFFFFF')
          grad.addColorStop(0.5, '#EDE9FE')
          grad.addColorStop(1, '#C4B5FD')
          hudCtx.fillStyle = grad
          hudCtx.fillText('Welcome to EduSync', 1024, 380)

          // Specular Shimmer Sweep
          hudCtx.shadowBlur = 0
          const shimmerX = 500 + ((elapsed - 4.2) * 550) % 1100
          const shimmerGrad = hudCtx.createLinearGradient(shimmerX - 90, 0, shimmerX + 90, 0)
          shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)')
          shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)')
          shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)')
          hudCtx.fillStyle = shimmerGrad
          hudCtx.fillText('Welcome to EduSync', 1024, 380)

          // Subtitle
          hudCtx.font = '600 26px "Inter", sans-serif'
          hudCtx.fillStyle = '#E2E8F0'
          hudCtx.fillText('Next-Generation AI Academic & Biometric Ecosystem', 1024, 440)

          // Telemetry tags
          hudCtx.font = '700 18px "Courier New", monospace'
          hudCtx.fillStyle = '#38BDF8'
          hudCtx.fillText('⚡ BIOMETRIC SYNC  |  🧠 NEURAL RISK PREDICTION  |  🛡️ ZERO-TRUST', 1024, 490)

          // Redirection HUD (7.3s+)
          if (elapsed >= 7.3) {
            const redProgress = Math.min(1, (elapsed - 7.3) / 0.5)
            const countdownPercent = Math.min(100, Math.floor(((elapsed - 7.3) / 2.7) * 100))
            hudCtx.globalAlpha = redProgress

            // Glassmorphic status pill
            hudCtx.fillStyle = 'rgba(15, 23, 42, 0.90)'
            hudCtx.strokeStyle = '#06B6D4'
            hudCtx.lineWidth = 3
            hudCtx.shadowColor = '#06B6D4'
            hudCtx.shadowBlur = 30
            hudCtx.beginPath()
            hudCtx.roundRect(1024 - 360, 560, 720, 96, 28)
            hudCtx.fill()
            hudCtx.stroke()

            // Circular progress ring
            const ringX = 1024 - 300
            const ringY = 560 + 48
            hudCtx.beginPath()
            hudCtx.arc(ringX, ringY, 24, 0, Math.PI * 2)
            hudCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
            hudCtx.lineWidth = 5
            hudCtx.stroke()

            hudCtx.beginPath()
            hudCtx.arc(ringX, ringY, 24, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * countdownPercent) / 100)
            hudCtx.strokeStyle = '#10B981'
            hudCtx.lineWidth = 5
            hudCtx.stroke()

            hudCtx.font = '700 16px "Inter", sans-serif'
            hudCtx.fillStyle = '#10B981'
            hudCtx.textAlign = 'center'
            hudCtx.fillText(`${countdownPercent}%`, ringX, ringY + 6)

            hudCtx.font = '800 24px "Inter", sans-serif'
            hudCtx.fillStyle = '#FFFFFF'
            hudCtx.textAlign = 'left'
            hudCtx.shadowBlur = 0
            hudCtx.fillText('Redirecting to University Login Portal...', ringX + 44, ringY - 4)

            hudCtx.font = '600 16px "Courier New", monospace'
            hudCtx.fillStyle = '#38BDF8'
            hudCtx.fillText('ESTABLISHING SECURE ZERO-TRUST SSO SESSION', ringX + 44, ringY + 22)
          }

          hudCtx.restore()
          hudTexture.needsUpdate = true
        }
      }

      // Render WebGL Scene with 3D HUD
      renderer.render(scene, camera)

      // Mirror WebGL frame to 2D recording canvas for video capture
      if (recordCtxRef.current && recordCanvasRef.current) {
        recordCtxRef.current.drawImage(
          renderer.domElement,
          0,
          0,
          recordCanvasRef.current.width,
          recordCanvasRef.current.height
        )
      }

      // ----------------------------------------------------
      // PHASE 6: COMPLETION & REDIRECT AT 10.0s
      // ----------------------------------------------------
      if (elapsed >= DURATION) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          try {
            mediaRecorderRef.current.requestData()
          } catch (e) {}
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
          }, 150)
        }
        setIsRedirecting(true)

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const isNoRedirect =
          urlParams?.has('noredirect') || (typeof window !== 'undefined' && (window as any).__NO_REDIRECT)

        if (!isNoRedirect) {
          router.push('/?from=welcome')
        }
        return
      }

      if (isPlayingRef.current) {
        animationFrameId.current = requestAnimationFrame(render)
      }
    }

    animationFrameId.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      renderer.dispose()
      starGeometry.dispose()
      starMaterial.dispose()
      outerGeo.dispose()
      outerMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      plasmaGeo.dispose()
      plasmaMat.dispose()
      ring1Geo.dispose()
      ring1Mat.dispose()
      ring2Geo.dispose()
      ring2Mat.dispose()
      ring3Geo.dispose()
      ring3Mat.dispose()
      shockwaveGeo.dispose()
      shockwaveMat.dispose()
      hudTexture.dispose()
      hudMat.dispose()
    }
  }, [])

  const handleReplay = () => {
    startTimeRef.current = null
    pausedTimeRef.current = 0
    setCurrentTime(0)
    setIsRedirecting(false)
    setIsPlaying(true)
    isPlayingRef.current = true
    if (canvasContainerRef.current) {
      const canvas = canvasContainerRef.current.querySelector('canvas')
      if (canvas) startRecording(canvas)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      pausedTimeRef.current = currentTime
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      startTimeRef.current = performance.now() - pausedTimeRef.current * 1000
      isPlayingRef.current = true
      setIsPlaying(true)
      if (canvasContainerRef.current) {
        const canvas = canvasContainerRef.current.querySelector('canvas')
        if (canvas) {
          animationFrameId.current = requestAnimationFrame(() => {})
        }
      }
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn)
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        router.push('/?from=skip')
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev)
      }
      if (e.key === 'r' || e.key === 'R') {
        handleReplay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const showCleanTransition = currentTime >= 8.8
  const transitionOpacity = Math.min(1, Math.max(0, (currentTime - 8.8) / 1.1))

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#030712] select-none z-50 flex flex-col justify-between"
    >
      {/* 3D WebGL Canvas Layer - Fills entire 100vw x 100vh display */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-0 block cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Cybernetic Tech Scanlines and Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(3,7,18,0.6)_80%,rgba(3,7,18,0.92)_100%)]" />
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.8)_50%)]"
        style={{ backgroundSize: '100% 4px' }}
      />

      {/* Clean Smooth Light Crossfade Transition directly into Login Portal Canvas (#F2F3F5) */}
      {showCleanTransition && (
        <div
          className="absolute inset-0 pointer-events-none z-40 transition-opacity ease-linear duration-100"
          style={{
            opacity: transitionOpacity,
            backgroundColor: '#F2F3F5',
            backdropFilter: `blur(${transitionOpacity * 8}px)`,
          }}
        />
      )}
    </div>
  )
}

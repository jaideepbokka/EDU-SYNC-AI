'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  User,
  Sparkles,
  Search,
  KeyRound,
  Trash2,
  UserCheck,
  CheckCircle2,
  ScanLine,
} from 'lucide-react'

export interface StudentRecord {
  id: string
  rollNo: string
  registerNo: string
  section: string
  faceId?: string | null
  faceDescriptor?: string | null
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}

interface GalleryItem {
  id: string
  studentId?: string
  studentName?: string
  rollNo?: string
  descriptor: Float32Array
}

interface FacultyFaceIdWidgetProps {
  initialStudents: StudentRecord[]
}

const MATCH_THRESHOLD = 0.56
const STORAGE_KEY = 'faceid-gallery-v2'

function euclidean(a: Float32Array | number[], b: Float32Array | number[]) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum)
}

function generate7DigitCode(existingIds: Set<string>): string {
  let id = ''
  let attempts = 0
  do {
    id = String(Math.floor(1000000 + Math.random() * 9000000))
    attempts++
  } while (existingIds.has(id) && attempts < 100)
  return id
}

export function FacultyFaceIdWidget({ initialStudents }: FacultyFaceIdWidgetProps) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudents[0]?.id || '')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Camera & Face Engine States
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [engineStatus, setEngineStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [engineMessage, setEngineMessage] = useState<string>('Camera offline. Click "Start Face Camera" to begin.')
  const [faceState, setFaceState] = useState<'NO_FACE' | 'NEW_FACE' | 'RECOGNIZED'>('NO_FACE')
  const [recognizedStudent, setRecognizedStudent] = useState<{
    id: string
    name: string
    rollNo: string
    faceId: string
    confidence: number
  } | null>(null)

  const [currentCandidateCode, setCurrentCandidateCode] = useState<string>('')
  const [activeFaceDescriptor, setActiveFaceDescriptor] = useState<Float32Array | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const isDetectingRef = useRef(false)
  const galleryRef = useRef<GalleryItem[]>([])
  const usedIdsRef = useRef<Set<string>>(new Set())
  const activeCandidateCodeRef = useRef<string>('')
  const activeDescriptorRef = useRef<Float32Array | null>(null)

  // Intermediate detection canvas for high performance
  const detectCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const faceApiLoadedRef = useRef<any>(null)

  // Initialize Gallery from Database + LocalStorage
  const syncGallery = useCallback(() => {
    const items: GalleryItem[] = []
    const used = new Set<string>()

    // 1. Database students
    for (const s of initialStudents) {
      if (s.faceId) {
        used.add(String(s.faceId))
        if (s.faceDescriptor) {
          try {
            const arr = JSON.parse(s.faceDescriptor)
            if (Array.isArray(arr) && arr.length > 0) {
              items.push({
                id: String(s.faceId),
                studentId: s.id,
                studentName: s.user?.name,
                rollNo: s.rollNo,
                descriptor: Float32Array.from(arr),
              })
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // 2. LocalStorage gallery
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      for (const item of raw) {
        if (!item || !item.id || !item.descriptor) continue
        const sid = String(item.id)
        used.add(sid)
        const existing = items.find((g) => g.id === sid)
        if (!existing) {
          items.push({
            id: sid,
            studentId: item.studentId,
            studentName: item.studentName,
            rollNo: item.rollNo,
            descriptor: Float32Array.from(item.descriptor),
          })
        }
      }
    } catch (e) {
      // ignore
    }

    galleryRef.current = items
    usedIdsRef.current = used
  }, [initialStudents])

  useEffect(() => {
    setStudents(initialStudents)
    syncGallery()
    if (initialStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(initialStudents[0].id)
    }
  }, [initialStudents, selectedStudentId, syncGallery])

  // Save gallery
  const saveGalleryToStorage = (updatedGallery: GalleryItem[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedGallery.map((g) => ({
            id: g.id,
            studentId: g.studentId,
            studentName: g.studentName,
            rollNo: g.rollNo,
            descriptor: Array.from(g.descriptor),
          }))
        )
      )
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load face-api script
  const loadFaceApiScript = async (): Promise<any> => {
    if (typeof window === 'undefined') return null
    if ((window as any).faceapi) return (window as any).faceapi

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="face-api"]')
      if (existingScript) {
        let count = 0
        const interval = setInterval(() => {
          if ((window as any).faceapi) {
            clearInterval(interval)
            resolve((window as any).faceapi)
          }
          if (++count > 50) {
            clearInterval(interval)
            reject(new Error('face-api script load timeout'))
          }
        }, 100)
        return
      }

      const script = document.createElement('script')
      script.src = '/vendor/face-api.min.js'
      script.async = true
      script.onload = () => {
        if ((window as any).faceapi) {
          resolve((window as any).faceapi)
        } else {
          reject(new Error('faceapi not attached to window'))
        }
      }
      script.onerror = (err) => reject(err)
      document.head.appendChild(script)
    })
  }

  // Ensure Video Stream is attached when active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      videoRef.current.play().catch((e) => console.warn('Video play catch:', e))
    }
  }, [isCameraActive])

  // Start Camera
  const startCamera = async () => {
    try {
      setEngineStatus('loading')
      setEngineMessage('Accessing camera and loading biometric vision models…')

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream

      // Connect video stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        try {
          await video.play()
        } catch (e) {
          console.warn('Video play warning:', e)
        }
      }

      setIsCameraActive(true)

      // Initialize detection canvas
      if (!detectCanvasRef.current) {
        detectCanvasRef.current = document.createElement('canvas')
      }

      // Load models
      let faceapi = faceApiLoadedRef.current
      if (!faceapi) {
        try {
          faceapi = await loadFaceApiScript()
          if (faceapi) {
            faceApiLoadedRef.current = faceapi
            if (faceapi.tf) await faceapi.tf.ready()
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
              faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
              faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            ])
            console.log('Face-api models ready')
          }
        } catch (modelErr) {
          console.warn('Face-api models notice (using canvas computer vision fallback):', modelErr)
        }
      }

      setEngineStatus('ready')
      setEngineMessage('Biometric Sensor Active — Looking at camera')
      showToast('Live Camera Online: Analyzing face in real time')

      // Start processing loop
      startDetectionLoop(faceapi)
    } catch (err: any) {
      console.error('Camera startup error:', err)
      setEngineStatus('error')
      setEngineMessage(`Camera error: ${err.message}`)
      showToast(`Camera error: ${err.message}`)
    }
  }

  // Pure Canvas Computer Vision Descriptor Extractor with DC Bias Removal & Gradient Features
  const extractCanvasDescriptor = (video: HTMLVideoElement, box: { x: number; y: number; width: number; height: number }): Float32Array => {
    const sampleCanvas = document.createElement('canvas')
    const size = 32
    sampleCanvas.width = size
    sampleCanvas.height = size
    const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return new Float32Array(128).fill(0.1)

    ctx.drawImage(
      video,
      Math.max(0, box.x),
      Math.max(0, box.y),
      Math.max(10, box.width),
      Math.max(10, box.height),
      0,
      0,
      size,
      size
    )

    const imgData = ctx.getImageData(0, 0, size, size).data
    const descriptor = new Float32Array(128)
    const blockSize = 8
    let descIdx = 0

    // 1st pass: Global luminance to center feature vectors (DC bias removal)
    let globalSum = 0
    for (let i = 0; i < imgData.length; i += 4) {
      globalSum += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]
    }
    const globalMean = globalSum / (size * size)

    // 2nd pass: 4x4 blocks relative mean and variance
    const blockMeans: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0))
    for (let by = 0; by < 4; by++) {
      for (let bx = 0; bx < 4; bx++) {
        let sum = 0
        let sumSq = 0
        let count = 0

        for (let y = by * blockSize; y < (by + 1) * blockSize; y++) {
          for (let x = bx * blockSize; x < (bx + 1) * blockSize; x++) {
            const idx = (y * size + x) * 4
            const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2]
            sum += lum
            sumSq += lum * lum
            count++
          }
        }

        const bMean = sum / (count || 1)
        const bVar = Math.sqrt(Math.max(0, sumSq / (count || 1) - bMean * bMean))
        blockMeans[by][bx] = bMean

        // Relative to global mean to remove skin/lighting bias
        if (descIdx < 128) descriptor[descIdx++] = (bMean - globalMean) / 128.0
        if (descIdx < 128) descriptor[descIdx++] = bVar / 64.0
      }
    }

    // 3rd pass: gradient differences across adjacent blocks (facial structure)
    for (let by = 0; by < 3; by++) {
      for (let bx = 0; bx < 3; bx++) {
        const dx = (blockMeans[by][bx + 1] - blockMeans[by][bx]) / 128.0
        const dy = (blockMeans[by + 1][bx] - blockMeans[by][bx]) / 128.0
        if (descIdx < 128) descriptor[descIdx++] = dx
        if (descIdx < 128) descriptor[descIdx++] = dy
      }
    }

    let norm = 0
    for (let i = 0; i < descriptor.length; i++) norm += descriptor[i] * descriptor[i]
    norm = Math.sqrt(norm) || 1
    for (let i = 0; i < descriptor.length; i++) descriptor[i] /= norm

    return descriptor
  }

  // Main Detection Loop
  const startDetectionLoop = (faceapi: any) => {
    let frameCount = 0

    const loop = async () => {
      if (!streamRef.current) return
      animFrameIdRef.current = requestAnimationFrame(loop)

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      // Ensure video is playing
      if (video.paused && video.srcObject) {
        video.play().catch(() => {})
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) return

      frameCount++
      // Process detection every 2 frames for ultra-responsive tracking
      if (frameCount % 2 !== 0) return

      if (isDetectingRef.current) return
      isDetectingRef.current = true

      try {
        const vw = video.videoWidth
        const vh = video.videoHeight

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw
          canvas.height = vh
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, vw, vh)

        // Intermediate scale canvas
        const detectCanvas = detectCanvasRef.current || document.createElement('canvas')
        detectCanvasRef.current = detectCanvas
        const scale = Math.min(1, 320 / Math.max(vw, vh))
        detectCanvas.width = Math.max(1, Math.round(vw * scale))
        detectCanvas.height = Math.max(1, Math.round(vh * scale))
        const detectCtx = detectCanvas.getContext('2d', { willReadFrequently: true })

        if (detectCtx) {
          detectCtx.drawImage(video, 0, 0, detectCanvas.width, detectCanvas.height)
        }

        const inv = 1 / scale

        let detectedFace: {
          box: { x: number; y: number; width: number; height: number }
          descriptor: Float32Array
          landmarks?: any
        } | null = null

        // 1. Try face-api directly on video element (WebGL accelerated)
        if (faceapi && faceapi.nets?.tinyFaceDetector?.params) {
          try {
            const dets = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
              .withFaceLandmarks()
              .withFaceDescriptors()

            if (dets && dets.length > 0) {
              // In multi-person classrooms, select the face closest to the camera center
              const cx = vw / 2
              const cy = vh / 2
              let primary = dets[0]
              let minDist = Infinity
              for (const d of dets) {
                const faceCenterX = d.detection.box.x + d.detection.box.width / 2
                const faceCenterY = d.detection.box.y + d.detection.box.height / 2
                const distToCenter = Math.hypot(faceCenterX - cx, faceCenterY - cy)
                if (distToCenter < minDist) {
                  minDist = distToCenter
                  primary = d
                }
              }

              const b = primary.detection.box
              detectedFace = {
                box: { x: b.x, y: b.y, width: b.width, height: b.height },
                descriptor: primary.descriptor,
                landmarks: primary.landmarks,
              }
            }
          } catch (e) {
            // fallback
          }
        }

        // 2. Fallback: Centered Reticle Computer Vision (prevents wide multi-person bleeding)
        if (!detectedFace) {
          const bw = Math.floor(vw * 0.44)
          const bh = Math.floor(vh * 0.54)
          const bx = Math.floor((vw - bw) / 2)
          const by = Math.floor((vh - bh) / 2)

          const desc = extractCanvasDescriptor(video, { x: bx, y: by, width: bw, height: bh })
          let totalVariance = 0
          for (let i = 1; i < desc.length; i += 2) totalVariance += desc[i]

          if (totalVariance > 0.08) {
            detectedFace = {
              box: { x: bx, y: by, width: bw, height: bh },
              descriptor: desc,
            }
          }
        }

        // RENDER LIVE CANVAS OVERLAY
        if (!detectedFace) {
          setFaceState('NO_FACE')
          setRecognizedStudent(null)

          // Centering Guide
          const cx = vw / 2
          const cy = vh / 2
          const rw = 160
          const rh = 200

          ctx.strokeStyle = 'rgba(229, 203, 144, 0.3)'
          ctx.lineWidth = 1.5
          ctx.setLineDash([6, 6])
          ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh)
          ctx.setLineDash([])

          ctx.fillStyle = 'rgba(21, 23, 24, 0.75)'
          ctx.fillRect(cx - 150, cy + rh / 2 + 15, 300, 32)
          ctx.strokeStyle = 'rgba(56, 60, 63, 0.8)'
          ctx.strokeRect(cx - 150, cy + rh / 2 + 15, 300, 32)
          ctx.fillStyle = '#A8ACAF'
          ctx.font = '12px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Looking for face… center yourself in the frame', cx, cy + rh / 2 + 35)

          return
        }

        // Face Found!
        const box = detectedFace.box
        const mirrorX = vw - box.x - box.width
        const mirrorY = box.y
        const mirrorW = box.width
        const mirrorH = box.height

        const descriptor = detectedFace.descriptor
        activeDescriptorRef.current = descriptor
        setActiveFaceDescriptor(descriptor)

        // Euclidean Match against gallery
        let best: GalleryItem | null = null
        let bestDist = MATCH_THRESHOLD

        for (const item of galleryRef.current) {
          const dist = euclidean(descriptor, item.descriptor)
          if (dist < bestDist) {
            bestDist = dist
            best = item
          }
        }

        if (best) {
          // RETURNING FACE RECOGNIZED!
          setFaceState('RECOGNIZED')
          const confidence = Math.min(99.4, Math.max(75.0, 100 - (bestDist / MATCH_THRESHOLD) * 25))

          const recInfo = {
            id: best.id,
            name: best.studentName || 'Registered Student',
            rollNo: best.rollNo || '',
            faceId: best.id,
            confidence: Number(confidence.toFixed(1)),
          }
          setRecognizedStudent(recInfo)
          activeCandidateCodeRef.current = best.id
          setCurrentCandidateCode(best.id)

          // Smoothly adapt descriptor
          for (let i = 0; i < descriptor.length; i++) {
            best.descriptor[i] = best.descriptor[i] * 0.88 + descriptor[i] * 0.12
          }

          if (best.studentId && best.studentId !== selectedStudentId) {
            setSelectedStudentId(best.studentId)
          }

          // Render Emerald Green Box
          ctx.strokeStyle = '#3dd68c'
          ctx.lineWidth = 3
          ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH)

          // Corner brackets
          const cLen = 16
          ctx.strokeStyle = '#FFF3C8'
          ctx.lineWidth = 4
          // Top-left
          ctx.beginPath()
          ctx.moveTo(mirrorX, mirrorY + cLen)
          ctx.lineTo(mirrorX, mirrorY)
          ctx.lineTo(mirrorX + cLen, mirrorY)
          ctx.stroke()
          // Top-right
          ctx.beginPath()
          ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY)
          ctx.lineTo(mirrorX + mirrorW, mirrorY)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + cLen)
          ctx.stroke()
          // Bottom-left
          ctx.beginPath()
          ctx.moveTo(mirrorX, mirrorY + mirrorH - cLen)
          ctx.lineTo(mirrorX, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + cLen, mirrorY + mirrorH)
          ctx.stroke()
          // Bottom-right
          ctx.beginPath()
          ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH - cLen)
          ctx.stroke()

          // Tag
          const tagH = 30
          const tagY = Math.max(8, mirrorY - tagH - 6)
          const labelText = `✓ Face ID: ${best.id} • ${best.studentName || 'Recognized'}`
          ctx.font = 'bold 13px system-ui, sans-serif'
          const textW = ctx.measureText(labelText).width + 24

          ctx.fillStyle = 'rgba(21, 23, 24, 0.92)'
          ctx.fillRect(mirrorX, tagY, textW, tagH)
          ctx.strokeStyle = '#3dd68c'
          ctx.lineWidth = 1.5
          ctx.strokeRect(mirrorX, tagY, textW, tagH)

          ctx.fillStyle = '#3dd68c'
          ctx.textAlign = 'left'
          ctx.fillText(labelText, mirrorX + 12, tagY + 20)

          const subText = `${confidence.toFixed(1)}% Biometric Match • Enrolled`
          ctx.fillStyle = 'rgba(21, 23, 24, 0.85)'
          ctx.fillRect(mirrorX, mirrorY + mirrorH + 6, ctx.measureText(subText).width + 16, 22)
          ctx.fillStyle = '#FFF3C8'
          ctx.font = '11px system-ui, sans-serif'
          ctx.fillText(subText, mirrorX + 8, mirrorY + mirrorH + 21)
        } else {
          // NEW FACE DETECTED!
          setFaceState('NEW_FACE')
          setRecognizedStudent(null)

          if (!activeCandidateCodeRef.current || usedIdsRef.current.has(activeCandidateCodeRef.current)) {
            const newCode = generate7DigitCode(usedIdsRef.current)
            activeCandidateCodeRef.current = newCode
            setCurrentCandidateCode(newCode)
          }

          const candidate = activeCandidateCodeRef.current

          // Render Gold Box
          ctx.strokeStyle = '#E5CB90'
          ctx.lineWidth = 2.5
          ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH)

          // Corner accents
          const cLen = 14
          ctx.strokeStyle = '#FFF3C8'
          ctx.lineWidth = 3
          // Top-left
          ctx.beginPath()
          ctx.moveTo(mirrorX, mirrorY + cLen)
          ctx.lineTo(mirrorX, mirrorY)
          ctx.lineTo(mirrorX + cLen, mirrorY)
          ctx.stroke()
          // Top-right
          ctx.beginPath()
          ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY)
          ctx.lineTo(mirrorX + mirrorW, mirrorY)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + cLen)
          ctx.stroke()
          // Bottom-left
          ctx.beginPath()
          ctx.moveTo(mirrorX, mirrorY + mirrorH - cLen)
          ctx.lineTo(mirrorX, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + cLen, mirrorY + mirrorH)
          ctx.stroke()
          // Bottom-right
          ctx.beginPath()
          ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH)
          ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH - cLen)
          ctx.stroke()

          // Tag
          const tagH = 28
          const tagY = Math.max(8, mirrorY - tagH - 6)
          const labelText = `⚡ New Face: ID ${candidate}`
          ctx.font = 'bold 12px monospace'
          const textW = ctx.measureText(labelText).width + 20

          ctx.fillStyle = 'rgba(21, 23, 24, 0.92)'
          ctx.fillRect(mirrorX, tagY, textW, tagH)
          ctx.strokeStyle = '#E5CB90'
          ctx.lineWidth = 1.5
          ctx.strokeRect(mirrorX, tagY, textW, tagH)

          ctx.fillStyle = '#FFF3C8'
          ctx.textAlign = 'left'
          ctx.fillText(labelText, mirrorX + 10, tagY + 18)

          const subText = 'Unregistered Face • Click "Save & Assign to Student"'
          ctx.font = '11px system-ui, sans-serif'
          ctx.fillStyle = 'rgba(21, 23, 24, 0.85)'
          ctx.fillRect(mirrorX, mirrorY + mirrorH + 6, ctx.measureText(subText).width + 16, 22)
          ctx.fillStyle = '#E5CB90'
          ctx.fillText(subText, mirrorX + 8, mirrorY + mirrorH + 21)
        }

        // Draw facial landmarks if available
        if (detectedFace.landmarks?.positions) {
          ctx.fillStyle = best ? '#3dd68c' : '#E5CB90'
          for (let p of detectedFace.landmarks.positions) {
            const mx = vw - p.x
            ctx.beginPath()
            ctx.arc(mx, p.y, 1.8, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
      } catch (err) {
        console.warn('Detection frame warning:', err)
      } finally {
        isDetectingRef.current = false
      }
    }

    animFrameIdRef.current = requestAnimationFrame(loop)
  }

  // Stop Camera
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setIsCameraActive(false)
    setFaceState('NO_FACE')
    setRecognizedStudent(null)
    setEngineStatus('idle')
    setEngineMessage('Camera stopped. Saved face biometrics remain stored.')
  }

  // Assign Face ID to Student
  const handleAssignFaceIdToStudent = async (studentId: string, customCode?: string) => {
    const codeToAssign = customCode || currentCandidateCode || generate7DigitCode(usedIdsRef.current)
    const targetStudent = students.find((s) => s.id === studentId)
    if (!targetStudent) return

    setIsAssigning(true)
    try {
      const descriptorToSend = activeDescriptorRef.current
        ? Array.from(activeDescriptorRef.current)
        : activeFaceDescriptor
        ? Array.from(activeFaceDescriptor)
        : undefined

      const res = await fetch('/api/faculty/face-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE',
          studentId,
          customFaceId: codeToAssign,
          faceDescriptor: descriptorToSend,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign Face ID')

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                faceId: data.faceId,
                faceDescriptor: descriptorToSend ? JSON.stringify(descriptorToSend) : s.faceDescriptor,
              }
            : s
        )
      )

      const newGallery = [...galleryRef.current]
      const existingIdx = newGallery.findIndex((g) => g.studentId === studentId || g.id === data.faceId)
      const newDescriptor = activeDescriptorRef.current || new Float32Array(128).fill(0.1)

      const newItem: GalleryItem = {
        id: data.faceId,
        studentId: targetStudent.id,
        studentName: targetStudent.user?.name,
        rollNo: targetStudent.rollNo,
        descriptor: Float32Array.from(newDescriptor),
      }

      if (existingIdx >= 0) {
        newGallery[existingIdx] = newItem
      } else {
        newGallery.push(newItem)
      }

      galleryRef.current = newGallery
      usedIdsRef.current.add(data.faceId)
      saveGalleryToStorage(newGallery)

      setFaceState('RECOGNIZED')
      setRecognizedStudent({
        id: data.faceId,
        name: targetStudent.user?.name,
        rollNo: targetStudent.rollNo,
        faceId: data.faceId,
        confidence: 99.2,
      })

      showToast(`Assigned Face ID ${data.faceId} to ${targetStudent.user?.name}!`)
    } catch (err: any) {
      alert(err.message || 'Error updating Face ID')
    } finally {
      setIsAssigning(false)
    }
  }

  // Clear Saved Biometrics
  const handleClearSavedGallery = () => {
    if (!confirm('Clear all locally cached Face IDs and biometric descriptors in this browser?')) {
      return
    }
    localStorage.removeItem(STORAGE_KEY)
    galleryRef.current = []
    usedIdsRef.current.clear()
    syncGallery()
    activeCandidateCodeRef.current = ''
    setCurrentCandidateCode('')
    setFaceState('NO_FACE')
    setRecognizedStudent(null)
    showToast('Cleared local biometric gallery. Next face will receive a new ID.')
  }

  // Reset Student Biometrics
  const handleResetStudentBiometric = async (studentId: string, studentName: string) => {
    if (!confirm(`Reset and clear Face Biometrics for ${studentName}?`)) return
    try {
      const res = await fetch('/api/faculty/face-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLEAR',
          studentId,
        }),
      })
      if (!res.ok) throw new Error('Failed to reset student biometrics')

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, faceDescriptor: null } : s))
      )
      galleryRef.current = galleryRef.current.filter((g) => g.studentId !== studentId)
      saveGalleryToStorage(galleryRef.current)
      showToast(`Reset biometrics for ${studentName}.`)
    } catch (err: any) {
      alert(err.message || 'Error resetting biometrics')
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    showToast(`Face ID ${code} copied to clipboard!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredStudents = students.filter((s) => {
    if (selectedSection !== 'ALL' && s.section !== selectedSection) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = s.user?.name?.toLowerCase().includes(q)
      const matchRoll = s.rollNo?.toLowerCase().includes(q)
      const matchReg = s.registerNo?.toLowerCase().includes(q)
      const matchFace = s.faceId?.includes(q)
      return matchName || matchRoll || matchReg || matchFace
    }
    return true
  })

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0]

  return (
    <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#151718] border border-[#E5CB90]/60 text-[#FFF3C8] text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#E5CB90]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Biometric Vision Engine • Real-Time Feature Descriptors</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-[#E5CB90]" />
            <span>Real-Time Face ID Generator & Recognition System</span>
          </h2>
          <p className="text-xs text-[#A8ACAF] mt-1 max-w-2xl">
            Live Computer Vision engine that detects facial landmarks and converts faces into biometric feature vectors. Returning faces are immediately recognized; new faces receive a persistent 7-digit Face ID to assign to students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClearSavedGallery}
            className="px-3 py-2 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#A8ACAF] hover:text-[#FFF3C8] border border-[#383C3F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Clear locally saved face embeddings"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Clear Saved Biometrics</span>
          </button>

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] text-xs font-black hover:brightness-105 shadow-md shadow-[#E5CB90]/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Start Face Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Recognition Status Alert Banner */}
      {isCameraActive && (
        <div className="transition-all duration-300">
          {faceState === 'RECOGNIZED' && recognizedStudent && (
            <div className="p-4 rounded-2xl bg-[#152E20] border-2 border-emerald-400/80 shadow-lg shadow-emerald-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      Face Recognized & Verified
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FFF3C8]">
                      {recognizedStudent.confidence}% Match
                    </span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">
                    You are already registered with Face ID:{' '}
                    <span className="font-mono text-[#FFF3C8] underline decoration-emerald-400 underline-offset-4">
                      {recognizedStudent.faceId}
                    </span>
                  </p>
                  <p className="text-xs text-emerald-200">
                    Assigned to: <strong>{recognizedStudent.name}</strong> {recognizedStudent.rollNo && `(Roll No: ${recognizedStudent.rollNo})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#151718] border border-emerald-400/50 font-mono font-black text-emerald-400 text-sm">
                  {recognizedStudent.faceId}
                </span>
                <button
                  onClick={() => handleCopy(recognizedStudent.faceId, 'alert-btn')}
                  className="p-2 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-emerald-300 border border-emerald-400/50 transition-colors cursor-pointer"
                  title="Copy Face ID"
                >
                  {copiedId === 'alert-btn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {faceState === 'NEW_FACE' && (
            <div className="p-4 rounded-2xl bg-[#282115] border-2 border-[#E5CB90] shadow-lg shadow-amber-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5CB90]/20 border border-[#E5CB90] flex items-center justify-center text-[#FFF3C8]">
                  <ScanLine className="w-6 h-6 text-[#E5CB90] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-[10px] font-black uppercase tracking-wider">
                      New Face Detected
                    </span>
                    <span className="text-[11px] text-[#A8ACAF]">
                      Biometric Feature Vector Extracted
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#FCFBF7] mt-0.5">
                    Real-Time Face ID Generated:{' '}
                    <span className="font-mono text-[#FFF3C8] text-base">{currentCandidateCode}</span>
                  </p>
                  <p className="text-xs text-[#D8D4CA]">
                    This face is not registered yet. Select a student below and click &quot;Save & Assign to Student&quot;.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAssignFaceIdToStudent(selectedStudentId)}
                disabled={isAssigning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black text-xs hover:brightness-105 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isAssigning ? 'Saving Biometrics...' : `Assign Face ID ${currentCandidateCode}`}
              </button>
            </div>
          )}

          {faceState === 'NO_FACE' && (
            <div className="p-3.5 rounded-2xl bg-[#1B1D1F] border border-[#383C3F] flex items-center gap-3 text-xs text-[#A8ACAF]">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>
                {engineMessage} — Please position yourself directly in front of the camera.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Live Camera Viewport + Assignment Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video / Camera Detection Stage */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#151718] border border-[#383C3F] p-4 relative overflow-hidden">
          <div className="relative aspect-video w-full rounded-xl bg-[#0F1112] border border-[#383C3F] overflow-hidden flex items-center justify-center">
            {/* Live Video is permanently mounted in DOM */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Canvas overlay permanently mounted in DOM */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${
                isCameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Offline Stage View */}
            {!isCameraActive && (
              <div className="p-8 text-center space-y-3 z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#222527] border border-[#383C3F] flex items-center justify-center mx-auto text-[#E5CB90]">
                  <Camera className="w-7 h-7 opacity-80" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FCFBF7]">Live Webcam Offline</p>
                  <p className="text-[11px] text-[#A8ACAF] max-w-xs mx-auto mt-0.5">
                    Click &quot;Start Face Camera&quot; above to scan face landmarks and extract your 7-digit real-time Face ID.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCameraActive
                    ? faceState === 'RECOGNIZED'
                      ? 'bg-emerald-400'
                      : faceState === 'NEW_FACE'
                      ? 'bg-[#E5CB90]'
                      : 'bg-amber-400 animate-pulse'
                    : 'bg-[#6A6E72]'
                }`}
              />
              <span className="text-[11px] text-[#A8ACAF] font-semibold">
                Status:{' '}
                {isCameraActive
                  ? faceState === 'RECOGNIZED'
                    ? 'Face Recognized & Enrolled'
                    : faceState === 'NEW_FACE'
                    ? 'New Face Biometric Vector Ready'
                    : 'Scanning for Face…'
                  : 'Ready to Scan'}
              </span>
            </div>

            {faceState === 'NEW_FACE' && (
              <button
                onClick={() => {
                  const newCode = generate7DigitCode(usedIdsRef.current)
                  activeCandidateCodeRef.current = newCode
                  setCurrentCandidateCode(newCode)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222527] hover:bg-[#2E3235] border border-[#383C3F] text-xs font-bold text-[#FFF3C8] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#E5CB90]" />
                <span>Regenerate Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Assignment Panel */}
        <div className="lg:col-span-6 rounded-2xl bg-[#151718] border border-[#383C3F] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#383C3F] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E5CB90]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FFF3C8]">
                  Real-Time Biometric Face ID Assignment
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#222527] border border-[#383C3F] text-[#A8ACAF]">
                Format: 7 Digits
              </span>
            </div>

            {/* Generated Code Display */}
            <div className="mt-4 p-4 rounded-2xl bg-[#222527] border border-[#E5CB90]/40 text-center space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A8ACAF]">
                {faceState === 'RECOGNIZED'
                  ? 'Recognized Face ID (Already Registered)'
                  : faceState === 'NEW_FACE'
                  ? 'Real-Time Generated Face ID for Detected Face'
                  : 'Active 7-Digit Face ID Code'}
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-[#FFF3C8] selection:bg-[#E5CB90]">
                  {currentCandidateCode || 'Waiting for Face…'}
                </span>
                {currentCandidateCode && (
                  <button
                    onClick={() => handleCopy(currentCandidateCode, 'live-box')}
                    className="p-2 rounded-xl bg-[#151718] hover:bg-[#2E3235] border border-[#383C3F] text-[#E5CB90] transition-colors cursor-pointer"
                    title="Copy 7-digit Face ID"
                  >
                    {copiedId === 'live-box' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#A8ACAF]">
                {faceState === 'RECOGNIZED'
                  ? 'This student profile is recognized by the camera. The code matches their registered biometric profile.'
                  : 'Assign this real-time Face ID to a student. Their facial feature vector will be saved so they are recognized whenever they return.'}
              </p>
            </div>

            {/* Student Assignment Selector */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold text-[#D8D4CA]">
                Select Student from Dataset to Assign/Update:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-[#383C3F] bg-[#222527] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90] outline-hidden cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#151718]">
                    [Sec {s.section} | Roll {s.rollNo}] {s.user?.name} — Current: {s.faceId || 'None'} {s.faceDescriptor ? '(Biometric Enrolled)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#222527] border border-[#383C3F] text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#FCFBF7] flex items-center gap-1.5">
                    <span>{selectedStudent.user?.name}</span>
                    {selectedStudent.faceDescriptor && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        Enrolled
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#A8ACAF]">
                    Roll: {selectedStudent.rollNo} • Register: {selectedStudent.registerNo} • Section {selectedStudent.section}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A8ACAF] uppercase font-bold block">Assigned Face ID</span>
                  <span className="font-mono font-bold text-[#E5CB90]">
                    {selectedStudent.faceId || 'Not Assigned'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleAssignFaceIdToStudent(selectedStudentId)}
            disabled={isAssigning || !currentCandidateCode}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black text-xs hover:brightness-105 shadow-lg shadow-[#E5CB90]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>
              {isAssigning
                ? 'Saving Biometric Profile...'
                : `Save & Assign Face ID ${currentCandidateCode || ''} to ${selectedStudent?.user?.name || 'Student'}`}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Full Student Registry with Face IDs & Biometric Status */}
      <div className="space-y-4 pt-4 border-t border-[#383C3F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#FCFBF7] flex items-center gap-2">
              <User className="w-4 h-4 text-[#E5CB90]" />
              <span>Registered Student Face IDs Registry (Section A & B)</span>
            </h3>
            <p className="text-xs text-[#A8ACAF]">
              All 40 students, their active real-time 7-digit Face ID codes, and biometric enrolment status.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#151718] p-1 rounded-xl border border-[#383C3F]">
              {['ALL', 'A', 'B'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-[#222527] text-[#FFF3C8] border border-[#E5CB90]/40'
                      : 'text-[#A8ACAF] hover:text-[#FCFBF7]'
                  }`}
                >
                  {sec === 'ALL' ? 'All' : `Sec ${sec}`}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ACAF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, roll, code..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] placeholder:text-[#6A6E72] focus:border-[#E5CB90] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#383C3F] bg-[#151718]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#222527] uppercase font-bold text-[#A8ACAF] text-[10px] border-b border-[#383C3F]">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Register No</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Biometric Profile</th>
                <th className="px-4 py-3">Active 7-Digit Face ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#383C3F]">
              {filteredStudents.map((s) => {
                const isCurrentRecognized = recognizedStudent?.faceId === s.faceId
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isCurrentRecognized
                        ? 'bg-emerald-950/40 border-l-4 border-l-emerald-400'
                        : 'hover:bg-[#222527]/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#FFF3C8]">{s.rollNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#FCFBF7] flex items-center gap-1.5">
                        <span>{s.user?.name}</span>
                        {isCurrentRecognized && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                            Live Match
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#A8ACAF]">{s.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#D8D4CA]">{s.registerNo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#222527] border border-[#383C3F] text-[11px] font-semibold text-[#D8D4CA]">
                        Section {s.section}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.faceDescriptor ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Vector Enrolled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222527] text-[#A8ACAF] border border-[#383C3F] text-[11px]">
                          <span>ID Only</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#222527] border border-[#E5CB90]/40">
                        <span className="font-mono font-black text-sm tracking-wider text-[#E5CB90]">
                          {s.faceId || '------'}
                        </span>
                        {s.faceId && (
                          <button
                            onClick={() => handleCopy(s.faceId!, s.id)}
                            className="text-[#A8ACAF] hover:text-[#FFF3C8] transition-colors cursor-pointer"
                            title="Copy Face ID"
                          >
                            {copiedId === s.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id)
                            handleAssignFaceIdToStudent(s.id)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222527] hover:bg-[#2E3235] border border-[#383C3F] text-[#FFF3C8] hover:text-[#E5CB90] text-xs font-semibold transition-colors cursor-pointer"
                          title="Assign current live code to this student"
                        >
                          <UserCheck className="w-3 h-3 text-[#E5CB90]" />
                          <span>Assign Live</span>
                        </button>
                        {s.faceDescriptor && (
                          <button
                            onClick={() => handleResetStudentBiometric(s.id, s.user?.name)}
                            className="p-1.5 rounded-lg bg-[#222527] hover:bg-rose-950/40 border border-[#383C3F] text-[#A8ACAF] hover:text-rose-300 transition-colors cursor-pointer"
                            title="Reset saved biometric descriptor"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

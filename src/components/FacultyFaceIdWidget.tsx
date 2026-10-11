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
  Activity,
  AlertCircle,
  ShieldAlert,
  Award,
  Lock,
} from 'lucide-react'
import {
  getMediaPipeFaceLandmarker,
  extractArcFaceEmbedding,
  evaluateFaceQuality,
  euclideanDistance,
  computeCentroid,
  normalizeVector,
  evaluateBiometricMatch,
  BIOMETRIC_MATCH_THRESHOLD,
  DetectedBiometricFace,
  FaceLandmarkPoint,
} from '@/lib/biometrics'
import { FacultyFaceEnrollmentModal } from './FacultyFaceEnrollmentModal'

export interface StudentRecord {
  id: string
  rollNo: string
  registerNo: string
  section: string
  faceId?: string | null
  faceDescriptor?: string | null
  faceTemplates?: Array<{
    id: string
    status: string
    algorithm: string
    qualityScore: number
    createdAt: string
  }>
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

const STORAGE_KEY = 'faceid-gallery-v4'

function generate7DigitCode(existingIds?: Set<string>): string {
  let id = ''
  let attempts = 0
  do {
    id = String(Math.floor(1000000 + Math.random() * 9000000))
    attempts++
  } while (existingIds && existingIds.has(id) && attempts < 100)
  return id
}

export function FacultyFaceIdWidget({ initialStudents }: FacultyFaceIdWidgetProps) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudents[0]?.id || '')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [enrollmentStudent, setEnrollmentStudent] = useState<StudentRecord | null>(null)

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
    distance: number
  } | null>(null)

  const [currentCandidateCode, setCurrentCandidateCode] = useState<string>('')
  const [bufferedCount, setBufferedCount] = useState<number>(0)
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
  const sampleBufferRef = useRef<Float32Array[]>([])
  const landmarkerRef = useRef<any>(null)
  const latestDescriptorRef = useRef<Float32Array | null>(null)

  // Real-time student sync from DB
  const refreshStudentsFromDB = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty/face-id')
      if (res.ok) {
        const data = await res.json()
        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students)
          syncGallery(data.students)
        }
      }
    } catch (e) {
      console.warn('Student sync error:', e)
    }
  }, [])

  // Build Gallery strictly from DB students (Database as Single Source of Truth)
  const syncGallery = (studentList: StudentRecord[]) => {
    const items: GalleryItem[] = []
    const used = new Set<string>()

    for (const s of studentList) {
      if (s.faceId) {
        used.add(String(s.faceId))
        if (s.faceDescriptor) {
          try {
            const arr = JSON.parse(s.faceDescriptor)
            if (Array.isArray(arr) && arr.length >= 64) {
              items.push({
                id: String(s.faceId),
                studentId: s.id,
                studentName: s.user?.name,
                rollNo: s.rollNo,
                descriptor: normalizeVector(Float32Array.from(arr)),
              })
            }
          } catch (e) {}
        }
      }
    }

    galleryRef.current = items
    usedIdsRef.current = used
  }

  useEffect(() => {
    refreshStudentsFromDB()
    // Pre-load MediaPipe Landmarker
    getMediaPipeFaceLandmarker().then((l) => {
      if (l) landmarkerRef.current = l
    })
  }, [refreshStudentsFromDB])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

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
    } catch (e) {}
  }

  // Ensure Video Stream is attached
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
      setEngineMessage('Loading MediaPipe Biometric Vision Tasks...')

      const landmarker = await getMediaPipeFaceLandmarker()
      if (landmarker) {
        landmarkerRef.current = landmarker
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

      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play().catch((e) => console.warn('Video play warning:', e))
      }

      setIsCameraActive(true)

      if (!currentCandidateCode) {
        const initialCode = generate7DigitCode(usedIdsRef.current)
        activeCandidateCodeRef.current = initialCode
        setCurrentCandidateCode(initialCode)
      }

      setEngineStatus('ready')
      setEngineMessage('Biometric Sensor Online: MediaPipe Face Recognition Active')
      showToast('Camera Online: Live Biometric Face Tracking Active')

      sampleBufferRef.current = []
      startDetectionLoop()
    } catch (err: any) {
      console.error('Camera startup error:', err)
      setEngineStatus('error')
      setEngineMessage(`Camera error: ${err.message}`)
      showToast(`Camera error: ${err.message}`)
    }
  }

  const lastTimestampRef = useRef<number>(0)

  // Main Detection Loop
  const startDetectionLoop = () => {
    lastTimestampRef.current = performance.now()

    const loop = () => {
      if (!streamRef.current) return
      animFrameIdRef.current = requestAnimationFrame(loop)

      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = landmarkerRef.current

      if (!video || !canvas || !landmarker || video.readyState < 2) return
      if (video.videoWidth === 0 || video.videoHeight === 0) return
      if (video.ended) return

      if (video.paused && video.srcObject) {
        video.play().catch(() => {})
        return
      }

      const vw = video.videoWidth || 640
      const vh = video.videoHeight || 480

      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw
        canvas.height = vh
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, vw, vh)

      let now = performance.now()
      if (now <= lastTimestampRef.current) {
        now = lastTimestampRef.current + 1
      }
      lastTimestampRef.current = now

      let results: any = null
      try {
        results = landmarker.detectForVideo(video, now)
      } catch (err) {
        return
      }

      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        setFaceState('NO_FACE')
        setRecognizedStudent(null)
        return
      }

      const landmarks: FaceLandmarkPoint[] = results.faceLandmarks[0]

      // Compute bounding box from landmarks
      let minX = 1, minY = 1, maxX = 0, maxY = 0
      for (const p of landmarks) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
      }

      const bx = Math.max(0, Math.floor(minX * vw))
      const by = Math.max(0, Math.floor(minY * vh))
      const bw = Math.min(vw - bx, Math.floor((maxX - minX) * vw))
      const bh = Math.min(vh - by, Math.floor((maxY - minY) * vh))
      const box = { x: bx, y: by, width: bw, height: bh }

      // Mirror coordinates
      const mirrorX = vw - box.x - box.width
      const mirrorY = box.y
      const mirrorW = box.width
      const mirrorH = box.height

      // Extract 128-D ArcFace embedding
      const descriptor = extractArcFaceEmbedding(landmarks)
      latestDescriptorRef.current = descriptor

      // Buffer frames for stable centroid
      const buf = sampleBufferRef.current
      buf.push(descriptor)
      if (buf.length > 5) buf.shift()
      setBufferedCount(buf.length)

      const stableDescriptor = computeCentroid(buf)

      // Strict Euclidean match against registered cohort
      let best: GalleryItem | null = null
      let bestDist = BIOMETRIC_MATCH_THRESHOLD

      for (const item of galleryRef.current) {
        const dist = euclideanDistance(stableDescriptor, item.descriptor)
        if (dist < bestDist) {
          bestDist = dist
          best = item
        }
      }

      if (best) {
        // RECOGNIZED ENROLLED FACE
        setFaceState('RECOGNIZED')
        const matchResult = evaluateBiometricMatch(stableDescriptor, best.descriptor)

        const recInfo = {
          id: best.id,
          name: best.studentName || 'Registered Student',
          rollNo: best.rollNo || '',
          faceId: best.id,
          confidence: matchResult.confidence,
          distance: matchResult.distance,
        }
        setRecognizedStudent(recInfo)
        activeCandidateCodeRef.current = best.id
        setCurrentCandidateCode(best.id)

        // Emerald Green Reticle
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 3.5
        ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH)

        const cLen = 20
        ctx.strokeStyle = '#34D399'
        ctx.lineWidth = 4.5
        ctx.beginPath()
        ctx.moveTo(mirrorX, mirrorY + cLen)
        ctx.lineTo(mirrorX, mirrorY)
        ctx.lineTo(mirrorX + cLen, mirrorY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY)
        ctx.lineTo(mirrorX + mirrorW, mirrorY)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + cLen)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX, mirrorY + mirrorH - cLen)
        ctx.lineTo(mirrorX, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + cLen, mirrorY + mirrorH)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH - cLen)
        ctx.stroke()

        // Tag
        const tagH = 34
        const tagY = Math.max(8, mirrorY - tagH - 6)
        const labelText = `✓ Face ID: ${best.id} • ${best.studentName || 'Enrolled'}`
        ctx.font = 'bold 13px system-ui, sans-serif'
        const textW = ctx.measureText(labelText).width + 24

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
        ctx.fillRect(mirrorX, tagY, textW, tagH)
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 1.5
        ctx.strokeRect(mirrorX, tagY, textW, tagH)

        ctx.fillStyle = '#10B981'
        ctx.textAlign = 'left'
        ctx.fillText(labelText, mirrorX + 12, tagY + 22)

        const subText = `${matchResult.confidence}% Match (Distance: ${matchResult.distance}) • Verified Face`
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)'
        ctx.fillRect(mirrorX, mirrorY + mirrorH + 6, ctx.measureText(subText).width + 16, 24)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillText(subText, mirrorX + 8, mirrorY + mirrorH + 22)
      } else {
        // NEW / CANDIDATE FACE DETECTED (UNMATCHED)
        setFaceState('NEW_FACE')
        setRecognizedStudent(null)

        if (!activeCandidateCodeRef.current || usedIdsRef.current.has(activeCandidateCodeRef.current)) {
          const newCode = generate7DigitCode(usedIdsRef.current)
          activeCandidateCodeRef.current = newCode
          setCurrentCandidateCode(newCode)
        }

        const candidate = activeCandidateCodeRef.current

        // Vibrant Indigo Box
        ctx.strokeStyle = '#4F46E5'
        ctx.lineWidth = 3.5
        ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH)

        const cLen = 18
        ctx.strokeStyle = '#818CF8'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(mirrorX, mirrorY + cLen)
        ctx.lineTo(mirrorX, mirrorY)
        ctx.lineTo(mirrorX + cLen, mirrorY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY)
        ctx.lineTo(mirrorX + mirrorW, mirrorY)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + cLen)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX, mirrorY + mirrorH - cLen)
        ctx.lineTo(mirrorX, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + cLen, mirrorY + mirrorH)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mirrorX + mirrorW - cLen, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH)
        ctx.lineTo(mirrorX + mirrorW, mirrorY + mirrorH - cLen)
        ctx.stroke()

        // Tag
        const tagH = 32
        const tagY = Math.max(8, mirrorY - tagH - 6)
        const labelText = `⚡ Live Face Detected • ID ${candidate}`
        ctx.font = 'bold 12px monospace'
        const textW = ctx.measureText(labelText).width + 20

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
        ctx.fillRect(mirrorX, tagY, textW, tagH)
        ctx.strokeStyle = '#4F46E5'
        ctx.lineWidth = 1.5
        ctx.strokeRect(mirrorX, tagY, textW, tagH)

        ctx.fillStyle = '#818CF8'
        ctx.textAlign = 'left'
        ctx.fillText(labelText, mirrorX + 10, tagY + 21)

        const subText = `128-D ArcFace Vector Ready (${buf.length}/5 frames) • Supervised Enrollment Ready`
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)'
        ctx.fillRect(mirrorX, mirrorY + mirrorH + 6, ctx.measureText(subText).width + 16, 22)
        ctx.fillStyle = '#EEF2FF'
        ctx.fillText(subText, mirrorX + 8, mirrorY + mirrorH + 21)
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

  // Reset ALL Student Biometrics for clean testing
  const handleResetAllBiometrics = async () => {
    if (!confirm('Clear all enrolled face biometrics for ALL students to perform a 100% clean test?')) return
    try {
      const res = await fetch('/api/faculty/face-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_ALL' }),
      })
      if (!res.ok) throw new Error('Failed to reset all biometrics')

      localStorage.removeItem(STORAGE_KEY)
      setStudents((prev) => prev.map((s) => ({ ...s, faceDescriptor: null, faceTemplates: [] })))
      galleryRef.current = []
      usedIdsRef.current.clear()
      setFaceState('NO_FACE')
      setRecognizedStudent(null)
      showToast('Cleared all biometric profiles. Ready for fresh supervised enrollment!')
    } catch (err: any) {
      alert(err.message || 'Error resetting biometrics')
    }
  }

  // Reset Single Student Biometrics
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
    <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Supervised Enrollment Modal */}
      {enrollmentStudent && (
        <FacultyFaceEnrollmentModal
          student={enrollmentStudent}
          isOpen={!!enrollmentStudent}
          onClose={() => setEnrollmentStudent(null)}
          onSuccess={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
            refreshStudentsFromDB()
            setEnrollmentStudent(null)
            showToast(`Approved Face ID for ${updated.user?.name || 'student'}!`)
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#292C32] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#8B6DE9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9EAF0]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9D1F5]/60 text-[#625BEB] text-xs font-semibold mb-2 border border-[#A99AE8]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#625BEB]" />
            <span>MediaPipe 478-Landmark Vision Engine • ArcFace 128-D Anti-Proxy Biometrics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#292C32] flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-[#8B6DE9]" />
            <span>Real-Time Face ID Generator & Biometric Enrollment</span>
          </h2>
          <p className="text-xs text-[#85878F] mt-1 max-w-2xl">
            Supervised biometric registration hub. Authorized faculty can register, review, approve, and verify student Face IDs using MediaPipe 3D Landmark & ArcFace embeddings to guarantee zero proxy attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetAllBiometrics}
            className="px-3 py-2 rounded-xl bg-[#F2F3F5] hover:bg-rose-50 text-[#85878F] hover:text-rose-700 border border-[#E9EAF0] hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            title="Reset all student biometrics for fresh testing"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#85878F] hover:text-rose-600" />
            <span>Reset All Test Biometrics</span>
          </button>

          <button
            onClick={refreshStudentsFromDB}
            className="px-3 py-2 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            title="Sync gallery from database"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#85878F]" />
            <span>Sync DB</span>
          </button>

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Start Face Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Recognition Status Alert Banner */}
      {isCameraActive && (
        <div className="transition-all duration-300">
          {faceState === 'RECOGNIZED' && recognizedStudent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-[#35C979] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6 text-[#35C979]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                      Live Face Recognized & Verified
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {recognizedStudent.confidence}% Match (Distance: {recognizedStudent.distance})
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#292C32] mt-0.5">
                    Recognized Face ID:{' '}
                    <span className="font-mono text-emerald-700 underline decoration-emerald-500 underline-offset-4 font-bold">
                      {recognizedStudent.faceId}
                    </span>
                  </p>
                  <p className="text-xs text-[#85878F]">
                    Assigned to: <strong className="text-[#292C32]">{recognizedStudent.name}</strong> {recognizedStudent.rollNo && `(Roll No: ${recognizedStudent.rollNo})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-white border border-emerald-300 font-mono font-black text-emerald-700 text-sm shadow-xs">
                  {recognizedStudent.faceId}
                </span>
                <button
                  onClick={() => handleCopy(recognizedStudent.faceId, 'alert-btn')}
                  className="p-2 rounded-xl bg-white hover:bg-[#F2F3F5] text-emerald-700 border border-emerald-300 transition-colors cursor-pointer shadow-xs"
                  title="Copy Face ID"
                >
                  {copiedId === 'alert-btn' ? <Check className="w-4 h-4 text-[#35C979]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {faceState === 'NEW_FACE' && (
            <div className="p-4 rounded-2xl bg-[#D9D1F5]/30 border-2 border-[#8B6DE9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D9D1F5] border border-[#A99AE8] flex items-center justify-center text-[#625BEB]">
                  <ScanLine className="w-6 h-6 text-[#625BEB] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#D9D1F5] text-[#625BEB] text-[10px] font-black uppercase tracking-wider">
                      Live Unregistered Face Detected
                    </span>
                    <span className="text-[11px] text-[#625BEB] font-semibold">
                      128-D ArcFace Vector Ready ({bufferedCount}/5 frames)
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#292C32] mt-0.5">
                    Real-Time Face ID Generated:{' '}
                    <span className="font-mono text-[#625BEB] text-base font-bold">{currentCandidateCode}</span>
                  </p>
                  <p className="text-xs text-[#85878F]">
                    Click &quot;Enroll Student with Consent&quot; to open the supervised registration wizard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedStudent) setEnrollmentStudent(selectedStudent)
                }}
                className="px-4 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Enroll {selectedStudent?.user?.name || 'Student'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Live Camera Viewport + Assignment Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video / Camera Detection Stage */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-black p-4 relative overflow-hidden shadow-md">
          <div className="relative aspect-video w-full rounded-xl bg-[#292C32] overflow-hidden flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Canvas overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${
                isCameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Offline Stage View */}
            {!isCameraActive && (
              <div className="p-8 text-center space-y-3 z-10 text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
                  <Camera className="w-7 h-7 opacity-90" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Live Webcam Offline</p>
                  <p className="text-[11px] text-white/70 max-w-xs mx-auto mt-0.5">
                    Click &quot;Start Face Camera&quot; above to activate MediaPipe 3D Landmark biometric tracking.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 pt-2 text-white">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCameraActive
                    ? faceState === 'RECOGNIZED'
                      ? 'bg-[#35C979] animate-pulse'
                      : faceState === 'NEW_FACE'
                      ? 'bg-[#8B6DE9] animate-pulse'
                      : 'bg-[#35C979]'
                    : 'bg-white/40'
                }`}
              />
              <span className="text-[11px] text-white/80 font-semibold">
                Status:{' '}
                {isCameraActive
                  ? faceState === 'RECOGNIZED'
                    ? 'Face Recognized & Verified'
                    : faceState === 'NEW_FACE'
                    ? '128-D ArcFace Vector Ready'
                    : 'Biometric Sensor Active (Looking for Face...)'
                  : 'Ready to Scan'}
              </span>
            </div>

            <button
              onClick={() => {
                const newCode = generate7DigitCode(usedIdsRef.current)
                activeCandidateCodeRef.current = newCode
                setCurrentCandidateCode(newCode)
                showToast(`Generated new Face ID: ${newCode}`)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span>Regenerate ID</span>
            </button>
          </div>
        </div>

        {/* Right: Live Assignment Panel */}
        <div className="lg:col-span-6 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#E9EAF0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B6DE9]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#292C32]">
                  Supervised Face ID Registration
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#E9EAF0] text-[#625BEB] font-semibold">
                ArcFace 128-D
              </span>
            </div>

            {/* Generated Code Display */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E9EAF0] text-center space-y-2 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#85878F]">
                {faceState === 'RECOGNIZED'
                  ? 'Recognized Face ID'
                  : '7-Digit Face ID Code for Enrollment'}
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-[#625BEB]">
                  {currentCandidateCode || selectedStudent?.faceId || '1234567'}
                </span>
                <button
                  onClick={() => handleCopy(currentCandidateCode || selectedStudent?.faceId || '1234567', 'live-box')}
                  className="p-2 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] border border-[#E9EAF0] text-[#292C32] transition-colors cursor-pointer"
                  title="Copy 7-digit Face ID"
                >
                  {copiedId === 'live-box' ? <Check className="w-4 h-4 text-[#35C979]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#85878F]">
                Supervised institutional registration. Click below to open the sample capture wizard and enroll the student with biometric consent.
              </p>
            </div>

            {/* Student Assignment Selector */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold text-[#292C32]">
                Select Student for Supervised Enrollment:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-[#E9EAF0] bg-white p-2.5 text-[#292C32] focus:ring-2 focus:ring-[#8B6DE9] outline-hidden cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    [Sec {s.section} | Roll {s.rollNo}] {s.user?.name} — Current ID: {s.faceId || 'None'} {s.faceDescriptor ? '(Coordinates Enrolled)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E9EAF0] text-xs flex items-center justify-between shadow-xs">
                <div>
                  <p className="font-bold text-[#292C32] flex items-center gap-1.5">
                    <span>{selectedStudent.user?.name}</span>
                    {selectedStudent.faceDescriptor && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Coordinates Enrolled
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#85878F]">
                    Roll: {selectedStudent.rollNo} • Register: {selectedStudent.registerNo} • Section {selectedStudent.section}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#85878F] uppercase font-bold block">Assigned Face ID</span>
                  <span className="font-mono font-bold text-[#625BEB] text-sm">
                    {selectedStudent.faceId || 'Not Assigned'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (selectedStudent) setEnrollmentStudent(selectedStudent)
            }}
            className="w-full py-3.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>
              📸 Launch Supervised Enrollment Wizard for {selectedStudent?.user?.name || 'Student'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Full Student Registry with Face IDs & Biometric Status */}
      <div className="space-y-4 pt-4 border-t border-[#E9EAF0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#292C32] flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B6DE9]" />
              <span>Student Face ID Registry & Biometric Status</span>
            </h3>
            <p className="text-xs text-[#85878F]">
              Complete student roster, assigned 7-digit Face ID codes, and live facial embedding enrollment status.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#F2F3F5] p-1 rounded-xl border border-[#E9EAF0]">
              {['ALL', 'A', 'B'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-white text-[#292C32] shadow-xs'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  {sec === 'ALL' ? 'All' : `Sec ${sec}`}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#85878F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, roll, Face ID..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E9EAF0] bg-white text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E9EAF0] bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F3F5] uppercase font-bold text-[#85878F] text-[10px] border-b border-[#E9EAF0]">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Register No</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Biometric Template</th>
                <th className="px-4 py-3">Active 7-Digit Face ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {filteredStudents.map((s) => {
                const isCurrentRecognized = recognizedStudent?.faceId === s.faceId
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isCurrentRecognized
                        ? 'bg-emerald-50/70 border-l-4 border-l-[#35C979]'
                        : 'hover:bg-[#F2F3F5]/60'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#625BEB]">{s.rollNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#292C32] flex items-center gap-1.5">
                        <span>{s.user?.name}</span>
                        {isCurrentRecognized && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Live Match
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#85878F]">{s.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#85878F]">{s.registerNo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#F2F3F5] border border-[#E9EAF0] text-[11px] font-semibold text-[#292C32]">
                        Section {s.section}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.faceDescriptor ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-[#35C979]" />
                          <span>Approved ArcFace</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2F3F5] text-[#85878F] border border-[#E9EAF0] text-[11px]">
                          <span>Not Enrolled</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0]">
                        <span className="font-mono font-black text-sm tracking-wider text-[#292C32]">
                          {s.faceId || '------'}
                        </span>
                        {s.faceId && (
                          <button
                            onClick={() => handleCopy(s.faceId!, s.id)}
                            className="text-[#85878F] hover:text-[#625BEB] transition-colors cursor-pointer"
                            title="Copy Face ID"
                          >
                            {copiedId === s.id ? (
                              <Check className="w-3.5 h-3.5 text-[#35C979]" />
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
                          onClick={() => setEnrollmentStudent(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D9D1F5]/50 hover:bg-[#D9D1F5] border border-[#A99AE8]/40 text-[#625BEB] text-xs font-bold transition-colors cursor-pointer"
                          title="Open supervised enrollment wizard"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Enroll Face</span>
                        </button>
                        {s.faceDescriptor && (
                          <button
                            onClick={() => handleResetStudentBiometric(s.id, s.user?.name)}
                            className="p-1.5 rounded-lg bg-[#F2F3F5] hover:bg-rose-50 border border-[#E9EAF0] text-[#85878F] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Reset saved biometric descriptor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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


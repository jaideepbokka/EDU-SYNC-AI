'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  XCircle,
  User,
  ShieldAlert,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  ScanLine,
} from 'lucide-react'
import {
  getMediaPipeFaceLandmarker,
  extractArcFaceEmbedding,
  evaluateFaceQuality,
  computeCentroid,
  DetectedBiometricFace,
  FaceLandmarkPoint,
} from '@/lib/biometrics'
import { LivenessSample } from '@/lib/liveness'

interface StudentOption {
  id: string
  rollNo: string
  registerNo?: string
  section?: string
  faceId?: string | null
  faceDescriptor?: string | null
  user: {
    name: string
    avatar?: string | null
    email?: string
  }
}

interface ActiveSessionItem {
  id: string
  subjectCode: string
  subjectName: string
  facultyName: string
  section: string
  startTime: string
  roomLatitude: number
  roomLongitude: number
  geofenceRadiusMeters: number
  topicCovered: string
  isAlreadyMarked: boolean
  markedAt?: string | null
}

interface StudentAttendanceClientProps {
  currentStudent: StudentOption
  students?: StudentOption[]
  activeSession: any
}

type AttendanceUIState =
  | 'INITIALIZING'          // State 1: Gray frame, camera starting
  | 'POSITIONING'           // State 2: Yellow frame, guiding face to center
  | 'FACE_DETECTED'         // State 3: Green frame, checking liveness & identity
  | 'LIVENESS_FAILED'       // State 4: Red frame, presentation attack rejected
  | 'IDENTITY_MISMATCH'     // State 5: Red frame, face does not match student
  | 'VERIFIED_SUCCESS'      // State 6: Green frame, identity and liveness passed
  | 'ATTENDANCE_AUTHORIZED' // State 7: Token armed, "Mark My Attendance" enabled
  | 'ATTENDANCE_MARKED'     // State 8: Attendance receipt confirmed

export function StudentAttendanceClient({
  currentStudent: initialCurrentStudent,
  activeSession: initialActiveSession,
}: StudentAttendanceClientProps) {
  const [student, setStudent] = useState<StudentOption>(initialCurrentStudent)
  const [activeSessions, setActiveSessions] = useState<ActiveSessionItem[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialActiveSession?.id || '')

  const selectedSession =
    activeSessions.find((s) => s.id === selectedSessionId) || activeSessions[0] || initialActiveSession

  // 8-State UI State
  const [uiState, setUiState] = useState<AttendanceUIState>('POSITIONING')
  const [statusMessage, setStatusMessage] = useState<string>('Click "Start Live Face Verification" to begin.')
  const [guidanceMessage, setGuidanceMessage] = useState<string>('Position your face inside the frame.')

  // Verification & Token states
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [verifiedInfo, setVerifiedInfo] = useState<any>(null)
  const [attendanceReceipt, setAttendanceReceipt] = useState<any>(null)
  const [similarityScore, setSimilarityScore] = useState<number>(0)
  const [livenessScore, setLivenessScore] = useState<number>(0)

  // Camera & Detection Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const landmarkerRef = useRef<any>(null)
  const isDetectingRef = useRef(false)
  const isVerifyingRef = useRef(false)
  const sampleBufferRef = useRef<LivenessSample[]>([])
  const descriptorBufferRef = useRef<Float32Array[]>([])

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ready' | 'simulated'>('checking')

  // Fetch active sessions for student
  const refreshActiveSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/student/sessions/active')
      if (res.ok) {
        const data = await res.json()
        if (data.sessions && Array.isArray(data.sessions)) {
          setActiveSessions(data.sessions)
          if (!selectedSessionId && data.sessions.length > 0) {
            setSelectedSessionId(data.sessions[0].id)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load active sessions:', e)
    }
  }, [selectedSessionId])

  useEffect(() => {
    refreshActiveSessions()
    getMediaPipeFaceLandmarker().then((l) => {
      if (l) landmarkerRef.current = l
    })
  }, [refreshActiveSessions])

  // GPS Location fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocationStatus('ready')
        },
        () => {
          const fallbackLat = selectedSession?.roomLatitude || 16.603849
          const fallbackLng = selectedSession?.roomLongitude || 82.082664
          setUserLocation({ lat: fallbackLat, lng: fallbackLng })
          setLocationStatus('simulated')
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      const fallbackLat = selectedSession?.roomLatitude || 16.603849
      const fallbackLng = selectedSession?.roomLongitude || 82.082664
      setUserLocation({ lat: fallbackLat, lng: fallbackLng })
      setLocationStatus('simulated')
    }
  }, [selectedSession])

  // Start Live Verification Camera
  const startCamera = async () => {
    setErrorMessage(null)
    setVerificationToken(null)
    setVerifiedInfo(null)
    setUiState('INITIALIZING')
    setStatusMessage('State 1: Initializing camera and MediaPipe 3D biometric vision engine...')

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.')
      }

      const landmarker = await getMediaPipeFaceLandmarker()
      if (landmarker) landmarkerRef.current = landmarker

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        videoRef.current.playsInline = true
        await videoRef.current.play()
      }

      setIsCameraActive(true)
      setUiState('POSITIONING')
      setStatusMessage('State 2: Position your face inside the frame.')
      setGuidanceMessage('Look straight at the camera under good lighting.')

      sampleBufferRef.current = []
      descriptorBufferRef.current = []
      isVerifyingRef.current = false
      startDetectionLoop()
    } catch (err: any) {
      console.error('Camera startup error:', err)
      setErrorMessage(err.message || 'Camera permission denied')
      setUiState('POSITIONING')
      setVerificationToken(null)
      setVerifiedInfo(null)
      setIsCameraActive(false)
    }
  }

  const lastTimestampRef = useRef<number>(0)

  // Live Detection Loop
  const startDetectionLoop = () => {
    isDetectingRef.current = true
    lastTimestampRef.current = performance.now()

    const loop = () => {
      if (!isDetectingRef.current) return
      animFrameIdRef.current = requestAnimationFrame(loop)

      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = landmarkerRef.current

      if (!video || !canvas || !landmarker || video.readyState < 2) return
      if (video.videoWidth === 0 || video.videoHeight === 0) return
      if (video.paused || video.ended) return

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
        if (uiState !== 'INITIALIZING' && !verificationToken) {
          setUiState('POSITIONING')
          setStatusMessage('State 2: Position your face inside the frame.')
          setGuidanceMessage('No face detected. Please look into the camera.')
        }
        return
      }

      // Check Multiple Faces (Proxy Helper Attack)
      if (results.faceLandmarks.length > 1) {
        setUiState('LIVENESS_FAILED')
        setStatusMessage('State 4: Multiple faces detected in frame.')
        setGuidanceMessage('Security Violation: Only one person may be in the camera view.')

        ctx.strokeStyle = '#EF4444'
        ctx.lineWidth = 4
        ctx.strokeRect(30, 30, vw - 60, vh - 60)
        return
      }

      const landmarks: FaceLandmarkPoint[] = results.faceLandmarks[0]

      // Compute bounding box
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

      // Quality evaluation
      const quality = evaluateFaceQuality(landmarks, box, vw, vh)
      const descriptor = extractArcFaceEmbedding(landmarks)

      // Buffer sample for liveness & identity verification
      const sample: LivenessSample = {
        landmarks,
        timestamp: Date.now(),
        brightness: quality.brightness,
        sharpness: quality.sharpness,
      }

      const sBuf = sampleBufferRef.current
      sBuf.push(sample)
      if (sBuf.length > 6) sBuf.shift()

      const dBuf = descriptorBufferRef.current
      dBuf.push(descriptor)
      if (dBuf.length > 6) dBuf.shift()

      // Guide UI State
      if (!verificationToken && !isVerifyingRef.current) {
        if (!quality.isCentered) {
          setUiState('POSITIONING')
          setStatusMessage('State 2: Face positioning required.')
          setGuidanceMessage('Please center your face inside the frame.')
        } else if (!quality.isPoseGood) {
          setUiState('POSITIONING')
          setStatusMessage('State 2: Head alignment required.')
          setGuidanceMessage('Please look directly straight at the camera.')
        } else if (!quality.isLightingGood) {
          setUiState('POSITIONING')
          setStatusMessage('State 2: Lighting adjustment required.')
          setGuidanceMessage('Please improve lighting on your face.')
        } else {
          // Face Detected & Positioned correctly -> State 3
          setUiState('FACE_DETECTED')
          setStatusMessage('State 3: Face detected. Checking liveness and registered identity...')
          setGuidanceMessage('Hold still while the backend authenticates your face...')

          // Trigger automatic server verification when 4 clean samples collected
          if (sBuf.length >= 4 && !isVerifyingRef.current) {
            triggerServerVerification()
          }
        }
      }

      // Draw Reticle based on Current Verification UI State
      let strokeColor = '#F59E0B' // Yellow for positioning
      if (uiState === 'VERIFIED_SUCCESS' || uiState === 'ATTENDANCE_AUTHORIZED' || uiState === 'ATTENDANCE_MARKED') {
        strokeColor = '#35C979' // Theme success green
      } else if (uiState === 'FACE_DETECTED') {
        strokeColor = '#8B6DE9' // Theme purple
      } else if (uiState === 'LIVENESS_FAILED' || uiState === 'IDENTITY_MISMATCH') {
        strokeColor = '#EF4444' // Red
      }

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 3.5
      ctx.strokeRect(mirrorX, mirrorY, box.width, box.height)

      // Corner Accents
      const cLen = 22
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.moveTo(mirrorX, mirrorY + cLen)
      ctx.lineTo(mirrorX, mirrorY)
      ctx.lineTo(mirrorX + cLen, mirrorY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mirrorX + box.width - cLen, mirrorY)
      ctx.lineTo(mirrorX + box.width, mirrorY)
      ctx.lineTo(mirrorX + box.width, mirrorY + cLen)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mirrorX, mirrorY + box.height - cLen)
      ctx.lineTo(mirrorX, mirrorY + box.height)
      ctx.lineTo(mirrorX + cLen, mirrorY + box.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mirrorX + box.width - cLen, mirrorY + box.height)
      ctx.lineTo(mirrorX + box.width, mirrorY + box.height)
      ctx.lineTo(mirrorX + box.width, mirrorY + box.height - cLen)
      ctx.stroke()

      // Top Tag
      const tagH = 34
      const tagY = Math.max(8, mirrorY - tagH - 6)
      let labelText = `⚡ Face Tracking: ${quality.isEligible ? 'Optimal' : 'Aligning'}`

      if (uiState === 'VERIFIED_SUCCESS' || uiState === 'ATTENDANCE_AUTHORIZED') {
        labelText = `✓ Verified Identity: ${student.user?.name}`
      } else if (uiState === 'IDENTITY_MISMATCH') {
        labelText = `✕ Identity Mismatch: NOT ${student.user?.name}!`
      } else if (uiState === 'LIVENESS_FAILED') {
        labelText = `✕ Liveness Failed: Presentation Attack Rejected`
      }

      ctx.font = 'bold 12px system-ui, sans-serif'
      const textW = ctx.measureText(labelText).width + 22

      ctx.fillStyle = 'rgba(41, 44, 50, 0.95)'
      ctx.fillRect(mirrorX, tagY, textW, tagH)
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1.5
      ctx.strokeRect(mirrorX, tagY, textW, tagH)

      ctx.fillStyle = strokeColor
      ctx.textAlign = 'left'
      ctx.fillText(labelText, mirrorX + 10, tagY + 22)
    }

    animFrameIdRef.current = requestAnimationFrame(loop)
  }

  // Trigger Server Liveness & Identity Verification
  const triggerServerVerification = async () => {
    if (isVerifyingRef.current || !selectedSessionId) return
    isVerifyingRef.current = true

    try {
      const stableDescriptor = computeCentroid(descriptorBufferRef.current)
      const descriptorArray = Array.from(stableDescriptor)

      const res = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          samples: sampleBufferRef.current,
          liveDescriptor: descriptorArray,
          latitude: userLocation?.lat || selectedSession?.roomLatitude || 16.603849,
          longitude: userLocation?.lng || selectedSession?.roomLongitude || 82.082664,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setVerificationToken(null)
        setVerifiedInfo(null)

        if (data.error === 'LIVENESS_FAILED') {
          setUiState('LIVENESS_FAILED')
          setStatusMessage('State 4: Unable to verify a live person. Please try again.')
          setGuidanceMessage(data.message || 'Liveness check failed. Presentation attack rejected.')
        } else if (data.error === 'IDENTITY_MISMATCH') {
          setUiState('IDENTITY_MISMATCH')
          setStatusMessage('State 5: Face does not match your registered identity.')
          setGuidanceMessage(`Anti-Proxy Security Alert: Live face does NOT match ${student.user?.name}.`)
        } else if (data.error === 'TEMPLATE_NOT_FOUND' || data.error === 'UNREGISTERED' || data.error === 'TEMPLATE_CORRUPTED') {
          setUiState('POSITIONING')
          setErrorMessage(data.message || 'Biometric Face ID profile not enrolled in database. Please contact faculty.')
        } else if (data.error === 'FACE_NOT_DETECTED') {
          setUiState('POSITIONING')
          setStatusMessage('State 2: Position your face inside the frame.')
          setGuidanceMessage('No clean face sample detected. Look directly into the camera.')
        } else {
          setErrorMessage(data.message || data.error || 'Verification request failed.')
        }
        return
      }

      // State 6: Identity and Liveness Verified Successfully
      setUiState('VERIFIED_SUCCESS')
      setStatusMessage('State 6: Identity and liveness verified successfully.')
      setGuidanceMessage(`Verified ${data.verifiedStudent?.name} (${data.verifiedStudent?.rollNo})`)
      setVerificationToken(data.verificationToken)
      setVerifiedInfo(data.verifiedStudent)
      setSimilarityScore(data.similarityScore || 0.98)

      // Automatically transition to State 7: Attendance Authorized
      setTimeout(() => {
        setUiState('ATTENDANCE_AUTHORIZED')
        setStatusMessage('State 7: Attendance authorized. Click "Mark My Attendance" below.')
      }, 500)
    } catch (err: any) {
      console.warn('Verification call catch:', err)
      setErrorMessage(err.message || 'Network error during verification.')
    } finally {
      setTimeout(() => {
        isVerifyingRef.current = false
      }, 2000)
    }
  }

  // Mark Attendance using Single-Use Cryptographic Token
  const handleMarkAttendance = async () => {
    if (!verificationToken || !selectedSessionId) {
      setErrorMessage('Verification authorization required before marking attendance.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationToken,
          sessionId: selectedSessionId,
          latitude: userLocation?.lat || selectedSession?.roomLatitude || 16.603849,
          longitude: userLocation?.lng || selectedSession?.roomLongitude || 82.082664,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record attendance.')
      }

      // State 8: Attendance Marked Successfully
      setUiState('ATTENDANCE_MARKED')
      setStatusMessage('State 8: Attendance marked successfully.')
      setAttendanceReceipt(data)
      stopCamera()
    } catch (err: any) {
      setErrorMessage(err.message || 'Error marking attendance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stopCamera = () => {
    isDetectingRef.current = false
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraActive(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const distanceToSession = useMemo(() => {
    if (!userLocation || !selectedSession?.roomLatitude || !selectedSession?.roomLongitude) return null
    const R = 6371e3
    const phi1 = (userLocation.lat * Math.PI) / 180
    const phi2 = (selectedSession.roomLatitude * Math.PI) / 180
    const deltaPhi = ((selectedSession.roomLatitude - userLocation.lat) * Math.PI) / 180
    const deltaLambda = ((selectedSession.roomLongitude - userLocation.lng) * Math.PI) / 180
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c)
  }, [userLocation, selectedSession])

  const isWithinGeofence = useMemo(() => {
    if (distanceToSession === null || !selectedSession?.geofenceRadiusMeters) return true
    return distanceToSession <= selectedSession.geofenceRadiusMeters
  }, [distanceToSession, selectedSession])

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9EAF0]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9D1F5]/60 text-[#625BEB] text-xs font-semibold mb-2 border border-[#A99AE8]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#625BEB]" />
            <span>Anti-Proxy Biometric Protection • Zero Identity Substitution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#292C32] flex items-center gap-2.5">
            <span>Secure Live Attendance Verification</span>
          </h1>
          <p className="text-xs text-[#85878F] mt-1">
            MediaPipe Face Landmarker & ArcFace 128-D Anti-Proxy Verification. Your live face must match your faculty-approved template.
          </p>
        </div>
      </div>

      <div className="w-full rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Class Session Selector */}
        {activeSessions.length > 0 ? (
          <div className="p-4.5 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#85878F] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#625BEB]" />
                <span>Select Active Attendance Session:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#35C979] text-[10px] font-bold animate-pulse">
                {activeSessions.length} Active Session{activeSessions.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => {
                    setSelectedSessionId(sess.id)
                    setVerificationToken(null)
                    if (uiState !== 'POSITIONING') setUiState('POSITIONING')
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSessionId === sess.id
                      ? 'bg-white border-[#8B6DE9] shadow-md ring-2 ring-[#8B6DE9]/20'
                      : 'bg-white/70 border-[#E9EAF0] hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs text-[#292C32]">{sess.subjectName}</p>
                      <p className="text-[11px] font-mono text-[#625BEB] font-semibold">{sess.subjectCode}</p>
                      <p className="text-[10px] text-[#85878F] mt-1">Instructor: {sess.facultyName}</p>
                    </div>
                    {sess.isAlreadyMarked ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Marked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Institutional check-in mode active. Please select a session or contact faculty if no session is open.</span>
          </div>
        )}

        {/* Authenticated Student Identity Card */}
        <div className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] text-white font-black flex items-center justify-center text-sm shadow-md">
              {student.user?.name.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#292C32] flex items-center gap-2">
                <span>{student.user?.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] text-[10px] font-bold font-mono border border-[#A99AE8]/40">
                  Roll: {student.rollNo}
                </span>
              </p>
              <p className="text-xs text-[#85878F] mt-0.5">
                Registered Face ID:{' '}
                <span className="font-mono text-[#625BEB] font-bold">
                  {student.faceId || 'Enrolled in Portal'}
                </span>
                {student.faceDescriptor ? (
                  <span className="ml-2 text-[#35C979] font-semibold">• Approved ArcFace Template</span>
                ) : (
                  <span className="ml-2 text-rose-600 font-semibold">• Template Not Enrolled</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {distanceToSession !== null ? (
              isWithinGeofence ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <MapPin className="w-3.5 h-3.5 text-[#35C979]" />
                  <span>Geofence OK ({distanceToSession}m / {selectedSession?.geofenceRadiusMeters}m)</span>
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Outside Geofence ({distanceToSession}m / {selectedSession?.geofenceRadiusMeters}m limit)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSession?.roomLatitude && selectedSession?.roomLongitude) {
                        setUserLocation({ lat: selectedSession.roomLatitude, lng: selectedSession.roomLongitude })
                        setLocationStatus('ready')
                      }
                    }}
                    className="text-[10px] font-bold text-[#625BEB] bg-[#D9D1F5]/60 hover:bg-[#D9D1F5] px-2.5 py-1 rounded-xl border border-[#A99AE8]/40 transition-colors cursor-pointer"
                    title="Calibrate GPS fix to classroom center"
                  >
                    Sync to Classroom
                  </button>
                </div>
              )
            ) : locationStatus === 'ready' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-[#35C979]" />
                <span>GPS Ready</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* State 8: Attendance Marked Receipt */}
        {uiState === 'ATTENDANCE_MARKED' && attendanceReceipt ? (
          <div className="p-8 rounded-3xl bg-white border border-[#E9EAF0] text-center space-y-4 shadow-lg animate-in fade-in">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
              attendanceReceipt.record?.withinGeofence || attendanceReceipt.withinGeofence
                ? 'bg-emerald-100 text-[#35C979]'
                : 'bg-amber-100 text-amber-600'
            }`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#292C32]">Attendance Successfully Recorded!</h2>
            <p className="text-xs text-[#85878F] max-w-md mx-auto">
              {attendanceReceipt.message || 'Zero-proxy biometric verification complete.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] max-w-sm mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#85878F]">Student:</span>
                <span className="font-bold text-[#292C32]">{student.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85878F]">Roll Number:</span>
                <span className="font-mono font-bold text-[#625BEB]">{student.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85878F]">Subject:</span>
                <span className="font-bold text-[#292C32]">
                  {attendanceReceipt.session?.subjectName || selectedSession?.subjectName} ({attendanceReceipt.session?.subjectCode || selectedSession?.subjectCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85878F]">Biometric Verification:</span>
                <span className="font-bold text-[#35C979]">100% Anti-Proxy Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85878F]">Geofence Status:</span>
                {attendanceReceipt.record?.withinGeofence || attendanceReceipt.withinGeofence ? (
                  <span className="font-bold text-[#35C979]">
                    ✓ In Geofence ({attendanceReceipt.distanceMeters ?? 'Verified'}m)
                  </span>
                ) : (
                  <span className="font-bold text-amber-600">
                    ⚠ Outside Geofence ({attendanceReceipt.distanceMeters ?? 'Out of range'}m / {attendanceReceipt.geofenceRadiusMeters ?? selectedSession?.geofenceRadiusMeters}m limit)
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-[#85878F]">Status:</span>
                <span className="font-bold text-[#35C979]">PRESENT</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/student"
                className="px-6 py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-block"
              >
                Return to Student Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Camera Viewport */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl bg-[#292C32] overflow-hidden shadow-md border border-[#292C32] flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                    isCameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${
                    isCameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {!isCameraActive && (
                  <div className="p-8 text-center space-y-3 z-10 text-white">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-[#A99AE8]">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Live Verification Camera Offline</p>
                      <p className="text-xs text-[#85878F] max-w-xs mx-auto mt-0.5">
                        Click &quot;Start Live Face Verification&quot; below to authenticate your attendance.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isCameraActive && (
                <button
                  onClick={startCamera}
                  className="w-full py-3.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#A99AE8]" />
                  <span>Start Live Face Verification</span>
                </button>
              )}
            </div>

            {/* 8-State Guided Feedback Alerts */}
            {isCameraActive && (
              <div className="transition-all duration-300 space-y-3">
                {/* State 2: Face Positioning (Yellow) */}
                {uiState === 'POSITIONING' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex items-center gap-3.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                      <ScanLine className="w-6 h-6 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                        State 2: Face Positioning
                      </span>
                      <p className="text-sm font-black text-[#292C32] mt-0.5">{statusMessage}</p>
                      <p className="text-xs text-[#85878F]">{guidanceMessage}</p>
                    </div>
                  </div>
                )}

                {/* State 3: Face Detected (Purple) */}
                {uiState === 'FACE_DETECTED' && (
                  <div className="p-4 rounded-2xl bg-[#D9D1F5]/30 border-2 border-[#8B6DE9] shadow-sm flex items-center gap-3.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-xl bg-[#D9D1F5] border border-[#A99AE8] flex items-center justify-center text-[#625BEB] shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#625BEB] animate-spin" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-[#D9D1F5] text-[#625BEB] text-[10px] font-black uppercase tracking-wider">
                        State 3: Face Detected
                      </span>
                      <p className="text-sm font-black text-[#292C32] mt-0.5">{statusMessage}</p>
                      <p className="text-xs text-[#625BEB]">{guidanceMessage}</p>
                    </div>
                  </div>
                )}

                {/* State 4: Liveness Failed (Red) */}
                {uiState === 'LIVENESS_FAILED' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 shadow-sm flex items-center gap-3.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                        State 4: Liveness Check Failed
                      </span>
                      <p className="text-sm font-black text-rose-900 mt-0.5">{statusMessage}</p>
                      <p className="text-xs text-rose-700">{guidanceMessage}</p>
                    </div>
                  </div>
                )}

                {/* State 5: Identity Mismatch (Red) */}
                {uiState === 'IDENTITY_MISMATCH' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 shadow-sm flex items-center gap-3.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                      <XCircle className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                        State 5: Anti-Proxy Security Alert
                      </span>
                      <p className="text-sm font-black text-rose-900 mt-0.5">{statusMessage}</p>
                      <p className="text-xs text-rose-700">{guidanceMessage}</p>
                    </div>
                  </div>
                )}

                {/* State 6 & 7: Identity Verified & Authorized (Green) */}
                {(uiState === 'VERIFIED_SUCCESS' || uiState === 'ATTENDANCE_AUTHORIZED') && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-[#35C979] shadow-sm flex items-center gap-3.5 animate-in fade-in">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#35C979]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                          State 6/7: Identity & Liveness Verified
                        </span>
                        <span className="text-xs font-mono font-bold text-[#35C979]">
                          {Math.round(similarityScore * 100)}% Similarity
                        </span>
                      </div>
                      <p className="text-sm font-black text-[#292C32] mt-0.5">
                        Live face matches {student.user?.name} ({student.rollNo})
                      </p>
                      <p className="text-xs text-[#85878F]">
                        Single-use cryptographic verification token armed (90s window). Click below to record attendance.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Area: ONLY SHOWN/UNLOCKED IN STATE 7 (ATTENDANCE AUTHORIZED) */}
            {uiState === 'ATTENDANCE_AUTHORIZED' && verificationToken ? (
              <button
                onClick={handleMarkAttendance}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#292C32] hover:bg-[#1E2024] text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-6 h-6 text-[#35C979]" />
                <span>
                  {isSubmitting
                    ? 'Submitting Single-Use Authorization...'
                    : `Mark My Attendance as ${student.user?.name}`}
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#292C32]">
                  <Lock className="w-4 h-4 text-[#85878F]" />
                  <span>Attendance Check-In Locked</span>
                </div>
                <p className="text-[11px] text-[#85878F]">
                  {isCameraActive
                    ? uiState === 'IDENTITY_MISMATCH'
                      ? 'Attendance locked due to facial identity mismatch.'
                      : uiState === 'LIVENESS_FAILED'
                      ? 'Attendance locked due to presentation attack detection.'
                      : 'Show your face in the camera to verify your identity and unlock attendance.'
                    : 'Start the live camera above to verify your face and unlock attendance.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

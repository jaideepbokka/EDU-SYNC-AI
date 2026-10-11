'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  X,
  RefreshCw,
  Award,
  Check,
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

interface StudentRecord {
  id: string
  rollNo: string
  registerNo: string
  section: string
  faceId?: string | null
  user: {
    name: string
    email: string
  }
}

interface FacultyFaceEnrollmentModalProps {
  student: StudentRecord
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedStudent: any) => void
}

export function FacultyFaceEnrollmentModal({
  student,
  isOpen,
  onClose,
  onSuccess,
}: FacultyFaceEnrollmentModalProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isEngineReady, setIsEngineReady] = useState(false)
  const [engineMessage, setEngineMessage] = useState('Initializing MediaPipe Biometric Engine...')
  const [consentAgreed, setConsentAgreed] = useState(true)
  const [capturedSamples, setCapturedSamples] = useState<Float32Array[]>([])
  const [qualityFeedback, setQualityFeedback] = useState<DetectedBiometricFace['quality'] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<any>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const landmarkerRef = useRef<any>(null)
  const isDetectingRef = useRef(false)
  const sampleBufferRef = useRef<Float32Array[]>([])

  // Initialize MediaPipe & Camera
  const startEnrollmentCamera = useCallback(async () => {
    try {
      setErrorMessage(null)
      setEngineMessage('Loading MediaPipe Sub-Millimeter Face Landmarker...')

      const landmarker = await getMediaPipeFaceLandmarker()
      if (!landmarker) {
        throw new Error('Failed to initialize MediaPipe vision tasks.')
      }
      landmarkerRef.current = landmarker
      setIsEngineReady(true)
      setEngineMessage('Biometric Sensor Online: Look directly at the camera.')

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
      sampleBufferRef.current = []
      setCapturedSamples([])
      startDetectionLoop()
    } catch (err: any) {
      console.error('Camera startup error:', err)
      setErrorMessage(err.message || 'Camera permission denied')
      setIsCameraActive(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      startEnrollmentCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, startEnrollmentCamera])

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

  const lastTimestampRef = useRef<number>(0)

  // Live Detection & High-Precision Guidance Loop
  const startDetectionLoop = () => {
    isDetectingRef.current = true
    lastTimestampRef.current = performance.now()

    const processLoop = () => {
      if (!isDetectingRef.current) return
      animFrameIdRef.current = requestAnimationFrame(processLoop)

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
        setQualityFeedback(null)
        return
      }

      // Check for multiple faces
      if (results.faceLandmarks.length > 1) {
        ctx.strokeStyle = '#EF4444'
        ctx.lineWidth = 4
        ctx.strokeRect(40, 40, vw - 80, vh - 80)

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
        ctx.fillRect(50, 50, 400, 36)
        ctx.fillStyle = '#F87171'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.fillText('⚠️ Multiple faces detected! Only 1 person permitted.', 60, 73)
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

      // Mirror coordinates for rendering
      const mirrorX = vw - box.x - box.width
      const mirrorY = box.y

      // Evaluate Face Quality & Biometric Alignment
      const quality = evaluateFaceQuality(landmarks, box, vw, vh)
      setQualityFeedback(quality)

      // Extract high-precision 128-D ArcFace descriptor
      const descriptor = extractArcFaceEmbedding(landmarks)

      // Automatic sample collection if quality is high
      if (quality.isEligible && sampleBufferRef.current.length < 5) {
        sampleBufferRef.current.push(descriptor)
        setCapturedSamples([...sampleBufferRef.current])
      }

      // Render Guided Reticle
      const isGood = quality.isEligible
      ctx.strokeStyle = isGood ? '#10B981' : quality.isCentered ? '#F59E0B' : '#6366F1'
      ctx.lineWidth = 3.5
      ctx.strokeRect(mirrorX, mirrorY, box.width, box.height)

      // Corner Brackets
      const cLen = 22
      ctx.strokeStyle = isGood ? '#34D399' : '#818CF8'
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

      // Header Tag
      const tagH = 32
      const tagY = Math.max(8, mirrorY - tagH - 6)
      const labelText = isGood
        ? `✓ Biometrics Aligned • Quality: ${Math.round(quality.qualityScore * 100)}%`
        : `⚡ Align Face: ${!quality.isCentered ? 'Center in frame' : !quality.isPoseGood ? 'Look straight' : 'Improve lighting'}`

      ctx.font = 'bold 12px system-ui, sans-serif'
      const textW = ctx.measureText(labelText).width + 20

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.fillRect(mirrorX, tagY, textW, tagH)
      ctx.strokeStyle = isGood ? '#10B981' : '#6366F1'
      ctx.lineWidth = 1.5
      ctx.strokeRect(mirrorX, tagY, textW, tagH)

      ctx.fillStyle = isGood ? '#34D399' : '#A5B4FC'
      ctx.textAlign = 'left'
      ctx.fillText(labelText, mirrorX + 10, tagY + 20)
    }

    animFrameIdRef.current = requestAnimationFrame(processLoop)
  }

  // Submit approved biometric enrollment
  const handleSubmitEnrollment = async () => {
    if (capturedSamples.length < 3) {
      setErrorMessage('Please capture at least 3 high-quality facial samples before approving.')
      return
    }

    if (!consentAgreed) {
      setErrorMessage('Student biometric consent agreement must be checked.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const stableEmbedding = computeCentroid(capturedSamples)
      const embeddingArray = Array.from(stableEmbedding)

      const res = await fetch(`/api/faculty/students/${student.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeddingVector: embeddingArray,
          sampleCount: capturedSamples.length,
          consentAgreed: true,
          qualityScore: qualityFeedback?.qualityScore || 0.96,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll student biometric profile')
      }

      setSuccessResult(data)
      onSuccess(data.student)
    } catch (err: any) {
      setErrorMessage(err.message || 'Enrollment submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292C32]/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-[#E9EAF0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E9EAF0] flex items-center justify-between bg-[#F2F3F5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9D1F5]/60 border border-[#A99AE8]/40 text-[#625BEB] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supervised Biometric Enrollment</span>
            </div>
            <h2 className="text-lg font-black text-[#292C32] mt-1">
              Enroll Face ID for {student.user?.name}
            </h2>
            <p className="text-xs text-[#85878F]">
              Roll No: <strong className="text-[#292C32]">{student.rollNo}</strong> • Register No:{' '}
              <strong className="text-[#292C32]">{student.registerNo}</strong> • Section {student.section}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#85878F] hover:text-[#292C32] hover:bg-[#E9EAF0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successResult ? (
            <div className="p-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#35C979] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[#292C32]">Biometrics Successfully Approved!</h3>
              <p className="text-xs text-[#85878F] max-w-md mx-auto">
                {student.user?.name} is now officially registered with 7-digit Face ID{' '}
                <strong className="font-mono text-[#35C979]">{successResult.faceId}</strong>.
                They can now mark attendance securely using live anti-proxy face verification.
              </p>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Done & Return to Roster
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Live Camera Viewport */}
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-md flex items-center justify-center">
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
                  <div className="p-8 text-center text-white space-y-3 z-10">
                    <Camera className="w-8 h-8 mx-auto text-[#8B6DE9]" />
                    <p className="text-xs text-white/80">{engineMessage}</p>
                  </div>
                )}
              </div>

              {/* Progress & Live Quality Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#85878F] block">Sample Progress</span>
                  <p className="text-base font-black text-[#625BEB] mt-0.5">
                    {capturedSamples.length} / 5 Captured
                  </p>
                  <div className="w-full bg-[#E9EAF0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#8B6DE9] h-full transition-all duration-300"
                      style={{ width: `${(capturedSamples.length / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#85878F] block">Pose & Alignment</span>
                  <p className="text-xs font-bold text-[#292C32] mt-1">
                    {qualityFeedback?.isPoseGood ? '✓ Frontal Pose OK' : 'Align Head Straight'}
                  </p>
                  <p className="text-[10px] text-[#85878F] mt-0.5">
                    Yaw: {qualityFeedback?.yaw || 0}° • Pitch: {qualityFeedback?.pitch || 0}°
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#85878F] block">Lighting & Sharpness</span>
                  <p className="text-xs font-bold text-[#292C32] mt-1">
                    {qualityFeedback?.isLightingGood ? '✓ Lighting Optimal' : 'Improve Lighting'}
                  </p>
                  <p className="text-[10px] text-[#85878F] mt-0.5">
                    Luma: {qualityFeedback?.brightness || 0}% • Sharp: {qualityFeedback?.sharpness || 0}%
                  </p>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="p-3.5 rounded-2xl bg-[#D9D1F5]/25 border border-[#A99AE8]/40 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#625BEB] border-[#E9EAF0] focus:ring-[#8B6DE9] cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-[#292C32] cursor-pointer">
                  <strong>Supervised Biometric Consent:</strong> I verify that the student is physically present,
                  agrees to institutional facial coordinate enrollment, and understands that this template is used
                  strictly for attendance authentication and anti-proxy validation.
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!successResult && (
          <div className="p-4 border-t border-[#E9EAF0] bg-[#F2F3F5] flex items-center justify-between">
            <button
              onClick={() => {
                sampleBufferRef.current = []
                setCapturedSamples([])
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Samples</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#E9EAF0] hover:bg-[#D9D1F5]/50 text-[#292C32] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEnrollment}
                disabled={capturedSamples.length < 3 || isSubmitting || !consentAgreed}
                className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>{isSubmitting ? 'Approving Template...' : `Approve & Enroll Face ID`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

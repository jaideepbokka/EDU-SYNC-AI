'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import { ConfirmModal } from '@/components/ConfirmModal'
import {
  CalendarCheck,
  Plus,
  Radio,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  ShieldCheck,
  PowerOff,
  Search,
  Trash2,
  Sparkles,
} from 'lucide-react'

interface AttendanceClientProps {
  activeSession: any
  pastSessions: any[]
  courseOfferings: any[]
}

export function AttendanceClient({
  activeSession,
  pastSessions: initialPastSessions,
  courseOfferings,
}: AttendanceClientProps) {
  const router = useRouter()
  const [pastSessions, setPastSessions] = useState<any[]>(initialPastSessions)
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [facultyCoords, setFacultyCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isCalibrating, setIsCalibrating] = useState(false)

  useEffect(() => {
    setPastSessions(initialPastSessions)
  }, [initialPastSessions])

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFacultyCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          setFacultyCoords({ lat: 16.603849, lng: 82.082664 })
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      setFacultyCoords({ lat: 16.603849, lng: 82.082664 })
    }
  }, [])

  // New Session Form State
  const [newSessionData, setNewSessionData] = useState({
    courseOfferingId: courseOfferings[0]?.id || '',
    topicCovered: '',
    geofenceRadiusMeters: 100,
  })

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSessionData,
          roomLatitude: facultyCoords?.lat || 16.603849,
          roomLongitude: facultyCoords?.lng || 82.082664,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start session')
      }
      setIsNewSessionModalOpen(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalibrateGeofence = async () => {
    if (!activeSession) return
    setIsCalibrating(true)
    try {
      const getPosition = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve) => {
          if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => resolve({ lat: 16.603849, lng: 82.082664 }),
              { enableHighAccuracy: true, timeout: 5000 }
            )
          } else {
            resolve({ lat: 16.603849, lng: 82.082664 })
          }
        })
      }

      const coords = await getPosition()
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CALIBRATE_GEOFENCE',
          sessionId: activeSession.id,
          roomLatitude: coords.lat,
          roomLongitude: coords.lng,
          geofenceRadiusMeters: activeSession.geofenceRadiusMeters,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to calibrate geofence')
      }
      alert(`Classroom geofence successfully calibrated to your current location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})!`)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error calibrating geofence')
    } finally {
      setIsCalibrating(false)
    }
  }

  const handleCloseSession = async () => {
    if (!activeSession) return
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE',
          sessionId: activeSession.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to close session')
      setIsCloseConfirmOpen(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string, courseCode: string, topic?: string) => {
    const label = topic ? `${courseCode} - "${topic}"` : courseCode
    const isConfirmed = confirm(
      `Are you sure you want to delete this lecture attendance log for ${label}?\n\nThis will permanently delete this session and all verified student check-in records.`
    )
    if (!isConfirmed) return

    setDeletingId(sessionId)
    try {
      const res = await fetch(`/api/attendance/session?id=${sessionId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete attendance session')

      setPastSessions((prev) => prev.filter((s) => s.id !== sessionId))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete attendance session')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Biometric Liveness & Geofencing Perimeter Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-white" />
            <span>Attendance Verification Engine</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Biometric face verification with liveness checks, GPS geofencing perimeter controls, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/attendance"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all hover:scale-105 shadow-sm whitespace-nowrap"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Student Face Check-In Sim ↗</span>
          </Link>

          {!activeSession && (
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Start New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Session Live View */}
      {activeSession ? (
        <div className="rounded-3xl bg-white border-2 border-[#35C979]/50 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9EAF0] pb-5">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#35C979] text-white shadow-lg shadow-[#35C979]/30 animate-pulse">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    Live Session Active
                  </span>
                  <span className="text-xs text-[#85878F]">
                    Started at {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#292C32] mt-1">
                  {activeSession.courseOffering.subject.name} ({activeSession.courseOffering.subject.code})
                </h2>
                <p className="text-xs text-[#85878F] mt-0.5">
                  Topic: <strong className="text-[#292C32]">{activeSession.topicCovered || 'Regular Class'}</strong> • Section: <strong className="text-[#292C32]">{activeSession.courseOffering.section}</strong>
                </p>
              </div>
            </div>

            {/* Geofence Parameters & Close Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-xs font-semibold text-[#292C32]">
                <MapPin className="w-4 h-4 text-[#8B6DE9]" />
                <span>Geofence: {activeSession.geofenceRadiusMeters}m Radius</span>
              </div>

              <button
                onClick={handleRecalibrateGeofence}
                disabled={isCalibrating}
                title="Calibrate classroom geofence center to your current device location"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B6DE9]/15 hover:bg-[#8B6DE9]/25 text-[#625BEB] text-xs font-bold border border-[#8B6DE9]/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5 text-[#625BEB]" />
                <span>{isCalibrating ? 'Calibrating...' : 'Sync Geofence to My Location'}</span>
              </button>

              <button
                onClick={() => setIsCloseConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <PowerOff className="w-4 h-4" />
                <span>Close Session</span>
              </button>
            </div>
          </div>

          {/* Attendee Live Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#292C32] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B6DE9]" />
                <span>Verified Attendees In This Session ({activeSession.records.length})</span>
              </h3>
              <span className="text-xs text-[#35C979] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35C979] animate-ping" />
                Listening for student check-ins...
              </span>
            </div>

            {activeSession.records.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSession.records.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl border border-[#E9EAF0] bg-[#F2F3F5] flex items-center justify-between gap-3 hover:border-[#35C979]/60 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#D9D1F5]/60 font-bold flex items-center justify-center text-xs shrink-0 text-[#625BEB]">
                        {rec.student.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rec.student.user.avatar}
                            alt={rec.student.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          rec.student.user.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#292C32] truncate">
                          {rec.student.user.name}
                        </p>
                        <p className="text-[10px] text-[#85878F] font-mono">
                          {rec.student.rollNo} • {new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#35C979]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Face {rec.faceConfidence ? `${Math.round(rec.faceConfidence * 100)}%` : 'OK'}</span>
                      </div>
                      <span className={`text-[9px] font-semibold block mt-0.5 ${
                        rec.withinGeofence ? 'text-[#35C979]' : 'text-amber-600'
                      }`}>
                        {rec.withinGeofence ? '✓ GPS Verified' : '⚠ Outside Geofence'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
                <Camera className="w-8 h-8 text-[#85878F] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#292C32]">
                  No students have checked in yet.
                </p>
                <p className="text-[11px] text-[#85878F] mt-1">
                  Students can open the Student Check-In link to complete face capture and GPS check.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-[#E9EAF0] p-8 text-center shadow-xs">
          <CalendarCheck className="w-12 h-12 text-[#8B6DE9] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#292C32]">
            No Active Attendance Session Right Now
          </h2>
          <p className="text-xs text-[#85878F] mt-1 max-w-md mx-auto">
            Initiate a live classroom session with geofencing to allow students to mark presence via facial recognition.
          </p>
          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            Start Classroom Session Now
          </button>
        </div>
      )}

      {/* Historical Sessions Archive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#292C32]">
            Previous Lecture Attendance Logs ({pastSessions.length})
          </h3>
          <span className="text-xs text-[#85878F]">
            Records include GPS audit & facial verification confidence
          </span>
        </div>

        <div className="rounded-3xl bg-white border border-[#E9EAF0] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F3F5] uppercase font-bold text-[#85878F] text-[10px] border-b border-[#E9EAF0]">
              <tr>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Subject & Section</th>
                <th className="px-5 py-3.5">Topic Covered</th>
                <th className="px-5 py-3.5">Attendance Ratio</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {pastSessions.length > 0 ? (
                pastSessions.map((s) => {
                  const presentCount = s.records?.filter(
                    (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
                  ).length || 0
                  const total = s.records?.length || 10
                  const pct = Math.round((presentCount / total) * 100)

                  return (
                    <tr key={s.id} className="hover:bg-[#F2F3F5] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#292C32]">
                        {new Date(s.sessionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-xs border border-[#D9D1F5]">
                          {s.courseOffering?.subject?.code || 'CS501'}
                        </span>
                        <span className="text-[#85878F] ml-1.5 font-semibold">({s.courseOffering?.section || 'A'})</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#292C32]">
                        {s.topicCovered || 'Regular Class'}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-[#292C32]">
                        {presentCount} / {total} Present
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-bold ${
                            pct >= 75 ? 'text-[#35C979]' : 'text-rose-600'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() =>
                            handleDeleteSession(
                              s.id,
                              s.courseOffering?.subject?.code || 'Course',
                              s.topicCovered
                            )
                          }
                          disabled={deletingId === s.id}
                          title={`Delete attendance log for ${s.courseOffering?.subject?.code || 'session'}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingId === s.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#85878F]">
                    No past lecture attendance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start New Session Modal */}
      <Modal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        title="Start Live Attendance Session"
        description="Launch a biometric session with room geofencing. Students within the boundary can check in."
        maxWidth="md"
      >
        <form onSubmit={handleStartSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Select Course Offering *
            </label>
            <select
              value={newSessionData.courseOfferingId}
              onChange={(e) =>
                setNewSessionData({ ...newSessionData, courseOfferingId: e.target.value })
              }
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden cursor-pointer"
            >
              {courseOfferings.map((co) => (
                <option key={co.id} value={co.id} className="bg-white text-[#292C32]">
                  {co.subject.code} - {co.subject.name} (Sec {co.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Topic / Lecture Title *
            </label>
            <input
              type="text"
              required
              value={newSessionData.topicCovered}
              onChange={(e) =>
                setNewSessionData({ ...newSessionData, topicCovered: e.target.value })
              }
              placeholder="e.g. Dijkstra Shortest Paths & Priority Queue Analysis"
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Geofence Radius (Meters)
            </label>
            <input
              type="number"
              min={20}
              max={1000}
              value={newSessionData.geofenceRadiusMeters}
              onChange={(e) =>
                setNewSessionData({
                  ...newSessionData,
                  geofenceRadiusMeters: Number(e.target.value),
                })
              }
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
            <p className="text-[10px] text-[#85878F] mt-1">
              Only students whose GPS fix is within this distance from classroom LH-101 will be verified.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsNewSessionModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? 'Starting...' : 'Open Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Session Confirmation Modal */}
      <ConfirmModal
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        onConfirm={handleCloseSession}
        title="Close Attendance Session"
        message="Closing this session will mark any enrolled students who haven't checked in as ABSENT. The session will be archived into the permanent database record."
        confirmText="Yes, Close & Finalize Session"
        isDanger={true}
      />
    </div>
  )
}

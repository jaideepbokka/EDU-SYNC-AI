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

  useEffect(() => {
    setPastSessions(initialPastSessions)
  }, [initialPastSessions])

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
        body: JSON.stringify(newSessionData),
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

      // Optimistically remove from state
      setPastSessions((prev) => prev.filter((s) => s.id !== sessionId))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete attendance session')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Biometric Liveness & Geofencing Perimeter Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#E5CB90]" />
            <span>Attendance Verification Engine</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Biometric face verification with liveness checks, GPS geofencing perimeter controls, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/attendance"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] text-xs font-bold border border-[#383C3F] transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Student Face Check-In Sim ↗</span>
          </Link>

          {!activeSession && (
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Start New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Session Live View */}
      {activeSession ? (
        <div className="rounded-3xl bg-[#222527] border-2 border-emerald-500/40 p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#383C3F] pb-5">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    Live Session Active
                  </span>
                  <span className="text-xs text-[#A8ACAF]">
                    Started at {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#FCFBF7] mt-1">
                  {activeSession.courseOffering.subject.name} ({activeSession.courseOffering.subject.code})
                </h2>
                <p className="text-xs text-[#A8ACAF] mt-0.5">
                  Topic: <strong className="text-[#FFF3C8]">{activeSession.topicCovered || 'Regular Class'}</strong> • Section: <strong className="text-[#FFF3C8]">{activeSession.courseOffering.section}</strong>
                </p>
              </div>
            </div>

            {/* Geofence Parameters & Close Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151718] border border-[#383C3F] text-xs">
                <MapPin className="w-4 h-4 text-[#E5CB90]" />
                <span className="font-semibold text-[#D8D4CA]">
                  Geofence: {activeSession.geofenceRadiusMeters}m Radius
                </span>
              </div>

              <button
                onClick={() => setIsCloseConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <PowerOff className="w-4 h-4" />
                <span>Close Session</span>
              </button>
            </div>
          </div>

          {/* Attendee Live Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#FCFBF7] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#E5CB90]" />
                <span>Verified Attendees In This Session ({activeSession.records.length})</span>
              </h3>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Listening for student check-ins...
              </span>
            </div>

            {activeSession.records.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSession.records.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl border border-[#383C3F] bg-[#151718] flex items-center justify-between gap-3 hover:border-emerald-500/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#222527] font-bold flex items-center justify-center text-xs shrink-0 text-[#E5CB90]">
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
                        <p className="text-xs font-bold text-[#FCFBF7] truncate">
                          {rec.student.user.name}
                        </p>
                        <p className="text-[10px] text-[#A8ACAF] font-mono">
                          {rec.student.rollNo} • {new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Face {rec.faceConfidence ? `${Math.round(rec.faceConfidence * 100)}%` : 'OK'}</span>
                      </div>
                      <span className="text-[9px] text-[#A8ACAF] block mt-0.5">
                        {rec.withinGeofence ? '✓ GPS Verified' : 'Outside GPS'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#151718] border border-[#383C3F]">
                <Camera className="w-8 h-8 text-[#A8ACAF] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#FCFBF7]">
                  No students have checked in yet.
                </p>
                <p className="text-[11px] text-[#A8ACAF] mt-1">
                  Students can open the Student Check-In link to complete face capture and GPS check.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-8 text-center shadow-xl">
          <CalendarCheck className="w-12 h-12 text-[#E5CB90] mx-auto mb-3 opacity-80" />
          <h2 className="text-base font-bold text-[#FCFBF7]">
            No Active Attendance Session Right Now
          </h2>
          <p className="text-xs text-[#A8ACAF] mt-1 max-w-md mx-auto">
            Initiate a live classroom session with geofencing to allow students to mark presence via facial recognition.
          </p>
          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
          >
            Start Classroom Session Now
          </button>
        </div>
      )}

      {/* Historical Sessions Archive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#FCFBF7]">
            Previous Lecture Attendance Logs ({pastSessions.length})
          </h3>
          <span className="text-xs text-[#A8ACAF]">
            Records include GPS audit & facial verification confidence
          </span>
        </div>

        <div className="rounded-2xl bg-[#222527] border border-[#383C3F] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151718] uppercase font-semibold text-[#A8ACAF] text-[10px] border-b border-[#383C3F]">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Subject & Section</th>
                <th className="px-4 py-3">Topic Covered</th>
                <th className="px-4 py-3">Attendance Ratio</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#383C3F]">
              {pastSessions.length > 0 ? (
                pastSessions.map((s) => {
                  const presentCount = s.records?.filter(
                    (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
                  ).length || 0
                  const total = s.records?.length || 10
                  const pct = Math.round((presentCount / total) * 100)

                  return (
                    <tr key={s.id} className="hover:bg-[#151718]/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#FCFBF7]">
                        {new Date(s.sessionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-xs border border-[#E5CB90]/30">
                          {s.courseOffering?.subject?.code || 'CS501'}
                        </span>
                        <span className="text-[#A8ACAF] ml-1.5 font-semibold">({s.courseOffering?.section || 'A'})</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#D8D4CA]">
                        {s.topicCovered || 'Regular Class'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#FCFBF7]">
                        {presentCount} / {total} Present
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            pct >= 75 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
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
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
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
                  <td colSpan={7} className="px-4 py-8 text-center text-[#A8ACAF]">
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
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Select Course Offering *
            </label>
            <select
              value={newSessionData.courseOfferingId}
              onChange={(e) =>
                setNewSessionData({ ...newSessionData, courseOfferingId: e.target.value })
              }
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
            >
              {courseOfferings.map((co) => (
                <option key={co.id} value={co.id} className="bg-[#151718]">
                  {co.subject.code} - {co.subject.name} (Sec {co.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
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
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
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
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
            />
            <p className="text-[10px] text-[#A8ACAF] mt-1">
              Only students whose GPS fix is within this distance from classroom LH-101 will be verified.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#383C3F]">
            <button
              type="button"
              onClick={() => setIsNewSessionModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
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

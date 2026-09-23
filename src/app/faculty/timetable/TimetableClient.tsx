'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  CalendarCheck,
  Plus,
  ArrowRight,
  BookOpen,
  Filter,
  Users,
  Grid,
  List,
  Sparkles,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'

interface TimetableClientProps {
  timetables: any[]
  courseOfferings: any[]
  facultyList?: any[]
}

const TIME_SLOTS = [
  { label: 'Period 1', startTime: '09:00', endTime: '10:00' },
  { label: 'Period 2', startTime: '10:00', endTime: '11:00' },
  { label: 'Period 3', startTime: '11:15', endTime: '12:15' },
  { label: 'Period 4', startTime: '01:15', endTime: '02:15' },
  { label: 'Period 5', startTime: '02:15', endTime: '03:15' },
]

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  DWDM: {
    bg: 'bg-emerald-950/40 hover:bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40 hover:border-emerald-500/70',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  PYTHON: {
    bg: 'bg-amber-950/40 hover:bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-500/40 hover:border-amber-500/70',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  QC: {
    bg: 'bg-purple-950/40 hover:bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-500/40 hover:border-purple-500/70',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  },
  MATH: {
    bg: 'bg-sky-950/40 hover:bg-sky-950/60',
    text: 'text-sky-300',
    border: 'border-sky-500/40 hover:border-sky-500/70',
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  },
  ENG: {
    bg: 'bg-rose-950/40 hover:bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-500/40 hover:border-rose-500/70',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  },
}

export function TimetableClient({
  timetables,
  courseOfferings,
  facultyList = [],
}: TimetableClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid')
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('ALL')
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL')
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null)

  // Unique subjects list
  const subjects = useMemo(() => {
    const map = new Map()
    courseOfferings.forEach((co) => {
      if (co.subject && !map.has(co.subject.code)) {
        map.set(co.subject.code, co.subject)
      }
    })
    return Array.from(map.values())
  }, [courseOfferings])

  // Filtered timetable slots
  const filteredTimetables = useMemo(() => {
    return timetables.filter((slot) => {
      if (selectedSection !== 'ALL' && slot.courseOffering?.section !== selectedSection) {
        return false
      }
      if (selectedFacultyId !== 'ALL' && slot.courseOffering?.facultyId !== selectedFacultyId) {
        return false
      }
      if (selectedSubjectCode !== 'ALL' && slot.courseOffering?.subject?.code !== selectedSubjectCode) {
        return false
      }
      return true
    })
  }, [timetables, selectedSection, selectedFacultyId, selectedSubjectCode])

  const handleQuickStartAttendance = async (courseOfferingId: string, subjectName: string) => {
    setStartingSessionId(courseOfferingId)
    try {
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseOfferingId,
          topicCovered: `Lecture on ${subjectName}`,
          geofenceRadiusMeters: 500,
        }),
      })
      if (res.ok) {
        router.push('/faculty/attendance')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to start session')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error starting session')
    } finally {
      setStartingSessionId(null)
    }
  }

  // Helper for lookup in weekly matrix: returns slots for a specific day and period
  const getSlotsForDayAndSlot = (day: string, startTime: string) => {
    return filteredTimetables.filter(
      (t) => t.dayOfWeek === day && t.startTime === startTime
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Academic Schedule • Department Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#E5CB90]" />
            <span>Weekly Class Timetable & Schedule Columns</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Department schedule matrix with respective day columns, faculty allocations, and 1-click biometric attendance session activation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-[#222527] border border-[#383C3F] flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] shadow-xs'
                  : 'text-[#D8D4CA] hover:text-[#FCFBF7]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Columns View</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'day'
                  ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] shadow-xs'
                  : 'text-[#D8D4CA] hover:text-[#FCFBF7]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day-by-Day View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Strip */}
      <div className="p-4 rounded-2xl bg-[#222527] border border-[#383C3F] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#D8D4CA]">
            <Filter className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Filters:</span>
          </div>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] px-3 py-1.5 focus:border-[#E5CB90] focus:outline-none"
          >
            <option value="ALL">All Sections (A & B)</option>
            <option value="A">Section A (LH-101)</option>
            <option value="B">Section B (LH-102)</option>
          </select>

          {/* Faculty Filter */}
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] px-3 py-1.5 focus:border-[#E5CB90] focus:outline-none"
          >
            <option value="ALL">All Faculty Members ({facultyList.length})</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.user.name} ({f.employeeId})
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] px-3 py-1.5 focus:border-[#E5CB90] focus:outline-none"
          >
            <option value="ALL">All Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.code}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-[#A8ACAF]">
          Showing <strong className="text-[#FFF3C8]">{filteredTimetables.length}</strong> scheduled lecture sessions
        </div>
      </div>

      {/* Subject Color Legend */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[#A8ACAF] uppercase tracking-wider whitespace-nowrap mr-1">
          Subjects:
        </span>
        {subjects.map((s) => {
          const colors = SUBJECT_COLORS[s.code] || { badge: 'bg-[#151718] text-[#FCFBF7] border border-[#383C3F]' }
          return (
            <div
              key={s.id}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 ${colors.badge}`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{s.code}: {s.name}</span>
            </div>
          )
        })}
      </div>

      {/* VIEW 1: WEEKLY COLUMNS MATRIX (GRID) */}
      {viewMode === 'grid' && (
        <div className="rounded-3xl bg-[#222527] border border-[#383C3F] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-[#383C3F] bg-[#151718]">
                  <th className="p-3.5 text-left text-[11px] font-black text-[#A8ACAF] uppercase tracking-wider w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E5CB90]" />
                      <span>Time Slot</span>
                    </div>
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-3.5 text-center text-xs font-black text-[#FCFBF7] uppercase tracking-wider border-l border-[#383C3F] bg-[#1a1c1e]"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#E5CB90]" />
                        <span>{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383C3F]">
                {TIME_SLOTS.map((slot, sIdx) => (
                  <React.Fragment key={slot.startTime}>
                    {/* Lunch Break banner after Period 3 */}
                    {sIdx === 3 && (
                      <tr className="bg-[#151718]/60 border-y border-[#383C3F]/60">
                        <td className="p-2 text-center text-[10px] font-mono text-[#A8ACAF]">
                          12:15 - 01:15
                        </td>
                        <td
                          colSpan={5}
                          className="p-2 text-center text-[11px] font-bold text-[#E5CB90] uppercase tracking-widest bg-gradient-to-r from-transparent via-[#E5CB90]/10 to-transparent"
                        >
                          ☕ Lunch & Faculty Office Consultation Break
                        </td>
                      </tr>
                    )}

                    <tr className="hover:bg-[#1f2224] transition-colors">
                      {/* Period Time Column */}
                      <td className="p-3 bg-[#151718]/40 border-r border-[#383C3F] align-middle">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#383C3F]/50 text-[#A8ACAF]">
                          {slot.label}
                        </span>
                        <p className="text-xs font-mono font-bold text-[#FCFBF7] mt-1">
                          {slot.startTime}
                        </p>
                        <p className="text-[10px] font-mono text-[#A8ACAF]">
                          to {slot.endTime}
                        </p>
                      </td>

                      {/* Day Columns (Respective Columns) */}
                      {DAYS.map((day) => {
                        const cellSlots = getSlotsForDayAndSlot(day, slot.startTime)

                        return (
                          <td
                            key={day}
                            className="p-2.5 border-l border-[#383C3F] align-top min-w-[170px]"
                          >
                            {cellSlots.length > 0 ? (
                              <div className="space-y-2">
                                {cellSlots.map((item) => {
                                  const subCode = item.courseOffering?.subject?.code || 'DWDM'
                                  const color = SUBJECT_COLORS[subCode] || {
                                    bg: 'bg-[#151718]',
                                    text: 'text-[#FCFBF7]',
                                    border: 'border-[#383C3F]',
                                    badge: 'bg-[#383C3F] text-[#FCFBF7]',
                                  }

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-2.5 rounded-xl border transition-all relative group ${color.bg} ${color.border}`}
                                    >
                                      {/* Header: Code & Section */}
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-black font-mono tracking-tight text-[#FFF3C8]">
                                          {subCode}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#151718] text-[#D8D4CA] border border-[#383C3F]">
                                            Sec {item.courseOffering?.section}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#151718] text-[#D8D4CA] border border-[#383C3F] flex items-center gap-0.5">
                                            <MapPin className="w-2.5 h-2.5 text-rose-400" />
                                            <span>{item.roomNumber}</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Subject Name */}
                                      <p className="text-[11px] font-bold text-[#FCFBF7] line-clamp-1">
                                        {item.courseOffering?.subject?.name}
                                      </p>

                                      {/* Faculty */}
                                      <p className="text-[10px] text-[#A8ACAF] mt-0.5 truncate flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3 text-[#E5CB90] shrink-0" />
                                        <span className="truncate">{item.courseOffering?.faculty?.user?.name?.split(' ')[0]} {item.courseOffering?.faculty?.user?.name?.split(' ')[1]}</span>
                                      </p>

                                      {/* 1-Click Launch Attendance button */}
                                      <button
                                        onClick={() =>
                                          handleQuickStartAttendance(
                                            item.courseOffering?.id,
                                            item.courseOffering?.subject?.name
                                          )
                                        }
                                        disabled={startingSessionId === item.courseOffering?.id}
                                        title="Start Live Biometric Attendance Session"
                                        className="mt-2 w-full py-1 px-2 rounded-lg bg-[#E5CB90] hover:bg-[#FFF3C8] text-[#151718] text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer opacity-90 group-hover:opacity-100 shadow-xs"
                                      >
                                        <CalendarCheck className="w-3 h-3" />
                                        <span>
                                          {startingSessionId === item.courseOffering?.id ? 'Starting...' : 'Start Session'}
                                        </span>
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] flex items-center justify-center text-[10px] text-[#A8ACAF]/40 italic">
                                Free Slot
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-BY-DAY AGENDA VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Days Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-[#222527] border border-[#383C3F] shadow-xs">
            {DAYS.map((d) => {
              const count = filteredTimetables.filter((t) => t.dayOfWeek === d).length
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    selectedDay === d
                      ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] shadow-xs font-black'
                      : 'text-[#D8D4CA] hover:bg-[#151718] hover:text-[#FCFBF7]'
                  }`}
                >
                  <span>{d}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedDay === d ? 'bg-[#151718] text-[#FFF3C8]' : 'bg-[#383C3F] text-[#A8ACAF]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Day Slots List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTimetables.filter((t) => t.dayOfWeek === selectedDay).length > 0 ? (
              filteredTimetables
                .filter((t) => t.dayOfWeek === selectedDay)
                .map((slot) => {
                  const subCode = slot.courseOffering?.subject?.code || 'DWDM'
                  const colors = SUBJECT_COLORS[subCode] || {
                    bg: 'bg-[#222527]',
                    text: 'text-[#FCFBF7]',
                    border: 'border-[#383C3F]',
                    badge: 'bg-[#383C3F] text-[#FCFBF7]',
                  }

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-3xl bg-[#222527] border ${colors.border} p-6 shadow-xs flex flex-col justify-between gap-4 transition-colors relative group`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30">
                              {subCode}
                            </span>
                            <span className="text-xs font-black text-[#FCFBF7] font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#151718] text-[10px] font-bold text-[#FCFBF7] border border-[#383C3F]">
                              Section {slot.courseOffering.section}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#151718] text-[10px] font-bold text-[#FCFBF7] border border-[#383C3F] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>{slot.roomNumber}</span>
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-[#FCFBF7] mt-3 group-hover:text-[#FFF3C8] transition-colors">
                          {slot.courseOffering.subject.name}
                        </h3>
                        <p className="text-xs text-[#A8ACAF] mt-1 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#E5CB90]" />
                          <span>Assigned Faculty: <strong>{slot.courseOffering.faculty.user.name}</strong></span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#383C3F] flex items-center justify-between">
                        <span className="text-[11px] text-[#A8ACAF]">
                          Room: <strong>{slot.roomNumber}</strong> • Academic Yr: 2025-26
                        </span>

                        <button
                          onClick={() =>
                            handleQuickStartAttendance(
                              slot.courseOffering.id,
                              slot.courseOffering.subject.name
                            )
                          }
                          disabled={startingSessionId === slot.courseOffering.id}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-md shadow-[#E5CB90]/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>
                            {startingSessionId === slot.courseOffering.id ? 'Launching Session...' : 'Start Attendance'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="col-span-2 p-12 text-center rounded-3xl bg-[#222527] border border-[#383C3F] text-[#A8ACAF] text-xs">
                No lecture classes scheduled for {selectedDay} matching current filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FACULTY SUBJECT ASSIGNMENTS SUMMARY */}
      <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E5CB90]/20 text-[#E5CB90]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FCFBF7]">
                Department Faculty & Subject Allocation Registry
              </h3>
              <p className="text-[11px] text-[#A8ACAF]">
                5 curriculum subjects assigned to 5 faculty members with 50 weekly lecture slots
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {facultyList.map((fac) => {
            // Find subjects assigned to this faculty
            const assignedOfferings = courseOfferings.filter((co) => co.facultyId === fac.id)
            const assignedSubjectCodes = Array.from(
              new Set(assignedOfferings.map((co) => co.subject?.code).filter(Boolean))
            )
            const weeklySlotsCount = timetables.filter(
              (t) => t.courseOffering?.facultyId === fac.id
            ).length

            return (
              <div
                key={fac.id}
                className="p-4 rounded-2xl bg-[#151718] border border-[#383C3F] hover:border-[#E5CB90]/40 transition-colors flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#383C3F] text-[#FFF3C8]">
                      {fac.employeeId}
                    </span>
                    <span className="text-[10px] font-bold text-[#E5CB90]">
                      {weeklySlotsCount} Lectures/Week
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#FCFBF7] mt-2">
                    {fac.user.name}
                  </h4>
                  <p className="text-[11px] text-[#A8ACAF]">
                    {fac.designation}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#383C3F]">
                  <p className="text-[10px] uppercase font-bold text-[#A8ACAF] mb-1">
                    Assigned Curriculum:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {assignedSubjectCodes.map((code: any) => {
                      const colors = SUBJECT_COLORS[code] || { badge: 'bg-[#222527] text-[#FCFBF7]' }
                      return (
                        <span
                          key={code}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors.badge}`}
                        >
                          {code} (Sec A & B)
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

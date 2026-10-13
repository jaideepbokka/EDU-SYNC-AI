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
    bg: 'bg-emerald-50/90 hover:bg-emerald-100/90',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  PYTHON: {
    bg: 'bg-amber-50/90 hover:bg-amber-100/90',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  QC: {
    bg: 'bg-[#D9D1F5]/40 hover:bg-[#D9D1F5]/60',
    text: 'text-[#625BEB]',
    border: 'border-[#A99AE8]/40',
    badge: 'bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40',
  },
  MATH: {
    bg: 'bg-purple-50/90 hover:bg-purple-100/90',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  ENG: {
    bg: 'bg-indigo-50/90 hover:bg-indigo-100/90',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
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

  // Helper for lookup in weekly matrix
  const getSlotsForDayAndSlot = (day: string, startTime: string) => {
    return filteredTimetables.filter(
      (t) => t.dayOfWeek === day && t.startTime === startTime
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Academic Schedule • Department Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-white" />
            <span>Weekly Class Timetable & Schedule Columns</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Department schedule matrix with respective day columns, faculty allocations, and 1-click biometric attendance session activation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="p-1 rounded-2xl bg-black/20 border border-white/20 flex items-center gap-1 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#292C32] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Columns</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white text-[#292C32] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Strip */}
      <div className="p-4 rounded-3xl bg-white border border-[#E9EAF0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#292C32] pl-2">
            <Filter className="w-3.5 h-3.5 text-[#8B6DE9]" />
            <span>Filters:</span>
          </div>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs font-medium rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] px-3 py-2 focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
          >
            <option value="ALL">All Sections (A, B & C)</option>
            <option value="A">Section A (LH-101)</option>
            <option value="B">Section B (LH-102)</option>
            <option value="C">Section C (LH-103)</option>
          </select>

          {/* Faculty Filter */}
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="text-xs font-medium rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] px-3 py-2 focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
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
            className="text-xs font-medium rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] px-3 py-2 focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
          >
            <option value="ALL">All Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.code}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-[#85878F] pr-2">
          Showing <strong className="text-[#292C32]">{filteredTimetables.length}</strong> scheduled lecture sessions
        </div>
      </div>

      {/* Subject Color Legend */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[#85878F] uppercase tracking-wider whitespace-nowrap mr-1">
          Subjects:
        </span>
        {subjects.map((s) => {
          const colors = SUBJECT_COLORS[s.code] || { badge: 'bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0]' }
          return (
            <div
              key={s.id}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-xs ${colors.badge}`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{s.code}: {s.name}</span>
            </div>
          )
        })}
      </div>

      {/* VIEW 1: WEEKLY COLUMNS MATRIX (GRID) */}
      {viewMode === 'grid' && (
        <div className="rounded-3xl bg-white border border-[#E9EAF0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-[#E9EAF0] bg-[#F2F3F5]">
                  <th className="p-4 text-left text-[11px] font-bold text-[#85878F] uppercase tracking-wider w-[130px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8B6DE9]" />
                      <span>Time Slot</span>
                    </div>
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-4 text-center text-xs font-black text-[#292C32] uppercase tracking-wider border-l border-[#E9EAF0]"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#8B6DE9]" />
                        <span>{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0]">
                {TIME_SLOTS.map((slot, sIdx) => (
                  <React.Fragment key={slot.startTime}>
                    {/* Lunch Break banner */}
                    {sIdx === 3 && (
                      <tr className="bg-[#D9D1F5]/20 border-y border-[#E9EAF0]">
                        <td className="p-2.5 text-center text-[11px] font-mono font-bold text-[#625BEB]">
                          12:15 - 01:15
                        </td>
                        <td
                          colSpan={5}
                          className="p-2.5 text-center text-xs font-bold text-[#292C32] uppercase tracking-wider"
                        >
                          ☕ Lunch & Faculty Office Consultation Break
                        </td>
                      </tr>
                    )}

                    <tr className="hover:bg-[#F2F3F5]/60 transition-colors">
                      {/* Period Time Column */}
                      <td className="p-4 bg-[#F2F3F5]/50 border-r border-[#E9EAF0] align-middle">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40">
                          {slot.label}
                        </span>
                        <p className="text-xs font-mono font-bold text-[#292C32] mt-1.5">
                          {slot.startTime}
                        </p>
                        <p className="text-[10px] font-mono text-[#85878F]">
                          to {slot.endTime}
                        </p>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map((day) => {
                        const cellSlots = getSlotsForDayAndSlot(day, slot.startTime)

                        return (
                          <td
                            key={day}
                            className="p-3 border-l border-[#E9EAF0] align-top min-w-[170px]"
                          >
                            {cellSlots.length > 0 ? (
                              <div className="space-y-2">
                                {cellSlots.map((item) => {
                                  const subCode = item.courseOffering?.subject?.code || 'DWDM'
                                  const color = SUBJECT_COLORS[subCode] || {
                                    bg: 'bg-white',
                                    text: 'text-[#292C32]',
                                    border: 'border-[#E9EAF0]',
                                    badge: 'bg-[#F2F3F5] text-[#292C32]',
                                  }

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-3 rounded-2xl border transition-all relative group shadow-xs ${color.bg} ${color.border}`}
                                    >
                                      {/* Header */}
                                      <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <span className="text-xs font-black font-mono tracking-tight text-[#292C32]">
                                          {subCode}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white text-[#292C32] border border-[#E9EAF0] shadow-xs">
                                            Sec {item.courseOffering?.section}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white text-[#292C32] border border-[#E9EAF0] flex items-center gap-0.5 shadow-xs">
                                            <MapPin className="w-2.5 h-2.5 text-rose-500" />
                                            <span>{item.roomNumber}</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Subject Name */}
                                      <p className="text-xs font-bold text-[#292C32] line-clamp-1">
                                        {item.courseOffering?.subject?.name}
                                      </p>

                                      {/* Faculty */}
                                      <p className="text-[10px] text-[#85878F] mt-1 truncate flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3 text-[#8B6DE9] shrink-0" />
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
                                        className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-102"
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
                              <div className="h-full min-h-[60px] flex items-center justify-center text-[11px] text-[#85878F] italic">
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
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-3xl bg-white border border-[#E9EAF0] shadow-xs">
            {DAYS.map((d) => {
              const count = filteredTimetables.filter((t) => t.dayOfWeek === d).length
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedDay === d
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:bg-[#F2F3F5]'
                  }`}
                >
                  <span>{d}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedDay === d ? 'bg-[#1E2024] text-white' : 'bg-[#F2F3F5] text-[#85878F]'
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

                  return (
                    <div
                      key={slot.id}
                      className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-[#8B6DE9] transition-colors relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40">
                              {subCode}
                            </span>
                            <span className="text-xs font-black text-[#292C32] font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-xl bg-[#F2F3F5] text-[10px] font-bold text-[#292C32] border border-[#E9EAF0]">
                              Section {slot.courseOffering.section}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-[#F2F3F5] text-[10px] font-bold text-[#292C32] border border-[#E9EAF0] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>{slot.roomNumber}</span>
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-[#292C32] mt-3 group-hover:text-[#8B6DE9] transition-colors">
                          {slot.courseOffering.subject.name}
                        </h3>
                        <p className="text-xs text-[#85878F] mt-1 flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-[#8B6DE9]" />
                          <span>Assigned Faculty: <strong className="text-[#292C32]">{slot.courseOffering.faculty.user.name}</strong></span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E9EAF0] flex items-center justify-between">
                        <span className="text-[11px] text-[#85878F] font-medium">
                          Room: <strong className="text-[#292C32]">{slot.roomNumber}</strong> • Academic Yr: 2025-26
                        </span>

                        <button
                          onClick={() =>
                            handleQuickStartAttendance(
                              slot.courseOffering.id,
                              slot.courseOffering.subject.name
                            )
                          }
                          disabled={startingSessionId === slot.courseOffering.id}
                          className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
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
              <div className="col-span-2 p-12 text-center rounded-3xl bg-white border border-[#E9EAF0] text-[#85878F] text-xs">
                No lecture classes scheduled for {selectedDay} matching current filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FACULTY SUBJECT ASSIGNMENTS SUMMARY */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292C32]">
                Department Faculty & Subject Allocation Registry
              </h3>
              <p className="text-[11px] text-[#85878F]">
                5 curriculum subjects assigned to 5 faculty members with 50 weekly lecture slots
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {facultyList.map((fac) => {
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
                className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] hover:border-[#8B6DE9] transition-colors flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#625BEB] border border-[#E9EAF0]">
                      {fac.employeeId}
                    </span>
                    <span className="text-[10px] font-bold text-[#8B6DE9]">
                      {weeklySlotsCount} Lectures/Week
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#292C32] mt-2">
                    {fac.user.name}
                  </h4>
                  <p className="text-[11px] text-[#85878F]">
                    {fac.designation}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E9EAF0]">
                  <p className="text-[10px] uppercase font-bold text-[#85878F] mb-1">
                    Assigned Curriculum:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {assignedSubjectCodes.map((code: any) => {
                      const colors = SUBJECT_COLORS[code] || { badge: 'bg-white text-[#292C32]' }
                      return (
                        <span
                          key={code}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${colors.badge}`}
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


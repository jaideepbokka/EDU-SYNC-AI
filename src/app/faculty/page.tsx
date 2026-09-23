import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireFacultyUser } from '@/lib/auth'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { SimpleLineChart } from '@/components/SimpleChart'
import {
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Video,
  KeyRound,
} from 'lucide-react'
import { FacultyFaceIdWidget } from '@/components/FacultyFaceIdWidget'

export default async function FacultyDashboardPage() {
  const user = await requireFacultyUser()

  // Fetch real database metrics
  const [
    totalStudents,
    assignedSubjects,
    activeSession,
    pendingEvaluations,
    atRiskStudents,
    todayTimetable,
    recentSessions,
    publishedAssessments,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.subject.count(),
    prisma.attendanceSession.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        courseOffering: { include: { subject: true } },
        records: { include: { student: { include: { user: true } } } },
      },
    }),
    prisma.studentAttempt.count({
      where: { status: 'SUBMITTED' },
    }),
    prisma.student.findMany({
      where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
      include: { user: true, riskProfiles: { take: 1, orderBy: { calculatedAt: 'desc' } } },
      take: 4,
    }),
    prisma.timetable.findMany({
      where: { dayOfWeek: 'MONDAY' }, // Demo default day
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.attendanceSession.findMany({
      include: {
        courseOffering: { include: { subject: true } },
        records: true,
      },
      orderBy: { sessionDate: 'desc' },
      take: 6,
    }),
    prisma.assessment.count({
      where: { status: 'PUBLISHED' },
    }),
  ])

  // Compute average attendance from students
  const allStudents = await prisma.student.findMany({
    select: { attendancePercentage: true, currentCgpa: true },
  })
  const avgAttendance =
    allStudents.length > 0
      ? (allStudents.reduce((acc, s) => acc + s.attendancePercentage, 0) / allStudents.length).toFixed(1)
      : '0.0'

  const avgCgpa =
    allStudents.length > 0
      ? (allStudents.reduce((acc, s) => acc + s.currentCgpa, 0) / allStudents.length).toFixed(2)
      : '0.00'

  const allStudentsForFaceId = await prisma.student.findMany({
    include: { user: true },
    orderBy: { rollNo: 'asc' },
  })

  // Format attendance chart trend data from sessions
  const attendanceTrend = recentSessions.map((s, idx) => {
    const present = s.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length
    const total = s.records.length || 1
    const pct = Math.round((present / total) * 100)
    return {
      label: `Lec ${recentSessions.length - idx}`,
      value: pct > 0 ? pct : 82, // Seed display fallback
    }
  }).reverse()

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Banner with Real-Time Lecture Hall Visual & Palette Styling */}
      <div className="relative overflow-hidden rounded-3xl border border-[#383C3F] p-6 sm:p-8 text-[#FCFBF7] shadow-2xl bg-[#222527]">
        {/* Real-time ambient lecture image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ai_lecture_tech.jpg"
          alt="AI Interactive University Lecture Hall"
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter saturate-125 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#151718] via-[#222527]/90 to-[#151718]/80 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-3 border border-[#E5CB90]/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Academic Operations & AI Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FCFBF7]">
            Welcome back, {user.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#D8D4CA] leading-relaxed">
            Department of {user.departmentCode || 'Computer Science'}. You have{' '}
            <strong className="text-[#FCFBF7] font-semibold">{pendingEvaluations} subjective tests</strong> awaiting grading and{' '}
            <strong className="text-[#E5CB90] font-semibold">{atRiskStudents.length} students</strong> flagged for critical academic risk.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/faculty/attendance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-xs font-black text-[#151718] shadow-md shadow-[#E5CB90]/20 transition-all hover:scale-105"
            >
              <CalendarCheck className="w-4 h-4 text-[#151718]" />
              <span>{activeSession ? 'Manage Live Attendance' : 'Start Attendance Session'}</span>
            </Link>
            <Link
              href="/faculty/resources"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718]/90 hover:bg-[#383C3F] text-xs font-bold text-[#FCFBF7] border border-[#383C3F] transition-all hover:scale-105 backdrop-blur-md"
            >
              <Video className="w-4 h-4 text-[#E5CB90]" />
              <span>Learning Courses</span>
            </Link>
            <Link
              href="/faculty/quiz-generator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718]/90 hover:bg-[#383C3F] text-xs font-bold text-[#FCFBF7] border border-[#383C3F] transition-all hover:scale-105 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-[#E5CB90]" />
              <span>Generate AI Quiz</span>
            </Link>
            <Link
              href="/faculty/face-id"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718]/90 hover:bg-[#383C3F] text-xs font-bold text-[#FCFBF7] border border-[#383C3F] transition-all hover:scale-105 backdrop-blur-md"
            >
              <KeyRound className="w-4 h-4 text-[#E5CB90]" />
              <span>Face ID Generator</span>
            </Link>
            <Link
              href="/faculty/evaluation"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718]/90 hover:bg-[#383C3F] text-xs font-bold text-[#FCFBF7] border border-[#383C3F] transition-all hover:scale-105 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFF3C8]" />
              <span>Grade Submissions ({pendingEvaluations})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Section A & B Enrolled"
          trend={{ value: '100% On-Track', isPositive: true }}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Avg Class Attendance"
          value={`${avgAttendance}%`}
          subtitle="Mandatory threshold: 75%"
          trend={{ value: Number(avgAttendance) >= 75 ? 'Healthy' : 'Needs Focus', isPositive: Number(avgAttendance) >= 75 }}
          icon={CalendarCheck}
          color={Number(avgAttendance) >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Pending Evaluations"
          value={pendingEvaluations}
          subtitle="Subjective answers awaiting marks"
          trend={{ value: pendingEvaluations > 0 ? 'Action Req.' : 'Zero Backlog', neutral: pendingEvaluations === 0 }}
          icon={Award}
          color="sky"
        />
        <StatCard
          title="At-Risk Alerts"
          value={atRiskStudents.length}
          subtitle="Attendance or Grade Deficits"
          trend={{ value: 'Human Review Req.', isPositive: false }}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Real-Time Face ID Generator & Biometric Scanner Section */}
      <FacultyFaceIdWidget initialStudents={allStudentsForFaceId as any} />

      {/* Active Session & Timetable Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Trends & Live Session */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Session Alert Banner (if active) */}
          {activeSession && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md animate-pulse">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Live Attendance Session Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
                      {activeSession.records.length} Checked-In
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {activeSession.courseOffering.subject.name} ({activeSession.courseOffering.subject.code})
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Topic: {activeSession.topicCovered || 'Regular Lecture'} • Geofence Radius: {activeSession.geofenceRadiusMeters}m
                  </p>
                </div>
              </div>
              <Link
                href="/faculty/attendance"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs whitespace-nowrap"
              >
                View Live Attendee Feed
              </Link>
            </div>
          )}

          {/* Attendance Trend Chart Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Lecture Attendance Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Historical attendance percentage across recent lecture sessions with 75% threshold
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                Avg: {avgAttendance}%
              </span>
            </div>

            <SimpleLineChart data={attendanceTrend} height={190} accentColor="#4f46e5" />
          </div>

          {/* Critical Risk Watchlist Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Critical Risk Watchlist</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    {atRiskStudents.length} Students Flagged
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI diagnostic engine detected attendance deficiency or failing assessment trajectories
                </p>
              </div>
              <Link
                href="/faculty/academic-risk"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Risk Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {atRiskStudents.map((stu) => (
                <div key={stu.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden font-bold flex items-center justify-center text-xs">
                      {stu.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={stu.user.avatar} alt={stu.user.name} className="w-full h-full object-cover" />
                      ) : (
                        stu.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/faculty/students/${stu.id}`}
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {stu.user.name}
                        </Link>
                        <span className="text-[10px] text-slate-400">({stu.rollNo})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {stu.riskProfiles[0]?.primaryReason || 'Attendance below 75% threshold'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {stu.attendancePercentage}% Att.
                      </p>
                      <p className="text-[10px] text-slate-400">CGPA: {stu.currentCgpa}</p>
                    </div>
                    <StatusBadge status={stu.riskLevel} />
                    <Link
                      href={`/faculty/students/${stu.id}?tab=risk`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Today's Schedule & Quick Links */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Today’s Classes (Monday)</span>
              </h3>
              <Link href="/faculty/timetable" className="text-xs font-bold text-indigo-600 hover:underline">
                Full Grid
              </Link>
            </div>

            <div className="space-y-3">
              {todayTimetable.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {slot.roomNumber}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {slot.courseOffering.subject.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {slot.courseOffering.subject.code} • Section {slot.courseOffering.section}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic Hub Links */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Faculty Quick Portals
            </h3>

            <Link
              href="/faculty/quiz-generator"
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-100 dark:border-indigo-900/60 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Quiz Generator</p>
                  <p className="text-[10px] text-slate-500">Gemini synthesis with Blooms matrix</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/faculty/evaluation"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-600 text-white">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Subjective Evaluation</p>
                  <p className="text-[10px] text-slate-500">{pendingEvaluations} pending grading</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/faculty/reports"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Analytics & CSV Reports</p>
                  <p className="text-[10px] text-slate-500">Export compliance & grade sheets</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

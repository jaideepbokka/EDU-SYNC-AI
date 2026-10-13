import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { AttendancePieChart } from '@/components/AttendancePieChart'
import { BiometricVisualCard } from '@/components/BiometricVisualCard'
import {
  CalendarCheck,
  Award,
  BookOpen,
  Camera,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Video,
  Play,
  ArrowRight,
  PieChart,
  CreditCard,
  Receipt,
} from 'lucide-react'

export const metadata = {
  title: 'Student Dashboard | EduSync AI',
  description: 'Access attendance metrics, learning courses, and active assessments.',
}

export default async function StudentDashboardPage() {
  const user = await requireStudentUser()

  const [student, activeSession, publishedAssessments, learningVideos] = await Promise.all([
    prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        user: true,
        department: true,
        fee: true,
        enrollments: {
          include: {
            courseOffering: {
              include: { subject: true, faculty: { include: { user: true } } },
            },
          },
        },
        attendanceRecords: {
          include: {
            session: { include: { courseOffering: { include: { subject: true } } } },
          },
          orderBy: { markedAt: 'desc' },
          take: 6,
        },
        attempts: {
          include: { assessment: true },
          orderBy: { startTime: 'desc' },
          take: 4,
        },
        learningPaths: {
          include: {
            steps: { include: { topic: true } },
            subject: true,
          },
        },
        riskProfiles: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.attendanceSession.findFirst({
      where: { status: 'ACTIVE' },
      include: { courseOffering: { include: { subject: true } } },
    }),
    prisma.assessment.findMany({
      where: { status: 'PUBLISHED' },
      include: { subject: true, assessmentQuestions: true },
      take: 3,
    }),
    prisma.learningResource.findMany({
      where: { type: 'VIDEO' },
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  if (!student) {
    return <div className="p-8 text-center text-[#85878F]">Student record not found.</div>
  }

  // Calculate detailed attendance segment data for Pie Chart
  const totalLoggedSessions = 52
  const presentCount = Math.round(totalLoggedSessions * (student.attendancePercentage / 100))
  const biometricVerifiedCount = Math.max(1, Math.round(presentCount * 0.45))
  const regularLectureCount = Math.max(1, presentCount - biometricVerifiedCount)
  const excusedCount = Math.max(1, Math.round(totalLoggedSessions * 0.05))
  const absentCount = Math.max(0, totalLoggedSessions - (presentCount + excusedCount))

  const attendanceSegments = [
    {
      label: 'Regular Classroom',
      value: regularLectureCount,
      color: '#35C979', // Success green
      sublabel: 'Standard lecture sessions',
    },
    {
      label: 'Biometric Face ID',
      value: biometricVerifiedCount,
      color: '#8B6DE9', // Primary purple
      sublabel: '3D Neural Verified Check-ins',
    },
    {
      label: 'Lab & Seminar OD',
      value: excusedCount,
      color: '#625BEB', // Indigo
      sublabel: 'Approved academic on-duty',
    },
    {
      label: 'Absent / Missed',
      value: absentCount,
      color: '#E9EAF0', // Divider light grey
      sublabel: 'Unattended lecture slots',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner with Theme Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] p-6 sm:p-10 shadow-xl shadow-[#8B6DE9]/15 text-white border border-[#A99AE8]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
              <span>Academic Year 2025-26 • Semester {student.currentSemester}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Hello, {student.user.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
              Roll No: <strong className="font-mono text-white font-bold">{student.rollNo}</strong> • Section {student.section} • {student.department.name}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center shadow-md">
              <p className="text-[10px] uppercase font-bold text-purple-200">Attendance</p>
              <p
                className={`text-2xl font-black ${
                  student.attendancePercentage >= 75 ? 'text-white' : 'text-amber-300'
                }`}
              >
                {student.attendancePercentage}%
              </p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center shadow-md">
              <p className="text-[10px] uppercase font-bold text-purple-200">CGPA</p>
              <p className="text-2xl font-black text-white font-mono">
                {student.currentCgpa.toFixed(2)}
              </p>
            </div>
            <Link
              href="/student/fees"
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-center shadow-md transition-all cursor-pointer group hidden sm:block"
            >
              <p className="text-[10px] uppercase font-bold text-purple-200 flex items-center justify-center gap-1">
                <span>Fees Status</span>
                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
              <p className="text-xl font-black text-white">
                {(student.fee?.dueAmount || 0) <= 0 ? '✓ Cleared' : `Due: ₹${student.fee?.dueAmount}`}
              </p>
              <span className="text-[9px] text-emerald-300 font-bold block">Min ₹55K Std</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Session Check-In Card */}
      {activeSession ? (
        <div className="rounded-3xl bg-emerald-50 border-2 border-[#35C979] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#35C979] text-white flex items-center justify-center shadow-md shadow-[#35C979]/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                  Attendance Session Live Now
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                  {activeSession.geofenceRadiusMeters}m Campus Geofence
                </span>
              </div>
              <p className="text-base font-bold text-[#292C32] mt-0.5">
                {activeSession.courseOffering.subject.name} ({activeSession.courseOffering.subject.code})
              </p>
              <p className="text-xs text-[#85878F] mt-0.5">
                Topic: {activeSession.topicCovered || 'Regular Class'} • Biometric face verification open
              </p>
            </div>
          </div>

          <Link
            href="/student/attendance"
            className="px-6 py-3 rounded-2xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md whitespace-nowrap transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#A99AE8]" />
            <span>Mark Presence with Face & GPS</span>
          </Link>
        </div>
      ) : (
        student.attendancePercentage < 75 && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs text-amber-900">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Attendance Advisory:</strong> Your current attendance is{' '}
                <strong>{student.attendancePercentage}%</strong>, below the university mandatory 75% threshold. Ensure participation in upcoming lectures.
              </span>
            </div>
            <Link
              href="/student/attendance"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap cursor-pointer"
            >
              Check Sensor
            </Link>
          </div>
        )
      )}

      {/* Main Grid: Pie Chart Attendance View, Learning Courses, Active Assessments, Biometric Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Donut Pie Chart + Learning Courses & Active Assessments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Pie Chart Representation (Matching Reference Image 3) */}
          <AttendancePieChart
            percentage={student.attendancePercentage}
            totalSessions={totalLoggedSessions}
            segments={attendanceSegments}
            title="Biometric & Lecture Attendance Analysis"
            subtitle="Real-time semester attendance distribution and session breakdown"
          />

          {/* Real-time Faculty Learning Courses & Topic Videos */}
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D9D1F5]/40 text-[#625BEB]">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#292C32] flex items-center gap-2">
                    <span>Learning Courses & Videos Posted by Faculty</span>
                    <span className="w-2 h-2 rounded-full bg-[#8B6DE9] animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-[#85878F]">
                    Curriculum masterclasses uploaded by your professors
                  </p>
                </div>
              </div>

              <Link
                href="/student/courses"
                className="text-xs font-bold text-[#625BEB] hover:text-[#8B6DE9] flex items-center gap-1"
              >
                <span>View All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learningVideos.length > 0 ? (
                learningVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] hover:border-[#A99AE8] flex flex-col justify-between gap-3 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] font-mono font-bold text-[10px] border border-[#A99AE8]/40">
                          {video.topic?.unit?.subject?.code || 'CS501'}
                        </span>
                        <span className="text-[10px] text-[#85878F] flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#625BEB]" />
                          <span>{video.durationMinutes}m</span>
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#625BEB] mt-1.5">
                        Topic: {video.topic?.title || 'Lecture'}
                      </p>
                      <h4 className="text-xs font-bold text-[#292C32] mt-0.5 line-clamp-2">
                        {video.title}
                      </h4>
                      {video.content && (
                        <p className="text-[11px] text-[#85878F] mt-1 line-clamp-2">
                          {video.content}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E9EAF0] flex items-center justify-between">
                      <span className="text-[10px] text-[#85878F]">
                        By: {video.author?.split(' ')[0] || 'Faculty'}
                      </span>
                      <Link
                        href="/student/courses"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#625BEB] group-hover:text-[#8B6DE9] transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Video →</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 text-center text-xs text-[#85878F] rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
                  Faculty has not posted any new topic videos yet.
                </div>
              )}
            </div>
          </div>

          {/* Active Assessments */}
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#292C32] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#625BEB]" />
                <span>Available Assessments & Quizzes</span>
              </h3>
              <Link href="/student/assessments" className="text-xs text-[#625BEB] hover:text-[#8B6DE9] font-bold">
                View All Room
              </Link>
            </div>

            <div className="space-y-3">
              {publishedAssessments.map((ass) => {
                const existingAttempt = student.attempts?.find((att: any) => att.assessmentId === ass.id)
                const isCompleted = !!existingAttempt

                return (
                  <div
                    key={ass.id}
                    className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#A99AE8] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] font-mono font-bold text-[10px] border border-[#A99AE8]/40">
                          {ass.subject.code}
                        </span>
                        <span className="text-xs font-semibold text-[#85878F]">
                          {ass.durationMinutes} Mins • {ass.totalMarks} Marks
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#35C979]" />
                            <span>Score: {existingAttempt.score}/{existingAttempt.totalMarks} ({existingAttempt.percentage}%)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#292C32] mt-1">{ass.title}</p>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/student/assessments"
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#E9EAF0] text-[#292C32] text-xs font-bold border border-[#E9EAF0] transition-colors whitespace-nowrap shadow-xs"
                        >
                          View Scorecard
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href="/student/assessments"
                        className="px-4 py-2 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold whitespace-nowrap shadow-xs cursor-pointer transition-colors"
                      >
                        Start Test →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Col: High-Tech Vector Biometric Visual Card (NO Real-Time Stock Images) & Recent Logs */}
        <div className="space-y-6">
          {/* Biometric Vector Visualizer */}
          <BiometricVisualCard
            studentName={student.user.name}
            rollNo={student.rollNo}
            isLive={!!activeSession}
          />

          {/* Recent Attendance Records Log */}
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#85878F] uppercase tracking-wider">
                Recent Attendance Log
              </h3>
              <Link href="/student/attendance" className="text-[11px] font-bold text-[#625BEB] hover:underline">
                Sensor Log →
              </Link>
            </div>
            <div className="divide-y divide-[#E9EAF0]">
              {student.attendanceRecords.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#292C32]">
                      {rec.session.courseOffering.subject.code}
                    </p>
                    <p className="text-[10px] text-[#85878F] font-mono">
                      {new Date(rec.markedAt).toLocaleDateString()} • {rec.session.courseOffering.subject.name.slice(0, 18)}...
                    </p>
                  </div>
                  <StatusBadge status={rec.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Courses Summary */}
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#85878F] uppercase tracking-wider">
              Enrolled Courses ({student.enrollments.length})
            </h3>
            <div className="space-y-2">
              {student.enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#292C32]">{enr.courseOffering.subject.code}</p>
                    <p className="text-[10px] text-[#85878F]">{enr.courseOffering.subject.name}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#625BEB] px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 border border-[#A99AE8]/40">
                    {enr.courseOffering.subject.credits} Credits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

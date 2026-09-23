import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireStudentUser } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
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
          take: 5,
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
    return <div className="p-8 text-center text-[#A8ACAF]">Student record not found.</div>
  }

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner with Real-Time Campus Glass Image & E5CB90 Palette */}
      <div className="relative overflow-hidden rounded-3xl border border-[#383C3F] p-6 sm:p-10 shadow-2xl bg-[#222527]">
        {/* Background Image with Ambient Glow */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/campus_modern_glass.jpg"
          alt="Modern University Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter saturate-125 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#151718] via-[#222527]/90 to-[#151718]/80 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-3 border border-[#E5CB90]/30">
              <span className="w-2 h-2 rounded-full bg-[#E5CB90] animate-pulse" />
              <span>Academic Year 2025-26 • Semester {student.currentSemester}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#FCFBF7]">
              Hello, {student.user.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#D8D4CA] max-w-xl leading-relaxed">
              Roll No: <strong className="font-mono text-[#FFF3C8]">{student.rollNo}</strong> • Section {student.section} • {student.department.name}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-[#151718]/90 backdrop-blur-md border border-[#383C3F] text-center shadow-md">
              <p className="text-[10px] uppercase font-bold text-[#A8ACAF]">Attendance</p>
              <p
                className={`text-2xl font-black ${
                  student.attendancePercentage >= 75 ? 'text-[#FFF3C8]' : 'text-[#E5CB90]'
                }`}
              >
                {student.attendancePercentage}%
              </p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#151718]/90 backdrop-blur-md border border-[#383C3F] text-center shadow-md">
              <p className="text-[10px] uppercase font-bold text-[#A8ACAF]">CGPA</p>
              <p className="text-2xl font-black text-[#E5CB90] font-mono">
                {student.currentCgpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Session Check-In Card */}
      {activeSession ? (
        <div className="rounded-3xl bg-gradient-to-r from-[#222527] to-[#151718] border-2 border-[#E5CB90]/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E5CB90] to-[#FFF3C8] text-[#151718] flex items-center justify-center shadow-lg shadow-[#E5CB90]/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#E5CB90] tracking-wider">
                  Attendance Session Live Now
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-[10px] font-bold border border-[#E5CB90]/30">
                  {activeSession.geofenceRadiusMeters}m Campus Geofence
                </span>
              </div>
              <p className="text-base font-bold text-[#FCFBF7] mt-0.5">
                {activeSession.courseOffering.subject.name} ({activeSession.courseOffering.subject.code})
              </p>
              <p className="text-xs text-[#A8ACAF] mt-0.5">
                Topic: {activeSession.topicCovered || 'Regular Class'} • Biometric face verification open
              </p>
            </div>
          </div>

          <Link
            href="/student/attendance"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] font-black text-xs shadow-lg shadow-[#E5CB90]/20 whitespace-nowrap transition-all hover:scale-105 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Mark Presence with Face & GPS</span>
          </Link>
        </div>
      ) : (
        student.attendancePercentage < 75 && (
          <div className="p-5 rounded-2xl bg-[#E5CB90]/10 border border-[#E5CB90]/30 flex items-center justify-between gap-4 text-xs text-[#FFF3C8]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#E5CB90] shrink-0" />
              <span>
                <strong>Attendance Advisory:</strong> Your current attendance is{' '}
                <strong>{student.attendancePercentage}%</strong>, below the university mandatory 75% threshold. Ensure participation in upcoming lectures.
              </span>
            </div>
            <Link
              href="/student/attendance"
              className="px-3.5 py-1.5 rounded-xl bg-[#E5CB90] text-[#151718] font-black whitespace-nowrap"
            >
              Check Sensor
            </Link>
          </div>
        )
      )}

      {/* Main Grid: Learning Courses Synced from Faculty, Assessments, and Face Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Learning Courses from Faculty & Active Assessments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Faculty Learning Courses & Topic Videos (SYNCED COLUMN) */}
          <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E5CB90]/20 text-[#E5CB90]">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#FCFBF7] flex items-center gap-2">
                    <span>Learning Courses & Videos Posted by Faculty</span>
                    <span className="w-2 h-2 rounded-full bg-[#E5CB90] animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-[#A8ACAF]">
                    Curriculum masterclasses uploaded by your professors
                  </p>
                </div>
              </div>

              <Link
                href="/student/courses"
                className="text-xs font-bold text-[#E5CB90] hover:underline flex items-center gap-1"
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
                    className="p-4 rounded-2xl bg-[#151718]/90 border border-[#383C3F] hover:border-[#E5CB90]/60 flex flex-col justify-between gap-3 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-[10px]">
                          {video.topic?.unit?.subject?.code || 'CS501'}
                        </span>
                        <span className="text-[10px] text-[#A8ACAF] flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-[#E5CB90]" />
                          <span>{video.durationMinutes}m</span>
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#E5CB90] mt-1.5">
                        Topic: {video.topic?.title || 'Lecture'}
                      </p>
                      <h4 className="text-xs font-black text-[#FCFBF7] mt-0.5 line-clamp-2">
                        {video.title}
                      </h4>
                      {video.content && (
                        <p className="text-[11px] text-[#A8ACAF] mt-1 line-clamp-2">
                          {video.content}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#383C3F] flex items-center justify-between">
                      <span className="text-[10px] text-[#A8ACAF]">
                        By: {video.author?.split(' ')[0] || 'Faculty'}
                      </span>
                      <Link
                        href="/student/courses"
                        className="inline-flex items-center gap-1 text-[11px] font-black text-[#E5CB90] group-hover:text-[#FFF3C8] transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Video →</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 text-center text-xs text-[#A8ACAF] rounded-2xl bg-[#151718] border border-[#383C3F]">
                  Faculty has not posted any new topic videos yet.
                </div>
              )}
            </div>
          </div>

          {/* Active Assessments */}
          <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#FCFBF7] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E5CB90]" />
                <span>Available Assessments & Quizzes</span>
              </h3>
              <Link href="/student/assessments" className="text-xs text-[#E5CB90] hover:underline font-bold">
                View All Room
              </Link>
            </div>

            <div className="space-y-3">
              {publishedAssessments.map((ass) => (
                <div
                  key={ass.id}
                  className="p-4 rounded-2xl bg-[#151718]/90 border border-[#383C3F] flex items-center justify-between gap-4 hover:border-[#E5CB90]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-[10px]">
                        {ass.subject.code}
                      </span>
                      <span className="text-xs font-semibold text-[#A8ACAF]">
                        {ass.durationMinutes} Mins • {ass.totalMarks} Marks
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#FCFBF7] mt-1">{ass.title}</p>
                  </div>

                  <Link
                    href="/student/assessments"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black whitespace-nowrap shadow-xs cursor-pointer"
                  >
                    Start Test →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Biometric Check-in Feature Card & Attendance Log */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#222527] border border-[#383C3F] overflow-hidden shadow-xl group">
            <div className="relative aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/face_biometric_scan.jpg"
                alt="Face Biometric Verification"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151718] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-[#E5CB90] text-[#151718] text-[10px] font-black backdrop-blur-md shadow-md">
                3D Liveness & GPS Active
              </span>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-base font-bold text-[#FCFBF7]">Biometric Face Check-In</h3>
              <p className="text-xs text-[#A8ACAF] leading-relaxed">
                Experience instant camera facial recognition matching against student enrollment records with classroom radius geofence auditing.
              </p>
              <Link
                href="/student/attendance"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#E5CB90]/20 transition-all hover:scale-105 mt-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Biometric Sensor</span>
              </Link>
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#A8ACAF] uppercase tracking-wider">
              Recent Attendance Log
            </h3>
            <div className="divide-y divide-[#383C3F]">
              {student.attendanceRecords.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#FCFBF7]">
                      {rec.session.courseOffering.subject.code}
                    </p>
                    <p className="text-[10px] text-[#A8ACAF] font-mono">
                      {new Date(rec.markedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={rec.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

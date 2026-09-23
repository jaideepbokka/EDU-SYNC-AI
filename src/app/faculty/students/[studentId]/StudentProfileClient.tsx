'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { ConfirmModal } from '@/components/ConfirmModal'
import {
  User,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  TrendingUp,
  Compass,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Plus,
  Clock,
  FileText,
} from 'lucide-react'

interface StudentProfileClientProps {
  student: any
  initialTab?: string
}

export function StudentProfileClient({
  student,
  initialTab = 'overview',
}: StudentProfileClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [overrideSessionId, setOverrideSessionId] = useState<string | null>(null)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false)
  const [interventionData, setInterventionData] = useState({
    type: 'COUNSELING',
    description: '',
    targetDays: 3,
    notes: '',
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'attendance', label: 'Attendance Log', icon: CalendarCheck },
    { id: 'subjects', label: 'Enrolled Subjects', icon: BookOpen },
    { id: 'results', label: 'Semester Results', icon: GraduationCap },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'progress', label: 'Topic Mastery', icon: TrendingUp },
    { id: 'learning_path', label: 'AI Remedial Paths', icon: Compass },
    { id: 'risk', label: 'Risk & Interventions', icon: AlertTriangle },
  ]

  const handleAttendanceOverride = async (reason: string) => {
    if (!overrideSessionId) return
    const res = await fetch('/api/attendance/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: overrideSessionId,
        studentId: student.id,
        newStatus: 'PRESENT',
        reason,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to override attendance')
    }
    router.refresh()
  }

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        ...interventionData,
      }),
    })
    if (res.ok) {
      setIsInterventionModalOpen(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Top Banner */}
      <div>
        <Link
          href="/faculty/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </Link>

        {/* Student Profile Header Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl font-bold text-indigo-600 shrink-0 shadow-md">
              {student.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.user.avatar}
                  alt={student.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                student.user.name.charAt(0)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {student.user.name}
                </h1>
                <StatusBadge status={student.riskLevel} />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Roll No: <strong className="font-mono text-slate-800 dark:text-slate-200">{student.rollNo}</strong> • Reg No: <strong className="font-mono text-slate-800 dark:text-slate-200">{student.registerNo}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {student.department.name} (Sem {student.currentSemester} - Sec {student.section})
                </span>
                <span>Batch: {student.batch}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Attendance</p>
              <p
                className={`text-xl font-black ${
                  student.attendancePercentage >= 75
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {student.attendancePercentage}%
              </p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">CGPA</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {student.currentCgpa.toFixed(2)}
              </p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Risk Score</p>
              <p
                className={`text-xl font-black ${
                  student.riskScore >= 70
                    ? 'text-rose-600'
                    : student.riskScore >= 40
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {student.riskScore}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Status Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
                Academic Standing & Mentor Notes
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Advisor / Mentor Note:
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic leading-relaxed">
                  &ldquo;{student.advisorNotes || 'No notes added yet for this student.'}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Credits</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">22 Credits</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Degree Program</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">B.Tech Computer Science</p>
                </div>
              </div>
            </div>

            {/* Quick Topic Progress Summary */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Core Topics Progression
                </h3>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {student.topicProgress.map((tp: any) => (
                  <div key={tp.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{tp.topic.title}</span>
                      <StatusBadge status={tp.status} size="sm" />
                    </div>
                    <ProgressBar value={tp.masteryScore} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Guardian */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
                Contact & Guardian Information
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">Email</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{student.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">Student Phone</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.studentPhone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase">Guardian Contact</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {student.guardianName || 'Parent / Guardian'}
                  </p>
                  <p className="text-indigo-600 font-semibold mt-0.5">{student.guardianPhone || 'N/A'}</p>
                </div>

                {student.address && (
                  <div className="flex items-start gap-3 pt-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold uppercase">Permanent Address</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{student.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Verified Attendance Records ({student.attendanceRecords.length} Sessions)
            </h3>
            <span className="text-xs text-slate-400">
              Biometric Face & GPS Geofence Audited
            </span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="px-4 py-3">Session Date & Subject</th>
                  <th className="px-4 py-3">Topic Covered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verification Detail</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.attendanceRecords.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {new Date(rec.session.sessionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rec.session.courseOffering.subject.code} - {rec.session.courseOffering.subject.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {rec.session.topicCovered || 'Regular Class'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-4 py-3">
                      {rec.status === 'PRESENT' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            Face: {rec.faceConfidence ? `${Math.round(rec.faceConfidence * 100)}%` : 'Verified'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold text-[10px] border border-sky-200">
                            GPS In-Geofence
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {rec.overrideReason || 'Absent at session close'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {rec.status === 'ABSENT' && (
                        <button
                          onClick={() => {
                            setOverrideSessionId(rec.sessionId)
                            setIsOverrideModalOpen(true)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs transition-colors"
                        >
                          Manual Override
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: ENROLLED SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {student.enrollments.map((enr: any) => (
            <div
              key={enr.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-mono font-bold text-xs">
                  {enr.courseOffering.subject.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {enr.courseOffering.subject.credits} Credits
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                {enr.courseOffering.subject.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Faculty: {enr.courseOffering.faculty.user.name} ({enr.courseOffering.faculty.designation})
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Section {enr.courseOffering.section}</span>
                <Link
                  href={`/faculty/subjects`}
                  className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Syllabus & Units</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: SEMESTER RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {student.semesterResults.map((res: any) => (
            <div
              key={res.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Semester {res.semester} Official Grade Sheet
                  </h3>
                  <p className="text-xs text-slate-400">Academic Session {res.academicYear}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">SGPA</span>
                    <p className="text-lg font-black text-indigo-600">{res.sgpa.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Course</th>
                    <th className="px-4 py-2.5">Credits</th>
                    <th className="px-4 py-2.5">Internal</th>
                    <th className="px-4 py-2.5">External</th>
                    <th className="px-4 py-2.5">Total</th>
                    <th className="px-4 py-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {res.subjectResults.map((sub: any) => (
                    <tr key={sub.id}>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-100">
                        {sub.subjectCode} - {sub.subjectName}
                      </td>
                      <td className="px-4 py-2.5">{sub.credits}</td>
                      <td className="px-4 py-2.5">{sub.internalMarks}</td>
                      <td className="px-4 py-2.5">{sub.externalMarks}</td>
                      <td className="px-4 py-2.5 font-bold">{sub.totalMarks}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Assessment & Quiz Submissions ({student.attempts.length})
          </h3>
          <div className="space-y-4">
            {student.attempts.map((att: any) => (
              <div
                key={att.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {att.assessment.title}
                    </span>
                    <StatusBadge status={att.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{att.assessment.description}</p>
                  {att.feedback && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 italic">
                      Faculty Feedback: &ldquo;{att.feedback}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {att.score} / {att.totalMarks}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">{att.percentage}% Score</p>
                  </div>

                  {att.status === 'SUBMITTED' && (
                    <Link
                      href="/faculty/evaluation"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
                    >
                      Grade Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: TOPIC MASTERY */}
      {activeTab === 'progress' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Syllabus Topic Mastery Progression
          </h3>

          <div className="space-y-6">
            {student.topicProgress.map((tp: any) => (
              <div key={tp.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tp.topic.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Estimated Hours: {tp.topic.estimatedHours}h • Difficulty: {tp.topic.difficulty}
                    </p>
                  </div>
                  <StatusBadge status={tp.status} />
                </div>

                <ProgressBar value={tp.masteryScore} label="Topic Competency Mastery" />

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Quizzes Attempted: <strong>{tp.quizzesAttempted}</strong></span>
                  <span>Accuracy Rate: <strong>{tp.accuracyRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: AI REMEDIAL LEARNING PATHS */}
      {activeTab === 'learning_path' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>AI Remedial Mastery Paths</span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalized topic intervention trajectories synthesized by the academic engine
              </p>
            </div>
            <Link
              href="/faculty/learning-paths"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
            >
              Generate New Path
            </Link>
          </div>

          {student.learningPaths.length > 0 ? (
            student.learningPaths.map((lp: any) => (
              <div
                key={lp.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{lp.title}</h4>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                      Trigger: {lp.reason}
                    </p>
                  </div>
                  <StatusBadge status={lp.status} />
                </div>

                {/* Steps Timeline */}
                <div className="space-y-3 pt-2">
                  {lp.steps.map((step: any, idx: number) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {step.title}
                          </p>
                          {step.isCompleted && (
                            <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                        {step.resourceUrl && (
                          <a
                            href={step.resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-1 font-semibold"
                          >
                            <span>Open Learning Module</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              No active remedial learning path assigned. Student is on track.
            </div>
          )}
        </div>
      )}

      {/* Tab 8: ACADEMIC RISK & INTERVENTIONS */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Diagnostic Risk Classification: {student.riskLevel}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  {student.riskProfiles[0]?.primaryReason || 'Student exhibits attendance or grade risk flags.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsInterventionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs whitespace-nowrap"
            >
              Schedule Faculty Intervention
            </button>
          </div>

          {/* Active Interventions Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Assigned Faculty Interventions ({student.interventions.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {student.interventions.map((intv: any) => (
                <div key={intv.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {intv.type.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={intv.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{intv.description}</p>
                    {intv.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">Notes: {intv.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">
                      Target:{' '}
                      {intv.targetDate
                        ? new Date(intv.targetDate).toLocaleDateString()
                        : 'Immediate'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Attendance Override Modal */}
      <ConfirmModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onConfirm={handleAttendanceOverride}
        title="Manual Attendance Override"
        message="You are about to mark this student as PRESENT for this session. University regulations require an academic justification for the audit log."
        confirmText="Confirm Attendance Override"
        requireReason={true}
        reasonPlaceholder="e.g. Verified university technical symposium participation / medical certificate submitted..."
      />

      {/* Schedule Intervention Modal */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Schedule Faculty Intervention
            </h3>
            <form onSubmit={handleCreateIntervention} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention Action Type
                </label>
                <select
                  value={interventionData.type}
                  onChange={(e) => setInterventionData({ ...interventionData, type: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                >
                  <option value="COUNSELING">Faculty Academic Counseling</option>
                  <option value="PARENT_MEETING">Urgent Parent Meeting</option>
                  <option value="REMEDIAL_CLASS">Mandatory Remedial Lab Session</option>
                  <option value="PEER_TUTORING">Assign Peer Tutor</option>
                  <option value="WARNING_NOTICE">Formal Academic Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Action Plan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={interventionData.description}
                  onChange={(e) => setInterventionData({ ...interventionData, description: e.target.value })}
                  placeholder="Outline the scheduled meeting or required remedial deliverables..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  value={interventionData.notes}
                  onChange={(e) => setInterventionData({ ...interventionData, notes: e.target.value })}
                  placeholder="e.g. Scheduled in HOD Cabin LH-301"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInterventionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                >
                  Schedule Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

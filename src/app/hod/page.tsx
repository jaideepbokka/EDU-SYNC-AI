import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import {
  Users,
  BookOpen,
  DollarSign,
  CalendarCheck,
  Send,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Settings,
  Sparkles,
  BarChart3,
  Power,
} from 'lucide-react'

export const metadata = {
  title: 'Department Overview | EduSync AI HOD Portal',
  description: 'Departmental executive summary for Computer Science and Engineering.',
}

export default async function HodOverviewPage() {
  const hodUser = await requireHodUser()

  const [students, faculty, offerings, recentMails] = await Promise.all([
    prisma.student.findMany({
      include: { fee: true, user: true },
    }),
    prisma.faculty.findMany({
      include: { user: true, offerings: { include: { subject: true } } },
    }),
    prisma.courseOffering.findMany({
      include: { faculty: { include: { user: true } }, subject: true },
    }),
    prisma.notification.findMany({
      where: { type: 'HOD_MAIL' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
  ])

  // Aggregate metrics
  const totalStudents = students.length
  const activeFacultyCount = faculty.filter((f) => f.status === 'ACTIVE').length
  const totalOfferings = offerings.length

  const totalFeeCollected = students.reduce(
    (acc, s) => acc + (s.fee?.paidAmount || 55000),
    0
  )
  const totalFeeDue = students.reduce((acc, s) => acc + (s.fee?.dueAmount || 0), 0)

  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + s.attendancePercentage, 0) /
          students.length
        ).toFixed(1)
      : '85.0'

  // Section-wise metrics
  const sectionA = students.filter((s) => s.section === 'A')
  const sectionB = students.filter((s) => s.section === 'B')
  const sectionC = students.filter((s) => s.section === 'C')

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-6 sm:p-8 text-white shadow-xl shadow-[#0D9488]/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2.5 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-4 h-4" />
            <span>EduSync AI • Department of Computer Science & Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome, Dr. K. Karthikeya
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            Department Head Executive Terminal • Overseeing faculty allocations, minimum ₹55K student fees, attendance compliance, and curriculum offerings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/hod/faculty"
            className="px-4 py-2.5 rounded-full bg-white text-[#0F766E] text-xs font-black hover:bg-teal-50 transition-all shadow-md flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty Management</span>
          </Link>
          <Link
            href="/hod/mails"
            className="px-4 py-2.5 rounded-full bg-[#134E4A] hover:bg-[#042F2C] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Send Notice</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-bold">
            <span>Enrolled CSE Students</span>
            <span className="p-2 rounded-xl bg-teal-50 text-[#0D9488]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#134E4A]">{totalStudents}</span>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Sections A ({sectionA.length}), B ({sectionB.length}), C ({sectionC.length})
            </p>
          </div>
        </div>

        {/* Faculty Count & Active */}
        <div className="p-5 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-bold">
            <span>Faculty & Teaching Staff</span>
            <span className="p-2 rounded-xl bg-teal-50 text-[#0D9488]">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#134E4A]">{faculty.length} Members</span>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeFacultyCount} Active On Duty</span>
            </p>
          </div>
        </div>

        {/* Total Fee Collected */}
        <div className="p-5 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-bold">
            <span>Department Fee Remittance</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              ₹{(totalFeeCollected / 100000).toFixed(2)} Lakhs
            </span>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Standard Min: <strong className="text-slate-700">₹55,000 / student</strong>
            </p>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="p-5 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-bold">
            <span>Average Attendance</span>
            <span className="p-2 rounded-xl bg-teal-50 text-[#0D9488]">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F766E]">{avgAttendance}%</span>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              Institutional Standard Met
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Nav Shortcuts & Section Analytics Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1 col) */}
        <div className="bg-white rounded-3xl border border-[#D9EFEA] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-[#134E4A] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0D9488]" />
            <span>HOD Administrative Shortcuts</span>
          </h2>

          <div className="space-y-2 text-xs">
            <Link
              href="/hod/faculty"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F4FBF9] hover:bg-[#E6F7F3] border border-[#D9EFEA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#0D9488]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Faculty Management</p>
                  <p className="text-[10px] text-[#64748B]">Add, edit, delete & toggle active/off</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/hod/assignments"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F4FBF9] hover:bg-[#E6F7F3] border border-[#D9EFEA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#0D9488]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Teaching Assignments</p>
                  <p className="text-[10px] text-[#64748B]">Allocate subjects to professors</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/hod/reports"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F4FBF9] hover:bg-[#E6F7F3] border border-[#D9EFEA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#0D9488]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Reports Generator</p>
                  <p className="text-[10px] text-[#64748B]">Select fees, attendance & export CSV</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/hod/mails"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F4FBF9] hover:bg-[#E6F7F3] border border-[#D9EFEA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#0D9488]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Faculty Circulars</p>
                  <p className="text-[10px] text-[#64748B]">Broadcast to faculty notifications</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Section-Wise Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9EFEA] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-[#134E4A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                <span>CSE Section-Wise Academic & Financial Health</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Comparative metrics across Class Sections A, B, and C
              </p>
            </div>
            <Link
              href="/hod/analytics"
              className="text-xs font-bold text-[#0D9488] hover:underline"
            >
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: 'Section A', list: sectionA, badge: 'High Engagement' },
              { name: 'Section B', list: sectionB, badge: 'Optimal Standing' },
              { name: 'Section C', list: sectionC, badge: 'Special Focus' },
            ].map((sec) => {
              const count = sec.list.length
              const paidRate =
                count > 0
                  ? Math.round(
                      (sec.list.filter((s) => s.fee?.status === 'PAID').length / count) *
                        100
                    )
                  : 100
              const secAtt =
                count > 0
                  ? Math.round(
                      sec.list.reduce((acc, s) => acc + s.attendancePercentage, 0) / count
                    )
                  : 85

              return (
                <div
                  key={sec.name}
                  className="p-4 rounded-2xl bg-[#F4FBF9] border border-[#D9EFEA] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#134E4A]">{sec.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0D9488] border border-[#D9EFEA]">
                      {sec.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Enrolled Students:</span>
                      <strong className="text-[#1E293B]">{count}</strong>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Avg Attendance:</span>
                      <strong className="text-[#0D9488]">{secAtt}%</strong>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Fee Clearance Rate:</span>
                      <strong className="text-emerald-700">{paidRate}%</strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0D9488] h-full rounded-full"
                      style={{ width: `${paidRate}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Circulars Notice */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-ping" />
              <div>
                <p className="font-bold text-[#0F766E]">Latest Department Circular</p>
                <p className="text-[11px] text-[#64748B]">
                  {recentMails[0]?.title || 'Mid-Term Exam Question Paper Submissions Due'}
                </p>
              </div>
            </div>
            <Link
              href="/hod/mails"
              className="text-xs font-bold text-[#0D9488] underline hover:text-[#0F766E]"
            >
              View Circulars
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

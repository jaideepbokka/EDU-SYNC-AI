import React from 'react'
import { prisma } from '@/lib/prisma'
import { requireHodUser } from '@/lib/auth'
import {
  BarChart3,
  Users,
  DollarSign,
  CalendarCheck,
  Award,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'

export const metadata = {
  title: 'Section-wise Analytics | HOD Portal',
  description: 'Deep-dive academic and fee clearance analytics across CSE sections.',
}

export default async function HodAnalyticsPage() {
  await requireHodUser()

  const students = await prisma.student.findMany({
    include: { fee: true, user: true },
  })

  const sections = ['A', 'B', 'C'].map((secName) => {
    const list = students.filter((s) => s.section === secName)
    const count = list.length
    const totalFee = list.reduce((acc, s) => acc + (s.fee?.totalFee || 55000), 0)
    const paidFee = list.reduce((acc, s) => acc + (s.fee?.paidAmount || 55000), 0)
    const dueFee = list.reduce((acc, s) => acc + (s.fee?.dueAmount || 0), 0)
    const avgAttendance =
      count > 0
        ? (
            list.reduce((acc, s) => acc + s.attendancePercentage, 0) / count
          ).toFixed(1)
        : '0.0'
    const avgCgpa =
      count > 0
        ? (list.reduce((acc, s) => acc + s.currentCgpa, 0) / count).toFixed(2)
        : '0.00'
    const atRiskCount = list.filter((s) => s.attendancePercentage < 75 || s.riskLevel !== 'LOW').length

    return {
      name: `Section ${secName}`,
      secLetter: secName,
      count,
      totalFee,
      paidFee,
      dueFee,
      avgAttendance,
      avgCgpa,
      atRiskCount,
      students: list,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D9EFEA] pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-[#0D9488]" />
          <span>Section-Wise Academic & Financial Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
          Comprehensive performance evaluation, fee remittance ratios, and attendance trends for CSE sections
        </p>
      </div>

      {/* 3 Section Deep-Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.name}
            className="bg-white rounded-3xl border border-[#D9EFEA] p-6 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1E293B]">{sec.name}</h3>
                <p className="text-[11px] text-[#64748B]">Semester 6 • AY 2025-26</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] font-black flex items-center justify-center">
                {sec.secLetter}
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F4FBF9] flex items-center justify-between">
                <span className="text-[#64748B] font-bold">Total Enrolled:</span>
                <span className="text-base font-black text-[#134E4A]">{sec.count} Students</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 font-bold block">Fee Remitted:</span>
                  <span className="text-[10px] text-emerald-600">Min ₹55K Standard</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-black text-emerald-700">
                    ₹{sec.paidFee.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Due: ₹{sec.dueFee.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-[#64748B] font-bold block">Avg Attendance</span>
                  <span className="text-base font-black text-[#0D9488]">{sec.avgAttendance}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-[#64748B] font-bold block">Average CGPA</span>
                  <span className="text-base font-black text-[#1E293B] font-mono">{sec.avgCgpa}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-rose-700">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>At-Risk Students:</span>
                </span>
                <span className="font-black font-mono">{sec.atRiskCount} Flagged</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

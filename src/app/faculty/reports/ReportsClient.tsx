'use client'

import React, { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  FileSpreadsheet,
  Download,
  Printer,
  CalendarCheck,
  Award,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

interface ReportsClientProps {
  students: any[]
  results: any[]
}

export function ReportsClient({ students, results }: ReportsClientProps) {
  const [reportType, setReportType] = useState<'attendance' | 'performance' | 'risk'>('attendance')

  const downloadCsv = () => {
    let headers: string[] = []
    let rows: string[][] = []
    let filename = `edusync_report_${reportType}.csv`

    if (reportType === 'attendance') {
      headers = ['Roll No', 'Register No', 'Name', 'Email', 'Section', 'Attendance %', 'Status']
      rows = students.map((s) => [
        s.rollNo,
        s.registerNo,
        s.user.name,
        s.user.email,
        s.section,
        `${s.attendancePercentage}%`,
        s.attendancePercentage >= 75 ? 'Eligible' : 'Attendance Shortage',
      ])
    } else if (reportType === 'performance') {
      headers = ['Roll No', 'Name', 'Semester', 'SGPA', 'CGPA', 'Earned Credits', 'Status']
      rows = results.map((r) => [
        r.student.rollNo,
        r.student.user.name,
        `Sem ${r.semester}`,
        r.sgpa.toFixed(2),
        r.cgpa.toFixed(2),
        `${r.earnedCredits}/${r.totalCredits}`,
        r.status,
      ])
    } else {
      headers = ['Roll No', 'Name', 'Risk Level', 'Risk Score', 'Attendance %', 'Primary Reason']
      rows = students.map((s) => [
        s.rollNo,
        s.user.name,
        s.riskLevel,
        `${s.riskScore}/100`,
        `${s.attendancePercentage}%`,
        `"${s.riskProfiles[0]?.primaryReason || 'Acceptable'}"`,
      ])
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Official Regulatory Audit • University Export</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-white" />
            <span>Academic Regulatory Reports & Data Export</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Generate official university compliance reports for attendance shortage, examination eligibility, and cognitive risk logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/20 transition-colors backdrop-blur-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>

          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Export</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs w-fit">
        <button
          onClick={() => setReportType('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            reportType === 'attendance'
              ? 'bg-[#292C32] text-white shadow-xs'
              : 'text-[#85878F] hover:bg-[#F2F3F5]'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Attendance Compliance Report</span>
        </button>

        <button
          onClick={() => setReportType('performance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            reportType === 'performance'
              ? 'bg-[#292C32] text-white shadow-xs'
              : 'text-[#85878F] hover:bg-[#F2F3F5]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Official Grade Sheet Export</span>
        </button>

        <button
          onClick={() => setReportType('risk')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            reportType === 'risk'
              ? 'bg-[#292C32] text-white shadow-xs'
              : 'text-[#85878F] hover:bg-[#F2F3F5]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Academic Risk Watchlist</span>
        </button>
      </div>

      {/* Report Table View */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F3F5] uppercase font-semibold text-[#85878F] text-[10px] border-b border-[#E9EAF0]">
              {reportType === 'attendance' && (
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Register No</th>
                  <th className="px-5 py-3.5">Section</th>
                  <th className="px-5 py-3.5">Attendance %</th>
                  <th className="px-5 py-3.5">Exam Eligibility</th>
                </tr>
              )}
              {reportType === 'performance' && (
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Semester</th>
                  <th className="px-5 py-3.5">SGPA</th>
                  <th className="px-5 py-3.5">CGPA</th>
                  <th className="px-5 py-3.5">Credits</th>
                  <th className="px-5 py-3.5">Standing</th>
                </tr>
              )}
              {reportType === 'risk' && (
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Risk Level</th>
                  <th className="px-5 py-3.5">Risk Score</th>
                  <th className="px-5 py-3.5">Attendance</th>
                  <th className="px-5 py-3.5">Diagnostic Flag</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {reportType === 'attendance' &&
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F2F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#292C32]">
                      {s.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#292C32]">
                      {s.user.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#85878F]">{s.registerNo}</td>
                    <td className="px-5 py-3.5 text-[#292C32]">Sec {s.section}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-bold ${
                          s.attendancePercentage >= 75 ? 'text-[#35C979]' : 'text-rose-600'
                        }`}
                      >
                        {s.attendancePercentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          s.attendancePercentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.attendancePercentage >= 75 ? 'ELIGIBLE' : 'DEBARRED (ATT. SHORTAGE)'}
                      </span>
                    </td>
                  </tr>
                ))}

              {reportType === 'performance' &&
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F2F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#292C32]">
                      {r.student.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#292C32]">
                      {r.student.user.name}
                    </td>
                    <td className="px-5 py-3.5 text-[#292C32]">Sem {r.semester}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-[#625BEB]">
                      {r.sgpa.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-[#292C32]">
                      {r.cgpa.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#85878F]">
                      {r.earnedCredits}/{r.totalCredits}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}

              {reportType === 'risk' &&
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F2F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#292C32]">
                      {s.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#292C32]">
                      {s.user.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.riskLevel} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-rose-600">
                      {s.riskScore}/100
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#292C32]">
                      {s.attendancePercentage}%
                    </td>
                    <td className="px-5 py-3.5 text-[#85878F] text-xs line-clamp-1 max-w-sm">
                      {s.riskProfiles[0]?.primaryReason || 'Within thresholds'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


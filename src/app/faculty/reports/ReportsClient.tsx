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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Academic Regulatory Reports & Data Export</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate official university compliance reports for attendance shortage, examination eligibility, and cognitive risk logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>

          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Export</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
        <button
          onClick={() => setReportType('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Attendance Compliance Report</span>
        </button>

        <button
          onClick={() => setReportType('performance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'performance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Official Grade Sheet Export</span>
        </button>

        <button
          onClick={() => setReportType('risk')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'risk'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Academic Risk Watchlist</span>
        </button>
      </div>

      {/* Report Table View */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 text-[10px] border-b border-slate-200 dark:border-slate-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportType === 'attendance' &&
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {s.user.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{s.registerNo}</td>
                    <td className="px-5 py-3.5">Sec {s.section}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-bold ${
                          s.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
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
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {r.student.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {r.student.user.name}
                    </td>
                    <td className="px-5 py-3.5">Sem {r.semester}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">
                      {r.sgpa.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {r.cgpa.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {r.earnedCredits}/{r.totalCredits}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}

              {reportType === 'risk' &&
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {s.user.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.riskLevel} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-rose-600">
                      {s.riskScore}/100
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {s.attendancePercentage}%
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs line-clamp-1 max-w-sm">
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

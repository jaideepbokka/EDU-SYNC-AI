'use client'

import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  CheckSquare,
  Square,
  Search,
  Building,
  CheckCircle2,
  DollarSign,
  CalendarCheck,
  Award,
  Users,
} from 'lucide-react'

interface HodReportsClientProps {
  students: any[]
}

export function HodReportsClient({ students }: HodReportsClientProps) {
  // Columns selection state
  const [columns, setColumns] = useState({
    rollNo: true,
    registerNo: true,
    name: true,
    section: true,
    semester: true,
    // Fees details (user explicitly requested!)
    feesTotal: true,
    feesPaid: true,
    feesDue: true,
    feesStatus: true,
    // Attendance details (user explicitly requested!)
    attendance: true,
    // Academic details
    cgpa: true,
    riskLevel: true,
    // Guardian details
    guardianName: false,
    guardianPhone: false,
  })

  // Filters state
  const [selectedSection, setSelectedSection] = useState('ALL')
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('ALL')
  const [selectedAttendanceRisk, setSelectedAttendanceRisk] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const toggleColumn = (col: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [col]: !prev[col] }))
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedSection !== 'ALL' && s.section !== selectedSection) return false

    const feeStatus = s.fee?.status || 'PAID'
    if (selectedFeeStatus !== 'ALL' && feeStatus !== selectedFeeStatus) return false

    if (selectedAttendanceRisk === 'RISK' && s.attendancePercentage >= 75) return false
    if (selectedAttendanceRisk === 'SAFE' && s.attendancePercentage < 75) return false

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matches =
        s.user.name.toLowerCase().includes(term) ||
        s.rollNo.toLowerCase().includes(term) ||
        s.registerNo.toLowerCase().includes(term)
      if (!matches) return false
    }

    return true
  })

  // Export CSV
  const handleExportCSV = () => {
    const headers: string[] = []
    if (columns.rollNo) headers.push('Roll No')
    if (columns.registerNo) headers.push('Register No')
    if (columns.name) headers.push('Student Name')
    if (columns.section) headers.push('Section')
    if (columns.semester) headers.push('Semester')
    if (columns.feesTotal) headers.push('Total Fee (INR)')
    if (columns.feesPaid) headers.push('Amount Paid (INR)')
    if (columns.feesDue) headers.push('Balance Due (INR)')
    if (columns.feesStatus) headers.push('Fee Status')
    if (columns.attendance) headers.push('Attendance %')
    if (columns.cgpa) headers.push('CGPA')
    if (columns.riskLevel) headers.push('Academic Risk')
    if (columns.guardianName) headers.push('Guardian Name')
    if (columns.guardianPhone) headers.push('Guardian Phone')

    const rows = filteredStudents.map((s) => {
      const row: string[] = []
      if (columns.rollNo) row.push(`"${s.rollNo}"`)
      if (columns.registerNo) row.push(`"${s.registerNo}"`)
      if (columns.name) row.push(`"${s.user.name}"`)
      if (columns.section) row.push(`"${s.section}"`)
      if (columns.semester) row.push(`"${s.currentSemester}"`)
      if (columns.feesTotal) row.push(`"${s.fee?.totalFee || 55000}"`)
      if (columns.feesPaid) row.push(`"${s.fee?.paidAmount || 55000}"`)
      if (columns.feesDue) row.push(`"${s.fee?.dueAmount || 0}"`)
      if (columns.feesStatus) row.push(`"${s.fee?.status || 'PAID'}"`)
      if (columns.attendance) row.push(`"${s.attendancePercentage}%"`)
      if (columns.cgpa) row.push(`"${s.currentCgpa}"`)
      if (columns.riskLevel) row.push(`"${s.riskLevel}"`)
      if (columns.guardianName) row.push(`"${s.guardianName || 'N/A'}"`)
      if (columns.guardianPhone) row.push(`"${s.guardianPhone || 'N/A'}"`)
      return row.join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `EduSync_CSE_Report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9EFEA] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight">
            Academic & Financial Reports Generator
          </h1>
          <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
            Select exact parameters (Fees, Attendance, CGPA, Guardian) to compile customized institutional reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-full border border-[#D9EFEA] bg-white hover:bg-slate-50 text-[#134E4A] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#0D9488]" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-black shadow-md shadow-[#0D9488]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Select Which Details are Needed (User request!) */}
      <div className="p-5 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-[#134E4A] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#0D9488]" />
            <span>Select Details to Include in Report:</span>
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Tick or untick columns to customize the data output for university administration or departmental review.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Identity */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.rollNo}
              onChange={() => toggleColumn('rollNo')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Roll Number</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.name}
              onChange={() => toggleColumn('name')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Student Name</span>
          </label>

          {/* Fees Options (User Highlighted!) */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-100">
            <input
              type="checkbox"
              checked={columns.feesTotal}
              onChange={() => toggleColumn('feesTotal')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-emerald-800">Total Fee (Min ₹55K)</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-100">
            <input
              type="checkbox"
              checked={columns.feesPaid}
              onChange={() => toggleColumn('feesPaid')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-emerald-800">Fees Paid Amount</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-100">
            <input
              type="checkbox"
              checked={columns.feesDue}
              onChange={() => toggleColumn('feesDue')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-emerald-800">Balance Fee Dues</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-100">
            <input
              type="checkbox"
              checked={columns.feesStatus}
              onChange={() => toggleColumn('feesStatus')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-emerald-800">Fee Clearance Status</span>
          </label>

          {/* Attendance (User Highlighted!) */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-teal-50/60 border border-teal-200 cursor-pointer hover:bg-teal-100">
            <input
              type="checkbox"
              checked={columns.attendance}
              onChange={() => toggleColumn('attendance')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#0F766E]">Attendance Percentage</span>
          </label>

          {/* Academic CGPA */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.cgpa}
              onChange={() => toggleColumn('cgpa')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">CGPA & Marks</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.riskLevel}
              onChange={() => toggleColumn('riskLevel')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Academic Risk Level</span>
          </label>

          {/* Guardian Info */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.guardianName}
              onChange={() => toggleColumn('guardianName')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Guardian Name</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.guardianPhone}
              onChange={() => toggleColumn('guardianPhone')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Guardian Phone</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 cursor-pointer hover:bg-teal-50/50">
            <input
              type="checkbox"
              checked={columns.section}
              onChange={() => toggleColumn('section')}
              className="accent-[#0D9488]"
            />
            <span className="font-bold text-[#1E293B]">Section & Semester</span>
          </label>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EFEA] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#64748B] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Filters:</span>
          </span>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#1E293B]"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#1E293B]"
          >
            <option value="ALL">All Fee Status</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="DUE">Outstanding Dues</option>
          </select>

          <select
            value={selectedAttendanceRisk}
            onChange={(e) => setSelectedAttendanceRisk(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#1E293B]"
          >
            <option value="ALL">All Attendance</option>
            <option value="SAFE">Safe (≥ 75%)</option>
            <option value="RISK">Shortage (&lt; 75%)</option>
          </select>
        </div>

        <div className="text-[11px] font-bold text-[#0D9488]">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Dynamic Report Preview Table */}
      <div className="bg-white rounded-2xl border border-[#D9EFEA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4FBF9] text-[#0F766E] border-b border-[#D9EFEA] font-black uppercase tracking-wider">
                {columns.rollNo && <th className="py-3 px-3">Roll No</th>}
                {columns.registerNo && <th className="py-3 px-3">Reg No</th>}
                {columns.name && <th className="py-3 px-3">Student Name</th>}
                {columns.section && <th className="py-3 px-3">Sec</th>}
                {columns.feesTotal && <th className="py-3 px-3 text-right">Total Fee</th>}
                {columns.feesPaid && <th className="py-3 px-3 text-right">Paid</th>}
                {columns.feesDue && <th className="py-3 px-3 text-right">Due</th>}
                {columns.feesStatus && <th className="py-3 px-3 text-center">Fee Status</th>}
                {columns.attendance && <th className="py-3 px-3 text-center">Attendance</th>}
                {columns.cgpa && <th className="py-3 px-3 text-center">CGPA</th>}
                {columns.riskLevel && <th className="py-3 px-3 text-center">Risk Level</th>}
                {columns.guardianName && <th className="py-3 px-3">Guardian</th>}
                {columns.guardianPhone && <th className="py-3 px-3">Phone</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-teal-50/20 transition-colors">
                  {columns.rollNo && (
                    <td className="py-3 px-3 font-mono font-bold text-[#1E293B]">{s.rollNo}</td>
                  )}
                  {columns.registerNo && (
                    <td className="py-3 px-3 font-mono text-[#64748B] text-[11px]">{s.registerNo}</td>
                  )}
                  {columns.name && (
                    <td className="py-3 px-3 font-bold text-[#1E293B]">{s.user.name}</td>
                  )}
                  {columns.section && (
                    <td className="py-3 px-3 font-bold text-[#0D9488]">Sec {s.section}</td>
                  )}
                  {columns.feesTotal && (
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{(s.fee?.totalFee || 55000).toLocaleString('en-IN')}
                    </td>
                  )}
                  {columns.feesPaid && (
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">
                      ₹{(s.fee?.paidAmount || 55000).toLocaleString('en-IN')}
                    </td>
                  )}
                  {columns.feesDue && (
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">
                      ₹{(s.fee?.dueAmount || 0).toLocaleString('en-IN')}
                    </td>
                  )}
                  {columns.feesStatus && (
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.fee?.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.fee?.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.fee?.status || 'PAID'}
                      </span>
                    </td>
                  )}
                  {columns.attendance && (
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={
                          s.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600 font-black'
                        }
                      >
                        {s.attendancePercentage}%
                      </span>
                    </td>
                  )}
                  {columns.cgpa && (
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#1E293B]">
                      {s.currentCgpa.toFixed(2)}
                    </td>
                  )}
                  {columns.riskLevel && (
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.riskLevel === 'LOW'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.riskLevel}
                      </span>
                    </td>
                  )}
                  {columns.guardianName && (
                    <td className="py-3 px-3 text-[#64748B]">{s.guardianName || 'N/A'}</td>
                  )}
                  {columns.guardianPhone && (
                    <td className="py-3 px-3 text-[#64748B] font-mono">{s.guardianPhone || 'N/A'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

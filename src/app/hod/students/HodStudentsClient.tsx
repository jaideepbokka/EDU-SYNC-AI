'use client'

import React, { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Phone,
  Mail,
  User,
  ExternalLink,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'

interface HodStudentsClientProps {
  students: any[]
}

export function HodStudentsClient({ students }: HodStudentsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [feeFilter, setFeeFilter] = useState('ALL')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const filtered = students.filter((s) => {
    if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false
    const feeStatus = s.fee?.status || 'PAID'
    if (feeFilter !== 'ALL' && feeStatus !== feeFilter) return false

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matches =
        s.user.name.toLowerCase().includes(term) ||
        s.rollNo.toLowerCase().includes(term) ||
        s.registerNo.toLowerCase().includes(term) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(term))
      if (!matches) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9EFEA] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#0D9488]" />
            <span>CSE Department Student Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
            Complete institutional roster of enrolled engineering students, fee remittances, and academic standing
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-black shrink-0">
          Total Enrolled: {students.length} Students
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#D9EFEA] bg-white text-[#134E4A] placeholder:text-gray-400 focus:outline-hidden focus:border-[#0D9488]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#D9EFEA] bg-white font-bold text-[#1E293B]"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#D9EFEA] bg-white font-bold text-[#1E293B]"
          >
            <option value="ALL">All Fee Status</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partial Dues</option>
            <option value="DUE">Outstanding Due</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-[#D9EFEA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4FBF9] text-[#0F766E] border-b border-[#D9EFEA] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Roll & Reg No</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Sec / Batch</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4">Fees Details (Min ₹55K)</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-center">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((student) => {
                const fee = student.fee
                const totalFee = fee?.totalFee || 55000
                const paid = fee?.paidAmount || 55000
                const due = fee?.dueAmount || 0
                const isPaid = due <= 0

                return (
                  <tr key={student.id} className="hover:bg-teal-50/20 transition-colors">
                    {/* Roll / Reg */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[#1E293B] block">#{student.rollNo}</span>
                      <span className="text-[10px] text-[#64748B]">{student.registerNo}</span>
                    </td>

                    {/* Name & Email */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1E293B] block">{student.user.name}</span>
                      <span className="text-[11px] text-[#64748B]">{student.user.email}</span>
                    </td>

                    {/* Section */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#0D9488]">Sec {student.section}</span>
                      <span className="text-[10px] text-[#64748B] block">Sem {student.currentSemester}</span>
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black ${
                          student.attendancePercentage >= 75
                            ? 'text-emerald-600'
                            : 'text-rose-600 font-black'
                        }`}
                      >
                        {student.attendancePercentage}%
                      </span>
                    </td>

                    {/* CGPA */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#1E293B]">
                      {student.currentCgpa.toFixed(2)}
                    </td>

                    {/* Fees Details */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1E293B]">
                          ₹{paid.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#64748B]">/ ₹{totalFee.toLocaleString('en-IN')}</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-black uppercase mt-0.5 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : fee?.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPaid ? 'Paid' : `Due ₹${due.toLocaleString('en-IN')}`}
                      </span>
                    </td>

                    {/* Guardian */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="font-bold text-[#1E293B] block">
                        {student.guardianName || 'N/A'}
                      </span>
                      <span className="text-[#64748B] font-mono">
                        {student.guardianPhone || 'N/A'}
                      </span>
                    </td>

                    {/* View Profile */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0D9488] font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D9EFEA] space-y-5 animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D9488] font-black flex items-center justify-center">
                  {selectedStudent.user.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E293B]">{selectedStudent.user.name}</h3>
                  <p className="text-xs text-[#64748B]">Roll No: {selectedStudent.rollNo} • {selectedStudent.registerNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-1.5">
                <p className="font-bold text-[#0F766E] uppercase tracking-wider text-[10px]">
                  Institutional Fee Clearance Ledger
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Minimum Prescribed Fee:</span>
                    <strong className="text-[#1E293B]">₹55,000.00</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Total Assessment:</span>
                    <strong className="text-[#1E293B]">₹{(selectedStudent.fee?.totalFee || 55000).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Amount Cleared:</span>
                    <strong className="text-emerald-700">₹{(selectedStudent.fee?.paidAmount || 55000).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Outstanding Balance:</span>
                    <strong className={(selectedStudent.fee?.dueAmount || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      ₹{(selectedStudent.fee?.dueAmount || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
                <p className="text-[10px] text-[#64748B] font-mono mt-1">
                  Receipt Ref: {selectedStudent.fee?.paymentReference || 'BVC-FEE-2026-0101'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Attendance Rate</span>
                  <p className="text-lg font-black text-emerald-600">{selectedStudent.attendancePercentage}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Current CGPA</span>
                  <p className="text-lg font-black text-[#1E293B] font-mono">{selectedStudent.currentCgpa.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Batch / Semester:</span>
                  <span className="font-bold text-[#1E293B]">{selectedStudent.batch} (Sem {selectedStudent.currentSemester})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Assigned Section:</span>
                  <span className="font-bold text-[#0D9488]">Section {selectedStudent.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Guardian Name:</span>
                  <span className="font-bold text-[#1E293B]">{selectedStudent.guardianName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Guardian Phone:</span>
                  <span className="font-bold text-[#1E293B]">{selectedStudent.guardianPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Academic Risk Level:</span>
                  <span className="font-bold text-[#1E293B]">{selectedStudent.riskLevel}</span>
                </div>
                {selectedStudent.advisorNotes && (
                  <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                    <span className="text-[#64748B] text-[10px] uppercase font-bold">Academic Status & Admission:</span>
                    <span className="font-semibold text-[#0F766E] bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                      {selectedStudent.advisorNotes}
                    </span>
                  </div>
                )}
                {selectedStudent.address && (
                  <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                    <span className="text-[#64748B] text-[10px] uppercase font-bold">Permanent Address:</span>
                    <span className="text-[#1E293B] bg-slate-50 p-2 rounded-lg border border-slate-200 leading-relaxed text-[11px]">
                      {selectedStudent.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

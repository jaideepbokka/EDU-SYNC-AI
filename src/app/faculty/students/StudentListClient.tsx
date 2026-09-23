'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DataTable, Column } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import {
  Users,
  UserPlus,
  ArrowRight,
  Filter,
  Eye,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react'

interface StudentData {
  id: string
  rollNo: string
  registerNo: string
  section: string
  currentSemester: number
  attendancePercentage: number
  currentCgpa: number
  riskLevel: string
  riskScore: number
  guardianName?: string | null
  guardianPhone?: string | null
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}

interface StudentListClientProps {
  initialStudents: StudentData[]
}

export function StudentListClient({ initialStudents }: StudentListClientProps) {
  const router = useRouter()
  const [students, setStudents] = useState<StudentData[]>(initialStudents)
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    registerNo: '',
    section: 'A',
    currentSemester: 5,
    guardianName: '',
    guardianPhone: '',
    studentPhone: '',
    address: '',
  })

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedRisk !== 'ALL' && s.riskLevel !== selectedRisk) return false
    if (selectedSection !== 'ALL' && s.section !== selectedSection) return false
    return true
  })

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create student')
      }

      const newStudent = await res.json()
      setStudents((prev) => [...prev, newStudent])
      setIsAddModalOpen(false)
      setFormData({
        name: '',
        email: '',
        rollNo: '',
        registerNo: '',
        section: 'A',
        currentSemester: 5,
        guardianName: '',
        guardianPhone: '',
        studentPhone: '',
        address: '',
      })
      router.refresh()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (id: string, name: string, rollNo: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete student "${name}" (${rollNo})?\n\nThis will permanently remove the student dossier, attendance records, quiz attempts, and evaluation history.`
    )
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete student')

      // Optimistically remove from state
      setStudents((prev) => prev.filter((s) => s.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete student')
    } finally {
      setDeletingId(null)
    }
  }

  const columns: Column<StudentData>[] = [
    {
      header: 'Student Information',
      accessorKey: 'rollNo',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#151718] border border-[#383C3F] overflow-hidden font-bold flex items-center justify-center text-xs text-[#FFF3C8] shrink-0">
            {row.user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.user.avatar} alt={row.user.name} className="w-full h-full object-cover" />
            ) : (
              row.user.name.charAt(0)
            )}
          </div>
          <div>
            <Link
              href={`/faculty/students/${row.id}`}
              className="font-bold text-[#FCFBF7] hover:text-[#FFF3C8] hover:underline text-xs flex items-center gap-1.5"
            >
              <span>{row.user.name}</span>
            </Link>
            <p className="text-[11px] text-[#A8ACAF]">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Roll / Reg No',
      accessorKey: 'rollNo',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-[#FCFBF7]">{row.rollNo}</span>
          <p className="text-[10px] text-[#A8ACAF] font-mono">{row.registerNo}</p>
        </div>
      ),
    },
    {
      header: 'Class / Sec',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-lg bg-[#151718] border border-[#383C3F] text-[11px] font-semibold text-[#D8D4CA]">
          Sem {row.currentSemester} - {row.section}
        </span>
      ),
    },
    {
      header: 'Attendance %',
      accessorKey: 'attendancePercentage',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-bold text-xs ${
              row.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {row.attendancePercentage}%
          </span>
          {row.attendancePercentage < 75 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
      ),
    },
    {
      header: 'CGPA',
      accessorKey: 'currentCgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#E5CB90]">{row.currentCgpa.toFixed(2)}</span>
      ),
    },
    {
      header: 'Risk Diagnostic',
      accessorKey: 'riskLevel',
      sortable: true,
      cell: (row) => <StatusBadge status={row.riskLevel} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/faculty/students/${row.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#383C3F] bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => handleDeleteStudent(row.id, row.user.name, row.rollNo)}
            disabled={deletingId === row.id}
            title={`Delete ${row.user.name}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deletingId === row.id ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Student Academic Dossiers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#E5CB90]" />
            <span>Student Management Directory</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Access holistic student academic dossiers, attendance tracking, diagnostic risk indicators, and mentor notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[#222527] border border-[#383C3F] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A8ACAF] pl-2">
          <Filter className="w-4 h-4 text-[#E5CB90]" />
          <span>Filters:</span>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-1.5 bg-[#151718] p-1 rounded-xl border border-[#383C3F]">
          {['ALL', 'A', 'B'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedSection === sec
                  ? 'bg-[#222527] text-[#FFF3C8] border border-[#E5CB90]/40 shadow-xs'
                  : 'text-[#A8ACAF] hover:text-[#FCFBF7]'
              }`}
            >
              {sec === 'ALL' ? 'All Sections' : `Sec ${sec}`}
            </button>
          ))}
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5 bg-[#151718] p-1 rounded-xl border border-[#383C3F] overflow-x-auto">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedRisk(lvl)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRisk === lvl
                  ? 'bg-[#222527] text-[#FFF3C8] border border-[#E5CB90]/40 shadow-xs'
                  : 'text-[#A8ACAF] hover:text-[#FCFBF7]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        searchKey="rollNo"
        searchPlaceholder="Search by roll number or student name..."
        pageSize={10}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student"
        description="Register a student into the academic database and enroll into semester course offerings."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/30">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maya Krishnan"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya.k@edusync.edu"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Class Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="e.g. 23CS11"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                University Register No *
              </label>
              <input
                type="text"
                required
                value={formData.registerNo}
                onChange={(e) => setFormData({ ...formData, registerNo: e.target.value })}
                placeholder="e.g. REG2023011"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              >
                <option value="A" className="bg-[#151718]">Section A</option>
                <option value="B" className="bg-[#151718]">Section B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Semester
              </label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s} className="bg-[#151718]">
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Batch
              </label>
              <input
                type="text"
                disabled
                value="2023-2027"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718]/60 p-2.5 text-[#A8ACAF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent or Guardian"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Guardian Phone
              </label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] p-2.5 text-[#FCFBF7] focus:border-[#E5CB90]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#383C3F]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

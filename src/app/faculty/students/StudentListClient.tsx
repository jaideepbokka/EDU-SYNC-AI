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
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (id: string, name: string, rollNo: string) => {
    // Optimistic removal for instant UI feedback
    const previous = [...students]
    setStudents((prev) => prev.filter((s) => s.id !== id))

    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setStudents(previous)
        throw new Error(data.error || 'Failed to delete student')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete student')
    }
  }

  const columns: Column<StudentData>[] = [
    {
      header: 'Student Information',
      accessorKey: 'rollNo',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D9D1F5]/60 border border-[#D9D1F5] overflow-hidden font-bold flex items-center justify-center text-xs text-[#625BEB] shrink-0 shadow-xs">
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
              className="font-bold text-[#292C32] hover:text-[#8B6DE9] hover:underline text-xs flex items-center gap-1.5"
            >
              <span>{row.user.name}</span>
            </Link>
            <p className="text-[11px] text-[#85878F]">{row.user.email}</p>
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
          <span className="font-mono font-bold text-[#292C32]">{row.rollNo}</span>
          <p className="text-[10px] text-[#85878F] font-mono">{row.registerNo}</p>
        </div>
      ),
    },
    {
      header: 'Class / Sec',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[11px] font-semibold text-[#292C32]">
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
              row.attendancePercentage >= 75 ? 'text-[#35C979]' : 'text-rose-600'
            }`}
          >
            {row.attendancePercentage}%
          </span>
          {row.attendancePercentage < 75 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
      ),
    },
    {
      header: 'CGPA',
      accessorKey: 'currentCgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#625BEB]">{row.currentCgpa.toFixed(2)}</span>
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] text-xs font-bold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#8B6DE9]" />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => handleDeleteStudent(row.id, row.user.name, row.rollNo)}
            disabled={deletingId === row.id}
            title={`Delete ${row.user.name}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deletingId === row.id ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Student Academic Dossiers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-white" />
            <span>Student Management Directory</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Access holistic student academic dossiers, attendance tracking, diagnostic risk indicators, and mentor notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-3xl bg-white border border-[#E9EAF0] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#292C32] pl-2">
          <Filter className="w-4 h-4 text-[#8B6DE9]" />
          <span>Filters:</span>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-1.5 bg-[#F2F3F5] p-1 rounded-xl border border-[#E9EAF0]">
          {['ALL', 'A', 'B', 'C'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedSection === sec
                  ? 'bg-[#292C32] text-white font-bold shadow-xs'
                  : 'text-[#85878F] hover:text-[#292C32]'
              }`}
            >
              {sec === 'ALL' ? 'All Sections' : `Sec ${sec}`}
            </button>
          ))}
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5 bg-[#F2F3F5] p-1 rounded-xl border border-[#E9EAF0] overflow-x-auto">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedRisk(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRisk === lvl
                  ? 'bg-[#292C32] text-white font-bold shadow-xs'
                  : 'text-[#85878F] hover:text-[#292C32]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs font-semibold text-[#85878F] pr-2">
          Total <strong>{filteredStudents.length}</strong> students enrolled
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
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maya Krishnan"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya.k@edusync.edu"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Class Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="e.g. 23CS11"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                University Register No *
              </label>
              <input
                type="text"
                required
                value={formData.registerNo}
                onChange={(e) => setFormData({ ...formData, registerNo: e.target.value })}
                placeholder="e.g. REG2023011"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden cursor-pointer"
              >
                <option value="A" className="bg-white text-[#292C32]">Section A</option>
                <option value="B" className="bg-white text-[#292C32]">Section B</option>
                <option value="C" className="bg-white text-[#292C32]">Section C</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Semester
              </label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s} className="bg-white text-[#292C32]">
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Batch
              </label>
              <input
                type="text"
                disabled
                value="2023-2027"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#85878F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent or Guardian"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Guardian Phone
              </label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 text-[#292C32] placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {isSubmitting ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

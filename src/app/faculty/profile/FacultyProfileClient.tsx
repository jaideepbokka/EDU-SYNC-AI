'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Edit3,
  CheckCircle2,
  X,
  Sparkles,
  Building2,
  Shield,
  Save,
} from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
}

interface FacultyProfileClientProps {
  initialUser: any
  initialFaculty: any
  departments: Department[]
}

export function FacultyProfileClient({
  initialUser,
  initialFaculty,
  departments,
}: FacultyProfileClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState(initialUser)
  const [faculty, setFaculty] = useState(initialFaculty)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-open modal if ?edit=true was passed
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditModalOpen(true)
    }
  }, [searchParams])

  // Edit Form State
  const [formData, setFormData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    departmentId: initialFaculty?.departmentId || departments[0]?.id || '',
    customDepartmentName: '',
    designation: initialFaculty?.designation || 'Professor & Head of Department',
    phone: initialFaculty?.phone || '+91 98450 12345',
    cabinNumber: initialFaculty?.cabinNumber || 'LH-301 (Academic Block A)',
    cabinHours: initialFaculty?.cabinHours || 'Mon-Thu: 03:00 PM - 05:00 PM',
    avatar: initialUser?.avatar || '',
  })

  // Sync state when props change
  useEffect(() => {
    setUser(initialUser)
    setFaculty(initialFaculty)
    setFormData({
      name: initialUser?.name || '',
      email: initialUser?.email || '',
      departmentId: initialFaculty?.departmentId || departments[0]?.id || '',
      customDepartmentName: '',
      designation: initialFaculty?.designation || 'Professor & Head of Department',
      phone: initialFaculty?.phone || '+91 98450 12345',
      cabinNumber: initialFaculty?.cabinNumber || 'LH-301 (Academic Block A)',
      cabinHours: initialFaculty?.cabinHours || 'Mon-Thu: 03:00 PM - 05:00 PM',
      avatar: initialUser?.avatar || '',
    })
  }, [initialUser, initialFaculty, departments])

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        phone: formData.phone,
        cabinNumber: formData.cabinNumber,
        cabinHours: formData.cabinHours,
        avatar: formData.avatar,
      }

      if (formData.departmentId === 'NEW') {
        if (!formData.customDepartmentName.trim()) {
          throw new Error('Please enter your new department name.')
        }
        payload.departmentName = formData.customDepartmentName.trim()
      } else {
        payload.departmentId = formData.departmentId
      }

      const res = await fetch('/api/faculty/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update personal details.')
      }

      setUser(data.user)
      setFaculty(data.faculty)
      setSuccessMessage('Your personal details have been updated and saved successfully!')
      setIsEditModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Faculty Self-Service • Personal Academic Dossier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#E5CB90]" />
            <span>Faculty Profile & Personal Details</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Manage your personal identity, departmental affiliation, official communication channels, and consultation hours.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditModalOpen(true)
            setSuccessMessage(null)
            setErrorMessage(null)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Personal Details</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#E5CB90]/15 border border-[#E5CB90]/40 flex items-center justify-between text-xs text-[#FFF3C8] animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#E5CB90] shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 rounded-lg text-[#A8ACAF] hover:text-[#FFF3C8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Dossier Card */}
      <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5CB90]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#151718] border-2 border-[#E5CB90]/50 flex items-center justify-center font-black text-3xl text-[#E5CB90] shrink-0 shadow-lg shadow-[#E5CB90]/10">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'F'}</span>
            )}
          </div>

          {/* Core Info */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black text-[#FCFBF7]">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-xs border border-[#E5CB90]/30">
                {faculty?.employeeId || 'FAC201201'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Faculty
              </span>
            </div>

            <p className="text-sm font-bold text-[#E5CB90]">
              {faculty?.designation || 'Professor & Head of Department'}
            </p>

            <p className="text-xs text-[#A8ACAF] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#E5CB90]" />
              <span>Department of {faculty?.department?.name || 'Computer Science and Engineering'}</span>
              <span className="font-mono text-[#FFF3C8] font-bold">({faculty?.department?.code || 'CSE'})</span>
            </p>
          </div>
        </div>

        {/* Quick Edit Action Button */}
        <button
          onClick={() => {
            setIsEditModalOpen(true)
            setSuccessMessage(null)
          }}
          className="relative z-10 px-4 py-2 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] border border-[#383C3F] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#E5CB90]" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Details Grid: Cabin, Communication, Department Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Cabin & Consultation */}
        <div className="rounded-2xl bg-[#222527] border border-[#383C3F] p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#FCFBF7] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E5CB90]" />
              <span>Cabin & Office Location</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#151718] text-[#A8ACAF] border border-[#383C3F]">
              Campus
            </span>
          </div>
          <p className="text-[#FCFBF7] font-semibold text-sm">
            {faculty?.cabinNumber || 'LH-301 (Academic Block A)'}
          </p>
          <div className="pt-2 border-t border-[#383C3F] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A8ACAF]">Consultation Hours:</span>
            <p className="text-[#FFF3C8] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#E5CB90] shrink-0" />
              <span>{faculty?.cabinHours || 'Mon-Thu: 03:00 PM - 05:00 PM'}</span>
            </p>
          </div>
        </div>

        {/* Official Communication */}
        <div className="rounded-2xl bg-[#222527] border border-[#383C3F] p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#FCFBF7] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E5CB90]" />
              <span>Official Communication</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#151718] text-[#A8ACAF] border border-[#383C3F]">
              Direct
            </span>
          </div>
          <p className="text-[#FCFBF7] font-semibold truncate text-sm">{user?.email}</p>
          <div className="pt-2 border-t border-[#383C3F] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A8ACAF]">Faculty Contact:</span>
            <p className="text-[#FFF3C8] flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#E5CB90] shrink-0" />
              <span>{faculty?.phone || '+91 98450 12345'}</span>
            </p>
          </div>
        </div>

        {/* Department & Compliance */}
        <div className="rounded-2xl bg-[#222527] border border-[#383C3F] p-5 shadow-xs space-y-3 text-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#FCFBF7] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#E5CB90]" />
              <span>Departmental Appointment</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#151718] text-[#A8ACAF] border border-[#383C3F]">
              Unit
            </span>
          </div>
          <p className="text-[#FCFBF7] font-semibold text-sm">
            {faculty?.department?.name || 'Computer Science and Engineering'}
          </p>
          <div className="pt-2 border-t border-[#383C3F] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A8ACAF]">Department Code:</span>
            <p className="text-[#FFF3C8] font-mono font-bold">
              {faculty?.department?.code || 'CSE'}
            </p>
          </div>
        </div>
      </div>

      {/* Teaching Offerings */}
      <div className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#FCFBF7] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#E5CB90]" />
            <span>Assigned Course Offerings This Semester</span>
          </h3>
          <span className="text-xs font-semibold text-[#A8ACAF]">
            {faculty?.offerings?.length || 0} Courses Active
          </span>
        </div>

        <div className="divide-y divide-[#383C3F]">
          {faculty?.offerings && faculty.offerings.length > 0 ? (
            faculty.offerings.map((off: any) => (
              <div key={off.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-[11px]">
                      {off.subject.code}
                    </span>
                    <span className="font-bold text-[#FCFBF7]">{off.subject.name}</span>
                  </div>
                  <p className="text-[11px] text-[#A8ACAF] mt-1">
                    Section {off.section} • Semester {off.semester} • {off.subject.credits} Credits
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#151718] border border-[#383C3F] font-semibold text-[#D8D4CA] text-xs self-start sm:self-center">
                  {off.enrollments?.length || 0} Students Enrolled
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#A8ACAF] py-4">No course offerings assigned currently.</p>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Interactive "Edit Personal Details" Modal */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#222527] rounded-3xl border border-[#383C3F] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#383C3F] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E5CB90]/20 text-[#E5CB90]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FCFBF7]">
                    Edit Faculty Personal Details
                  </h3>
                  <p className="text-xs text-[#A8ACAF]">
                    Update your name, academic department, title, and consultation coordinates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-[#A8ACAF] hover:text-[#FCFBF7] hover:bg-[#151718] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#D8D4CA]">
                    Full Name & Title <span className="text-[#E5CB90]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Arvind Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90] focus:ring-1 focus:ring-[#E5CB90]"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#D8D4CA]">
                    Academic Department <span className="text-[#E5CB90]">*</span>
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs focus:outline-hidden focus:border-[#E5CB90] focus:ring-1 focus:ring-[#E5CB90]"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-[#151718] text-[#FCFBF7]">
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                    <option value="NEW" className="bg-[#151718] text-[#E5CB90]">
                      + Add / Specify Other Department...
                    </option>
                  </select>
                </div>

                {/* Custom Department Name (if selected NEW) */}
                {formData.departmentId === 'NEW' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#E5CB90]">
                      New Department Name <span className="text-[#E5CB90]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customDepartmentName}
                      onChange={(e) => setFormData({ ...formData, customDepartmentName: e.target.value })}
                      placeholder="e.g. Artificial Intelligence & Data Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#E5CB90] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72]"
                    />
                  </div>
                )}

                {/* Academic Designation */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#D8D4CA]">
                    Academic Designation / Rank <span className="text-[#E5CB90]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Professor & Head of Department"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
                  />
                </div>

                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#D8D4CA]">Official Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@edusync.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#D8D4CA]">Contact Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
                  />
                </div>

                {/* Cabin Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#D8D4CA]">Cabin / Room Location</label>
                  <input
                    type="text"
                    value={formData.cabinNumber}
                    onChange={(e) => setFormData({ ...formData, cabinNumber: e.target.value })}
                    placeholder="e.g. LH-301 (Academic Block A)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
                  />
                </div>

                {/* Cabin Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#D8D4CA]">Consultation Hours</label>
                  <input
                    type="text"
                    value={formData.cabinHours}
                    onChange={(e) => setFormData({ ...formData, cabinHours: e.target.value })}
                    placeholder="e.g. Mon-Thu: 03:00 PM - 05:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151718] border border-[#383C3F] text-[#FCFBF7] text-xs placeholder:text-[#6A6E72] focus:outline-hidden focus:border-[#E5CB90]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#383C3F] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/25 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Personal Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

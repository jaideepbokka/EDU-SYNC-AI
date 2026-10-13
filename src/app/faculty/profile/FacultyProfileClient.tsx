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
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D9D1F5]" />
            <span>Faculty Self-Service • Personal Academic Dossier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Faculty Profile & Personal Details
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Manage your personal identity, departmental affiliation, official communication channels, and consultation hours.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditModalOpen(true)
            setSuccessMessage(null)
            setErrorMessage(null)
          }}
          className="relative z-10 px-6 py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-lg shadow-[#292C32]/20 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Edit3 className="w-4 h-4 text-[#A99AE8]" />
          <span>Edit Personal Details</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#35C979] shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 rounded-lg text-[#35C979] hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Dossier Card */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-[#8B6DE9] to-[#625BEB] text-white flex items-center justify-center font-black text-3xl shrink-0 shadow-lg shadow-[#8B6DE9]/20">
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
              <h2 className="text-2xl font-black text-[#292C32]">{user?.name}</h2>
              <span className="px-3 py-1 rounded-full bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-xs border border-[#D9D1F5]">
                {faculty?.employeeId || 'FAC201201'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#35C979] font-bold text-[10px] border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35C979] animate-pulse" />
                Active Faculty
              </span>
            </div>

            <p className="text-sm font-bold text-[#8B6DE9]">
              {faculty?.designation || 'Professor & Head of Department'}
            </p>

            <p className="text-xs text-[#85878F] flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#8B6DE9]" />
              <span>Department of {faculty?.department?.name || 'Computer Science and Engineering'}</span>
              <span className="font-mono text-[#625BEB] font-bold">({faculty?.department?.code || 'CSE'})</span>
            </p>
          </div>
        </div>

        {/* Quick Edit Action Button */}
        <button
          onClick={() => {
            setIsEditModalOpen(true)
            setSuccessMessage(null)
          }}
          className="relative z-10 px-4 py-2.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#8B6DE9]" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Details Grid: Cabin, Communication, Department Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Cabin & Consultation */}
        <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#292C32] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8B6DE9]" />
              <span>Cabin & Office Location</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9D1F5]/40 text-[#625BEB] font-bold border border-[#D9D1F5]">
              Campus
            </span>
          </div>
          <p className="text-[#292C32] font-bold text-sm">
            {faculty?.cabinNumber || 'LH-301 (Academic Block A)'}
          </p>
          <div className="pt-3 border-t border-[#E9EAF0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#85878F]">Consultation Hours:</span>
            <p className="text-[#625BEB] flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#8B6DE9] shrink-0" />
              <span>{faculty?.cabinHours || 'Mon-Thu: 03:00 PM - 05:00 PM'}</span>
            </p>
          </div>
        </div>

        {/* Official Communication */}
        <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#292C32] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B6DE9]" />
              <span>Official Communication</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9D1F5]/40 text-[#625BEB] font-bold border border-[#D9D1F5]">
              Direct
            </span>
          </div>
          <p className="text-[#292C32] font-bold truncate text-sm">{user?.email}</p>
          <div className="pt-3 border-t border-[#E9EAF0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#85878F]">Faculty Contact:</span>
            <p className="text-[#625BEB] flex items-center gap-1.5 font-semibold">
              <Phone className="w-3.5 h-3.5 text-[#8B6DE9] shrink-0" />
              <span>{faculty?.phone || '+91 98450 12345'}</span>
            </p>
          </div>
        </div>

        {/* Department & Compliance */}
        <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-sm space-y-3 text-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#292C32] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#8B6DE9]" />
              <span>Departmental Appointment</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9D1F5]/40 text-[#625BEB] font-bold border border-[#D9D1F5]">
              Unit
            </span>
          </div>
          <p className="text-[#292C32] font-bold text-sm">
            {faculty?.department?.name || 'Computer Science and Engineering'}
          </p>
          <div className="pt-3 border-t border-[#E9EAF0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#85878F]">Department Code:</span>
            <p className="text-[#625BEB] font-mono font-bold">
              {faculty?.department?.code || 'CSE'}
            </p>
          </div>
        </div>
      </div>

      {/* Teaching Offerings */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-3">
          <h3 className="text-sm font-bold text-[#292C32] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8B6DE9]" />
            <span>Assigned Course Offerings This Semester</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0]">
            {faculty?.offerings?.length || 0} Courses Active
          </span>
        </div>

        <div className="divide-y divide-[#E9EAF0]">
          {faculty?.offerings && faculty.offerings.length > 0 ? (
            faculty.offerings.map((off: any) => (
              <div key={off.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-[11px] border border-[#D9D1F5]">
                      {off.subject.code}
                    </span>
                    <span className="font-bold text-[#292C32]">{off.subject.name}</span>
                  </div>
                  <p className="text-[11px] text-[#85878F] mt-1">
                    Section {off.section} • Semester {off.semester} • {off.subject.credits} Credits
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] font-semibold text-[#292C32] text-xs self-start sm:self-center">
                  {off.enrollments?.length || 0} Students Enrolled
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#85878F] py-4">No course offerings assigned currently.</p>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Interactive "Edit Personal Details" Modal */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292C32]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E9EAF0] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#D9D1F5]/40 text-[#625BEB] border border-[#D9D1F5]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292C32]">
                    Edit Faculty Personal Details
                  </h3>
                  <p className="text-xs text-[#85878F]">
                    Update your name, academic department, title, and consultation coordinates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-[#85878F] hover:text-[#292C32] hover:bg-[#F2F3F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#292C32]">
                    Full Name & Title <span className="text-[#8B6DE9]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Arvind Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#292C32]">
                    Academic Department <span className="text-[#8B6DE9]">*</span>
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9] cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-white">
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                    <option value="NEW" className="bg-white text-[#8B6DE9] font-bold">
                      + Add / Specify Other Department...
                    </option>
                  </select>
                </div>

                {/* Custom Department Name (if selected NEW) */}
                {formData.departmentId === 'NEW' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#8B6DE9]">
                      New Department Name <span className="text-[#8B6DE9]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customDepartmentName}
                      onChange={(e) => setFormData({ ...formData, customDepartmentName: e.target.value })}
                      placeholder="e.g. Artificial Intelligence & Data Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border-2 border-[#8B6DE9] text-[#292C32] text-xs placeholder:text-[#85878F]"
                    />
                  </div>
                )}

                {/* Academic Designation */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#292C32]">
                    Academic Designation / Rank <span className="text-[#8B6DE9]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Professor & Head of Department"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>

                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292C32]">Official Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@edusync.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292C32]">Contact Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>

                {/* Cabin Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292C32]">Cabin / Room Location</label>
                  <input
                    type="text"
                    value={formData.cabinNumber}
                    onChange={(e) => setFormData({ ...formData, cabinNumber: e.target.value })}
                    placeholder="e.g. LH-301 (Academic Block A)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>

                {/* Cabin Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292C32]">Consultation Hours</label>
                  <input
                    type="text"
                    value={formData.cabinHours}
                    onChange={(e) => setFormData({ ...formData, cabinHours: e.target.value })}
                    placeholder="e.g. Mon-Thu: 03:00 PM - 05:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-[#292C32] text-xs placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E9EAF0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md shadow-[#292C32]/10 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
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

'use client'

import React, { useState } from 'react'
import {
  UserPlus,
  Power,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  X,
  AlertTriangle,
  Search,
  BookOpen,
} from 'lucide-react'

interface HodFacultyClientProps {
  initialFaculty: any[]
  availableSubjects: any[]
}

export function HodFacultyClient({
  initialFaculty,
  availableSubjects,
}: HodFacultyClientProps) {
  const [facultyList, setFacultyList] = useState(initialFaculty)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'OFF'>('ALL')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add Faculty Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    designation: 'Assistant Professor',
    phone: '',
    cabinNumber: '',
    status: 'ACTIVE',
  })

  // Edit Faculty Form State
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    designation: '',
    phone: '',
    cabinNumber: '',
    status: 'ACTIVE',
  })

  const showNotice = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Toggle Active / Off status
  const toggleStatus = async (faculty: any) => {
    const newStatus = faculty.status === 'ACTIVE' ? 'OFF' : 'ACTIVE'
    try {
      const res = await fetch('/api/hod/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: faculty.id,
          status: newStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status')

      setFacultyList((prev) =>
        prev.map((f) => (f.id === faculty.id ? { ...f, status: newStatus } : f))
      )
      showNotice(
        'success',
        `${faculty.user.name}'s status updated to ${newStatus === 'ACTIVE' ? 'Active' : 'Off'}.`
      )
    } catch (err: any) {
      showNotice('error', err.message || 'Status update error')
    }
  }

  // Handle Add Faculty Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/hod/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add faculty')

      setFacultyList((prev) => [data.faculty, ...prev])
      setAddModalOpen(false)
      setAddForm({
        name: '',
        email: '',
        employeeId: '',
        designation: 'Assistant Professor',
        phone: '',
        cabinNumber: '',
        status: 'ACTIVE',
      })
      showNotice('success', `Faculty member ${data.faculty.user.name} added successfully!`)
    } catch (err: any) {
      showNotice('error', err.message || 'Error creating faculty')
    } finally {
      setLoading(false)
    }
  }

  // Handle Edit Faculty
  const openEditModal = (faculty: any) => {
    setSelectedFaculty(faculty)
    setEditForm({
      id: faculty.id,
      name: faculty.user.name,
      designation: faculty.designation,
      phone: faculty.phone || '',
      cabinNumber: faculty.cabinNumber || '',
      status: faculty.status || 'ACTIVE',
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/hod/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: editForm.id,
          name: editForm.name,
          designation: editForm.designation,
          phone: editForm.phone,
          cabinNumber: editForm.cabinNumber,
          status: editForm.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update details')

      setFacultyList((prev) =>
        prev.map((f) => (f.id === editForm.id ? data.faculty : f))
      )
      setEditModalOpen(false)
      showNotice('success', `Updated details for ${editForm.name}.`)
    } catch (err: any) {
      showNotice('error', err.message || 'Error updating faculty')
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete Faculty
  const handleDelete = async (faculty: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete faculty member "${faculty.user.name}" (${faculty.employeeId})? This will remove all their course offerings.`
    )
    if (!confirmDelete) return

    try {
      const res = await fetch(`/api/hod/faculty?id=${faculty.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete faculty')

      setFacultyList((prev) => prev.filter((f) => f.id !== faculty.id))
      showNotice('success', `Faculty member ${faculty.user.name} was successfully removed.`)
    } catch (err: any) {
      showNotice('error', err.message || 'Error deleting faculty')
    }
  }

  // Filtered Faculty
  const filtered = facultyList.filter((f) => {
    const matchesSearch =
      f.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Main Heading matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9EFEA] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight">
            Faculty & Teaching Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
            EduSync AI • CSE Department Operations
          </p>
        </div>

        {/* Add Faculty Member Button matching screenshot teal pill */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-black shadow-md shadow-[#0D9488]/20 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Faculty Member</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#D9EFEA] bg-white text-[#134E4A] placeholder:text-gray-400 focus:outline-hidden focus:border-[#0D9488] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#D9EFEA] shadow-2xs w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'OFF'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#14B8A6] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0D9488]'
              }`}
            >
              {status === 'ALL' ? 'All Staff' : status === 'ACTIVE' ? 'Active Only' : 'Off Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid - EXACT MATCH TO USER'S SCREENSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((faculty) => {
          const isActive = faculty.status === 'ACTIVE'

          return (
            <div
              key={faculty.id}
              className="bg-white rounded-2xl border border-[#D9EFEA] p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Top: Name, Designation, Status Badge, Edit & Delete Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-[#1E293B] truncate leading-tight">
                      {faculty.user.name}
                    </h3>
                    <p className="text-xs font-bold text-[#0D9488] mt-0.5">
                      {faculty.designation}
                    </p>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5 truncate">
                      {faculty.user.email}
                    </p>
                  </div>

                  {/* Actions: Power Status Toggle, Edit, Delete (matching reference screenshot) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Status Button: (Power icon) Active / Off */}
                    <button
                      onClick={() => toggleStatus(faculty)}
                      title={`Click to change status to ${isActive ? 'Off' : 'Active'}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border transition-all cursor-pointer ${
                        isActive
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
                          : 'border-slate-300 text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      <Power className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{isActive ? 'Active' : 'Off'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(faculty)}
                      title="Edit Faculty Details"
                      className="p-1.5 rounded-lg border border-teal-200 text-[#0D9488] bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Trash Button */}
                    <button
                      onClick={() => handleDelete(faculty)}
                      title="Delete Faculty Member"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TEACHING WORKLOAD & ASSIGNMENTS SECTION (matching screenshot) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                    TEACHING WORKLOAD & ASSIGNMENTS:
                  </p>

                  {faculty.offerings && faculty.offerings.length > 0 ? (
                    <div className="space-y-1.5">
                      {faculty.offerings.map((offering: any) => (
                        <div
                          key={offering.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#F8FAFC] border border-slate-100"
                        >
                          <span className="font-bold text-[#1E293B]">
                            {offering.subject?.name || offering.subject?.code}
                          </span>
                          <span className="text-[11px] text-[#0D9488] font-bold">
                            {offering.semester ? `${Math.ceil(offering.semester / 2)}rd Year ` : ''}
                            Section {offering.section}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No teaching assignments currently designated.
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Contact Phone & CSE Department (matching screenshot) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1 font-medium">
                  Contact: <strong className="text-[#1E293B]">{faculty.phone || '+91 94401 23456'}</strong>
                </span>
                <span className="font-bold text-[#0D9488]">
                  CSE Department
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#D9EFEA] text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 text-[#0D9488] mx-auto opacity-40" />
          <p className="text-sm font-bold text-[#1E293B]">No faculty members found</p>
          <p className="text-xs">Try adjusting your search criteria or add a new faculty member above.</p>
        </div>
      )}

      {/* Add Faculty Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D9EFEA] space-y-5 animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E293B]">Add New Faculty Member</h3>
                  <p className="text-[11px] text-[#64748B]">Register faculty to EduSync AI CSE Department</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Srinivasa Rao"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC205"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Designation *</label>
                  <select
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. srinivasarao.k@bvcgroup.in"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94401 23456"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Cabin / Lab Room</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE-Cabin-104"
                    value={addForm.cabinNumber}
                    onChange={(e) => setAddForm({ ...addForm, cabinNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Initial Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={addForm.status === 'ACTIVE'}
                      onChange={() => setAddForm({ ...addForm, status: 'ACTIVE' })}
                      className="accent-[#0D9488]"
                    />
                    <span className="font-bold text-emerald-700">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={addForm.status === 'OFF'}
                      onChange={() => setAddForm({ ...addForm, status: 'OFF' })}
                      className="accent-[#0D9488]"
                    />
                    <span className="font-bold text-slate-500">Off / On Leave</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D9EFEA] space-y-5 animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1E293B]">Edit Faculty Details</h3>
                <p className="text-[11px] text-[#64748B]">Update profile information & status</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Designation</label>
                <select
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Cabin Number</label>
                  <input
                    type="text"
                    value={editForm.cabinNumber}
                    onChange={(e) => setEditForm({ ...editForm, cabinNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Activity Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={editForm.status === 'ACTIVE'}
                      onChange={() => setEditForm({ ...editForm, status: 'ACTIVE' })}
                      className="accent-[#0D9488]"
                    />
                    <span className="font-bold text-emerald-700">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={editForm.status === 'OFF'}
                      onChange={() => setEditForm({ ...editForm, status: 'OFF' })}
                      className="accent-[#0D9488]"
                    />
                    <span className="font-bold text-slate-500">Off / On Leave</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

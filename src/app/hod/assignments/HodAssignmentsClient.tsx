'use client'

import React, { useState } from 'react'
import {
  Settings,
  Plus,
  Trash2,
  BookOpen,
  UserCheck,
  Building,
  CheckCircle2,
  X,
  AlertTriangle,
  Search,
  Layers,
} from 'lucide-react'

interface HodAssignmentsClientProps {
  initialOfferings: any[]
  facultyList: any[]
  subjectList: any[]
}

export function HodAssignmentsClient({
  initialOfferings,
  facultyList,
  subjectList,
}: HodAssignmentsClientProps) {
  const [offerings, setOfferings] = useState(initialOfferings)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL')

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    facultyId: facultyList[0]?.id || '',
    subjectId: subjectList[0]?.id || '',
    academicYear: '2025-2026',
    semester: 5,
    section: 'A',
  })

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 4000)
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/hod/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign subject')

      setOfferings((prev) => [data.offering, ...prev])
      setAssignModalOpen(false)
      showNotice('success', data.message || 'Subject assigned successfully!')
    } catch (err: any) {
      showNotice('error', err.message || 'Error creating assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async (offering: any) => {
    const confirmRemove = window.confirm(
      `Remove assignment of "${offering.subject?.name}" from ${offering.faculty?.user?.name} (Sec ${offering.section})?`
    )
    if (!confirmRemove) return

    try {
      const res = await fetch(`/api/hod/assignments?id=${offering.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove assignment')

      setOfferings((prev) => prev.filter((o) => o.id !== offering.id))
      showNotice('success', 'Teaching assignment removed successfully.')
    } catch (err: any) {
      showNotice('error', err.message || 'Error removing assignment')
    }
  }

  const filtered = offerings.filter((o) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      o.subject?.name.toLowerCase().includes(term) ||
      o.subject?.code.toLowerCase().includes(term) ||
      o.faculty?.user?.name.toLowerCase().includes(term) ||
      o.section.toLowerCase().includes(term)

    if (!matchesSearch) return false
    if (selectedSemester !== 'ALL' && String(o.semester) !== selectedSemester) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9EFEA] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#134E4A] tracking-tight">
            Academic Teaching Assignments
          </h1>
          <p className="text-xs sm:text-sm text-[#0D9488] font-medium mt-0.5">
            Assign curriculum subjects and manage teaching loads across CSE faculty members
          </p>
        </div>

        <button
          onClick={() => setAssignModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-black shadow-md shadow-[#0D9488]/20 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Assign New Subject</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs">
          <p className="text-xs text-[#64748B] font-bold">Total Curriculum Subjects</p>
          <p className="text-2xl font-black text-[#134E4A] mt-1">{subjectList.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs">
          <p className="text-xs text-[#64748B] font-bold">Active Teaching Offerings</p>
          <p className="text-2xl font-black text-[#0D9488] mt-1">{offerings.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#D9EFEA] shadow-xs">
          <p className="text-xs text-[#64748B] font-bold">Designated Faculty</p>
          <p className="text-2xl font-black text-[#1E293B] mt-1">{facultyList.length}</p>
        </div>
      </div>

      {/* Search & Semester filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subject, faculty or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#D9EFEA] bg-white text-[#134E4A] placeholder:text-gray-400 focus:outline-hidden focus:border-[#0D9488]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#D9EFEA] text-xs font-bold w-full sm:w-auto">
          {['ALL', '4', '5', '6'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedSemester === sem
                  ? 'bg-[#14B8A6] text-white'
                  : 'text-[#64748B] hover:text-[#0D9488]'
              }`}
            >
              {sem === 'ALL' ? 'All Semesters' : `Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#D9EFEA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4FBF9] text-[#0F766E] border-b border-[#D9EFEA] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Assigned Faculty</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Year & Section</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((offering) => (
                <tr key={offering.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D9488] font-mono font-black flex items-center justify-center shrink-0">
                        {offering.subject?.code}
                      </span>
                      <span>{offering.subject?.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0F766E]">
                    {offering.faculty?.user?.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {offering.faculty?.designation}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1E293B]">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0D9488] border border-teal-200">
                      {offering.semester ? `${Math.ceil(offering.semester / 2)}rd Year ` : ''}
                      Sec {offering.section}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {offering.academicYear}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleUnassign(offering)}
                      title="Unassign Subject"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No teaching assignments match the criteria.
          </div>
        )}
      </div>

      {/* Assign Subject Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#D9EFEA] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E293B]">Assign Subject to Faculty</h3>
                  <p className="text-[11px] text-[#64748B]">Designate teaching responsibility</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Select Faculty Member *</label>
                <select
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.user.name} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Select Subject *</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                >
                  {subjectList.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                  >
                    <option value={3}>Semester 3 (2nd Year)</option>
                    <option value={4}>Semester 4 (2nd Year)</option>
                    <option value={5}>Semester 5 (3rd Year)</option>
                    <option value={6}>Semester 6 (3rd Year)</option>
                    <option value={7}>Semester 7 (4th Year)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden bg-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D9488] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

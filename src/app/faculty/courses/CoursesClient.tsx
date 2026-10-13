'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { Layers, Plus, Users, BookOpen, UserCheck, Calendar } from 'lucide-react'

interface CoursesClientProps {
  offerings: any[]
  subjects: any[]
}

export function CoursesClient({ offerings: initialOfferings, subjects }: CoursesClientProps) {
  const router = useRouter()
  const [offerings, setOfferings] = useState<any[]>(initialOfferings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOfferingForRoster, setSelectedOfferingForRoster] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || '',
    section: 'B',
    semester: 5,
    academicYear: '2025-2026',
  })
  const [loading, setLoading] = useState(false)

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to create offering')
      const newOffering = await res.json()
      if (newOffering) {
        setOfferings((prev) => [newOffering, ...prev])
      }
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#292C32] flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#8B6DE9]" />
            <span>Course Offerings & Section Capacity</span>
          </h1>
          <p className="text-xs text-[#85878F] mt-1">
            Section assignments, faculty allocation, academic session cohorts, and enrolled student rosters.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerings.map((off) => (
          <div
            key={off.id}
            className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs flex flex-col justify-between hover:border-[#A99AE8] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-xs border border-[#D9D1F5]">
                  {off.subject.code}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F2F3F5] text-[#292C32] font-bold text-xs">
                  Section {off.section}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#292C32] mt-3">
                {off.subject.name}
              </h3>
              <p className="text-xs text-[#85878F] mt-1">
                Faculty: <strong className="text-[#292C32]">{off.faculty.user.name}</strong> ({off.faculty.designation})
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] flex items-center justify-between text-xs">
                <span className="text-[#85878F]">Cohort Enrolled:</span>
                <span className="font-bold text-[#625BEB] font-mono">
                  {off.enrollments.length} Students
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9EAF0] flex items-center justify-between text-xs">
              <span className="text-[#85878F]">{off.academicYear}</span>
              <button
                onClick={() => setSelectedOfferingForRoster(off)}
                className="text-[#8B6DE9] font-bold hover:underline"
              >
                View Student Roster ({off.enrollments.length})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roster Modal */}
      {selectedOfferingForRoster && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOfferingForRoster(null)}
          title={`Enrolled Students: ${selectedOfferingForRoster.subject.code} (Sec ${selectedOfferingForRoster.section})`}
          maxWidth="md"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedOfferingForRoster.enrollments.map((enr: any) => (
              <div
                key={enr.id}
                className="p-3 rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#292C32]">
                    {enr.student.user.name}
                  </p>
                  <p className="text-[10px] text-[#85878F] font-mono">{enr.student.rollNo}</p>
                </div>
                <span className="text-xs font-semibold text-[#85878F]">
                  {enr.student.attendancePercentage}% Attendance
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Add Offering Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Course Section"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOffering} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Select Subject *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:border-[#8B6DE9] focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:border-[#8B6DE9] focus:outline-none"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Semester
              </label>
              <input
                type="number"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:border-[#8B6DE9] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-xs"
            >
              {loading ? 'Creating...' : 'Open Section'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import {
  BookOpen,
  Plus,
  GitFork,
  Users,
  Award,
  ArrowRight,
  Layers,
  GraduationCap,
  Trash2,
  Sparkles,
} from 'lucide-react'

interface SubjectsClientProps {
  subjects: any[]
}

export function SubjectsClient({ subjects: initialSubjects }: SubjectsClientProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>(initialSubjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setSubjects(initialSubjects)
  }, [initialSubjects])

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    semester: 5,
    description: '',
  })

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create subject')
      }
      const newSubject = await res.json()
      setSubjects((prev) => [newSubject, ...prev])
      setIsModalOpen(false)
      setFormData({ code: '', name: '', credits: 4, semester: 5, description: '' })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (id: string, code: string, name: string) => {
    // Optimistic removal
    const previous = [...subjects]
    setSubjects((prev) => prev.filter((s) => s.id !== id))

    try {
      const res = await fetch(`/api/subjects?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setSubjects(previous)
        throw new Error(data.error || 'Failed to delete course')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete course')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Academic Curriculum & Course Hierarchy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-white" />
            <span>Academic Subjects & Curriculum</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Configure core curriculum courses, credits allocation, and syllabus hierarchical units.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Subject</span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.length > 0 ? (
          subjects.map((sub) => {
            const totalEnrollments = sub.offerings?.reduce(
              (acc: number, off: any) => acc + (off.enrollments?.length || 0),
              0
            ) || 0

            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs flex flex-col justify-between hover:border-[#A99AE8] transition-colors group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-xs border border-[#D9D1F5]">
                      {sub.code}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0]">
                        {sub.credits} Credits • Sem {sub.semester}
                      </span>

                      {/* Delete Option */}
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.code, sub.name)}
                        disabled={deletingId === sub.id}
                        title={`Delete course ${sub.code}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === sub.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#292C32] mt-3 group-hover:text-[#8B6DE9] transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-[#85878F] mt-1 line-clamp-2">
                    {sub.description || 'Core departmental curriculum.'}
                  </p>

                  {/* Units Count & Enrollments */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E9EAF0] text-xs">
                    <div className="flex items-center gap-2 text-[#85878F]">
                      <Layers className="w-4 h-4 text-[#8B6DE9]" />
                      <span>{sub.units?.length || 0} Syllabus Units</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#85878F]">
                      <Users className="w-4 h-4 text-[#8B6DE9]" />
                      <span>{totalEnrollments} Students Enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Links */}
                <div className="mt-5 pt-4 border-t border-[#E9EAF0] flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/faculty/syllabus?subjectId=${sub.id}`}
                    className="text-[#8B6DE9] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>View Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/faculty/quiz-generator"
                    className="px-3.5 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] font-bold transition-colors"
                  >
                    Generate AI Quiz
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-white border border-[#E9EAF0] space-y-3">
            <BookOpen className="w-10 h-10 text-[#85878F] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#292C32]">No curriculum subjects registered yet.</p>
            <p className="text-xs text-[#85878F]">
              Click &quot;+ Add New Subject&quot; above to add your first course offering.
            </p>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Academic Subject / Course"
        description="Register a new curriculum subject for syllabus mapping and examinations."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS504"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 uppercase font-mono focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Database Management Systems"
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Semester
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden cursor-pointer"
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
              Course Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief course objectives and prerequisite notes..."
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

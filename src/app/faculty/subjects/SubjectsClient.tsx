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
      setIsModalOpen(false)
      setFormData({ code: '', name: '', credits: 4, semester: 5, description: '' })
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (id: string, code: string, name: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete the course "${code} - ${name}"?\n\nThis will permanently remove this course, its syllabus units, and any assigned offerings.`
    )
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/subjects?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete course')

      // Optimistically remove from state
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete course')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Academic Curriculum & Course Hierarchy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#E5CB90]" />
            <span>Academic Subjects & Curriculum</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Configure core curriculum courses, credits allocation, and syllabus hierarchical units.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
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
                className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xl flex flex-col justify-between hover:border-[#E5CB90]/60 transition-colors group"
              >
                <div>
                  {/* Top Bar: Subject Code, Credits Pill & Delete Option */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-xs border border-[#E5CB90]/30">
                      {sub.code}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#151718] text-[#A8ACAF] border border-[#383C3F]">
                        {sub.credits} Credits • Sem {sub.semester}
                      </span>

                      {/* Delete Option for Course/Subject */}
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.code, sub.name)}
                        disabled={deletingId === sub.id}
                        title={`Delete course ${sub.code}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === sub.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#FCFBF7] mt-3 group-hover:text-[#FFF3C8] transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-[#A8ACAF] mt-1 line-clamp-2 leading-relaxed">
                    {sub.description || 'No description provided.'}
                  </p>

                  {/* Assigned Faculty Badge */}
                  {sub.offerings?.[0]?.faculty?.user?.name && (
                    <div className="mt-3 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]/80">
                      <div className="w-7 h-7 rounded-xl bg-[#E5CB90]/20 flex items-center justify-center text-[#E5CB90] shrink-0 border border-[#E5CB90]/30">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#A8ACAF] uppercase font-bold tracking-wide">
                          Assigned Faculty
                        </p>
                        <p className="text-xs font-bold text-[#FFF3C8] truncate">
                          {sub.offerings[0].faculty.user.name}{' '}
                          <span className="text-[10px] text-[#A8ACAF] font-normal">
                            ({sub.offerings[0].faculty.designation})
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#383C3F] text-center">
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Units</p>
                      <p className="text-sm font-bold text-[#FCFBF7] mt-0.5">
                        {sub.units?.length || 0} Units
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Enrolled</p>
                      <p className="text-sm font-bold text-[#FCFBF7] mt-0.5">
                        {totalEnrollments} Students
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Tests</p>
                      <p className="text-sm font-bold text-[#FCFBF7] mt-0.5">
                        {sub.assessments?.length || 0} Quizzes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#383C3F] flex items-center justify-between">
                  <Link
                    href="/faculty/syllabus"
                    className="text-xs font-bold text-[#E5CB90] hover:text-[#FFF3C8] hover:underline flex items-center gap-1.5"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Manage Syllabus Units</span>
                  </Link>

                  <Link
                    href="/faculty/quiz-generator"
                    className="px-3 py-1.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] border border-[#383C3F] text-xs font-semibold text-[#D8D4CA] hover:text-[#FCFBF7] transition-colors"
                  >
                    Create Assessment
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-[#222527] border border-[#383C3F] space-y-3">
            <BookOpen className="w-10 h-10 text-[#A8ACAF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#FCFBF7]">No academic courses found.</p>
            <p className="text-xs text-[#A8ACAF]">
              Click &quot;+ Add New Subject&quot; above to create a curriculum course.
            </p>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Academic Subject / Course"
        description="Define a new curriculum course for the department."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS505"
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                Credits
              </label>
              <select
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
              >
                {[1, 2, 3, 4, 5].map((c) => (
                  <option key={c} value={c} className="bg-[#151718]">
                    {c} Credits
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Distributed Cloud Computing"
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Syllabus scope and prerequisites..."
              className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import {
  Award,
  Plus,
  Clock,
  CheckCircle2,
  FileQuestion,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

interface AssessmentsClientProps {
  assessments: any[]
  subjects: any[]
  questions: any[]
}

export function AssessmentsClient({
  assessments: initialAssessments,
  subjects,
  questions,
}: AssessmentsClientProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<any[]>(initialAssessments)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setAssessments(initialAssessments)
  }, [initialAssessments])

  // Builder Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    type: 'QUIZ',
    durationMinutes: 30,
    totalMarks: 10,
    passMarks: 4,
    status: 'PUBLISHED',
    selectedQuestionIds: [] as string[],
  })

  const toggleQuestionSelection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(id)
        ? prev.selectedQuestionIds.filter((q) => q !== id)
        : [...prev.selectedQuestionIds, id],
    }))
  }

  const handleCreateAssessment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questionIds: formData.selectedQuestionIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create assessment')

      setIsBuilderOpen(false)
      setStep(1)
      setFormData({
        title: '',
        description: '',
        subjectId: subjects[0]?.id || '',
        type: 'QUIZ',
        durationMinutes: 30,
        totalMarks: 10,
        passMarks: 4,
        status: 'PUBLISHED',
        selectedQuestionIds: [],
      })
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssessment = async (id: string, title: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete the test "${title}"?\n\nThis will permanently delete the assessment and all student attempt data.`
    )
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/assessments?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete assessment')

      // Optimistically remove from state
      setAssessments((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete assessment')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Curriculum Evaluator • Multi-Question Bank</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#E5CB90]" />
            <span>Assessments & Examination Manager</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Build evaluative quizzes, mid-term examinations, and assignments with question bank mappings. Delete or manage previous tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/assessments"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] text-xs font-bold border border-[#383C3F] transition-colors"
          >
            <span>Student Quiz Portal ↗</span>
          </Link>
          <button
            onClick={() => {
              setIsBuilderOpen(true)
              setStep(1)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-lg shadow-[#E5CB90]/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.length > 0 ? (
          assessments.map((ass) => {
            const pendingAttempts = ass.attempts?.filter((a: any) => a.status === 'SUBMITTED') || []

            return (
              <div
                key={ass.id}
                className="rounded-3xl bg-[#222527] border border-[#383C3F] p-6 shadow-xl flex flex-col justify-between hover:border-[#E5CB90]/60 transition-colors relative"
              >
                <div>
                  {/* Top Bar with Subject, Status, and Delete Action */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#E5CB90]/20 text-[#FFF3C8] font-mono font-bold text-xs border border-[#E5CB90]/30">
                      {ass.subject?.code || 'CS501'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ass.status} />

                      {/* Delete Option for Previous Tests */}
                      <button
                        onClick={() => handleDeleteAssessment(ass.id, ass.title)}
                        disabled={deletingId === ass.id}
                        title={`Delete test "${ass.title}"`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === ass.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#FCFBF7] mt-3">
                    {ass.title}
                  </h3>
                  <p className="text-xs text-[#A8ACAF] mt-1 line-clamp-2">
                    {ass.description || 'Academic benchmark evaluation.'}
                  </p>

                  {/* Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#383C3F] text-center">
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Duration</p>
                      <p className="text-xs font-bold text-[#FCFBF7] mt-0.5">
                        {ass.durationMinutes} Mins
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Marks</p>
                      <p className="text-xs font-bold text-[#FCFBF7] mt-0.5">
                        {ass.totalMarks} (Pass {ass.passMarks})
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151718] border border-[#383C3F]">
                      <p className="text-[10px] text-[#A8ACAF] font-bold uppercase">Questions</p>
                      <p className="text-xs font-bold text-[#FCFBF7] mt-0.5">
                        {ass.assessmentQuestions?.length || 0} Items
                      </p>
                    </div>
                  </div>

                  {/* Attempts Count */}
                  <div className="mt-4 flex items-center justify-between text-xs text-[#A8ACAF]">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#E5CB90]" />
                      <span>{ass.attempts?.length || 0} Student Attempts</span>
                    </span>
                    {pendingAttempts.length > 0 && (
                      <span className="text-[#FFF3C8] font-bold px-2 py-0.5 rounded-md bg-[#E5CB90]/20 border border-[#E5CB90]/30">
                        {pendingAttempts.length} Pending Grading
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-[#383C3F] flex items-center justify-between">
                  <Link
                    href="/faculty/evaluation"
                    className="text-xs font-bold text-[#E5CB90] hover:text-[#FFF3C8] hover:underline flex items-center gap-1"
                  >
                    <span>Evaluation Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/faculty/quiz-analysis"
                    className="px-3 py-1.5 rounded-xl bg-[#151718] hover:bg-[#2E3235] text-[#D8D4CA] hover:text-[#FCFBF7] border border-[#383C3F] text-xs font-semibold transition-colors"
                  >
                    View Topic Analysis
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-[#222527] border border-[#383C3F] space-y-3">
            <Award className="w-10 h-10 text-[#A8ACAF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#FCFBF7]">No assessments created yet.</p>
            <p className="text-xs text-[#A8ACAF]">
              Click &quot;+ Create Assessment&quot; above to build your first examination or quiz.
            </p>
          </div>
        )}
      </div>

      {/* Multi-step Assessment Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Multi-Step Assessment Builder"
        description={`Step ${step} of 2: ${step === 1 ? 'General Information' : 'Attach Questions from Bank'}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#151718]">
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 2: Dynamic Programming & Matrix Chain Multiplication"
                  className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assessment scope, allowable tools, and grading criteria..."
                  className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 placeholder:text-[#6A6E72] focus:border-[#E5CB90]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D8D4CA] mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, passMarks: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#383C3F] bg-[#151718] text-[#FCFBF7] p-2.5 focus:border-[#E5CB90]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title) return alert('Title is required')
                    setStep(2)
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer"
                >
                  Next: Select Questions →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#D8D4CA]">
                  Select questions from the Question Bank ({formData.selectedQuestionIds.length} selected):
                </p>
                <Link
                  href="/faculty/quiz-generator"
                  target="_blank"
                  className="text-xs font-semibold text-[#E5CB90] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate More with AI</span>
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#383C3F] border border-[#383C3F] rounded-2xl p-2 bg-[#151718]">
                {questions.map((q) => {
                  const isSelected = formData.selectedQuestionIds.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl cursor-pointer flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-[#E5CB90]/20 text-[#FCFBF7]' : 'hover:bg-[#222527]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#E5CB90] mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#222527] text-[10px] font-bold text-[#FFF3C8]">
                            {q.type}
                          </span>
                          <span className="text-[10px] text-[#A8ACAF] font-mono">
                            {q.marks} Marks • Bloom: {q.bloomLevel}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#FCFBF7] mt-1 line-clamp-2">
                          {q.questionText}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-[#A8ACAF] hover:bg-[#151718] rounded-xl"
                >
                  ← Back to Info
                </button>
                <button
                  type="button"
                  onClick={handleCreateAssessment}
                  disabled={loading}
                  className="px-5 py-2 text-xs font-black text-[#151718] bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Assessment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

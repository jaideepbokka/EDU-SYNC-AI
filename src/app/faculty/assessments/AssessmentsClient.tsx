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

      setAssessments((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete assessment')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Curriculum Evaluator • Multi-Question Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-white" />
            <span>Assessments & Examination Manager</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Build evaluative quizzes, mid-term examinations, and assignments with question bank mappings. Delete or manage previous tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/assessments"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all hover:scale-105 shadow-sm whitespace-nowrap"
          >
            <span>Student Quiz Portal ↗</span>
          </Link>
          <button
            onClick={() => {
              setIsBuilderOpen(true)
              setStep(1)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
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
                className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs flex flex-col justify-between hover:border-[#A99AE8] transition-colors relative"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#D9D1F5]/50 text-[#625BEB] font-mono font-bold text-xs border border-[#D9D1F5]">
                      {ass.subject?.code || 'CS501'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ass.status} />

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteAssessment(ass.id, ass.title)}
                        disabled={deletingId === ass.id}
                        title={`Delete test "${ass.title}"`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === ass.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#292C32] mt-3">
                    {ass.title}
                  </h3>
                  <p className="text-xs text-[#85878F] mt-1 line-clamp-2">
                    {ass.description || 'Academic benchmark evaluation.'}
                  </p>

                  {/* Metric Pills */}
                  <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-[#E9EAF0] text-center">
                    <div className="p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
                      <p className="text-[10px] text-[#85878F] font-bold uppercase">Duration</p>
                      <p className="text-xs font-bold text-[#292C32] mt-0.5">
                        {ass.durationMinutes} Mins
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
                      <p className="text-[10px] text-[#85878F] font-bold uppercase">Marks</p>
                      <p className="text-xs font-bold text-[#292C32] mt-0.5">
                        {ass.totalMarks} (Pass {ass.passMarks})
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0]">
                      <p className="text-[10px] text-[#85878F] font-bold uppercase">Questions</p>
                      <p className="text-xs font-bold text-[#292C32] mt-0.5">
                        {ass.assessmentQuestions?.length || 0} Items
                      </p>
                    </div>
                  </div>

                  {/* Attempts Count */}
                  <div className="mt-4 flex items-center justify-between text-xs text-[#85878F]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-4 h-4 text-[#8B6DE9]" />
                      <span>{ass.attempts?.length || 0} Student Attempts</span>
                    </span>
                    {pendingAttempts.length > 0 && (
                      <span className="text-[#625BEB] font-bold px-2.5 py-0.5 rounded-full bg-[#D9D1F5]/60 border border-[#D9D1F5] text-[11px]">
                        {pendingAttempts.length} Pending Grading
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-[#E9EAF0] flex items-center justify-between">
                  <Link
                    href="/faculty/evaluation"
                    className="text-xs font-bold text-[#8B6DE9] hover:underline flex items-center gap-1"
                  >
                    <span>Evaluation Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/faculty/quiz-analysis"
                    className="px-3.5 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] border border-[#E9EAF0] text-xs font-bold transition-colors"
                  >
                    View Topic Analysis
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-white border border-[#E9EAF0] space-y-3">
            <Award className="w-10 h-10 text-[#85878F] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#292C32]">No assessments created yet.</p>
            <p className="text-xs text-[#85878F]">
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
                <label className="block text-xs font-semibold text-[#292C32] mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white text-[#292C32]">
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292C32] mb-1">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 2: Dynamic Programming & Matrix Chain Multiplication"
                  className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292C32] mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assessment scope, allowable tools, and grading criteria..."
                  className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 placeholder:text-[#85878F] focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#292C32] mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292C32] mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292C32] mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, passMarks: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 focus:ring-2 focus:ring-[#8B6DE9] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0]">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title) return alert('Title is required')
                    setStep(2)
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
                >
                  Next: Select Questions →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#292C32]">
                  Select questions from the Question Bank ({formData.selectedQuestionIds.length} selected):
                </p>
                <Link
                  href="/faculty/quiz-generator"
                  target="_blank"
                  className="text-xs font-bold text-[#8B6DE9] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate More with AI</span>
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E9EAF0] border border-[#E9EAF0] rounded-2xl p-2 bg-[#F2F3F5]">
                {questions.map((q) => {
                  const isSelected = formData.selectedQuestionIds.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl cursor-pointer flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-[#D9D1F5]/40 border border-[#D9D1F5]' : 'hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#8B6DE9] mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#E9EAF0] text-[10px] font-bold text-[#292C32]">
                            {q.type}
                          </span>
                          <span className="text-[10px] text-[#85878F] font-mono">
                            {q.marks} Marks • Bloom: {q.bloomLevel}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#292C32] mt-1 line-clamp-2">
                          {q.questionText}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between gap-2 pt-3 border-t border-[#E9EAF0]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
                >
                  ← Back to Info
                </button>
                <button
                  type="button"
                  onClick={handleCreateAssessment}
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
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

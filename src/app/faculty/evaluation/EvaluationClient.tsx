'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import {
  CheckCircle2,
  Award,
  BookOpen,
  User,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

interface EvaluationClientProps {
  pendingAnswers: any[]
  evaluatedAnswers: any[]
}

export function EvaluationClient({
  pendingAnswers: initialPending,
  evaluatedAnswers: initialEvaluated,
}: EvaluationClientProps) {
  const router = useRouter()
  const [pendingAnswers, setPendingAnswers] = useState<any[]>(initialPending)
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<any[]>(initialEvaluated)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>(
    initialPending[0]?.id || initialEvaluated[0]?.id || ''
  )
  const [marksInput, setMarksInput] = useState<number>(3)
  const [feedbackInput, setFeedbackInput] = useState<string>(
    'Good identification of relaxation bounds; elaborate on negative weight cycle detection.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'evaluated'>('pending')

  const currentAnswer =
    pendingAnswers.find((a) => a.id === selectedAnswerId) ||
    evaluatedAnswers.find((a) => a.id === selectedAnswerId) ||
    pendingAnswers[0] ||
    evaluatedAnswers[0]

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAnswer) return

    setSubmitting(true)
    const answerIdToMove = currentAnswer.id
    const updatedAnswer = {
      ...currentAnswer,
      marksAwarded: Number(marksInput),
      facultyFeedback: feedbackInput,
      evaluatedAt: new Date().toISOString(),
    }

    // Optimistically update lists immediately
    setPendingAnswers((prev) => prev.filter((a) => a.id !== answerIdToMove))
    setEvaluatedAnswers((prev) => [updatedAnswer, ...prev])

    // Pick next pending item
    const remainingPending = pendingAnswers.filter((a) => a.id !== answerIdToMove)
    if (remainingPending.length > 0) {
      setSelectedAnswerId(remainingPending[0].id)
    }

    try {
      const res = await fetch('/api/evaluation/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerId: answerIdToMove,
          marksAwarded: Number(marksInput),
          feedback: feedbackInput,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit grade')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Academic Evaluation Suite • Rubrics & Audits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <span>Subjective Assessment Evaluation Suite</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Grade descriptive derivations and open-ended student submissions against curricular rubrics with audit trail tracking.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-[#292C32] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Pending Grading ({pendingAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluated')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'evaluated'
                ? 'bg-white text-[#292C32] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Graded Archive ({evaluatedAnswers.length})
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Submission Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#85878F]">
            {activeTab === 'pending' ? 'Pending Submissions Queue' : 'Graded Submissions'}
          </h3>

          {(activeTab === 'pending' ? pendingAnswers : evaluatedAnswers).length > 0 ? (
            (activeTab === 'pending' ? pendingAnswers : evaluatedAnswers).map((ans) => {
              const isSelected = ans.id === currentAnswer?.id
              return (
                <div
                  key={ans.id}
                  onClick={() => {
                    setSelectedAnswerId(ans.id)
                    setMarksInput(ans.marksAwarded || 3)
                    setFeedbackInput(ans.facultyFeedback || '')
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#D9D1F5]/40 border-[#8B6DE9] shadow-sm'
                      : 'bg-white border-[#E9EAF0] hover:border-[#8B6DE9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#D9D1F5]/60 text-[#625BEB] font-bold flex items-center justify-center text-xs">
                        {ans.attempt.student.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#292C32]">
                          {ans.attempt.student.user.name}
                        </p>
                        <p className="text-[10px] text-[#85878F] font-mono">
                          {ans.attempt.student.rollNo}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2F3F5] text-[#292C32] border border-[#E9EAF0]">
                      {ans.question.marks} Marks
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#292C32] mt-2 truncate">
                    {ans.attempt.assessment.title}
                  </p>
                  <p className="text-[10px] text-[#85878F] line-clamp-1 mt-0.5">
                    {ans.question.questionText}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#E9EAF0] text-xs text-[#85878F]">
              No submissions in this queue.
            </div>
          )}
        </div>

        {/* Right 2 Cols: Evaluation Workplace */}
        <div className="lg:col-span-2">
          {currentAnswer ? (
            <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-xs space-y-6">
              {/* Submission Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EAF0] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-mono font-bold text-xs">
                      {currentAnswer.attempt.assessment.subject?.code || 'CS501'}
                    </span>
                    <span className="text-xs font-bold text-[#292C32]">
                      {currentAnswer.attempt.assessment.title}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#292C32] mt-1">
                    Student Submission: {currentAnswer.attempt.student.user.name} ({currentAnswer.attempt.student.rollNo})
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#85878F] uppercase font-bold">Max Marks</span>
                  <p className="text-lg font-black text-[#625BEB]">{currentAnswer.question.marks} Pts</p>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#85878F]">
                  Question Prompt (Bloom: {currentAnswer.question.bloomLevel})
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#292C32] leading-relaxed">
                  {currentAnswer.question.questionText}
                </p>
              </div>

              {/* Student's Actual Response */}
              <div className="p-4 rounded-2xl bg-[#D9D1F5]/20 border-2 border-[#A99AE8]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#625BEB]">
                    Student Written Response
                  </span>
                  <span className="text-[10px] text-[#85878F]">Submitted Online</span>
                </div>
                <p className="text-xs sm:text-sm text-[#292C32] whitespace-pre-wrap leading-relaxed">
                  {currentAnswer.studentAnswerText || 'No text written by student.'}
                </p>
              </div>

              {/* Reference Sample Answer / Rubric */}
              {currentAnswer.question.sampleAnswer && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Faculty Benchmark Rubric / Expected Answer
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {currentAnswer.question.sampleAnswer}
                  </p>
                </div>
              )}

              {/* Faculty Marks & Feedback Form */}
              <form onSubmit={handleGradeSubmit} className="pt-4 border-t border-[#E9EAF0] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292C32] mb-1">
                      Awarded Marks (0 - {currentAnswer.question.marks}) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={currentAnswer.question.marks}
                      required
                      value={marksInput}
                      onChange={(e) => setMarksInput(Number(e.target.value))}
                      className="w-full text-xs font-bold text-[#292C32] rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-2.5 focus:ring-2 focus:ring-[#8B6DE9]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#292C32] mb-1">
                      Faculty Constructive Feedback & Rubric Notes
                    </label>
                    <input
                      type="text"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Point out missing derivations or strong reasoning..."
                      className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] p-2.5 focus:ring-2 focus:ring-[#8B6DE9]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#85878F] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#35C979]" />
                    <span>Grading action is automatically logged to permanent audit ledger.</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Evaluation & Update Grade'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white border border-[#E9EAF0] text-[#85878F] text-xs">
              Select a submission from the queue to start grading.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


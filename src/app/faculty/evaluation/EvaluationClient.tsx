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
  pendingAnswers,
  evaluatedAnswers,
}: EvaluationClientProps) {
  const router = useRouter()
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>(
    pendingAnswers[0]?.id || evaluatedAnswers[0]?.id || ''
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
    try {
      const res = await fetch('/api/evaluation/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerId: currentAnswer.id,
          marksAwarded: Number(marksInput),
          feedback: feedbackInput,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit grade')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            <span>Subjective Assessment Evaluation Suite</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grade descriptive derivations and open-ended student submissions against curricular rubrics with audit trail tracking.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pending Grading ({pendingAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluated')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'evaluated'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-xs">
                        {ans.attempt.student.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ans.attempt.student.user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {ans.attempt.student.rollNo}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ans.question.marks} Marks
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-2 truncate">
                    {ans.attempt.assessment.title}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {ans.question.questionText}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No submissions in this queue.
            </div>
          )}
        </div>

        {/* Right 2 Cols: Evaluation Workplace */}
        <div className="lg:col-span-2">
          {currentAnswer ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Submission Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-mono font-bold text-xs">
                      {currentAnswer.attempt.assessment.subject?.code || 'CS501'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currentAnswer.attempt.assessment.title}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Student Submission: {currentAnswer.attempt.student.user.name} ({currentAnswer.attempt.student.rollNo})
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Max Marks</span>
                  <p className="text-lg font-black text-indigo-600">{currentAnswer.question.marks} Pts</p>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Question Prompt (Bloom: {currentAnswer.question.bloomLevel})
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {currentAnswer.question.questionText}
                </p>
              </div>

              {/* Student's Actual Response */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Student Written Response
                  </span>
                  <span className="text-[10px] text-slate-400">Submitted Online</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {currentAnswer.studentAnswerText || 'No text written by student.'}
                </p>
              </div>

              {/* Reference Sample Answer / Rubric */}
              {currentAnswer.question.sampleAnswer && (
                <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Faculty Benchmark Rubric / Expected Answer
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentAnswer.question.sampleAnswer}
                  </p>
                </div>
              )}

              {/* Faculty Marks & Feedback Form */}
              <form onSubmit={handleGradeSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                      className="w-full text-xs font-bold text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Faculty Constructive Feedback & Rubric Notes
                    </label>
                    <input
                      type="text"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Point out missing derivations or strong reasoning..."
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Grading action is automatically logged to permanent audit ledger.</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Evaluation & Update Grade'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Select a submission from the queue to start grading.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

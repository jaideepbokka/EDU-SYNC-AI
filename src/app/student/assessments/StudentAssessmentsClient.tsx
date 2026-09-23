'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Award,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
} from 'lucide-react'

interface StudentAssessmentsClientProps {
  students: any[]
  assessments: any[]
}

export function StudentAssessmentsClient({
  students,
  assessments,
}: StudentAssessmentsClientProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '')
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any | null>(null)

  const handleStartTest = (ass: any) => {
    setActiveAssessment(ass)
    setAnswers({})
    setSubmissionResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          assessmentId: activeAssessment.id,
          answers,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit attempt')
      setSubmissionResult(data)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            <span>Active Assessments & Examination Room</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Attempt scheduled tests with automated instant AI grading and bloom-taxonomy evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {assessments.length} Tests Available
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Verified Examinee Identity (No Demo Profile Dropdown) */}
        {(() => {
          const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0]
          return (
            <div className="rounded-2xl bg-[#272A2C] border border-[#3D4042] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black flex items-center justify-center text-sm shadow-md">
                  {currentStudent?.user.name.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FCF6F5]">
                    {currentStudent?.user.name}
                  </p>
                  <p className="text-[11px] text-[#A8ACAF]">
                    Roll No: <span className="font-mono text-[#FFF3C8] font-bold">{currentStudent?.rollNo}</span> • Verified Institutional Examinee
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E5CB90] animate-pulse" />
                <span className="text-[11px] text-[#FFF3C8] font-medium">
                  AI Automated Assessment System Active
                </span>
              </div>
            </div>
          )
        })()}

        {/* Assessment View / Active Test Workspace */}
        {submissionResult ? (
          <div className="rounded-3xl bg-[#272A2C] border border-[#E5CB90]/40 p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#E5CB90]/20 text-[#E5CB90] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#FCF6F5]">Assessment Submitted Successfully!</h2>
            <p className="text-xs text-[#A8ACAF] max-w-md mx-auto leading-relaxed">
              {submissionResult.message}
            </p>

            <div className="p-4 rounded-2xl bg-[#1B1D1F]/90 max-w-xs mx-auto border border-[#3D4042]">
              <span className="text-[10px] text-[#A8ACAF] font-bold uppercase">Auto-Graded Score</span>
              <p className="text-2xl font-black text-[#E5CB90] mt-1 font-mono">
                {submissionResult.score} / {submissionResult.totalMarks} Marks
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setActiveAssessment(null)
                  setSubmissionResult(null)
                }}
                className="px-4 py-2 rounded-xl bg-[#3D4042] text-[#FCF6F5] text-xs font-semibold hover:bg-[#4D5154] transition-colors cursor-pointer"
              >
                Take Another Assessment
              </button>
              <Link
                href="/student"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] text-xs font-black shadow-md shadow-[#E5CB90]/20 transition-all cursor-pointer"
              >
                Back to Dashboard →
              </Link>
            </div>
          </div>
        ) : activeAssessment ? (
          <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAssessment(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Assessment List</span>
                </button>
                <h2 className="text-lg font-bold text-white">{activeAssessment.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{activeAssessment.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{activeAssessment.durationMinutes} Mins</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  {activeAssessment.totalMarks} Total Marks
                </span>
              </div>
            </div>

            {/* Questions Form */}
            <div className="space-y-6">
              {activeAssessment.assessmentQuestions.map((aq: any, idx: number) => {
                const q = aq.question
                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        Question {idx + 1} ({aq.marks} Marks)
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
                        {q.type}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* MCQ Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt: any) => (
                          <label
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                              answers[q.id] === opt.optionKey
                                ? 'bg-indigo-950/80 border-indigo-500 text-white font-semibold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={answers[q.id] === opt.optionKey}
                              onChange={() => setAnswers({ ...answers, [q.id]: opt.optionKey })}
                              className="accent-indigo-500 w-4 h-4"
                            />
                            <span className="font-bold text-xs">{opt.optionKey}:</span>
                            <span className="text-xs">{opt.optionText}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Short Answer Input */}
                    {(q.type === 'SHORT_ANSWER' || q.type === 'CODING') && (
                      <div className="pt-2">
                        <textarea
                          rows={4}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          placeholder="Type your complete solution or code derivation here..."
                          className="w-full text-xs rounded-xl border border-slate-700 bg-slate-900 p-3 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Responses...' : 'Submit Assessment Attempt'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Available Assessments ({assessments.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {assessments.map((ass) => (
                <div
                  key={ass.id}
                  className="p-6 rounded-3xl bg-[#272A2C] border border-[#3D4042] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#E5CB90]/60 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 font-mono font-bold text-xs">
                        {ass.subject.code}
                      </span>
                      <span className="text-xs font-semibold text-[#A8ACAF]">
                        {ass.durationMinutes} Mins • {ass.totalMarks} Marks
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#FCF6F5] mt-2">{ass.title}</h3>
                    <p className="text-xs text-[#A8ACAF] mt-0.5">{ass.description}</p>
                  </div>

                  <button
                    onClick={() => handleStartTest(ass)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] hover:brightness-105 text-[#151718] font-black text-xs shadow-md shadow-[#E5CB90]/20 whitespace-nowrap transition-all hover:scale-105 cursor-pointer"
                  >
                    Start Test Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

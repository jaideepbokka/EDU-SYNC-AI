'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Award,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Send,
  ShieldAlert,
  EyeOff,
  Eye,
  Lock,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'

interface StudentAssessmentsClientProps {
  student: any
  assessments: any[]
}

export function StudentAssessmentsClient({
  student,
  assessments: initialAssessments,
}: StudentAssessmentsClientProps) {
  const [assessments, setAssessments] = useState(initialAssessments)
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any | null>(null)
  const [viewingScorecardAssessment, setViewingScorecardAssessment] = useState<any | null>(null)

  // Map of completed attempts { [assessmentId]: attemptObject }
  const [attemptsMap, setAttemptsMap] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {}
    if (student?.attempts) {
      for (const att of student.attempts) {
        map[att.assessmentId] = att
      }
    }
    for (const ass of initialAssessments) {
      if (ass.attempts && ass.attempts.length > 0) {
        map[ass.id] = ass.attempts[0]
      }
    }
    return map
  })

  // Proctoring States
  const [focusLossCount, setFocusLossCount] = useState<number>(0)
  const [showProctorWarning, setShowProctorWarning] = useState<boolean>(false)
  const [proctorLogs, setProctorLogs] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60) // seconds

  const activeAssessmentRef = useRef<any>(null)
  const answersRef = useRef<Record<string, string>>({})
  const focusLossCountRef = useRef<number>(0)
  const isSubmittingRef = useRef<boolean>(false)

  activeAssessmentRef.current = activeAssessment
  answersRef.current = answers
  focusLossCountRef.current = focusLossCount

  // Start a new test attempt
  const handleStartTest = (ass: any) => {
    if (attemptsMap[ass.id]) {
      // Test already completed! Show scorecard instead
      setViewingScorecardAssessment(ass)
      return
    }

    setActiveAssessment(ass)
    setAnswers({})
    setSubmissionResult(null)
    setFocusLossCount(0)
    focusLossCountRef.current = 0
    setShowProctorWarning(false)
    setProctorLogs([])
    setTimeRemaining((ass.durationMinutes || 30) * 60)
  }

  // Submit test attempt (manual or proctor-triggered auto-submit)
  const submitAssessment = useCallback(
    async (options?: { autoSubmitReason?: string; tabSwitchCount?: number }) => {
      const currentAss = activeAssessmentRef.current
      if (!currentAss || isSubmittingRef.current) return

      isSubmittingRef.current = true
      setSubmitting(true)

      try {
        const res = await fetch('/api/student/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student?.id,
            assessmentId: currentAss.id,
            answers: answersRef.current,
            tabSwitchCount: options?.tabSwitchCount ?? focusLossCountRef.current,
            autoSubmitReason: options?.autoSubmitReason || null,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to submit test attempt')

        // Update attempts map so start button is permanently locked
        setAttemptsMap((prev) => ({
          ...prev,
          [currentAss.id]: {
            id: data.attemptId || 'new',
            assessmentId: currentAss.id,
            score: data.score,
            totalMarks: data.totalMarks,
            percentage: data.percentage,
            status: 'EVALUATED',
            feedback: data.proctoringNote,
            answers: data.breakdown || [],
          },
        }))

        setSubmissionResult({
          ...data,
          assessmentTitle: currentAss.title,
          subjectCode: currentAss.subject?.code,
        })
        setActiveAssessment(null)
      } catch (err: any) {
        alert(err.message || 'Error recording submission')
      } finally {
        setSubmitting(false)
        isSubmittingRef.current = false
      }
    },
    [student?.id]
  )

  // Timer Countdown
  useEffect(() => {
    if (!activeAssessment) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitAssessment({ autoSubmitReason: 'TIME_EXPIRED' })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeAssessment, submitAssessment])

  // Anti-Cheat: Proctoring Tab-Switching & Focus-Loss Engine
  useEffect(() => {
    if (!activeAssessment) return

    const handleVisibilityOrFocusChange = () => {
      if (document.hidden || !document.hasFocus()) {
        const currentCount = focusLossCountRef.current + 1
        setFocusLossCount(currentCount)
        focusLossCountRef.current = currentCount

        const timestamp = new Date().toLocaleTimeString()
        const logMsg = `[${timestamp}] Tab switched or window focus lost (Incident #${currentCount})`
        setProctorLogs((prev) => [...prev, logMsg])

        if (currentCount === 1) {
          // Warning on 1st focus loss
          setShowProctorWarning(true)
        } else if (currentCount >= 2) {
          // Auto-submit immediately on 2nd focus loss!
          setShowProctorWarning(false)
          submitAssessment({
            autoSubmitReason: 'AUTO_SUBMITTED_TAB_SWITCH',
            tabSwitchCount: currentCount,
          })
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    document.addEventListener('visibilitychange', handleVisibilityOrFocusChange)
    window.addEventListener('blur', handleVisibilityOrFocusChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocusChange)
      window.removeEventListener('blur', handleVisibilityOrFocusChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [activeAssessment, submitAssessment])

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  const currentStudentName = student?.user?.name || 'Aarav Reddy'
  const currentRollNo = student?.rollNo || 'CS2023001'

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9EAF0]">
        <div>
          <h1 className="text-2xl font-black text-[#292C32] tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#625BEB]" />
            <span>Active Assessments & Examination Room</span>
          </h1>
          <p className="text-xs text-[#85878F] mt-1 font-medium">
            Proctored examination portal with real-time AI evaluation, instant grading, and tab-focus auditing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#D9D1F5]/60 border border-[#A99AE8]/40 text-[#625BEB] text-xs font-bold shadow-xs">
            {assessments.length} Tests Available
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Verified Examinee Identity Bar */}
        <div className="rounded-2xl bg-white border border-[#E9EAF0] p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] text-white font-black flex items-center justify-center text-sm shadow-md">
              {currentStudentName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#292C32]">{currentStudentName}</p>
              <p className="text-xs text-[#85878F] font-medium">
                Roll No: <span className="font-mono text-[#625BEB] font-bold">{currentRollNo}</span> • Verified Institutional Examinee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#D9D1F5]/40 px-3 py-1.5 rounded-xl border border-[#A99AE8]/40">
            <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
            <span className="text-[11px] text-[#625BEB] font-bold">
              Automated Live Evaluation Engine Active
            </span>
          </div>
        </div>

        {/* PROCTORING TAB-SWITCH WARNING MODAL (Incident 1/2) */}
        {showProctorWarning && (
          <div className="fixed inset-0 z-50 bg-[#292C32]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-rose-500 p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider">
                  ⚠️ Incident 1 of 2: Focus Loss Detected
                </span>
                <h3 className="text-lg font-black text-[#292C32]">
                  Exam Tab Switch / Window Loss Warning
                </h3>
                <p className="text-xs text-[#85878F] leading-relaxed">
                  You navigated away from the assessment tab. Leaving this tab again will <strong className="text-rose-600">immediately terminate and auto-submit</strong> your test with whatever answers you have entered so far.
                </p>
                <p className="text-[11px] text-[#85878F] bg-[#F2F3F5] p-3 rounded-xl border border-[#E9EAF0] italic">
                  Important: this detects suspicious activity (tab loss/minimizing), not whether you actually cheated. Return to your test immediately.
                </p>
              </div>

              <button
                onClick={() => setShowProctorWarning(false)}
                className="w-full py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                I Understand — Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* SUBMISSION RESULT / DETAILED INSTANT SCORECARD */}
        {submissionResult ? (
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 space-y-6 shadow-lg">
            {/* Header banner */}
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${
              submissionResult.autoSubmitted
                ? 'bg-rose-50 border-rose-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                submissionResult.autoSubmitted
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-[#35C979]'
              }`}>
                {submissionResult.autoSubmitted ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>

              <h2 className="text-xl font-black text-[#292C32]">
                {submissionResult.autoSubmitted
                  ? 'Exam Terminated & Auto-Submitted'
                  : 'Assessment Evaluated & Submitted Successfully!'}
              </h2>
              <p className="text-xs text-[#85878F] max-w-md mx-auto">
                {submissionResult.message}
              </p>

              {/* Score Display Card */}
              <div className="p-4 rounded-2xl bg-white max-w-xs mx-auto border border-[#E9EAF0] shadow-sm mt-3">
                <span className="text-[10px] text-[#85878F] font-bold uppercase tracking-wider">
                  Accurate Evaluated Score
                </span>
                <p className="text-3xl font-black text-[#625BEB] mt-0.5 font-mono">
                  {submissionResult.score} / {submissionResult.totalMarks} Marks
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9D1F5]/60 text-[#625BEB]">
                  {submissionResult.percentage}% Final Grade
                </span>
              </div>
            </div>

            {/* Detailed Question-by-Question Evaluation Breakdown */}
            {submissionResult.breakdown && submissionResult.breakdown.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#292C32] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#625BEB]" />
                  <span>Question-by-Question Evaluation & Explanations</span>
                </h3>

                <div className="space-y-3">
                  {submissionResult.breakdown.map((item: any, idx: number) => (
                    <div
                      key={item.questionId || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {item.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-[#35C979] shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-[#292C32]">
                            Question {idx + 1}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#292C32]">
                          {item.marksAwarded} / {item.marks} Marks
                        </span>
                      </div>

                      <p className="text-xs text-[#292C32] mt-2 font-medium">
                        {item.questionText}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                        <p className="text-[#85878F]">
                          <strong className="text-[#292C32]">Your Answer:</strong>{' '}
                          {item.studentAnswer || 'No Answer Provided'}
                        </p>
                        {item.correctAnswer && (
                          <p className="text-[#35C979]">
                            <strong>Correct Answer / Solution:</strong> {item.correctAnswer}
                          </p>
                        )}
                        {item.explanation && (
                          <p className="text-[#625BEB]">
                            <strong>Evaluation Note:</strong> {item.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-[#E9EAF0]">
              <span className="text-xs text-[#85878F]">
                Status: <strong className="text-[#35C979]">Permanently Locked & Recorded</strong>
              </span>
              <button
                onClick={() => setSubmissionResult(null)}
                className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Back to Assessments List
              </button>
            </div>
          </div>
        ) : viewingScorecardAssessment ? (
          /* VIEW PREVIOUSLY COMPLETED SCORECARD MODAL / VIEW */
          <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setViewingScorecardAssessment(null)}
                  className="text-xs font-semibold text-[#85878F] hover:text-[#625BEB] flex items-center gap-1 mb-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Assessment List</span>
                </button>
                <h2 className="text-lg font-black text-[#292C32]">
                  {viewingScorecardAssessment.title} — Official Scorecard
                </h2>
                <p className="text-xs text-[#85878F]">
                  {viewingScorecardAssessment.subject?.name} ({viewingScorecardAssessment.subject?.code})
                </p>
              </div>

              {attemptsMap[viewingScorecardAssessment.id] && (
                <div className="p-3 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] text-right">
                  <span className="text-[10px] text-[#85878F] font-bold uppercase">Evaluated Score</span>
                  <p className="text-xl font-black text-[#625BEB] font-mono">
                    {attemptsMap[viewingScorecardAssessment.id].score} / {attemptsMap[viewingScorecardAssessment.id].totalMarks} Marks
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#35C979] shrink-0" />
              <div className="text-xs text-emerald-900">
                <strong>Attempt Completed:</strong> You have completed this examination. Single-attempt institutional policy is enforced, and re-attempting is locked.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingScorecardAssessment(null)}
                className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        ) : activeAssessment ? (
          /* ACTIVE TEST ATTEMPT WORKSPACE (WITH LIVE PROCTORING) */
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitAssessment()
            }}
            className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Active Test Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EAF0] pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 mb-2">
                  <Eye className="w-3 h-3 text-rose-600 animate-pulse" />
                  <span>Proctoring Active: Tab Switching Monitored</span>
                </div>
                <h2 className="text-lg font-black text-[#292C32]">{activeAssessment.title}</h2>
                <p className="text-xs text-[#85878F] mt-0.5">{activeAssessment.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer Display */}
                <span className="px-3.5 py-2 rounded-xl bg-[#F2F3F5] text-[#292C32] text-xs font-mono font-black flex items-center gap-2 border border-[#E9EAF0]">
                  <Clock className="w-4 h-4 text-[#625BEB] animate-spin" />
                  <span>{formatTime(timeRemaining)}</span>
                </span>

                <span className="px-3.5 py-2 rounded-xl bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 text-xs font-bold">
                  {activeAssessment.totalMarks} Marks Total
                </span>
              </div>
            </div>

            {/* Proctor Alert Warning Bar */}
            {focusLossCount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-900 animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Focus Loss Recorded ({focusLossCount}/2):</strong> Do not switch browser tabs or minimize your window. Next incident will trigger automatic submission.
                  </span>
                </div>
              </div>
            )}

            {/* Questions Form */}
            <div className="space-y-6">
              {activeAssessment.assessmentQuestions.map((aq: any, idx: number) => {
                const q = aq.question
                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#625BEB]">
                        Question {idx + 1} ({aq.marks} Marks)
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#85878F] px-2 py-0.5 rounded-md bg-white border border-[#E9EAF0]">
                        {q.type}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#292C32] leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* MCQ Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt: any) => (
                          <label
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              answers[q.id] === opt.optionKey
                                ? 'bg-[#D9D1F5]/60 border-[#8B6DE9] text-[#292C32] font-bold shadow-xs'
                                : 'bg-white border-[#E9EAF0] text-[#292C32] hover:border-[#A99AE8]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={answers[q.id] === opt.optionKey}
                              onChange={() => setAnswers({ ...answers, [q.id]: opt.optionKey })}
                              className="accent-[#8B6DE9] w-4 h-4"
                            />
                            <span className="font-mono font-bold text-xs">{opt.optionKey}:</span>
                            <span className="text-xs font-medium">{opt.optionText}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Short Answer / Code Input */}
                    {(q.type === 'SHORT_ANSWER' || q.type === 'CODING') && (
                      <div className="pt-2">
                        <textarea
                          rows={4}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          placeholder="Type your complete solution or code derivation here..."
                          className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-white p-3 text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Submission Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E9EAF0]">
              <span className="text-xs text-[#85878F]">
                Answering: {Object.keys(answers).length} / {activeAssessment.assessmentQuestions.length} Questions
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#A99AE8]" />
                <span>{submitting ? 'Auto-Evaluating Responses...' : 'Submit & Instant Evaluate'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* ASSESSMENTS LIST VIEW */
          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#85878F] uppercase tracking-wider">
              Assigned Assessments ({assessments.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {assessments.map((ass) => {
                const existingAttempt = attemptsMap[ass.id]
                const isCompleted = !!existingAttempt

                return (
                  <div
                    key={ass.id}
                    className={`p-6 rounded-3xl bg-white border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'border-emerald-200/80 bg-emerald-50/10'
                        : 'border-[#E9EAF0] hover:border-[#A99AE8] hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-mono font-bold text-xs">
                          {ass.subject?.code}
                        </span>
                        <span className="text-xs font-semibold text-[#85878F]">
                          {ass.durationMinutes} Mins • {ass.totalMarks} Marks
                        </span>

                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#35C979]" />
                            <span>Score: {existingAttempt.score}/{existingAttempt.totalMarks} ({existingAttempt.percentage}%)</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#292C32] mt-2">{ass.title}</h3>
                      <p className="text-xs text-[#85878F] mt-0.5 font-medium">{ass.description}</p>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingScorecardAssessment(ass)}
                          className="px-4 py-2.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] text-[#292C32] font-bold text-xs border border-[#E9EAF0] whitespace-nowrap transition-colors cursor-pointer"
                        >
                          View Scorecard
                        </button>
                        <span className="px-3 py-2 rounded-xl bg-slate-100 text-[#85878F] text-xs font-semibold flex items-center gap-1 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartTest(ass)}
                        className="px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white font-bold text-xs shadow-md whitespace-nowrap transition-all hover:scale-105 cursor-pointer"
                      >
                        Start Test Now →
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

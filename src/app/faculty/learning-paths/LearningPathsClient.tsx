'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import {
  Compass,
  Sparkles,
  Plus,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  User,
  RefreshCw,
} from 'lucide-react'

interface LearningPathsClientProps {
  learningPaths: any[]
  students: any[]
  subjects: any[]
}

export function LearningPathsClient({
  learningPaths,
  students,
  subjects,
}: LearningPathsClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    subjectId: subjects[0]?.id || '',
  })

  const handleToggleStep = async (stepId: string, currentVal: boolean) => {
    try {
      await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STEP',
          stepId,
          isCompleted: !currentVal,
        }),
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to generate path')
      setIsModalOpen(false)
      router.refresh()
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-indigo-600" />
            <span>AI Remedial Learning Path Orchestrator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized remedial trajectories synthesizing prerequisites, video lectures, and benchmark tasks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Remedial Path</span>
        </button>
      </div>

      <div className="space-y-6">
        {learningPaths.map((lp) => (
          <div
            key={lp.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold font-mono text-xs">
                    {lp.subject.code}
                  </span>
                  <StatusBadge status={lp.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {lp.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Student: <strong className="text-slate-800 dark:text-slate-200">{lp.student.user.name}</strong> ({lp.student.rollNo}) • Trigger: <span className="text-rose-600 dark:text-rose-400">{lp.reason}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Steps Progress</span>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {lp.steps.filter((s: any) => s.isCompleted).length} / {lp.steps.length} Completed
                </p>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-3">
              {lp.steps.map((step: any, idx: number) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                    step.isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60'
                      : 'bg-slate-50/70 border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={step.isCompleted}
                    onChange={() => handleToggleStep(step.id, step.isCompleted)}
                    className="w-4 h-4 accent-emerald-600 mt-1 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Step {idx + 1}: {step.title}
                      </h4>
                      {step.isCompleted && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                    {step.resourceUrl && (
                      <a
                        href={step.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-2 font-semibold"
                      >
                        <span>Interactive Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Synthesize AI Remedial Path"
        description="Select a student to generate custom remedial milestones based on their quiz deficiencies."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePath} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} ({s.rollNo}) - Risk: {s.riskLevel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              {loading ? 'Synthesizing Path...' : 'Generate Path'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

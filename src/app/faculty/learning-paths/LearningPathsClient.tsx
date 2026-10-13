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
  learningPaths: initialLearningPaths,
  students,
  subjects,
}: LearningPathsClientProps) {
  const router = useRouter()
  const [learningPaths, setLearningPaths] = useState<any[]>(initialLearningPaths)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    subjectId: subjects[0]?.id || '',
  })

  const handleToggleStep = async (stepId: string, currentVal: boolean) => {
    // Optimistically toggle step in UI immediately
    setLearningPaths((prev) =>
      prev.map((lp) => ({
        ...lp,
        steps: lp.steps.map((st: any) =>
          st.id === stepId ? { ...st, isCompleted: !currentVal } : st
        ),
      }))
    )

    fetch('/api/learning-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_STEP',
        stepId,
        isCompleted: !currentVal,
      }),
    }).catch(console.error)
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
      const data = await res.json()
      if (data.path) {
        setLearningPaths((prev) => [data.path, ...prev])
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
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Guided Trajectories • Adaptive Remediation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-white" />
            <span>AI Remedial Learning Path Orchestrator</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Personalized remedial trajectories synthesizing prerequisites, video lectures, and benchmark tasks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Generate AI Remedial Path</span>
        </button>
      </div>

      <div className="space-y-6">
        {learningPaths.map((lp) => (
          <div
            key={lp.id}
            className="rounded-3xl bg-white border border-[#E9EAF0] p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E9EAF0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-bold font-mono text-xs">
                    {lp.subject.code}
                  </span>
                  <StatusBadge status={lp.status} />
                </div>
                <h3 className="text-base font-bold text-[#292C32] mt-2">
                  {lp.title}
                </h3>
                <p className="text-xs text-[#85878F] mt-0.5">
                  Assigned Student: <strong className="text-[#292C32]">{lp.student.user.name}</strong> ({lp.student.rollNo}) • Trigger: <span className="text-rose-600">{lp.reason}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#85878F]">Steps Progress</span>
                <p className="text-sm font-black text-[#625BEB] mt-0.5">
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
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-[#F2F3F5] border-[#E9EAF0]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={step.isCompleted}
                    onChange={() => handleToggleStep(step.id, step.isCompleted)}
                    className="w-4 h-4 accent-[#35C979] mt-1 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#292C32]">
                        Step {idx + 1}: {step.title}
                      </h4>
                      {step.isCompleted && (
                        <span className="text-[10px] text-[#35C979] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#35C979]" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#85878F] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                    {step.resourceUrl && (
                      <a
                        href={step.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#8B6DE9] hover:underline mt-2 font-semibold"
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
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} ({s.rollNo}) - Risk: {s.riskLevel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Subject *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5 font-medium"
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
              className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-xs cursor-pointer"
            >
              {loading ? 'Synthesizing Path...' : 'Generate Path'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


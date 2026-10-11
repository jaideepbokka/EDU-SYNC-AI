'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import {
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Calendar,
  ShieldAlert,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface AcademicRiskClientProps {
  studentsAtRisk: any[]
  interventions: any[]
}

export function AcademicRiskClient({
  studentsAtRisk,
  interventions,
}: AcademicRiskClientProps) {
  const router = useRouter()
  const [recalculating, setRecalculating] = useState(false)
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState<any | null>(null)
  const [interventionForm, setInterventionForm] = useState({
    type: 'PARENT_MEETING',
    description: '',
    targetDays: 3,
    notes: '',
  })

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await fetch('/api/academic-risk/recalculate', { method: 'POST' })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setRecalculating(false)
    }
  }

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForIntervention) return
    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentForIntervention.id,
          ...interventionForm,
        }),
      })
      if (res.ok) {
        setSelectedStudentForIntervention(null)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Diagnostic Engine • Student Safety Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span>Academic Risk Diagnostic Engine</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Automated cognitive heuristics detecting attendance drops, failed assessments, and score declination.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 text-white ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Re-evaluating Models...' : 'Re-run Risk Engine'}</span>
        </button>
      </div>

      {/* Flagged Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studentsAtRisk.map((stu) => {
          const profile = stu.riskProfiles[0]

          return (
            <div
              key={stu.id}
              className={`rounded-3xl bg-white border p-6 shadow-xs space-y-4 flex flex-col justify-between ${
                stu.riskLevel === 'CRITICAL'
                  ? 'border-rose-300'
                  : 'border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#D9D1F5]/60 text-[#625BEB] font-bold flex items-center justify-center text-sm shrink-0 border border-[#A99AE8]/40">
                      {stu.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stu.user.avatar}
                          alt={stu.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        stu.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/faculty/students/${stu.id}?tab=risk`}
                          className="text-sm font-bold text-[#292C32] hover:text-[#8B6DE9]"
                        >
                          {stu.user.name}
                        </Link>
                        <span className="text-[10px] text-[#85878F] font-mono">({stu.rollNo})</span>
                      </div>
                      <p className="text-xs text-[#85878F] mt-0.5">
                        {stu.department.code} • Sem {stu.currentSemester} (Sec {stu.section})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={stu.riskLevel} />
                    <span className="text-xs font-black text-rose-600 block mt-1">
                      Score: {stu.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Primary Diagnostic Reason */}
                <div className="mt-4 p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#85878F] block mb-1">
                    AI Diagnostic Flag:
                  </span>
                  <p className="text-[#292C32] leading-relaxed font-medium">
                    {profile?.primaryReason || 'Student attendance or assessment metrics require faculty review.'}
                  </p>
                </div>

                {/* Risk Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {stu.attendancePercentage < 75 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Attendance: {stu.attendancePercentage}% (&lt;75%)
                    </span>
                  )}
                  {profile?.failedAssessmentsAlert && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
                      Failed Assessments
                    </span>
                  )}
                  {profile?.scoreDropAlert && (
                    <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 text-[10px] font-bold">
                      GPA Dropped &gt;0.8
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E9EAF0] flex items-center justify-between">
                <Link
                  href={`/faculty/students/${stu.id}?tab=risk`}
                  className="text-xs font-bold text-[#8B6DE9] hover:underline flex items-center gap-1"
                >
                  <span>Student Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedStudentForIntervention(stu)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Schedule Intervention
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Interventions History */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#292C32]">
          Scheduled & Active Faculty Interventions ({interventions.length})
        </h3>

        <div className="divide-y divide-[#E9EAF0]">
          {interventions.map((intv) => (
            <div key={intv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#292C32]">
                    {intv.student.user.name} ({intv.student.rollNo})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F2F3F5] text-[10px] font-bold text-[#292C32] border border-[#E9EAF0]">
                    {intv.type.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={intv.status} size="sm" />
                </div>
                <p className="text-xs text-[#85878F] mt-1">{intv.description}</p>
                {intv.notes && <p className="text-[11px] text-[#85878F] mt-0.5 italic">{intv.notes}</p>}
              </div>

              <div className="text-right text-xs text-[#85878F]">
                Target: {intv.targetDate ? new Date(intv.targetDate).toLocaleDateString() : 'Immediate'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Intervention Modal */}
      {selectedStudentForIntervention && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudentForIntervention(null)}
          title={`Schedule Intervention: ${selectedStudentForIntervention.user.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleCreateIntervention} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Intervention Strategy *
              </label>
              <select
                value={interventionForm.type}
                onChange={(e) => setInterventionForm({ ...interventionForm, type: e.target.value })}
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] p-2.5"
              >
                <option value="PARENT_MEETING">Urgent Parent Meeting</option>
                <option value="COUNSELING">Faculty Academic Counseling</option>
                <option value="REMEDIAL_CLASS">Mandatory Remedial Class</option>
                <option value="PEER_TUTORING">Peer Tutoring Program</option>
                <option value="WARNING_NOTICE">Formal Academic Warning Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Action Plan / Details *
              </label>
              <textarea
                rows={3}
                required
                value={interventionForm.description}
                onChange={(e) =>
                  setInterventionForm({ ...interventionForm, description: e.target.value })
                }
                placeholder="Specify the terms, counseling objectives, or parent consultation schedule..."
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292C32] mb-1">
                Cabin / Venue Notes
              </label>
              <input
                type="text"
                value={interventionForm.notes}
                onChange={(e) =>
                  setInterventionForm({ ...interventionForm, notes: e.target.value })
                }
                placeholder="e.g. HOD Cabin LH-301, 04:00 PM"
                className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForIntervention(null)}
                className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Intervention
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}


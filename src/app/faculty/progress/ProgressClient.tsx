'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { TrendingUp, BookOpen, Users, Compass, Sparkles } from 'lucide-react'

interface ProgressClientProps {
  students: any[]
  topics: any[]
}

export function ProgressClient({ students, topics }: ProgressClientProps) {
  const [selectedTopicId, setSelectedTopicId] = useState('ALL')

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Curricular Competencies • Mastery Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-white" />
            <span>Student Competency & Topic Mastery Matrix</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Holistic mastery progression across curricular units, practice accuracy, and diagnostic thresholds.
          </p>
        </div>
      </div>

      {/* Mastery Grid Table */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F3F5] uppercase font-semibold text-[#85878F] text-[10px] border-b border-[#E9EAF0]">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Subject Mastery</th>
                {topics.map((t) => (
                  <th key={t.id} className="px-4 py-4 whitespace-nowrap">
                    {t.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {students.map((stu) => {
                const subProgress = stu.subjectProgress[0]?.overallMastery || 70

                return (
                  <tr key={stu.id} className="hover:bg-[#F2F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/faculty/students/${stu.id}?tab=progress`}
                        className="font-bold text-[#292C32] hover:text-[#8B6DE9] flex items-center gap-2"
                      >
                        <span>{stu.user.name}</span>
                        <span className="text-[10px] text-[#85878F] font-mono">({stu.rollNo})</span>
                      </Link>
                    </td>

                    <td className="px-5 py-3.5 w-48">
                      <ProgressBar value={subProgress} size="sm" />
                    </td>

                    {topics.map((t) => {
                      const tp = stu.topicProgress.find((p: any) => p.topicId === t.id)
                      const score = tp ? tp.masteryScore : 50
                      const status = tp ? tp.status : 'LEARNING'

                      return (
                        <td key={t.id} className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={status} size="sm" />
                            <span className="font-mono text-[11px] font-bold text-[#85878F]">
                              {score}%
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


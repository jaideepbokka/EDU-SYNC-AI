'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { TrendingUp, BookOpen, Users, Compass } from 'lucide-react'

interface ProgressClientProps {
  students: any[]
  topics: any[]
}

export function ProgressClient({ students, topics }: ProgressClientProps) {
  const [selectedTopicId, setSelectedTopicId] = useState('ALL')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Student Competency & Topic Mastery Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Holistic mastery progression across curricular units, practice accuracy, and diagnostic thresholds.
          </p>
        </div>
      </div>

      {/* Mastery Grid Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 text-[10px] border-b border-slate-200 dark:border-slate-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((stu) => {
                const subProgress = stu.subjectProgress[0]?.overallMastery || 70

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/faculty/students/${stu.id}?tab=progress`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 flex items-center gap-2"
                      >
                        <span>{stu.user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({stu.rollNo})</span>
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
                            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
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

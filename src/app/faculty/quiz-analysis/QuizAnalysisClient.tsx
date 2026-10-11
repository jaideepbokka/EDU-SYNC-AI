'use client'

import React from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { SimpleBarChart } from '@/components/SimpleChart'
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Compass,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

interface QuizAnalysisClientProps {
  topicProgressData: any[]
  assessments: any[]
}

export function QuizAnalysisClient({
  topicProgressData,
  assessments,
}: QuizAnalysisClientProps) {
  // Compute weak topics (average accuracy < 65%)
  const topicStatsMap: Record<string, { title: string; totalAccuracy: number; count: number }> = {}

  topicProgressData.forEach((tp) => {
    if (!topicStatsMap[tp.topic.id]) {
      topicStatsMap[tp.topic.id] = { title: tp.topic.title, totalAccuracy: 0, count: 0 }
    }
    topicStatsMap[tp.topic.id].totalAccuracy += tp.accuracyRate
    topicStatsMap[tp.topic.id].count += 1
  })

  const aggregatedTopics = Object.values(topicStatsMap).map((t) => ({
    title: t.title,
    avgAccuracy: Math.round(t.totalAccuracy / (t.count || 1)),
  }))

  const weakTopics = aggregatedTopics.filter((t) => t.avgAccuracy < 65)

  const barChartData = aggregatedTopics.map((t) => ({
    label: t.title.split(' ')[0] + ' ' + (t.title.split(' ')[1] || ''),
    value: t.avgAccuracy,
    color: t.avgAccuracy >= 75 ? 'bg-[#35C979]' : t.avgAccuracy >= 55 ? 'bg-[#8B6DE9]' : 'bg-rose-500',
  }))

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Curricular Insights • Mastery Diagnostics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-white" />
            <span>Quiz Performance & Curricular Diagnostics</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Deep topic mastery analysis identifying student misconceptions, weak areas, and targeted remedial requirements.
          </p>
        </div>

        <Link
          href="/faculty/learning-paths"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          <Compass className="w-4 h-4 text-white" />
          <span>Launch AI Remedial Path</span>
        </Link>
      </div>

      {/* Weak Topics Diagnostic Cards */}
      {weakTopics.length > 0 && (
        <div className="rounded-3xl bg-white border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292C32]">
                Cognitive Deficits Detected: {weakTopics.length} Topics Below Proficiency Threshold (65%)
              </h3>
              <p className="text-xs text-[#85878F] mt-0.5">
                Students exhibit significant error rates in proofs and edge-case invariants. Recommended for automated remedial paths.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {weakTopics.map((wt, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#F2F3F5] border border-[#E9EAF0] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#292C32]">{wt.title}</p>
                  <span className="text-[11px] font-bold text-rose-600 mt-0.5 block">
                    {wt.avgAccuracy}% Average Accuracy
                  </span>
                </div>
                <Link
                  href="/faculty/learning-paths"
                  className="px-3 py-1.5 rounded-xl bg-[#D9D1F5]/60 text-[#625BEB] font-bold text-xs hover:bg-[#D9D1F5] border border-[#A99AE8]/40 transition-colors"
                >
                  Create Remedial Path
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Accuracy Bar Chart Card */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#292C32]">
              Topic Accuracy Rate Matrix
            </h3>
            <p className="text-xs text-[#85878F]">Class aggregate accuracy across all assessment items</p>
          </div>
        </div>

        <SimpleBarChart data={barChartData} height={200} />
      </div>

      {/* Detailed Topic Progression Grid */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#292C32]">
          Cohort Topic Mastery Breakdown
        </h3>

        <div className="space-y-4">
          {aggregatedTopics.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[#E9EAF0] bg-[#F2F3F5] space-y-2"
            >
              <div className="flex justify-between text-xs font-bold text-[#292C32]">
                <span>{t.title}</span>
                <span
                  className={
                    t.avgAccuracy >= 75
                      ? 'text-[#35C979]'
                      : t.avgAccuracy >= 60
                      ? 'text-[#8B6DE9]'
                      : 'text-rose-600'
                  }
                >
                  {t.avgAccuracy}% Mastery Score
                </span>
              </div>
              <ProgressBar value={t.avgAccuracy} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


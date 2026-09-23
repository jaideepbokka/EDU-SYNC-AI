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
    color: t.avgAccuracy >= 75 ? 'bg-emerald-500' : t.avgAccuracy >= 55 ? 'bg-amber-500' : 'bg-rose-500',
  }))

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Quiz Performance & Curricular Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep topic mastery analysis identifying student misconceptions, weak areas, and targeted remedial requirements.
          </p>
        </div>

        <Link
          href="/faculty/learning-paths"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Compass className="w-4 h-4" />
          <span>Launch AI Remedial Path</span>
        </Link>
      </div>

      {/* Weak Topics Diagnostic Cards */}
      {weakTopics.length > 0 && (
        <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cognitive Deficits Detected: {weakTopics.length} Topics Below Proficiency Threshold (65%)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Students exhibit significant error rates in proofs and edge-case invariants. Recommended for automated remedial paths.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {weakTopics.map((wt, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{wt.title}</p>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    {wt.avgAccuracy}% Average Accuracy
                  </span>
                </div>
                <Link
                  href="/faculty/learning-paths"
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  Create Remedial Path
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Accuracy Bar Chart Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Topic Accuracy Rate Matrix
            </h3>
            <p className="text-xs text-slate-400">Class aggregate accuracy across all assessment items</p>
          </div>
        </div>

        <SimpleBarChart data={barChartData} height={200} />
      </div>

      {/* Detailed Topic Progression Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Cohort Topic Mastery Breakdown
        </h3>

        <div className="space-y-4">
          {aggregatedTopics.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                <span>{t.title}</span>
                <span
                  className={
                    t.avgAccuracy >= 75
                      ? 'text-emerald-600'
                      : t.avgAccuracy >= 60
                      ? 'text-amber-600'
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

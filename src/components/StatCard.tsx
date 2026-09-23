import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive?: boolean
    neutral?: boolean
  }
  icon: LucideIcon
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple'
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'indigo',
}: StatCardProps) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-800',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
      border: 'hover:border-sky-300 dark:hover:border-sky-800',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
    },
  }

  const selected = colorMap[color] || colorMap.indigo

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all duration-200 hover:shadow-md ${selected.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  trend.neutral
                    ? 'text-slate-500'
                    : trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${selected.iconBg} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

import React from 'react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_')

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  let dotColor = 'bg-slate-400'

  switch (normalized) {
    case 'PRESENT':
    case 'PASSED':
    case 'MASTERED':
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'RESOLVED':
    case 'LOW':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
      dotColor = 'bg-emerald-500'
      break
    case 'IN_PROGRESS':
    case 'LEARNING':
    case 'PRACTICING':
    case 'PROMOTED':
    case 'MEDIUM':
    case 'SCHEDULED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
      dotColor = 'bg-amber-500'
      break
    case 'SUBMITTED':
    case 'NEEDS_EVALUATION':
    case 'PENDING':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60'
      dotColor = 'bg-sky-500'
      break
    case 'ABSENT':
    case 'FAILED':
    case 'NEEDS_IMPROVEMENT':
    case 'HIGH':
    case 'CRITICAL':
    case 'CLOSED':
    case 'CANCELLED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
      dotColor = 'bg-rose-500'
      break
    case 'DRAFT':
    case 'NOT_STARTED':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
      dotColor = 'bg-slate-400'
      break
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${colorClasses} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  )
}

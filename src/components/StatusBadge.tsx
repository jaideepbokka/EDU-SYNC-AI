import React from 'react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_')

  let colorClasses = 'bg-[#F2F3F5] text-[#292C32] border-[#E9EAF0]'
  let dotColor = 'bg-[#85878F]'

  switch (normalized) {
    case 'PRESENT':
    case 'PASSED':
    case 'MASTERED':
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'RESOLVED':
    case 'LOW':
      colorClasses = 'bg-emerald-50 text-[#35C979] border-emerald-200'
      dotColor = 'bg-[#35C979]'
      break
    case 'IN_PROGRESS':
    case 'LEARNING':
    case 'PRACTICING':
    case 'PROMOTED':
    case 'MEDIUM':
    case 'SCHEDULED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200'
      dotColor = 'bg-amber-500'
      break
    case 'SUBMITTED':
    case 'NEEDS_EVALUATION':
    case 'PENDING':
      colorClasses = 'bg-[#D9D1F5]/50 text-[#625BEB] border-[#D9D1F5]'
      dotColor = 'bg-[#625BEB]'
      break
    case 'ABSENT':
    case 'FAILED':
    case 'NEEDS_IMPROVEMENT':
    case 'HIGH':
    case 'CRITICAL':
    case 'CLOSED':
    case 'CANCELLED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200'
      dotColor = 'bg-rose-500'
      break
    case 'DRAFT':
    case 'NOT_STARTED':
      colorClasses = 'bg-[#F2F3F5] text-[#85878F] border-[#E9EAF0]'
      dotColor = 'bg-[#85878F]'
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

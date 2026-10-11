import React from 'react'

interface ProgressBarProps {
  value: number // 0 - 100
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'indigo',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const colorMap = {
    indigo: 'bg-[#8B6DE9]',
    emerald: 'bg-[#35C979]',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-[#625BEB]',
  }

  // Auto pick color based on threshold if default
  let barColor = colorMap[color]
  if (color === 'indigo') {
    if (percentage >= 75) barColor = colorMap.emerald
    else if (percentage >= 60) barColor = colorMap.amber
    else barColor = colorMap.rose
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-[#85878F]">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#F2F3F5] border border-[#E9EAF0]/60 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

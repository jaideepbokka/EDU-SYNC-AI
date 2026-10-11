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
      iconBg: 'bg-[#D9D1F5]/40 text-[#625BEB]',
      border: 'hover:border-[#A99AE8]',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-[#35C979]',
      border: 'hover:border-emerald-300',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
    },
    sky: {
      iconBg: 'bg-[#D9D1F5]/40 text-[#8B6DE9]',
      border: 'hover:border-[#8B6DE9]',
    },
    purple: {
      iconBg: 'bg-[#D9D1F5]/40 text-[#8B6DE9]',
      border: 'hover:border-[#8B6DE9]',
    },
  }

  const selected = colorMap[color] || colorMap.indigo

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-[#E9EAF0] p-5 shadow-xs transition-all duration-200 hover:shadow-md ${selected.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#85878F]">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#292C32]">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  trend.neutral
                    ? 'text-[#85878F]'
                    : trend.isPositive
                    ? 'text-[#35C979]'
                    : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#85878F]">
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

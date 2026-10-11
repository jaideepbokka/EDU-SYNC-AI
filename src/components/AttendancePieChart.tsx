'use client'

import React, { useState } from 'react'

export interface PieChartSegment {
  label: string
  value: number
  color: string
  sublabel?: string
}

interface AttendancePieChartProps {
  percentage: number
  totalSessions?: number
  segments?: PieChartSegment[]
  title?: string
  subtitle?: string
}

export function AttendancePieChart({
  percentage,
  totalSessions = 48,
  segments,
  title = 'Attendance Breakdown',
  subtitle = 'Official verified biometric & lecture records',
}: AttendancePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Default breakdown if not provided
  const defaultSegments: PieChartSegment[] = [
    {
      label: 'Present (On Campus)',
      value: Math.round(totalSessions * (percentage / 100)),
      color: '#35C979', // Success green
      sublabel: `${percentage}% of total lectures`,
    },
    {
      label: 'Face ID Verified',
      value: Math.max(1, Math.round(totalSessions * 0.15)),
      color: '#8B6DE9', // Primary purple
      sublabel: '15% Biometric Check-in',
    },
    {
      label: 'Excused / On-Duty',
      value: Math.max(1, Math.round(totalSessions * 0.06)),
      color: '#625BEB', // Indigo
      sublabel: '6% Lab & Seminar OD',
    },
    {
      label: 'Absent / Pending',
      value: Math.max(0, totalSessions - Math.round(totalSessions * (percentage / 100))),
      color: '#E9EAF0', // Light divider grey
      sublabel: `${Math.max(0, 100 - percentage)}% missed sessions`,
    },
  ]

  const chartSegments = segments || defaultSegments
  const totalValue = chartSegments.reduce((acc, s) => acc + s.value, 0) || 1

  // Calculate SVG arc paths
  const radius = 70
  const strokeWidth = 26
  const center = 100
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0

  return (
    <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E9EAF0]">
        <div>
          <h3 className="text-sm font-bold text-[#292C32]">{title}</h3>
          <p className="text-[11px] text-[#85878F]">{subtitle}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
            percentage >= 75
              ? 'bg-emerald-50 text-[#35C979] border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {percentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE'}
        </span>
      </div>

      {/* Donut Chart and Legend Grid */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-around gap-6">
        {/* Donut Chart SVG */}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F2F3F5"
              strokeWidth={strokeWidth}
            />

            {/* Segment Arcs */}
            {chartSegments.map((segment, index) => {
              const segmentRatio = segment.value / totalValue
              const strokeDasharray = `${segmentRatio * circumference} ${circumference}`
              const strokeDashoffset = -cumulativeOffset
              cumulativeOffset += segmentRatio * circumference

              const isHovered = hoveredIndex === index

              return (
                <circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )
            })}
          </svg>

          {/* Center Text Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-black text-[#292C32] tracking-tight">
              {hoveredIndex !== null
                ? `${Math.round((chartSegments[hoveredIndex].value / totalValue) * 100)}%`
                : `${percentage}%`}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#85878F] mt-0.5">
              {hoveredIndex !== null ? chartSegments[hoveredIndex].label.split(' ')[0] : 'Total Attendance'}
            </span>
          </div>
        </div>

        {/* Legend on Right Side (Matching Image 3) */}
        <div className="space-y-3 w-full max-w-xs">
          {chartSegments.map((segment, index) => {
            const segPct = Math.round((segment.value / totalValue) * 100)
            const isHovered = hoveredIndex === index

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered ? 'bg-[#F2F3F5] scale-[1.02]' : 'hover:bg-[#F2F3F5]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="text-xs font-bold text-[#292C32] leading-tight">
                      <span className="font-mono font-black mr-1.5">{segPct}%</span>
                      {segment.label}
                    </p>
                    {segment.sublabel && (
                      <p className="text-[10px] text-[#85878F] leading-tight mt-0.5">
                        {segment.sublabel}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#292C32] shrink-0">
                  {segment.value} {segment.value === 1 ? 'Class' : 'Classes'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="pt-3 border-t border-[#E9EAF0] flex items-center justify-between text-xs text-[#85878F]">
        <span>Total Logged Sessions: <strong className="text-[#292C32] font-mono font-bold">{totalSessions}</strong></span>
        <span>Min. Requirement: <strong className="text-[#292C32] font-mono font-bold">75%</strong></span>
      </div>
    </div>
  )
}

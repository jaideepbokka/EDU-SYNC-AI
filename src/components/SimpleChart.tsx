'use client'

import React from 'react'

interface TrendDataPoint {
  label: string
  value: number
  target?: number
}

interface SimpleLineChartProps {
  data: TrendDataPoint[]
  height?: number
  accentColor?: string
}

export function SimpleLineChart({
  data,
  height = 180,
  accentColor = '#8B6DE9',
}: SimpleLineChartProps) {
  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.value), 100)
  const minValue = 0

  const width = 500
  const paddingX = 40
  const paddingY = 25
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth
    const y = height - paddingY - ((d.value - minValue) / (maxValue - minValue)) * chartHeight
    return { x, y, label: d.label, value: d.value }
  })

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    return `${acc} L ${p.x} ${p.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  return (
    <div className="w-full select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = height - paddingY - (v / 100) * chartHeight
          return (
            <g key={v}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E9EAF0"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-[#85878F] font-mono"
              >
                {v}%
              </text>
            </g>
          )
        })}

        {/* 75% Mandatory Attendance Line */}
        {maxValue >= 75 && (
          <line
            x1={paddingX}
            y1={height - paddingY - (75 / 100) * chartHeight}
            x2={width - paddingX}
            y2={height - paddingY - (75 / 100) * chartHeight}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.8"
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Line curve */}
        <path d={pathD} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ffffff"
              stroke={accentColor}
              strokeWidth="2.5"
              className="transition-transform group-hover:scale-150"
            />
            {/* Label below */}
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="text-[10px] fill-[#85878F] font-medium"
            >
              {p.label}
            </text>
            {/* Value tooltip on hover */}
            <title>{`${p.label}: ${p.value}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string; sublabel?: string }[]
  height?: number
}

export function SimpleBarChart({ data, height = 180 }: SimpleBarChartProps) {
  if (!data || data.length === 0) return null
  const maxValue = Math.max(...data.map((d) => d.value), 10)

  return (
    <div className="flex items-end justify-between gap-3 pt-6" style={{ height }}>
      {data.map((item, idx) => {
        const heightPct = Math.round((item.value / maxValue) * 100)
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[11px] font-bold text-[#292C32] transition-opacity">
              {item.value}
            </span>
            <div className="w-full max-w-[42px] bg-[#F2F3F5] rounded-t-lg overflow-hidden flex items-end h-full">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-85 ${
                  item.color || 'bg-[#8B6DE9]'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-[#85878F] truncate max-w-full text-center">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

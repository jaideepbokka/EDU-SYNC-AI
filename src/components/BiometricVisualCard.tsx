'use client'

import React from 'react'
import Link from 'next/link'
import { Camera, ShieldCheck, Cpu, Scan, CheckCircle2 } from 'lucide-react'

interface BiometricVisualCardProps {
  studentName?: string
  rollNo?: string
  isLive?: boolean
}

export function BiometricVisualCard({
  studentName = 'Student Examinee',
  rollNo = 'CS-2025-089',
  isLive = true,
}: BiometricVisualCardProps) {
  return (
    <div className="rounded-3xl bg-white border border-[#E9EAF0] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
      {/* High-Tech Vector Biometric Visual Stage (NO Photographic Stock Images) */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#292C32] via-[#1E2024] to-[#292C32] p-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle Background Circuit Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#8B6DE9_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        {/* Animated Scan Beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#8B6DE9] to-transparent opacity-75 blur-xs animate-pulse top-1/3" />

        {/* Center Biometric Target HUD */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Outer Pulsing Concentric Rings */}
          <div className="absolute w-28 h-28 rounded-full border border-[#8B6DE9]/30 animate-ping opacity-25" />
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#A99AE8]/60 flex items-center justify-center relative">
            {/* Inner Ring */}
            <div className="w-18 h-18 rounded-full bg-[#8B6DE9]/20 border border-[#8B6DE9] flex items-center justify-center backdrop-blur-xs">
              {/* Vector Face Landmark Icon */}
              <Scan className="w-8 h-8 text-[#A99AE8] animate-pulse" />
            </div>

            {/* Corner Precision Reticle Crosshairs */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#35C979]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#35C979]" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#35C979]" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#35C979]" />
          </div>
        </div>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
          <Cpu className="w-3 h-3 text-[#A99AE8]" />
          <span>ArcFace 128-D Neural HUD</span>
        </div>

        {/* Bottom Floating Status Tag */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-[#35C979] text-white text-[10px] font-bold shadow-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Anti-Proxy Sensor Active</span>
          </span>
          <span className="text-[10px] font-mono text-[#D9D1F5] font-bold">
            GPS Geofence: OK
          </span>
        </div>
      </div>

      {/* Description & Action */}
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#292C32]">Biometric Face Check-In</h3>
          <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
        </div>
        <p className="text-xs text-[#85878F] leading-relaxed">
          High-precision MediaPipe face mesh matched against verified student enrollment templates with campus geofence auditing.
        </p>

        <Link
          href="/student/attendance"
          className="w-full py-3 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 mt-2 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#A99AE8]" />
          <span>Open Biometric Sensor</span>
        </Link>
      </div>
    </div>
  )
}

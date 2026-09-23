'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  Video,
  Camera,
  Award,
  LogOut,
} from 'lucide-react'

interface StudentNavProps {
  user: any
}

export function StudentNav({ user }: StudentNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: 'Student Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Learning Courses', href: '/student/courses', icon: Video },
    { label: 'Face GPS Check-In', href: '/student/attendance', icon: Camera },
    { label: 'Assessments Room', href: '/student/assessments', icon: Award },
  ]

  return (
    <header className="border-b border-[#383C3F] bg-[#151718]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/student" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E5CB90] via-[#EBD4A4] to-[#FFF3C8] flex items-center justify-center text-[#151718] font-bold shadow-md shadow-[#E5CB90]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#FCFBF7] flex items-center gap-1.5">
                EduSync <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] font-bold border border-[#E5CB90]/30">STUDENT</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E5CB90] to-[#FFF3C8] text-[#151718] font-black shadow-md shadow-[#E5CB90]/20'
                    : 'text-[#D8D4CA] hover:text-[#FCFBF7] hover:bg-[#222527]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#151718]' : 'text-[#E5CB90]'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Student Profile Pill & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222527] border border-[#383C3F]">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#E5CB90]/20 text-[#E5CB90] font-bold text-xs flex items-center justify-center">
              {user.name?.charAt(0) || 'S'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#FCFBF7] leading-tight">{user.name}</p>
              <p className="text-[10px] text-[#FFF3C8] leading-tight font-mono">{user.designation}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out of student portal"
            className="p-2 rounded-xl text-[#A8ACAF] hover:text-[#E5CB90] hover:bg-[#222527] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  FileSpreadsheet,
  Mail,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'

interface HodLayoutWrapperProps {
  user: any
  children: React.ReactNode
}

export function HodLayoutWrapper({ user, children }: HodLayoutWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  const navItems = [
    {
      label: 'Department Overview',
      href: '/hod',
      icon: LayoutDashboard,
    },
    {
      label: 'CSE Student Directory',
      href: '/hod/students',
      icon: Users,
    },
    {
      label: 'Section-wise Analytics',
      href: '/hod/analytics',
      icon: BarChart3,
    },
    {
      label: 'Faculty Management',
      href: '/hod/faculty',
      icon: BookOpen,
    },
    {
      label: 'Teaching Assignments',
      href: '/hod/assignments',
      icon: Settings,
    },
    {
      label: 'Faculty Mails & Notices',
      href: '/hod/mails',
      icon: Mail,
    },
    {
      label: 'Export Reports (CSV/PDF)',
      href: '/hod/reports',
      icon: FileSpreadsheet,
    },
  ]

  const userName = user?.name || 'Dr. K. Karthikeya'
  const userInitial = userName.replace('Dr. ', '').charAt(0).toLowerCase() || 'k'

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#F4FBF9] text-[#292C32] p-5">
      <div className="space-y-6">
        {/* HOD Profile Header */}
        <div className="pt-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0F766E]/80">
            HOD PORTAL
          </p>
          <h2 className="text-lg font-black text-[#134E4A] tracking-tight mt-0.5 truncate">
            {userName}
          </h2>
          <p className="text-xs text-[#0D9488] font-semibold">
            CSE • Head of Department
          </p>
        </div>

        {/* Navigation items matching reference image */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-xs'
                    : 'text-[#334155] hover:bg-[#E6F7F3] hover:text-[#0F766E]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0D9488]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Branding & Sign Out */}
      <div className="pt-4 border-t border-[#D9EFEA] text-[11px] text-[#64748B] flex flex-col gap-3">
        <p className="font-bold text-[#0F766E]">EduSync AI • CSE Department</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-[#D9EFEA] hover:border-rose-200 text-rose-600 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0FDF9] text-[#1E293B] flex flex-col selection:bg-[#14B8A6] selection:text-white">
      {/* 1. FULL-WIDTH TOP HEADER (Spans 100% of top, exact match to reference screenshot) */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        {/* Left Brand: CampusConnect [BVC CSE] - Bonam Venkata Chalamaya Engineering College */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/hod" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#134E4A] flex items-center gap-1.5">
                  EduSync <span className="text-xs px-2 py-0.5 rounded-md bg-[#CCFBF1] text-[#0D9488] font-black border border-[#99F6E4]">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100/70 text-[#0F766E] font-bold border border-teal-200">
                  HOD CSE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#64748B] leading-tight">
                Academic Operations & Biometric Management Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Right User Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-[#1E293B]">{userName}</span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#F1F5F9] text-[#475569] font-bold">
                Department HOD
              </span>
              <span className="text-[10px] font-bold text-[#0D9488]">CSE</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#CCFBF1] text-[#0D9488] font-black text-xs flex items-center justify-center border border-[#99F6E4] shadow-2xs">
            {userInitial}
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-[#64748B] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER: SIDEBAR (Left) + MAIN VIEWPORT (Right) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-61px)]">
        {/* Desktop Fixed Left Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-[#D9EFEA] bg-[#F4FBF9] sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Mobile Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] h-full bg-[#F4FBF9] z-10 shadow-2xl">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

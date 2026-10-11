'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  GraduationCap,
  Users,
  ArrowRight,
  Sparkles,
  Camera,
  AlertTriangle,
  KeyRound,
} from 'lucide-react'

interface LoginDashboardClientProps {
  initialRole?: 'FACULTY' | 'STUDENT'
  errorMessage?: string
}

export function LoginDashboardClient({
  initialRole = 'FACULTY',
  errorMessage,
}: LoginDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'FACULTY' | 'STUDENT'>(initialRole)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorMessage || '')

  const handleLogin = async (loginId: string, role = activeTab) => {
    setError('')
    const finalId = loginId.trim()
    if (!finalId) {
      setError(
        role === 'FACULTY'
          ? 'Please enter your Faculty ID (e.g. FAC101).'
          : 'Please enter your Student Roll Number (e.g. 101).'
      )
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalId,
          role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.')
      }

      // Hard redirect to load role layouts cleanly
      window.location.href = data.redirectUrl || (role === 'STUDENT' ? '/student' : '/faculty')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(identifier, activeTab)
  }

  return (
    <div className="relative min-h-screen bg-[#F2F3F5] text-[#292C32] flex flex-col justify-between overflow-hidden selection:bg-[#8B6DE9] selection:text-white">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#A99AE8]/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D9D1F5]/25 blur-3xl" />
      </div>

      {/* Top Global Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#8B6DE9]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#292C32] flex items-center gap-2">
              EduSync <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#D9D1F5]/50 text-[#625BEB] font-bold border border-[#D9D1F5]">AI</span>
            </span>
            <p className="text-[11px] text-[#85878F] font-medium">Academic Management & Student Biometric Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white border border-[#E9EAF0] shadow-xs text-[#292C32]">
          <span className="w-2 h-2 rounded-full bg-[#35C979] animate-pulse" />
          <span>Institutional SSO • AY 2025-26</span>
        </div>
      </header>

      {/* Centerpiece: Dual Login Dashboard */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center my-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual System Highlights */}
          <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9D1F5]/40 border border-[#D9D1F5] text-[#625BEB] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#8B6DE9]" />
              <span>Institutional University Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#292C32] leading-tight tracking-tight">
              Single Sign-On for Campus Operations
            </h1>

            <p className="text-xs text-[#85878F] leading-relaxed">
              Authenticate with your verified university credentials to access the academic operations dashboard or student biometric classroom.
            </p>

            {/* Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E9EAF0] flex items-center gap-3.5 shadow-xs">
                <div className="p-2 rounded-xl bg-[#D9D1F5]/40 text-[#625BEB]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292C32]">Biometric Facial Verification</h4>
                  <p className="text-[11px] text-[#85878F]">Anti-spoofing liveness audit with campus GPS bounds</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E9EAF0] flex items-center gap-3.5 shadow-xs">
                <div className="p-2 rounded-xl bg-[#D9D1F5]/40 text-[#8B6DE9]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292C32]">Bloom's AI Question Engine</h4>
                  <p className="text-[11px] text-[#85878F]">Cognitive assessment generation with rubrics</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E9EAF0] flex items-center gap-3.5 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#35C979]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292C32]">Zero-Trust Access Control</h4>
                  <p className="text-[11px] text-[#85878F]">Strict session cryptographic signing on every request</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Login Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-white border border-[#E9EAF0] p-7 sm:p-9 shadow-xl shadow-[#292C32]/5 space-y-6">
              {/* Tab Selector */}
              <div className="flex rounded-2xl bg-[#F2F3F5] p-1.5 border border-[#E9EAF0]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('FACULTY')
                    setIdentifier('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'FACULTY'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('STUDENT')
                    setIdentifier('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'STUDENT'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student Portal</span>
                </button>
              </div>

              {/* Header Title */}
              <div>
                <h2 className="text-xl font-black text-[#292C32]">
                  {activeTab === 'FACULTY' ? 'Faculty Sign-In' : 'Student Sign-In'}
                </h2>
                <p className="text-xs text-[#85878F] mt-1">
                  {activeTab === 'FACULTY'
                    ? 'Enter your institutional Faculty ID to access the portal.'
                    : 'Enter your Student Roll Number to access your dashboard.'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
                    {activeTab === 'FACULTY' ? 'Faculty ID *' : 'Student Roll Number *'}
                  </label>
                  <div className="relative">
                    {activeTab === 'FACULTY' ? (
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    ) : (
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    )}
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeTab === 'FACULTY' ? 'e.g. FAC101' : 'e.g. 101'}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:border-[#8B6DE9] focus:bg-white focus:ring-2 focus:ring-[#8B6DE9]/20 transition-all font-medium"
                    />
                  </div>

                  {/* Quick Select demo pills */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#85878F]">Sample ID:</span>
                    {(activeTab === 'FACULTY'
                      ? [
                          { label: 'FAC101', name: 'Dr. Anil' },
                          { label: 'FAC102', name: 'Mrs. Priya' },
                          { label: 'FAC103', name: 'Mr. Ravi' },
                        ]
                      : [
                          { label: '101', name: 'Aarav' },
                          { label: '102', name: 'Ananya' },
                          { label: '103', name: 'Rohan' },
                        ]
                    ).map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setIdentifier(item.label)
                          setError('')
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-[#F2F3F5] hover:bg-[#D9D1F5]/50 hover:text-[#625BEB] text-[#292C32] font-semibold border border-[#E9EAF0] transition-colors cursor-pointer"
                      >
                        {item.label} <span className="text-[10px] text-[#85878F]">({item.name})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] active:scale-[0.99] shadow-md shadow-[#292C32]/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-4"
                >
                  {loading ? (
                    <span>Verifying ID...</span>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'FACULTY' ? 'Sign In to Faculty Portal' : 'Sign In to Student Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Clean Footer Notice */}
              <div className="pt-4 border-t border-[#E9EAF0] flex items-center justify-center gap-2 text-[11px] text-[#85878F]">
                <KeyRound className="w-3.5 h-3.5 text-[#8B6DE9]" />
                <span>Instant Institutional Authentication • AY 2025-26</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#85878F] border-t border-[#E9EAF0]">
        <p>© 2026 EduSync AI Academic Operations. All rights reserved.</p>
        <p className="text-[11px] text-[#85878F]">
          Strict role-based access control. Unauthorized access prohibited.
        </p>
      </footer>
    </div>
  )
}

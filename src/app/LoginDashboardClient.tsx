'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react'

interface LoginDashboardClientProps {
  initialRole?: 'HOD' | 'FACULTY' | 'STUDENT'
  errorMessage?: string
}

export function LoginDashboardClient({
  initialRole = 'HOD',
  errorMessage,
}: LoginDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'HOD' | 'FACULTY' | 'STUDENT'>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorMessage || '')

  const handleLogin = async (loginEmail: string, loginPass?: string, role = activeTab) => {
    setError('')
    setLoading(true)

    const finalEmail = (loginEmail || '').trim()
    const finalPass = loginPass || ''

    if (!finalEmail || !finalPass) {
      setError('Please enter both your institutional ID/email and password.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          password: finalPass,
          role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.')
      }

      // Hard redirect to load role layouts cleanly
      window.location.href = data.redirectUrl || (role === 'STUDENT' ? '/student' : role === 'HOD' ? '/hod' : '/faculty')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(email, password, activeTab)
  }

  const fillHodDemo = () => {
    setEmail('HODCSE001@gmail.com')
    setPassword('HOD001')
    setError('')
  }

  const fillStudentDemo = () => {
    setEmail('24221A0519')
    setPassword('24221A0519')
    setError('')
  }

  const fillFacultyDemo = () => {
    setEmail('FAC101EDUSYNC@gmail.com')
    setPassword('101')
    setError('')
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
              <div className="flex rounded-2xl bg-[#F2F3F5] p-1.5 border border-[#E9EAF0] gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('HOD')
                    setEmail('HODCSE001@gmail.com')
                    setPassword('HOD001')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'HOD'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HOD Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('FACULTY')
                    setEmail('')
                    setPassword('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'FACULTY'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('STUDENT')
                    setEmail('')
                    setPassword('')
                    setError('')
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'STUDENT'
                      ? 'bg-[#292C32] text-white shadow-md'
                      : 'text-[#85878F] hover:text-[#292C32]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
              </div>

              {/* Header Title & Demo Helper */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#292C32]">
                    {activeTab === 'HOD' ? 'HOD Department Login' : activeTab === 'FACULTY' ? 'Faculty Sign-In' : 'Student Sign-In'}
                  </h2>
                  {activeTab === 'HOD' && (
                    <button
                      type="button"
                      onClick={fillHodDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      Fill HOD Demo
                    </button>
                  )}
                  {activeTab === 'STUDENT' && (
                    <button
                      type="button"
                      onClick={fillStudentDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      Demo: Bokka Jaideep (24221A0519)
                    </button>
                  )}
                  {activeTab === 'FACULTY' && (
                    <button
                      type="button"
                      onClick={fillFacultyDemo}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Fill Faculty Demo
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#85878F] mt-1">
                  {activeTab === 'HOD'
                    ? 'Use HODCSE001@gmail.com with pass HOD001 to access EduSync AI HOD Portal.'
                    : activeTab === 'FACULTY'
                    ? 'Enter your institutional faculty email or Faculty ID.'
                    : 'Enter your student email or Roll Number.'}
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
                    Institutional Email or ID *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:border-[#8B6DE9] focus:bg-white focus:ring-2 focus:ring-[#8B6DE9]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292C32] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:border-[#8B6DE9] focus:bg-white focus:ring-2 focus:ring-[#8B6DE9]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878F] hover:text-[#292C32] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#85878F]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#8B6DE9] rounded-sm"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[#8B6DE9] hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-[#292C32] hover:bg-[#1E2024] active:scale-[0.99] shadow-md shadow-[#292C32]/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'HOD'
                          ? 'Sign In to HOD Department Portal'
                          : activeTab === 'FACULTY'
                          ? 'Sign In to Faculty Portal'
                          : 'Sign In to Student Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Clean Footer Notice */}
              <div className="pt-4 border-t border-[#E9EAF0] flex items-center justify-center gap-2 text-[11px] text-[#85878F]">
                <KeyRound className="w-3.5 h-3.5 text-[#8B6DE9]" />
                <span>End-to-end encrypted session • Institutional Zero-Trust SSO</span>
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

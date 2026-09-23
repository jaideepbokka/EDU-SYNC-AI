'use client'

import React, { useState } from 'react'
import { FacultySidebar } from './FacultySidebar'
import { FacultyHeader } from './FacultyHeader'

interface FacultyLayoutWrapperProps {
  children: React.ReactNode
  pendingEvaluationsCount?: number
  atRiskCount?: number
  activeSessionExists?: boolean
  userName?: string
  userDesignation?: string
  userAvatar?: string
  notifications?: any[]
}

export function FacultyLayoutWrapper({
  children,
  pendingEvaluationsCount = 1,
  atRiskCount = 3,
  activeSessionExists = true,
  userName = 'Dr. Arvind Sharma',
  userDesignation = 'Professor & HOD, CSE',
  userAvatar,
  notifications = [],
}: FacultyLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Sidebar */}
      <FacultySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingEvaluationsCount={pendingEvaluationsCount}
        atRiskCount={atRiskCount}
        activeSessionExists={activeSessionExists}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <FacultyHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          userDesignation={userDesignation}
          userAvatar={userAvatar}
          notifications={notifications}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

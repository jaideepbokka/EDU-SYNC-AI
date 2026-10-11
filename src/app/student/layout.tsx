import React from 'react'
import { requireStudentUser } from '@/lib/auth'
import { StudentNav } from '@/components/StudentNav'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStudentUser()

  return (
    <div className="min-h-screen bg-[#F2F3F5] text-[#292C32] flex flex-col md:flex-row selection:bg-[#8B6DE9] selection:text-white">
      {/* Vertical Sidebar */}
      <StudentNav user={user} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

import React from 'react'
import Link from 'next/link'
import { requireStudentUser } from '@/lib/auth'
import { StudentNav } from '@/components/StudentNav'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStudentUser()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <StudentNav user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}

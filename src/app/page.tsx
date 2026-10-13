import React from 'react'
import fs from 'fs'
import path from 'path'
import { LoginDashboardClient } from './LoginDashboardClient'
import { WelcomeClient } from './welcome/WelcomeClient'

export const metadata = {
  title: 'Welcome to EduSync AI | Next-Gen Academic Portal',
  description: 'Single sign-on authentication terminal for faculty operations and student biometric attendance.',
}

function getInitialCustomVideo(): string | null {
  try {
    const configPath = path.join(process.cwd(), 'public', 'custom_video_config.json')
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (data && data.url) {
        return data.url
      }
    }
  } catch {}
  return null
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = await searchParams
  const roleParam = typeof query.role === 'string' ? query.role.toUpperCase() : 'FACULTY'
  const errorParam = typeof query.error === 'string' ? query.error : undefined

  // If coming directly from the completed or skipped welcome intro, or accessing a specific role/error,
  // display the authentication dashboard directly
  const isDirectLogin =
    query.from === 'welcome' ||
    query.from === 'skip' ||
    query.auth === 'login' ||
    Boolean(query.role) ||
    Boolean(query.error)

  if (!isDirectLogin) {
    const initialVideoUrl = getInitialCustomVideo()
    return <WelcomeClient initialVideoUrl={initialVideoUrl} />
  }

  let errorMsg = ''
  if (errorParam === 'login_required') {
    errorMsg = 'Please sign in to access this portal.'
  } else if (errorParam === 'unauthorized' || errorParam === 'faculty_access_only' || errorParam === 'student_access_only') {
    errorMsg = 'Access denied'
  }

  return (
    <LoginDashboardClient
      initialRole={roleParam === 'STUDENT' ? 'STUDENT' : 'FACULTY'}
      errorMessage={errorMsg}
    />
  )
}

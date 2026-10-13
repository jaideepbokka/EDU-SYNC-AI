import React from 'react'
import type { Metadata } from 'next'
import { WelcomeClient } from './WelcomeClient'

export const metadata: Metadata = {
  title: 'Welcome to EduSync — 10-Second 4K 3D Motion Graphics',
  description: 'Welcome to EduSync AI Next-Generation Academic & Biometric Ecosystem.',
}

export default function WelcomePage() {
  return <WelcomeClient />
}

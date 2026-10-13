import React from 'react'
import type { Metadata } from 'next'
import { WelcomeClient } from './WelcomeClient'

export const metadata: Metadata = {
  title: 'Welcome to Edusing — 10-Second Modern Motion Graphics',
  description: 'Welcome to Edusing AI Academic & Biometric Operations Suite.',
}

export default function WelcomePage() {
  return <WelcomeClient />
}

import React from 'react'
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { WelcomeClient } from './WelcomeClient'

export const metadata: Metadata = {
  title: 'Welcome to EduSync — Next-Gen Academic Ecosystem',
  description: 'Welcome to EduSync AI Next-Generation Academic & Biometric Ecosystem.',
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

export default function WelcomePage() {
  const initialVideoUrl = getInitialCustomVideo()
  return <WelcomeClient initialVideoUrl={initialVideoUrl} />
}

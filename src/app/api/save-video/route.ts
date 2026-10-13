import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public directory
    const publicPath = path.join(process.cwd(), 'public', 'edusing_welcome_10s.webm')
    fs.writeFileSync(publicPath, buffer)

    // Also save into artifacts directory
    const artifactsDir = 'C:\\Users\\jdeep\\.gemini\\antigravity-ide\\brain\\c66872de-887f-4ea6-a0b1-47f4335dfb31'
    try {
      if (fs.existsSync(artifactsDir)) {
        fs.writeFileSync(path.join(artifactsDir, 'edusing_welcome_10s.webm'), buffer)
      }
    } catch (e) {
      console.warn('Could not copy to artifacts dir:', e)
    }

    return NextResponse.json({
      success: true,
      size: buffer.length,
      path: '/edusing_welcome_10s.webm',
    })
  } catch (err: any) {
    console.error('Error saving video:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

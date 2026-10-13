import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'public', 'custom_video_config.json')

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
      return NextResponse.json({ customVideo: data })
    }
    return NextResponse.json({ customVideo: null })
  } catch (err: any) {
    return NextResponse.json({ customVideo: null })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File | null
    const videoUrl = formData.get('url') as string | null

    if (videoUrl) {
      const config = {
        type: 'url',
        url: videoUrl,
        name: 'Remote Video URL',
        updatedAt: Date.now(),
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
      return NextResponse.json({ success: true, config })
    }

    if (!file) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || '.mp4'
    const fileName = `custom_welcome_video${ext}`
    const filePath = path.join(process.cwd(), 'public', fileName)

    fs.writeFileSync(filePath, buffer)

    const config = {
      type: 'file',
      url: `/${fileName}`,
      name: file.name,
      size: buffer.length,
      updatedAt: Date.now(),
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

    return NextResponse.json({ success: true, config })
  } catch (err: any) {
    console.error('Error uploading custom video:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
      if (data.url && data.url.startsWith('/custom_welcome_video')) {
        const filePath = path.join(process.cwd(), 'public', data.url.replace('/', ''))
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
      fs.unlinkSync(CONFIG_FILE)
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

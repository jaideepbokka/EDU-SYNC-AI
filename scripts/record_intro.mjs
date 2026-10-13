import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const TARGET_URL = 'http://localhost:3000/welcome?noredirect=1'
const VIDEO_PATH = path.join(process.cwd(), 'public', 'edusing_welcome_10s.webm')

async function run() {
  console.log('--- Launching Chrome via Puppeteer-Core ---')
  console.log('Chrome Path:', CHROME_PATH)
  console.log('Target URL:', TARGET_URL)

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1280,720',
      '--use-fake-ui-for-media-stream',
    ],
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  })

  try {
    const page = await browser.newPage()
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
    page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message))

    console.log('Navigating to welcome page...')
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    console.log('Page loaded. Waiting for 10-second animation and video generation...')
    
    // Wait for the video to be saved and recorded
    let recorded = false
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      const isSaved = await page.evaluate(() => Boolean(window.__VIDEO_SAVED)).catch(() => false)
      if (isSaved || (fs.existsSync(VIDEO_PATH) && fs.statSync(VIDEO_PATH).size > 10000)) {
        console.log(`Video captured and saved at iteration ${i + 1}s!`)
        recorded = true
        break
      }
      process.stdout.write(`Elapsed: ${i + 1}s...\r`)
    }

    if (fs.existsSync(VIDEO_PATH)) {
      const stats = fs.statSync(VIDEO_PATH)
      console.log(`SUCCESS: Video generated at ${VIDEO_PATH} (${(stats.size / 1024 / 1024).toFixed(2)} MB, ${stats.size} bytes)`)
    } else {
      console.error('File not found in public/ directory yet.')
    }
  } finally {
    await browser.close()
    console.log('Browser closed.')
  }
}

run().catch((err) => {
  console.error('Execution error:', err)
  process.exit(1)
})

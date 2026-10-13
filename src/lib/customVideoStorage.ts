// IndexedDB & LocalStorage Utility for Storing and Retrieving Custom Welcome Videos
// Supports high-definition MP4, WebM, MOV files with no size limits.

const DB_NAME = 'edusync_media_db'
const DB_VERSION = 1
const STORE_NAME = 'custom_videos'
const KEY_NAME = 'active_welcome_video'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'))
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface CustomVideoData {
  blob: Blob
  name: string
  type: string
  size: number
  updatedAt: number
}

export async function saveCustomVideo(file: File | Blob, fileName?: string): Promise<void> {
  try {
    const db = await openDB()
    const name = fileName || (file instanceof File ? file.name : 'custom_video.mp4')
    const type = file.type || 'video/mp4'

    const data: CustomVideoData = {
      blob: file,
      name,
      type,
      size: file.size,
      updatedAt: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(data, KEY_NAME)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('edusync_custom_video_reset')
      localStorage.setItem('edusync_has_custom_video', 'true')
      localStorage.setItem('edusync_custom_video_name', name)
    }
  } catch (err) {
    console.warn('Could not save video to IndexedDB:', err)
    throw err
  }
}

export async function getCustomVideo(): Promise<{ url: string; data: CustomVideoData } | null> {
  try {
    if (typeof window === 'undefined') return null
    if (isCustomVideoReset()) return null

    const db = await openDB()

    const data = await new Promise<CustomVideoData | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(KEY_NAME)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })

    if (!data || !data.blob) {
      if (isCustomVideoReset()) return null

      // Check localStorage for URL fallback
      const urlFallback = typeof localStorage !== 'undefined' ? localStorage.getItem('edusync_custom_video_url') : null
      if (urlFallback) {
        return {
          url: urlFallback,
          data: {
            blob: new Blob([]),
            name: 'Remote URL Video',
            type: 'video/mp4',
            size: 0,
            updatedAt: Date.now(),
          },
        }
      }

      return null
    }

    const url = URL.createObjectURL(data.blob)
    return { url, data }
  } catch (err) {
    console.warn('Could not retrieve custom video:', err)
    return null
  }
}

export async function removeCustomVideo(): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('edusync_custom_video_reset', 'true')
      localStorage.removeItem('edusync_has_custom_video')
      localStorage.removeItem('edusync_custom_video_name')
      localStorage.removeItem('edusync_custom_video_url')
    }
    if (typeof window === 'undefined') return
    const db = await openDB()

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(KEY_NAME)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    })
  } catch (err) {
    console.warn('Could not remove custom video:', err)
  }
}

export function saveCustomVideoUrl(url: string, name?: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('edusync_custom_video_reset')
    localStorage.setItem('edusync_has_custom_video', 'true')
    localStorage.setItem('edusync_custom_video_url', url)
    localStorage.setItem('edusync_custom_video_name', name || 'Web Video URL')
  }
}

export function isCustomVideoReset(): boolean {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('edusync_custom_video_reset') === 'true'
  }
  return false
}

export function hasCustomVideoSync(): boolean {
  if (typeof localStorage !== 'undefined') {
    if (isCustomVideoReset()) return false
    return localStorage.getItem('edusync_has_custom_video') === 'true'
  }
  return false
}

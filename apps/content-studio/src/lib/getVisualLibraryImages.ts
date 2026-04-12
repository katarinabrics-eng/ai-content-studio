import fs from 'fs'
import path from 'path'

export interface VisualPhoto {
  src: string
  label: string
  liked?: boolean
}

const LABELS: Record<string, string> = {
  K01: 'Reels vibe',
  K02: 'Brand detail',
  K03: 'Reels portrait',
  K04: 'Food lifestyle',
  K05: 'Story moment',
  K09: 'Quote post',
  K10: 'Carousel BG',
}

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

export function getVisualLibraryImages(limit = 24): VisualPhoto[] {
  const baseDir = path.join(process.cwd(), 'public', 'placeholders', 'stock-vizualni knihovna')
  const result: VisualPhoto[] = []

  try {
    const folders = fs.readdirSync(baseDir).sort()

    for (const folder of folders) {
      const folderPath = path.join(baseDir, folder)
      if (!fs.statSync(folderPath).isDirectory()) continue

      const files = fs.readdirSync(folderPath)
        .filter(f => IMG_EXTS.includes(path.extname(f).toLowerCase()))
        .sort()

      for (const file of files) {
        result.push({
          src: `/placeholders/stock-vizualni knihovna/${folder}/${file}`,
          label: LABELS[folder] ?? folder,
          liked: false,
        })
        if (result.length >= limit) return result
      }
    }
  } catch (e) {
    console.error('getVisualLibraryImages error:', e)
  }

  return result
}

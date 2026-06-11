import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public/placeholders/stock-vizualni knihovna')
    const folders = fs.readdirSync(baseDir)
      .filter(f => f.match(/^K\d+$/) && fs.statSync(path.join(baseDir, f)).isDirectory())
      .sort()

    const collections = folders.map(folder => {
      const folderPath = path.join(baseDir, folder)
      const infoPath = path.join(folderPath, 'info.json')

      let info: Record<string, unknown> = { id: folder.toLowerCase(), label: folder }
      try {
        info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'))
      } catch {
        // info.json chybí — použij fallback
      }

      const photos = fs.readdirSync(folderPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()
        .slice(0, 16)
        .map(f => `/placeholders/stock-vizualni knihovna/${folder}/${f}`)

      return { ...info, photos, folder }
    })

    return NextResponse.json({ collections })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

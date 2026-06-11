import { NextRequest, NextResponse } from 'next/server'
import { downloadFileAsBuffer } from '@/lib/google-drive/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')
  const mimeType = searchParams.get('mimeType') || 'image/jpeg'

  if (!fileId) {
    return NextResponse.json({ error: 'chybí fileId' }, { status: 400 })
  }

  try {
    const buffer = await downloadFileAsBuffer(fileId)
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

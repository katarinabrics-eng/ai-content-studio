import { NextResponse } from 'next/server'
import { getVisualLibraryImages } from '@/lib/getVisualLibraryImages'

export async function GET() {
  const photos = getVisualLibraryImages(24)
  return NextResponse.json({ photos })
}

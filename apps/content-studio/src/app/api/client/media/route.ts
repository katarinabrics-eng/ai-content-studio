import { NextRequest, NextResponse } from 'next/server'
import { listFolderContents } from '@/lib/google-drive/client'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectCode = searchParams.get('projectCode')
  const type = searchParams.get('type') || 'all'

  if (!projectCode) {
    return NextResponse.json({ error: 'chybí projectCode' }, { status: 400 })
  }

  try {
    const { data: project } = await supabase
      .from('client_projects')
      .select('id, name, drive_folder_id, brand_colors')
      .eq('short_code', projectCode)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'projekt nenalezen' }, { status: 404 })
    }

    const { data: driveConfig } = await supabase
      .from('client_drive_config')
      .select('*')
      .eq('client_project_id', project.id)
      .single()

    let folderId = driveConfig?.folder_id || project.drive_folder_id

    if (!folderId) {
      folderId = '1tl0_AbkCbBfGIcY6A607KpoLDHxAVL-u'
    }

    const files = await listFolderContents(folderId)

    const mediaTypes: Record<string, string[]> = {
      photo: ['jpg','jpeg','png','webp','heic'],
      video: ['mp4','mov','avi','webm'],
      broll: [],
      illustration: ['svg','ai','pdf'],
      template: [],
    }

    const categorized = files.map((f: any) => {
      const ext = f.name?.split('.').pop()?.toLowerCase() || ''
      const mimeType = f.mimeType || ''
      let fileType = 'other'

      if (mediaTypes.photo.includes(ext) || mimeType.startsWith('image/')) {
        fileType = 'photo'
      } else if (mediaTypes.video.includes(ext) || mimeType.startsWith('video/')) {
        fileType = 'video'
      } else if (mediaTypes.illustration.includes(ext)) {
        fileType = 'illustration'
      }

      const folderName = f.subfolder?.toLowerCase() || ''
      if (folderName.includes('broll') || folderName.includes('b-roll')) {
        fileType = 'broll'
      }
      if (folderName.includes('sablony') || folderName.includes('šablony') || folderName.includes('template')) {
        fileType = 'template'
      }

      return {
        id: f.id,
        name: f.name,
        fileType,
        mimeType: f.mimeType,
        thumbnailUrl: f.thumbnailLink || null,
        webViewLink: f.webViewLink || null,
        subfolder: f.subfolder || null,
        createdAt: f.createdTime || null,
      }
    })

    const filtered = type === 'all'
      ? categorized
      : categorized.filter((f: any) => f.fileType === type)

    const photos = filtered.filter((f: any) => f.fileType === 'photo')
    const videos = filtered.filter((f: any) => f.fileType === 'video')
    const broll = filtered.filter((f: any) => f.fileType === 'broll')
    const illustrations = filtered.filter((f: any) => f.fileType === 'illustration')
    const templates = filtered.filter((f: any) => f.fileType === 'template')

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        brandColors: project.brand_colors || [],
      },
      stats: {
        total: filtered.length,
        photos: photos.length,
        videos: videos.length,
        broll: broll.length,
        illustrations: illustrations.length,
        templates: templates.length,
      },
      media: filtered,
    })

  } catch (error: any) {
    console.error('Media API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

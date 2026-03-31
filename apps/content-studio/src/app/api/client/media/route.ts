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
  const token = searchParams.get('token') || ''
  const type = searchParams.get('type') || 'all'

  if (!projectCode) {
    return NextResponse.json({ error: 'chybí projectCode' }, { status: 400 })
  }

  try {
    let project: { id: string; name: string; drive_folder_id: string | null; brand_colors: string[] | null } | null = null

    // 1. Zkus RTG auth (short_code + access_token)
    if (token) {
      const { data } = await supabase
        .from('client_projects')
        .select('id, client_name, google_drive_folder_id, brand_colors')
        .eq('short_code', projectCode)
        .eq('access_token', token)
        .single()

      if (data) {
        project = {
          id: data.id,
          name: data.client_name || projectCode,
          drive_folder_id: data.google_drive_folder_id || null,
          brand_colors: data.brand_colors || [],
        }
      }
    }

    // 2. Zkus magic link auth (client_projects bez tokenu nebo přes client_access_links)
    if (!project) {
      const { data } = await supabase
        .from('client_projects')
        .select('id, client_name, google_drive_folder_id, brand_colors, client_token')
        .eq('short_code', projectCode)
        .single()

      if (data) {
        // Pokud máme token, ověř že matchuje client_token (magic link)
        if (token && data.client_token && data.client_token !== token) {
          return NextResponse.json({ error: 'Neplatný přístup' }, { status: 401 })
        }
        project = {
          id: data.id,
          name: data.client_name || projectCode,
          drive_folder_id: data.google_drive_folder_id || null,
          brand_colors: data.brand_colors || [],
        }
      }
    }

    if (!project) {
      return NextResponse.json({ error: 'projekt nenalezen nebo neplatný přístup' }, { status: 404 })
    }

    // Načti Drive konfiguraci
    const { data: driveConfig } = await supabase
      .from('client_drive_config')
      .select('*')
      .eq('client_project_id', project.id)
      .single()

    let folderId = driveConfig?.folder_id || project.drive_folder_id

    if (!folderId) {
      // fallback na vizuální banku
      folderId = '1tl0_AbkCbBfGIcY6A607KpoLDHxAVL-u'
    }

    const files = await listFolderContents(folderId)

    const mediaTypes: Record<string, string[]> = {
      photo: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      video: ['mp4', 'mov', 'avi', 'webm'],
      broll: [],
      illustration: ['svg', 'ai', 'pdf'],
      template: [],
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (folderName.includes('broll') || folderName.includes('b-roll')) fileType = 'broll'
      if (folderName.includes('sablony') || folderName.includes('šablony') || folderName.includes('template')) fileType = 'template'

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = type === 'all' ? categorized : categorized.filter((f: any) => f.fileType === type)

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        brandColors: project.brand_colors || [],
      },
      stats: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        total: filtered.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        photos: filtered.filter((f: any) => f.fileType === 'photo').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        videos: filtered.filter((f: any) => f.fileType === 'video').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        broll: filtered.filter((f: any) => f.fileType === 'broll').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        illustrations: filtered.filter((f: any) => f.fileType === 'illustration').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templates: filtered.filter((f: any) => f.fileType === 'template').length,
      },
      media: filtered,
    })

  } catch (error: unknown) {
    console.error('Media API error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Chyba serveru' }, { status: 500 })
  }
}

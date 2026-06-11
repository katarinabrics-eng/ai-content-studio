import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const contentType = req.headers.get('content-type') ?? ''

  let logoUrl: string | undefined
  let brandColor: string | undefined

  if (contentType.includes('multipart/form-data')) {
    // File upload path
    const form = await req.formData()
    brandColor = (form.get('brand_color') as string) || undefined

    // Email banner upload
    const bannerFile = form.get('email_banner') as File | null
    if (bannerFile && bannerFile.size > 0) {
      const ext = bannerFile.name.split('.').pop() ?? 'jpg'
      const path = `banner-${event.id}-${Date.now()}.${ext}`
      const bytes = await bannerFile.arrayBuffer()
      await supabaseAdmin.storage.createBucket('logos', { public: true }).catch(() => {})
      const { error } = await supabaseAdmin.storage
        .from('logos')
        .upload(path, bytes, { contentType: bannerFile.type, upsert: true })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const { data: pub } = supabaseAdmin.storage.from('logos').getPublicUrl(path)
      const emailBannerUrl = pub.publicUrl
      await supabaseAdmin.from('events').update({ email_banner_url: emailBannerUrl }).eq('id', event.id)
      return NextResponse.json({ ok: true, email_banner_url: emailBannerUrl })
    }

    // Slideshow overlay upload
    const slideshowOverlay = form.get('slideshow_overlay') as File | null
    if (slideshowOverlay && slideshowOverlay.size > 0) {
      const buffer = Buffer.from(await slideshowOverlay.arrayBuffer())
      const path = `${params.eventSlug}/slideshow-overlay.png`
      await supabaseAdmin.storage.createBucket('overlays', { public: true }).catch(() => {})
      const { error } = await supabaseAdmin.storage
        .from('overlays')
        .upload(path, buffer, { contentType: 'image/png', upsert: true })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const { data: urlData } = supabaseAdmin.storage.from('overlays').getPublicUrl(path)
      await supabaseAdmin.from('events').update({ slideshow_overlay_url: urlData.publicUrl }).eq('id', event.id)
      return NextResponse.json({ ok: true, slideshow_overlay_url: urlData.publicUrl })
    }

    const file = form.get('logo') as File | null
    if (file && file.size > 0) {
      // Smaž staré logo pokud existuje
      const { data: existing } = await supabaseAdmin
        .from('events')
        .select('client_logo_url')
        .eq('id', event.id)
        .single()

      if (existing?.client_logo_url) {
        const oldPath = existing.client_logo_url
          .split('/storage/v1/object/public/logos/')[1]
        if (oldPath) {
          await supabaseAdmin.storage.from('logos').remove([oldPath])
        }
      }

      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${event.id}-${Date.now()}.${ext}`
      const bytes = await file.arrayBuffer()
      await supabaseAdmin.storage.createBucket('logos', { public: true }).catch(() => {})
      const { error } = await supabaseAdmin.storage
        .from('logos')
        .upload(path, bytes, { contentType: file.type, upsert: true })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const { data: pub } = supabaseAdmin.storage.from('logos').getPublicUrl(path)
      logoUrl = pub.publicUrl
      console.log('Logo upload:', { path, logoUrl })
    } else {
      logoUrl = (form.get('client_logo_url') as string) || undefined
    }
  } else {
    // JSON path
    const body = await req.json()
    logoUrl = body.client_logo_url
    brandColor = body.brand_color
    if (body.public_gallery !== undefined) {
      const { error } = await supabaseAdmin
        .from('events')
        .update({ public_gallery: body.public_gallery })
        .eq('id', event.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }
    // Info notes from client
    if (body.infoNotes !== undefined) {
      const { error } = await supabaseAdmin
        .from('events')
        .update({ info_notes: body.infoNotes })
        .eq('id', event.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }
    // Info fields: location, date, maxGuests, description
    const infoUpdate: Record<string, unknown> = {}
    if (body.location !== undefined) infoUpdate.location = body.location
    if (body.date !== undefined) infoUpdate.date = body.date
    if (body.maxGuests !== undefined) infoUpdate.max_guests = body.maxGuests
    if (body.description !== undefined) infoUpdate.description = body.description
    if (Object.keys(infoUpdate).length > 0) {
      const { error } = await supabaseAdmin
        .from('events')
        .update(infoUpdate)
        .eq('id', event.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }
  }

  const update: Record<string, string> = {}
  if (logoUrl !== undefined) update.client_logo_url = logoUrl
  if (brandColor !== undefined) update.brand_color = brandColor

  console.log('Branding update object:', { logoUrl, brandColor, update, keys: Object.keys(update) })
  console.log('SAVING TO DB:', update)

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const { data: updatedEvent, error } = await supabaseAdmin
    .from('events')
    .update(update)
    .eq('id', event.id)
    .select('brand_color, client_logo_url')
    .single()

  console.log('Branding update result:', {
    eventId: event.id,
    brand_color: brandColor,
    updateResult: updatedEvent,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, ...updatedEvent })
}

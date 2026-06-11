import { supabaseAdmin } from '@/lib/supabase/admin'
import { KioskClient } from './KioskClient'

interface Props {
  params: { eventSlug: string }
}

export default async function PerEventKioskPage({ params }: Props) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, status, date')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#1a1225',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'white', fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Akce nenalezena</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          Slug &ldquo;{params.eventSlug}&rdquo; neodpovídá žádné akci.
        </p>
      </div>
    )
  }

  return <KioskClient eventId={event.id} eventName={event.name} eventDate={event.date ?? null} />
}

export const dynamic = 'force-dynamic'

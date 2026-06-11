import { notFound } from 'next/navigation'
import { SlideshowClient } from './SlideshowClient'

interface Props {
  params: { eventSlug: string }
}

async function getSlideshowData(eventSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/slideshow/${eventSlug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function SlideshowPage({ params }: Props) {
  const data = await getSlideshowData(params.eventSlug)
  if (!data || !data.event) notFound()

  return (
    <SlideshowClient
      eventSlug={params.eventSlug}
      initialEvent={data.event}
      initialPhotos={data.photos ?? []}
      initialSettings={data.settings ?? { interval: 5, animation: 'fade', layout: 'single' }}
    />
  )
}

export const dynamic = 'force-dynamic'

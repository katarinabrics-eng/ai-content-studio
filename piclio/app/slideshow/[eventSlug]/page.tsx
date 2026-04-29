interface Props {
  params: { eventSlug: string }
}

export default function SlideshowPage({ params }: Props) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Slideshow</h1>
      <p className="text-gray-500">Event: {params.eventSlug}</p>
    </main>
  )
}

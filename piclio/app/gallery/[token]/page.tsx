interface Props {
  params: { token: string }
}

export default function GalleryPage({ params }: Props) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Gallery</h1>
      <p className="text-gray-500">Token: {params.token}</p>
    </main>
  )
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PhotographerClient } from './PhotographerClient'

export default function PhotographerDashboardPage() {
  const token = cookies().get('photographer_token')?.value
  if (token !== process.env.PHOTOGRAPHER_TOKEN) {
    redirect('/login')
  }

  return <PhotographerClient />
}

export const dynamic = 'force-dynamic'

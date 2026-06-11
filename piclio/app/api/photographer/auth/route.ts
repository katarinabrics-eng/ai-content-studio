export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (
    email !== process.env.PHOTOGRAPHER_EMAIL ||
    password !== process.env.PHOTOGRAPHER_PASSWORD
  ) {
    return NextResponse.json({ error: 'Neplatné přihlašovací údaje' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('photographer_token', process.env.PHOTOGRAPHER_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

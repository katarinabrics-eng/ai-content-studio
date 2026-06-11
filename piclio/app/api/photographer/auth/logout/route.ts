export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'))
  res.cookies.set('photographer_token', '', { maxAge: 0, path: '/' })
  return res
}

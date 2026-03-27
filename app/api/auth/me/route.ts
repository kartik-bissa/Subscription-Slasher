import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ user: { id: payload.userId, name: payload.name, email: payload.email }})
  } catch (error) {
    console.error('Auth me error', error)
    return NextResponse.json({ error: 'Unable to validate token' }, { status: 401 })
  }
}

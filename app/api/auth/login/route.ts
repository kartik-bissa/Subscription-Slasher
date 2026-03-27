import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { findUserByEmail } from '@/lib/users-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = findUserByEmail(email)

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = signJwt({ userId: user.id, name: user.name, email: user.email })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('Login error:', errMsg)
    return NextResponse.json({ error: 'Unable to log in', details: errMsg }, { status: 500 })
  }
}

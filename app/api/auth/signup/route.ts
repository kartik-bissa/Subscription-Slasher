import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { findUserByEmail, createUser } from '@/lib/users-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword } = body

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and confirm password do not match' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const passwordHash = await hash(password, 10)
    const userId = Date.now().toString()

    // Create user
    createUser({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    })

    const token = signJwt({ userId, name, email })

    return NextResponse.json({
      user: { id: userId, name, email },
      token,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('Signup error:', errMsg)
    return NextResponse.json({ error: 'Unable to sign up', details: errMsg }, { status: 500 })
  }
}

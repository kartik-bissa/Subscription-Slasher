"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('subslash_token')
    if (token) {
      router.replace('/')
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      localStorage.setItem('subslash_token', data.token)
      localStorage.setItem('subslash_user', JSON.stringify(data.user))
      router.replace('/')
    } catch (err) {
      setError((err as Error).message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white/8 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="text-sm text-muted-foreground">Secure signup for Subscription Slasher</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-muted-foreground">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-5 py-3 text-white font-semibold transition hover:bg-primary/90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="text-primary underline"
          >
            Sign in
          </button>
        </p>
      </section>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, User, Mail, Shield, LogOut, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/auth/login')
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </main>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // onAuthStateChanged will redirect automatically
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen relative p-4 sm:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-3xl mx-auto space-y-8 mt-12">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8"
        >
          <div className="flex items-center gap-6 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-4xl shadow-inner">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {user.displayName || 'SubSlash User'}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Firebase Account
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-foreground">
                {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security
              </label>
              <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-foreground flex items-center justify-between">
                <span>Account Status</span>
                <span className="text-emerald-500 font-medium tracking-wide">Secured</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="px-6 rounded-xl font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

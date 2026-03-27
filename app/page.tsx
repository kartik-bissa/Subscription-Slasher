"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { Onboarding } from "@/components/onboarding"
import { Header } from "@/components/header"
import { BentoStats } from "@/components/bento-stats"
import { InsightsPanel } from "@/components/insights-panel"
import { CategoryChart } from "@/components/category-chart"
import { SubscriptionGrid } from "@/components/subscription-grid"
import { AddSubscriptionModal } from "@/components/add-subscription-modal"
import { Chatbot } from "@/components/chatbot"
import type { AnalysisResult, Subscription, ViewMode } from "@/lib/types"

import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { collection, query, where, getDocs, setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function recalculateAnalysis(subscriptions: Subscription[]): AnalysisResult {
  const total_monthly = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0)
  const potential_savings = subscriptions
    .filter(s => s.cancel_suggestion)
    .reduce((sum, s) => sum + s.monthly_cost, 0)

  const categoryMap: Record<string, { amount: number; count: number }> = {}
  subscriptions.forEach(sub => {
    if (!categoryMap[sub.category]) {
      categoryMap[sub.category] = { amount: 0, count: 0 }
    }
    categoryMap[sub.category].amount += sub.monthly_cost
    categoryMap[sub.category].count += 1
  })

  const category_breakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count
  }))

  const avgUsage = subscriptions.reduce((sum, s) => sum + (s.usage_score || 50), 0) / (subscriptions.length || 1)
  const cancelCount = subscriptions.filter(s => s.cancel_suggestion).length
  const value = Math.round(Math.min(100, avgUsage + 10))
  const overlap = Math.round(100 - (cancelCount / (subscriptions.length || 1)) * 50)
  const usage = Math.round(avgUsage)
  const budget = total_monthly > 10000 ? 50 : total_monthly > 5000 ? 70 : 90

  return {
    subscriptions,
    insights: subscriptions.length > 0 ? ["Subscriptions fetched from Firebase securely."] : ["Add your first subscription to get started!"],
    total_monthly,
    total_yearly: total_monthly * 12,
    health_score: {
      overall: Math.round((value + overlap + usage + budget) / 4),
      breakdown: { value, overlap, usage, budget }
    },
    potential_savings,
    category_breakdown,
    trend: []
  }
}

export default function Home() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('onboarding')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ✅ Enhanced demo data with more details
  const DEMO_DATA: AnalysisResult = {
    subscriptions: [
      {
        id: '1',
        name: 'Netflix',
        category: 'Streaming',
        monthly_cost: 649,
        billing_cycle: 'monthly',
        confidence: 0.98,
        cancel_suggestion: false,
        usage_score: 85,
        status: 'active',
        color: 'oklch(0.6 0.22 25)'
      },
      {
        id: '2',
        name: 'Spotify Premium',
        category: 'Music',
        monthly_cost: 119,
        billing_cycle: 'monthly',
        confidence: 0.95,
        cancel_suggestion: false,
        usage_score: 92,
        status: 'active',
        color: 'oklch(0.72 0.19 155)'
      },
      {
        id: '3',
        name: 'Amazon Prime',
        category: 'Shopping',
        monthly_cost: 149,
        billing_cycle: 'monthly',
        confidence: 0.99,
        cancel_suggestion: false,
        usage_score: 78,
        status: 'active',
        color: 'oklch(0.75 0.18 75)'
      },
      {
        id: '4',
        name: 'ChatGPT Plus',
        category: 'Software',
        monthly_cost: 1650,
        billing_cycle: 'monthly',
        confidence: 0.97,
        cancel_suggestion: false,
        usage_score: 88,
        status: 'active',
        color: 'oklch(0.72 0.19 155)'
      },
      {
        id: '5',
        name: 'Disney+ Hotstar',
        category: 'Streaming',
        monthly_cost: 299,
        billing_cycle: 'monthly',
        confidence: 0.92,
        cancel_suggestion: true,
        usage_score: 25,
        alternative: { name: 'JioCinema Premium', savings: 200 },
        status: 'active',
        color: 'oklch(0.6 0.2 250)'
      },
      {
        id: '6',
        name: 'Notion',
        category: 'Productivity',
        monthly_cost: 800,
        billing_cycle: 'monthly',
        confidence: 0.94,
        cancel_suggestion: false,
        usage_score: 72,
        status: 'active',
        color: 'oklch(0.5 0.05 260)'
      },
      {
        id: '7',
        name: 'Adobe Creative Cloud',
        category: 'Software',
        monthly_cost: 4999,
        billing_cycle: 'monthly',
        confidence: 0.98,
        cancel_suggestion: true,
        usage_score: 18,
        alternative: { name: 'Canva Pro', savings: 4000 },
        status: 'active',
        color: 'oklch(0.6 0.22 25)'
      },
      {
        id: '8',
        name: 'YouTube Premium',
        category: 'Streaming',
        monthly_cost: 139,
        billing_cycle: 'monthly',
        confidence: 0.96,
        cancel_suggestion: false,
        usage_score: 95,
        status: 'active',
        color: 'oklch(0.6 0.22 25)'
      }
    ],
    insights: [
      "💰 You're spending INR 8,804/month on 8 subscriptions.",
      "⚡ Adobe Creative Cloud (18% usage) can be replaced with Canva Pro and save INR 4,000/month.",
      "🎬 Disney+ Hotstar shows low usage (25%). Switch to JioCinema Premium and save INR 200/month.",
      "📊 Your health score is 68/100 - significant optimization potential!",
      "🎯 Total yearly savings opportunity: INR 50,400"
    ],
    total_monthly: 8804,
    total_yearly: 105648,
    health_score: {
      overall: 68,
      breakdown: { value: 72, overlap: 75, usage: 58, budget: 68 }
    },
    potential_savings: 4200,
    category_breakdown: [
      { category: 'Streaming', amount: 1087, count: 3 },
      { category: 'Software', amount: 6649, count: 2 },
      { category: 'Music', amount: 119, count: 1 },
      { category: 'Productivity', amount: 800, count: 1 }
    ],
    trend: []
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setAuthLoading(false)
        router.replace('/auth/login')
        return
      }

      setUser(currentUser)

      try {
        const q = query(collection(db, "subscriptions"), where("userId", "==", currentUser.uid))
        const querySnapshot = await getDocs(q)
        const subsData: Subscription[] = []

        querySnapshot.forEach((document) => {
          subsData.push({ id: document.id, ...document.data() } as Subscription)
        })

        if (subsData.length > 0) {
          setAnalysisResult(recalculateAnalysis(subsData))
          setViewMode('dashboard')
        } else {
          setViewMode('onboarding')
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err)
      } finally {
        setAuthLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  // ✅ Fixed handleDemo to load demo data
  const handleDemo = useCallback(() => {
    setAnalysisResult(DEMO_DATA)
    setViewMode('dashboard')
    toast.success('🎉 Demo loaded!', { description: 'Explore how SubSlash finds savings' })
  }, [])

  // ✅ Fixed handleManualStart
  const handleManualStart = useCallback(() => {
    const emptyAnalysis: AnalysisResult = {
      subscriptions: [],
      insights: ['👋 Add your first subscription to get started!'],
      total_monthly: 0,
      total_yearly: 0,
      health_score: { overall: 100, breakdown: { value: 100, overlap: 100, usage: 100, budget: 100 } },
      potential_savings: 0,
      category_breakdown: [],
      trend: []
    }
    setAnalysisResult(emptyAnalysis)
    setViewMode('dashboard')
    setIsAddModalOpen(true)
  }, [])

  const handleReset = useCallback(() => {
    setViewMode('onboarding')
    setAnalysisResult(null)
  }, [])

  const handleUpload = useCallback(async (file: File) => {
    // Placeholder for CSV upload
  }, [])

  const handleAddSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    if (!analysisResult) return

    const newId = generateId()
    const newSub: Subscription = {
      ...sub,
      id: newId
    }

    const updated = recalculateAnalysis([...analysisResult.subscriptions, newSub])
    setAnalysisResult(updated)

    // Save to Firebase if user exists
    if (user) {
      setDoc(doc(db, "subscriptions", newId), {
        ...newSub,
        userId: user.uid
      }).catch(err => console.error("Save failed:", err))
    }

    toast.success('✅ Subscription added!', { description: `${sub.name} is now tracked` })
  }, [analysisResult, user])

  const handleUpdateSubscriptions = useCallback((subscriptions: Subscription[]) => {
    if (!analysisResult) return
    const updated = recalculateAnalysis(subscriptions)
    setAnalysisResult(updated)
  }, [analysisResult])

  const handlePauseStatus = useCallback((id: string) => {
    if (!analysisResult) return

    try {
      const updatedSubs = analysisResult.subscriptions.map(sub =>
        sub.id === id ? { ...sub, status: 'paused' as const } : sub
      )
      setAnalysisResult(recalculateAnalysis(updatedSubs))

      if (user) {
        updateDoc(doc(db, "subscriptions", id), { status: 'paused' }).catch(err => console.error("Update failed:", err))
      }

      toast.success('⏸️ Subscription paused')
    } catch (err) {
      toast.error('Failed to pause')
    }
  }, [analysisResult, user])

  const handleDeleteSub = useCallback((id: string) => {
    if (!analysisResult) return

    try {
      const updatedSubs = analysisResult.subscriptions.filter(sub => sub.id !== id)
      setAnalysisResult(recalculateAnalysis(updatedSubs))

      if (user) {
        deleteDoc(doc(db, "subscriptions", id)).catch(err => console.error("Delete failed:", err))
      }

      toast.success('🗑️ Subscription removed')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }, [analysisResult, user])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      router.push('/auth/login')
    } catch (err) {
      toast.error('Logout failed')
    }
  }, [router])

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-muted-foreground">Securing your session...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative bg-background overflow-hidden">
      {/* ✅ Enhanced background with multiple animated gradient layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-accent/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            y: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-accent/8 to-success/8 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            y: [0, -50, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-success/5 rounded-full blur-3xl"
          animate={{
            scale: [0.8, 1.1, 0.8],
            rotate: [0, 360]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'onboarding' ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Onboarding
                onUpload={handleUpload}
                onManualStart={handleManualStart}
                onDemo={handleDemo}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 py-6 max-w-7xl"
            >
              <Header
                onAddSubscription={() => setIsAddModalOpen(true)}
                onExport={() => toast.info('📊 Export coming soon!')}
                onReset={handleReset}
                userName={user?.displayName || user?.email?.split('@')[0] || 'User'}
                onLogout={handleLogout}
              />

              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <BentoStats data={analysisResult} />
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <InsightsPanel insights={analysisResult.insights} />
                    </motion.div>
                    {analysisResult.category_breakdown.length > 0 && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <CategoryChart data={analysisResult.category_breakdown} />
                      </motion.div>
                    )}
                  </div>

                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <SubscriptionGrid
                      subscriptions={analysisResult.subscriptions}
                      onPauseStatus={handlePauseStatus}
                      onDeleteSub={handleDeleteSub}
                    />
                  </motion.div>

                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Chatbot data={analysisResult} />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </main>
  )
}

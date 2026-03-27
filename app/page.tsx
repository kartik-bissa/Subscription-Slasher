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

// Demo data for instant preview
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
      alternative: {
        name: 'JioCinema Premium',
        monthly_cost: 99,
        savings: 200
      },
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
      alternative: {
        name: 'Canva Pro',
        monthly_cost: 999,
        savings: 4000
      },
      status: 'active',
      color: 'oklch(0.6 0.22 25)'
    },
    {
      id: '8',
      name: 'Gym Membership',
      category: 'Fitness',
      monthly_cost: 1500,
      billing_cycle: 'monthly',
      confidence: 0.90,
      cancel_suggestion: true,
      usage_score: 12,
      status: 'active',
      color: 'oklch(0.75 0.18 75)'
    },
    {
      id: '9',
      name: 'YouTube Premium',
      category: 'Streaming',
      monthly_cost: 139,
      billing_cycle: 'monthly',
      confidence: 0.96,
      cancel_suggestion: false,
      usage_score: 95,
      status: 'active',
      color: 'oklch(0.6 0.22 25)'
    },
    {
      id: '10',
      name: 'LinkedIn Premium',
      category: 'Software',
      monthly_cost: 1999,
      billing_cycle: 'monthly',
      confidence: 0.88,
      cancel_suggestion: true,
      usage_score: 22,
      status: 'active',
      color: 'oklch(0.6 0.2 250)'
    }
  ],
  insights: [
    "You're spending INR 1,46,724 per year on 10 subscriptions - that's a significant expense.",
    "Your Adobe Creative Cloud has very low usage (18%). Consider switching to Canva Pro and save INR 4,000/month.",
    "You have 2 streaming services (Disney+ and Netflix). Since Disney+ shows low usage, consolidating could save INR 299/month.",
    "Your gym membership shows only 12% usage. Consider pausing it or switching to a pay-per-visit model.",
    "LinkedIn Premium at INR 1,999/month with 22% usage might not be worth it. The free tier covers most job search needs."
  ],
  total_monthly: 12303,
  total_yearly: 147636,
  health_score: {
    overall: 62,
    breakdown: {
      value: 68,
      overlap: 75,
      usage: 58,
      budget: 48
    }
  },
  potential_savings: 5799,
  category_breakdown: [
    { category: 'Streaming', amount: 1087, count: 3 },
    { category: 'Software', amount: 8648, count: 3 },
    { category: 'Music', amount: 119, count: 1 },
    { category: 'Shopping', amount: 149, count: 1 },
    { category: 'Fitness', amount: 1500, count: 1 },
    { category: 'Productivity', amount: 800, count: 1 }
  ],
  trend: []
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function recalculateAnalysis(subscriptions: Subscription[]): AnalysisResult {
  const total_monthly = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0)
  const potential_savings = subscriptions
    .filter(s => s.cancel_suggestion)
    .reduce((sum, s) => sum + s.monthly_cost, 0)

  // Calculate category breakdown
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

  // Calculate health score
  const avgUsage = subscriptions.reduce((sum, s) => sum + (s.usage_score || 50), 0) / (subscriptions.length || 1)
  const cancelCount = subscriptions.filter(s => s.cancel_suggestion).length
  const value = Math.round(Math.min(100, avgUsage + 10))
  const overlap = Math.round(100 - (cancelCount / (subscriptions.length || 1)) * 50)
  const usage = Math.round(avgUsage)
  const budget = total_monthly > 10000 ? 50 : total_monthly > 5000 ? 70 : 90

  return {
    subscriptions,
    insights: [],
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
  const [userName, setUserName] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('subslash_token')

    if (!token) {
      router.replace('/auth/login')
      return
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Unauthorized')
        }
        const data = await res.json()
        setUserName(data.user?.name || null)
      })
      .catch(() => {
        localStorage.removeItem('subslash_token')
        localStorage.removeItem('subslash_user')
        router.replace('/auth/login')
      })
      .finally(() => setAuthLoading(false))
  }, [router])

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysisResult(data)
      setViewMode('dashboard')
      toast.success('Analysis complete', {
        description: `Found ${data.subscriptions.length} subscriptions`
      })
    } catch (err) {
      toast.error('Analysis failed', {
        description: err instanceof Error ? err.message : 'Something went wrong'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleManualStart = useCallback(() => {
    // Start with empty state
    setAnalysisResult({
      subscriptions: [],
      insights: ['Add your first subscription to get started!'],
      total_monthly: 0,
      total_yearly: 0,
      health_score: {
        overall: 100,
        breakdown: { value: 100, overlap: 100, usage: 100, budget: 100 }
      },
      potential_savings: 0,
      category_breakdown: [],
      trend: []
    })
    setViewMode('dashboard')
    setIsAddModalOpen(true)
  }, [])

  const handleDemo = useCallback(() => {
    setAnalysisResult(DEMO_DATA)
    setViewMode('dashboard')
    toast.success('Demo loaded', {
      description: 'Explore the dashboard with sample data'
    })
  }, [])

  const handleReset = useCallback(() => {
    setAnalysisResult(null)
    setViewMode('onboarding')
  }, [])

  const handleExport = useCallback(() => {
    if (!analysisResult) return

    const exportData = {
      ...analysisResult,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscription-analysis.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Exported successfully')
  }, [analysisResult])

  const handleAddSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    if (!analysisResult) return

    const newSub: Subscription = {
      ...sub,
      id: generateId()
    }

    const updated = recalculateAnalysis([...analysisResult.subscriptions, newSub])
    updated.insights = analysisResult.insights
    setAnalysisResult(updated)
    
    toast.success('Subscription added', {
      description: `${newSub.name} has been added`
    })
  }, [analysisResult])

  const handleUpdateSubscriptions = useCallback((subscriptions: Subscription[]) => {
    if (!analysisResult) return

    const updated = recalculateAnalysis(subscriptions)
    updated.insights = analysisResult.insights
    setAnalysisResult(updated)
  }, [analysisResult])

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Checking authentication...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'onboarding' ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-6 max-w-7xl"
            >
              <Header
                onAddSubscription={() => setIsAddModalOpen(true)}
                onExport={handleExport}
                onReset={handleReset}
                userName={userName}
                onLogout={() => {
                  localStorage.removeItem('subslash_token')
                  localStorage.removeItem('subslash_user')
                  router.replace('/auth/login')
                }}
              />

              {analysisResult && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <BentoStats data={analysisResult} />

                  {/* Insights and Chart Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InsightsPanel insights={analysisResult.insights} />
                    {analysisResult.category_breakdown.length > 0 && (
                      <CategoryChart data={analysisResult.category_breakdown} />
                    )}
                  </div>

                  {/* Subscriptions Grid */}
                  <SubscriptionGrid
                    subscriptions={analysisResult.subscriptions}
                    onUpdate={handleUpdateSubscriptions}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubscription}
      />

      {/* AI Chatbot */}
      <Chatbot data={analysisResult} />
    </main>
  )
}

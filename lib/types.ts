export interface Transaction {
  date: string
  description: string
  amount: number
  category?: string
}

export interface Subscription {
  id: string
  name: string
  category: string
  monthly_cost: number
  billing_cycle: 'monthly' | 'yearly' | 'weekly'
  next_billing_date?: string
  confidence: number
  cancel_suggestion?: boolean
  usage_score?: number // 0-100, how much user likely uses it
  alternative?: {
    name: string
    monthly_cost: number
    savings: number
  }
  roi_score?: number // Return on investment score
  status: 'active' | 'paused' | 'cancelled'
  logo?: string
  color?: string
}

export interface HealthScore {
  overall: number // 0-100
  breakdown: {
    value: number // Are you getting good value?
    overlap: number // Any duplicate services?
    usage: number // Are you using your subscriptions?
    budget: number // Within budget?
  }
}

export interface BudgetGoal {
  monthly_target: number
  current_spend: number
  status: 'on_track' | 'warning' | 'over_budget'
}

export interface AnalysisResult {
  subscriptions: Subscription[]
  insights: string[]
  total_monthly: number
  total_yearly: number
  health_score: HealthScore
  budget_goal?: BudgetGoal
  potential_savings: number
  category_breakdown: { category: string; amount: number; count: number }[]
  trend: {
    month: string
    amount: number
  }[]
}

export interface UploadState {
  file: File | null
  fileName: string
  isUploading: boolean
  error: string | null
}

export type ViewMode = 'onboarding' | 'dashboard' | 'add-subscription' | 'settings'

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Music',
  'Software',
  'Cloud Storage',
  'Fitness',
  'Gaming',
  'News & Media',
  'Productivity',
  'Education',
  'Finance',
  'Food Delivery',
  'Shopping',
  'Other'
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  'Streaming': 'oklch(0.65 0.22 320)',
  'Music': 'oklch(0.72 0.19 155)',
  'Software': 'oklch(0.72 0.19 180)',
  'Cloud Storage': 'oklch(0.6 0.2 250)',
  'Fitness': 'oklch(0.75 0.18 75)',
  'Gaming': 'oklch(0.65 0.22 320)',
  'News & Media': 'oklch(0.7 0.15 45)',
  'Productivity': 'oklch(0.72 0.19 180)',
  'Education': 'oklch(0.6 0.2 250)',
  'Finance': 'oklch(0.72 0.19 155)',
  'Food Delivery': 'oklch(0.7 0.2 30)',
  'Shopping': 'oklch(0.65 0.22 320)',
  'Other': 'oklch(0.5 0.1 260)'
}

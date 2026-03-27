import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import type { Transaction, AnalysisResult, Subscription, HealthScore } from '@/lib/types'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

async function analyzeWithGemini(transactions: Transaction[]): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const transactionSummary = transactions
    .slice(0, 150)
    .map(t => `${t.date}: ${t.description} - ${t.amount}`)
    .join('\n')

  const prompt = `You are an expert financial AI assistant specializing in subscription analysis. Analyze these bank transactions and identify ALL recurring subscriptions with high accuracy.

Transactions:
${transactionSummary}

Your task:
1. Identify recurring subscriptions (services that appear multiple times with similar amounts)
2. For each subscription, provide:
   - name: Service name (clean, readable format)
   - category: One of [Streaming, Music, Software, Cloud Storage, Fitness, Gaming, News & Media, Productivity, Education, Finance, Food Delivery, Shopping, Other]
   - monthly_cost: Monthly equivalent cost in INR
   - billing_cycle: monthly/yearly/weekly
   - confidence: 0-1 confidence score
   - cancel_suggestion: true if usage appears low or service seems unused
   - usage_score: 0-100 estimated usage based on transaction frequency
   - alternative: { name, monthly_cost, savings } if a cheaper alternative exists

3. Calculate health scores:
   - value: 0-100 (are they getting good value for money?)
   - overlap: 0-100 (any duplicate services? 100 = no overlap)
   - usage: 0-100 (are subscriptions being used?)
   - budget: 0-100 (reasonable spending level)

4. Provide actionable insights (3-5 specific recommendations)

5. Calculate potential_savings (realistic monthly savings if suggestions followed)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "subscriptions": [
    {
      "name": "Service Name",
      "category": "Category",
      "monthly_cost": 499,
      "billing_cycle": "monthly",
      "confidence": 0.95,
      "cancel_suggestion": false,
      "usage_score": 75,
      "alternative": null
    }
  ],
  "insights": [
    "Specific actionable insight 1",
    "Specific actionable insight 2"
  ],
  "total_monthly": 0,
  "total_yearly": 0,
  "health_score": {
    "overall": 75,
    "breakdown": {
      "value": 80,
      "overlap": 90,
      "usage": 70,
      "budget": 75
    }
  },
  "potential_savings": 500,
  "category_breakdown": [
    { "category": "Streaming", "amount": 1000, "count": 2 }
  ],
  "trend": []
}`

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', errorText)
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json() as GeminiResponse
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textContent) {
    throw new Error('No response from Gemini API')
  }

  // Clean the response
  let cleanedContent = textContent.trim()
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.slice(7)
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.slice(3)
  }
  if (cleanedContent.endsWith('```')) {
    cleanedContent = cleanedContent.slice(0, -3)
  }
  cleanedContent = cleanedContent.trim()

  try {
    const result = JSON.parse(cleanedContent) as AnalysisResult
    
    // Validate and enhance the result
    if (!Array.isArray(result.subscriptions)) {
      result.subscriptions = []
    }

    result.subscriptions = result.subscriptions.map((sub: Partial<Subscription>) => ({
      id: generateId(),
      name: String(sub.name || 'Unknown'),
      category: String(sub.category || 'Other'),
      monthly_cost: Number(sub.monthly_cost) || 0,
      billing_cycle: sub.billing_cycle || 'monthly',
      confidence: Math.min(1, Math.max(0, Number(sub.confidence) || 0.5)),
      cancel_suggestion: Boolean(sub.cancel_suggestion),
      usage_score: Math.min(100, Math.max(0, Number(sub.usage_score) || 50)),
      alternative: sub.alternative || undefined,
      status: 'active' as const,
      color: getColorForCategory(String(sub.category || 'Other'))
    }))

    // Recalculate totals
    result.total_monthly = result.subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0)
    result.total_yearly = result.total_monthly * 12

    // Ensure health score
    if (!result.health_score) {
      result.health_score = calculateHealthScore(result.subscriptions)
    }

    // Ensure category breakdown
    if (!result.category_breakdown || result.category_breakdown.length === 0) {
      result.category_breakdown = calculateCategoryBreakdown(result.subscriptions)
    }

    // Ensure potential savings
    if (!result.potential_savings) {
      result.potential_savings = result.subscriptions
        .filter(s => s.cancel_suggestion)
        .reduce((sum, s) => sum + s.monthly_cost, 0)
    }

    // Ensure insights
    if (!Array.isArray(result.insights) || result.insights.length === 0) {
      result.insights = generateDefaultInsights(result)
    }

    result.trend = []

    return result
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedContent)
    throw new Error('Failed to parse AI response')
  }
}

function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
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
  return colors[category] || colors['Other']
}

function calculateHealthScore(subscriptions: Subscription[]): HealthScore {
  const totalCost = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0)
  const avgUsage = subscriptions.reduce((sum, s) => sum + (s.usage_score || 50), 0) / (subscriptions.length || 1)
  const cancelSuggestions = subscriptions.filter(s => s.cancel_suggestion).length
  
  const value = Math.round(Math.min(100, avgUsage + 10))
  const overlap = Math.round(100 - (cancelSuggestions / (subscriptions.length || 1)) * 50)
  const usage = Math.round(avgUsage)
  const budget = totalCost > 5000 ? 60 : totalCost > 3000 ? 75 : 90

  return {
    overall: Math.round((value + overlap + usage + budget) / 4),
    breakdown: { value, overlap, usage, budget }
  }
}

function calculateCategoryBreakdown(subscriptions: Subscription[]): { category: string; amount: number; count: number }[] {
  const breakdown: Record<string, { amount: number; count: number }> = {}
  
  subscriptions.forEach(sub => {
    if (!breakdown[sub.category]) {
      breakdown[sub.category] = { amount: 0, count: 0 }
    }
    breakdown[sub.category].amount += sub.monthly_cost
    breakdown[sub.category].count += 1
  })

  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count
  }))
}

function generateDefaultInsights(result: AnalysisResult): string[] {
  const insights: string[] = []
  
  insights.push(`You're spending ${formatCurrency(result.total_yearly)} per year on ${result.subscriptions.length} subscriptions.`)
  
  if (result.potential_savings > 0) {
    insights.push(`You could save ${formatCurrency(result.potential_savings)} per month by cancelling underused subscriptions.`)
  }

  const lowUsage = result.subscriptions.filter(s => (s.usage_score || 50) < 40)
  if (lowUsage.length > 0) {
    insights.push(`${lowUsage.length} subscription(s) appear to have low usage. Consider if they're still needed.`)
  }

  return insights
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function parseCSV(content: string): Transaction[] {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim()
  })

  return result.data.map((row: Record<string, string>) => {
    const date = row.date || row.transaction_date || row.txn_date || row.posting_date || ''
    const description = row.description || row.narration || row.particulars || row.transaction_description || row.merchant || ''
    const amountStr = row.amount || row.debit || row.withdrawal || row.transaction_amount || '0'
    
    let amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0
    amount = Math.abs(amount)

    return { date, description, amount }
  }).filter((t: Transaction) => t.description && t.amount > 0)
}

function parseJSON(content: string): Transaction[] {
  const data = JSON.parse(content)
  const transactions = Array.isArray(data) ? data : data.transactions || []
  
  return transactions.map((row: Record<string, unknown>) => {
    const date = String(row.date || row.transaction_date || '')
    const description = String(row.description || row.narration || row.merchant || '')
    let amount = typeof row.amount === 'number' ? row.amount : parseFloat(String(row.amount || '0').replace(/[^0-9.-]/g, '')) || 0
    amount = Math.abs(amount)
    
    return { date, description, amount }
  }).filter((t: Transaction) => t.description && t.amount > 0)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const content = await file.text()
    const fileName = file.name.toLowerCase()

    let transactions: Transaction[]

    if (fileName.endsWith('.csv')) {
      transactions = parseCSV(content)
    } else if (fileName.endsWith('.json')) {
      transactions = parseJSON(content)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV or JSON.' },
        { status: 400 }
      )
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No valid transactions found in file. Please check the file format.' },
        { status: 400 }
      )
    }

    const result = await analyzeWithGemini(transactions)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    
    const message = error instanceof Error ? error.message : 'Analysis failed'
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

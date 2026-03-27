import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are SubSlash AI - a smart, friendly financial advisor focused on subscription management.

Your personality:
- Concise and actionable (keep responses under 150 words unless asked for more)
- Use numbers and specific savings amounts when possible
- Be encouraging but honest about wasteful spending
- Use casual, friendly language

Your capabilities:
- Analyze subscription data to find savings opportunities
- Identify overlapping or redundant services
- Suggest cheaper alternatives
- Calculate annual savings from cancellations
- Provide personalized recommendations based on usage patterns

Format rules:
- Use bullet points for lists
- Bold important numbers or savings amounts
- Include a "Smart Tip" at the end when relevant
- Never use markdown headers (#)

When you don't have enough data, ask a clarifying question.
When suggesting cancellations, always explain the reasoning based on usage or cost.`

export async function POST(request: NextRequest) {
  try {
    const { message, subscriptions, summary } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Build context from subscription data
    let dataContext = ""
    
    if (subscriptions && subscriptions.length > 0) {
      const subsInfo = subscriptions.map((s: {
        name: string
        category: string
        monthly_cost: number
        usage_score?: number
        cancel_suggestion?: boolean
        alternative?: { name: string; savings: number }
      }) => 
        `- ${s.name} (${s.category}): INR ${s.monthly_cost}/mo, Usage: ${s.usage_score || 'Unknown'}%${s.cancel_suggestion ? ' [LOW USAGE]' : ''}${s.alternative ? ` [Alternative: ${s.alternative.name} saves INR ${s.alternative.savings}]` : ''}`
      ).join('\n')
      
      dataContext = `\n\nUser's Subscriptions:\n${subsInfo}`
    }

    if (summary) {
      dataContext += `\n\nSpending Summary:
- Monthly Total: INR ${summary.total_monthly}
- Yearly Total: INR ${summary.total_yearly}
- Potential Savings: INR ${summary.potential_savings}/month
- Health Score: ${summary.health_score}/100
- Active Subscriptions: ${summary.count}`
    }

    const prompt = `${SYSTEM_PROMPT}${dataContext}

User Question: ${message}

Respond helpfully and concisely:`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    return NextResponse.json({ 
      message: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

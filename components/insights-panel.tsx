"use client"

import { motion } from "framer-motion"
import { Sparkles, Lightbulb, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface InsightsPanelProps {
  insights: string[]
}

const getInsightIcon = (insight: string) => {
  const lowerInsight = insight.toLowerCase()
  if (lowerInsight.includes('save') || lowerInsight.includes('saving')) {
    return TrendingDown
  }
  if (lowerInsight.includes('warning') || lowerInsight.includes('alert') || lowerInsight.includes('consider')) {
    return AlertTriangle
  }
  if (lowerInsight.includes('great') || lowerInsight.includes('good') || lowerInsight.includes('optimized')) {
    return CheckCircle
  }
  return Lightbulb
}

const getInsightColor = (insight: string) => {
  const lowerInsight = insight.toLowerCase()
  if (lowerInsight.includes('save') || lowerInsight.includes('saving')) {
    return 'text-success'
  }
  if (lowerInsight.includes('warning') || lowerInsight.includes('alert') || lowerInsight.includes('consider')) {
    return 'text-warning'
  }
  if (lowerInsight.includes('great') || lowerInsight.includes('good') || lowerInsight.includes('optimized')) {
    return 'text-primary'
  }
  return 'text-accent'
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights || insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <h3 className="font-semibold text-foreground">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight)
          const colorClass = getInsightColor(insight)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${colorClass}`} />
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import { 
  TrendingDown, 
  CreditCard, 
  Calendar, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { HealthScore } from "@/components/health-score"
import type { AnalysisResult } from "@/lib/types"

interface BentoStatsProps {
  data: AnalysisResult
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => {
    if (value >= 1000) {
      return Math.round(v).toLocaleString('en-IN')
    }
    return Math.round(v)
  })

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: "easeOut"
    })
    return controls.stop
  }, [value, motionValue])

  return (
    <span className="tabular-nums">
      {prefix}
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function BentoStats({ data }: BentoStatsProps) {
  const savingsPercentage = data.total_monthly > 0 
    ? Math.round((data.potential_savings / data.total_monthly) * 100) 
    : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Health Score - Large */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="col-span-2 lg:col-span-1 lg:row-span-2 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center spotlight"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Subscription Health</h3>
        <HealthScore score={data.health_score.overall} size="lg" />
        <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="text-sm font-semibold text-foreground">{data.health_score.breakdown.value}%</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-muted-foreground">Usage</p>
            <p className="text-sm font-semibold text-foreground">{data.health_score.breakdown.usage}%</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Monthly Spend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -4 }}
        className="glass-panel rounded-2xl p-5 spotlight"
      >
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center"
            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
          >
            <CreditCard className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span className="flex items-center text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Per month
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          <AnimatedNumber value={data.total_monthly} prefix="INR " />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Monthly spend</p>
      </motion.div>

      {/* Yearly Spend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ y: -4 }}
        className="glass-panel rounded-2xl p-5 spotlight"
      >
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center"
            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
          >
            <Calendar className="h-5 w-5 text-accent-foreground" />
          </motion.div>
          <span className="flex items-center text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Per year
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          <AnimatedNumber value={data.total_yearly} prefix="INR " />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Yearly spend</p>
      </motion.div>

      {/* Active Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -4 }}
        className="glass-panel rounded-2xl p-5 spotlight"
      >
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-warning/50 flex items-center justify-center"
            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
          >
            <Zap className="h-5 w-5 text-warning-foreground" />
          </motion.div>
        </div>
        <p className="text-2xl font-bold text-foreground">
          <AnimatedNumber value={data.subscriptions.length} />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Active subscriptions</p>
      </motion.div>

      {/* Potential Savings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileHover={{ y: -4 }}
        className="glass-panel rounded-2xl p-5 gradient-border-animated overflow-hidden spotlight"
      >
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/50 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingDown className="h-5 w-5 text-success-foreground" />
          </motion.div>
          {savingsPercentage > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center text-xs text-success bg-success/10 px-2 py-1 rounded-full"
            >
              <ArrowDownRight className="h-3 w-3 mr-1" />
              {savingsPercentage}%
            </motion.span>
          )}
        </div>
        <p className="text-2xl font-bold text-success">
          <AnimatedNumber value={data.potential_savings} prefix="INR " />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Potential savings/mo</p>
      </motion.div>
    </div>
  )
}

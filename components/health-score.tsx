"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function HealthScore({ score, size = 'md', showLabel = true, className }: HealthScoreProps) {
  const sizes = {
    sm: { width: 80, stroke: 6, text: 'text-lg' },
    md: { width: 120, stroke: 8, text: 'text-2xl' },
    lg: { width: 160, stroke: 10, text: 'text-4xl' }
  }

  const { width, stroke, text } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'oklch(0.72 0.19 155)' // Green
    if (score >= 60) return 'oklch(0.72 0.19 180)' // Cyan
    if (score >= 40) return 'oklch(0.75 0.18 75)' // Yellow
    return 'oklch(0.6 0.22 25)' // Red
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Work'
  }

  const color = getScoreColor(score)

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg className="health-ring" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="oklch(0.18 0.015 260)"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={cn("font-bold", text)}
            style={{ color }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {getScoreLabel(score)}
        </motion.span>
      )}
    </div>
  )
}

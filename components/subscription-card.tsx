"use client"

import { motion } from "framer-motion"
import { 
  MoreHorizontal, 
  TrendingDown, 
  AlertTriangle, 
  Pause, 
  Trash2,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Subscription } from "@/lib/types"

interface SubscriptionCardProps {
  subscription: Subscription
  onPause?: () => void
  onCancel?: () => void
  index?: number
}

const categoryIcons: Record<string, string> = {
  'Streaming': '🎬',
  'Music': '🎵',
  'Software': '💻',
  'Cloud Storage': '☁️',
  'Fitness': '💪',
  'Gaming': '🎮',
  'News & Media': '📰',
  'Productivity': '📊',
  'Education': '📚',
  'Finance': '💰',
  'Food Delivery': '🍔',
  'Shopping': '🛒',
  'Other': '📦'
}

export function SubscriptionCard({ subscription, onPause, onCancel, index = 0 }: SubscriptionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getUsageColor = (score?: number) => {
    if (!score) return 'bg-muted'
    if (score >= 70) return 'bg-success'
    if (score >= 40) return 'bg-warning'
    return 'bg-destructive'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative glass-panel rounded-xl p-4 glass-panel-hover",
        subscription.cancel_suggestion && "border-destructive/30"
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${subscription.color || 'oklch(0.72 0.19 180)'}, 0 0 20px ${subscription.color || 'oklch(0.72 0.19 180)'}` }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Icon and Info */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${subscription.color || 'oklch(0.72 0.19 180)'}20, transparent)`,
              border: `1px solid ${subscription.color || 'oklch(0.72 0.19 180)'}30`
            }}
          >
            {categoryIcons[subscription.category] || '📦'}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {subscription.name}
            </h3>
            <p className="text-sm text-muted-foreground">{subscription.category}</p>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-border">
            <DropdownMenuItem onClick={onPause} className="cursor-pointer">
              <Pause className="h-4 w-4 mr-2" />
              Pause Subscription
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage on Website
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCancel} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Price and Usage */}
      <div className="relative mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(subscription.monthly_cost)}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
          {subscription.billing_cycle !== 'monthly' && (
            <p className="text-xs text-muted-foreground">
              Billed {subscription.billing_cycle}
            </p>
          )}
        </div>

        {/* Usage Score */}
        {subscription.usage_score !== undefined && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">Usage</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subscription.usage_score}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className={cn("h-full rounded-full", getUsageColor(subscription.usage_score))}
                />
              </div>
              <span className="text-xs font-medium">{subscription.usage_score}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Warnings and Suggestions */}
      {subscription.cancel_suggestion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">Low usage detected. Consider cancelling.</p>
        </motion.div>
      )}

      {/* Alternative Suggestion */}
      {subscription.alternative && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative mt-3 p-2 rounded-lg bg-success/10 border border-success/20 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-success shrink-0" />
            <p className="text-xs text-success">
              Switch to {subscription.alternative.name} and save {formatCurrency(subscription.alternative.savings)}/mo
            </p>
          </div>
          <Badge variant="outline" className="text-success border-success/30 text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            {formatCurrency(subscription.alternative.monthly_cost)}
          </Badge>
        </motion.div>
      )}
    </motion.div>
  )
}

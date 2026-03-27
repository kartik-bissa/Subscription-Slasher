"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SUBSCRIPTION_CATEGORIES, type Subscription } from "@/lib/types"

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (subscription: Omit<Subscription, 'id'>) => void
}

const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', category: 'Streaming', monthly_cost: 649, color: 'oklch(0.6 0.22 25)' },
  { name: 'Spotify', category: 'Music', monthly_cost: 119, color: 'oklch(0.72 0.19 155)' },
  { name: 'Amazon Prime', category: 'Shopping', monthly_cost: 149, color: 'oklch(0.75 0.18 75)' },
  { name: 'Disney+ Hotstar', category: 'Streaming', monthly_cost: 299, color: 'oklch(0.6 0.2 250)' },
  { name: 'YouTube Premium', category: 'Streaming', monthly_cost: 139, color: 'oklch(0.6 0.22 25)' },
  { name: 'Notion', category: 'Productivity', monthly_cost: 800, color: 'oklch(0.5 0.05 260)' },
  { name: 'ChatGPT Plus', category: 'Software', monthly_cost: 1650, color: 'oklch(0.72 0.19 155)' },
  { name: 'Figma', category: 'Software', monthly_cost: 1200, color: 'oklch(0.65 0.22 320)' },
]

export function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const [mode, setMode] = useState<'quick' | 'manual'>('quick')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    monthly_cost: '',
    billing_cycle: 'monthly' as const
  })

  const handleQuickAdd = (sub: typeof POPULAR_SUBSCRIPTIONS[0]) => {
    onAdd({
      name: sub.name,
      category: sub.category,
      monthly_cost: sub.monthly_cost,
      billing_cycle: 'monthly',
      confidence: 1,
      status: 'active',
      color: sub.color,
      usage_score: Math.floor(Math.random() * 40) + 60
    })
    onClose()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.monthly_cost) return

    onAdd({
      name: formData.name,
      category: formData.category,
      monthly_cost: parseFloat(formData.monthly_cost),
      billing_cycle: formData.billing_cycle,
      confidence: 1,
      status: 'active',
      usage_score: 70
    })
    setFormData({ name: '', category: '', monthly_cost: '', billing_cycle: 'monthly' })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-panel rounded-2xl p-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Add Subscription</h2>
                  <p className="text-sm text-muted-foreground">Track a new recurring expense</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 p-1 rounded-lg bg-muted/50">
                <button
                  onClick={() => setMode('quick')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'quick' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="h-4 w-4 inline mr-2" />
                  Quick Add
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'manual' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Manual Entry
                </button>
              </div>

              {mode === 'quick' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Popular subscriptions - click to add instantly
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {POPULAR_SUBSCRIPTIONS.map((sub) => (
                      <motion.button
                        key={sub.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAdd(sub)}
                        className="p-3 rounded-xl text-left glass-panel glass-panel-hover group"
                        style={{
                          borderColor: `${sub.color}20`
                        }}
                      >
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {sub.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{sub.category}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: sub.color }}>
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0
                          }).format(sub.monthly_cost)}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subscription Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Adobe Creative Cloud"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-border">
                        {SUBSCRIPTION_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Monthly Cost (INR)</Label>
                      <Input
                        id="cost"
                        type="number"
                        placeholder="499"
                        value={formData.monthly_cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthly_cost: e.target.value }))}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cycle">Billing Cycle</Label>
                      <Select
                        value={formData.billing_cycle}
                        onValueChange={(value: 'monthly' | 'yearly' | 'weekly') => 
                          setFormData(prev => ({ ...prev, billing_cycle: value }))
                        }
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-border">
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!formData.name || !formData.category || !formData.monthly_cost}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscription
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

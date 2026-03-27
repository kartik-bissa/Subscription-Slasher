"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Grid, List, Search, SlidersHorizontal, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { SubscriptionCard } from "@/components/subscription-card"
import type { Subscription } from "@/lib/types"

interface SubscriptionGridProps {
  subscriptions: Subscription[]
  onPauseStatus: (id: string) => void
  onDeleteSub: (id: string) => void
}

type SortOption = 'cost-high' | 'cost-low' | 'name' | 'usage' | 'category'
type FilterOption = 'all' | 'cancel-suggested' | 'low-usage' | 'high-cost'

export function SubscriptionGrid({ subscriptions, onPauseStatus, onDeleteSub }: SubscriptionGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('cost-high')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  const handlePause = (id: string) => {
    onPauseStatus(id)
  }

  const handleCancel = (id: string) => {
    onDeleteSub(id)
  }


  // Filter subscriptions
  let filtered = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) ||
                         sub.category.toLowerCase().includes(search.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filterBy) {
      case 'cancel-suggested':
        return sub.cancel_suggestion
      case 'low-usage':
        return (sub.usage_score || 50) < 40
      case 'high-cost':
        return sub.monthly_cost > 500
      default:
        return true
    }
  })

  // Sort subscriptions
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'cost-high':
        return b.monthly_cost - a.monthly_cost
      case 'cost-low':
        return a.monthly_cost - b.monthly_cost
      case 'name':
        return a.name.localeCompare(b.name)
      case 'usage':
        return (b.usage_score || 50) - (a.usage_score || 50)
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const sortLabels: Record<SortOption, string> = {
    'cost-high': 'Cost (High to Low)',
    'cost-low': 'Cost (Low to High)',
    'name': 'Name (A-Z)',
    'usage': 'Usage (High to Low)',
    'category': 'Category'
  }

  const filterLabels: Record<FilterOption, string> = {
    'all': 'All Subscriptions',
    'cancel-suggested': 'Consider Cancelling',
    'low-usage': 'Low Usage',
    'high-cost': 'High Cost (500+)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-foreground">
          Your Subscriptions ({subscriptions.length})
        </h3>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-40 sm:w-48 bg-input border-border"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-border">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border-border">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(filterLabels) as FilterOption[]).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setFilterBy(option)}
                  className={filterBy === option ? 'bg-muted' : ''}
                >
                  {filterLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-border">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border-border">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={sortBy === option ? 'bg-muted' : ''}
                >
                  {sortLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`rounded-none h-9 w-9 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`rounded-none h-9 w-9 ${viewMode === 'list' ? 'bg-muted' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Badge */}
      {filterBy !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering:</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterBy('all')}
            className="h-7 text-xs"
          >
            {filterLabels[filterBy]}
            <span className="ml-2">x</span>
          </Button>
        </div>
      )}

      {/* Grid/List */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filtered.map((sub, index) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onPause={() => handlePause(sub.id)}
                onCancel={() => handleCancel(sub.id)}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-2xl p-12 text-center"
          >
            <p className="text-muted-foreground">
              {search ? 'No subscriptions match your search' : 'No subscriptions found'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

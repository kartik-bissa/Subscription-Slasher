"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Download, ArrowLeft, Sparkles, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onAddSubscription: () => void
  onExport: () => void
  onReset: () => void
  userName?: string | null
  onLogout?: () => void
}

export function Header({ onAddSubscription, onExport, onReset, userName, onLogout }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg gradient-text-primary">SubSlash</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <Link href="/profile" className="flex items-center group">
            <Button variant="ghost" className="text-sm text-muted-foreground group-hover:text-primary">
              <User className="h-4 w-4 mr-2" />
              {userName}
            </Button>
          </Link>
        )}

        {onLogout && (
          <Button variant="ghost" onClick={onLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            className="border-border hover:bg-muted"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={onAddSubscription}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>
    </motion.header>
  )
}

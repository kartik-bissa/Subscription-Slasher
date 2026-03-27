"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  Sparkles, 
  ChevronRight, 
  FileText,
  Plus,
  Zap,
  Shield,
  TrendingDown,
  Target,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OnboardingProps {
  onUpload: (file: File) => void
  onManualStart: () => void
  onDemo: () => void
  isLoading?: boolean
}

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Smart detection of recurring charges",
    color: "from-primary to-primary/50"
  },
  {
    icon: TrendingDown,
    title: "Find Savings",
    description: "Discover overlapping services",
    color: "from-success to-success/50"
  },
  {
    icon: Target,
    title: "Health Score",
    description: "Personalized portfolio score",
    color: "from-accent to-accent/50"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Data processed locally",
    color: "from-warning to-warning/50"
  }
]

const FLOATING_ICONS = [
  { icon: "netflix", x: "10%", y: "20%", delay: 0 },
  { icon: "spotify", x: "85%", y: "15%", delay: 0.5 },
  { icon: "prime", x: "5%", y: "70%", delay: 1 },
  { icon: "chatgpt", x: "90%", y: "75%", delay: 1.5 },
  { icon: "notion", x: "15%", y: "45%", delay: 2 },
  { icon: "figma", x: "80%", y: "45%", delay: 2.5 },
]

export function Onboarding({ onUpload, onManualStart, onDemo, isLoading }: OnboardingProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState<'hero' | 'method'>('hero')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && isValidFile(files[0])) {
      onUpload(files[0])
    }
  }, [onUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && isValidFile(files[0])) {
      onUpload(files[0])
    }
  }, [onUpload])

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.json']
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Floating subscription icons */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ICONS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ delay: item.delay, duration: 0.5 }}
            className="absolute w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center float"
            style={{ left: item.x, top: item.y, animationDelay: `${item.delay}s` }}
          >
            <span className="text-2xl opacity-60">
              {item.icon === 'netflix' && '🎬'}
              {item.icon === 'spotify' && '🎵'}
              {item.icon === 'prime' && '📦'}
              {item.icon === 'chatgpt' && '🤖'}
              {item.icon === 'notion' && '📝'}
              {item.icon === 'figma' && '🎨'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {step === 'hero' ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Logo with enhanced animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, damping: 15 }}
                className="relative mx-auto w-24 h-24 mb-8"
              >
                {/* Outer glow ring */}
                <motion.div 
                  className="absolute inset-[-8px] rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 blur-xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Logo container */}
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center glow-primary overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer" />
                  <Sparkles className="w-12 h-12 text-primary-foreground relative z-10" />
                </div>
              </motion.div>

              {/* Title with staggered letters */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
              >
                <span className="gradient-text-primary text-glow-primary">SubSlash</span>
              </motion.h1>

              {/* Animated tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-muted-foreground mb-2 text-pretty"
              >
                Take control of your subscriptions.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-foreground mb-10 text-pretty"
              >
                <span className="gradient-text-accent">Slash unnecessary spending with AI.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => setStep('method')}
                  className={cn(
                    "h-14 px-8 text-lg font-semibold",
                    "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                    "text-primary-foreground",
                    "glow-primary press-scale",
                    "group"
                  )}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onDemo}
                  className="h-14 px-8 text-lg font-semibold border-border/50 hover:bg-muted/50 press-scale"
                >
                  <Sparkles className="mr-2 h-5 w-5 text-success" />
                  Try Demo
                </Button>
              </motion.div>

              {/* Features Grid with stagger */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="glass-panel glass-panel-hover rounded-xl p-4 text-left spotlight"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                      "bg-gradient-to-br",
                      feature.color
                    )}>
                      <feature.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 flex items-center justify-center gap-8 text-muted-foreground"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">10K+</p>
                  <p className="text-xs">Users</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">$2M+</p>
                  <p className="text-xs">Saved</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">50+</p>
                  <p className="text-xs">Services</p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setStep('hero')}
                className="mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 press-scale"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </motion.button>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold text-center mb-2 tracking-tight"
              >
                How would you like to <span className="gradient-text-primary">start</span>?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-muted-foreground text-center mb-10"
              >
                Choose the method that works best for you
              </motion.p>

              <div className="grid gap-4">
                {/* Upload Option */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative glass-panel rounded-2xl p-6 glass-panel-hover cursor-pointer transition-all spotlight",
                    isDragging && "border-primary glow-primary scale-[1.02]",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                >
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shrink-0"
                      animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                    >
                      <Upload className="h-7 w-7 text-primary-foreground" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        {isLoading ? 'Analyzing...' : 'Upload Transaction File'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isLoading 
                          ? 'Our AI is detecting your subscriptions' 
                          : 'Drop a CSV or JSON file from your bank'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <FileText className="h-3.5 w-3.5" />
                      CSV, JSON
                    </div>
                  </div>
                  {isLoading && (
                    <div className="mt-4">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Manual Entry Option */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={onManualStart}
                  disabled={isLoading}
                  className="glass-panel rounded-2xl p-6 glass-panel-hover text-left disabled:opacity-50 spotlight group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shrink-0">
                      <Plus className="h-7 w-7 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">Add Manually</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your subscriptions one by one
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>

                {/* Demo Option */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={onDemo}
                  disabled={isLoading}
                  className="glass-panel rounded-2xl p-6 glass-panel-hover text-left disabled:opacity-50 spotlight group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success to-success/50 flex items-center justify-center shrink-0">
                      <Sparkles className="h-7 w-7 text-success-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">Try Demo</h3>
                      <p className="text-sm text-muted-foreground">
                        See how it works with sample data
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Your data stays private. Processed locally, never stored.
        </motion.p>
      </footer>
    </div>
  )
}

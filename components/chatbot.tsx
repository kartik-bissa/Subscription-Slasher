"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles,
  Lightbulb,
  TrendingDown,
  HelpCircle,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AnalysisResult } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatbotProps {
  data: AnalysisResult | null
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingDown, text: "How can I save money?" },
  { icon: HelpCircle, text: "Which subscription should I cancel?" },
  { icon: Zap, text: "What's my biggest expense?" },
  { icon: Lightbulb, text: "Give me a smart tip" },
]

export function Chatbot({ data }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Add greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      const greeting: Message = {
        id: "greeting",
        role: "assistant",
        content: data && data.subscriptions.length > 0
          ? `Hey there! I'm your SubSlash AI assistant. I can see you have ${data.subscriptions.length} active subscriptions totaling **INR ${data.total_monthly.toLocaleString('en-IN')}/month**.\n\nI found potential savings of **INR ${data.potential_savings.toLocaleString('en-IN')}/month**. Want me to help you optimize your spending?`
          : "Hey there! I'm your SubSlash AI assistant. I can help you analyze your subscriptions and find ways to save money. Add some subscriptions first, and I'll give you personalized recommendations!",
        timestamp: new Date()
      }
      setMessages([greeting])
      setHasGreeted(true)
    }
  }, [isOpen, hasGreeted, data, messages.length])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          subscriptions: data?.subscriptions || [],
          summary: data ? {
            total_monthly: data.total_monthly,
            total_yearly: data.total_yearly,
            potential_savings: data.potential_savings,
            health_score: data.health_score.overall,
            count: data.subscriptions.length
          } : null
        })
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process that. Please make sure your GEMINI_API_KEY is configured correctly.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatMessage = (content: string) => {
    // Convert **text** to bold
    const parts = content.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-primary font-semibold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary to-accent",
          "flex items-center justify-center",
          "shadow-lg glow-primary",
          "transition-transform hover:scale-105 press-scale",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-success rounded-full animate-ping absolute" />
          <span className="w-2 h-2 bg-success rounded-full" />
        </span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[380px] h-[560px] max-h-[80vh]",
              "glass-panel rounded-2xl",
              "flex flex-col overflow-hidden",
              "shadow-2xl border-border/50"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">SubSlash AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 bg-success rounded-full pulse-glow" />
                    Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 chat-bubble",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/50 text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {formatMessage(msg.content)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(q.text)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        "bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground",
                        "transition-colors press-scale"
                      )}
                    >
                      <q.icon className="w-3 h-3" />
                      {q.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className={cn(
                    "flex-1 bg-muted/50 rounded-xl px-4 py-3",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "border-0 outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all disabled:opacity-50"
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "h-11 w-11 rounded-xl",
                    "bg-primary hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "press-scale"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

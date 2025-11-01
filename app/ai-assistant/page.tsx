"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, Sparkles, Activity, Pill, FlaskConical } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const conversation = messages.map(m => ({ role: m.role, content: m.content }))
      
      const res = await fetch("/api/ai/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, conversation }),
      })

      const data = await res.json()

      if (res.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${data.error}`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-fuchsia-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            AI Health Assistant
          </h1>
          <p className="text-violet-50">Get instant health insights powered by artificial intelligence</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white dark:bg-slate-800 shadow-md p-1 rounded-lg">
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              💬 Chat
            </TabsTrigger>
            <TabsTrigger 
              value="symptoms"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
            >
              🩺 Symptoms
            </TabsTrigger>
            <TabsTrigger 
              value="labs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              🔬 Lab Insights
            </TabsTrigger>
            <TabsTrigger 
              value="meds"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              💊 Medications
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="border-2 border-violet-200 dark:border-violet-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-violet-600" />
                  Health Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-16 h-16 text-violet-400 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Hello! I'm your AI Health Assistant</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Ask me about symptoms, medications, health conditions, or general wellness questions.
                        I'm here to help with information and guidance.
                      </p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                            : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === "assistant" && (
                            <Bot className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.role === "user" ? "text-violet-100" : "text-muted-foreground"}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-violet-500 animate-pulse" />
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your health question..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs - placeholder for now */}
          <TabsContent value="symptoms">
            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Symptom Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Symptom analysis feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs">
            <Card className="border-2 border-fuchsia-200 dark:border-fuchsia-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30">
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-fuchsia-600" />
                  Lab Report Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Lab insights feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meds">
            <Card className="border-2 border-pink-200 dark:border-pink-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-pink-600" />
                  Medication Interaction Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Medication checker feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

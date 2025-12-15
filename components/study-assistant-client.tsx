"use client"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, BookOpen, Lightbulb } from "lucide-react"

interface Student {
  name: string
  grade: string
  subjects: string[]
}

export default function StudyAssistantClient({ student }: { student: Student }) {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const streamRef = useRef<ReadableStreamDefaultReader | null>(null)

  useEffect(() => {
    return () => {
      // cancel any ongoing stream when unmounting
      if (streamRef.current) {
        try {
          streamRef.current.cancel()
        } catch {}
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const userMessage = { id: Date.now().toString(), role: "user", content: input }
    setMessages((m) => [...m, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: [{ role: "user", content: userMessage.content }], studentInfo: student }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "AI request failed")
      }

      // Read SSE-style streaming response (if any) and parse `data:` events
      const reader = res.body?.getReader()
      streamRef.current = reader ?? null
      const decoder = new TextDecoder()
      const aiId = Date.now().toString() + "-ai"

      // Add placeholder assistant message to update progressively
      setMessages((m) => [...m, { id: aiId, role: "assistant", content: "" }])

      if (reader) {
        let buffer = ""
        let finished = false

        while (!finished) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE events separated by double newline
          let idx
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)

            // Extract data: lines (may be multiple)
            const lines = rawEvent.split(/\r?\n/)
            let dataPayload = ''
            for (const line of lines) {
              if (line.startsWith('data:')) {
                dataPayload += line.slice(5).trim()
              }
            }

            if (!dataPayload) continue
            if (dataPayload === '[DONE]') {
              finished = true
              break
            }

            // Try parse JSON payload commonly emitted by the AI gateway
            try {
              const parsed = JSON.parse(dataPayload)
              // handle different event shapes
              if (parsed.type === 'text-delta' && parsed.delta) {
                const delta = String(parsed.delta)
                // append delta to the assistant message
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + delta } : m)))
              } else if (parsed.type === 'text-end' || parsed.type === 'finish') {
                finished = true
                break
              } else if (parsed.type === 'error' && parsed.errorText) {
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + '\n\n[Error] ' + parsed.errorText } : m)))
              } else if (parsed.delta) {
                const delta = String(parsed.delta)
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + delta } : m)))
              } else if (typeof parsed === 'string') {
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + parsed } : m)))
              }
            } catch (e) {
              // Not JSON — treat as plain text
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + dataPayload } : m)))
            }
          }
        }

        // If there's any remaining buffer after stream ends, try to process it
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer.trim())
            if (parsed.delta) {
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + String(parsed.delta) } : m)))
            }
          } catch {
            setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + buffer } : m)))
          }
        }
      } else {
        // fallback: try to parse as text
        const assistantText = await res.text()
        setMessages((m) => [...m, { id: Date.now().toString() + "-ai", role: "assistant", content: assistantText }])
      }
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { id: Date.now().toString() + "-err", role: "assistant", content: "Sorry, I couldn't get a response from the AI." }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPrompts = [
    "Suggest study topics for my subjects",
    "Create a study schedule for this week",
    "Recommend study techniques",
    "Help me understand calculus derivatives",
  ]

  const handleSuggestedPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance">AI Study Assistant</h1>
          </div>
          <p className="text-muted-foreground">Get personalized study recommendations and guidance</p>
        </div>

        {student.subjects.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Lightbulb className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">How can I help you study today?</h3>
                  <p className="text-muted-foreground mb-6">Ask me anything about your subjects or study strategies</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {suggestedPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="text-left h-auto py-3 px-4 bg-transparent"
                      >
                        <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about studying..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips for Better Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific about the topics you need help with</li>
              <li>• Mention your grade level for age-appropriate guidance</li>
              <li>• Ask for study schedules, techniques, or topic explanations</li>
              <li>• Request practice problems or quiz questions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

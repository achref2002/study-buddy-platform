"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Session {
  _id: string
  title: string
  topic: string
  date: string
  duration: number
  participants: string[]
  status: string
}

export default function CalendarClient({
  sessions,
  currentUserId,
}: {
  sessions: Session[]
  currentUserId: string
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>()
    sessions.forEach((session) => {
      const date = new Date(session.date)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)?.push(session)
    })
    return map
  }, [sessions])

  const getSessionsForDate = (day: number) => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
    return sessionsByDate.get(key) || []
  }

  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return []
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    return sessionsByDate.get(key) || []
  }, [selectedDate, sessionsByDate])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const days = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1)
  const firstDay = firstDayOfMonth(currentDate)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const isToday = (day: number) => {
    const today = new Date()
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      currentDate.getFullYear() === selectedDate.getFullYear() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    )
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Study Calendar</h1>
          <p className="text-muted-foreground">View and manage your study sessions schedule</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{monthName}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const daySessions = getSessionsForDate(day)
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "aspect-square p-2 rounded-lg border text-sm font-medium transition-colors relative",
                        "hover:bg-accent hover:border-accent-foreground",
                        isToday(day) && "border-primary bg-primary/10",
                        isSelected(day) && "bg-accent border-accent-foreground",
                      )}
                    >
                      <span className="block">{day}</span>
                      {daySessions.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {daySessions.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
              <CardDescription>
                {selectedDate && selectedDateSessions.length > 0
                  ? `${selectedDateSessions.length} session${selectedDateSessions.length > 1 ? "s" : ""}`
                  : "No sessions scheduled"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDateSessions.map((session) => (
                  <div key={session._id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{session.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{session.topic}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(session.date)} • {session.duration} min
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{session.participants.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

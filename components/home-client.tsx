"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, BookOpen, TrendingUp, Video } from "lucide-react"
import Link from "next/link"

interface Session {
  _id: string
  title: string
  topic: string
  date: string
  duration: number
  status: string
  participants: number
}

interface Student {
  name: string
  grade: string
  subjects: string[]
}

export default function HomeClient({ student, sessions }: { student: Student; sessions: Session[] }) {
  const now = new Date()
  const upcomingSessions = sessions.filter((s) => new Date(s.date) > now && s.status !== "cancelled").slice(0, 3)
  const isSessionCompleted = (s: Session) => s.status === "completed" || new Date(s.date) <= now
  const completedCount = sessions.filter((s) => isSessionCompleted(s)).length
  const totalHours = Math.round(
    sessions.filter((s) => isSessionCompleted(s)).reduce((sum, s) => sum + s.duration, 0) / 60,
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">
            {getGreeting()}, {student.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Welcome back to your study space</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total study sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalHours}</div>
              <p className="text-xs text-muted-foreground mt-1">Hours of focused study</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{student.subjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Subjects you're studying</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your next study sessions</CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href="/study-sessions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming sessions</p>
                  <Button asChild className="mt-4">
                    <Link href="/study-sessions">Browse Sessions</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session._id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold">{session.title}</h4>
                          <Badge variant="secondary">{session.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{session.topic}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{formatDate(session.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{session.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="sm" className="gap-2">
                        <Link href={`/study-sessions/${session._id}/video`}>
                          <Video className="w-4 h-4" />
                          Join
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <Link href="/calendar">
                    <CalendarIcon className="w-4 h-4" />
                    View Calendar
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <Link href="/study-assistant">
                    <BookOpen className="w-4 h-4" />
                    AI Study Assistant
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <Link href="/profile">
                    <TrendingUp className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {student.subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Subjects</CardTitle>
                  <CardDescription>Currently studying</CardDescription>
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
          </div>
        </div>
      </div>
    </div>
  )
}

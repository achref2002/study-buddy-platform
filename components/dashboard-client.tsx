"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, TrendingUp, Calendar, Award } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Session {
  _id: string
  title: string
  topic: string
  date: string
  duration: number
  status: string
}

export default function DashboardClient({ student, sessions }: { student: any; sessions: Session[] }) {
  const isSessionCompleted = (s: Session) => s.status === "completed" || new Date(s.date) <= new Date()

  const stats = useMemo(() => {
    const now = new Date()
    const completed = sessions.filter((s) => isSessionCompleted(s))
    const upcoming = sessions.filter((s) => new Date(s.date) > now && s.status !== "cancelled")
    const totalHours = Math.round(completed.reduce((sum, s) => sum + s.duration, 0) / 60)
    const thisWeek = completed.filter((s) => {
      const sessionDate = new Date(s.date)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return sessionDate >= weekAgo && sessionDate <= now
    })

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      upcomingSessions: upcoming.length,
      totalHours,
      thisWeekSessions: thisWeek.length,
      completionRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
    }
  }, [sessions])

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map((date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const sessionsOnDay = sessions.filter((s) => {
        const sessionDate = new Date(s.date)
        return (
          sessionDate.getDate() === date.getDate() &&
          sessionDate.getMonth() === date.getMonth() &&
          isSessionCompleted(s)
        )
      })
      const hours = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0) / 60

      return {
        day: dayName,
        hours: Math.round(hours * 10) / 10,
      }
    })
  }, [sessions])

  const recentSessions = sessions
    .filter((s) => isSessionCompleted(s))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Progress Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress and achievements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.completedSessions} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalHours}</div>
              <p className="text-xs text-muted-foreground mt-1">Total hours studied</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.thisWeekSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of all sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Study Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Study Activity</CardTitle>
              <CardDescription>Your study hours over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>{stats.upcomingSessions} sessions scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                  <p className="text-sm text-muted-foreground">sessions ahead</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your completed study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed sessions yet</p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">{session.title}</h4>
                      <p className="text-sm text-muted-foreground">{session.topic}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {session.duration} min
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

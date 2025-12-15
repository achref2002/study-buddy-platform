"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Clock, CalendarIcon, Video } from "lucide-react"
import { CreateSessionDialog } from "./create-session-dialog"
import { useRouter } from "next/navigation"

interface Session {
  _id: string
  title: string
  topic: string
  date: string
  duration: number
  participants: string[]
  createdBy: string
  status: string
  liveKitRoomName?: string
}

export default function StudySessionsClient({
  sessions,
  currentUserId,
}: {
  sessions: Session[]
  currentUserId: string
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleJoinSession = async (sessionId: string) => {
    setIsLoading(sessionId)
    try {
      const response = await fetch("/api/study-sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to join session")
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setIsLoading(null)
    }
  }

  const handleLeaveSession = async (sessionId: string) => {
    setIsLoading(sessionId)
    try {
      const response = await fetch("/api/study-sessions/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to leave session")
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setIsLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isParticipant = (session: Session) => {
    return session.participants.includes(currentUserId)
  }

  const upcomingSessions = sessions.filter((s) => new Date(s.date) > new Date())
  const pastSessions = sessions.filter((s) => new Date(s.date) <= new Date())

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Study Sessions</h1>
            <p className="text-muted-foreground">Join or create collaborative study sessions</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Session
          </Button>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Sessions</h2>
            {upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No upcoming sessions. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <Card key={session._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{session.title}</CardTitle>
                          <CardDescription>{session.topic}</CardDescription>
                        </div>
                        <Badge variant={session.status === "active" ? "default" : "secondary"}>{session.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(session.date)} • {session.duration} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{session.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isParticipant(session) ? (
                          <>
                            <Button
                              variant="default"
                              className="flex-1 gap-2"
                              onClick={() => router.push(`/study-sessions/${session._id}/video`)}
                            >
                              <Video className="w-4 h-4" />
                              Join Video
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleLeaveSession(session._id)}
                              disabled={isLoading === session._id}
                            >
                              Leave
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => handleJoinSession(session._id)}
                            disabled={isLoading === session._id}
                          >
                            {isLoading === session._id ? "Joining..." : "Join Session"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Past Sessions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
                  <Card key={session._id} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="text-xl">{session.title}</CardTitle>
                      <CardDescription>{session.topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{session.participants.length} participants</span>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <CreateSessionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </div>
  )
}

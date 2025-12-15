"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface VideoRoomClientProps {
  roomName: string
  userName: string
  sessionTitle: string
  sessionId: string
}

export default function VideoRoomClient({
  roomName,
  userName,
  sessionTitle,
  sessionId,
}: VideoRoomClientProps) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const fetchToken = async () => {
      try {
        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            roomName,
            participantName: userName, // MUST stay stable
          }),
        })

        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "Failed to get token")
        }

        const data = await res.json()
        if (!cancelled) {
          setToken(data.token)
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError("Failed to join video session")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchToken()

    return () => {
      cancelled = true
    }
  }, [roomName, userName])

  const handleLeaveRoom = () => {
    router.push("/study-sessions")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => router.push("/study-sessions")}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        audio={false}   // IMPORTANT
        video={false}   // IMPORTANT
        onDisconnected={handleLeaveRoom}
        data-lk-theme="default"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}

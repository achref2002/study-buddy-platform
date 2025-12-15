import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getStudySessionById } from "@/lib/db-helpers"
import VideoRoomClient from "@/components/video-room-client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function VideoRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    redirect("/auth")
  }

  const studySession = await getStudySessionById(id)

  if (!studySession) {
    redirect("/study-sessions")
  }

  // Check if user is a participant
  const isParticipant = studySession.participants.some((p) => p.toString() === session.user.id)

  if (!isParticipant) {
    redirect("/study-sessions")
  }

  return (
    <VideoRoomClient
      roomName={studySession.liveKitRoomName || ""}
      userName={session.user.name || "Student"}
      sessionTitle={studySession.title}
      sessionId={id}
    />
  )
}

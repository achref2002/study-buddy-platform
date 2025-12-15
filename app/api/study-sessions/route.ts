import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createStudySession, addParticipantToSession } from "@/lib/db-helpers"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, topic, date, duration } = await req.json()

    if (!title || !topic || !date || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const liveKitRoomName = `study-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`

    const sessionId = await createStudySession({
      title,
      topic,
      date: new Date(date),
      duration,
      participants: [],
      createdBy: session.user.id as any,
      liveKitRoomName,
      status: "scheduled",
      createdAt: new Date(),
    })

    // Auto-join the creator to the session
    await addParticipantToSession(sessionId.toString(), session.user.id)

    return NextResponse.json({ sessionId: sessionId.toString() }, { status: 201 })
  } catch (error) {
    console.error("[CREATE_SESSION_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

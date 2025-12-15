import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { addParticipantToSession } from "@/lib/db-helpers"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const success = await addParticipantToSession(sessionId, session.user.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to join session" }, { status: 400 })
    }

    return NextResponse.json({ message: "Joined session successfully" })
  } catch (error) {
    console.error("[JOIN_SESSION_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

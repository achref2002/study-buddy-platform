import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { AccessToken } from "livekit-server-sdk"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomName, participantName } = await req.json()

    if (!roomName || !participantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      )
    }

    // ✅ STABLE identity (CRITICAL)
    const identity = `user-${session.user.id}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName, // display name only
      ttl: 60 * 60, // 1 hour
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[LIVEKIT_TOKEN_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}

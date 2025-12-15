import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import StudySessionsClient from "@/components/study-sessions-client"
import { getStudySessions } from "@/lib/db-helpers"
import type { ObjectId } from "mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function StudySessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth")
  }

  const sessions = await getStudySessions({ status: { $ne: "cancelled" } as any })

  const serializedSessions = sessions.map((s) => ({
    ...s,
    _id: s._id?.toString() || "",
    createdBy: s.createdBy.toString(),
    participants: s.participants.map((p: ObjectId) => p.toString()),
    date: s.date.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
  }))

  return <StudySessionsClient sessions={serializedSessions} currentUserId={session.user.id} />
}

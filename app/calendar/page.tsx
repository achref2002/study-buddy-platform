import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import CalendarClient from "@/components/calendar-client"
import { getStudySessions } from "@/lib/db-helpers"
import type { ObjectId } from "mongodb"

export default async function CalendarPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth")
  }

  const sessions = await getStudySessions()

  const serializedSessions = sessions.map((s) => ({
    _id: s._id?.toString() || "",
    title: s.title,
    topic: s.topic,
    date: s.date.toISOString(),
    duration: s.duration,
    participants: s.participants.map((p: ObjectId) => p.toString()),
    status: s.status,
  }))

  return <CalendarClient sessions={serializedSessions} currentUserId={session.user.id} />
}

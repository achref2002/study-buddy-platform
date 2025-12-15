import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getStudentById, getStudySessions } from "@/lib/db-helpers"
import HomeClient from "@/components/home-client"
import type { ObjectId } from "mongodb"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth")
  }

  const student = await getStudentById(session.user.id)
  const allSessions = await getStudySessions()

  const userSessions = allSessions.filter((s) => s.participants.some((p: ObjectId) => p.toString() === session.user.id))

  const serializedSessions = userSessions.map((s) => ({
    _id: s._id?.toString() || "",
    title: s.title,
    topic: s.topic,
    date: s.date.toISOString(),
    duration: s.duration,
    status: s.status,
    participants: s.participants.length,
  }))

  return (
    <HomeClient
      student={{
        name: student?.name || session.user.name || "Student",
        grade: student?.grade || "",
        subjects: student?.subjects || [],
      }}
      sessions={serializedSessions}
    />
  )
}

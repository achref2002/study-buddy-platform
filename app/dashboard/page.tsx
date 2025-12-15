import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getStudentById, getStudySessions } from "@/lib/db-helpers"
import DashboardClient from "@/components/dashboard-client"
import type { ObjectId } from "mongodb"

export default async function DashboardPage() {
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
  }))

  const serializedStudent = {
    _id: student?._id?._bsontype === "ObjectID" || student?._id ? student?._id?.toString() : "",
    name: student?.name || session.user.name || "",
    email: student?.email || session.user.email || "",
    grade: student?.grade || "",
    subjects: student?.subjects || [],
    studySessions: (student?.studySessions || []).map((id: any) => (id?._bsontype === "ObjectID" || id ? id.toString() : id)),
    createdAt: student?.createdAt ? student.createdAt.toISOString() : undefined,
    updatedAt: student?.updatedAt ? student.updatedAt.toISOString() : undefined,
  }

  return <DashboardClient student={serializedStudent} sessions={serializedSessions} />
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getStudentById } from "@/lib/db-helpers"
import StudyAssistantClient from "@/components/study-assistant-client"

export default async function StudyAssistantPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth")
  }

  const student = await getStudentById(session.user.id)

  return (
    <StudyAssistantClient
      student={{
        name: student?.name || session.user.name || "",
        grade: student?.grade || "",
        subjects: student?.subjects || [],
      }}
    />
  )
}

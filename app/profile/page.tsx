import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getStudentById } from "@/lib/db-helpers"
import ProfileClient from "@/components/profile-client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth")
  }

  const student = await getStudentById(session.user.id)

  return (
    <ProfileClient
      student={{
        _id: student?._id?.toString() || "",
        name: student?.name || session.user.name || "",
        email: student?.email || session.user.email || "",
        grade: student?.grade || "",
        subjects: student?.subjects || [],
      }}
    />
  )
}

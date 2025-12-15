import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { updateStudent } from "@/lib/db-helpers"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, grade, subjects, email, password } = await req.json()

    const { db } = await connectToDatabase()

    if (email) {
      const existing = await db.collection("students").findOne({ email })
      if (existing && existing._id.toString() !== session.user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    const updateData: any = {
      name,
      grade,
      subjects,
    }

    if (email) updateData.email = email
    if (password) updateData.password = await bcrypt.hash(password, 12)

    const success = await updateStudent(session.user.id, updateData)

    if (!success) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

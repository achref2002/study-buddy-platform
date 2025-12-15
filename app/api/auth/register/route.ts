import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password, grade } = await req.json()

    // Log incoming registration attempts (mask email)
    try {
      const safeEmail = typeof email === 'string' ? `${email.slice(0, 3)}***${email.slice(email.indexOf('@'))}` : undefined
      console.log('[REGISTER_INCOMING]', { email: safeEmail })
    } catch (e) {
      console.log('[REGISTER_INCOMING] malformed payload')
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    console.log('[REGISTER] connected to database')

    const existingUser = await db.collection("students").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await db.collection("students").insertOne({
      name,
      email,
      password: hashedPassword,
      grade: grade || "",
      subjects: [],
      studySessions: [],
      createdAt: new Date(),
    })

    console.log('[REGISTER] user inserted', { insertedId: result.insertedId?.toString?.() })

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

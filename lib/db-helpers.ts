import { ObjectId } from "mongodb"
import { connectToDatabase } from "./mongodb"
import type { Student } from "./models/student"
import type { StudySession } from "./models/study-session"

export async function getStudentByEmail(email: string): Promise<Student | null> {
  const { db } = await connectToDatabase()
  return await db.collection<Student>("students").findOne({ email })
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { db } = await connectToDatabase()
  return await db.collection<Student>("students").findOne({ _id: new ObjectId(id) })
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db
    .collection("students")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

export async function getStudySessions(filter: Partial<StudySession> = {}): Promise<StudySession[]> {
  const { db } = await connectToDatabase()
  return await db.collection<StudySession>("studySessions").find(filter).sort({ date: 1 }).toArray()
}

export async function getStudySessionById(id: string): Promise<StudySession | null> {
  const { db } = await connectToDatabase()
  return await db.collection<StudySession>("studySessions").findOne({ _id: new ObjectId(id) })
}

export async function createStudySession(session: Omit<StudySession, "_id">): Promise<ObjectId> {
  const { db } = await connectToDatabase()
  const result = await db.collection("studySessions").insertOne(session)
  return result.insertedId
}

export async function updateStudySession(id: string, data: Partial<StudySession>): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db
    .collection("studySessions")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

export async function addParticipantToSession(sessionId: string, studentId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db
    .collection("studySessions")
    .updateOne({ _id: new ObjectId(sessionId) }, { $addToSet: { participants: new ObjectId(studentId) } })

  if (result.modifiedCount > 0) {
    await db
      .collection("students")
      .updateOne({ _id: new ObjectId(studentId) }, { $addToSet: { studySessions: new ObjectId(sessionId) } })
    return true
  }
  return false
}

export async function removeParticipantFromSession(sessionId: string, studentId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db
    .collection("studySessions")
    .updateOne({ _id: new ObjectId(sessionId) }, { $pull: { participants: new ObjectId(studentId) } })

  if (result.modifiedCount > 0) {
    await db
      .collection("students")
      .updateOne({ _id: new ObjectId(studentId) }, { $pull: { studySessions: new ObjectId(sessionId) } })
    return true
  }
  return false
}

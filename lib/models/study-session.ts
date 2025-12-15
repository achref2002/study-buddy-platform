import type { ObjectId } from "mongodb"

export interface StudySession {
  _id?: ObjectId
  title: string
  topic: string
  date: Date
  duration: number // in minutes
  participants: ObjectId[]
  createdBy: ObjectId
  liveKitRoomName?: string
  status: "scheduled" | "active" | "completed" | "cancelled"
  createdAt: Date
  updatedAt?: Date
}

export interface StudySessionWithId extends StudySession {
  _id: ObjectId
}

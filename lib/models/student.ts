import type { ObjectId } from "mongodb"

export interface Student {
  _id?: ObjectId
  name: string
  email: string
  password?: string
  grade: string
  subjects: string[]
  studySessions: ObjectId[]
  createdAt: Date
  updatedAt?: Date
}

export interface StudentWithId extends Student {
  _id: ObjectId
}

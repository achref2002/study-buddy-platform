// This script seeds the database with sample data for testing

const db = db.getSiblingDB("pera")

// Clear existing data
db.students.deleteMany({})
db.studySessions.deleteMany({})

print("Cleared existing data")

// Seed sample students
const student1 = db.students.insertOne({
  name: "Alice Johnson",
  email: "alice@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NAJg.QDFgqFS", // password: "test123"
  grade: "10th Grade",
  subjects: ["Mathematics", "Physics", "Chemistry"],
  studySessions: [],
  createdAt: new Date(),
})

const student2 = db.students.insertOne({
  name: "Bob Smith",
  email: "bob@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NAJg.QDFgqFS", // password: "test123"
  grade: "11th Grade",
  subjects: ["Mathematics", "Computer Science", "English"],
  studySessions: [],
  createdAt: new Date(),
})

const student3 = db.students.insertOne({
  name: "Carol Davis",
  email: "carol@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NAJg.QDFgqFS", // password: "test123"
  grade: "10th Grade",
  subjects: ["Biology", "Chemistry", "Mathematics"],
  studySessions: [],
  createdAt: new Date(),
})

print(`Created ${db.students.countDocuments()} students`)

// Seed sample study sessions
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(14, 0, 0, 0)

const nextWeek = new Date()
nextWeek.setDate(nextWeek.getDate() + 7)
nextWeek.setHours(15, 30, 0, 0)

const session1 = db.studySessions.insertOne({
  title: "Calculus Study Group",
  topic: "Derivatives and Integration",
  date: tomorrow,
  duration: 90,
  participants: [],
  createdBy: student1.insertedId,
  liveKitRoomName: "calculus-study-" + Date.now(),
  status: "scheduled",
  createdAt: new Date(),
})

const session2 = db.studySessions.insertOne({
  title: "Physics Problem Solving",
  topic: "Newton's Laws of Motion",
  date: nextWeek,
  duration: 60,
  participants: [],
  createdBy: student3.insertedId,
  liveKitRoomName: "physics-study-" + Date.now(),
  status: "scheduled",
  createdAt: new Date(),
})

// Update students with their study sessions
db.students.updateOne(
  { _id: student1.insertedId },
  { $set: { studySessions: [session1.insertedId, session2.insertedId] } },
)

db.students.updateOne({ _id: student2.insertedId }, { $set: { studySessions: [session1.insertedId] } })

db.students.updateOne({ _id: student3.insertedId }, { $set: { studySessions: [session2.insertedId] } })

db.studySessions.updateOne(
  { _id: session1.insertedId },
  { $set: { participants: [student1.insertedId, student2.insertedId] } },
)

db.studySessions.updateOne(
  { _id: session2.insertedId },
  { $set: { participants: [student1.insertedId, student3.insertedId] } },
)

print(`Created ${db.studySessions.countDocuments()} study sessions`)
print("Database seeded successfully!")
print("\nSample login credentials:")
print("Email: alice@example.com")
print("Email: bob@example.com")
print("Email: carol@example.com")
print("Password for all: test123")

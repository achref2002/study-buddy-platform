// This script creates the MongoDB collections with validation rules

const db = db.getSiblingDB("pera")

// Create students collection
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email and is required",
        },
        password: {
          bsonType: "string",
          description: "hashed password",
        },
        grade: {
          bsonType: "string",
          description: "student's grade level",
        },
        subjects: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          description: "array of subject strings",
        },
        studySessions: {
          bsonType: "array",
          items: {
            bsonType: "objectId",
          },
          description: "array of study session references",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required",
        },
        updatedAt: {
          bsonType: "date",
          description: "last update timestamp",
        },
      },
    },
  },
})

// Create unique index on email
db.students.createIndex({ email: 1 }, { unique: true })

print("Students collection created successfully")

// Create studySessions collection
db.createCollection("studySessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "topic", "date", "duration", "createdBy", "createdAt"],
      properties: {
        title: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        topic: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        date: {
          bsonType: "date",
          description: "must be a date and is required",
        },
        duration: {
          bsonType: "number",
          minimum: 0,
          description: "duration in minutes",
        },
        participants: {
          bsonType: "array",
          items: {
            bsonType: "objectId",
          },
          description: "array of student references",
        },
        createdBy: {
          bsonType: "objectId",
          description: "student who created the session",
        },
        liveKitRoomName: {
          bsonType: "string",
          description: "LiveKit room identifier",
        },
        status: {
          enum: ["scheduled", "active", "completed", "cancelled"],
          description: "session status",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required",
        },
        updatedAt: {
          bsonType: "date",
          description: "last update timestamp",
        },
      },
    },
  },
})

// Create indexes for studySessions
db.studySessions.createIndex({ date: 1 })
db.studySessions.createIndex({ createdBy: 1 })
db.studySessions.createIndex({ status: 1 })
db.studySessions.createIndex({ participants: 1 })

print("Study sessions collection created successfully")
print("Database setup complete!")

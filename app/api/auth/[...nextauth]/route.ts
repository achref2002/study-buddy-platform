import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const { db } = await connectToDatabase()
        const user = await db.collection("students").findOne({
          email: credentials.email,
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Keep signIn simple; JWT callback will ensure a student record and
      // set the token subject to the MongoDB `_id` string for consistency.
      return true
    },
    async jwt({ token, user, account }) {
      // On first sign in (when `account` and `user` are present), ensure the
      // students collection contains a document for this user and set
      // `token.sub` to the student's ObjectId string so `session.user.id`
      // becomes a valid MongoDB id.
      if (account && user) {
        const email = (user as any).email
        const name = (user as any).name || ""
        const { db } = await connectToDatabase()
        let student = await db.collection("students").findOne({ email })

        if (!student) {
          const result = await db.collection("students").insertOne({
            name,
            email,
            grade: "",
            subjects: [],
            studySessions: [],
            createdAt: new Date(),
          })
          student = await db.collection("students").findOne({ _id: result.insertedId })
        }

        if (student?._id) {
          token.sub = student._id.toString()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

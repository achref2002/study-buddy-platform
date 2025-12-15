import { getServerSession } from "next-auth/next"

export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user
}

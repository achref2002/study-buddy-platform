import NextAuthMiddleware from "next-auth/middleware"

export default NextAuthMiddleware

// Also export a named `middleware` for Next.js compatibility
export const middleware = NextAuthMiddleware

export const config = {
  matcher: ["/home", "/profile", "/calendar", "/study-sessions", "/study-assistant", "/dashboard"],
}

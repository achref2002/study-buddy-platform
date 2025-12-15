export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/home", "/profile", "/calendar", "/study-sessions", "/study-assistant", "/dashboard"],
}

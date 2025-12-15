"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import PWARegister from "./pwa-register"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWARegister />
      {children}
    </SessionProvider>
  )
}

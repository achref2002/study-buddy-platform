"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!('serviceWorker' in navigator)) return

    const registerSw = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        console.log('Service worker registered:', reg.scope)
      } catch (err) {
        console.warn('Service worker registration failed:', err)
      }
    }

    // Register after load to avoid blocking
    if (document.readyState === 'complete') registerSw()
    else window.addEventListener('load', registerSw)

    return () => window.removeEventListener('load', registerSw)
  }, [])

  return null
}

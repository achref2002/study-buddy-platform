import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log('[HEALTH_CHECK] start')
    const { db } = await connectToDatabase()
    // ping the server
    const res = await db.command({ ping: 1 })
    console.log('[HEALTH_CHECK] mongo ping', { ok: res?.ok })
    return NextResponse.json({ status: 'ok', mongodb: { connected: true, result: res } }, { status: 200 })
  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error)
    return NextResponse.json({ status: 'error', mongodb: { connected: false } }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const count = await db.transaction.count()

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      transactionCount: count,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

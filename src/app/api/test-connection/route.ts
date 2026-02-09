import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Connection successful!',
    timestamp: new Date().toISOString(),
    server: 'Next.js 16.1.3',
    status: 'ok'
  })
}

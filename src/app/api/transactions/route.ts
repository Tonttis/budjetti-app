import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/transactions - Request received')
    console.log('[API] Request headers:', Object.fromEntries(request.headers))

    const transactions = await db.transaction.findMany({
      orderBy: { date: 'desc' as const }
    })

    console.log('[API] GET - Found transactions:', transactions.length)

    // Serialize dates to avoid JSON serialization issues
    const serialized = transactions.map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt)
    }))

    console.log('[API] GET - Sending response')
    return NextResponse.json(serialized, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('[API] GET - Error:', error)
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/transactions - Request received')

    const body = await request.json()
    console.log('[API] POST - Request body:', { ...body, password: '[REDACTED]' })
    const { type, amount, category, description, date } = body

    if (!type || !amount || !category || !date) {
      console.log('[API] POST - Validation failed: Missing fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (type !== 'income' && type !== 'expense') {
      console.log('[API] POST - Validation failed: Invalid type')
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount) || numAmount <= 0) {
      console.log('[API] POST - Validation failed: Invalid amount')
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const transaction = await db.transaction.create({
      data: {
        type,
        amount: numAmount,
        category,
        description: description || null,
        date: new Date(date)
      }
    })

    console.log('[API] POST - Transaction created:', transaction.id)

    // Serialize dates
    const serialized = {
      ...transaction,
      date: transaction.date instanceof Date ? transaction.date.toISOString() : String(transaction.date),
      createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : String(transaction.createdAt),
      updatedAt: transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : String(transaction.updatedAt)
    }

    console.log('[API] POST - Sending response')
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error('[API] POST - Error:', error)
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

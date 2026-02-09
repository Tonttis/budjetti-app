import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, category, description, date } = body

    if (!type || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        type,
        amount: numAmount,
        category,
        description: description || null,
        date: new Date(date)
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('[API] PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}

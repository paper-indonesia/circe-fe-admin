import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Withdrawal from '@/models/Withdrawal'
import Staff from '@/models/Staff'
import { requireAuth, getScopedQuery, verifyOwnership } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await dbConnect()

    // Get user's staff based on ownerId
    const staff = await Staff.find(getScopedQuery(user.userId))

    const withdrawals = await Withdrawal.find({
      ownerId: user.userId
    }).sort({ createdAt: -1 })

    // Calculate totals from user's staff
    const totalBalance = staff.reduce((sum, s) => sum + (s.balance || 0), 0)
    const totalEarnings = staff.reduce((sum, s) => sum + (s.totalEarnings || 0), 0)
    const totalWithdrawn = staff.reduce((sum, s) => sum + (s.totalWithdrawn || 0), 0)

    return NextResponse.json({
      withdrawals,
      balance: totalBalance,
      totalEarnings: totalEarnings,
      totalWithdrawn: totalWithdrawn,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await dbConnect()

    const body = await request.json()

    // Validate staff ownership
    const staff = await Staff.findById(body.staffId)

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      )
    }

    if (!verifyOwnership(staff, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized - staff access denied' },
        { status: 403 }
      )
    }

    if (body.amount > staff.balance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    if (body.amount < 50000) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is Rp 50,000' },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      ownerId: user.userId,
      staffId: body.staffId,
      amount: body.amount,
      status: 'pending',
      bankAccount: {
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        accountName: body.accountName,
      },
      notes: body.notes,
      requestDate: new Date(),
    })

    // Update staff balance (deduct the amount)
    await Staff.findByIdAndUpdate(body.staffId, {
      $inc: {
        balance: -body.amount
      }
    })

    return NextResponse.json({
      success: true,
      withdrawal,
      message: 'Withdrawal request submitted successfully'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error creating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    )
  }
}

// Admin endpoint to approve/reject withdrawals
export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await dbConnect()

    const body = await request.json()
    const { withdrawalId, status, rejectionReason } = body

    // All users can approve their own withdrawals

    const withdrawal = await Withdrawal.findById(withdrawalId)

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (!verifyOwnership(withdrawal, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized - withdrawal access denied' },
        { status: 403 }
      )
    }

    // Update withdrawal status
    withdrawal.status = status
    withdrawal.processedDate = new Date()

    if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason

      // Refund the balance if rejected
      await Staff.findByIdAndUpdate(withdrawal.staffId, {
        $inc: {
          balance: withdrawal.amount
        }
      })
    } else if (status === 'completed') {
      // Update total withdrawn amount
      await Staff.findByIdAndUpdate(withdrawal.staffId, {
        $inc: {
          totalWithdrawn: withdrawal.amount
        }
      })
    }

    await withdrawal.save()

    return NextResponse.json({
      success: true,
      withdrawal,
      message: `Withdrawal ${status} successfully`
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error updating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Withdrawal from '@/models/Withdrawal'
import Staff from '@/models/Staff'
import { getServerSession } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await dbConnect()
    
    // Get user from session or request headers
    const staffId = request.headers.get('x-staff-id')
    
    if (!staffId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get withdrawals for this staff member
    const withdrawals = await Withdrawal.find({
      staffId,
      tenant: params.tenant
    }).sort({ createdAt: -1 })

    // Get staff balance info
    const staff = await Staff.findById(staffId)
    
    return NextResponse.json({
      withdrawals,
      balance: staff?.balance || 0,
      totalEarnings: staff?.totalEarnings || 0,
      totalWithdrawn: staff?.totalWithdrawn || 0,
    })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const staffId = request.headers.get('x-staff-id')
    
    if (!staffId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate withdrawal amount
    const staff = await Staff.findById(staffId)
    
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
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
      staffId,
      tenant: params.tenant,
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
    await Staff.findByIdAndUpdate(staffId, {
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
    console.error('Error creating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    )
  }
}

// Admin endpoint to approve/reject withdrawals
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { withdrawalId, status, rejectionReason } = body
    
    // Check if user is admin
    const isAdmin = request.headers.get('x-is-admin') === 'true'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const withdrawal = await Withdrawal.findById(withdrawalId)
    
    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
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
    console.error('Error updating withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    )
  }
}
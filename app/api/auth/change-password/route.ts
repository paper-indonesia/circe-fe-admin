import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword, hashPassword, requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Log environment variable status
    console.log('🔍 Change Password - Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI_exists: !!process.env.MONGO_URI,
      MONGO_URI_length: process.env.MONGO_URI?.length,
      MONGO_URI_masked: process.env.MONGO_URI ?
        process.env.MONGO_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@') :
        'NOT SET',
      JWT_SECRET_exists: !!process.env.JWT_SECRET
    })

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Get user from request using the helper function
    const decoded = requireAuth(req)

    await connectMongoDB()

    // Find the user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Collect console logs
  const logs: string[] = []
  const originalLog = console.log
  console.log = (...args) => {
    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '))
    originalLog(...args)
  }

  try {
    // Log environment check
    console.log('🔍 API Test Environment Check Started')
    console.log('================================')
    
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: {
        exists: !!process.env.MONGO_URI,
        length: process.env.MONGO_URI?.length || 0,
        startsWithMongodb: process.env.MONGO_URI?.startsWith('mongodb') || false,
        hasAtSign: process.env.MONGO_URI?.includes('@') || false,
        masked: process.env.MONGO_URI ? 
          process.env.MONGO_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@') : 
          'NOT SET'
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
        isDefault: process.env.JWT_SECRET === 'your-secret-key-change-in-production'
      },
      dbConnection: {
        success: false,
        error: null as string | null
      },
      timestamp: new Date().toISOString(),
      serverLogs: ''
    }

    console.log('Environment Variables Status:')
    console.log(`- NODE_ENV: ${envCheck.NODE_ENV}`)
    console.log(`- MONGO_URI exists: ${envCheck.MONGO_URI.exists}`)
    console.log(`- MONGO_URI length: ${envCheck.MONGO_URI.length}`)
    console.log(`- MONGO_URI valid format: ${envCheck.MONGO_URI.startsWithMongodb}`)
    console.log(`- MONGO_URI masked: ${envCheck.MONGO_URI.masked}`)
    console.log(`- JWT_SECRET exists: ${envCheck.JWT_SECRET.exists}`)
    console.log(`- JWT_SECRET is default: ${envCheck.JWT_SECRET.isDefault}`)

    // Test database connection
    if (process.env.MONGO_URI) {
      console.log('\n🔄 Testing Database Connection...')
      try {
        await connectMongoDB()
        envCheck.dbConnection.success = true
        console.log('✅ Database connection successful!')
      } catch (error: any) {
        envCheck.dbConnection.success = false
        envCheck.dbConnection.error = error.message
        console.log('❌ Database connection failed:', error.message)
      }
    } else {
      console.log('\n⚠️ Skipping database connection test - MONGO_URI not set')
      envCheck.dbConnection.error = 'MONGO_URI not configured'
    }

    console.log('\n================================')
    console.log('🔍 API Test Environment Check Completed')

    // Restore original console.log
    console.log = originalLog

    // Add collected logs to response
    envCheck.serverLogs = logs.join('\n')

    return NextResponse.json(envCheck, { status: 200 })
  } catch (error: any) {
    // Restore original console.log
    console.log = originalLog
    
    console.error('Test environment check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check environment', 
        details: error.message,
        serverLogs: logs.join('\n')
      },
      { status: 500 }
    )
  }
}
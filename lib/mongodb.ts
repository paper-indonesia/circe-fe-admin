import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO_URI || ''

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectMongoDB() {
  // Log MONGO_URI for debugging (masking sensitive parts)
  console.log('🔍 MONGO_URI check:', {
    exists: !!MONGODB_URI,
    length: MONGODB_URI?.length,
    startsWithMongodb: MONGODB_URI?.startsWith('mongodb'),
    hasAtSign: MONGODB_URI?.includes('@'),
    // Log masked URI (show only protocol and last part after @)
    masked: MONGODB_URI ? 
      MONGODB_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@') : 
      'NOT SET'
  })

  // Check for MONGO_URI at runtime, not at module load time
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGO_URI environment variable inside .env'
    )
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'paper-circe', // Database name for our multitenancy app
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { connectMongoDB }
export default connectMongoDB

// Type declaration for global
declare global {
  var mongoose: {
    conn: any
    promise: any
  }
}

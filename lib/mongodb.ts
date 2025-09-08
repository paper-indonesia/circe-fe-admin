import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO_URI || ''

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env'
  )
}

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
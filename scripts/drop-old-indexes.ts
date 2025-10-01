/**
 * Drop old indexes from previous schema versions
 */

import 'dotenv/config'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || ''
const DB_NAME = process.env.MONGODB_DB_NAME || 'paper-circe'

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME })
    console.log('✅ Connected to MongoDB')
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

async function dropOldIndexes() {
  console.log('\n🗑️  Dropping old indexes...')

  const collections = ['treatments', 'patients', 'staff', 'bookings', 'withdrawals']

  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db?.collection(collectionName)
      if (!collection) continue

      const indexes = await collection.indexes()
      console.log(`\n📋 ${collectionName} indexes:`)

      for (const index of indexes) {
        console.log(`  - ${index.name}`)

        // Drop indexes with 'tenantId' (old field name)
        if (index.name.includes('tenantId')) {
          console.log(`    ⚠️  Dropping old index: ${index.name}`)
          await collection.dropIndex(index.name)
          console.log(`    ✅ Dropped`)
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${collectionName}:`, error.message)
    }
  }

  console.log('\n✅ Old indexes dropped successfully')
}

async function main() {
  await connectDB()
  await dropOldIndexes()
  await mongoose.disconnect()
  console.log('👋 Disconnected')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Source and destination MongoDB URIs
const SOURCE_URI = 'mongodb+srv://arilpermana:yG5sFrdDqXagAphU@paper-tech-ocr.uyrqk.mongodb.net/?retryWrites=true&w=majority&appName=paper-tech-ocr'
const DEST_URI = 'mongodb+srv://paper-ai-admin:umwFMzhgpyZ1C1ic@paper-ocr.c705m47.mongodb.net/?retryWrites=true&w=majority&appName=paper-ocr'
const DATABASE_NAME = 'paper-circe'

async function migrateData() {
  console.log('🚀 Starting MongoDB migration...')
  console.log('================================')
  
  let sourceConnection: any = null
  let destConnection: any = null

  try {
    // Connect to source database
    console.log('📡 Connecting to source database...')
    sourceConnection = mongoose.createConnection(SOURCE_URI)
    await sourceConnection.asPromise()
    console.log('✅ Connected to source database')

    // Connect to destination database
    console.log('📡 Connecting to destination database...')
    destConnection = mongoose.createConnection(DEST_URI)
    await destConnection.asPromise()
    console.log('✅ Connected to destination database')

    // Get database connections with specific database name
    const sourceDb = sourceConnection.useDb(DATABASE_NAME).db
    const destDb = destConnection.useDb(DATABASE_NAME).db

    // List all collections in source database
    console.log('\n📋 Fetching collections from source database...')
    const collections = await sourceDb.listCollections().toArray()
    console.log(`Found ${collections.length} collections in ${DATABASE_NAME}:`)
    collections.forEach(col => console.log(`  - ${col.name}`))

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      console.log(`\n📦 Migrating collection: ${collectionName}`)
      
      try {
        // Get source collection
        const sourceCollection = sourceDb.collection(collectionName)
        
        // Count documents in source
        const sourceCount = await sourceCollection.countDocuments()
        console.log(`  Found ${sourceCount} documents in source`)
        
        if (sourceCount === 0) {
          console.log(`  ⏭️  Skipping empty collection`)
          continue
        }

        // Get all documents from source
        const documents = await sourceCollection.find({}).toArray()
        
        // Get destination collection (creates if doesn't exist)
        const destCollection = destDb.collection(collectionName)
        
        // Check if destination collection already has data
        const destCount = await destCollection.countDocuments()
        if (destCount > 0) {
          console.log(`  ⚠️  Destination already has ${destCount} documents`)
          console.log(`  🗑️  Clearing destination collection...`)
          await destCollection.deleteMany({})
        }

        // Insert documents into destination
        console.log(`  📝 Inserting ${documents.length} documents...`)
        const result = await destCollection.insertMany(documents, { ordered: false })
        console.log(`  ✅ Successfully inserted ${result.insertedCount} documents`)

        // Verify migration
        const finalCount = await destCollection.countDocuments()
        if (finalCount === sourceCount) {
          console.log(`  ✅ Migration verified: ${finalCount} documents`)
        } else {
          console.log(`  ⚠️  Warning: Count mismatch - Source: ${sourceCount}, Destination: ${finalCount}`)
        }

        // Copy indexes
        console.log(`  📐 Copying indexes...`)
        const sourceIndexes = await sourceCollection.indexes()
        for (const index of sourceIndexes) {
          if (index.name === '_id_') continue // Skip default _id index
          
          try {
            const { key, name, ...options } = index
            await destCollection.createIndex(key, { ...options, name })
            console.log(`    ✅ Created index: ${name}`)
          } catch (error: any) {
            if (error.code === 85 || error.code === 86) {
              // Index already exists or similar index exists
              console.log(`    ℹ️  Index already exists: ${index.name}`)
            } else {
              console.log(`    ❌ Failed to create index ${index.name}:`, error.message)
            }
          }
        }

      } catch (error: any) {
        console.error(`  ❌ Error migrating ${collectionName}:`, error.message)
        console.log(`  Continuing with next collection...`)
      }
    }

    console.log('\n================================')
    console.log('✅ Migration completed successfully!')
    
    // Summary
    console.log('\n📊 Migration Summary:')
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      const sourceCollection = sourceDb.collection(collectionName)
      const destCollection = destDb.collection(collectionName)
      const sourceCount = await sourceCollection.countDocuments()
      const destCount = await destCollection.countDocuments()
      
      const status = sourceCount === destCount ? '✅' : '⚠️'
      console.log(`  ${status} ${collectionName}: ${sourceCount} → ${destCount} documents`)
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    // Close connections
    if (sourceConnection) {
      console.log('\n🔌 Closing source connection...')
      await sourceConnection.close()
    }
    if (destConnection) {
      console.log('🔌 Closing destination connection...')
      await destConnection.close()
    }
    console.log('👋 Done!')
    process.exit(0)
  }
}

// Run migration
console.log('🔄 MongoDB Data Migration Tool')
console.log('================================')
console.log('Source:', SOURCE_URI.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@'))
console.log('Destination:', DEST_URI.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@'))
console.log('Database:', DATABASE_NAME)
console.log('================================\n')

migrateData().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
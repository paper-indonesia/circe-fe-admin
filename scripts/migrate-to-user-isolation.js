#!/usr/bin/env node

/**
 * Migration Script: Tenant-based to User-based Data Isolation
 *
 * This script migrates the database from tenant-based multitenancy to user-based data isolation.
 * It performs the following operations:
 *
 * 1. Updates User model to remove tenantId field
 * 2. Adds ownerId field to all data models (Patient, Booking, Staff, Treatment, Withdrawal)
 * 3. Maps existing tenant data to user ownership
 * 4. Updates database indexes
 * 5. Creates backup of original data
 *
 * Usage: node scripts/migrate-to-user-isolation.js [--dry-run] [--force]
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Environment setup
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'beauty-clinic'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required')
  process.exit(1)
}

// Command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isForce = args.includes('--force')

console.log('🔄 Beauty Clinic Migration: Tenant to User-based Data Isolation')
console.log('===============================================================')
console.log(`📅 Date: ${new Date().toISOString()}`)
console.log(`🗄️  Database: ${MONGODB_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@')}`)
console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`)
console.log('')

// Migration configuration
const MIGRATION_CONFIG = {
  // Default user mapping for existing tenant data
  // This should be updated based on actual tenant-to-user relationships
  tenantToUserMapping: {
    'jakarta': 'user_jakarta_admin_id',
    'bandung': 'user_bandung_admin_id',
    'surabaya': 'user_surabaya_admin_id',
    'bali': 'user_bali_admin_id',
    'default': 'user_default_admin_id',
    'beauty-clinic-jakarta': 'user_jakarta_admin_id'
  },

  // Collections to migrate
  collectionsToMigrate: [
    'patients',
    'bookings',
    'staff',
    'treatments',
    'withdrawals'
  ],

  // Backup directory
  backupDir: './migration-backups'
}

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDir() {
  if (!fs.existsSync(MIGRATION_CONFIG.backupDir)) {
    fs.mkdirSync(MIGRATION_CONFIG.backupDir, { recursive: true })
  }
}

/**
 * Create backup of collection before migration
 */
async function backupCollection(collectionName) {
  console.log(`📦 Backing up collection: ${collectionName}`)

  const collection = mongoose.connection.db.collection(collectionName)
  const documents = await collection.find({}).toArray()

  const backupPath = path.join(
    MIGRATION_CONFIG.backupDir,
    `${collectionName}_backup_${Date.now()}.json`
  )

  fs.writeFileSync(backupPath, JSON.stringify(documents, null, 2))
  console.log(`✅ Backup created: ${backupPath} (${documents.length} documents)`)

  return documents.length
}

/**
 * Get tenant to user mapping by analyzing existing users
 */
async function buildTenantUserMapping() {
  console.log('🔍 Building tenant-to-user mapping...')

  const users = await mongoose.connection.db.collection('users').find({}).toArray()
  const mapping = {}

  for (const user of users) {
    if (user.tenantId) {
      // Use the first admin user found for each tenant
      if (!mapping[user.tenantId] && user.role === 'admin') {
        mapping[user.tenantId] = user._id.toString()
      }
    }
  }

  // Merge with default mapping
  const finalMapping = { ...MIGRATION_CONFIG.tenantToUserMapping, ...mapping }

  console.log('📋 Tenant to User mapping:')
  Object.entries(finalMapping).forEach(([tenant, userId]) => {
    console.log(`   ${tenant} → ${userId}`)
  })

  return finalMapping
}

/**
 * Migrate a single collection from tenantId to ownerId
 */
async function migrateCollection(collectionName, tenantUserMapping) {
  console.log(`\n🔄 Migrating collection: ${collectionName}`)

  const collection = mongoose.connection.db.collection(collectionName)

  // Get documents with tenantId
  const documentsWithTenant = await collection.find({ tenantId: { $exists: true } }).toArray()
  console.log(`   Found ${documentsWithTenant.length} documents with tenantId`)

  if (documentsWithTenant.length === 0) {
    console.log('   ✅ No migration needed for this collection')
    return { updated: 0, errors: 0 }
  }

  let updated = 0
  let errors = 0

  for (const doc of documentsWithTenant) {
    const tenantId = doc.tenantId
    const ownerId = tenantUserMapping[tenantId]

    if (!ownerId) {
      console.log(`   ⚠️  No user mapping found for tenant: ${tenantId} (document ${doc._id})`)
      errors++
      continue
    }

    if (!isDryRun) {
      try {
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: { ownerId },
            $unset: { tenantId: 1 }
          }
        )
        updated++
      } catch (error) {
        console.log(`   ❌ Failed to update document ${doc._id}: ${error.message}`)
        errors++
      }
    } else {
      console.log(`   [DRY RUN] Would update ${doc._id}: tenantId=${tenantId} → ownerId=${ownerId}`)
      updated++
    }
  }

  console.log(`   ✅ ${isDryRun ? 'Would update' : 'Updated'} ${updated} documents`)
  if (errors > 0) {
    console.log(`   ⚠️  ${errors} errors encountered`)
  }

  return { updated, errors }
}

/**
 * Update users collection to remove tenantId
 */
async function migrateUsers() {
  console.log(`\n🔄 Migrating users collection`)

  const collection = mongoose.connection.db.collection('users')
  const usersWithTenant = await collection.find({ tenantId: { $exists: true } }).toArray()

  console.log(`   Found ${usersWithTenant.length} users with tenantId`)

  if (usersWithTenant.length === 0) {
    console.log('   ✅ No migration needed for users')
    return { updated: 0, errors: 0 }
  }

  let updated = 0
  let errors = 0

  for (const user of usersWithTenant) {
    if (!isDryRun) {
      try {
        await collection.updateOne(
          { _id: user._id },
          { $unset: { tenantId: 1 } }
        )
        updated++
      } catch (error) {
        console.log(`   ❌ Failed to update user ${user._id}: ${error.message}`)
        errors++
      }
    } else {
      console.log(`   [DRY RUN] Would remove tenantId from user ${user._id} (${user.email})`)
      updated++
    }
  }

  console.log(`   ✅ ${isDryRun ? 'Would update' : 'Updated'} ${updated} users`)
  if (errors > 0) {
    console.log(`   ⚠️  ${errors} errors encountered`)
  }

  return { updated, errors }
}

/**
 * Update database indexes
 */
async function updateIndexes() {
  console.log('\n🔧 Updating database indexes...')

  const indexUpdates = [
    {
      collection: 'patients',
      oldIndexes: [
        { tenantId: 1, phone: 1 },
        { tenantId: 1, email: 1 },
        { tenantId: 1, createdAt: -1 }
      ],
      newIndexes: [
        { ownerId: 1, phone: 1 },
        { ownerId: 1, email: 1 },
        { ownerId: 1, createdAt: -1 }
      ]
    },
    {
      collection: 'bookings',
      oldIndexes: [
        { tenantId: 1, startAt: 1 },
        { tenantId: 1, staffId: 1, startAt: 1 },
        { tenantId: 1, patientId: 1 },
        { tenantId: 1, status: 1 },
        { tenantId: 1, source: 1, createdAt: -1 }
      ],
      newIndexes: [
        { ownerId: 1, startAt: 1 },
        { ownerId: 1, staffId: 1, startAt: 1 },
        { ownerId: 1, patientId: 1 },
        { ownerId: 1, status: 1 },
        { ownerId: 1, source: 1, createdAt: -1 }
      ]
    },
    {
      collection: 'staff',
      oldIndexes: [
        { tenantId: 1, isActive: 1 },
        { tenantId: 1, role: 1 },
        { tenantId: 1, rating: -1 }
      ],
      newIndexes: [
        { ownerId: 1, isActive: 1 },
        { ownerId: 1, role: 1 },
        { ownerId: 1, rating: -1 }
      ]
    },
    {
      collection: 'treatments',
      oldIndexes: [
        { tenantId: 1, category: 1 },
        { tenantId: 1, price: 1 },
        { tenantId: 1, popularity: -1 },
        { tenantId: 1, name: 1 }
      ],
      newIndexes: [
        { ownerId: 1, category: 1 },
        { ownerId: 1, price: 1 },
        { ownerId: 1, popularity: -1 },
        { ownerId: 1, name: 1 }
      ]
    },
    {
      collection: 'withdrawals',
      oldIndexes: [
        { staffId: 1, tenant: 1 },
        { status: 1, tenant: 1 }
      ],
      newIndexes: [
        { ownerId: 1, staffId: 1 },
        { ownerId: 1, status: 1 }
      ]
    }
  ]

  for (const update of indexUpdates) {
    console.log(`   📝 Updating indexes for ${update.collection}`)

    const collection = mongoose.connection.db.collection(update.collection)

    if (!isDryRun) {
      // Get existing indexes
      const existingIndexes = await collection.listIndexes().toArray()

      // Drop old tenant-based indexes
      for (const oldIndex of update.oldIndexes) {
        try {
          const indexName = Object.keys(oldIndex).map(key =>
            `${key}_${oldIndex[key]}`
          ).join('_')

          // Check if index exists before dropping
          const indexExists = existingIndexes.some(idx =>
            JSON.stringify(idx.key) === JSON.stringify(oldIndex)
          )

          if (indexExists) {
            await collection.dropIndex(oldIndex)
            console.log(`     ❌ Dropped old index: ${JSON.stringify(oldIndex)}`)
          }
        } catch (error) {
          // Index might not exist, continue
          console.log(`     ⚠️  Could not drop index ${JSON.stringify(oldIndex)}: ${error.message}`)
        }
      }

      // Create new owner-based indexes
      for (const newIndex of update.newIndexes) {
        try {
          await collection.createIndex(newIndex)
          console.log(`     ✅ Created new index: ${JSON.stringify(newIndex)}`)
        } catch (error) {
          console.log(`     ❌ Failed to create index ${JSON.stringify(newIndex)}: ${error.message}`)
        }
      }
    } else {
      console.log(`     [DRY RUN] Would update ${update.oldIndexes.length} indexes`)
    }
  }
}

/**
 * Validate migration results
 */
async function validateMigration() {
  console.log('\n✅ Validating migration results...')

  let issues = 0

  // Check for remaining tenantId references
  for (const collection of MIGRATION_CONFIG.collectionsToMigrate) {
    const count = await mongoose.connection.db.collection(collection)
      .countDocuments({ tenantId: { $exists: true } })

    if (count > 0) {
      console.log(`   ⚠️  ${collection}: ${count} documents still have tenantId`)
      issues++
    } else {
      console.log(`   ✅ ${collection}: No tenantId references found`)
    }

    // Check for ownerId presence
    const ownerCount = await mongoose.connection.db.collection(collection)
      .countDocuments({ ownerId: { $exists: true } })

    console.log(`   📊 ${collection}: ${ownerCount} documents have ownerId`)
  }

  // Check users
  const usersWithTenant = await mongoose.connection.db.collection('users')
    .countDocuments({ tenantId: { $exists: true } })

  if (usersWithTenant > 0) {
    console.log(`   ⚠️  users: ${usersWithTenant} users still have tenantId`)
    issues++
  } else {
    console.log(`   ✅ users: No tenantId references found`)
  }

  return issues
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME
    })
    console.log('✅ Connected to MongoDB')

    // Ensure backup directory exists
    ensureBackupDir()

    if (!isDryRun && !isForce) {
      console.log('\n⚠️  WARNING: This will modify your database!')
      console.log('   Use --dry-run to preview changes')
      console.log('   Use --force to proceed with live migration')
      process.exit(1)
    }

    // Create backups
    if (!isDryRun) {
      console.log('\n📦 Creating backups...')
      for (const collection of [...MIGRATION_CONFIG.collectionsToMigrate, 'users']) {
        await backupCollection(collection)
      }
    }

    // Build tenant-user mapping
    const tenantUserMapping = await buildTenantUserMapping()

    // Migrate collections
    console.log('\n🔄 Starting data migration...')
    let totalUpdated = 0
    let totalErrors = 0

    // Migrate data collections
    for (const collection of MIGRATION_CONFIG.collectionsToMigrate) {
      const result = await migrateCollection(collection, tenantUserMapping)
      totalUpdated += result.updated
      totalErrors += result.errors
    }

    // Migrate users
    const userResult = await migrateUsers()
    totalUpdated += userResult.updated
    totalErrors += userResult.errors

    // Update indexes
    await updateIndexes()

    // Validate migration
    if (!isDryRun) {
      const issues = await validateMigration()
      if (issues > 0) {
        console.log(`\n⚠️  Migration completed with ${issues} validation issues`)
      } else {
        console.log('\n✅ Migration validation passed!')
      }
    }

    // Summary
    console.log('\n📊 Migration Summary')
    console.log('==================')
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`)
    console.log(`Total documents ${isDryRun ? 'to be updated' : 'updated'}: ${totalUpdated}`)
    console.log(`Total errors: ${totalErrors}`)
    console.log(`Collections processed: ${MIGRATION_CONFIG.collectionsToMigrate.length + 1}`)

    if (!isDryRun) {
      console.log(`Backups created in: ${MIGRATION_CONFIG.backupDir}`)
    }

    console.log('\n🎉 Migration completed successfully!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

// Run migration
runMigration()
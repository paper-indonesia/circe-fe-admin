import 'dotenv/config'
import mongoose from 'mongoose'
import connectMongoDB from '../lib/mongodb'
import Tenant from '../models/Tenant'
import User from '../models/User'
import { hashPassword } from '../lib/auth'

async function createTenantAdmin(tenantSlug: string) {
  try {
    await connectMongoDB()
    
    console.log(`🔍 Looking for tenant: ${tenantSlug}...`)
    
    // Find the tenant
    const tenant = await Tenant.findBySlug(tenantSlug)
    
    if (!tenant) {
      console.error(`❌ Tenant with slug "${tenantSlug}" not found!`)
      return
    }
    
    console.log(`✅ Found tenant: ${tenant.name}`)
    
    // Create default admin user
    const adminEmail = `admin@${tenantSlug}.com`
    const defaultPassword = 'admin123'
    
    // Check if admin already exists
    const existingAdmin = await User.findByEmailAndTenant(adminEmail, tenant._id.toString())
    
    if (existingAdmin) {
      console.log(`⚠️ Admin user already exists: ${adminEmail}`)
      return
    }
    
    // Create new admin user
    const hashedPassword = await hashPassword(defaultPassword)
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      name: `${tenant.name} Admin`,
      role: 'admin',
      tenantId: tenant._id.toString(),
      isActive: true,
    })
    
    await adminUser.save()
    
    console.log(`✅ Created admin user for ${tenant.name}`)
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${defaultPassword}`)
    console.log(`\n👉 You can now login at: http://localhost:3001/${tenantSlug}/signin`)
    
  } catch (error) {
    console.error('❌ Error creating tenant admin:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Get tenant slug from command line arguments
const tenantSlug = process.argv[2]

if (!tenantSlug) {
  console.log('Usage: npm run create-tenant-admin <tenant-slug>')
  console.log('Example: npm run create-tenant-admin test')
  process.exit(1)
}

createTenantAdmin(tenantSlug)
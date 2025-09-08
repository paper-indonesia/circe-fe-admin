import 'dotenv/config'
import mongoose from 'mongoose'
import connectMongoDB from '../lib/mongodb'
import Tenant from '../models/Tenant'
import User from '../models/User'
import { hashPassword } from '../lib/auth'

async function seedAuth() {
  try {
    await connectMongoDB()
    
    console.log('🌱 Seeding authentication data...')

    // Create default tenants
    const defaultTenants = [
      {
        name: 'Jakarta Branch',
        slug: 'jakarta',
        config: {
          theme: {
            primaryColor: '#8B5CF6',
            secondaryColor: '#EC4899',
          },
          features: {
            maxUsers: 100,
            maxBookings: 1000,
          },
        },
        createdBy: 'system',
      },
      {
        name: 'Bali Branch',
        slug: 'bali',
        config: {
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
          },
          features: {
            maxUsers: 100,
            maxBookings: 1000,
          },
        },
        createdBy: 'system',
      },
      {
        name: 'Surabaya Branch',
        slug: 'surabaya',
        config: {
          theme: {
            primaryColor: '#F59E0B',
            secondaryColor: '#EF4444',
          },
          features: {
            maxUsers: 100,
            maxBookings: 1000,
          },
        },
        createdBy: 'system',
      },
    ]

    const createdTenants: any[] = []

    for (const tenantData of defaultTenants) {
      const existingTenant = await Tenant.findBySlug(tenantData.slug)
      if (!existingTenant) {
        const tenant = new Tenant({
          ...tenantData,
          isActive: true,
        })
        await tenant.save()
        createdTenants.push(tenant)
        console.log(`✅ Created tenant: ${tenant.name}`)
      } else {
        createdTenants.push(existingTenant)
        console.log(`⏭️ Tenant already exists: ${existingTenant.name}`)
      }
    }

    // Create platform admin user
    const adminEmail = 'admin@beautyclinic.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123')
      const admin = new User({
        email: adminEmail,
        password: hashedPassword,
        name: 'Platform Admin',
        role: 'platform_admin',
        tenantId: createdTenants[0]._id.toString(), // Assign to first tenant
        isActive: true,
      })
      await admin.save()
      console.log(`✅ Created platform admin: ${adminEmail} (password: admin123)`)
    } else {
      console.log(`⏭️ Platform admin already exists: ${adminEmail}`)
    }

    // Create demo users for each tenant
    const demoUsers = [
      { email: 'manager@jakarta.com', name: 'Jakarta Manager', tenantIndex: 0, role: 'admin' },
      { email: 'staff@jakarta.com', name: 'Jakarta Staff', tenantIndex: 0, role: 'staff' },
      { email: 'user@jakarta.com', name: 'Jakarta User', tenantIndex: 0, role: 'user' },
      { email: 'manager@bali.com', name: 'Bali Manager', tenantIndex: 1, role: 'admin' },
      { email: 'staff@bali.com', name: 'Bali Staff', tenantIndex: 1, role: 'staff' },
      { email: 'manager@surabaya.com', name: 'Surabaya Manager', tenantIndex: 2, role: 'admin' },
    ]

    for (const userData of demoUsers) {
      const tenant = createdTenants[userData.tenantIndex]
      const existingUser = await User.findByEmailAndTenant(userData.email, tenant._id.toString())
      
      if (!existingUser) {
        const hashedPassword = await hashPassword('demo123')
        const user = new User({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          tenantId: tenant._id.toString(),
          isActive: true,
        })
        await user.save()
        console.log(`✅ Created ${userData.role} user: ${userData.email} for ${tenant.name}`)
      } else {
        console.log(`⏭️ User already exists: ${userData.email}`)
      }
    }

    console.log('\n✨ Authentication seeding completed!')
    console.log('\n📝 Login credentials:')
    console.log('Platform Admin: admin@beautyclinic.com / admin123')
    console.log('Demo Users: (all passwords are "demo123")')
    console.log('- Jakarta: manager@jakarta.com, staff@jakarta.com, user@jakarta.com')
    console.log('- Bali: manager@bali.com, staff@bali.com')
    console.log('- Surabaya: manager@surabaya.com')

  } catch (error) {
    console.error('❌ Error seeding authentication data:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the seed function
seedAuth()
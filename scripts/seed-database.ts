import 'dotenv/config'
import mongoose from 'mongoose'
import connectMongoDB from '../lib/mongodb'
import Patient from '../models/Patient'
import Staff from '../models/Staff'
import Treatment from '../models/Treatment'
import Booking from '../models/Booking'
import { getTenantData } from '../lib/tenant-data'
import { tenants } from '../lib/tenant'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Connect to MongoDB
    await connectMongoDB()
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    await Promise.all([
      Patient.deleteMany({}),
      Staff.deleteMany({}),
      Treatment.deleteMany({}),
      Booking.deleteMany({})
    ])
    
    // Seed data for each tenant
    for (const tenant of tenants) {
      console.log(`\n📦 Seeding data for tenant: ${tenant.name}`)
      const mockData = getTenantData(tenant.id)
      
      // Seed patients
      console.log(`  → Creating ${mockData.patients.length} patients...`)
      const patientDocs = await Patient.insertMany(
        mockData.patients.map(p => ({
          tenantId: tenant.id,
          name: p.name,
          phone: p.phone,
          email: p.email,
          notes: p.notes || '',
          lastVisitAt: p.lastVisit ? new Date(p.lastVisit) : undefined,
          totalVisits: p.totalVisits || 0
        }))
      )
      
      // Seed staff
      console.log(`  → Creating ${mockData.staff.length} staff members...`)
      const staffDocs = await Staff.insertMany(
        mockData.staff.map(s => ({
          tenantId: tenant.id,
          name: s.name,
          role: s.role,
          skills: s.skills || [],
          workingHours: s.workingHours || [],
          rating: s.rating || 0,
          avatar: s.avatar,
          isActive: true
        }))
      )
      
      // Create a mapping of old staff IDs to new MongoDB IDs
      const staffIdMap: { [key: string]: string } = {}
      mockData.staff.forEach((s, index) => {
        staffIdMap[s.id] = staffDocs[index]._id!.toString()
      })
      
      // Seed treatments with proper staff assignments
      console.log(`  → Creating ${mockData.treatments.length} treatments...`)
      const treatmentDocs = await Treatment.insertMany(
        mockData.treatments.map(t => ({
          tenantId: tenant.id,
          name: t.name,
          category: t.category,
          durationMin: t.durationMin,
          price: t.price,
          description: t.description || '',
          popularity: t.popularity || 0,
          assignedStaff: t.assignedStaff?.map(id => staffIdMap[id]).filter(Boolean) || [],
          isActive: true
        }))
      )
      
      // Create sample bookings
      console.log(`  → Creating sample bookings...`)
      const patientIds = patientDocs.map(p => p._id!.toString())
      const staffIds = staffDocs.map(s => s._id!.toString())
      const treatmentIds = treatmentDocs.map(t => t._id!.toString())
      
      const bookings = []
      const now = new Date()
      
      // Create 5 walk-in bookings for today
      if (tenant.features?.walkIn !== false) {
        for (let i = 0; i < 5; i++) {
          const startAt = new Date(now)
          startAt.setHours(9 + i * 2, 0, 0, 0)
          const endAt = new Date(startAt)
          endAt.setHours(startAt.getHours() + 1)
          
          bookings.push({
            tenantId: tenant.id,
            patientId: patientIds[i % patientIds.length],
            patientName: patientDocs[i % patientIds.length].name,
            staffId: staffIds[i % staffIds.length],
            treatmentId: treatmentIds[i % treatmentIds.length],
            startAt,
            endAt,
            status: i === 0 ? 'completed' : i === 1 ? 'confirmed' : 'pending',
            source: 'walk-in',
            paymentStatus: i === 0 ? 'paid' : 'unpaid',
            queueNumber: i + 1,
            notes: ''
          })
        }
      }
      
      // Create 5 online bookings for next week
      for (let i = 0; i < 5; i++) {
        const startAt = new Date(now)
        startAt.setDate(startAt.getDate() + i + 1)
        startAt.setHours(10 + i, 0, 0, 0)
        const endAt = new Date(startAt)
        endAt.setHours(startAt.getHours() + 1, 30)
        
        bookings.push({
          tenantId: tenant.id,
          patientId: patientIds[(i + 2) % patientIds.length],
          patientName: patientDocs[(i + 2) % patientIds.length].name,
          staffId: staffIds[(i + 1) % staffIds.length],
          treatmentId: treatmentIds[(i + 1) % treatmentIds.length],
          startAt,
          endAt,
          status: 'confirmed',
          source: 'online',
          paymentStatus: i % 2 === 0 ? 'deposit' : 'unpaid',
          notes: 'Online booking'
        })
      }
      
      if (bookings.length > 0) {
        await Booking.insertMany(bookings)
        console.log(`  → Created ${bookings.length} bookings`)
      }
      
      console.log(`✅ Successfully seeded data for ${tenant.name}`)
    }
    
    console.log('\n🎉 Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeding script
seedDatabase()
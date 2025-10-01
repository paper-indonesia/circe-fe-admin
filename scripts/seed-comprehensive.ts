/**
 * Comprehensive Data Seeding Script
 * Seeds realistic dummy data for all collections to enable end-to-end testing
 *
 * Usage:
 *   npm run seed:full           - Clear and seed all data
 *   npm run seed:full -- --keep - Keep existing data and add more
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Models
import User from '../models/User'
import Patient from '../models/Patient'
import Staff from '../models/Staff'
import Treatment from '../models/Treatment'
import Booking from '../models/Booking'
import Withdrawal from '../models/Withdrawal'

// Configuration
const MONGO_URI = process.env.MONGO_URI || ''
const DB_NAME = process.env.MONGODB_DB_NAME || 'paper-circe'
const KEEP_EXISTING = process.argv.includes('--keep')

// Constants for data generation
const INDONESIAN_NAMES = {
  first: ['Budi', 'Siti', 'Ahmad', 'Dewi', 'Eko', 'Rina', 'Agus', 'Sri', 'Rudi', 'Maya',
          'Hadi', 'Ani', 'Joko', 'Lina', 'Bambang', 'Ratna', 'Yudi', 'Wati', 'Andi', 'Sari',
          'Dedi', 'Nia', 'Hendra', 'Tuti', 'Irfan', 'Yuni', 'Farhan', 'Dian', 'Rizki', 'Putri'],
  last: ['Santoso', 'Wijaya', 'Kurniawan', 'Pratama', 'Setiawan', 'Permana', 'Handoko', 'Lestari',
         'Suryanto', 'Hidayat', 'Kusuma', 'Wibowo', 'Gunawan', 'Hakim', 'Nugroho', 'Slamet']
}

const TREATMENT_DATA = {
  'Facial': [
    { name: 'Basic Facial', duration: 30, price: 150000, popularity: 85 },
    { name: 'Deep Cleansing Facial', duration: 45, price: 250000, popularity: 90 },
    { name: 'Anti-Aging Facial', duration: 60, price: 400000, popularity: 75 },
    { name: 'Acne Treatment Facial', duration: 60, price: 350000, popularity: 80 },
    { name: 'Brightening Facial', duration: 60, price: 380000, popularity: 88 },
    { name: 'Hydrating Facial', duration: 45, price: 300000, popularity: 82 },
    { name: 'Korean Glass Skin Facial', duration: 90, price: 650000, popularity: 95 },
    { name: 'Oxygen Facial', duration: 60, price: 450000, popularity: 70 },
    { name: 'Collagen Boost Facial', duration: 75, price: 550000, popularity: 78 },
    { name: 'Teen Facial', duration: 30, price: 180000, popularity: 65 }
  ],
  'Body Massage': [
    { name: 'Swedish Massage', duration: 60, price: 300000, popularity: 88 },
    { name: 'Deep Tissue Massage', duration: 90, price: 450000, popularity: 85 },
    { name: 'Hot Stone Massage', duration: 90, price: 500000, popularity: 80 },
    { name: 'Aromatherapy Massage', duration: 60, price: 350000, popularity: 90 },
    { name: 'Balinese Massage', duration: 90, price: 400000, popularity: 92 },
    { name: 'Thai Massage', duration: 120, price: 550000, popularity: 75 },
    { name: 'Reflexology', duration: 45, price: 200000, popularity: 82 },
    { name: 'Sports Massage', duration: 60, price: 380000, popularity: 70 }
  ],
  'Spa Package': [
    { name: 'Luxury Spa Package', duration: 180, price: 1500000, popularity: 85 },
    { name: 'Relaxation Package', duration: 120, price: 800000, popularity: 88 },
    { name: 'Couples Spa Package', duration: 150, price: 2000000, popularity: 90 },
    { name: 'Detox Package', duration: 120, price: 900000, popularity: 78 },
    { name: 'Bridal Package', duration: 180, price: 1800000, popularity: 92 }
  ],
  'Nail Care': [
    { name: 'Manicure', duration: 30, price: 75000, popularity: 85 },
    { name: 'Pedicure', duration: 45, price: 100000, popularity: 88 },
    { name: 'Gel Nails', duration: 60, price: 200000, popularity: 90 },
    { name: 'Nail Art', duration: 45, price: 150000, popularity: 80 },
    { name: 'Acrylic Nails', duration: 90, price: 300000, popularity: 75 },
    { name: 'Mani-Pedi Combo', duration: 60, price: 150000, popularity: 92 },
    { name: 'Nail Extension', duration: 120, price: 350000, popularity: 70 }
  ],
  'Hair Care': [
    { name: 'Hair Spa', duration: 60, price: 200000, popularity: 85 },
    { name: 'Keratin Treatment', duration: 120, price: 500000, popularity: 80 },
    { name: 'Hair Coloring', duration: 90, price: 400000, popularity: 88 },
    { name: 'Hair Smoothing', duration: 120, price: 600000, popularity: 85 },
    { name: 'Scalp Treatment', duration: 45, price: 180000, popularity: 75 }
  ]
}

const SKILLS_BY_CATEGORY = {
  'Facial': ['Facial', 'Skin Care', 'Anti-Aging'],
  'Body Massage': ['Massage', 'Deep Tissue', 'Aromatherapy'],
  'Spa Package': ['Massage', 'Facial', 'Body Treatment'],
  'Nail Care': ['Manicure', 'Pedicure', 'Nail Art'],
  'Hair Care': ['Hair Styling', 'Hair Coloring', 'Hair Treatment']
}

const BANK_NAMES = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata', 'Danamon']

// Utility functions
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomName(): string {
  const first = randomChoice(INDONESIAN_NAMES.first)
  const last = randomChoice(INDONESIAN_NAMES.last)
  return `${first} ${last}`
}

function randomPhone(): string {
  const prefix = randomChoice(['0812', '0813', '0821', '0822', '0852', '0853', '0856'])
  const number = randomInt(10000000, 99999999)
  return `${prefix}${number}`
}

function randomEmail(name: string): string {
  const username = name.toLowerCase().replace(/\s+/g, '.')
  const domain = randomChoice(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])
  return `${username}@${domain}`
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function setTimeSlot(date: Date, hour: number, minute: number = 0): Date {
  const result = new Date(date)
  result.setHours(hour, minute, 0, 0)
  return result
}

// Connection
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME })
    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${DB_NAME}`)
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Clear existing data
async function clearData() {
  console.log('\n🗑️  Clearing existing data...')
  await Withdrawal.deleteMany({})
  await Booking.deleteMany({})
  await Treatment.deleteMany({})
  await Staff.deleteMany({})
  await Patient.deleteMany({})
  await User.deleteMany({})
  console.log('✅ Data cleared')
}

// Seeding functions
async function seedUsers() {
  console.log('\n👤 Seeding Users...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = [
    {
      email: 'admin@reserva.app',
      password: hashedPassword,
      name: 'Admin Reserva',
      role: 'user',
      isActive: true
    },
    {
      email: 'clinic1@reserva.app',
      password: hashedPassword,
      name: 'Beauty Clinic Jakarta',
      role: 'user',
      isActive: true
    },
    {
      email: 'clinic2@reserva.app',
      password: hashedPassword,
      name: 'Spa & Wellness Bali',
      role: 'user',
      isActive: true
    },
    {
      email: 'clinic3@reserva.app',
      password: hashedPassword,
      name: 'Elite Beauty Surabaya',
      role: 'user',
      isActive: true
    },
    {
      email: 'inactive@reserva.app',
      password: hashedPassword,
      name: 'Inactive User',
      role: 'user',
      isActive: false
    }
  ]

  const createdUsers = await User.insertMany(users)
  console.log(`✅ Created ${createdUsers.length} users`)

  return createdUsers.filter(u => u.isActive)
}

async function seedPatients(users: any[]) {
  console.log('\n👥 Seeding Patients...')

  const patients = []
  const thirtyDaysAgo = addDays(new Date(), -30)
  const sixMonthsAgo = addDays(new Date(), -180)

  for (const user of users) {
    const patientCount = randomInt(50, 70)

    for (let i = 0; i < patientCount; i++) {
      const name = randomName()
      const hasEmail = Math.random() > 0.3 // 70% have email

      // Determine patient type
      let totalVisits, lastVisitAt
      const patientType = Math.random()

      if (patientType < 0.2) {
        // New patient (20%)
        totalVisits = randomInt(0, 1)
        lastVisitAt = totalVisits > 0 ? randomDate(thirtyDaysAgo, new Date()) : undefined
      } else if (patientType < 0.7) {
        // Regular patient (50%)
        totalVisits = randomInt(2, 10)
        lastVisitAt = randomDate(thirtyDaysAgo, new Date())
      } else {
        // VIP patient (30%)
        totalVisits = randomInt(10, 50)
        lastVisitAt = randomDate(sixMonthsAgo, new Date())
      }

      patients.push({
        ownerId: user._id.toString(),
        name,
        phone: randomPhone(),
        email: hasEmail ? randomEmail(name) : undefined,
        notes: Math.random() > 0.7 ? 'Regular customer, prefers evening slots' : '',
        totalVisits,
        lastVisitAt
      })
    }
  }

  const createdPatients = await Patient.insertMany(patients)
  console.log(`✅ Created ${createdPatients.length} patients`)

  return createdPatients
}

async function seedStaff(users: any[]) {
  console.log('\n👨‍⚕️ Seeding Staff...')

  const staff = []

  const roles = [
    { role: 'Therapist', count: 8, skills: 3, rating: [4.0, 5.0] },
    { role: 'Junior Therapist', count: 5, skills: 2, rating: [3.5, 4.5] },
    { role: 'Nail Technician', count: 3, skills: 2, rating: [4.0, 5.0] },
    { role: 'Hair Stylist', count: 3, skills: 2, rating: [4.0, 5.0] },
    { role: 'Receptionist', count: 2, skills: 0, rating: [4.5, 5.0] },
    { role: 'Manager', count: 1, skills: 0, rating: [4.5, 5.0] }
  ]

  for (const user of users) {
    for (const roleConfig of roles) {
      for (let i = 0; i < roleConfig.count; i++) {
        const name = randomName()
        const hasEmail = Math.random() > 0.5

        // Generate skills
        let skills: string[] = []
        if (roleConfig.skills > 0) {
          const allSkills = Object.values(SKILLS_BY_CATEGORY).flat()
          const uniqueSkills = [...new Set(allSkills)]
          skills = []
          for (let s = 0; s < roleConfig.skills; s++) {
            const skill = randomChoice(uniqueSkills.filter(sk => !skills.includes(sk)))
            skills.push(skill)
          }
        }

        const totalEarnings = randomInt(10000000, 100000000)
        const totalWithdrawn = Math.floor(totalEarnings * randomInt(30, 70) / 100)
        const balance = totalEarnings - totalWithdrawn

        const capacity = roleConfig.role.includes('Therapist') && Math.random() > 0.7 ? randomInt(2, 5) : 1

        staff.push({
          ownerId: user._id.toString(),
          name,
          email: hasEmail ? randomEmail(name) : undefined,
          role: roleConfig.role,
          skills,
          workingHours: ['09:00-17:00', '10:00-18:00', '13:00-21:00'][randomInt(0, 2)],
          rating: randomInt(roleConfig.rating[0] * 10, roleConfig.rating[1] * 10) / 10,
          balance,
          totalEarnings,
          totalWithdrawn,
          capacity,
          bankAccount: {
            bankName: randomChoice(BANK_NAMES),
            accountNumber: randomInt(1000000000, 9999999999).toString(),
            accountName: name
          },
          isActive: Math.random() > 0.1 // 90% active
        })
      }
    }
  }

  const createdStaff = await Staff.insertMany(staff)
  console.log(`✅ Created ${createdStaff.length} staff`)

  return createdStaff
}

async function seedTreatments(users: any[], allStaff: any[]) {
  console.log('\n💆 Seeding Treatments...')

  const treatments = []

  for (const user of users) {
    const userStaff = allStaff.filter(s => s.ownerId === user._id.toString() && s.isActive)

    for (const [category, treatmentList] of Object.entries(TREATMENT_DATA)) {
      // Find staff with relevant skills for this category
      const categorySkills = SKILLS_BY_CATEGORY[category as keyof typeof SKILLS_BY_CATEGORY] || []
      const qualifiedStaff = userStaff.filter(staff =>
        staff.skills.some((skill: string) => categorySkills.includes(skill))
      )

      for (const treatment of treatmentList) {
        // Assign 2-5 random staff (or qualified staff if available)
        const staffToAssign = qualifiedStaff.length > 0 ? qualifiedStaff : userStaff
        const assignedStaffCount = Math.min(randomInt(2, 5), staffToAssign.length)
        const assignedStaff = []

        const shuffled = [...staffToAssign].sort(() => 0.5 - Math.random())
        for (let i = 0; i < assignedStaffCount; i++) {
          assignedStaff.push(shuffled[i]._id.toString())
        }

        treatments.push({
          ownerId: user._id.toString(),
          name: treatment.name,
          category,
          durationMin: treatment.duration,
          price: treatment.price,
          description: `Professional ${treatment.name.toLowerCase()} service`,
          popularity: treatment.popularity,
          assignedStaff,
          isActive: true
        })
      }
    }
  }

  const createdTreatments = await Treatment.insertMany(treatments)
  console.log(`✅ Created ${createdTreatments.length} treatments`)

  return createdTreatments
}

async function seedBookings(users: any[], allPatients: any[], allStaff: any[], allTreatments: any[]) {
  console.log('\n📅 Seeding Bookings...')

  const bookings = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = addDays(today, -30)
  const thirtyDaysLater = addDays(today, 30)

  // Track staff bookings to prevent duplicates (for confirmed/pending bookings)
  const staffBookingSlots = new Set<string>()

  for (const user of users) {
    const userPatients = allPatients.filter(p => p.ownerId === user._id.toString())
    const userStaff = allStaff.filter(s => s.ownerId === user._id.toString() && s.isActive)
    const userTreatments = allTreatments.filter(t => t.ownerId === user._id.toString())

    if (userPatients.length === 0 || userStaff.length === 0 || userTreatments.length === 0) {
      continue
    }

    const bookingCount = randomInt(200, 250)
    const queueNumbersByDate: Record<string, number> = {}

    for (let i = 0; i < bookingCount; i++) {
      const patient = randomChoice(userPatients)
      const treatment = randomChoice(userTreatments)

      // Find staff who can perform this treatment
      const qualifiedStaff = userStaff.filter(staff =>
        treatment.assignedStaff.includes(staff._id.toString())
      )
      const staff = qualifiedStaff.length > 0 ? randomChoice(qualifiedStaff) : randomChoice(userStaff)

      // Determine time period
      const timePeriod = Math.random()
      let bookingDate: Date
      let status: string
      let paymentStatus: string

      if (timePeriod < 0.5) {
        // Past booking (50%)
        bookingDate = randomDate(thirtyDaysAgo, addDays(today, -1))
        const statusRand = Math.random()
        if (statusRand < 0.7) {
          status = 'completed'
          paymentStatus = 'paid'
        } else if (statusRand < 0.9) {
          status = 'no-show'
          paymentStatus = 'unpaid'
        } else {
          status = 'cancelled'
          paymentStatus = 'unpaid'
        }
      } else if (timePeriod < 0.6) {
        // Today (10%)
        bookingDate = new Date(today)
        const statusRand = Math.random()
        if (statusRand < 0.5) {
          status = 'confirmed'
          paymentStatus = Math.random() < 0.5 ? 'paid' : (Math.random() < 0.6 ? 'deposit' : 'unpaid')
        } else if (statusRand < 0.8) {
          status = 'pending'
          paymentStatus = Math.random() < 0.2 ? 'deposit' : 'unpaid'
        } else {
          status = 'completed'
          paymentStatus = 'paid'
        }
      } else {
        // Future booking (40%)
        bookingDate = randomDate(addDays(today, 1), thirtyDaysLater)
        const statusRand = Math.random()
        if (statusRand < 0.8) {
          status = 'confirmed'
          paymentStatus = Math.random() < 0.5 ? 'paid' : (Math.random() < 0.6 ? 'deposit' : 'unpaid')
        } else {
          status = 'pending'
          paymentStatus = Math.random() < 0.2 ? 'deposit' : 'unpaid'
        }
      }

      // Time slot (operating hours 09:00-21:00)
      const isPeakHour = Math.random() < 0.6 // 60% peak hours
      let hour: number

      if (isPeakHour) {
        hour = randomChoice([10, 11, 14, 15, 18, 19])
      } else {
        hour = randomChoice([9, 12, 13, 16, 17, 20])
      }

      const minute = randomChoice([0, 15, 30, 45])
      const startAt = setTimeSlot(bookingDate, hour, minute)
      const endAt = new Date(startAt.getTime() + treatment.durationMin * 60000)

      // Check for duplicate slot (for confirmed/pending bookings)
      if (status === 'confirmed' || status === 'pending') {
        const slotKey = `${user._id}-${staff._id}-${startAt.getTime()}-${endAt.getTime()}-${status}`
        if (staffBookingSlots.has(slotKey)) {
          // Skip this booking to avoid duplicate
          continue
        }
        staffBookingSlots.add(slotKey)
      }

      // Source
      const source = Math.random() < 0.6 ? 'online' : 'walk-in'

      // Queue number for walk-ins
      let queueNumber: number | undefined
      if (source === 'walk-in') {
        const dateKey = bookingDate.toISOString().split('T')[0]
        if (!queueNumbersByDate[dateKey]) {
          queueNumbersByDate[dateKey] = 1
        }
        queueNumber = queueNumbersByDate[dateKey]++
      }

      // Payment details
      const paymentAmount = paymentStatus === 'paid' ? treatment.price :
                           (paymentStatus === 'deposit' ? Math.floor(treatment.price * 0.3) : 0)
      const paymentMethod = paymentStatus !== 'unpaid' ? randomChoice(['Cash', 'Transfer', 'E-Wallet', 'Credit Card']) : undefined

      bookings.push({
        ownerId: user._id.toString(),
        patientId: patient._id.toString(),
        patientName: patient.name,
        staffId: staff._id.toString(),
        treatmentId: treatment._id.toString(),
        startAt,
        endAt,
        status,
        source,
        paymentStatus,
        notes: Math.random() > 0.8 ? 'Customer requested specific treatment approach' : '',
        queueNumber,
        paymentMethod,
        paymentAmount
      })
    }

    // Add some stacking bookings (multiple bookings at same time slot)
    for (let s = 0; s < 8; s++) {
      const baseBooking = randomChoice(bookings.filter(b =>
        b.ownerId === user._id.toString() &&
        b.status === 'confirmed' &&
        new Date(b.startAt) > today
      ))

      if (!baseBooking) continue

      const patient = randomChoice(userPatients)
      const treatment = randomChoice(userTreatments)

      // Different staff for stacking (or same staff if they have capacity > 1)
      const baseStaff = userStaff.find(s => s._id.toString() === baseBooking.staffId)
      let staff

      if (baseStaff && baseStaff.capacity > 1) {
        staff = baseStaff
      } else {
        const qualifiedStaff = userStaff.filter(s =>
          treatment.assignedStaff.includes(s._id.toString()) &&
          s._id.toString() !== baseBooking.staffId
        )
        staff = qualifiedStaff.length > 0 ? randomChoice(qualifiedStaff) : randomChoice(userStaff)
      }

      const startAt = new Date(baseBooking.startAt)
      const endAt = new Date(startAt.getTime() + treatment.durationMin * 60000)

      // Check for duplicate (stacking should use different staff)
      const stackSlotKey = `${user._id}-${staff._id}-${startAt.getTime()}-${endAt.getTime()}-confirmed`
      if (staffBookingSlots.has(stackSlotKey)) {
        continue // Skip if already exists
      }
      staffBookingSlots.add(stackSlotKey)

      bookings.push({
        ownerId: user._id.toString(),
        patientId: patient._id.toString(),
        patientName: patient.name,
        staffId: staff._id.toString(),
        treatmentId: treatment._id.toString(),
        startAt,
        endAt,
        status: 'confirmed',
        source: 'online',
        paymentStatus: randomChoice(['paid', 'deposit', 'unpaid']),
        notes: 'Stacked booking - concurrent appointment',
        paymentMethod: randomChoice(['Cash', 'Transfer']),
        paymentAmount: Math.random() < 0.5 ? treatment.price : 0
      })
    }
  }

  const createdBookings = await Booking.insertMany(bookings)
  console.log(`✅ Created ${createdBookings.length} bookings`)

  return createdBookings
}

async function seedWithdrawals(users: any[], allStaff: any[]) {
  console.log('\n💰 Seeding Withdrawals...')

  const withdrawals = []
  const sixtyDaysAgo = addDays(new Date(), -60)

  for (const user of users) {
    const userStaff = allStaff.filter(s => s.ownerId === user._id.toString() && s.balance > 50000)

    for (const staff of userStaff) {
      const withdrawalCount = randomInt(1, 3)

      for (let i = 0; i < withdrawalCount; i++) {
        const statusRand = Math.random()
        let status: string
        let processedDate: Date | undefined
        let rejectionReason: string | undefined

        if (statusRand < 0.4) {
          status = 'pending'
        } else if (statusRand < 0.7) {
          status = 'approved'
          processedDate = randomDate(sixtyDaysAgo, new Date())
        } else if (statusRand < 0.9) {
          status = 'completed'
          processedDate = randomDate(sixtyDaysAgo, new Date())
        } else {
          status = 'rejected'
          processedDate = randomDate(sixtyDaysAgo, new Date())
          rejectionReason = randomChoice([
            'Insufficient balance',
            'Incomplete bank details',
            'Pending verification',
            'Requested amount exceeds available balance'
          ])
        }

        const amount = Math.min(
          randomInt(50000, 5000000),
          Math.floor(staff.balance * 0.8) // Don't withdraw more than 80% of balance
        )

        withdrawals.push({
          ownerId: user._id.toString(),
          staffId: staff._id,
          amount,
          status,
          bankAccount: staff.bankAccount,
          requestDate: randomDate(sixtyDaysAgo, new Date()),
          processedDate,
          notes: Math.random() > 0.7 ? 'Regular monthly withdrawal' : undefined,
          rejectionReason
        })
      }
    }
  }

  const createdWithdrawals = await Withdrawal.insertMany(withdrawals)
  console.log(`✅ Created ${createdWithdrawals.length} withdrawals`)

  return createdWithdrawals
}

// Validation
async function validateData(users: any[]) {
  console.log('\n🔍 Validating data integrity...')

  let errors = 0

  for (const user of users) {
    const ownerId = user._id.toString()

    // Check patients
    const patientCount = await Patient.countDocuments({ ownerId })
    if (patientCount === 0) {
      console.error(`❌ User ${user.email} has no patients`)
      errors++
    }

    // Check staff
    const staffCount = await Staff.countDocuments({ ownerId, isActive: true })
    if (staffCount === 0) {
      console.error(`❌ User ${user.email} has no active staff`)
      errors++
    }

    // Check treatments
    const treatmentCount = await Treatment.countDocuments({ ownerId })
    if (treatmentCount === 0) {
      console.error(`❌ User ${user.email} has no treatments`)
      errors++
    }

    // Check bookings
    const bookingCount = await Booking.countDocuments({ ownerId })
    if (bookingCount === 0) {
      console.error(`❌ User ${user.email} has no bookings`)
      errors++
    }

    // Check orphaned bookings
    const bookings = await Booking.find({ ownerId }).limit(10)
    for (const booking of bookings) {
      const patient = await Patient.findById(booking.patientId)
      if (!patient) {
        console.error(`❌ Booking ${booking._id} references non-existent patient ${booking.patientId}`)
        errors++
      }

      const staff = await Staff.findById(booking.staffId)
      if (!staff) {
        console.error(`❌ Booking ${booking._id} references non-existent staff ${booking.staffId}`)
        errors++
      }

      const treatment = await Treatment.findById(booking.treatmentId)
      if (!treatment) {
        console.error(`❌ Booking ${booking._id} references non-existent treatment ${booking.treatmentId}`)
        errors++
      }
    }
  }

  if (errors === 0) {
    console.log('✅ All validation checks passed')
  } else {
    console.log(`⚠️  Found ${errors} validation errors`)
  }
}

// Summary
async function printSummary() {
  console.log('\n📊 Data Summary:')
  console.log('═══════════════════════════════════════')

  const userCount = await User.countDocuments()
  const patientCount = await Patient.countDocuments()
  const staffCount = await Staff.countDocuments()
  const treatmentCount = await Treatment.countDocuments()
  const bookingCount = await Booking.countDocuments()
  const withdrawalCount = await Withdrawal.countDocuments()

  console.log(`Users:        ${userCount}`)
  console.log(`Patients:     ${patientCount}`)
  console.log(`Staff:        ${staffCount}`)
  console.log(`Treatments:   ${treatmentCount}`)
  console.log(`Bookings:     ${bookingCount}`)
  console.log(`Withdrawals:  ${withdrawalCount}`)
  console.log('═══════════════════════════════════════')

  // Booking breakdown
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastBookings = await Booking.countDocuments({ startAt: { $lt: today } })
  const todayBookings = await Booking.countDocuments({
    startAt: { $gte: today, $lt: addDays(today, 1) }
  })
  const futureBookings = await Booking.countDocuments({ startAt: { $gte: addDays(today, 1) } })

  console.log('\nBooking Distribution:')
  console.log(`  Past:    ${pastBookings}`)
  console.log(`  Today:   ${todayBookings}`)
  console.log(`  Future:  ${futureBookings}`)

  console.log('\nBooking Status:')
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show']
  for (const status of statuses) {
    const count = await Booking.countDocuments({ status })
    console.log(`  ${status.padEnd(10)}: ${count}`)
  }

  console.log('\nWithdrawal Status:')
  const wStatuses = ['pending', 'approved', 'completed', 'rejected']
  for (const status of wStatuses) {
    const count = await Withdrawal.countDocuments({ status })
    console.log(`  ${status.padEnd(10)}: ${count}`)
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive data seeding...')
  console.log(`📝 Keep existing data: ${KEEP_EXISTING}`)

  await connectDB()

  if (!KEEP_EXISTING) {
    await clearData()
  }

  const users = await seedUsers()
  const patients = await seedPatients(users)
  const staff = await seedStaff(users)
  const treatments = await seedTreatments(users, staff)
  const bookings = await seedBookings(users, patients, staff, treatments)
  const withdrawals = await seedWithdrawals(users, staff)

  await validateData(users)
  await printSummary()

  console.log('\n✅ Seeding completed successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('   Email: admin@reserva.app')
  console.log('   Email: clinic1@reserva.app')
  console.log('   Email: clinic2@reserva.app')
  console.log('   Password: password123')

  await mongoose.disconnect()
  console.log('\n👋 Disconnected from MongoDB')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Import models using absolute path
const modelsPath = path.join(__dirname, '..', 'models');
const User = require(path.join(modelsPath, 'User.ts'));
const Patient = require(path.join(modelsPath, 'Patient.ts'));
const Staff = require(path.join(modelsPath, 'Staff.ts'));
const Treatment = require(path.join(modelsPath, 'Treatment.ts'));
const Booking = require(path.join(modelsPath, 'Booking.ts'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-clinic';

// Generate dummy data
const generateDummyData = () => {
  // Create test user
  const testUser = {
    email: 'admin@reserva.com',
    password: 'admin123',
    name: 'Admin Reserva',
    role: 'user'
  };

  // Generate patients
  const patients = [
    { name: 'Siti Nurhaliza', phone: '081xxxxxxxxx0', email: 'siti@gmail.com', notes: 'Prefers morning appointments' },
    { name: 'Rina Susanti', phone: '081xxxxxxxxx1', email: 'rina@gmail.com', notes: 'Allergic to certain products' },
    { name: 'Maya Putri', phone: '081xxxxxxxxx2', email: 'maya@gmail.com', notes: 'VIP customer' },
    { name: 'Dewi Lestari', phone: '081xxxxxxxxx3', email: 'dewi@gmail.com', notes: 'Regular facial treatment' },
    { name: 'Anita Rahayu', phone: '081xxxxxxxxx4', email: 'anita@gmail.com', notes: 'Sensitive skin' },
    { name: 'Bunga Citra', phone: '081xxxxxxxxx5', email: 'bunga@gmail.com', notes: 'Prefers weekend appointments' },
    { name: 'Indah Permata', phone: '081xxxxxxxxx6', email: 'indah@gmail.com', notes: 'New customer' },
    { name: 'Sarah Abdullah', phone: '081xxxxxxxxx7', email: 'sarah@gmail.com', notes: 'Prefers female staff' },
    { name: 'Fitri Handayani', phone: '081xxxxxxxxx8', email: 'fitri@gmail.com', notes: 'Regular massage client' },
    { name: 'Novi Anggraini', phone: '081xxxxxxxxx9', email: 'novi@gmail.com', notes: 'Birthday discount member' },
  ];

  // Generate staff
  const staff = [
    {
      name: 'Dr. Ratna Sari',
      role: 'Senior Therapist',
      email: 'ratna@reserva.com',
      phone: '082111111111',
      skills: ['Facial', 'Laser Treatment', 'Chemical Peel'],
      capacity: 4,
      balance: 2500000,
      totalEarnings: 15000000,
      rating: 4.9,
      workingHours: [
        { day: 'Monday', start: '09:00', end: '17:00' },
        { day: 'Tuesday', start: '09:00', end: '17:00' },
        { day: 'Wednesday', start: '09:00', end: '17:00' },
        { day: 'Thursday', start: '09:00', end: '17:00' },
        { day: 'Friday', start: '09:00', end: '17:00' },
      ]
    },
    {
      name: 'Lina Marlina',
      role: 'Beauty Therapist',
      email: 'lina@reserva.com',
      phone: '082111111112',
      skills: ['Facial', 'Body Treatment', 'Makeup'],
      capacity: 5,
      balance: 1800000,
      totalEarnings: 12000000,
      rating: 4.7,
      workingHours: [
        { day: 'Monday', start: '10:00', end: '18:00' },
        { day: 'Tuesday', start: '10:00', end: '18:00' },
        { day: 'Wednesday', start: '10:00', end: '18:00' },
        { day: 'Thursday', start: '10:00', end: '18:00' },
        { day: 'Saturday', start: '10:00', end: '18:00' },
      ]
    },
    {
      name: 'Kartika Putri',
      role: 'Massage Therapist',
      email: 'kartika@reserva.com',
      phone: '082111111113',
      skills: ['Thai Massage', 'Swedish Massage', 'Reflexology'],
      capacity: 3,
      balance: 2000000,
      totalEarnings: 10000000,
      rating: 4.8,
      workingHours: [
        { day: 'Tuesday', start: '11:00', end: '19:00' },
        { day: 'Wednesday', start: '11:00', end: '19:00' },
        { day: 'Thursday', start: '11:00', end: '19:00' },
        { day: 'Friday', start: '11:00', end: '19:00' },
        { day: 'Saturday', start: '11:00', end: '19:00' },
      ]
    },
    {
      name: 'Wulan Sari',
      role: 'Junior Therapist',
      email: 'wulan@reserva.com',
      phone: '082111111114',
      skills: ['Basic Facial', 'Manicure', 'Pedicure'],
      capacity: 6,
      balance: 1200000,
      totalEarnings: 6000000,
      rating: 4.5,
      workingHours: [
        { day: 'Monday', start: '09:00', end: '17:00' },
        { day: 'Wednesday', start: '09:00', end: '17:00' },
        { day: 'Friday', start: '09:00', end: '17:00' },
        { day: 'Sunday', start: '10:00', end: '16:00' },
      ]
    },
  ];

  // Generate treatments
  const treatments = [
    // Facial Treatments
    { name: 'Basic Facial', category: 'Facial', durationMin: 60, price: 150000, description: 'Deep cleansing facial with extraction', popularity: 85, assignedStaff: [] },
    { name: 'Hydrating Facial', category: 'Facial', durationMin: 75, price: 250000, description: 'Intensive hydration treatment for dry skin', popularity: 78, assignedStaff: [] },
    { name: 'Anti-Aging Facial', category: 'Facial', durationMin: 90, price: 350000, description: 'Advanced treatment with collagen boost', popularity: 92, assignedStaff: [] },
    { name: 'Brightening Facial', category: 'Facial', durationMin: 80, price: 300000, description: 'Vitamin C treatment for glowing skin', popularity: 88, assignedStaff: [] },
    { name: 'Acne Treatment', category: 'Facial', durationMin: 70, price: 200000, description: 'Specialized treatment for acne-prone skin', popularity: 75, assignedStaff: [] },

    // Body Treatments
    { name: 'Body Scrub', category: 'Body', durationMin: 45, price: 180000, description: 'Full body exfoliation treatment', popularity: 70, assignedStaff: [] },
    { name: 'Body Wrap', category: 'Body', durationMin: 60, price: 280000, description: 'Detoxifying seaweed body wrap', popularity: 65, assignedStaff: [] },
    { name: 'Slimming Treatment', category: 'Body', durationMin: 90, price: 400000, description: 'RF and cavitation treatment', popularity: 82, assignedStaff: [] },

    // Massage
    { name: 'Swedish Massage', category: 'Massage', durationMin: 60, price: 200000, description: 'Relaxing full body massage', popularity: 90, assignedStaff: [] },
    { name: 'Thai Massage', category: 'Massage', durationMin: 90, price: 250000, description: 'Traditional Thai stretching massage', popularity: 85, assignedStaff: [] },
    { name: 'Hot Stone Massage', category: 'Massage', durationMin: 75, price: 300000, description: 'Therapeutic hot stone treatment', popularity: 88, assignedStaff: [] },
    { name: 'Reflexology', category: 'Massage', durationMin: 45, price: 150000, description: 'Foot pressure point massage', popularity: 80, assignedStaff: [] },

    // Hair & Nails
    { name: 'Manicure', category: 'Nails', durationMin: 45, price: 100000, description: 'Complete nail care and polish', popularity: 75, assignedStaff: [] },
    { name: 'Pedicure', category: 'Nails', durationMin: 60, price: 120000, description: 'Foot care with nail treatment', popularity: 72, assignedStaff: [] },
    { name: 'Gel Nails', category: 'Nails', durationMin: 90, price: 200000, description: 'UV gel nail application', popularity: 78, assignedStaff: [] },
    { name: 'Hair Spa', category: 'Hair', durationMin: 60, price: 180000, description: 'Deep conditioning hair treatment', popularity: 68, assignedStaff: [] },

    // Special Treatments
    { name: 'Laser Hair Removal', category: 'Laser', durationMin: 30, price: 500000, description: 'Permanent hair reduction treatment', popularity: 95, assignedStaff: [] },
    { name: 'Chemical Peel', category: 'Medical', durationMin: 45, price: 450000, description: 'Medical grade skin resurfacing', popularity: 86, assignedStaff: [] },
    { name: 'Botox', category: 'Medical', durationMin: 30, price: 800000, description: 'Anti-wrinkle injection treatment', popularity: 93, assignedStaff: [] },
    { name: 'Filler', category: 'Medical', durationMin: 45, price: 1200000, description: 'Dermal filler for volume restoration', popularity: 91, assignedStaff: [] },
  ];

  return { testUser, patients, staff, treatments };
};

// Generate bookings for today and upcoming days
const generateBookings = (patients, staff, treatments) => {
  const bookings = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Time slots for appointments
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const statuses = ['confirmed', 'pending', 'completed', 'cancelled', 'no-show'];
  const paymentStatuses = ['paid', 'unpaid', 'deposit'];

  // Generate bookings for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() + dayOffset);

    // Generate 3-8 bookings per day
    const bookingsPerDay = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < bookingsPerDay; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const staffMember = staff[Math.floor(Math.random() * staff.length)];
      const treatment = treatments[Math.floor(Math.random() * treatments.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      // Parse time slot
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const startAt = new Date(bookingDate);
      startAt.setHours(hours, minutes, 0, 0);

      const endAt = new Date(startAt);
      endAt.setMinutes(endAt.getMinutes() + treatment.durationMin);

      // For today's bookings, mix of statuses; for future, mostly pending/confirmed
      let status = 'confirmed';
      if (dayOffset === 0) {
        // Today's bookings
        if (startAt < new Date()) {
          status = ['completed', 'no-show'][Math.floor(Math.random() * 2)];
        }
      } else {
        status = ['confirmed', 'pending'][Math.floor(Math.random() * 2)];
      }

      const booking = {
        patientId: patient._id,
        patientName: patient.name,
        staffId: staffMember._id,
        treatmentId: treatment._id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status,
        source: ['online', 'walk-in'][Math.floor(Math.random() * 2)],
        paymentStatus: status === 'completed' ? 'paid' : paymentStatuses[Math.floor(Math.random() * 3)],
        notes: ['First time customer', 'Regular client', 'VIP treatment', ''][Math.floor(Math.random() * 4)],
        queueNumber: i + 1,
      };

      bookings.push(booking);
    }
  }

  return bookings;
};

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('📡 Connecting to MongoDB:', MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Staff.deleteMany({}),
      Treatment.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared');

    // Generate dummy data
    const { testUser, patients, staff, treatments } = generateDummyData();

    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const createdUser = await User.create({
      ...testUser,
      password: hashedPassword,
      isActive: true,
    });
    console.log(`✅ Created user: ${testUser.email} (password: ${testUser.password})`);

    // Create patients
    console.log('👥 Creating patients...');
    const createdPatients = await Patient.insertMany(
      patients.map(p => ({ ...p, ownerId: createdUser._id }))
    );
    console.log(`✅ Created ${createdPatients.length} patients`);

    // Create staff
    console.log('👨‍⚕️ Creating staff...');
    const createdStaff = await Staff.insertMany(
      staff.map(s => ({ ...s, ownerId: createdUser._id, isActive: true }))
    );
    console.log(`✅ Created ${createdStaff.length} staff members`);

    // Create treatments and assign staff
    console.log('💆 Creating treatments...');
    const treatmentsWithStaff = treatments.map(treatment => {
      // Assign 1-3 random staff members to each treatment
      const numStaff = Math.floor(Math.random() * 3) + 1;
      const assignedStaff = [];
      for (let i = 0; i < numStaff; i++) {
        const randomStaff = createdStaff[Math.floor(Math.random() * createdStaff.length)];
        if (!assignedStaff.includes(randomStaff._id.toString())) {
          assignedStaff.push(randomStaff._id.toString());
        }
      }
      return {
        ...treatment,
        assignedStaff,
        ownerId: createdUser._id,
        isActive: true,
      };
    });
    const createdTreatments = await Treatment.insertMany(treatmentsWithStaff);
    console.log(`✅ Created ${createdTreatments.length} treatments`);

    // Generate and create bookings
    console.log('📅 Creating bookings...');
    const bookings = generateBookings(createdPatients, createdStaff, createdTreatments);
    const createdBookings = await Booking.insertMany(
      bookings.map(b => ({ ...b, ownerId: createdUser._id }))
    );
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Summary
    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - User: ${testUser.email} (password: admin123)`);
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Staff: ${createdStaff.length}`);
    console.log(`   - Treatments: ${createdTreatments.length}`);
    console.log(`   - Bookings: ${createdBookings.length}`);

    console.log('\n🔑 Login credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: admin123`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
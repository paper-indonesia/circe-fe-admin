# Multi-Tenant SaaS Guide

## 🏢 Overview

Aplikasi ini adalah **Multi-Tenant SaaS Platform** yang memungkinkan berbagai jenis bisnis menggunakan sistem yang sama dengan **data yang sepenuhnya terpisah** dan **terminology yang dapat disesuaikan**.

## 🔒 Data Isolation - Bagaimana Data Anda Aman

### Prinsip Isolasi Data

Setiap user/bisnis memiliki `ownerId` unik yang **SELALU** digunakan untuk filter data:

```typescript
// SEMUA query HARUS include ownerId
const bookings = await Booking.find({ ownerId: user.userId })
const staff = await Staff.find({ ownerId: user.userId })
const treatments = await Treatment.find({ ownerId: user.userId })
const patients = await Patient.find({ ownerId: user.userId })
```

### Database Indexes untuk Performa & Keamanan

Setiap collection memiliki **compound index** dengan `ownerId`:

```typescript
// models/Booking.ts
BookingSchema.index({ ownerId: 1, startAt: 1, status: 1 })

// models/Staff.ts
StaffSchema.index({ ownerId: 1, name: 1 })

// models/Treatment.ts
TreatmentSchema.index({ ownerId: 1, category: 1 })

// models/Patient.ts
PatientSchema.index({ ownerId: 1, email: 1 })
```

### Middleware Protection

Semua API routes dilindungi dengan authentication middleware:

```typescript
// lib/auth.ts
export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  const decoded = jwt.verify(token, JWT_SECRET)
  return decoded // Contains userId
}

// Usage in API routes
const user = await verifyAuth(request)
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// ALWAYS filter by ownerId
const data = await Model.find({ ownerId: user.userId })
```

## 🎨 Dynamic Terminology System

### Supported Business Types

1. **Beauty & Wellness Clinic** 💆
   - Staff → Staff Members
   - Treatment → Treatments
   - Patient → Clients
   - Booking → Appointments

2. **Education & Tutoring** 📚
   - Staff → Teachers
   - Treatment → Subjects
   - Patient → Students
   - Booking → Classes

3. **Consulting Services** 💼
   - Staff → Consultants
   - Treatment → Services
   - Patient → Clients
   - Booking → Meetings

4. **Fitness & Training** 💪
   - Staff → Trainers
   - Treatment → Programs
   - Patient → Members
   - Booking → Sessions

5. **Healthcare Services** 🏥
   - Staff → Doctors
   - Treatment → Services
   - Patient → Patients
   - Booking → Appointments

6. **Hair & Beauty Salon** 💇
   - Staff → Stylists
   - Treatment → Services
   - Patient → Clients
   - Booking → Appointments

7. **Spa & Massage** 🧖
   - Staff → Therapists
   - Treatment → Treatments
   - Patient → Guests
   - Booking → Appointments

8. **Custom Business** ⚙️
   - Define your own terminology!

## 📝 Setup Guide untuk User Baru

### Step 1: Sign Up

```
1. Navigate to /signup
2. Enter email, password, business name
3. Click "Create Account"
```

### Step 2: Onboarding Wizard (Automatic)

Saat first login, onboarding wizard akan muncul:

**Screen 1: Business Type**
- Pilih jenis bisnis Anda
- System akan suggest terminology yang sesuai

**Screen 2: Customize Terminology**
- Review dan customize terms jika perlu
- Contoh: "Teachers" untuk education, "Trainers" untuk fitness

**Screen 3: Add Categories**
- Tambahkan categories untuk services Anda
- Contoh untuk Education: Mathematics, Science, English, etc.

**Screen 4: Review & Complete**
- Review semua settings
- Click "Complete Setup"

### Step 3: Start Using

Setelah onboarding, Anda bisa:
1. ✅ Add Staff/Teachers/Trainers/etc
2. ✅ Add Services/Subjects/Programs/etc
3. ✅ Add Clients/Students/Members/etc
4. ✅ Create Bookings/Classes/Sessions/etc

## 🔧 Technical Implementation

### Using Terminology in Components

```typescript
import { useTerminology } from '@/hooks/use-terminology'

function MyComponent() {
  const { staff, treatment, patient, booking } = useTerminology()

  return (
    <div>
      <h1>Add New {staff}</h1>
      <Label>{treatment} Name</Label>
      <Button>Create {booking}</Button>
    </div>
  )
}
```

### API Example

```typescript
// app/api/staff/route.ts
import { verifyAuth } from '@/lib/auth'
import Staff from '@/models/Staff'

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ALWAYS filter by ownerId - DATA ISOLATION
  const staff = await Staff.find({ ownerId: user.userId })

  return NextResponse.json(staff)
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // ALWAYS set ownerId when creating - DATA ISOLATION
  const newStaff = await Staff.create({
    ...body,
    ownerId: user.userId // CRITICAL!
  })

  return NextResponse.json(newStaff)
}
```

## ✅ Data Isolation Checklist

Setiap kali membuat feature baru, pastikan:

- [ ] API route protected dengan `verifyAuth()`
- [ ] Semua query include `{ ownerId: user.userId }`
- [ ] Semua create/update set `ownerId: user.userId`
- [ ] Model memiliki index pada `ownerId`
- [ ] No hard-coded terminology (use `useTerminology()`)
- [ ] Tested dengan multiple users

## 🧪 Testing Multi-Tenancy

### Create Test Accounts

```bash
# User 1: Beauty Clinic
email: clinic@test.com
password: test123

# User 2: Tutoring Service
email: tutor@test.com
password: test123

# User 3: Fitness Gym
email: gym@test.com
password: test123
```

### Verify Data Isolation

1. Login as User 1, create staff/treatments/patients
2. Logout, login as User 2
3. Verify User 2 sees ZERO data from User 1
4. Create User 2's own data
5. Repeat verification

### Database Verification

```javascript
// In MongoDB shell
// Count documents per user
db.staff.aggregate([
  { $group: { _id: "$ownerId", count: { $sum: 1 } } }
])

// Verify no cross-contamination
db.bookings.find({ ownerId: "user1" }).forEach(booking => {
  const patient = db.patients.findOne({ _id: booking.patientId })
  assert(patient.ownerId === "user1") // Must be same owner!
})
```

## 🚨 Security Best Practices

### DO ✅

```typescript
// Always use ownerId in queries
const data = await Model.find({ ownerId: user.userId })

// Always verify auth before any operation
const user = await verifyAuth(request)
if (!user) return error

// Use middleware for protection
export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)
  // ... protected logic
}
```

### DON'T ❌

```typescript
// NEVER query without ownerId
const data = await Model.find({}) // DANGEROUS!

// NEVER trust client-provided ownerId
const body = await request.json()
await Model.create({ ownerId: body.ownerId }) // DANGEROUS!

// NEVER skip auth check
export async function GET(request: NextRequest) {
  const data = await Model.find({}) // DANGEROUS!
  return NextResponse.json(data)
}
```

## 📊 Example Use Cases

### Case 1: Beauty Clinic "Glow Aesthetics"

```
Business Type: Beauty & Wellness Clinic
Staff: Beauty Therapists (Siti, Ani, Dewi)
Treatments: HydraFacial, Botox, Laser Hair Removal
Clients: 150 patients
Bookings: 30-40 per day
```

### Case 2: Tutoring Service "Smart Kids"

```
Business Type: Education & Tutoring
Staff: Teachers (Budi, Rina, Ahmad)
Subjects: Mathematics, English, Science
Students: 80 students
Classes: 20-25 per day
```

### Case 3: Fitness Gym "Iron Paradise"

```
Business Type: Fitness & Training
Staff: Personal Trainers (John, Sarah, Mike)
Programs: Weight Loss, Muscle Building, CrossFit
Members: 200 members
Sessions: 40-50 per day
```

**SEMUA MENGGUNAKAN APLIKASI YANG SAMA - DATA TERPISAH 100%!**

## 🔄 Migration Path untuk Existing Users

Jika sudah ada data dengan terminology lama:

1. System akan detect existing user
2. Auto-create TenantSettings dengan default values
3. User bisa customize kapan saja di Settings page
4. Semua existing data tetap work dengan terminology baru

## 📞 Support & Questions

Jika ada pertanyaan tentang:
- Data isolation
- Custom terminology
- Multi-tenant architecture
- Business type setup

Contact: support@reserva.app

---

**Last Updated**: 2025-01-30
**Version**: 2.0.0 (Multi-Tenant Release)
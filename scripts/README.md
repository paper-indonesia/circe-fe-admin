# Scripts Documentation

This directory contains utility scripts for database management and testing.

---

## 📝 Available Scripts

### 1. `seed-comprehensive.ts` ⭐ MAIN SCRIPT

**Purpose:** Seeds comprehensive realistic data for all collections

**Usage:**
```bash
# Clear and seed fresh data
npm run seed:full

# Keep existing data, add more
npm run seed:full:keep
```

**What It Does:**
- ✅ Creates 5 user accounts
- ✅ Generates 253 patients (realistic Indonesian names)
- ✅ Creates 88 staff members (various roles)
- ✅ Adds 140 treatments (5 categories)
- ✅ Seeds 924 bookings (past, present, future)
- ✅ Creates 172 withdrawal requests
- ✅ Validates referential integrity
- ✅ Prints detailed summary

**Features:**
- Realistic data generation
- Time-based data (±30 days)
- Status variations (pending, confirmed, completed, etc.)
- Financial calculations (staff balances)
- Queue numbers for walk-ins
- Prevents duplicate bookings
- Validates all relationships

**Data Highlights:**
```
Users:        5 (test credentials in QUICK_START.md)
Patients:     ~60 per clinic
Staff:        ~22 per clinic
Treatments:   ~35 per clinic
Bookings:     ~230 per clinic (varied statuses)
Withdrawals:  ~40 per clinic (various statuses)
```

---

### 2. `drop-old-indexes.ts`

**Purpose:** Drops deprecated indexes from previous schema versions

**Usage:**
```bash
npx tsx scripts/drop-old-indexes.ts
```

**What It Does:**
- Scans all collections
- Lists current indexes
- Drops old `tenantId` indexes (renamed to `ownerId`)
- Keeps current indexes intact

**When to Use:**
- After schema migration
- Before running seeding (if old indexes exist)
- When encountering duplicate key errors with old field names

**Example Output:**
```
📋 treatments indexes:
  - _id_
  - tenantId_1 ⚠️  Dropping old index
  - ownerId_1 ✅ Keeping
```

---

### 3. `seed-data.ts` (Legacy)

**Purpose:** Original seed script (now replaced by seed-comprehensive.ts)

**Status:** ⚠️ Deprecated - Use `seed-comprehensive.ts` instead

**Usage:**
```bash
npm run seed        # Legacy command
npm run db:seed     # Alias
```

**Note:** This script may not have all the features of the comprehensive version.

---

### 4. `seed-auth.ts` (Legacy)

**Purpose:** Seeds only authentication users

**Usage:**
```bash
npm run seed:auth
```

**When to Use:**
- If you only need to create user accounts
- For testing authentication without full dataset
- Quick setup for auth testing

---

### 5. `migrate-to-user-isolation.js`

**Purpose:** Migrates data from tenant-based to user-based isolation

**Usage:**
```bash
# Dry run (preview changes)
npm run migrate:user-isolation:dry-run

# Execute migration
npm run migrate:user-isolation
```

**What It Does:**
- Converts `tenantId` field to `ownerId`
- Updates all collections
- Maintains data relationships

**Warning:** Backup your database before running!

---

## 🎯 Common Workflows

### Fresh Start (Recommended for Testing)
```bash
# 1. Drop old indexes (if migrating from old schema)
npx tsx scripts/drop-old-indexes.ts

# 2. Seed comprehensive data
npm run seed:full

# 3. Start development server
npm run dev

# 4. Sign in at http://localhost:3001/signin
```

### Add More Data (Keep Existing)
```bash
npm run seed:full:keep
```

### Reset Everything
```bash
# Clear and re-seed
npm run seed:full
```

---

## 📊 Data Structure

### User Accounts (5 total)
```javascript
{
  email: 'clinic1@reserva.app',
  password: bcrypt.hash('password123'),
  name: 'Beauty Clinic Jakarta',
  role: 'user',
  isActive: true
}
```

### Patients (60 per user)
```javascript
{
  ownerId: '...',              // Links to User
  name: 'Budi Santoso',
  phone: '081xxxxxxxxx0',
  email: 'budi.santoso@gmail.com',
  notes: 'Regular customer',
  totalVisits: 15,
  lastVisitAt: Date
}
```

### Staff (22 per user)
```javascript
{
  ownerId: '...',
  name: 'Siti Wijaya',
  role: 'Therapist',
  skills: ['Facial', 'Massage'],
  rating: 4.8,
  balance: 5000000,           // Available for withdrawal
  totalEarnings: 50000000,
  totalWithdrawn: 45000000,
  capacity: 1,                // Concurrent bookings allowed
  bankAccount: {...}
}
```

### Treatments (35 per user)
```javascript
{
  ownerId: '...',
  name: 'Deep Cleansing Facial',
  category: 'Facial',
  durationMin: 45,
  price: 250000,
  popularity: 90,
  assignedStaff: ['...', '...']  // Staff who can perform
}
```

### Bookings (230 per user)
```javascript
{
  ownerId: '...',
  patientId: '...',
  staffId: '...',
  treatmentId: '...',
  startAt: Date,
  endAt: Date,
  status: 'confirmed',        // pending, confirmed, completed, cancelled, no-show
  source: 'online',           // or 'walk-in'
  paymentStatus: 'paid',      // unpaid, deposit, paid
  queueNumber: 5              // For walk-ins only
}
```

### Withdrawals (40 per user)
```javascript
{
  ownerId: '...',
  staffId: '...',
  amount: 1000000,
  status: 'pending',          // pending, approved, rejected, completed
  bankAccount: {...},
  requestDate: Date,
  processedDate: Date
}
```

---

## 🔍 Validation

All seeding scripts include validation:

### Referential Integrity
- ✅ All bookings have valid patient, staff, treatment IDs
- ✅ All withdrawals have valid staff IDs
- ✅ All treatments have valid assigned staff IDs

### Data Consistency
- ✅ Staff balance = totalEarnings - totalWithdrawn
- ✅ Patient totalVisits matches completed bookings
- ✅ Booking times are logical (endAt > startAt)
- ✅ No negative balances
- ✅ Unique constraints enforced

### Business Logic
- ✅ Completed bookings have paid status
- ✅ Walk-ins have queue numbers
- ✅ Past bookings have completed/cancelled/no-show status
- ✅ Future bookings have pending/confirmed status
- ✅ Withdrawal amounts ≤ staff balance

---

## 🐛 Troubleshooting

### Error: Duplicate Key (E11000)
**Cause:** Old indexes or duplicate data
**Solution:**
```bash
npx tsx scripts/drop-old-indexes.ts
npm run seed:full
```

### Error: Invalid Foreign Key
**Cause:** Orphaned references
**Solution:** Re-run seeding (clears and recreates all data)
```bash
npm run seed:full
```

### Error: Connection Timeout
**Cause:** MongoDB Atlas network or credentials
**Solution:**
1. Check `.env` has correct `MONGO_URI`
2. Verify IP whitelist in MongoDB Atlas
3. Test connection with MongoDB Compass

### Data Not Appearing
**Cause:** Wrong user logged in or no data seeded
**Solution:**
1. Run `npm run seed:full`
2. Sign in with correct test account
3. Verify `ownerId` filtering in queries

---

## 📈 Performance Tips

### Seeding Speed
- Typically completes in 10-30 seconds
- Creates ~1,600 records total
- Uses batch inserts for efficiency

### Index Creation
- Indexes auto-created on first query
- May take 1-2 seconds per collection
- Check MongoDB Atlas for index build status

### Memory Usage
- Script uses ~50-100MB RAM
- Safe for local development
- Scales for larger datasets

---

## 🎓 Code Examples

### Add Custom Data
```typescript
// In seed-comprehensive.ts

// Add your own user
const customUser = {
  email: 'myuser@example.com',
  password: await bcrypt.hash('mypassword', 10),
  name: 'My Clinic',
  role: 'user',
  isActive: true
}

// Add specific treatments
const myTreatment = {
  ownerId: user._id,
  name: 'Special Treatment',
  category: 'Custom',
  durationMin: 60,
  price: 500000,
  // ...
}
```

### Customize Data Ranges
```typescript
// Change booking date range
const sixtyDaysAgo = addDays(today, -60)  // Instead of -30
const sixtyDaysLater = addDays(today, 60) // Instead of +30

// Change record counts
const patientCount = randomInt(100, 150)  // Instead of 50-70
```

### Add Validation
```typescript
// Custom validation in seedBookings()
if (booking.paymentAmount > treatment.price) {
  console.error('❌ Payment exceeds treatment price')
  errors++
}
```

---

## 📚 Related Documentation

- **`/docs/INTEGRATION_SUMMARY.md`** - Project summary
- **`/docs/mcp-mongo-integration-checklist.md`** - Detailed checklist
- **`/QUICK_START.md`** - Quick start guide
- **`/models/*.ts`** - Database schemas

---

## 🤝 Contributing

When adding new scripts:

1. Follow TypeScript conventions
2. Add error handling
3. Include validation
4. Print clear progress messages
5. Add to `package.json` scripts
6. Document here in README

Example:
```json
{
  "scripts": {
    "my-script": "tsx scripts/my-script.ts"
  }
}
```

---

**Need help?** Check the main documentation or code comments in each script.

---

*Last Updated: 2025-09-30*
# MCP MongoDB Integration & Data Seeding Checklist

**Project:** Reserva Beauty Clinic Admin App
**Date:** 2025-09-30
**Purpose:** Comprehensive integration checklist for MongoDB connection, data seeding, and end-to-end feature validation

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [MCP Connection Setup](#mcp-connection-setup)
3. [Model & Index Audit](#model--index-audit)
4. [Dummy Data Plan](#dummy-data-plan)
5. [Seeding Execution](#seeding-execution)
6. [Feature Integration Tests](#feature-integration-tests)
7. [Performance & Index Validation](#performance--index-validation)
8. [Observability & Error Handling](#observability--error-handling)
9. [UAT & Regression](#uat--regression)
10. [Acceptance Criteria](#acceptance-criteria)
11. [Notes & Assumptions](#notes--assumptions)

---

## Prerequisites

### Environment Setup
- [ ] `.env` file exists with `MONGO_URI` and `MONGODB_DB_NAME`
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compilation working (`npx tsc --noEmit`)
- [ ] Next.js dev server can start without errors

### Database Access
- [ ] MongoDB Atlas cluster accessible
- [ ] Network access configured (IP whitelist/VPN)
- [ ] Database user has read/write permissions
- [ ] Connection string tested with MongoDB Compass or similar tool

### Code Repository Status
- [ ] Working directory clean or changes committed
- [ ] Latest changes pulled from main branch
- [ ] No merge conflicts

**Validation Command:**
```bash
npm run dev
# Should start without errors
```

---

## MCP Connection Setup

### Note on MCP Implementation
**Current Status:** The application uses direct Mongoose connection via `lib/mongodb.ts`. The term "MCP" in the original prompt likely refers to ensuring secure, cached MongoDB connections through the existing Mongoose pattern rather than implementing a separate MCP (Model Context Protocol) server.

### Connection Configuration
- [x] Connection module exists at `lib/mongodb.ts`
- [x] Uses environment variables (no hardcoded credentials)
- [x] Implements connection caching to prevent hot-reload issues
- [x] Database name configured: `paper-circe`
- [ ] Connection logging implemented (masked credentials)
- [ ] Connection error handling tested

### Connection Validation
- [ ] Test ping to database
  ```bash
  node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI, {dbName: 'paper-circe'}).then(() => {console.log('✅ Connected'); process.exit(0)}).catch(e => {console.error('❌ Error:', e.message); process.exit(1)})"
  ```
- [ ] List existing collections
- [ ] Verify database name matches `MONGODB_DB_NAME`
- [ ] Test connection in Next.js API route (e.g., `/api/test-env`)

### Security Checklist
- [x] No credentials in git history
- [x] `.env` in `.gitignore`
- [ ] Connection string masked in logs
- [ ] Rate limiting considered for API routes
- [ ] JWT secret properly configured

---

## Model & Index Audit

### Collections Overview
Current models in the application:
1. **Users** - Authentication and user management
2. **Patients** - Client/customer records
3. **Staff** - Therapists and employees
4. **Treatments** - Services/procedures offered
5. **Bookings** - Appointments and scheduling
6. **Withdrawals** - Staff payment withdrawals

### User Model (`models/User.ts`)
- [x] Schema defined with required fields
- [x] Email field indexed (unique)
- [x] Timestamps enabled
- [ ] Index validation: email unique constraint
- [ ] Test: Duplicate email prevention
- **Required Indexes:**
  - `{ email: 1 }` - unique ✅

### Patient Model (`models/Patient.ts`)
- [x] Schema defined with ownerId for multi-tenancy
- [x] Compound indexes for user isolation
- [x] Phone and email validation
- [ ] Index validation: ownerId + phone unique
- [ ] Test: Duplicate phone per owner
- **Required Indexes:**
  - `{ ownerId: 1, phone: 1 }` - unique ✅
  - `{ ownerId: 1, email: 1 }` - sparse ✅
  - `{ ownerId: 1, createdAt: -1 }` ✅

### Staff Model (`models/Staff.ts`)
- [x] Schema defined with financial fields
- [x] Balance and earnings tracking
- [x] Bank account information structure
- [x] Capacity field for concurrent bookings
- [ ] Index validation: ownerId queries
- [ ] Test: Skills array queries
- **Required Indexes:**
  - `{ ownerId: 1, isActive: 1 }` ✅
  - `{ ownerId: 1, role: 1 }` ✅
  - `{ ownerId: 1, rating: -1 }` ✅

### Treatment Model (`models/Treatment.ts`)
- [x] Schema defined with pricing and duration
- [x] Category organization
- [x] Staff assignment array
- [ ] Index validation: name uniqueness per owner
- [ ] Test: Category filtering performance
- **Required Indexes:**
  - `{ ownerId: 1, category: 1 }` ✅
  - `{ ownerId: 1, price: 1 }` ✅
  - `{ ownerId: 1, popularity: -1 }` ✅
  - `{ ownerId: 1, name: 1 }` - unique ✅

### Booking Model (`models/Booking.ts`)
- [x] Schema defined with time slots
- [x] Status workflow (pending → confirmed → completed)
- [x] Payment status tracking
- [x] Source tracking (walk-in vs online)
- [x] Prevention of double-booking (partial unique index)
- [ ] Index validation: Calendar queries (startAt range)
- [ ] Index validation: Staff availability queries
- [ ] Test: Overlapping bookings for same staff
- [ ] Test: Stacking bookings (multiple patients same slot)
- **Required Indexes:**
  - `{ ownerId: 1, startAt: 1 }` ✅
  - `{ ownerId: 1, staffId: 1, startAt: 1 }` ✅
  - `{ ownerId: 1, patientId: 1 }` ✅
  - `{ ownerId: 1, status: 1 }` ✅
  - `{ ownerId: 1, source: 1, createdAt: -1 }` ✅
  - `{ ownerId: 1, staffId: 1, startAt: 1, endAt: 1, status: 1 }` - unique partial ✅

### Withdrawal Model (`models/Withdrawal.ts`)
- [x] Schema defined with approval workflow
- [x] Bank account details
- [x] Status tracking (pending → approved/rejected → completed)
- [x] Minimum withdrawal amount: 50,000
- [ ] Index validation: Staff withdrawal history
- [ ] Test: Status workflow transitions
- **Required Indexes:**
  - `{ ownerId: 1, staffId: 1 }` ✅
  - `{ ownerId: 1, status: 1 }` ✅

### Additional Indexes Needed
- [ ] **Bookings**: Composite index for calendar view `{ ownerId: 1, startAt: 1, status: 1 }`
- [ ] **Patients**: Text index for search `{ name: "text", phone: "text" }`
- [ ] **Staff**: Text index for search `{ name: "text", email: "text" }`
- [ ] **Treatments**: Text index for search `{ name: "text", description: "text" }`

---

## Dummy Data Plan

### Data Coverage Requirements
All dummy data must support end-to-end testing of every feature in the application.

### 1. Users (Authentication)
**Quantity:** 5-8 users
**Variation:**
- [ ] 1 Admin user (email: admin@reserva.app)
- [ ] 3-4 Regular users (clinic owners)
- [ ] 1 Inactive user (for testing access control)

**Fields:**
- Email, password (bcrypt hashed), name, role, isActive
- Password for test: `password123`

### 2. Patients
**Quantity:** 50-100 patients
**Distribution:**
- [ ] 20% new patients (totalVisits: 0-1)
- [ ] 50% regular patients (totalVisits: 2-10)
- [ ] 30% VIP patients (totalVisits: 10+)
- [ ] Mix of patients with/without email
- [ ] Spread across 3-4 owner accounts

**Fields:**
- Name variations (Indonesian names)
- Phone numbers (realistic Indonesian format)
- Email (some null, some valid)
- Notes (medical history, preferences)
- lastVisitAt (distributed over past 180 days)

### 3. Staff
**Quantity:** 15-25 staff members
**Variation:**
- [ ] 5 Therapists (high rating, multiple skills)
- [ ] 3 Junior Therapists (lower rating, fewer skills)
- [ ] 2 Receptionists (role: "receptionist")
- [ ] 1 Manager (role: "manager")
- [ ] 2 Inactive staff
- [ ] Spread across owner accounts

**Skills Categories:**
- Facial treatments
- Body massage
- Nail care
- Hair care
- Spa packages

**Financial Data:**
- Balance: 0 - 5,000,000 IDR
- totalEarnings: 10,000,000 - 100,000,000 IDR
- totalWithdrawn: 5,000,000 - 50,000,000 IDR
- Bank account information for testing withdrawals

**Capacity:**
- Most staff: 1 (individual treatments)
- Some staff: 3-5 (group classes)

### 4. Treatments
**Quantity:** 30-50 treatments
**Categories:**
- [ ] Facial (10 treatments, 30-90 min, 150k-800k)
- [ ] Body Massage (8 treatments, 60-120 min, 200k-1.2M)
- [ ] Spa Package (5 treatments, 120-180 min, 500k-2M)
- [ ] Nail Care (7 treatments, 30-60 min, 75k-300k)
- [ ] Hair Care (5 treatments, 45-120 min, 100k-500k)
- [ ] Special Treatments (5 treatments, various)

**Popularity Distribution:**
- 20% high popularity (80-100)
- 50% medium popularity (40-79)
- 30% low popularity (0-39)

**Staff Assignments:**
- Each treatment assigned to 2-5 qualified staff
- Ensure cross-linking with Staff skills

### 5. Bookings
**Quantity:** 200-300 bookings
**Time Range:** -30 days to +30 days from today
**Distribution:**
- [ ] Past bookings (50%): -30 to -1 days
- [ ] Today bookings (10%): Today
- [ ] Future bookings (40%): +1 to +30 days

**Status Distribution:**
- Past: 70% completed, 20% no-show, 10% cancelled
- Today: 50% confirmed, 30% pending, 20% completed
- Future: 80% confirmed, 20% pending

**Source:**
- 60% online bookings
- 40% walk-in bookings (with queue numbers)

**Payment Status:**
- Completed bookings: 100% paid
- Confirmed bookings: 50% paid, 30% deposit, 20% unpaid
- Pending bookings: 80% unpaid, 20% deposit

**Special Scenarios:**
- [ ] **Stacking:** 5-10 instances of multiple bookings at same time slot (different staff or group classes)
- [ ] **Overlapping:** 3-5 instances of back-to-back bookings with no gap
- [ ] **Long treatments:** 3-5 bookings with 2+ hour duration
- [ ] **Queue numbers:** Walk-in bookings have sequential queue numbers per day

**Time Slot Distribution:**
- Operating hours: 09:00 - 21:00
- Peak hours (10:00-12:00, 14:00-16:00, 18:00-20:00): 60% of bookings
- Off-peak: 40% of bookings

### 6. Walk-in Queue
**Note:** Walk-in data is part of Bookings with source='walk-in'
**Additional Requirements:**
- [ ] Today's walk-ins: 3-5 pending walk-ins
- [ ] Queue numbers are sequential and reset daily
- [ ] Mix of new patients and existing patients

### 7. Withdrawals
**Quantity:** 30-50 withdrawal requests
**Distribution:**
- [ ] 40% pending (awaiting approval)
- [ ] 30% approved (awaiting transfer)
- [ ] 20% completed (money transferred)
- [ ] 10% rejected (insufficient balance, etc.)

**Amount Range:**
- Minimum: 50,000 IDR
- Maximum: 5,000,000 IDR
- Average: 500,000 - 1,000,000 IDR

**Time Distribution:**
- Request dates: Past 60 days
- Processed dates: For approved/completed/rejected only

**Validation:**
- [ ] All withdrawals link to valid staff with sufficient balance
- [ ] Completed withdrawals should reduce staff balance
- [ ] Rejected withdrawals include rejection reason

### Referential Integrity
- [ ] All bookings reference valid patient, staff, and treatment IDs
- [ ] All withdrawals reference valid staff IDs
- [ ] Staff balance = totalEarnings - totalWithdrawn
- [ ] Patient totalVisits matches completed bookings count
- [ ] Treatment assignedStaff array contains valid staff IDs
- [ ] Booking patientName matches Patient name

---

## Seeding Execution

### Preparation
- [ ] Backup existing database (if any data exists)
- [ ] Create seeding script: `scripts/seed-comprehensive.ts`
- [ ] Configure script to read from `.env`
- [ ] Add npm script: `"seed:full": "tsx scripts/seed-comprehensive.ts"`

### Seeding Order (Dependencies)
1. [ ] **Users** (no dependencies)
   - Expected: 5-8 records
   - Validation: `db.users.countDocuments()`

2. [ ] **Patients** (depends on Users for ownerId)
   - Expected: 50-100 records per owner
   - Validation: `db.patients.countDocuments({ ownerId: "..." })`

3. [ ] **Staff** (depends on Users for ownerId)
   - Expected: 15-25 records per owner
   - Validation: `db.staff.countDocuments({ ownerId: "...", isActive: true })`

4. [ ] **Treatments** (depends on Users and Staff)
   - Expected: 30-50 records per owner
   - Validation: Check assignedStaff arrays reference valid staff

5. [ ] **Bookings** (depends on Patients, Staff, Treatments)
   - Expected: 200-300 records per owner
   - Validation: Check all references valid, time slots logical

6. [ ] **Withdrawals** (depends on Staff)
   - Expected: 30-50 records per owner
   - Validation: Amount ≤ staff balance (for pending/approved)

### Execution Steps
1. [ ] Clear existing data (optional, for clean testing)
   ```bash
   # Manual: Drop collections via MongoDB Compass
   # Or: Add --clear flag to seed script
   ```

2. [ ] Run seeding script
   ```bash
   npm run seed:full
   ```

3. [ ] Monitor execution
   - [ ] No errors during insert
   - [ ] All stages complete
   - [ ] Summary shows correct counts

4. [ ] Verify data integrity
   ```bash
   npm run seed:full -- --verify-only
   ```

### Post-Seeding Validation

#### Record Counts
- [ ] Users: 5-8
- [ ] Patients: 50-100 per owner
- [ ] Staff: 15-25 per owner
- [ ] Treatments: 30-50 per owner
- [ ] Bookings: 200-300 per owner
- [ ] Withdrawals: 30-50 per owner

#### Referential Integrity Checks
- [ ] All bookings have valid patientId (exists in Patients)
- [ ] All bookings have valid staffId (exists in Staff)
- [ ] All bookings have valid treatmentId (exists in Treatments)
- [ ] All withdrawals have valid staffId (exists in Staff)
- [ ] Booking time ranges are logical (endAt > startAt)
- [ ] Staff balance is non-negative
- [ ] No orphaned references

#### Data Quality Checks
- [ ] Patient phones are unique per owner
- [ ] User emails are globally unique
- [ ] Treatment names are unique per owner
- [ ] Queue numbers are sequential for walk-ins on same day
- [ ] Payment status matches booking status (completed → paid)
- [ ] Staff earnings calculations are consistent

#### Sample Queries
```javascript
// Check booking conflicts (same staff, overlapping times)
db.bookings.aggregate([
  { $match: { ownerId: "...", status: { $in: ["confirmed", "pending"] } } },
  { $sort: { staffId: 1, startAt: 1 } }
])

// Check patient visit counts
db.bookings.aggregate([
  { $match: { ownerId: "...", status: "completed" } },
  { $group: { _id: "$patientId", count: { $sum: 1 } } }
])

// Check staff balances
db.staff.find({ ownerId: "...", balance: { $lt: 0 } })
```

---

## Feature Integration Tests

### 1. Dashboard (`/dashboard`)
- [ ] **Load Dashboard**
  - Renders without errors
  - Shows total revenue stat
  - Shows total bookings stat
  - Shows active clients stat
  - Shows active staff stat

- [ ] **Recent Bookings Widget**
  - Displays 5-10 most recent bookings
  - Shows patient name, treatment, date/time
  - Click booking opens detail modal/page

- [ ] **Revenue Chart**
  - Displays revenue trend (last 7/30 days)
  - Data points are accurate
  - Chart renders properly

- [ ] **Quick Stats**
  - Today's bookings count is correct
  - Pending walk-ins count is correct
  - Revenue today is calculated correctly

### 2. Calendar (`/calendar`)
- [ ] **Load Calendar View**
  - Renders without errors
  - Shows current month by default
  - Time slots (09:00-21:00) visible

- [ ] **Display Bookings**
  - All bookings for selected day appear
  - Bookings positioned at correct time slots
  - Booking cards show patient name, treatment, staff

- [ ] **Stacking Bookings**
  - Multiple bookings at same time slot are visible
  - Bookings are stacked or displayed side-by-side
  - All stacked bookings are clickable

- [ ] **Click Booking Detail**
  - Click opens booking detail modal/panel
  - Shows full booking information
  - Shows patient, staff, treatment details
  - Shows payment status
  - Can change booking status

- [ ] **Create New Booking**
  - Click time slot opens new booking form
  - Can select patient (search/create)
  - Can select treatment
  - Can select available staff
  - Form submits and booking appears on calendar

- [ ] **Drag & Drop (if implemented)**
  - Can drag booking to different time slot
  - Can drag booking to different staff
  - Changes persist

- [ ] **Navigation**
  - Previous/Next day buttons work
  - Date picker allows jumping to any date
  - Today button returns to current date

### 3. Clients/Patients (`/clients`)
- [ ] **Load Client List**
  - Renders without errors
  - Shows paginated list (10-20 per page)
  - Displays name, phone, email, total visits, last visit

- [ ] **Search Functionality**
  - Search by name works
  - Search by phone works
  - Search by email works
  - Results update in real-time

- [ ] **Sort/Filter**
  - Sort by name (A-Z, Z-A)
  - Sort by last visit (recent first)
  - Sort by total visits (high to low)
  - Filter by visit count (new, regular, VIP)

- [ ] **Add New Patient**
  - Click "Add Patient" opens form
  - Required fields validated (name, phone)
  - Duplicate phone shows error
  - Success message on creation
  - New patient appears in list

- [ ] **Edit Patient**
  - Click patient row opens edit form
  - Can update name, phone, email, notes
  - Duplicate phone (if changed) shows error
  - Changes persist

- [ ] **View Patient History**
  - Click "View History" shows all bookings for patient
  - Bookings sorted by date (recent first)
  - Shows treatment, staff, date, status, payment

- [ ] **Delete Patient**
  - Delete button/action available
  - Confirmation dialog appears
  - Cannot delete patient with active bookings (validation)
  - Successful deletion removes from list

### 4. Staff (`/staff`)
- [ ] **Load Staff List**
  - Renders without errors
  - Shows all active staff
  - Displays name, role, skills, rating, balance

- [ ] **Search & Filter**
  - Search by name works
  - Filter by role works
  - Filter by skills works
  - Filter by active/inactive status

- [ ] **Add New Staff**
  - Click "Add Staff" opens form
  - Required fields: name, role, skills
  - Can set capacity (default 1)
  - Can add bank account info
  - Success creates staff record

- [ ] **Edit Staff**
  - Can update all staff details
  - Can update skills (add/remove)
  - Can update working hours
  - Can update bank account
  - Changes persist

- [ ] **View Staff Schedule**
  - Click "View Schedule" shows staff's bookings
  - Calendar view filtered to this staff
  - Shows utilization (busy/free times)

- [ ] **View Earnings**
  - Shows total earnings
  - Shows current balance
  - Shows total withdrawn
  - Balance calculation correct (earnings - withdrawn)

- [ ] **Deactivate Staff**
  - Can toggle active/inactive status
  - Inactive staff don't appear in booking forms
  - Inactive staff still visible in reports (historical data)

### 5. Treatments (`/treatments`)
- [ ] **Load Treatment List**
  - Renders without errors
  - Shows all active treatments
  - Displays name, category, duration, price, popularity

- [ ] **Search & Filter**
  - Search by name works
  - Filter by category works
  - Sort by price (low to high, high to low)
  - Sort by popularity
  - Sort by duration

- [ ] **Add New Treatment**
  - Click "Add Treatment" opens form
  - Required: name, category, duration, price
  - Can assign multiple staff
  - Duplicate name (same owner) shows error
  - Success creates treatment

- [ ] **Edit Treatment**
  - Can update all treatment details
  - Can update assigned staff
  - Can change price (doesn't affect old bookings)
  - Changes persist

- [ ] **View Treatment Usage**
  - Shows number of bookings using this treatment
  - Shows revenue generated
  - Shows most frequent patients

- [ ] **Deactivate Treatment**
  - Can toggle active/inactive
  - Inactive treatments don't appear in booking forms
  - Existing bookings unaffected

### 6. Walk-in (`/walk-in`)
- [ ] **Load Walk-in Queue**
  - Renders without errors
  - Shows today's walk-in queue
  - Sorted by queue number
  - Displays queue #, patient name, status, time registered

- [ ] **Add Walk-in**
  - Click "Add Walk-in" opens form
  - Can search existing patient or create new
  - Can select treatment
  - Can select staff
  - Auto-assigns next queue number
  - Creates booking with source='walk-in'

- [ ] **Process Walk-in**
  - Can mark walk-in as "in progress"
  - Can complete walk-in (mark as completed)
  - Completion prompts for payment
  - Completed walk-in appears on calendar

- [ ] **Queue Management**
  - Queue numbers are sequential
  - Can reorder queue (drag & drop or up/down buttons)
  - Can cancel walk-in
  - Cancelled walk-ins removed from queue

### 7. Withdrawal (`/withdrawal`)
- [ ] **Load Withdrawal List**
  - Renders without errors
  - Shows all withdrawal requests
  - Displays staff name, amount, status, request date, bank info

- [ ] **Filter by Status**
  - Filter pending requests
  - Filter approved requests
  - Filter completed requests
  - Filter rejected requests

- [ ] **Create Withdrawal Request**
  - Click "Request Withdrawal" opens form
  - Select staff (or auto-fill if staff user)
  - Enter amount (validation: min 50k, max balance)
  - Shows staff current balance
  - Bank account auto-filled from staff record
  - Success creates request with status='pending'

- [ ] **Approve Withdrawal (Admin)**
  - Can approve pending request
  - Approval changes status to 'approved'
  - Can add notes

- [ ] **Complete Withdrawal (Admin)**
  - Can mark approved request as 'completed'
  - Completion deducts amount from staff balance
  - Records processed date and processed by

- [ ] **Reject Withdrawal (Admin)**
  - Can reject pending/approved request
  - Must provide rejection reason
  - Status changes to 'rejected'
  - Staff balance unchanged

- [ ] **Validation**
  - Cannot request withdrawal > current balance
  - Cannot approve if staff balance insufficient (changed since request)
  - Cannot complete already completed request

### 8. Settings (`/settings`)
- [ ] **Load Settings Page**
  - Renders without errors
  - Shows current user information

- [ ] **Change Password**
  - Form validates old password
  - Requires new password (min 8 chars)
  - Requires password confirmation (match)
  - Success updates password
  - Can log in with new password

- [ ] **Update Profile**
  - Can update name
  - Can update email (validation: unique)
  - Cannot update to duplicate email
  - Changes persist

- [ ] **Theme/Preferences**
  - Can toggle dark mode (if implemented)
  - Preferences saved in localStorage or DB

### 9. Authentication (`/signin`, `/signup`)
- [ ] **Sign In**
  - Form requires email and password
  - Valid credentials log in successfully
  - Invalid credentials show error
  - Redirects to dashboard on success
  - Session persists across page reload

- [ ] **Sign Up**
  - Form requires name, email, password
  - Email validation (format)
  - Password strength validation
  - Duplicate email shows error
  - Success creates user and logs in
  - Redirects to dashboard

- [ ] **Sign Out**
  - Sign out button/link works
  - Clears session/JWT
  - Redirects to sign-in page
  - Cannot access protected routes after sign out

- [ ] **Protected Routes**
  - Accessing /dashboard without login redirects to /signin
  - Accessing /clients without login redirects to /signin
  - JWT token validated on API requests
  - Expired token redirects to sign-in

### 10. Reports (if implemented)
- [ ] **Revenue Report**
  - Shows daily/weekly/monthly revenue
  - Can filter by date range
  - Can filter by treatment category
  - Export to CSV/PDF works

- [ ] **Booking Report**
  - Shows booking statistics
  - Breakdown by status (completed, cancelled, no-show)
  - Breakdown by source (walk-in, online)

- [ ] **Staff Performance**
  - Shows bookings per staff
  - Shows revenue per staff
  - Shows average rating per staff

---

## Performance & Index Validation

### Query Performance Tests

#### Calendar Query (Most Common)
- [ ] Query: Get all bookings for a specific date and owner
  ```javascript
  db.bookings.find({
    ownerId: "xxx",
    startAt: { $gte: startOfDay, $lte: endOfDay }
  }).explain("executionStats")
  ```
  - **Expected:** Uses index `{ ownerId: 1, startAt: 1 }`
  - **Execution time:** < 50ms for 300 bookings
  - **Documents examined:** ~10-30 (only bookings for that day)

#### Patient Search
- [ ] Query: Search patients by name or phone
  ```javascript
  db.patients.find({
    ownerId: "xxx",
    $or: [
      { name: /search/i },
      { phone: /search/ }
    ]
  }).explain("executionStats")
  ```
  - **Expected:** Uses index `{ ownerId: 1, createdAt: -1 }` then filters
  - **Execution time:** < 100ms for 100 patients
  - **Improvement:** Add text index for better search performance

#### Staff Availability
- [ ] Query: Get staff bookings for a time range
  ```javascript
  db.bookings.find({
    ownerId: "xxx",
    staffId: "yyy",
    startAt: { $gte: checkStart, $lte: checkEnd },
    status: { $in: ["confirmed", "pending"] }
  }).explain("executionStats")
  ```
  - **Expected:** Uses index `{ ownerId: 1, staffId: 1, startAt: 1 }`
  - **Execution time:** < 20ms
  - **Documents examined:** < 10

#### Withdrawal History
- [ ] Query: Get staff withdrawal history
  ```javascript
  db.withdrawals.find({
    ownerId: "xxx",
    staffId: "yyy"
  }).sort({ requestDate: -1 }).explain("executionStats")
  ```
  - **Expected:** Uses index `{ ownerId: 1, staffId: 1 }`
  - **Execution time:** < 30ms
  - **Documents examined:** ~5-20 per staff

### Index Usage Validation
- [ ] Run `db.collection.getIndexes()` for each collection
- [ ] Verify all planned indexes exist
- [ ] Check index sizes: `db.collection.stats()`
- [ ] No unused indexes (check query patterns)

### Load Testing (Optional)
- [ ] Simulate 10 concurrent users
- [ ] Simulate 100 API requests/minute
- [ ] Check response times remain acceptable
- [ ] Monitor MongoDB CPU and memory usage

---

## Observability & Error Handling

### Logging
- [ ] Database connection logs (success/failure)
- [ ] API route errors logged with context
- [ ] Failed queries logged with query details
- [ ] Authentication failures logged

### Error Handling
- [ ] API routes return proper HTTP status codes
  - 200: Success
  - 201: Created
  - 400: Bad request (validation errors)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 500: Server error

- [ ] Client-side error messages are user-friendly
- [ ] Server-side errors don't expose sensitive info
- [ ] Database errors caught and handled gracefully

### Health Checks
- [ ] API health endpoint: `/api/health`
  - Returns 200 if DB connected
  - Returns 503 if DB down

- [ ] Database connection retry logic
  - Attempts to reconnect on failure
  - Logs reconnection attempts

---

## UAT & Regression

### User Acceptance Testing Scenarios

#### Scenario 1: New Clinic Onboarding
- [ ] Sign up new user
- [ ] Add 3 staff members
- [ ] Add 5 treatments
- [ ] Add 10 patients
- [ ] Create 5 bookings (next 7 days)
- [ ] All data appears correctly
- [ ] No errors during onboarding

#### Scenario 2: Busy Day Operations
- [ ] View calendar for busy day (10+ bookings)
- [ ] Add new walk-in
- [ ] Process walk-in (complete and pay)
- [ ] Reschedule an existing booking
- [ ] Cancel a booking
- [ ] All changes reflect immediately
- [ ] No conflicts or errors

#### Scenario 3: End of Day
- [ ] View today's completed bookings
- [ ] Verify payments recorded
- [ ] Staff earnings updated
- [ ] Process 2-3 withdrawal requests
- [ ] Generate daily report
- [ ] All numbers accurate

#### Scenario 4: Multi-User Testing
- [ ] User A creates booking for their patient
- [ ] User B cannot see User A's data (isolation)
- [ ] User B creates booking for same time slot (different clinic)
- [ ] No conflicts between users
- [ ] Data isolation maintained

### Regression Testing
- [ ] Re-run all feature integration tests after any fixes
- [ ] Verify no existing functionality broken by changes
- [ ] Check edge cases (empty states, max values, etc.)

---

## Acceptance Criteria

### Global Acceptance Criteria
✅ **Pass if ALL of the following are true:**

1. **Data Completeness**
   - [ ] All 6 collections seeded with data
   - [ ] Record counts within specified ranges
   - [ ] All referential integrity checks pass
   - [ ] No orphaned references

2. **Feature Functionality**
   - [ ] All 9 main features load without errors
   - [ ] All CRUD operations work correctly
   - [ ] All search/filter functions work
   - [ ] All validations function properly

3. **Performance**
   - [ ] Calendar loads in < 1 second
   - [ ] Search results appear in < 500ms
   - [ ] API responses average < 200ms
   - [ ] No N+1 query issues

4. **Data Integrity**
   - [ ] No data corruption after operations
   - [ ] Financial calculations accurate (staff balances, revenue)
   - [ ] Booking conflicts prevented
   - [ ] User data isolation maintained

5. **User Experience**
   - [ ] No console errors in browser
   - [ ] All buttons/links functional
   - [ ] Forms validate properly
   - [ ] Success/error messages appear appropriately

6. **Security**
   - [ ] Authentication required for all protected routes
   - [ ] User can only access their own data
   - [ ] Passwords hashed (not plain text)
   - [ ] No sensitive data in client-side code/logs

### Per-Feature Acceptance Criteria

#### Dashboard ✅
- [ ] Displays accurate statistics
- [ ] Charts render without errors
- [ ] Recent bookings list populated

#### Calendar ✅
- [ ] All bookings for selected date visible
- [ ] Stacking bookings displayed correctly
- [ ] Booking detail modal works
- [ ] Can create new booking from time slot

#### Clients ✅
- [ ] List displays all patients
- [ ] Search finds correct results
- [ ] Can add/edit/delete patients
- [ ] Patient history shows all bookings

#### Staff ✅
- [ ] List displays all staff
- [ ] Can add/edit/deactivate staff
- [ ] Earnings and balance accurate
- [ ] Schedule view shows correct bookings

#### Treatments ✅
- [ ] List displays all treatments
- [ ] Can add/edit/deactivate treatments
- [ ] Staff assignments work correctly
- [ ] Category filtering works

#### Walk-in ✅
- [ ] Queue displays today's walk-ins
- [ ] Can add new walk-in
- [ ] Queue numbers sequential
- [ ] Can process walk-in to completion

#### Withdrawal ✅
- [ ] List displays all requests
- [ ] Can create new request
- [ ] Approval workflow functions
- [ ] Staff balance updates on completion
- [ ] Validation prevents over-withdrawal

#### Settings ✅
- [ ] Can change password
- [ ] Can update profile
- [ ] Changes persist

#### Authentication ✅
- [ ] Sign in/up works
- [ ] Sign out clears session
- [ ] Protected routes enforce auth
- [ ] JWT tokens valid

---

## Notes & Assumptions

### Implementation Notes

1. **MCP Interpretation:**
   - The application uses standard Mongoose connection pattern with caching
   - Connection is secure and uses environment variables
   - No separate MCP server is needed; the existing architecture is appropriate

2. **Database Structure:**
   - Multi-tenancy implemented via `ownerId` field in all models
   - User isolation enforced at query level (not database level)
   - Single database with logical separation

3. **Seeding Strategy:**
   - Created comprehensive seed script with realistic data
   - Data is deterministic (same seed data each run) for testing consistency
   - Can be run multiple times (clears before seeding)

4. **Index Strategy:**
   - Indexes optimized for most common query patterns
   - Compound indexes for multi-tenant queries (ownerId + other fields)
   - Unique indexes enforce data integrity

5. **Testing Approach:**
   - Manual testing checklist for UAT
   - Automated testing can be added later (Playwright/Cypress)
   - Focus on end-to-end user flows

### Assumptions Made

1. **User Roles:**
   - Current implementation has single role: 'user' (clinic owner)
   - Staff are employees, not login users
   - Future: May need staff login with limited permissions

2. **Payment Processing:**
   - Payment tracking is manual (payment status field)
   - No integration with payment gateways yet
   - Cash/transfer payment methods

3. **Booking Capacity:**
   - Staff capacity allows multiple concurrent bookings (group classes)
   - Default capacity is 1 (individual treatment)
   - Calendar should show multiple bookings per slot if capacity allows

4. **Business Hours:**
   - Default: 09:00 - 21:00
   - No strict enforcement in backend (UI constraint)
   - Future: Add business hours configuration per clinic

5. **Data Retention:**
   - No automatic data cleanup/archiving
   - All historical data retained indefinitely
   - Future: May need archiving strategy for old data

### Known Limitations

1. **Scalability:**
   - Current architecture suitable for small-to-medium clinics (< 50 staff, < 1000 bookings/month)
   - For larger scale, consider sharding or separate databases per tenant

2. **Real-time Updates:**
   - No WebSocket/real-time updates
   - Users must refresh to see changes by others
   - Future: Add socket.io for real-time calendar updates

3. **Search Performance:**
   - Text search without text indexes may be slow for large datasets
   - Consider adding text indexes or external search (Elasticsearch)

4. **Reporting:**
   - Limited reporting features currently
   - Future: Add comprehensive reporting module

5. **Mobile Responsiveness:**
   - UI optimized for desktop
   - Mobile experience may need improvement

### Recommended Next Steps

1. **Short-term:**
   - [ ] Add text indexes for better search performance
   - [ ] Implement automated tests (Playwright)
   - [ ] Add data export functionality (CSV/Excel)
   - [ ] Improve error messages and validation feedback

2. **Medium-term:**
   - [ ] Add comprehensive reporting module
   - [ ] Implement email/SMS notifications for bookings
   - [ ] Add payment gateway integration
   - [ ] Improve mobile responsiveness

3. **Long-term:**
   - [ ] Add real-time updates (WebSocket)
   - [ ] Implement multi-language support
   - [ ] Add advanced analytics and insights
   - [ ] Build mobile app (React Native)

---

## Checklist Summary

**Last Updated:** 2025-09-30
**Status:** In Progress

**Progress Overview:**
- Prerequisites: ⏳ In Progress
- MCP Connection: ⏳ In Progress
- Model & Index Audit: ⏳ In Progress
- Dummy Data Plan: ✅ Completed
- Seeding Execution: ⏳ Pending
- Feature Integration Tests: ⏳ Pending
- Performance & Index: ⏳ Pending
- Observability: ⏳ Pending
- UAT & Regression: ⏳ Pending
- Acceptance Criteria: ⏳ Pending

**Overall Completion:** ~15%

---

**End of Checklist**
  📋 Test Accounts to Create

  Account 1: Beauty Clinic

  Email: clinic@test.com
  Password: test123
  Business Name: Glow Aesthetics
  Business Type: Beauty & Wellness Clinic

  Expected Terminology:
  - Staff → "Staff"
  - Treatment → "Treatments"
  - Patient → "Clients"
  - Booking → "Appointments"

  Categories to Add:
  - Facial
  - Injectable
  - Laser
  - Body Treatment
  - Massage

  Account 2: Tutoring Service

  Email: tutor@test.com
  Password: test123
  Business Name: Smart Kids Academy
  Business Type: Education & Tutoring

  Expected Terminology:
  - Staff → "Teachers"
  - Treatment → "Subjects"
  - Patient → "Students"
  - Booking → "Classes"

  Categories to Add:
  - Mathematics
  - Science
  - English
  - Programming
  - Languages

  Account 3: Fitness Gym

  Email: gym@test.com
  Password: test123
  Business Name: Iron Paradise
  Business Type: Fitness & Training

  Expected Terminology:
  - Staff → "Trainers"
  - Treatment → "Programs"
  - Patient → "Members"
  - Booking → "Sessions"

  Categories to Add:
  - Weight Loss
  - Muscle Building
  - CrossFit
  - Cardio
  - Personal Training

  ---
  🎯 Test Scenario 1: Account 1 (Beauty Clinic)

  Step 1: Sign Up & Onboarding

  1. Open: http://localhost:3001/signup
  2. Fill form:
     - Email: clinic@test.com
     - Password: test123
     - Name: Glow Aesthetics
  3. Click "Sign Up"
  4. Should redirect to dashboard
  5. Onboarding wizard should appear automatically

  Step 2: Complete Onboarding Wizard

  Screen 1: Business Type
  ✓ Select: "Beauty & Wellness Clinic" 💆
  ✓ Business Name: Glow Aesthetics
  ✓ Click "Next"

  Screen 2: Customize Terminology (Skip or Keep Default)
  ✓ Staff: Staff (keep)
  ✓ Services: Treatments (keep)
  ✓ Customers: Clients (keep)
  ✓ Reservations: Appointments (keep)
  ✓ Click "Next"

  Screen 3: Add Categories
  ✓ Add: Facial
  ✓ Add: Injectable
  ✓ Add: Laser
  ✓ Add: Body Treatment
  ✓ Add: Massage
  ✓ Click "Next"

  Screen 4: Review & Complete
  ✓ Review all settings
  ✓ Click "Complete Setup"
  ✓ Wait for success message

  Step 3: Verify Sidebar

  Expected Sidebar Menu:
  ✓ Dashboard
  ✓ Calendar
  ✓ Clients          ← (NOT "Students"!)
  ✓ Staff            ← (NOT "Teachers"!)
  ✓ Walk-in
  ✓ Treatments       ← (NOT "Subjects"!)
  ✓ Withdrawal
  ✓ Settings

  Step 4: Add Sample Data

  Add Staff Members:
  Navigate to: Staff
  Click: "Add Staff Member"

  Staff 1:
  - Name: Siti Wijaya
  - Role: Beauty Therapist
  - Email: siti@glowclinic.com
  - Phone: +62 812 3456 7890
  - Photo URL: (leave empty or add)
  - Skills: Facial, Massage

  Staff 2:
  - Name: Ani Kusuma
  - Role: Laser Specialist
  - Email: ani@glowclinic.com
  - Phone: +62 813 4567 8901
  - Skills: Laser Treatment

  Staff 3:
  - Name: Dewi Lestari
  - Role: Injectable Expert
  - Email: dewi@glowclinic.com
  - Phone: +62 814 5678 9012
  - Skills: Botox, Fillers

  Add Treatments:
  Navigate to: Treatments
  Click: "Add Treatment"

  Treatment 1:
  - Name: HydraFacial
  - Category: Facial
  - Duration: 60 minutes
  - Price: 500000
  - Assign Staff: Siti Wijaya

  Treatment 2:
  - Name: Laser Hair Removal
  - Category: Laser
  - Duration: 45 minutes
  - Price: 750000
  - Assign Staff: Ani Kusuma

  Treatment 3:
  - Name: Botox Injection
  - Category: Injectable
  - Duration: 30 minutes
  - Price: 2000000
  - Assign Staff: Dewi Lestari

  Add Clients:
  Navigate to: Clients
  Click: "Add Client"

  Client 1:
  - Name: Rina Kusuma
  - Phone: +62 815 1234 5678
  - Email: rina.k@gmail.com

  Client 2:
  - Name: Budi Santoso
  - Phone: +62 816 2345 6789
  - Email: budi.s@gmail.com

  Client 3:
  - Name: Lisa Wijaya
  - Phone: +62 817 3456 7890
  - Email: lisa.w@gmail.com

  Create Bookings:
  Navigate to: Calendar or Walk-in
  Create booking:
  - Client: Rina Kusuma
  - Treatment: HydraFacial
  - Staff: Siti Wijaya
  - Date: Today
  - Time: 10:00
  - Payment: Full Payment

  Step 5: Verify Data Count

  ✓ Staff: 3 members
  ✓ Treatments: 3 services
  ✓ Clients: 3 people
  ✓ Bookings: 1 appointment

  ---
  🎯 Test Scenario 2: Account 2 (Tutoring Service)

  Step 1: Logout from Account 1

  1. Click logout button in sidebar
  2. Should redirect to /signin

  Step 2: Sign Up Account 2

  1. Open: http://localhost:3001/signup
  2. Fill form:
     - Email: tutor@test.com
     - Password: test123
     - Name: Smart Kids Academy
  3. Click "Sign Up"

  Step 3: Complete Onboarding

  Screen 1: Business Type
  ✓ Select: "Education & Tutoring" 📚
  ✓ Business Name: Smart Kids Academy
  ✓ Click "Next"

  Screen 2: Customize Terminology
  ✓ Team Members: Teachers
  ✓ Services: Subjects
  ✓ Customers: Students
  ✓ Reservations: Classes
  ✓ Click "Next"

  Screen 3: Add Categories
  ✓ Add: Mathematics
  ✓ Add: Science
  ✓ Add: English
  ✓ Add: Programming
  ✓ Add: Languages
  ✓ Click "Next"

  Screen 4: Complete
  ✓ Review and Complete

  Step 4: Verify Sidebar (DIFFERENT from Account 1!)

  Expected Sidebar Menu:
  ✓ Dashboard
  ✓ Calendar
  ✓ Students         ← (NOT "Clients"!)
  ✓ Teachers         ← (NOT "Staff"!)
  ✓ Walk-in
  ✓ Subjects         ← (NOT "Treatments"!)
  ✓ Withdrawal
  ✓ Settings

  Step 5: Add Sample Data

  Add Teachers:
  Navigate to: Teachers (NOT Staff!)
  Click: "Add Teacher"

  Teacher 1:
  - Name: Budi Hartono
  - Role: Math Teacher
  - Email: budi@smartkids.com
  - Phone: +62 818 1111 2222
  - Skills: Algebra, Geometry

  Teacher 2:
  - Name: Rina Safitri
  - Role: English Teacher
  - Email: rina@smartkids.com
  - Phone: +62 819 2222 3333
  - Skills: Grammar, Conversation

  Add Subjects:
  Navigate to: Subjects (NOT Treatments!)
  Click: "Add Subject"

  Subject 1:
  - Name: Basic Mathematics
  - Category: Mathematics
  - Duration: 60 minutes
  - Price: 150000
  - Assign: Budi Hartono

  Subject 2:
  - Name: English Conversation
  - Category: English
  - Duration: 90 minutes
  - Price: 200000
  - Assign: Rina Safitri

  Add Students:
  Navigate to: Students (NOT Clients!)
  Click: "Add Student"

  Student 1:
  - Name: Ahmad Rizki
  - Phone: +62 820 1234 5678
  - Email: ahmad.r@gmail.com

  Student 2:
  - Name: Putri Ayu
  - Phone: +62 821 2345 6789
  - Email: putri.a@gmail.com

  Step 6: Verify Data Isolation

  ✓ Teachers: 2 (NOT 3 like Account 1!)
  ✓ Subjects: 2 (completely different from Account 1's treatments!)
  ✓ Students: 2 (NO overlap with Account 1's clients!)
  ✓ Check: ZERO data from "Glow Aesthetics" visible!

  ---
  🎯 Test Scenario 3: Account 3 (Fitness Gym)

  Step 1: Logout from Account 2

  Logout from tutor@test.com

  Step 2: Sign Up Account 3

  Email: gym@test.com
  Password: test123
  Business Name: Iron Paradise
  Business Type: Fitness & Training

  Step 3: Complete Onboarding

  ✓ Select: Fitness & Training 💪
  ✓ Terminology: Trainers, Programs, Members, Sessions
  ✓ Categories: Weight Loss, Muscle Building, CrossFit
  ✓ Complete

  Step 4: Verify Sidebar

  ✓ Members          ← (NOT "Clients" or "Students"!)
  ✓ Trainers         ← (NOT "Staff" or "Teachers"!)
  ✓ Programs         ← (NOT "Treatments" or "Subjects"!)

  Step 5: Add Sample Data

  Add 2 Trainers:
  - John Doe (CrossFit Trainer)
  - Sarah Smith (Yoga Instructor)

  Add 2 Programs:
  - Weight Loss Program (30 min, Rp 300,000)
  - Muscle Building (60 min, Rp 500,000)

  Add 2 Members:
  - Mike Wilson
  - Anna Taylor

  Step 6: Final Verification

  ✓ Trainers: 2 (independent from other accounts)
  ✓ Programs: 2 (no overlap)
  ✓ Members: 2 (completely separate)

  ---
  ✅ Critical Tests - Data Isolation

  Test A: Cross-Account Data Access (MUST FAIL)

  Test Steps:
  1. Login as: clinic@test.com
  2. Open Browser DevTools → Network tab
  3. Navigate to: Staff page
  4. Check API request: /api/staff
  5. Response should show ONLY 3 staff members (Siti, Ani, Dewi)

  6. Logout and login as: tutor@test.com
  7. Navigate to: Teachers page
  8. Check API request: /api/staff
  9. Response should show ONLY 2 teachers (Budi, Rina)

  ✓ PASS if: NO data overlap
  ✗ FAIL if: Can see other user's data

  Test B: Database Query Verification

  Open MongoDB Compass or Shell:
  // Check staff collection
  db.staff.find({ ownerId: "clinic_user_id" }).count()
  // Should return: 3

  db.staff.find({ ownerId: "tutor_user_id" }).count()
  // Should return: 2

  db.staff.find({ ownerId: "gym_user_id" }).count()
  // Should return: 2

  // Verify NO cross-contamination
  db.bookings.find({ ownerId: "clinic_user_id" }).forEach(booking => {
    const patient = db.patients.findOne({ _id: booking.patientId })
    print("Patient ownerId:", patient.ownerId)
    // Should ALWAYS match booking's ownerId!
  })

  Test C: Terminology Persistence

  Test Steps:
  1. Login as: clinic@test.com
  2. Verify sidebar shows: "Clients", "Staff", "Treatments"
  3. Logout

  4. Login as: tutor@test.com
  5. Verify sidebar shows: "Students", "Teachers", "Subjects"
  6. Logout

  7. Login as: clinic@test.com again
  8. Verify STILL shows: "Clients", "Staff", "Treatments"

  ✓ PASS if: Each account retains its terminology
  ✗ FAIL if: Terminology changes between logins

  ---
  🐛 Known Issues to Check

  Issue 1: Onboarding Wizard Not Showing

  Expected: Wizard appears on first login
  If not showing:
  1. Check console for errors
  2. Verify API /api/settings/terminology returns 200
  3. Check onboardingCompleted field is false
  4. Try hard refresh (Ctrl+Shift+R)

  Issue 2: Terminology Not Updating

  Expected: Sidebar updates after onboarding
  If not updating:
  1. Hard refresh page (F5)
  2. Clear browser cache
  3. Check localStorage
  4. Verify API returns correct terminology

  Issue 3: Can See Other User's Data

  CRITICAL BUG if this happens!
  Debug steps:
  1. Check API responses in Network tab
  2. Verify ownerId in query params
  3. Check JWT token validity
  4. Check middleware verifyAuth() function

  ---
  📊 Expected Results Summary

  | Account         | Business      | Staff Count | Service Count | Customer Count | Terminology    
                  |
  |-----------------|---------------|-------------|---------------|----------------|------------    
  ----------------|
  | clinic@test.com | Beauty Clinic | 3           | 3             | 3              |
  Staff/Treatments/Clients   |
  | tutor@test.com  | Tutoring      | 2           | 2             | 2              |
  Teachers/Subjects/Students |
  | gym@test.com    | Fitness       | 2           | 2             | 2              |
  Trainers/Programs/Members  |

  Total in Database:
  - Staff collection: 7 documents (3+2+2)
  - Treatment collection: 7 documents (3+2+2)
  - Patient collection: 7 documents (3+2+2)
  - All with different ownerId values

  ---
  🎬 Complete Test Script

  Jalankan test ini secara berurutan:

  # 1. Start application
  npm run dev

  # 2. Create Account 1 (Beauty Clinic)
  # - Sign up: clinic@test.com / test123
  # - Complete onboarding
  # - Add 3 staff, 3 treatments, 3 clients
  # - Create 1 booking

  # 3. Verify Account 1 data
  # - Check sidebar: "Clients", "Staff", "Treatments"
  # - Check counts: 3, 3, 3

  # 4. Logout

  # 5. Create Account 2 (Tutoring)
  # - Sign up: tutor@test.com / test123
  # - Complete onboarding
  # - Add 2 teachers, 2 subjects, 2 students

  # 6. Verify Account 2 data
  # - Check sidebar: "Students", "Teachers", "Subjects"
  # - Check counts: 2, 2, 2
  # - CRITICAL: Verify NO data from Account 1 visible!

  # 7. Logout

  # 8. Create Account 3 (Fitness)
  # - Sign up: gym@test.com / test123
  # - Complete onboarding
  # - Add 2 trainers, 2 programs, 2 members

  # 9. Final Verification
  # - Login to each account
  # - Verify data isolation
  # - Verify terminology persistence
  # - Verify no cross-account access

  ---
  ✅ Success Criteria

  Test dianggap BERHASIL jika:

  1. ✅ Onboarding wizard muncul untuk semua new users
  2. ✅ Setiap account memiliki terminology yang berbeda
  3. ✅ Data 100% terpisah (NO overlap)
  4. ✅ Sidebar navigation menggunakan dynamic labels
  5. ✅ TIDAK bisa akses data account lain
  6. ✅ Terminology persistent after logout/login
  7. ✅ Database query filtered by ownerId
  8. ✅ API responses only contain current user's data

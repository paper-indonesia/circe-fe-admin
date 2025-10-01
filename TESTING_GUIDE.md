# 🧪 Complete Testing Guide - Multi-Tenant System

## 🎯 Overview

Panduan ini akan membantu Anda menguji sistem multi-tenant dengan 3 akun bisnis berbeda untuk memastikan:
- ✅ Data isolation 100%
- ✅ Dynamic terminology working
- ✅ Onboarding wizard functioning
- ✅ No cross-account data access

---

## 🚀 Prerequisites

Sebelum mulai testing:

1. **Start Application**
   ```bash
   npm run dev
   ```

2. **Clear Browser Data** (Recommended)
   ```
   Chrome: Ctrl+Shift+Delete
   Clear: Cookies, Cache, Local Storage
   ```

3. **Open Incognito/Private Window** (Optional tapi recommended)
   ```
   Chrome: Ctrl+Shift+N
   Firefox: Ctrl+Shift+P
   ```

---

## 📝 Test Account 1: Beauty Clinic

### Step 1: Sign Up

```
URL: http://localhost:3001/signup

Form Data:
┌─────────────────────────────────────┐
│ Business Name: Glow Aesthetics      │
│ Email: clinic@test.com              │
│ Password: test123                   │
│ Confirm Password: test123           │
└─────────────────────────────────────┘

✓ Click "Sign Up"
```

**Expected Result:**
- ✅ Account created successfully
- ✅ Auto redirect to `/dashboard`
- ✅ Onboarding Wizard appears automatically

### Step 2: Complete Onboarding Wizard

**Screen 1: Select Business Type**
```
✓ Click on: "Beauty & Wellness Clinic" 💆
✓ Business Name: Already filled (Glow Aesthetics)
✓ Click "Next"
```

**Screen 2: Customize Terminology (Optional - dapat di-skip)**
```
Default values (keep as is):
- Team Members: Staff
- Services: Treatments
- Customers: Clients
- Reservations: Appointments

✓ Click "Next"
```

**Screen 3: Add Categories**
```
Type and add each category:
✓ Type "Facial" → Click "Add"
✓ Type "Injectable" → Click "Add"
✓ Type "Laser" → Click "Add"
✓ Type "Body Treatment" → Click "Add"
✓ Type "Massage" → Click "Add"

Should see 5 badges with categories
✓ Click "Next"
```

**Screen 4: Review & Complete**
```
Review shows:
- Business Type: Beauty & Wellness Clinic
- Business Name: Glow Aesthetics
- Terminology: Staff, Treatments, Clients, Appointments
- Categories: Facial, Injectable, Laser, Body Treatment, Massage

✓ Click "Complete Setup"
✓ Wait for success message
✓ Page will reload automatically
```

### Step 3: Verify Dashboard

**Check Sidebar Navigation:**
```
Expected menu items:
✓ Dashboard
✓ Calendar
✓ Clients        ← (NOT "Students" or "Members"!)
✓ Staff          ← (NOT "Teachers" or "Trainers"!)
✓ Walk-in
✓ Treatments     ← (NOT "Subjects" or "Programs"!)
✓ Withdrawal
✓ Settings
```

**Screenshot this for reference!**

### Step 4: Add Staff Members

```
Navigate to: Staff (in sidebar)
Click: "Add Staff Member"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Staff Member 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Siti Wijaya
Role: Beauty Therapist
Email: siti@glowclinic.com
Phone: +62 812 3456 7890
Photo URL: (leave empty)
Skills:
  - Type "Facial" → Click Add
  - Type "Massage" → Click Add
Working Days:
  - Check: Monday, Tuesday, Wednesday, Thursday, Friday
Working Schedule:
  - Monday: 09:00 - 17:00
  - (Add for each working day)
Assigned Treatments: (skip for now, will assign later)

✓ Click "Add Staff Member"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Staff Member 2:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Ani Kusuma
Role: Laser Specialist
Email: ani@glowclinic.com
Phone: +62 813 4567 8901
Skills: Laser Treatment, IPL
Working Days: Mon-Fri

✓ Click "Add Staff Member"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Staff Member 3:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Dewi Lestari
Role: Injectable Expert
Email: dewi@glowclinic.com
Phone: +62 814 5678 9012
Skills: Botox, Fillers, Mesotherapy
Working Days: Mon-Fri

✓ Click "Add Staff Member"
```

**Verify:** Should see 3 staff members in the list

### Step 5: Add Treatments

```
Navigate to: Treatments (in sidebar)
Click: "Add Treatment"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment Name: HydraFacial
Category: Facial (select from dropdown)
Duration: 60 minutes
Price: 500000
Photo URL: (leave empty)
Description: Deep cleansing facial treatment
Assign Staff:
  ✓ Check: Siti Wijaya

✓ Click "Add Treatment"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment 2:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment Name: Laser Hair Removal
Category: Laser
Duration: 45 minutes
Price: 750000
Assign Staff: Ani Kusuma

✓ Click "Add Treatment"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment 3:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment Name: Botox Injection
Category: Injectable
Duration: 30 minutes
Price: 2000000
Assign Staff: Dewi Lestari

✓ Click "Add Treatment"
```

**Verify:** Should see 3 treatments in the list

### Step 6: Add Clients

```
Navigate to: Clients (in sidebar)
Click: "Add Client"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Rina Kusuma
Phone: +62 815 1234 5678
Email: rina.k@gmail.com
Notes: Regular customer

✓ Click "Add Client"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client 2:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Budi Santoso
Phone: +62 816 2345 6789
Email: budi.s@gmail.com

✓ Click "Add Client"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client 3:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Lisa Wijaya
Phone: +62 817 3456 7890
Email: lisa.w@gmail.com

✓ Click "Add Client"
```

**Verify:** Should see 3 clients in the list

### Step 7: Create a Booking

```
Navigate to: Walk-in (easier than calendar)

Fill booking form:
- Client: Select "Rina Kusuma"
- Treatment: Select "HydraFacial"
- Staff: Select "Siti Wijaya"
- Time Slot: Select any available time
- Payment Method: Cash
- Payment Type: Full Payment

✓ Click "Create Booking"
```

### Step 8: Account 1 Summary

**Data Count Check:**
```
✓ Staff: 3 members
✓ Treatments: 3 services
✓ Clients: 3 people
✓ Bookings: 1 appointment
```

**✅ LOGOUT NOW** - Important untuk test isolation!

---

## 📝 Test Account 2: Tutoring Service

### Step 1: Sign Up (New Account)

```
URL: http://localhost:3001/signup

Form Data:
┌─────────────────────────────────────┐
│ Business Name: Smart Kids Academy   │
│ Email: tutor@test.com               │
│ Password: test123                   │
│ Confirm Password: test123           │
└─────────────────────────────────────┘

✓ Click "Sign Up"
```

### Step 2: Complete Onboarding

**Screen 1: Select Business Type**
```
✓ Click on: "Education & Tutoring" 📚
✓ Click "Next"
```

**Screen 2: Customize Terminology**
```
Should auto-suggest:
- Team Members: Teachers
- Services: Subjects
- Customers: Students
- Reservations: Classes

✓ Keep defaults or customize
✓ Click "Next"
```

**Screen 3: Add Categories**
```
✓ Add: Mathematics
✓ Add: Science
✓ Add: English
✓ Add: Programming
✓ Add: Languages
✓ Click "Next"
```

**Screen 4: Complete**
```
✓ Review and click "Complete Setup"
```

### Step 3: Verify Dashboard - CRITICAL TEST!

**Check Sidebar Navigation:**
```
Expected menu items:
✓ Dashboard
✓ Calendar
✓ Students       ← (NOT "Clients"!)
✓ Teachers       ← (NOT "Staff"!)
✓ Walk-in
✓ Subjects       ← (NOT "Treatments"!)
✓ Withdrawal
✓ Settings
```

**🚨 CRITICAL: If you see "Clients", "Staff", or "Treatments", SOMETHING IS WRONG!**

### Step 4: Verify Data Isolation

**IMPORTANT CHECK:**
```
Navigate to: Teachers
Expected: EMPTY (0 teachers)

Navigate to: Subjects
Expected: EMPTY (0 subjects)

Navigate to: Students
Expected: EMPTY (0 students)

🚨 If you see Siti Wijaya, Ani Kusuma, or any data from Account 1:
   DATA ISOLATION IS BROKEN! Stop and debug!
```

### Step 5: Add Sample Data

**Add Teachers:**
```
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
```

**Add Subjects:**
```
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
```

**Add Students:**
```
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
```

### Step 6: Account 2 Summary

**Data Count Check:**
```
✓ Teachers: 2 (NOT 3!)
✓ Subjects: 2 (DIFFERENT from Account 1!)
✓ Students: 2 (NO overlap with Clients!)
✓ Bookings: 0 (independent)
```

**✅ LOGOUT NOW**

---

## 📝 Test Account 3: Fitness Gym

### Step 1: Sign Up

```
Business Name: Iron Paradise
Email: gym@test.com
Password: test123

✓ Sign Up
```

### Step 2: Complete Onboarding

```
Business Type: Fitness & Training 💪
Terminology: Trainers, Programs, Members, Sessions
Categories: Weight Loss, Muscle Building, CrossFit, Cardio
```

### Step 3: Verify Sidebar

```
✓ Members        ← (NOT "Clients" or "Students"!)
✓ Trainers       ← (NOT "Staff" or "Teachers"!)
✓ Programs       ← (NOT "Treatments" or "Subjects"!)
```

### Step 4: Add Sample Data

```
Add 2 Trainers:
- John Doe (CrossFit Trainer)
- Sarah Smith (Yoga Instructor)

Add 2 Programs:
- Weight Loss Program (30 min, Rp 300,000)
- Muscle Building (60 min, Rp 500,000)

Add 2 Members:
- Mike Wilson
- Anna Taylor
```

### Step 5: Account 3 Summary

```
✓ Trainers: 2 (independent)
✓ Programs: 2 (independent)
✓ Members: 2 (independent)
✓ NO data from Account 1 or 2!
```

---

## ✅ Final Verification Tests

### Test 1: Cross-Login Verification

```
1. Login as: clinic@test.com
   ✓ Check sidebar: "Clients", "Staff", "Treatments"
   ✓ Check data count: 3, 3, 3

2. Logout → Login as: tutor@test.com
   ✓ Check sidebar: "Students", "Teachers", "Subjects"
   ✓ Check data count: 2, 2, 2
   ✓ Verify NO "Siti Wijaya" visible!

3. Logout → Login as: gym@test.com
   ✓ Check sidebar: "Members", "Trainers", "Programs"
   ✓ Check data count: 2, 2, 2
   ✓ Verify NO data from other accounts!

4. Logout → Login as: clinic@test.com again
   ✓ Verify data STILL intact: 3, 3, 3
   ✓ Verify terminology STILL correct
```

### Test 2: API Response Check

```
1. Login as: clinic@test.com
2. Open DevTools → Network tab
3. Navigate to: Staff page
4. Find request: /api/staff
5. Check response body:
   ✓ Should contain: Siti, Ani, Dewi
   ✓ Should NOT contain: Budi (from Account 2)
   ✓ Should NOT contain: John (from Account 3)
```

### Test 3: Database Verification (Optional)

If you have MongoDB Compass:

```javascript
// Connect to database
// Check staff collection

db.staff.aggregate([
  { $group: { _id: "$ownerId", count: { $sum: 1 } } }
])

Expected output:
{
  _id: "user_id_1", // clinic@test.com
  count: 3
},
{
  _id: "user_id_2", // tutor@test.com
  count: 2
},
{
  _id: "user_id_3", // gym@test.com
  count: 2
}

Total: 7 documents, properly isolated!
```

---

## 🎯 Success Criteria Summary

Test is **SUCCESSFUL** if:

| Check | Expected | Status |
|-------|----------|--------|
| Onboarding wizard appears for new users | ✅ Yes | ⬜ |
| Each account has different terminology | ✅ Different | ⬜ |
| Account 1 sidebar shows "Clients/Staff/Treatments" | ✅ Yes | ⬜ |
| Account 2 sidebar shows "Students/Teachers/Subjects" | ✅ Yes | ⬜ |
| Account 3 sidebar shows "Members/Trainers/Programs" | ✅ Yes | ⬜ |
| Data completely isolated (no overlap) | ✅ 100% | ⬜ |
| Cannot see other accounts' data | ✅ Never | ⬜ |
| Terminology persists after logout/login | ✅ Yes | ⬜ |
| API responses filtered by ownerId | ✅ Yes | ⬜ |
| Total database: 7+7+7 = 21 records | ✅ Yes | ⬜ |

---

## 🐛 Troubleshooting

### Problem: Onboarding not showing

**Solution:**
```
1. Clear browser cache
2. Logout completely
3. Login again
4. Or manually go to: /settings
```

### Problem: Wrong terminology in sidebar

**Solution:**
```
1. Hard refresh: Ctrl+Shift+R
2. Check API: /api/settings/terminology
3. Verify response has correct data
4. Clear localStorage and login again
```

### Problem: Can see other user's data

**🚨 CRITICAL BUG!**

**Debug steps:**
```
1. Open DevTools → Network tab
2. Check API request headers
3. Verify JWT token present
4. Check API response
5. Verify ownerId in query
6. Report immediately!
```

---

## 📊 Expected Final Database State

```
Users Collection:
- clinic@test.com (ownerId: xxx-111)
- tutor@test.com (ownerId: xxx-222)
- gym@test.com (ownerId: xxx-333)

Staff Collection: (7 total)
- 3 with ownerId: xxx-111 (Beauty Clinic)
- 2 with ownerId: xxx-222 (Tutoring)
- 2 with ownerId: xxx-333 (Fitness)

Treatments Collection: (7 total)
- 3 with ownerId: xxx-111
- 2 with ownerId: xxx-222
- 2 with ownerId: xxx-333

Patients Collection: (7 total)
- 3 with ownerId: xxx-111
- 2 with ownerId: xxx-222
- 2 with ownerId: xxx-333

TenantSettings Collection: (3 total)
- 1 for xxx-111 (Beauty terminology)
- 1 for xxx-222 (Education terminology)
- 1 for xxx-333 (Fitness terminology)
```

---

## ✅ Test Completion Checklist

- [ ] Account 1 (Beauty Clinic) created and setup complete
- [ ] Account 1 has 3 staff, 3 treatments, 3 clients
- [ ] Account 1 sidebar shows correct terminology
- [ ] Account 2 (Tutoring) created and setup complete
- [ ] Account 2 has 2 teachers, 2 subjects, 2 students
- [ ] Account 2 sidebar shows different terminology
- [ ] Account 2 sees ZERO data from Account 1
- [ ] Account 3 (Fitness) created and setup complete
- [ ] Account 3 has 2 trainers, 2 programs, 2 members
- [ ] Account 3 sees ZERO data from Account 1 & 2
- [ ] Cross-login test passed
- [ ] API response verification passed
- [ ] Terminology persistence verified
- [ ] All accounts remain independent

---

**🎉 If all checks pass: CONGRATULATIONS! Multi-tenant system is working perfectly!**

*Testing Guide v1.0 - January 2025*
# Smart Onboarding Detection

## Overview
Wizard onboarding sekarang memiliki smart detection yang hanya menampilkan wizard untuk user baru yang benar-benar membutuhkannya. Sistem akan mengecek data yang sudah ada dan menentukan apakah wizard perlu ditampilkan atau tidak.

## Logika Smart Detection

### Skenario 1: User Baru (Belum Ada Data)
**Kondisi:** Belum ada outlets, users, services, staff
**Aksi:** Tampilkan wizard mulai dari Step 1 (Outlet Management)

### Skenario 2: Sudah Ada Outlet
**Kondisi:** Ada minimal 1 outlet, tapi belum ada users
**Aksi:** Tampilkan wizard mulai dari Step 2 (User Management)

### Skenario 3: Sudah Ada Outlet + User
**Kondisi:** Ada minimal 1 outlet dan 1 user, tapi belum ada services
**Aksi:** Tampilkan wizard mulai dari Step 3 (Products/Services)

### Skenario 4: Sudah Ada Outlet + User + Services
**Kondisi:** Ada minimal 1 outlet, user, dan service, tapi belum ada staff
**Aksi:** Tampilkan wizard mulai dari Step 4 (Staff + Availability)

### Skenario 5: User Lama (Semua Data Lengkap)
**Kondisi:** Ada minimal 1 dari setiap: outlet, user, service, dan staff
**Aksi:**
- Tidak tampilkan wizard sama sekali
- Auto-mark `operationalOnboardingCompleted = true`
- User langsung masuk ke dashboard tanpa interupsi

## Implementasi

### File: `components/operational-onboarding-provider.tsx`

#### Check Flow:
```typescript
1. Check jika user adalah tenant_admin
   └─ Jika bukan → Skip semua, tidak perlu wizard

2. Check operationalOnboardingCompleted flag
   └─ Jika true → Skip, wizard tidak perlu ditampilkan

3. Check existing data (parallel requests):
   ├─ GET /api/outlets?page=1&size=1
   ├─ GET /api/users?page=1&size=1
   ├─ GET /api/services?page=1&size=1
   └─ GET /api/staff?page=1&size=1

4. Tentukan needsOnboarding & startStep:

   IF no outlets:
      needsOnboarding = true
      startStep = 1

   ELSE IF no users:
      needsOnboarding = true
      startStep = 2

   ELSE IF no services:
      needsOnboarding = true
      startStep = 3

   ELSE IF no staff:
      needsOnboarding = true
      startStep = 4

   ELSE (all data exists):
      needsOnboarding = false
      Auto POST /api/settings/operational-onboarding
         { operationalOnboardingCompleted: true }

5. Tampilkan wizard dengan initialStep jika needsOnboarding = true
```

### Updated Components

#### 1. OperationalOnboardingProvider
**File:** `components/operational-onboarding-provider.tsx`
**Changes:**
- Tambah logic untuk check existing data
- Tentukan `initialStep` berdasarkan data yang kurang
- Auto-complete jika semua data sudah ada

#### 2. OperationalOnboardingWizard
**File:** `components/operational-onboarding-wizard.tsx`
**Changes:**
- Tambah prop `initialStep?: number`
- Set currentStep ke initialStep saat mount
- Support starting from any step (1-4)

#### 3. OnboardingResumeBanner
**File:** `components/onboarding-resume-banner.tsx`
**Changes:**
- Hanya muncul jika ada localStorage progress incomplete
- Check `currentStep > 1` untuk memastikan user sudah mulai
- Tidak muncul jika semua data lengkap

## Benefits

### 1. Better UX untuk User Lama
- Tidak ada interupsi wizard untuk user yang sudah setup
- Langsung masuk ke dashboard
- Tidak perlu klik skip atau close

### 2. Smart Resume untuk User Baru
- Jika user berhenti di tengah, wizard resume dari step terakhir
- Tidak perlu ulang dari awal
- Save waktu user

### 3. Flexible untuk Migrasi
- User yang migrasi dari sistem lain dengan data existing tidak perlu wizard
- Auto-detect data existing dan skip wizard

### 4. Reduced Support Tickets
- User tidak bingung kenapa wizard muncul terus
- Clear expectation tentang apa yang perlu dilengkapi

## Testing Scenarios

### Test Case 1: Brand New User
**Setup:**
- Fresh tenant_admin account
- Belum ada data apapun

**Expected:**
- Wizard muncul saat login
- Start dari Step 1 (Outlet)
- Progress tracker menunjukkan 0/4

**Steps:**
1. Login as new tenant_admin
2. Verify wizard appears
3. Verify step = 1
4. Complete Step 1
5. Verify next shows Step 2

---

### Test Case 2: Partial Setup (Has Outlets Only)
**Setup:**
- User sudah buat 1 outlet via API atau manual
- Belum ada users, services, staff

**Expected:**
- Wizard muncul saat login
- Start dari Step 2 (User Management)
- Step 1 (Outlet) ter-skip

**Steps:**
1. Create 1 outlet via API
2. Login as tenant_admin
3. Verify wizard appears
4. Verify step = 2
5. Back button disabled atau skip ke step 1

---

### Test Case 3: Has Outlets + Users
**Setup:**
- User sudah buat outlet dan user
- Belum ada services dan staff

**Expected:**
- Wizard muncul
- Start dari Step 3 (Products/Services)

**Steps:**
1. Create outlets and users via API
2. Login as tenant_admin
3. Verify wizard appears
4. Verify step = 3

---

### Test Case 4: Has Outlets + Users + Services
**Setup:**
- User sudah ada outlet, user, dan services
- Belum ada staff

**Expected:**
- Wizard muncul
- Start dari Step 4 (Staff + Availability)

**Steps:**
1. Create outlets, users, services via API
2. Login as tenant_admin
3. Verify wizard appears
4. Verify step = 4

---

### Test Case 5: Complete Setup (Old User)
**Setup:**
- User sudah ada semua: outlet, user, service, staff

**Expected:**
- Wizard TIDAK muncul
- Auto-marked as completed
- Banner TIDAK muncul
- Langsung ke dashboard

**Steps:**
1. Create complete data via API (outlets, users, services, staff)
2. Login as tenant_admin
3. Verify wizard does NOT appear
4. Verify dashboard loads normally
5. Verify banner does NOT appear
6. Check API: operationalOnboardingCompleted = true

---

### Test Case 6: Non-Admin User
**Setup:**
- User dengan role staff atau manager
- Belum ada data apapun

**Expected:**
- Wizard TIDAK pernah muncul
- Tidak perlu onboarding

**Steps:**
1. Login as staff/manager
2. Verify wizard does NOT appear
3. Verify no onboarding checks run

---

### Test Case 7: Resume Wizard
**Setup:**
- User mulai wizard, complete Step 1 & 2
- Logout atau close browser
- Login kembali

**Expected:**
- Banner resume muncul di dashboard
- Progress bar menunjukkan 50% (2/4)
- Click "Lanjutkan" → Resume dari Step 3

**Steps:**
1. Start wizard, complete 2 steps
2. Logout
3. Login again
4. Verify banner appears
5. Click "Lanjutkan Setup"
6. Verify wizard opens at correct step

---

### Test Case 8: Dismiss Banner
**Setup:**
- Banner resume muncul
- User klik dismiss (X)

**Expected:**
- Banner hilang untuk session ini
- Refresh page → Banner muncul lagi
- New tab → Banner muncul lagi

**Steps:**
1. Show resume banner
2. Click X to dismiss
3. Verify banner disappears
4. Refresh page
5. Verify banner appears again

---

## API Endpoints Used

### 1. Check Onboarding Status
```
GET /api/settings/operational-onboarding
Response:
{
  "operationalOnboardingCompleted": boolean,
  "completedAt": string | null
}
```

### 2. Check Existing Data
```
GET /api/outlets?page=1&size=1
GET /api/users?page=1&size=1
GET /api/services?page=1&size=1
GET /api/staff?page=1&size=1

Response format:
{
  "items": [...],
  "total": number,
  "page": number,
  "size": number
}
```

### 3. Mark as Completed
```
POST /api/settings/operational-onboarding
Body:
{
  "operationalOnboardingCompleted": true,
  "completedAt": "2025-01-01T00:00:00Z"
}
```

## Performance Considerations

### Parallel Requests
Semua check data dilakukan parallel menggunakan `Promise.all()`:
```typescript
const [outletsRes, usersRes, servicesRes, staffRes] = await Promise.all([
  fetch('/api/outlets?page=1&size=1'),
  fetch('/api/users?page=1&size=1'),
  fetch('/api/services?page=1&size=1'),
  fetch('/api/staff?page=1&size=1'),
])
```

### Pagination Optimization
Hanya fetch 1 item per endpoint untuk check existence:
- `page=1&size=1`
- Reduce payload size
- Faster response time

### Caching
Auto-mark completion saat semua data ada:
- Prevent repeated checks on subsequent logins
- One-time auto-complete

## Edge Cases Handled

### 1. API Error
Jika salah satu API call gagal:
- Gracefully continue checking
- Assume data tidak ada (safe fallback)
- User tetap bisa akses wizard

### 2. Network Timeout
- Loading state tetap berjalan
- User tidak stuck di loading screen
- After timeout, render children normally

### 3. Partial Data Loss
Jika localStorage corrupt:
- Parse error di-catch
- Fallback ke default behavior
- No crash, wizard tetap bisa berjalan

### 4. Race Condition
Multiple tabs/windows:
- Each uses independent localStorage
- Completion marked globally via API
- Safe for concurrent access

## Future Enhancements

### Phase 2
- Analytics: Track which steps users drop off
- Email reminder: Jika user stuck di tengah
- Skip option: Untuk power users dengan custom setup
- Import wizard: Bulk import dari CSV/Excel

### Phase 3
- Multi-tenant setup: Setup multiple outlets at once
- Template library: Pre-filled data berdasarkan industry
- Video tutorials: Inline help per step
- AI assistant: Smart suggestions based on business type

## Troubleshooting

### Wizard Tidak Muncul Padahal Seharusnya
**Debug Steps:**
1. Check console logs untuk API responses
2. Verify user.role atau user.access_type
3. Check `/api/settings/operational-onboarding` response
4. Verify API endpoints return correct data structure
5. Check browser localStorage for saved progress

### Wizard Muncul Terus Menerus
**Possible Causes:**
1. `operationalOnboardingCompleted` tidak tersave
2. API `/api/settings/operational-onboarding` error
3. Backend tidak persist flag correctly

**Debug Steps:**
1. Check Network tab untuk POST request
2. Verify backend save logic
3. Check database for tenant settings

### Banner Tidak Hilang Setelah Completion
**Possible Causes:**
1. localStorage tidak cleared
2. `progress.isCompleted` tidak di-update

**Fix:**
1. Clear localStorage manually: `localStorage.removeItem('operational-onboarding-progress')`
2. Verify `completeOnboarding()` function calls API
3. Check reload after completion

## Summary

Smart detection memastikan:
- User baru mendapat guidance lengkap
- User lama tidak terganggu
- Setup fleksibel dan cepat
- UX yang smooth dan intuitif

Wizard hanya muncul saat benar-benar dibutuhkan, dengan starting point yang optimal berdasarkan data existing.

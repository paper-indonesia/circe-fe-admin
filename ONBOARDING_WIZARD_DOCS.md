# Operational Onboarding Wizard - Dokumentasi

## Tujuan
Wizard onboarding 4 langkah yang memandu tenant admin menambahkan data awal secara lengkap agar sistem siap melakukan booking.

## Target User
- Hanya untuk user dengan role `tenant_admin`
- Ditampilkan saat first login atau jika operational onboarding belum selesai

## Struktur File

### Core Components

#### 1. Context & State Management
**File:** `lib/operational-onboarding-context.tsx`
- Manage state onboarding progress
- Auto-save ke localStorage
- Fungsi: addOutlet, addUser, addProduct, addStaff, addAvailability
- Track completion status

#### 2. Wizard Component
**File:** `components/operational-onboarding-wizard.tsx`
- Main wizard dengan 4 steps
- Progress tracker visual
- Navigation (Next/Back)
- Validation per step

#### 3. Step Components
**File:** `components/onboarding-steps/`
- `outlet-setup.tsx` - Step 1: Outlet Management
- `user-management.tsx` - Step 2: User Management
- `product-services.tsx` - Step 3: Products/Services
- `staff-availability.tsx` - Step 4: Staff + Availability

#### 4. Provider & Banner
**File:** `components/operational-onboarding-provider.tsx`
- Check onboarding status on mount
- Trigger wizard untuk tenant_admin
- Auto-show jika belum selesai

**File:** `components/onboarding-resume-banner.tsx`
- Banner untuk resume onboarding
- Progress indicator
- Dismiss functionality

### API Endpoints

#### Operational Onboarding Status
**File:** `app/api/settings/operational-onboarding/route.ts`
- GET: Check completion status
- POST: Mark as completed

Response format:
```json
{
  "operationalOnboardingCompleted": boolean,
  "completedAt": string | null
}
```

### Integration Points

#### 1. Global Providers
**File:** `components/providers.tsx`
```tsx
<OnboardingProvider>
  <OperationalOnboardingProvider>
    {children}
  </OperationalOnboardingProvider>
</OnboardingProvider>
```

#### 2. Dashboard Integration
**File:** `app/dashboard/page.tsx`
- Banner resume onboarding untuk tenant_admin
- Manual trigger wizard dari banner

## Alur 4 Langkah

### Step 1: Outlet Management
**Requirement:** Minimal 1 outlet
**Data:**
- Nama outlet
- Alamat
- Nomor telepon
- Zona waktu (WIB/WITA/WIT)

**Validasi:**
- Semua field wajib diisi
- Format telepon valid
- Check plan limits (max outlets)

**API:** `POST /api/outlets`

### Step 2: User Management
**Requirement:** Minimal 1 user internal
**Data:**
- Nama depan & belakang
- Email & password
- Nomor telepon (opsional)
- Role (staff/manager/receptionist)

**Validasi:**
- Email format valid
- Password minimal 6 karakter
- Check plan limits (max users)

**API:** `POST /api/users`

### Step 3: Products/Services
**Requirement:** Minimal 1 layanan
**Data:**
- Nama layanan
- Durasi (menit)
- Harga (IDR)
- Kategori
- Deskripsi (opsional)

**Validasi:**
- Nama wajib diisi
- Durasi > 0
- Harga > 0
- Check plan limits (max services)

**API:** `POST /api/services`

### Step 4: Staff + Availability
**Requirement:** Minimal 1 staff dengan 1 jadwal ketersediaan

#### Sub-step: Add Staff
**Data:**
- Nama depan & belakang
- Email & telepon
- Posisi/position
- Layanan yang dikuasai (mapping ke products)

**API:** `POST /api/staff`

#### Sub-step: Set Availability
**Data:**
- Staff (dropdown dari staff yang ditambahkan)
- Outlet (auto-selected dari step 1)
- Jam mulai & selesai
- Hari kerja (multiple selection)
- Recurrence type: weekly

**API:** `POST /api/availability`

**Validasi:**
- Staff wajib dipilih
- Minimal 1 hari kerja

## Features

### Plan Limits Validation
- Realtime check dari `/api/subscription` dan `/api/subscription/usage`
- Display current usage vs max limit
- Disable form jika limit tercapai
- Link ke upgrade plan

### Auto-save Progress
- Save ke localStorage setiap perubahan
- Resume dari step terakhir jika user keluar
- Clear localStorage setelah completion

### Resume Banner
- Muncul di dashboard jika ada progress tapi belum selesai
- Progress bar visual
- Dismiss per session (sessionStorage)
- Actionable message berdasarkan step

### Info Panels
Setiap step memiliki 2 panel:
1. **Apa yang harus dilakukan** - Instruksi clear
2. **Kenapa ini penting** - Value proposition

### UX Features
- Progress indicator 4 steps di header
- Empty state informatif
- Validasi field-level realtime
- Loading states pada submit
- Toast notifications untuk success/error
- Tidak ada skip, back diperbolehkan
- Wizard modal (full screen on mobile)

## Completion Flow

### Saat Semua Step Selesai:
1. User klik "Selesai" di step 4
2. Call `completeOnboarding()` → POST `/api/settings/operational-onboarding`
3. Save `operationalOnboardingCompleted: true`
4. Clear localStorage progress
5. Reload page
6. Wizard tidak muncul lagi

### Success State:
- Toast notification success
- Redirect atau reload untuk refresh data
- Banner tidak muncul lagi

## Styling & Design

### Colors & Spacing
- Blue: Primary actions, info panels
- Purple: Important info
- Green: Success states
- Orange: Warnings
- Red: Errors, limits exceeded

### Responsiveness
- Desktop: 6xl modal width
- Mobile: Full screen, scroll content
- Footer sticky dengan tombol utama
- Content max-height dengan scroll

### Accessibility
- Keyboard navigation
- ARIA labels
- Clear focus states
- High contrast text

## Testing Checklist

### Functional
- [ ] Wizard muncul untuk tenant_admin baru
- [ ] Wizard tidak muncul untuk non-admin
- [ ] Wizard tidak muncul jika sudah completed
- [ ] Semua 4 steps dapat diselesaikan
- [ ] Validasi form berfungsi
- [ ] Plan limits dicek realtime
- [ ] Data tersimpan ke backend
- [ ] Progress tersave ke localStorage
- [ ] Resume dari step terakhir
- [ ] Banner muncul jika ada progress
- [ ] Completion menandai onboarding selesai

### UI/UX
- [ ] Progress tracker update correct
- [ ] Next button hanya aktif jika valid
- [ ] Back button berfungsi
- [ ] Loading states muncul saat submit
- [ ] Toast notifications muncul
- [ ] Empty states informatif
- [ ] Plan limit warning muncul
- [ ] Upgrade link berfungsi
- [ ] Responsif di mobile
- [ ] Tidak ada text terpotong

### Edge Cases
- [ ] Handle API errors gracefully
- [ ] Handle plan limit exceeded
- [ ] Handle duplicate entries
- [ ] Handle session timeout
- [ ] Handle browser refresh
- [ ] Handle network errors

## Troubleshooting

### Wizard Tidak Muncul
1. Check user role: `user.role === 'tenant_admin'` atau `user.access_type === 'tenant_admin'`
2. Check API response: `/api/settings/operational-onboarding`
3. Check localStorage: `operational-onboarding-progress`
4. Check providers hierarchy di `components/providers.tsx`

### Data Tidak Tersimpan
1. Check network tab untuk API calls
2. Verify auth token di cookies
3. Check backend validation errors
4. Verify tenant_id tersedia

### Banner Tidak Muncul
1. Check ada progress di localStorage
2. Check `operationalOnboardingCompleted === false`
3. Check sessionStorage dismiss flag
4. Verify user adalah tenant_admin

## Future Enhancements

### Phase 2 (Optional)
- Import data dari CSV/Excel
- Template setup untuk berbagai bisnis
- Video tutorial per step
- Skip untuk demo/testing mode
- Wizard analytics tracking
- Email notification saat stuck
- Chatbot assistance
- Multi-language support

## Files Summary

### Created Files
1. `lib/operational-onboarding-context.tsx` - State management
2. `components/operational-onboarding-wizard.tsx` - Main wizard
3. `components/operational-onboarding-provider.tsx` - Provider logic
4. `components/onboarding-resume-banner.tsx` - Resume banner
5. `components/onboarding-steps/outlet-setup.tsx` - Step 1
6. `components/onboarding-steps/user-management.tsx` - Step 2
7. `components/onboarding-steps/product-services.tsx` - Step 3
8. `components/onboarding-steps/staff-availability.tsx` - Step 4
9. `app/api/settings/operational-onboarding/route.ts` - API endpoint

### Modified Files
1. `components/providers.tsx` - Added providers
2. `app/dashboard/page.tsx` - Added banner & wizard trigger

## Dependencies
- React hooks (useState, useEffect, useMemo)
- Next.js App Router
- Framer Motion (animations)
- Shadcn UI components
- date-fns (date formatting)
- Lucide icons

## API Dependencies
- `/api/outlets` - Outlet CRUD
- `/api/users` - User CRUD
- `/api/services` - Products/Services CRUD
- `/api/staff` - Staff CRUD
- `/api/availability` - Availability CRUD
- `/api/subscription` - Plan info
- `/api/subscription/usage` - Usage limits
- `/api/settings/operational-onboarding` - Completion status

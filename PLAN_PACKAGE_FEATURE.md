# Package/Bundle Feature Implementation Plan

## Overview
Implementasi fitur Bundle/Package untuk Admin Dashboard Reserva berdasarkan dokumentasi:
- `package_management.md` - Admin membuat package
- `staff_customer_package_management.md` - Staff mengelola transaksi package customer
- `customer_package_management.md` - Customer membeli package
- `package_credit_redemption.md` - Penggunaan credits untuk appointment

---

## Phase 1: Package Management (Admin)
**Tujuan:** Admin dapat CRUD packages/bundles

### 1.1 TypeScript Types
**File:** `lib/types.ts`
```typescript
// Package Item (service dalam package)
interface PackageItem {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

// Package utama
interface Package {
  id: string
  tenant_id: string
  name: string
  description?: string
  package_items: PackageItem[]
  package_price: number
  currency: string
  validity_days?: number | null
  is_active: boolean
  status: 'active' | 'inactive' | 'archived'
  outlet_ids: string[]
  total_individual_price: number
  discount_amount: number
  discount_percentage: number
  total_purchased: number
  active_credits_count: number
  total_revenue: number
  created_at: string
  updated_at: string
}

// Subscription limits
interface PackageLimits {
  packages_enabled: boolean
  max_packages: number
  current_packages: number
  remaining_packages: number
  max_package_items: number
  limit_reached: boolean
}
```

### 1.2 API Routes
**Files to create:**
- `app/api/packages/route.ts` - GET (list), POST (create)
- `app/api/packages/limits/route.ts` - GET limits
- `app/api/packages/[id]/route.ts` - GET, PATCH, DELETE

### 1.3 API Client Methods
**File:** `lib/api-client.ts`
- `getPackages(params)` - List packages dengan filter
- `getPackageLimits()` - Get subscription limits
- `getPackage(id)` - Get detail package
- `createPackage(data)` - Create new package
- `updatePackage(id, data)` - Update package
- `deletePackage(id)` - Archive package (soft delete)

### 1.4 Page Component
**File:** `app/packages/page.tsx`
- Loading state dengan GradientLoading
- Empty state dengan EmptyState component
- Table view dengan pagination
- Search & filter (status, is_active)
- Subscription limit banner
- Stats summary cards

### 1.5 Dialog Components
**Files:**
- `components/packages/package-form-dialog.tsx` - Add/Edit form dengan multi-step tabs
- `components/packages/service-selector.tsx` - Select services untuk package
- `components/packages/discount-calculator.tsx` - Real-time discount preview

### 1.6 Navigation
**File:** `components/layout/sidebar.tsx`
- Add "Packages" menu item di group "Business"

---

## Phase 2: Staff Customer Package Management
**Tujuan:** Staff dapat mengelola pembelian package customer

### 2.1 Additional Types
```typescript
// Customer Package (purchased)
interface CustomerPackage {
  id: string
  tenant_id: string
  customer_id: string
  package_id: string
  outlet_id: string
  payment_method: 'manual_onspot' | 'paper_digital' | 'bank_transfer'
  payment_status: 'pending' | 'paid' | 'failed'
  amount_paid: number
  currency: string
  package_name: string
  validity_days: number
  purchased_at: string
  expires_at: string
  payment_confirmed_at?: string
  status: 'active' | 'pending_payment' | 'depleted' | 'expired'
  total_credits: number
  used_credits: number
  remaining_credits: number
  expired_credits: number
  notes?: string
  package_details: Package
  credits_details: CustomerCredit[]
  days_until_expiry: number
  is_expiring_soon: boolean
}

// Customer Credit
interface CustomerCredit {
  id: string
  customer_package_id: string
  service_id: string
  service_name: string
  allocated_credits: number
  used_credits: number
  remaining_credits: number
  expires_at: string
  is_expired: boolean
}

// Credit Summary
interface CreditSummary {
  total_packages: number
  active_packages: number
  total_credits: number
  used_credits: number
  remaining_credits: number
  expired_credits: number
  expiring_soon: number
}
```

### 2.2 API Routes
- `app/api/staff/customer-packages/route.ts` - POST (create purchase)
- `app/api/staff/customer-packages/[customer_id]/credits/route.ts` - GET credits
- `app/api/staff/customer-packages/[customer_id]/summary/route.ts` - GET summary
- `app/api/staff/customer-packages/credits/redeem/route.ts` - POST redeem

### 2.3 Components
- `components/packages/customer-credit-lookup.tsx` - Search & view customer credits
- `components/packages/sell-package-dialog.tsx` - Staff sells package to customer
- `components/packages/redeem-credit-dialog.tsx` - Manual credit redemption

### 2.4 Integration Points
- Di halaman Customers: Tab "Packages" untuk lihat customer packages
- Di halaman Calendar/Walk-in: Option untuk sell package

---

## Phase 3: Customer Package Browsing & Purchase
**Tujuan:** Customer dapat browse dan beli packages (Customer Portal)

### 3.1 API Routes (Customer Portal endpoints)
- `app/api/customer/packages/browse/route.ts` - GET available packages
- `app/api/customer/packages/purchase/route.ts` - POST purchase
- `app/api/customer/packages/route.ts` - GET my packages
- `app/api/customer/packages/credits/available/route.ts` - GET available credits

### 3.2 Components (untuk Customer Portal)
- Package catalog/browse view
- Package purchase flow
- My packages view dengan credit tracking

**Note:** Customer Portal mungkin di repo terpisah, fokus dulu di Admin Dashboard

---

## Phase 4: Credit Redemption for Appointments
**Tujuan:** Credits bisa dipakai untuk bayar appointments

### 4.1 Modify Appointment Creation
- Add `credit_redeemed` boolean field
- Add `customer_package_id` field
- Add `credit_id` field (returned after redemption)
- Payment status auto PAID when using credit

### 4.2 Components
- Credit option di appointment booking form
- Credit availability indicator
- Refund handling for cancelled appointments

---

## Implementation Order

### Sprint 1: Package Management (Admin) - Core
1. [ ] Add TypeScript types to `lib/types.ts`
2. [ ] Create API routes untuk packages
3. [ ] Add API client methods
4. [ ] Create packages page dengan table view
5. [ ] Create add/edit package dialog
6. [ ] Create service selector component
7. [ ] Add navigation menu item
8. [ ] Test: CRUD packages

### Sprint 2: Package Management (Admin) - Enhanced
1. [ ] Add subscription limit banner
2. [ ] Add stats summary cards
3. [ ] Add pagination & filters
4. [ ] Add discount calculator preview
5. [ ] Test: Limits enforcement, UI/UX

### Sprint 3: Staff Customer Package Management
1. [ ] Add customer package types
2. [ ] Create staff API routes
3. [ ] Create customer credit lookup component
4. [ ] Create sell package dialog
5. [ ] Create redeem credit dialog
6. [ ] Integrate dengan customer page
7. [ ] Test: Full staff workflow

### Sprint 4: Credit Redemption
1. [ ] Modify appointment creation API
2. [ ] Add credit option in booking form
3. [ ] Handle credit refund on cancellation
4. [ ] Test: Complete booking with credits

---

## File Structure (Final)

```
app/
├── packages/
│   ├── page.tsx
│   └── loading.tsx
├── api/
│   ├── packages/
│   │   ├── route.ts
│   │   ├── limits/
│   │   │   └── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   └── staff/
│       └── customer-packages/
│           ├── route.ts
│           ├── [customer_id]/
│           │   ├── credits/
│           │   │   └── route.ts
│           │   └── summary/
│           │       └── route.ts
│           └── credits/
│               └── redeem/
│                   └── route.ts

components/
└── packages/
    ├── package-form-dialog.tsx
    ├── service-selector.tsx
    ├── discount-calculator.tsx
    ├── subscription-limit-banner.tsx
    ├── package-stats-card.tsx
    ├── customer-credit-lookup.tsx
    ├── sell-package-dialog.tsx
    └── redeem-credit-dialog.tsx

lib/
├── types.ts (updated)
└── api-client.ts (updated)
```

---

## Testing Checklist

### Package Management
- [ ] Create package dengan multiple services
- [ ] Edit package (name, price, validity)
- [ ] Archive package (soft delete)
- [ ] Verify discount calculation
- [ ] Verify subscription limits enforced
- [ ] Verify service validation (must exist, be active)

### Staff Customer Package
- [ ] Create purchase for customer (manual_onspot)
- [ ] View customer credits
- [ ] View customer credit summary
- [ ] Redeem credit manually
- [ ] Verify FIFO ordering

### Credit Redemption
- [ ] Book appointment with credit
- [ ] Verify payment_status = PAID
- [ ] Cancel appointment with credit refund
- [ ] Verify credit restored

---

## Notes

1. **Backend API sudah ready** - Semua endpoint sudah ada di FastAPI backend
2. **Focus Admin Dashboard first** - Customer Portal bisa dikerjakan nanti
3. **Consistent dengan existing patterns** - Follow products page pattern
4. **Use existing components** - Dialog, Table, Badge, EmptyState, DeleteEntityDialog

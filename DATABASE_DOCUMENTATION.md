# Beauty Clinic App - Database Documentation

## Overview

This database uses MongoDB for a multi-tenant beauty clinic management system. Each tenant (clinic) has isolated data using `tenantId` as the partition key.

**Database Name:** `paper-circe`  
**Database Type:** MongoDB  
**Architecture:** Multi-tenant with tenant isolation  

## Collections

### 1. `tenants` Collection

**Purpose:** Stores basic information about each clinic/tenant using the system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key (auto-generated) |
| `name` | String | ✅ | Clinic name |
| `slug` | String | ✅ | Unique identifier for URL (e.g., 'jakarta', 'bali') |
| `domain` | String | ❌ | Custom domain for tenant (optional) |
| `config` | Object | ❌ | Tenant configuration |
| `config.logo` | String | ❌ | Clinic logo URL |
| `config.theme` | Object | ❌ | Clinic color theme |
| `config.theme.primaryColor` | String | ❌ | Primary color (default: '#8B5CF6') |
| `config.theme.secondaryColor` | String | ❌ | Secondary color (default: '#EC4899') |
| `config.features` | Object | ❌ | Tenant feature limits |
| `config.features.maxUsers` | Number | ❌ | Maximum users (default: 100) |
| `config.features.maxBookings` | Number | ❌ | Maximum bookings (default: 1000) |
| `isActive` | Boolean | ❌ | Tenant active status (default: true) |
| `createdBy` | String | ✅ | User ID who created the tenant |
| `createdAt` | Date | ✅ | Creation timestamp |
| `updatedAt` | Date | ✅ | Last update timestamp |

**Indexes:**
- `slug` (unique)
- `isActive`

**Static Methods:**
- `findActive()`: Find all active tenants
- `findBySlug(slug)`: Find tenant by slug

---

### 2. `users` Collection

**Purpose:** Stores user data who can login to the system (admin, staff, etc.).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key |
| `email` | String | ✅ | Email user (unique per tenant) |
| `password` | String | ✅ | Password ter-hash |
| `name` | String | ✅ | Nama lengkap user |
| `role` | Enum | ❌ | Role: 'admin', 'staff', 'user', 'platform_admin' |
| `tenantId` | String | ✅ | Tenant ID (data isolation) |
| `isActive` | Boolean | ❌ | Status aktif user (default: true) |
| `createdAt` | Date | ✅ | Timestamp pembuatan |
| `updatedAt` | Date | ✅ | Timestamp update terakhir |

**Indexes:**
- `{ email: 1, tenantId: 1 }` (unique compound)
- `tenantId`

**Static Methods:**
- `findByTenant(tenantId)`: Mencari user berdasarkan tenant
- `findByEmailAndTenant(email, tenantId)`: Mencari user spesifik

---

### 3. `patients` Collection

**Purpose:** Menyimpan data pelanggan/pasien klinik.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key |
| `tenantId` | String | ✅ | Tenant ID (data isolation) |
| `name` | String | ✅ | Nama lengkap pasien |
| `phone` | String | ✅ | Nomor telepon (unique per tenant) |
| `email` | String | ❌ | Email pasien |
| `notes` | String | ❌ | Catatan khusus/alergi pasien |
| `lastVisitAt` | Date | ❌ | Tanggal kunjungan terakhir |
| `totalVisits` | Number | ❌ | Total kunjungan (default: 0) |
| `createdAt` | Date | ✅ | Timestamp pembuatan |
| `updatedAt` | Date | ✅ | Timestamp update terakhir |

**Indexes:**
- `{ tenantId: 1, phone: 1 }` (unique compound)
- `{ tenantId: 1, email: 1 }` (sparse)
- `{ tenantId: 1, createdAt: -1 }`

**Instance Methods:**
- `incrementVisits()`: Menambah counter kunjungan

**Static Methods:**
- `findByTenant(tenantId)`: Mencari pasien berdasarkan tenant
- `findByTenantAndPhone(tenantId, phone)`: Mencari pasien spesifik

---

### 4. `staff` Collection

**Purpose:** Menyimpan data staff/karyawan klinik yang dapat melakukan treatment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key |
| `tenantId` | String | ✅ | Tenant ID (data isolation) |
| `name` | String | ✅ | Nama lengkap staff |
| `role` | String | ✅ | Jabatan (e.g., 'Therapist', 'Doctor') |
| `skills` | Array[String] | ❌ | Keahlian staff |
| `workingHours` | Array[String] | ❌ | Jam kerja staff |
| `rating` | Number | ❌ | Rating staff (0-5, default: 0) |
| `avatar` | String | ❌ | URL foto staff |
| `isActive` | Boolean | ❌ | Status aktif (default: true) |
| `createdAt` | Date | ✅ | Timestamp pembuatan |
| `updatedAt` | Date | ✅ | Timestamp update terakhir |

**Indexes:**
- `{ tenantId: 1, isActive: 1 }`
- `{ tenantId: 1, role: 1 }`
- `{ tenantId: 1, rating: -1 }`

**Static Methods:**
- `findByTenant(tenantId)`: Mencari staff aktif berdasarkan tenant
- `findByTenantAndRole(tenantId, role)`: Mencari staff berdasarkan role
- `findByTenantAndSkill(tenantId, skill)`: Mencari staff berdasarkan keahlian

---

### 5. `treatments` Collection

**Purpose:** Menyimpan data layanan/treatment yang tersedia di klinik.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key |
| `tenantId` | String | ✅ | Tenant ID (data isolation) |
| `name` | String | ✅ | Nama treatment (unique per tenant) |
| `category` | String | ✅ | Kategori (e.g., 'Facial', 'Injection') |
| `durationMin` | Number | ✅ | Durasi dalam menit (15-480) |
| `price` | Number | ✅ | Harga treatment (≥ 0) |
| `description` | String | ❌ | Deskripsi treatment |
| `popularity` | Number | ❌ | Score popularitas (0-100, default: 0) |
| `assignedStaff` | Array[String] | ❌ | ID staff yang bisa melakukan treatment |
| `isActive` | Boolean | ❌ | Status aktif (default: true) |
| `createdAt` | Date | ✅ | Timestamp pembuatan |
| `updatedAt` | Date | ✅ | Timestamp update terakhir |

**Indexes:**
- `{ tenantId: 1, category: 1 }`
- `{ tenantId: 1, price: 1 }`
- `{ tenantId: 1, popularity: -1 }`
- `{ tenantId: 1, name: 1 }` (unique compound)

**Static Methods:**
- `findByTenant(tenantId)`: Mencari treatment aktif berdasarkan tenant
- `findByTenantAndCategory(tenantId, category)`: Filter berdasarkan kategori
- `findByTenantAndStaff(tenantId, staffId)`: Treatment yang bisa dilakukan staff

---

### 6. `bookings` Collection

**Purpose:** Menyimpan data booking/appointment pasien.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | Primary key |
| `tenantId` | String | ✅ | Tenant ID (data isolation) |
| `patientId` | String | ✅ | ID pasien (ref: patients) |
| `patientName` | String | ❌ | Cache nama pasien |
| `staffId` | String | ✅ | ID staff (ref: staff) |
| `treatmentId` | String | ✅ | ID treatment (ref: treatments) |
| `startAt` | Date | ✅ | Waktu mulai appointment |
| `endAt` | Date | ✅ | Waktu selesai appointment |
| `status` | Enum | ❌ | Status: 'pending', 'confirmed', 'completed', 'cancelled', 'no-show' |
| `source` | Enum | ✅ | Sumber booking: 'walk-in' atau 'online' |
| `paymentStatus` | Enum | ❌ | Status bayar: 'unpaid', 'deposit', 'paid' |
| `notes` | String | ❌ | Catatan booking |
| `queueNumber` | Number | ❌ | Nomor antrian (untuk walk-in) |
| `paymentMethod` | String | ❌ | Metode pembayaran |
| `paymentAmount` | Number | ❌ | Jumlah bayar (≥ 0) |
| `createdAt` | Date | ✅ | Timestamp pembuatan |
| `updatedAt` | Date | ✅ | Timestamp update terakhir |

**Indexes:**
- `{ tenantId: 1, startAt: 1 }`
- `{ tenantId: 1, staffId: 1, startAt: 1 }`
- `{ tenantId: 1, patientId: 1 }`
- `{ tenantId: 1, status: 1 }`
- `{ tenantId: 1, source: 1, createdAt: -1 }`
- `{ tenantId: 1, staffId: 1, startAt: 1, endAt: 1, status: 1 }` (unique, partial filter untuk prevent double booking)

**Instance Methods:**
- `confirm()`: Set status ke 'confirmed'
- `cancel()`: Set status ke 'cancelled'
- `complete()`: Set status ke 'completed' dan payment ke 'paid'

**Static Methods:**
- `findByTenant(tenantId)`: Mencari booking berdasarkan tenant
- `findByTenantAndDate(tenantId, date)`: Booking pada tanggal tertentu
- `findWalkInsByTenant(tenantId)`: Booking walk-in saja

---

## Database Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│   tenants   │
├─────────────┤
│ _id         │◄─────┐
│ name        │      │
│ slug        │      │
│ config      │      │
│ isActive    │      │
└─────────────┘      │
                     │
                ┌────┴──────┐
                │ tenantId  │ (Foreign Key)
                └───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌───▼───┐   ┌────▼─────┐
   │  users  │  │ staff │   │ patients │
   ├─────────┤  ├───────┤   ├──────────┤
   │ _id     │  │ _id   │◄──┤ _id      │
   │ email   │  │ name  │   │ name     │
   │ role    │  │ role  │   │ phone    │
   │tenantId │  │skills │   │ email    │
   └─────────┘  └───────┘   │tenantId  │
                            └──────────┘
        │            │            │
        │            │            │
        │       ┌────▼─────┐      │
        │       │treatments│      │
        │       ├──────────┤      │
        │       │ _id      │◄─┐   │
        │       │ name     │  │   │
        │       │ category │  │   │
        │       │ price    │  │   │
        │       │assignedStaff    │
        │       │tenantId  │  │   │
        │       └──────────┘  │   │
        │            │        │   │
        │            │        │   │
        └────────────┼────────┼───┼────────┐
                     │        │   │        │
               ┌─────▼────────▼───▼──────▼─┐
               │         bookings          │
               ├───────────────────────────┤
               │ _id                       │
               │ patientId    ────────────►│ (FK to patients)
               │ staffId      ────────────►│ (FK to staff)
               │ treatmentId  ────────────►│ (FK to treatments)
               │ startAt                   │
               │ endAt                     │
               │ status                    │
               │ tenantId                  │
               └───────────────────────────┘
```

### Relationship Details

1. **One-to-Many Relationships:**
   - `tenants` → `users` (1:N)
   - `tenants` → `patients` (1:N)
   - `tenants` → `staff` (1:N)
   - `tenants` → `treatments` (1:N)
   - `tenants` → `bookings` (1:N)
   - `patients` → `bookings` (1:N)
   - `staff` → `bookings` (1:N)
   - `treatments` → `bookings` (1:N)

2. **Many-to-Many Relationships:**
   - `staff` ↔ `treatments` (via `treatments.assignedStaff[]`)

---

## Data Isolation Strategy

### Multi-Tenant Architecture

This system uses a **Single Database, Multi-Tenant** approach with data isolation through `tenantId`:

1. **Tenant Isolation:**
   - Every collection (except `tenants`) has a `tenantId` field
   - All queries must include `tenantId` for data isolation
   - Compound indexes always start with `tenantId`

2. **Security:**
   - API routes verify `tenantId` from URL path
   - Users can only access data within their tenant
   - Compound unique indexes prevent duplication within tenant scope

---

## Performance Considerations

### Indexing Strategy

1. **Primary Indexes:**
   - All collections have an index on `tenantId`
   - Compound indexes for frequently used queries
   - Unique constraints with tenant scope

2. **Query Optimization:**
   - Always filter by `tenantId` first
   - Indexes on frequently sorted fields (`createdAt`, `rating`, `popularity`)
   - Sparse indexes for optional fields (`email` in patients)

### Data Archiving

For optimal performance, consider:
- Archive old bookings (> 1 year) to separate collection
- Soft delete with `isActive` flag for audit trail
- Pagination for queries that return large datasets

---

## Sample Queries

### Find Today's Bookings for a Tenant
```javascript
db.bookings.find({
  tenantId: "beauty-clinic-jakarta",
  startAt: {
    $gte: new Date("2024-01-01T00:00:00Z"),
    $lte: new Date("2024-01-01T23:59:59Z")
  },
  status: { $in: ["confirmed", "pending"] }
}).sort({ startAt: 1 })
```

### Find Available Staff for Treatment
```javascript
db.staff.find({
  tenantId: "beauty-clinic-jakarta",
  isActive: true,
  _id: { 
    $in: db.treatments.findOne({
      tenantId: "beauty-clinic-jakarta", 
      name: "Facial Premium"
    }).assignedStaff 
  }
})
```

### Patient Visit History
```javascript
db.bookings.find({
  tenantId: "beauty-clinic-jakarta",
  patientId: "patient_id_here",
  status: "completed"
}).sort({ startAt: -1 }).limit(10)
```

---

## Migration Notes

### Current Version: 1.0

**Initial Schema:** Full multi-tenant structure with all basic features.

**Future Considerations:**
- Add `version` field for schema versioning
- Consider partitioning for tenants with large datasets
- Add audit trail collection for tracking data changes

---

## Backup Strategy

1. **Daily Automated Backup:**
   - Full database backup every day
   - 30-day retention for daily backups

2. **Point-in-Time Recovery:**
   - MongoDB Change Streams for real-time replication
   - Oplog backup every 15 minutes

3. **Tenant-Specific Backup:**
   - Export per tenant for data portability
   - JSON format for easy restoration

---

*Last Updated: January 2025*  
*Database Version: 1.0*
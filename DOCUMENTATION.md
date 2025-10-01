# Beauty Clinic Admin Application Documentation

## 📖 Overview

Beauty Clinic Admin Application adalah sistem manajemen klinik kecantikan berbasis web yang dibangun menggunakan **Next.js 14** dengan **user-based data isolation**. Aplikasi ini memungkinkan multiple users untuk menggunakan sistem dengan data yang terisolasi per user.

## 🏗️ Architecture & Technology Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Date-fns** - Date manipulation

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Hosting platform
- Built with **v0.app** - AI-powered development

## 🏢 Multitenancy Implementation

### 1. URL-based Tenant Resolution
Aplikasi menggunakan **path-based multitenancy** dengan struktur URL:
```
https://localhost:3001/[tenant]/[page]
```

Contoh:
- `localhost:3001/jakarta/dashboard` - Tenant Jakarta
- `localhost:3001/bandung/calendar` - Tenant Bandung
- `localhost:3001/default/patients` - Default tenant

### 2. Middleware Implementation
File: `middleware.ts`

```typescript
// Middleware menangani:
- Tenant resolution dari URL path
- Authentication checks
- Route protection
- Header injection (x-tenant-slug)
```

**Key Features:**
- **Auto-redirect** untuk unauthenticated users
- **Tenant isolation** melalui path segments
- **Public routes** untuk signin/signup
- **Admin routes** bypass untuk super admin

### 3. Tenant Context Provider
File: `lib/tenant-context.tsx`

```typescript
interface TenantConfig {
  id: string
  slug: string
  name: string
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  features: {
    walkIn: boolean
    reporting: boolean
    multipleLocations: boolean
  }
  metadata: {
    title: string
    description: string
  }
}
```

**Fitur:**
- **Dynamic tenant loading** berdasarkan URL
- **Fallback ke default** tenant jika tidak ditemukan
- **Theme customization** per tenant
- **Feature flags** per tenant

### 4. Database Schema Isolation
Setiap model MongoDB memiliki field `tenantId` untuk data isolation:

```typescript
// Contoh di models/Patient.ts
{
  tenantId: { type: String, required: true, index: true },
  name: String,
  phone: String,
  // ... fields lainnya
}
```

**Unique Indexes:**
- `{ tenantId: 1, phone: 1 }` - Prevent duplicate phone per tenant
- `{ tenantId: 1, email: 1 }` - Prevent duplicate email per tenant

## 📁 Project Structure

```
admin-beauty-clinic-app/
├── app/                          # Next.js App Router
│   ├── [tenant]/                 # Dynamic tenant routes
│   │   ├── calendar/            # Calendar management
│   │   ├── clients/             # Patient management
│   │   ├── dashboard/           # Main dashboard
│   │   ├── settings/            # Clinic settings
│   │   ├── staff/               # Staff management
│   │   ├── treatments/          # Treatment catalog
│   │   ├── walk-in/             # Walk-in bookings
│   │   ├── withdrawal/          # Staff withdrawals
│   │   ├── signin/              # Authentication
│   │   └── layout.tsx           # Tenant layout
│   ├── admin/                   # Super admin panel
│   │   ├── login/               # Admin authentication
│   │   ├── tenants/             # Tenant management
│   │   └── layout.tsx           # Admin layout
│   ├── api/                     # API Routes
│   │   ├── [tenant]/            # Tenant-scoped APIs
│   │   │   ├── auth/            # Authentication APIs
│   │   │   ├── bookings/        # Booking management
│   │   │   ├── patients/        # Patient management
│   │   │   ├── staff/           # Staff management
│   │   │   ├── treatments/      # Treatment management
│   │   │   └── withdrawal/      # Withdrawal management
│   │   ├── admin/               # Admin APIs
│   │   └── tenants/             # Tenant APIs
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── layout/                  # Layout components
│   │   ├── main-layout.tsx      # Main application layout
│   │   └── sidebar.tsx          # Navigation sidebar
│   └── ui/                      # UI components (Radix-based)
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── context.tsx              # Global state management
│   ├── mongodb.ts               # Database connection
│   ├── tenant.ts                # Tenant configuration
│   ├── tenant-context.tsx       # Tenant context provider
│   └── utils.ts                 # General utilities
├── models/                      # MongoDB models
│   ├── Booking.ts               # Appointment bookings
│   ├── Patient.ts               # Patient/client data
│   ├── Staff.ts                 # Staff members
│   ├── Tenant.ts                # Tenant configuration
│   ├── Treatment.ts             # Treatment catalog
│   ├── User.ts                  # System users
│   └── Withdrawal.ts            # Staff withdrawals
├── scripts/                     # Database scripts
│   ├── create-tenant-admin.ts   # Create tenant admin
│   ├── seed-auth.ts             # Seed auth data
│   └── seed-database.ts         # Seed sample data
├── middleware.ts                # Next.js middleware
├── package.json                 # Dependencies
└── README.md                    # Basic project info
```

## 🔐 Authentication & Authorization

### 1. JWT-based Authentication
- **JWT tokens** disimpan dalam HTTP-only cookies
- **Token validation** di middleware untuk protected routes
- **Automatic redirect** ke signin page untuk unauthenticated users

### 2. Role-based Access Control
```typescript
// User roles dalam sistem:
- 'admin'     // Tenant administrator
- 'staff'     // Clinic staff
- 'receptionist' // Front desk
```

### 3. Tenant-scoped Authentication
- Users hanya bisa akses tenant mereka sendiri
- Authentication tokens di-scope per tenant
- Cross-tenant access tidak diizinkan

## 📊 Core Features

### 1. 📅 Calendar Management
**File:** `app/[tenant]/calendar/page.tsx`

**Fitur:**
- **Week/Table view** toggle
- **Stacking bookings** - Multiple appointments dalam slot yang sama
- **Drag & drop** appointment management
- **Real-time availability** checking
- **Staff capacity** handling untuk group sessions

**Stacking Bookings:**
- Support multiple clients per time slot
- Visual indicator untuk multiple bookings
- Popup detail untuk view semua bookings
- Ideal untuk group classes atau multiple staff

### 2. 🚶‍♀️ Walk-in Management
**File:** `app/[tenant]/walk-in/page.tsx`

**Fitur:**
- **Queue number** generation
- **Real-time patient** creation dan validation
- **Existing patient** auto-detection via phone
- **Date & time** selection dengan availability check
- **Payment handling** (deposit/full payment)
- **SMS/WhatsApp** reminder integration

### 3. 👥 Patient Management
**File:** `app/[tenant]/clients/page.tsx`

**Fitur:**
- **Patient database** dengan contact info
- **Treatment history** tracking
- **Duplicate prevention** via phone/email
- **Search & filter** capabilities
- **Patient notes** dan medical history

### 4. 👨‍⚕️ Staff Management
**File:** `app/[tenant]/staff/page.tsx`

**Fitur:**
- **Staff profiles** dengan skills dan availability
- **Working schedule** management
- **Treatment assignment** per staff
- **Capacity setting** untuk group sessions
- **Earnings tracking** dan withdrawal management
- **Performance ratings**

### 5. 💰 Financial Management
**File:** `app/[tenant]/withdrawal/page.tsx`

**Fitur:**
- **Staff earnings** calculation
- **Withdrawal requests** processing
- **Payment tracking** per treatment
- **Commission management**
- **Financial reports**

### 6. 🏥 Treatment Catalog
**File:** `app/[tenant]/treatments/page.tsx`

**Fitur:**
- **Treatment library** dengan pricing
- **Duration management**
- **Category organization**
- **Staff assignment** per treatment
- **Pricing tiers**

## 🗄️ Database Models

### 1. Tenant Model
```typescript
interface ITenant {
  _id: string
  name: string
  slug: string
  domain?: string
  settings: {
    timezone: string
    currency: string
    dateFormat: string
  }
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  isActive: boolean
}
```

### 2. Booking Model
```typescript
interface IBooking {
  _id: string
  tenantId: string
  patientId: string
  staffId: string
  treatmentId: string
  startAt: Date
  endAt: Date
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  source: 'online' | 'walk-in' | 'phone'
  paymentStatus: 'unpaid' | 'deposit' | 'paid'
  queueNumber?: number
  notes?: string
}
```

### 3. Patient Model
```typescript
interface IPatient {
  _id: string
  tenantId: string
  name: string
  phone: string
  email?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female'
  address?: string
  notes?: string
  createdAt: Date
}
```

### 4. Staff Model
```typescript
interface IStaff {
  _id: string
  tenantId: string
  name: string
  email?: string
  role: string
  skills: string[]
  workingHours: string[]
  capacity?: number  // Untuk group sessions
  rating?: number
  balance: number
  totalEarnings: number
  isActive: boolean
}
```

## 🔧 API Structure

### Tenant-scoped APIs
Base URL: `/api/[tenant]/`

**Authentication:**
- `POST /api/[tenant]/auth/signin`
- `POST /api/[tenant]/auth/signup`
- `POST /api/[tenant]/auth/change-password`

**Bookings:**
- `GET|POST /api/[tenant]/bookings`
- `GET|PUT|DELETE /api/[tenant]/bookings/[id]`
- `POST /api/[tenant]/bookings/complete`

**Patients:**
- `GET|POST /api/[tenant]/patients`

**Staff:**
- `GET|POST /api/[tenant]/staff`

**Treatments:**
- `GET|POST /api/[tenant]/treatments`

**Withdrawals:**
- `GET|POST /api/[tenant]/withdrawal`

### Admin APIs
Base URL: `/api/admin/`

**Tenant Management:**
- `GET|POST /api/admin/tenants`
- `GET|PUT|DELETE /api/admin/tenants/[id]`

**Admin Auth:**
- `POST /api/admin/auth/signin`

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB database
- Environment variables

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/beauty-clinic
MONGODB_DB_NAME=beauty-clinic

# JWT
JWT_SECRET=your-jwt-secret

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd admin-beauty-clinic-app

# Install dependencies
npm install

# Setup database
npm run db:seed

# Create tenant admin
npm run create-tenant-admin

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
npm run create-tenant-admin  # Create tenant administrator
```

## 🌐 Multitenancy Usage

### Adding New Tenant
1. **Create tenant** via admin panel (`/admin/tenants`)
2. **Configure tenant** settings (theme, features, etc.)
3. **Access tenant** via `localhost:3001/[tenant-slug]`
4. **Create tenant admin** via script atau admin panel

### Tenant Configuration
```typescript
// Contoh konfigurasi tenant
{
  slug: "jakarta-beauty",
  name: "Jakarta Beauty Clinic",
  theme: {
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4"
  },
  features: {
    walkIn: true,
    reporting: true,
    multipleLocations: false
  }
}
```

### URL Structure Examples
- `localhost:3001/jakarta-beauty/dashboard` - Jakarta Beauty Clinic
- `localhost:3001/bandung-skin/calendar` - Bandung Skin Clinic
- `localhost:3001/surabaya-care/patients` - Surabaya Care Clinic

## 🔒 Security Features

### 1. Data Isolation
- **Tenant-scoped queries** di semua API endpoints
- **Database indexes** untuk performance per tenant
- **Middleware validation** untuk tenant access

### 2. Authentication Security
- **HTTP-only cookies** untuk JWT storage
- **Password hashing** dengan bcryptjs
- **Route protection** via middleware
- **Session timeout** management

### 3. Input Validation
- **Zod schemas** untuk API validation
- **Mongoose schemas** untuk database validation
- **XSS protection** via React
- **SQL injection** prevention (NoSQL)

## 📈 Performance Optimizations

### 1. Database Optimizations
- **Compound indexes** untuk tenant queries
- **Connection pooling** via Mongoose
- **Query optimization** dengan proper indexes

### 2. Frontend Optimizations
- **Code splitting** via Next.js
- **Lazy loading** untuk large components
- **Image optimization** dengan Next.js Image
- **Bundle analysis** untuk size monitoring

### 3. Caching Strategy
- **Static generation** untuk public pages
- **API route caching** where appropriate
- **Browser caching** untuk static assets

## 🐛 Troubleshooting

### Common Issues

1. **Calendar bookings tidak muncul:**
   - Check tenant context loading
   - Verify API data filtering
   - Check date format consistency

2. **Authentication errors:**
   - Verify JWT secret configuration
   - Check cookie settings
   - Validate middleware configuration

3. **Tenant resolution issues:**
   - Check URL path structure
   - Verify middleware config
   - Validate tenant slug format

4. **Database connection errors:**
   - Check MongoDB URI
   - Verify network connectivity
   - Check database permissions

## 📞 Support & Maintenance

### Monitoring
- **Error logging** via console dan server logs
- **Performance monitoring** via Vercel analytics
- **Database monitoring** via MongoDB tools

### Backup Strategy
- **Database backups** regular via MongoDB tools
- **Code versioning** via Git
- **Environment configuration** backup

### Updates & Deployment
- **Version control** via Git
- **Continuous deployment** via Vercel
- **Database migrations** via scripts
- **Feature flags** per tenant

---

## 📝 Notes

Aplikasi ini dibangun dengan fokus pada:
- **Scalability** - Mudah menambah tenant baru
- **Maintainability** - Code structure yang clear
- **Security** - Data isolation yang kuat
- **Performance** - Optimized untuk multi-tenant usage
- **User Experience** - Interface yang intuitive

Untuk questions atau issues, silakan check troubleshooting section atau contact development team.
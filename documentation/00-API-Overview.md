# Circe API - Overview

## Base URL
```
https://circe-fastapi-backend-740443181568.europe-west1.run.app
```

## Arsitektur
Multi-tenant booking platform untuk bisnis kecantikan, spa, dan wellness.

### Stack Teknologi
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: RBAC (Role-Based Access Control)
- **Payment Gateway**: Paper.id

## Level Akses

### 1. Staff Portal 🟧
**Authentication**: JWT Token Required
- Mengelola tenant, outlet, staff, dan layanan
- Manajemen appointment dan pembayaran
- Akses ke fitur analytics dan reporting
- Header required: `Authorization: Bearer {jwt_token}`

### 2. Customer Portal 🟦
**Authentication**: Customer JWT Required
- Booking appointment
- Manajemen profile pelanggan
- Histori transaksi dan pembayaran
- Self-registration dengan OTP verification
- Header required: `Authorization: Bearer {customer_jwt_token}`

### 3. Public API 🟩
**Authentication**: Tidak diperlukan
- Browse business dan services
- Check availability
- Tenant registration
- Endpoint yang bersifat read-only untuk publik

## Kategori API Endpoints

1. **Public API** - Akses tanpa autentikasi
2. **Authentication** - Login dan registrasi (Staff & Customer)
3. **Tenant Management** - Manajemen data tenant/bisnis
4. **Subscription Management** - Paket langganan dan billing
5. **Outlet Management** - Manajemen cabang/outlet
6. **Staff Management** - Manajemen karyawan
7. **Services Management** - Manajemen layanan/treatment
8. **Availability Management** - Jadwal ketersediaan staff
9. **Customer Management** - Data pelanggan
10. **Appointments Management** - Booking dan appointment
11. **Payment Management** - Transaksi dan pembayaran
12. **Webhooks** - Notifikasi event

## Subscription Plans

### FREE Plan
- 1 outlet
- 5 staff members
- 100 monthly appointments
- Basic features

### PRO Plan
- 10 outlets
- 50 staff members
- 2,000 monthly appointments
- Advanced features

### ENTERPRISE Plan
- Unlimited outlets
- Unlimited staff
- Unlimited appointments
- Full features + custom integration

## Security Features

- JWT authentication dengan expiry
- Tenant data isolation
- Role-Based Access Control (RBAC)
- Rate limiting
- Audit logging
- Webhook signature verification

## Payment Integration

- **Provider**: Paper.id
- Automatic invoicing
- Merchant payouts
- Configurable platform fees
- Support untuk multiple payment methods

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:
- Limit berbeda untuk setiap subscription plan
- Header `X-RateLimit-Remaining` menunjukkan sisa request
- Status `429 Too Many Requests` jika limit terlampaui

## Pagination

Endpoints yang mengembalikan list data menggunakan pagination:
```
?page=1&limit=20
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## Next Steps

Lihat dokumentasi detail untuk setiap kategori API:
1. [Public API](./01-Public-API.md)
2. [Authentication](./02-Authentication.md)
3. [Tenant Management](./03-Tenant-Management.md)
4. [Subscription Management](./04-Subscription-Management.md)
5. [Outlet Management](./05-Outlet-Management.md)
6. [Staff Management](./06-Staff-Management.md)
7. [Services Management](./07-Services-Management.md)
8. [Availability Management](./08-Availability-Management.md)
9. [Customer Management](./09-Customer-Management.md)
10. [Appointments Management](./10-Appointments-Management.md)
11. [Payment Management](./11-Payment-Management.md)
12. [Webhooks](./12-Webhooks.md)

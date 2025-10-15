# Circe API Documentation

Dokumentasi lengkap API untuk Circe - Multi-tenant Booking Platform untuk beauty, spa, dan wellness businesses.

## Base URL
```
https://circe-fastapi-backend-740443181568.europe-west1.run.app
```

## Tentang API

Circe API adalah RESTful API yang dibangun dengan FastAPI (Python 3.9+) dan menggunakan MongoDB sebagai database. API ini menyediakan endpoint untuk mengelola seluruh aspek bisnis kecantikan, mulai dari appointment management, staff scheduling, payment processing, hingga customer management.

### Teknologi Stack
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: RBAC (Role-Based Access Control)
- **Payment Gateway**: Paper.id

### Level Akses
- 🟩 **Public API** - Tidak memerlukan autentikasi
- 🟧 **Staff Portal** - Memerlukan JWT staff authentication
- 🟦 **Customer Portal** - Memerlukan JWT customer authentication

---

## Daftar Dokumentasi

### [00. API Overview](./00-API-Overview.md)
Pengenalan lengkap tentang Circe API, arsitektur, security features, dan subscription plans.

**Topik:**
- Arsitektur multi-tenant
- Level akses (Staff, Customer, Public)
- Response format & status codes
- Rate limiting & pagination
- Security features

---

### [01. Public API](./01-Public-API.md)
Endpoint public untuk akses tanpa autentikasi.

**Endpoints:**
- Tenant registration
- Browse businesses/outlets
- Get outlet details
- Get services by outlet
- Check availability

**Use Cases:**
- Customer discovery & browsing
- Tenant self-registration
- Public booking information

---

### [02. Authentication](./02-Authentication.md)
Authentication endpoints untuk Staff Portal dan Customer Portal.

**Endpoints:**
- Staff login (multi-tenant)
- Complete login (tenant selection)
- Refresh token
- Customer registration & OTP verification
- Customer login
- Forgot/reset password

**Use Cases:**
- Staff login dengan multi-tenant support
- Customer registration dengan email verification
- Token management & refresh

---

### [03. Tenant Management](./03-Tenant-Management.md)
Mengelola data tenant/bisnis.

**Endpoints:**
- Get/update tenant profile
- Update tenant settings
- Upload logo
- Get statistics
- Get subscription usage
- Delete tenant

**Use Cases:**
- Business profile management
- Dashboard analytics
- Settings configuration
- Subscription monitoring

---

### [04. Subscription Management](./04-Subscription-Management.md)
Mengelola subscription plans dan billing.

**Endpoints:**
- Get available plans
- Get current subscription
- Upgrade/downgrade subscription
- Cancel/reactivate subscription
- Get billing history
- Download invoice
- Update payment method
- Apply coupon code

**Use Cases:**
- Plan comparison & upgrade
- Billing management
- Invoice tracking
- Payment method updates

---

### [05. Outlet Management](./05-Outlet-Management.md)
Mengelola outlet/cabang bisnis.

**Endpoints:**
- Get all outlets
- Get outlet details
- Create/update outlet
- Deactivate/reactivate outlet
- Get outlet statistics
- Upload outlet images

**Use Cases:**
- Multi-location management
- Outlet performance tracking
- Operating hours configuration

---

### [06. Staff Management](./06-Staff-Management.md)
Mengelola staff/karyawan.

**Endpoints:**
- Get all staff
- Get staff details
- Create/update staff
- Update staff role & permissions
- Assign staff to outlets
- Deactivate staff
- Get staff availability
- Get staff performance
- Upload staff photo

**Use Cases:**
- Employee management
- Role & permission assignment
- Performance tracking
- Schedule management

---

### [07. Services Management](./07-Services-Management.md)
Mengelola layanan/treatment.

**Endpoints:**
- Get all services
- Get service details
- Create/update service
- Set service price per outlet
- Assign staff to service
- Deactivate service
- Upload service image
- Get service statistics

**Use Cases:**
- Service catalog management
- Pricing configuration
- Service-staff assignment
- Performance analytics

---

### [08. Availability Management](./08-Availability-Management.md)
Mengelola ketersediaan staff dan time slots.

**Endpoints:**
- Get staff availability schedule
- Get available slots
- Set staff working hours
- Create schedule override
- Request time off
- Approve/reject time off
- Get availability grid

**Use Cases:**
- Staff scheduling
- Time off management
- Availability checking for bookings
- Schedule conflict resolution

---

### [09. Customer Management](./09-Customer-Management.md)
Mengelola data customer/pelanggan.

**Endpoints:**
- Get all customers
- Get customer details
- Create/update customer
- Add customer note
- Get customer appointment history
- Get customer statistics
- Deactivate customer
- Merge customers
- Export customers

**Use Cases:**
- Customer database management
- Customer profile & preferences
- Visit history tracking
- Customer analytics

---

### [10. Appointments Management](./10-Appointments-Management.md)
Mengelola appointment/booking (Dokumentasi paling penting!).

**Endpoints:**
- Get all appointments
- Get appointment details
- Create appointment (Staff & Customer)
- Update appointment
- Confirm/start/complete appointment
- Cancel appointment
- Mark as no-show
- Reschedule appointment
- Get appointment calendar
- Get appointment statistics

**Use Cases:**
- Booking management
- Appointment lifecycle tracking
- Calendar integration
- Performance metrics

---

### [11. Payment Management](./11-Payment-Management.md)
Mengelola pembayaran dan transaksi.

**Endpoints:**
- Get all payments
- Get payment details
- Create payment (cash & online)
- Create payment link
- Check payment status
- Process refund
- Apply discount code
- Get payment summary
- Download receipt
- Send receipt email

**Use Cases:**
- Payment processing
- Online payment integration
- Refund management
- Revenue tracking

---

### [12. Webhooks](./12-Webhooks.md)
Real-time notifications untuk events.

**Events:**
- Appointment events (created, updated, completed, canceled)
- Payment events (success, failed, refunded)
- Customer events (registered, updated)
- Subscription events (created, updated, canceled)
- Invoice events (paid, payment_failed)

**Management:**
- Register/update/delete webhook
- Test webhook
- Get webhook logs
- Signature verification

**Use Cases:**
- Real-time notifications
- Third-party integrations
- Automated workflows
- Event monitoring

---

## Quick Start Guide

### 1. Authentication

**Staff Login:**
```typescript
// Step 1: Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Step 2: Select tenant (if multiple)
const completeResponse = await fetch('/api/v1/auth/complete-login', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${partialToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tenant_id })
});

// Save access token
const { access_token, refresh_token } = completeResponse.data;
```

**Customer Registration:**
```typescript
// Step 1: Register
await fetch('/api/v1/customer/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, phone, password })
});

// Step 2: Verify OTP
const verifyResponse = await fetch('/api/v1/customer/auth/verify-email', {
  method: 'POST',
  body: JSON.stringify({ email, otp_code })
});

const { access_token } = verifyResponse.data;
```

### 2. Making Authenticated Requests

```typescript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Handle token expiry
  if (response.status === 401) {
    await refreshAccessToken();
    return makeAuthenticatedRequest(url, options);
  }

  return response.json();
};
```

### 3. Common Workflows

**Create Appointment (Booking Flow):**
```typescript
// 1. Get available slots
const slots = await fetch(
  `/api/v1/availability/slots?date=${date}&service_id=${serviceId}&outlet_id=${outletId}`
);

// 2. Create appointment
const appointment = await makeAuthenticatedRequest('/api/v1/appointments', {
  method: 'POST',
  body: JSON.stringify({
    customer_id,
    service_id,
    staff_id,
    outlet_id,
    appointment_date,
    start_time
  })
});

// 3. Process payment (optional)
await makeAuthenticatedRequest('/api/v1/payments', {
  method: 'POST',
  body: JSON.stringify({
    appointment_id: appointment.appointment_id,
    payment_method: 'cash',
    amount: appointment.total_amount
  })
});
```

---

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Email/password salah
- `TOKEN_EXPIRED` - JWT token expired
- `UNAUTHORIZED` - Tidak ada akses
- `VALIDATION_ERROR` - Input validation gagal
- `RESOURCE_NOT_FOUND` - Resource tidak ditemukan
- `LIMIT_EXCEEDED` - Subscription limit terlampaui
- `CONFLICT` - Data conflict (e.g., double booking)

---

## Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1698765432
```

- **FREE Plan**: 100 requests/minute
- **PRO Plan**: 500 requests/minute
- **ENTERPRISE Plan**: 2000 requests/minute

---

## Testing

### Using cURL

```bash
# Public API (no auth)
curl https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/public/outlets?city=Jakarta

# Authenticated request
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/appointments
```

### Using Postman

1. Import environment variables
2. Set `base_url` = `https://circe-fastapi-backend-740443181568.europe-west1.run.app`
3. Set `access_token` dari login response
4. Test endpoints

---

## Support & Resources

- **Base URL**: https://circe-fastapi-backend-740443181568.europe-west1.run.app
- **API Version**: v1
- **Last Updated**: 2025-10-15

### Integration Checklist

- [ ] Authentication flow implemented
- [ ] Token refresh logic
- [ ] Error handling
- [ ] Webhook endpoint setup
- [ ] Rate limiting handling
- [ ] Payment integration (Paper.id)
- [ ] Notification system
- [ ] Booking flow
- [ ] Calendar integration
- [ ] Dashboard analytics

---

## Implementation Priority

Untuk mengimplementasikan dashboard admin, prioritas integrasi:

### Phase 1 - Core Functions (Week 1-2)
1. ✅ Authentication (Staff login)
2. ✅ Tenant Management (Profile & settings)
3. ✅ Outlet Management
4. ✅ Staff Management
5. ✅ Services Management

### Phase 2 - Booking System (Week 3-4)
6. ✅ Availability Management
7. ✅ Customer Management
8. ✅ Appointments Management
9. ✅ Payment Management

### Phase 3 - Advanced Features (Week 5-6)
10. ✅ Subscription Management
11. ✅ Webhooks
12. ✅ Analytics & Reporting
13. ✅ Notifications

---

## Notes untuk Developer

### Important Points:
1. **Tenant Context**: Setiap request staff harus include tenant_id dalam JWT token
2. **Permissions**: Check user permissions sebelum show/hide features
3. **Time Zones**: Semua timestamp dalam UTC, convert ke local timezone di frontend
4. **Currency**: Amount dalam integer (smallest unit), e.g., 150000 = Rp 150,000
5. **Pagination**: Default limit 20, max 100
6. **Image Upload**: Gunakan multipart/form-data untuk upload images

### Best Practices:
- Always verify JWT signature
- Implement token refresh logic
- Handle rate limiting gracefully
- Cache frequently accessed data
- Implement optimistic UI updates
- Add loading states
- Show proper error messages
- Log all API errors

---

## Change Log

### Version 1.0.0 (2025-10-15)
- Initial API documentation
- 12 kategori API lengkap
- Implementation guides untuk setiap endpoint
- Code examples dalam TypeScript/JavaScript
- Webhook integration guide
- Quick start guide

---

**Happy Coding! 🚀**

Jika ada pertanyaan atau butuh klarifikasi tentang API, silakan hubungi tim backend atau lihat detail di setiap file dokumentasi kategori.

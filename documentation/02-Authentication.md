# Authentication API

Dokumentasi untuk authentication endpoints untuk Staff Portal dan Customer Portal.

---

## Staff Authentication 🟧

### 1. Staff Login

#### POST `/api/v1/auth/login`

Login untuk staff dengan support multi-tenant.

**Authentication**: Tidak diperlukan (credentials-based)

**Request Body**:
```json
{
  "email": "staff@beautysalon.com",
  "password": "SecurePassword123!"
}
```

**Field Descriptions**:
- `email` (required, string): Email staff yang terdaftar
- `password` (required, string): Password staff

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user_id": "user_123",
    "email": "staff@beautysalon.com",
    "name": "John Doe",
    "tenants": [
      {
        "tenant_id": "tenant_abc123",
        "business_name": "Beauty Salon XYZ",
        "role": "admin"
      },
      {
        "tenant_id": "tenant_def456",
        "business_name": "Spa Wellness ABC",
        "role": "staff"
      }
    ],
    "requires_tenant_selection": true
  },
  "message": "Login successful. Please select tenant."
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

**Implementation Notes**:
- Staff bisa terdaftar di multiple tenant
- Jika staff hanya di 1 tenant, langsung auto-select tenant tersebut
- Jika staff di multiple tenant, user harus pilih tenant (requires_tenant_selection: true)
- Role bisa: owner, admin, manager, staff

---

### 2. Complete Login (Select Tenant)

#### POST `/api/v1/auth/complete-login`

Finalize login dengan memilih tenant context.

**Authentication**: Partial token dari login step

**Request Headers**:
```
Authorization: Bearer {partial_token}
```

**Request Body**:
```json
{
  "tenant_id": "tenant_abc123"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "user_id": "user_123",
      "email": "staff@beautysalon.com",
      "name": "John Doe",
      "role": "admin",
      "permissions": [
        "appointments.read",
        "appointments.create",
        "appointments.update",
        "staff.read",
        "customers.read",
        "services.manage"
      ]
    },
    "tenant": {
      "tenant_id": "tenant_abc123",
      "business_name": "Beauty Salon XYZ",
      "subscription_plan": "PRO",
      "subscription_status": "active"
    }
  }
}
```

**Response Error (403 Forbidden)**:
```json
{
  "status": "error",
  "message": "You don't have access to this tenant",
  "code": "TENANT_ACCESS_DENIED"
}
```

**Implementation Notes**:
- Access token valid selama 1 jam
- Refresh token valid selama 30 hari
- JWT token include: user_id, tenant_id, role, permissions
- Setiap request ke protected endpoint harus include tenant context

---

### 3. Refresh Token

#### POST `/api/v1/auth/refresh`

Refresh expired access token.

**Authentication**: Refresh token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "status": "error",
  "message": "Invalid or expired refresh token",
  "code": "INVALID_REFRESH_TOKEN"
}
```

---

### 4. Logout

#### POST `/api/v1/auth/logout`

Logout dan invalidate tokens.

**Authentication**: JWT Required

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Implementation Notes**:
- Token akan di-blacklist di server
- Client harus hapus token dari storage

---

## Customer Authentication 🟦

### 1. Customer Registration

#### POST `/api/v1/customer/auth/register`

Self-registration untuk customer baru dengan email/phone verification.

**Authentication**: Tidak diperlukan

**Request Body**:
```json
{
  "name": "Jane Customer",
  "email": "jane@customer.com",
  "phone": "+62812345678",
  "password": "SecurePassword123!",
  "date_of_birth": "1990-05-15",
  "gender": "female"
}
```

**Field Descriptions**:
- `name` (required, string): Nama lengkap customer
- `email` (required, string): Email customer (unique)
- `phone` (required, string): Nomor telepon dengan country code
- `password` (required, string): Password minimal 8 karakter
- `date_of_birth` (optional, string): Format YYYY-MM-DD
- `gender` (optional, enum): male, female, other, prefer_not_to_say

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "email": "jane@customer.com",
    "phone": "+62812345678",
    "verification_required": true,
    "verification_method": "email",
    "otp_sent": true
  },
  "message": "Registration successful. Please verify your email with the OTP sent."
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

**Implementation Notes**:
- OTP dikirim ke email customer
- OTP valid selama 10 menit
- Customer harus verify email sebelum bisa login
- Password harus minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka

---

### 2. Verify Email (OTP)

#### POST `/api/v1/customer/auth/verify-email`

Verifikasi email dengan OTP code.

**Authentication**: Tidak diperlukan

**Request Body**:
```json
{
  "email": "jane@customer.com",
  "otp_code": "123456"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "email": "jane@customer.com",
    "verified": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "Email verified successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Invalid or expired OTP code",
  "code": "INVALID_OTP"
}
```

**Implementation Notes**:
- Setelah verifikasi berhasil, customer langsung mendapat token
- OTP hanya bisa digunakan 1 kali
- Max 3 attempts untuk verify OTP

---

### 3. Resend OTP

#### POST `/api/v1/customer/auth/resend-otp`

Kirim ulang OTP code.

**Authentication**: Tidak diperlukan

**Request Body**:
```json
{
  "email": "jane@customer.com"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "OTP has been resent to your email",
  "data": {
    "otp_sent": true,
    "expires_in_minutes": 10
  }
}
```

**Implementation Notes**:
- Rate limit: 1 request per 2 menit
- Max 5 requests per hari per email

---

### 4. Customer Login

#### POST `/api/v1/customer/auth/login`

Login untuk customer yang sudah terdaftar.

**Authentication**: Tidak diperlukan (credentials-based)

**Request Body**:
```json
{
  "email": "jane@customer.com",
  "password": "SecurePassword123!"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "customer": {
      "customer_id": "customer_123",
      "name": "Jane Customer",
      "email": "jane@customer.com",
      "phone": "+62812345678",
      "profile_photo": "https://storage.url/photo.jpg",
      "verified": true
    }
  }
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 5. Forgot Password

#### POST `/api/v1/customer/auth/forgot-password`

Request password reset link/OTP.

**Authentication**: Tidak diperlukan

**Request Body**:
```json
{
  "email": "jane@customer.com"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Password reset instructions sent to your email",
  "data": {
    "reset_token_sent": true,
    "expires_in_minutes": 30
  }
}
```

---

### 6. Reset Password

#### POST `/api/v1/customer/auth/reset-password`

Reset password dengan token.

**Authentication**: Reset token

**Request Body**:
```json
{
  "reset_token": "abc123resettoken",
  "new_password": "NewSecurePassword123!"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

## JWT Token Structure

### Staff Token Payload
```json
{
  "user_id": "user_123",
  "tenant_id": "tenant_abc123",
  "email": "staff@beautysalon.com",
  "role": "admin",
  "permissions": [
    "appointments.read",
    "appointments.create",
    "staff.manage"
  ],
  "type": "staff",
  "exp": 1698765432,
  "iat": 1698761832
}
```

### Customer Token Payload
```json
{
  "customer_id": "customer_123",
  "email": "jane@customer.com",
  "type": "customer",
  "exp": 1698765432,
  "iat": 1698761832
}
```

---

## Implementation Guide untuk Dashboard

### Staff Login Flow

```typescript
// Step 1: Login with credentials
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const loginData = await loginResponse.json();

// Step 2: Check if tenant selection needed
if (loginData.data.requires_tenant_selection) {
  // Show tenant selection UI
  const selectedTenant = await showTenantSelector(loginData.data.tenants);

  // Step 3: Complete login with selected tenant
  const completeResponse = await fetch('/api/v1/auth/complete-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.data.partial_token}`
    },
    body: JSON.stringify({ tenant_id: selectedTenant.tenant_id })
  });

  const finalData = await completeResponse.json();

  // Save tokens
  localStorage.setItem('access_token', finalData.data.access_token);
  localStorage.setItem('refresh_token', finalData.data.refresh_token);
  localStorage.setItem('user', JSON.stringify(finalData.data.user));
  localStorage.setItem('tenant', JSON.stringify(finalData.data.tenant));
}
```

### Customer Registration Flow

```typescript
// Step 1: Register
const registerResponse = await fetch('/api/v1/customer/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationData)
});

// Step 2: Verify OTP
const verifyResponse = await fetch('/api/v1/customer/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp_code })
});

const verifyData = await verifyResponse.json();

// Save tokens
localStorage.setItem('access_token', verifyData.data.access_token);
localStorage.setItem('refresh_token', verifyData.data.refresh_token);
localStorage.setItem('customer', JSON.stringify(verifyData.data.customer));
```

### Protected API Calls dengan JWT

```typescript
const makeAuthenticatedRequest = async (url: string, options = {}) => {
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
    // Try to refresh token
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry request with new token
      return makeAuthenticatedRequest(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  }

  return response.json();
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const data = await response.json();

    if (data.status === 'success') {
      localStorage.setItem('access_token', data.data.access_token);
      return data.data.access_token;
    }

    return null;
  } catch (error) {
    return null;
  }
};
```

### Permission Check

```typescript
const hasPermission = (permission: string): boolean => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.permissions?.includes(permission) || false;
};

// Usage
if (hasPermission('appointments.create')) {
  // Show create appointment button
}
```

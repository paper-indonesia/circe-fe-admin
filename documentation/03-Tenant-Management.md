# Tenant Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin only)

API untuk mengelola data tenant/bisnis. Hanya owner dan admin yang memiliki akses penuh.

---

## 1. Get Tenant Profile

### GET `/api/v1/tenants/profile`

Mendapatkan profil lengkap tenant saat ini.

**Authentication**: JWT Required (Staff)

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "tenant_id": "tenant_abc123",
    "business_name": "Beauty Salon XYZ",
    "email": "owner@beautysalon.com",
    "phone": "+62812345678",
    "owner_name": "John Doe",
    "business_type": "beauty_salon",
    "description": "Premium beauty salon with experienced professionals",
    "address": {
      "street": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postal_code": "12190",
      "country": "Indonesia"
    },
    "website": "https://beautysalonxyz.com",
    "social_media": {
      "instagram": "@beautysalonxyz",
      "facebook": "beautysalonxyz",
      "tiktok": "@beautysalonxyz"
    },
    "logo": "https://storage.url/logo.png",
    "subscription": {
      "plan": "PRO",
      "status": "active",
      "started_at": "2025-01-01T00:00:00Z",
      "expires_at": "2026-01-01T00:00:00Z",
      "limits": {
        "outlets": 10,
        "staff": 50,
        "monthly_appointments": 2000
      },
      "usage": {
        "outlets_count": 3,
        "staff_count": 15,
        "monthly_appointments_count": 456
      }
    },
    "settings": {
      "timezone": "Asia/Jakarta",
      "currency": "IDR",
      "language": "id",
      "booking_settings": {
        "require_customer_phone": true,
        "require_customer_email": true,
        "allow_walkin": true,
        "booking_advance_days": 30,
        "cancellation_policy": "Cancel up to 24 hours before appointment"
      },
      "notification_settings": {
        "email_notifications": true,
        "sms_notifications": true,
        "whatsapp_notifications": false
      }
    },
    "created_at": "2025-01-01T10:30:00Z",
    "updated_at": "2025-10-15T08:20:00Z"
  }
}
```

**Implementation Notes**:
- Token JWT harus include tenant_id context
- Response include subscription limits dan current usage
- Settings object untuk konfigurasi bisnis

---

## 2. Update Tenant Profile

### PUT `/api/v1/tenants/profile`

Update profil tenant.

**Authentication**: JWT Required (Owner/Admin only)

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:
```json
{
  "business_name": "Beauty Salon XYZ Premium",
  "phone": "+62812345678",
  "description": "Premium beauty salon with experienced professionals and modern equipment",
  "address": {
    "street": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12190",
    "country": "Indonesia"
  },
  "website": "https://beautysalonxyz.com",
  "social_media": {
    "instagram": "@beautysalonxyz",
    "facebook": "beautysalonxyz",
    "tiktok": "@beautysalonxyz"
  }
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "tenant_id": "tenant_abc123",
    "business_name": "Beauty Salon XYZ Premium",
    "updated_at": "2025-10-15T08:25:00Z"
  },
  "message": "Tenant profile updated successfully"
}
```

**Validation Rules**:
- business_name: minimal 3 karakter, maksimal 100 karakter
- phone: format valid dengan country code
- email: format valid (tidak bisa diubah setelah registrasi)
- website: URL format valid

---

## 3. Update Tenant Settings

### PUT `/api/v1/tenants/settings`

Update pengaturan tenant.

**Authentication**: JWT Required (Owner/Admin only)

**Request Body**:
```json
{
  "timezone": "Asia/Jakarta",
  "currency": "IDR",
  "language": "id",
  "booking_settings": {
    "require_customer_phone": true,
    "require_customer_email": true,
    "allow_walkin": true,
    "booking_advance_days": 30,
    "cancellation_policy": "Cancel up to 24 hours before appointment",
    "auto_confirm_bookings": false,
    "buffer_time_minutes": 15
  },
  "notification_settings": {
    "email_notifications": true,
    "sms_notifications": true,
    "whatsapp_notifications": false,
    "notify_new_bookings": true,
    "notify_cancellations": true,
    "notify_payment_received": true
  },
  "payment_settings": {
    "require_deposit": false,
    "deposit_percentage": 0,
    "accept_cash": true,
    "accept_card": true,
    "accept_ewallet": true
  }
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Settings updated successfully"
}
```

**Implementation Notes**:
- `booking_advance_days`: berapa hari ke depan customer bisa booking
- `buffer_time_minutes`: waktu jeda antar appointment (default 15 menit)
- `auto_confirm_bookings`: jika true, booking langsung confirmed tanpa perlu manual approval

---

## 4. Upload Tenant Logo

### POST `/api/v1/tenants/logo`

Upload atau update logo tenant.

**Authentication**: JWT Required (Owner/Admin only)

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
```
logo: [File]
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "logo_url": "https://storage.url/tenant_abc123/logo.png",
    "uploaded_at": "2025-10-15T08:30:00Z"
  },
  "message": "Logo uploaded successfully"
}
```

**Validation Rules**:
- File type: image/jpeg, image/png, image/webp
- Max file size: 2MB
- Recommended dimensions: 512x512px (square)
- Auto resize dan optimize jika ukuran terlalu besar

---

## 5. Get Tenant Statistics

### GET `/api/v1/tenants/statistics`

Mendapatkan statistik tenant (dashboard analytics).

**Authentication**: JWT Required (Owner/Admin/Manager)

**Query Parameters**:
```
?period=month&start_date=2025-10-01&end_date=2025-10-31
```

**Parameters**:
- `period` (optional, enum): today, week, month, year, custom (default: month)
- `start_date` (optional, string): Format YYYY-MM-DD (required if period=custom)
- `end_date` (optional, string): Format YYYY-MM-DD (required if period=custom)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31",
      "period_type": "month"
    },
    "overview": {
      "total_appointments": 156,
      "completed_appointments": 142,
      "cancelled_appointments": 8,
      "no_show_appointments": 6,
      "total_revenue": 23500000,
      "average_appointment_value": 150641,
      "new_customers": 24,
      "returning_customers": 89
    },
    "appointments_trend": [
      { "date": "2025-10-01", "count": 8, "revenue": 1200000 },
      { "date": "2025-10-02", "count": 12, "revenue": 1800000 },
      { "date": "2025-10-03", "count": 6, "revenue": 900000 }
    ],
    "top_services": [
      {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "bookings": 45,
        "revenue": 6750000
      },
      {
        "service_id": "service_124",
        "service_name": "Hair Coloring",
        "bookings": 28,
        "revenue": 9800000
      }
    ],
    "top_staff": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "appointments": 38,
        "revenue": 5700000,
        "rating": 4.9
      }
    ],
    "outlet_performance": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Central Branch",
        "appointments": 89,
        "revenue": 13350000
      }
    ]
  }
}
```

**Implementation Notes**:
- Data untuk dashboard analytics
- Include charts data (appointments_trend)
- Performance metrics per service, staff, dan outlet
- Revenue dalam currency tenant (IDR)

---

## 6. Get Subscription Usage

### GET `/api/v1/tenants/subscription/usage`

Check penggunaan subscription limits saat ini.

**Authentication**: JWT Required (Owner/Admin)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "subscription_plan": "PRO",
    "subscription_status": "active",
    "billing_cycle": "monthly",
    "next_billing_date": "2025-11-01",
    "limits": {
      "outlets": {
        "limit": 10,
        "used": 3,
        "remaining": 7,
        "percentage": 30
      },
      "staff": {
        "limit": 50,
        "used": 15,
        "remaining": 35,
        "percentage": 30
      },
      "monthly_appointments": {
        "limit": 2000,
        "used": 456,
        "remaining": 1544,
        "percentage": 22.8,
        "resets_at": "2025-11-01T00:00:00Z"
      }
    },
    "warnings": []
  }
}
```

**Response with Warnings**:
```json
{
  "status": "success",
  "data": {
    "subscription_plan": "PRO",
    "limits": {
      "monthly_appointments": {
        "limit": 2000,
        "used": 1850,
        "remaining": 150,
        "percentage": 92.5
      }
    },
    "warnings": [
      {
        "type": "limit_warning",
        "resource": "monthly_appointments",
        "message": "You have used 92.5% of your monthly appointments limit",
        "action": "Consider upgrading your plan"
      }
    ]
  }
}
```

**Implementation Notes**:
- Warning muncul saat usage > 80%
- Alert muncul saat usage > 95%
- Blocking saat usage >= 100% (tergantung resource type)

---

## 7. Delete Tenant (Close Business)

### DELETE `/api/v1/tenants`

Close bisnis dan hapus tenant (soft delete).

**Authentication**: JWT Required (Owner only)

**Request Body**:
```json
{
  "confirmation": "DELETE",
  "reason": "Closing business permanently",
  "password": "owner_password"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Tenant has been scheduled for deletion. All data will be permanently deleted after 30 days."
}
```

**Implementation Notes**:
- Soft delete: data tidak langsung dihapus
- Grace period 30 hari untuk recovery
- Owner menerima email confirmation
- Semua appointment di-cancel otomatis
- Customer menerima notifikasi

---

## Implementation Guide untuk Dashboard

### Tenant Profile Page

```typescript
// Get tenant profile
const getTenantProfile = async () => {
  const response = await makeAuthenticatedRequest('/api/v1/tenants/profile');
  return response.data;
};

// Update tenant profile
const updateTenantProfile = async (profileData: TenantProfile) => {
  const response = await makeAuthenticatedRequest('/api/v1/tenants/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  return response;
};

// Upload logo
const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('logo', file);

  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/v1/tenants/logo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### Settings Page

```typescript
// Get current settings
const getSettings = async () => {
  const profile = await getTenantProfile();
  return profile.settings;
};

// Update settings
const updateSettings = async (settings: TenantSettings) => {
  const response = await makeAuthenticatedRequest('/api/v1/tenants/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
  return response;
};
```

### Dashboard Analytics

```typescript
// Get statistics for dashboard
const getDashboardStats = async (period: string = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/tenants/statistics?period=${period}`
  );
  return response.data;
};

// Usage
const stats = await getDashboardStats('month');
console.log('Total Revenue:', stats.overview.total_revenue);
console.log('Appointments:', stats.overview.total_appointments);
```

### Subscription Usage Widget

```typescript
// Check subscription usage
const getSubscriptionUsage = async () => {
  const response = await makeAuthenticatedRequest('/api/v1/tenants/subscription/usage');
  return response.data;
};

// Display warnings
const checkLimits = async () => {
  const usage = await getSubscriptionUsage();

  if (usage.warnings.length > 0) {
    // Show warning notifications
    usage.warnings.forEach(warning => {
      showWarning(warning.message);
    });
  }

  return usage;
};
```

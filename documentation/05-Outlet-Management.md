# Outlet Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin/Manager)

API untuk mengelola outlet/cabang bisnis. Tenant bisa memiliki multiple outlets tergantung subscription plan.

---

## 1. Get All Outlets

### GET `/api/v1/outlets`

Mendapatkan daftar semua outlet milik tenant.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?status=active&page=1&limit=20
```

**Parameters**:
- `status` (optional, enum): active, inactive, all (default: active)
- `search` (optional, string): Search by outlet name
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "outlet_id": "outlet_123",
      "tenant_id": "tenant_abc123",
      "name": "Beauty Salon XYZ - Central",
      "code": "BTY-CNT",
      "status": "active",
      "address": {
        "street": "Jl. Sudirman No. 123",
        "city": "Jakarta",
        "province": "DKI Jakarta",
        "postal_code": "12190",
        "coordinates": {
          "lat": -6.2088,
          "lng": 106.8456
        }
      },
      "phone": "+62812345678",
      "email": "central@beautysalon.com",
      "manager": {
        "staff_id": "staff_789",
        "name": "Sarah Manager"
      },
      "operating_hours": {
        "monday": { "open": "09:00", "close": "18:00" },
        "tuesday": { "open": "09:00", "close": "18:00" },
        "wednesday": { "open": "09:00", "close": "18:00" },
        "thursday": { "open": "09:00", "close": "18:00" },
        "friday": { "open": "09:00", "close": "20:00" },
        "saturday": { "open": "10:00", "close": "20:00" },
        "sunday": { "closed": true }
      },
      "staff_count": 8,
      "services_count": 25,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

---

## 2. Get Outlet Details

### GET `/api/v1/outlets/{outlet_id}`

Mendapatkan detail lengkap outlet.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "tenant_id": "tenant_abc123",
    "name": "Beauty Salon XYZ - Central",
    "code": "BTY-CNT",
    "description": "Our main branch in central Jakarta",
    "status": "active",
    "address": {
      "street": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postal_code": "12190",
      "country": "Indonesia",
      "coordinates": {
        "lat": -6.2088,
        "lng": 106.8456
      }
    },
    "phone": "+62812345678",
    "email": "central@beautysalon.com",
    "manager": {
      "staff_id": "staff_789",
      "name": "Sarah Manager",
      "email": "sarah@beautysalon.com",
      "phone": "+62812345679"
    },
    "operating_hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      "wednesday": { "open": "09:00", "close": "18:00" },
      "thursday": { "open": "09:00", "close": "18:00" },
      "friday": { "open": "09:00", "close": "20:00" },
      "saturday": { "open": "10:00", "close": "20:00" },
      "sunday": { "closed": true }
    },
    "amenities": ["WiFi", "Parking", "Refreshments", "Air Conditioning"],
    "images": [
      "https://storage.url/outlet1.jpg",
      "https://storage.url/outlet2.jpg"
    ],
    "social_media": {
      "instagram": "@beautysaloncentral",
      "facebook": "beautysaloncentral"
    },
    "staff_count": 8,
    "services_count": 25,
    "rating": 4.8,
    "total_reviews": 156,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-10-15T08:00:00Z"
  }
}
```

---

## 3. Create Outlet

### POST `/api/v1/outlets`

Buat outlet baru.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "name": "Beauty Salon XYZ - South",
  "code": "BTY-STH",
  "description": "New branch in South Jakarta",
  "address": {
    "street": "Jl. Gatot Subroto No. 456",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12930",
    "country": "Indonesia",
    "coordinates": {
      "lat": -6.2297,
      "lng": 106.8261
    }
  },
  "phone": "+62812345680",
  "email": "south@beautysalon.com",
  "manager_id": "staff_790",
  "operating_hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "20:00" },
    "saturday": { "open": "10:00", "close": "20:00" },
    "sunday": { "closed": true }
  },
  "amenities": ["WiFi", "Parking"]
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_124",
    "name": "Beauty Salon XYZ - South",
    "code": "BTY-STH",
    "status": "active",
    "created_at": "2025-10-15T09:00:00Z"
  },
  "message": "Outlet created successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Outlet limit reached for your subscription plan",
  "code": "OUTLET_LIMIT_EXCEEDED",
  "details": {
    "current_outlets": 10,
    "plan_limit": 10,
    "action_required": "Upgrade your subscription to add more outlets"
  }
}
```

**Validation Rules**:
- Name: minimal 3 karakter, unique per tenant
- Code: 3-10 karakter uppercase, unique per tenant
- Phone: format valid dengan country code
- Coordinates: untuk maps integration (optional)

---

## 4. Update Outlet

### PUT `/api/v1/outlets/{outlet_id}`

Update data outlet.

**Authentication**: JWT Required (Owner/Admin/Manager of the outlet)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Request Body**:
```json
{
  "name": "Beauty Salon XYZ - Central Premium",
  "description": "Premium branch in central Jakarta",
  "phone": "+62812345678",
  "email": "central@beautysalon.com",
  "manager_id": "staff_789",
  "operating_hours": {
    "monday": { "open": "08:00", "close": "19:00" },
    "tuesday": { "open": "08:00", "close": "19:00" },
    "wednesday": { "open": "08:00", "close": "19:00" },
    "thursday": { "open": "08:00", "close": "19:00" },
    "friday": { "open": "08:00", "close": "21:00" },
    "saturday": { "open": "09:00", "close": "21:00" },
    "sunday": { "open": "10:00", "close": "18:00" }
  },
  "amenities": ["WiFi", "Parking", "Refreshments", "Air Conditioning", "Kids Play Area"]
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "name": "Beauty Salon XYZ - Central Premium",
    "updated_at": "2025-10-15T09:15:00Z"
  },
  "message": "Outlet updated successfully"
}
```

---

## 5. Deactivate Outlet

### POST `/api/v1/outlets/{outlet_id}/deactivate`

Nonaktifkan outlet (soft delete).

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Request Body**:
```json
{
  "reason": "Temporary closure for renovation",
  "cancel_future_appointments": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "status": "inactive",
    "deactivated_at": "2025-10-15T09:20:00Z",
    "future_appointments_canceled": 12
  },
  "message": "Outlet deactivated successfully"
}
```

**Implementation Notes**:
- Outlet inactive tidak muncul di public API
- Future appointments bisa di-cancel atau di-reschedule
- Staff di outlet tetap ada, tapi tidak bisa booking baru
- Data outlet tetap tersimpan (soft delete)

---

## 6. Reactivate Outlet

### POST `/api/v1/outlets/{outlet_id}/reactivate`

Aktifkan kembali outlet yang inactive.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "status": "active",
    "reactivated_at": "2025-10-20T10:00:00Z"
  },
  "message": "Outlet reactivated successfully"
}
```

---

## 7. Delete Outlet

### DELETE `/api/v1/outlets/{outlet_id}`

Hapus outlet permanent (hanya jika tidak ada appointment history).

**Authentication**: JWT Required (Owner only)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Request Body**:
```json
{
  "confirmation": "DELETE",
  "transfer_data_to_outlet_id": "outlet_124"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Outlet deleted successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Cannot delete outlet with appointment history",
  "code": "OUTLET_HAS_APPOINTMENTS",
  "details": {
    "total_appointments": 567,
    "action_required": "Use deactivate instead of delete"
  }
}
```

---

## 8. Get Outlet Statistics

### GET `/api/v1/outlets/{outlet_id}/statistics`

Mendapatkan statistik performa outlet.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Query Parameters**:
```
?period=month&start_date=2025-10-01&end_date=2025-10-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "outlet_name": "Beauty Salon XYZ - Central",
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "overview": {
      "total_appointments": 89,
      "completed_appointments": 82,
      "canceled_appointments": 5,
      "no_show_appointments": 2,
      "total_revenue": 13350000,
      "average_appointment_value": 150000,
      "occupancy_rate": 72.5
    },
    "top_services": [
      {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "bookings": 28,
        "revenue": 4200000
      }
    ],
    "staff_performance": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "appointments": 24,
        "revenue": 3600000,
        "rating": 4.9
      }
    ],
    "daily_trend": [
      { "date": "2025-10-01", "appointments": 5, "revenue": 750000 },
      { "date": "2025-10-02", "appointments": 7, "revenue": 1050000 }
    ]
  }
}
```

---

## 9. Upload Outlet Images

### POST `/api/v1/outlets/{outlet_id}/images`

Upload gambar outlet.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
```
images: [File, File, File]
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "images": [
      {
        "image_id": "img_001",
        "url": "https://storage.url/outlet123/img1.jpg",
        "order": 0
      },
      {
        "image_id": "img_002",
        "url": "https://storage.url/outlet123/img2.jpg",
        "order": 1
      }
    ]
  },
  "message": "Images uploaded successfully"
}
```

**Validation Rules**:
- Max 10 images per outlet
- File types: image/jpeg, image/png, image/webp
- Max file size per image: 5MB
- Auto resize dan optimize

---

## Implementation Guide untuk Dashboard

### Outlets List Page

```typescript
// Get all outlets
const getOutlets = async (status = 'active') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/outlets?status=${status}`
  );
  return response.data;
};

// Display outlets in table/cards
const displayOutlets = async () => {
  const outlets = await getOutlets('active');

  return outlets.map(outlet => ({
    id: outlet.outlet_id,
    name: outlet.name,
    code: outlet.code,
    address: `${outlet.address.street}, ${outlet.address.city}`,
    manager: outlet.manager?.name || 'Not assigned',
    staffCount: outlet.staff_count,
    status: outlet.status
  }));
};
```

### Create/Edit Outlet Form

```typescript
// Create outlet
const createOutlet = async (outletData: OutletFormData) => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/outlets', {
      method: 'POST',
      body: JSON.stringify(outletData)
    });

    if (response.status === 'success') {
      showSuccess('Outlet created successfully!');
      router.push('/outlets');
    }
  } catch (error) {
    if (error.code === 'OUTLET_LIMIT_EXCEEDED') {
      showError(error.message);
      showUpgradeModal();
    }
  }
};

// Update outlet
const updateOutlet = async (outletId: string, outletData: OutletFormData) => {
  const response = await makeAuthenticatedRequest(`/api/v1/outlets/${outletId}`, {
    method: 'PUT',
    body: JSON.stringify(outletData)
  });

  return response;
};

// Operating hours form
const OperatingHoursForm = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return days.map(day => ({
    day,
    open: '09:00',
    close: '18:00',
    closed: false
  }));
};
```

### Outlet Detail Page

```typescript
// Get outlet details
const getOutletDetails = async (outletId: string) => {
  const response = await makeAuthenticatedRequest(`/api/v1/outlets/${outletId}`);
  return response.data;
};

// Get outlet statistics
const getOutletStats = async (outletId: string, period = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/outlets/${outletId}/statistics?period=${period}`
  );
  return response.data;
};

// Deactivate outlet
const deactivateOutlet = async (outletId: string, reason: string) => {
  const confirmed = await confirmDialog(
    'Are you sure you want to deactivate this outlet?'
  );

  if (confirmed) {
    const response = await makeAuthenticatedRequest(
      `/api/v1/outlets/${outletId}/deactivate`,
      {
        method: 'POST',
        body: JSON.stringify({
          reason,
          cancel_future_appointments: true
        })
      }
    );

    return response;
  }
};
```

### Image Upload

```typescript
// Upload outlet images
const uploadOutletImages = async (outletId: string, files: FileList) => {
  const formData = new FormData();

  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  const token = localStorage.getItem('access_token');

  const response = await fetch(`/api/v1/outlets/${outletId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

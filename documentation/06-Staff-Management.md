# Staff Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin/Manager)

API untuk mengelola data staff/karyawan. Owner dan Admin dapat manage semua staff, Manager hanya staff di outlet yang dikelola.

---

## 1. Get All Staff

### GET `/api/v1/staff`

Mendapatkan daftar semua staff.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?outlet_id=outlet_123&role=staff&status=active&page=1&limit=20
```

**Parameters**:
- `outlet_id` (optional, string): Filter by outlet
- `role` (optional, enum): owner, admin, manager, staff
- `status` (optional, enum): active, inactive, all (default: active)
- `search` (optional, string): Search by name or email
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "staff_id": "staff_456",
      "user_id": "user_123",
      "name": "Jane Smith",
      "email": "jane@beautysalon.com",
      "phone": "+62812345679",
      "role": "staff",
      "status": "active",
      "photo": "https://storage.url/staff456.jpg",
      "outlets": [
        {
          "outlet_id": "outlet_123",
          "outlet_name": "Beauty Salon XYZ - Central",
          "is_primary": true
        }
      ],
      "specializations": ["Hair", "Makeup"],
      "rating": 4.9,
      "total_appointments": 234,
      "joined_date": "2025-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

---

## 2. Get Staff Details

### GET `/api/v1/staff/{staff_id}`

Mendapatkan detail lengkap staff.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "user_id": "user_123",
    "personal_info": {
      "name": "Jane Smith",
      "email": "jane@beautysalon.com",
      "phone": "+62812345679",
      "date_of_birth": "1995-03-20",
      "gender": "female",
      "photo": "https://storage.url/staff456.jpg"
    },
    "employment": {
      "role": "staff",
      "status": "active",
      "employee_id": "EMP-001",
      "joined_date": "2025-01-15",
      "contract_type": "full_time"
    },
    "outlets": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central",
        "is_primary": true,
        "assigned_date": "2025-01-15"
      },
      {
        "outlet_id": "outlet_124",
        "outlet_name": "Beauty Salon XYZ - South",
        "is_primary": false,
        "assigned_date": "2025-03-01"
      }
    ],
    "specializations": ["Hair", "Makeup"],
    "services": [
      {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "category": "hair"
      },
      {
        "service_id": "service_125",
        "service_name": "Makeup Party",
        "category": "makeup"
      }
    ],
    "working_hours": {
      "monday": { "available": true, "start": "09:00", "end": "18:00" },
      "tuesday": { "available": true, "start": "09:00", "end": "18:00" },
      "wednesday": { "available": true, "start": "09:00", "end": "18:00" },
      "thursday": { "available": true, "start": "09:00", "end": "18:00" },
      "friday": { "available": true, "start": "09:00", "end": "20:00" },
      "saturday": { "available": true, "start": "10:00", "end": "20:00" },
      "sunday": { "available": false }
    },
    "performance": {
      "rating": 4.9,
      "total_reviews": 87,
      "total_appointments": 234,
      "completed_appointments": 228,
      "canceled_appointments": 4,
      "no_show_appointments": 2
    },
    "permissions": [
      "appointments.read",
      "appointments.create",
      "customers.read"
    ],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-10-15T08:00:00Z"
  }
}
```

---

## 3. Create Staff

### POST `/api/v1/staff`

Tambah staff baru.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "name": "John Therapist",
  "email": "john@beautysalon.com",
  "phone": "+62812345680",
  "password": "SecurePassword123!",
  "role": "staff",
  "employee_id": "EMP-002",
  "date_of_birth": "1992-07-10",
  "gender": "male",
  "contract_type": "full_time",
  "outlet_ids": ["outlet_123"],
  "primary_outlet_id": "outlet_123",
  "specializations": ["Massage", "Body Treatment"],
  "service_ids": ["service_126", "service_127"],
  "working_hours": {
    "monday": { "available": true, "start": "09:00", "end": "18:00" },
    "tuesday": { "available": true, "start": "09:00", "end": "18:00" },
    "wednesday": { "available": true, "start": "09:00", "end": "18:00" },
    "thursday": { "available": true, "start": "09:00", "end": "18:00" },
    "friday": { "available": true, "start": "09:00", "end": "18:00" },
    "saturday": { "available": false },
    "sunday": { "available": false }
  }
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_457",
    "user_id": "user_124",
    "name": "John Therapist",
    "email": "john@beautysalon.com",
    "role": "staff",
    "created_at": "2025-10-15T09:00:00Z"
  },
  "message": "Staff created successfully. Welcome email has been sent."
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Staff limit reached for your subscription plan",
  "code": "STAFF_LIMIT_EXCEEDED",
  "details": {
    "current_staff": 50,
    "plan_limit": 50,
    "action_required": "Upgrade your subscription to add more staff"
  }
}
```

**Validation Rules**:
- Email unique per tenant
- Password minimal 8 karakter
- Role: owner, admin, manager, staff
- Contract type: full_time, part_time, freelance
- Phone format valid

---

## 4. Update Staff

### PUT `/api/v1/staff/{staff_id}`

Update data staff.

**Authentication**: JWT Required (Owner/Admin/Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "name": "Jane Smith Updated",
  "phone": "+62812345679",
  "specializations": ["Hair", "Makeup", "Nails"],
  "service_ids": ["service_123", "service_125", "service_128"],
  "working_hours": {
    "monday": { "available": true, "start": "08:00", "end": "17:00" },
    "tuesday": { "available": true, "start": "08:00", "end": "17:00" },
    "wednesday": { "available": true, "start": "08:00", "end": "17:00" },
    "thursday": { "available": true, "start": "08:00", "end": "17:00" },
    "friday": { "available": true, "start": "08:00", "end": "19:00" },
    "saturday": { "available": true, "start": "09:00", "end": "19:00" },
    "sunday": { "available": true, "start": "10:00", "end": "16:00" }
  }
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "name": "Jane Smith Updated",
    "updated_at": "2025-10-15T09:15:00Z"
  },
  "message": "Staff updated successfully"
}
```

---

## 5. Update Staff Role

### PUT `/api/v1/staff/{staff_id}/role`

Update role dan permissions staff.

**Authentication**: JWT Required (Owner/Admin only)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "role": "manager",
  "permissions": [
    "appointments.read",
    "appointments.create",
    "appointments.update",
    "appointments.cancel",
    "staff.read",
    "customers.read",
    "customers.create",
    "services.read",
    "reports.read"
  ]
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "role": "manager",
    "permissions": [...],
    "updated_at": "2025-10-15T09:20:00Z"
  },
  "message": "Staff role updated successfully"
}
```

**Available Permissions**:
- `appointments.*` - Full appointments access
- `appointments.read` - View appointments
- `appointments.create` - Create appointments
- `appointments.update` - Edit appointments
- `appointments.cancel` - Cancel appointments
- `staff.read` - View staff
- `staff.manage` - Manage staff (create, edit, delete)
- `customers.*` - Full customer access
- `customers.read` - View customers
- `customers.create` - Add customers
- `services.*` - Full services access
- `outlets.read` - View outlets
- `reports.read` - View reports
- `settings.manage` - Manage settings

---

## 6. Assign Staff to Outlets

### POST `/api/v1/staff/{staff_id}/outlets`

Assign staff ke outlet(s).

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "outlet_ids": ["outlet_123", "outlet_124"],
  "primary_outlet_id": "outlet_123"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "outlets": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central",
        "is_primary": true
      },
      {
        "outlet_id": "outlet_124",
        "outlet_name": "Beauty Salon XYZ - South",
        "is_primary": false
      }
    ]
  },
  "message": "Staff assigned to outlets successfully"
}
```

---

## 7. Deactivate Staff

### POST `/api/v1/staff/{staff_id}/deactivate`

Nonaktifkan staff (soft delete).

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "reason": "Resigned",
  "last_working_date": "2025-10-31",
  "cancel_future_appointments": true,
  "reassign_appointments_to": "staff_458"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "status": "inactive",
    "deactivated_at": "2025-10-15T09:30:00Z",
    "last_working_date": "2025-10-31",
    "appointments_reassigned": 8
  },
  "message": "Staff deactivated successfully"
}
```

---

## 8. Get Staff Availability

### GET `/api/v1/staff/{staff_id}/availability`

Check availability staff untuk tanggal tertentu.

**Authentication**: JWT Required (Staff) atau Public

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Query Parameters**:
```
?date=2025-10-20&outlet_id=outlet_123
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "staff_name": "Jane Smith",
    "date": "2025-10-20",
    "outlet_id": "outlet_123",
    "is_working": true,
    "working_hours": {
      "start": "09:00",
      "end": "18:00"
    },
    "available_slots": [
      {
        "start_time": "09:00",
        "end_time": "09:45",
        "is_available": true
      },
      {
        "start_time": "10:00",
        "end_time": "10:45",
        "is_available": false,
        "appointment_id": "apt_123"
      },
      {
        "start_time": "11:00",
        "end_time": "11:45",
        "is_available": true
      }
    ],
    "total_appointments": 5,
    "available_slots_count": 12
  }
}
```

---

## 9. Get Staff Performance

### GET `/api/v1/staff/{staff_id}/performance`

Mendapatkan performa metrics staff.

**Authentication**: JWT Required (Owner/Admin/Manager/Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Query Parameters**:
```
?period=month&start_date=2025-10-01&end_date=2025-10-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "staff_name": "Jane Smith",
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "metrics": {
      "total_appointments": 38,
      "completed_appointments": 36,
      "canceled_appointments": 1,
      "no_show_appointments": 1,
      "completion_rate": 94.7,
      "total_revenue": 5700000,
      "average_appointment_value": 150000,
      "rating": 4.9,
      "total_reviews": 28,
      "5_star_reviews": 25,
      "utilization_rate": 82.5
    },
    "top_services": [
      {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "bookings": 18,
        "revenue": 2700000
      }
    ],
    "daily_appointments": [
      { "date": "2025-10-01", "appointments": 3, "revenue": 450000 },
      { "date": "2025-10-02", "appointments": 4, "revenue": 600000 }
    ]
  }
}
```

---

## 10. Upload Staff Photo

### POST `/api/v1/staff/{staff_id}/photo`

Upload foto profil staff.

**Authentication**: JWT Required (Owner/Admin/Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
```
photo: [File]
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "photo_url": "https://storage.url/staff456.jpg",
    "uploaded_at": "2025-10-15T09:40:00Z"
  },
  "message": "Photo uploaded successfully"
}
```

**Validation Rules**:
- File types: image/jpeg, image/png
- Max file size: 2MB
- Auto crop to square and resize to 512x512px

---

## Implementation Guide untuk Dashboard

### Staff List Page

```typescript
// Get all staff
const getStaff = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(`/api/v1/staff?${params}`);
  return response.data;
};

// Filter by outlet
const getStaffByOutlet = async (outletId: string) => {
  return getStaff({ outlet_id: outletId, status: 'active' });
};
```

### Create/Edit Staff Form

```typescript
// Create staff
const createStaff = async (staffData: StaffFormData) => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });

    if (response.status === 'success') {
      showSuccess('Staff created successfully!');
      router.push('/staff');
    }
  } catch (error) {
    if (error.code === 'STAFF_LIMIT_EXCEEDED') {
      showError(error.message);
      showUpgradeModal();
    }
  }
};

// Update staff
const updateStaff = async (staffId: string, staffData: StaffFormData) => {
  const response = await makeAuthenticatedRequest(`/api/v1/staff/${staffId}`, {
    method: 'PUT',
    body: JSON.stringify(staffData)
  });

  return response;
};
```

### Staff Schedule Component

```typescript
// Get staff availability
const getStaffAvailability = async (staffId: string, date: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/staff/${staffId}/availability?date=${date}`
  );
  return response.data;
};

// Display schedule
const StaffSchedule = ({ staffId, date }) => {
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    getStaffAvailability(staffId, date).then(setAvailability);
  }, [staffId, date]);

  return availability?.available_slots.map(slot => ({
    time: `${slot.start_time} - ${slot.end_time}`,
    status: slot.is_available ? 'Available' : 'Booked'
  }));
};
```

### Staff Performance Dashboard

```typescript
// Get performance metrics
const getStaffPerformance = async (staffId: string, period = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/staff/${staffId}/performance?period=${period}`
  );
  return response.data;
};

// Display metrics
const StaffPerformanceCard = ({ staffId }) => {
  const performance = await getStaffPerformance(staffId);

  return {
    appointments: performance.metrics.total_appointments,
    completionRate: performance.metrics.completion_rate,
    revenue: formatCurrency(performance.metrics.total_revenue),
    rating: performance.metrics.rating,
    utilizationRate: performance.metrics.utilization_rate
  };
};
```

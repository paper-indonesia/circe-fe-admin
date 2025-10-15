# Customer Management API

**Level Akses**: 🟧 Staff Portal (All roles can read, Owner/Admin/Manager can manage)

API untuk mengelola data customer/pelanggan.

---

## 1. Get All Customers

### GET `/api/v1/customers`

Mendapatkan daftar semua customers.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?search=john&status=active&outlet_id=outlet_123&page=1&limit=20
```

**Parameters**:
- `search` (optional, string): Search by name, email, or phone
- `status` (optional, enum): active, inactive, all (default: active)
- `outlet_id` (optional, string): Filter customers by outlet (based on appointments)
- `registration_source` (optional, enum): staff_portal, customer_app, walkin
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "customer_id": "customer_123",
      "name": "John Customer",
      "email": "john@customer.com",
      "phone": "+62812345680",
      "status": "active",
      "profile_photo": "https://storage.url/customer123.jpg",
      "date_of_birth": "1990-05-15",
      "gender": "male",
      "registration_source": "customer_app",
      "total_appointments": 24,
      "completed_appointments": 22,
      "canceled_appointments": 2,
      "total_spent": 3600000,
      "last_visit": "2025-10-10T14:00:00Z",
      "member_since": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 234,
    "total_pages": 12
  }
}
```

---

## 2. Get Customer Details

### GET `/api/v1/customers/{customer_id}`

Mendapatkan detail lengkap customer.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "personal_info": {
      "name": "John Customer",
      "email": "john@customer.com",
      "phone": "+62812345680",
      "profile_photo": "https://storage.url/customer123.jpg",
      "date_of_birth": "1990-05-15",
      "gender": "male",
      "address": {
        "street": "Jl. Customer No. 456",
        "city": "Jakarta",
        "province": "DKI Jakarta",
        "postal_code": "12345"
      }
    },
    "account_info": {
      "status": "active",
      "email_verified": true,
      "phone_verified": true,
      "registration_source": "customer_app",
      "member_since": "2025-01-15T10:00:00Z",
      "last_login": "2025-10-14T18:30:00Z"
    },
    "preferences": {
      "preferred_outlet": {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central"
      },
      "preferred_staff": [
        {
          "staff_id": "staff_456",
          "staff_name": "Jane Smith"
        }
      ],
      "preferred_services": ["service_123", "service_125"],
      "communication_preferences": {
        "email_notifications": true,
        "sms_notifications": true,
        "whatsapp_notifications": false,
        "marketing_emails": true
      }
    },
    "statistics": {
      "total_appointments": 24,
      "completed_appointments": 22,
      "canceled_appointments": 2,
      "no_show_appointments": 0,
      "total_spent": 3600000,
      "average_appointment_value": 150000,
      "last_visit": "2025-10-10T14:00:00Z",
      "visit_frequency_days": 15
    },
    "notes": [
      {
        "note_id": "note_001",
        "content": "Allergic to certain hair products",
        "created_by": "staff_456",
        "created_at": "2025-02-10T10:00:00Z"
      }
    ],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-10-14T18:30:00Z"
  }
}
```

---

## 3. Create Customer

### POST `/api/v1/customers`

Tambah customer baru (walk-in atau manual registration).

**Authentication**: JWT Required (Staff)

**Request Body**:
```json
{
  "name": "Jane Customer",
  "email": "jane.new@customer.com",
  "phone": "+62812345681",
  "date_of_birth": "1992-08-20",
  "gender": "female",
  "address": {
    "street": "Jl. New Customer No. 789",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345"
  },
  "registration_source": "staff_portal",
  "notes": "Prefers natural products"
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_125",
    "name": "Jane Customer",
    "email": "jane.new@customer.com",
    "phone": "+62812345681",
    "created_at": "2025-10-15T09:00:00Z"
  },
  "message": "Customer created successfully"
}
```

**Validation Rules**:
- Email atau phone harus ada (minimal salah satu)
- Email unique jika diisi
- Phone unique jika diisi
- Name minimal 2 karakter

---

## 4. Update Customer

### PUT `/api/v1/customers/{customer_id}`

Update data customer.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Request Body**:
```json
{
  "name": "John Customer Updated",
  "phone": "+62812345680",
  "date_of_birth": "1990-05-15",
  "address": {
    "street": "Jl. Customer No. 456",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345"
  },
  "preferences": {
    "preferred_outlet": "outlet_123",
    "preferred_staff": ["staff_456", "staff_457"],
    "communication_preferences": {
      "email_notifications": true,
      "sms_notifications": true,
      "marketing_emails": false
    }
  }
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "name": "John Customer Updated",
    "updated_at": "2025-10-15T09:15:00Z"
  },
  "message": "Customer updated successfully"
}
```

---

## 5. Add Customer Note

### POST `/api/v1/customers/{customer_id}/notes`

Tambah catatan untuk customer.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Request Body**:
```json
{
  "content": "Customer requested specific hair stylist for next appointment",
  "is_private": false
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "note_id": "note_002",
    "customer_id": "customer_123",
    "content": "Customer requested specific hair stylist for next appointment",
    "created_by": {
      "staff_id": "staff_456",
      "staff_name": "Jane Smith"
    },
    "created_at": "2025-10-15T09:20:00Z"
  },
  "message": "Note added successfully"
}
```

**Implementation Notes**:
- Notes untuk track customer preferences, allergies, dll
- `is_private` flag untuk notes yang hanya visible untuk admin
- Auto-track siapa yang buat note

---

## 6. Get Customer Appointment History

### GET `/api/v1/customers/{customer_id}/appointments`

Mendapatkan riwayat appointment customer.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Query Parameters**:
```
?status=completed&start_date=2025-01-01&end_date=2025-12-31&page=1&limit=20
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "appointment_id": "apt_123",
      "appointment_date": "2025-10-10",
      "start_time": "14:00",
      "end_time": "14:45",
      "service": {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash"
      },
      "staff": {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith"
      },
      "outlet": {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central"
      },
      "status": "completed",
      "total_amount": 150000,
      "payment_status": "paid",
      "rating": 5,
      "review": "Excellent service!",
      "created_at": "2025-10-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "total_pages": 2
  }
}
```

---

## 7. Get Customer Statistics

### GET `/api/v1/customers/{customer_id}/statistics`

Mendapatkan statistik customer.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Query Parameters**:
```
?period=all&start_date=2025-01-01&end_date=2025-12-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "customer_name": "John Customer",
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-12-31"
    },
    "metrics": {
      "total_appointments": 24,
      "completed_appointments": 22,
      "canceled_appointments": 2,
      "no_show_appointments": 0,
      "completion_rate": 91.7,
      "total_spent": 3600000,
      "average_appointment_value": 150000,
      "visit_frequency_days": 15
    },
    "favorite_services": [
      {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "bookings": 12,
        "total_spent": 1800000
      },
      {
        "service_id": "service_125",
        "service_name": "Makeup Party",
        "bookings": 6,
        "total_spent": 900000
      }
    },
    "favorite_staff": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "appointments": 18
      }
    ],
    "visit_outlets": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central",
        "visits": 20
      }
    ],
    "monthly_spending": [
      { "month": "2025-01", "amount": 300000 },
      { "month": "2025-02", "amount": 450000 }
    ]
  }
}
```

---

## 8. Deactivate Customer

### POST `/api/v1/customers/{customer_id}/deactivate`

Nonaktifkan customer account (soft delete).

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `customer_id` (required, string): ID customer

**Request Body**:
```json
{
  "reason": "Customer requested account deletion",
  "cancel_future_appointments": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "customer_id": "customer_123",
    "status": "inactive",
    "deactivated_at": "2025-10-15T09:30:00Z",
    "appointments_canceled": 2
  },
  "message": "Customer account deactivated"
}
```

---

## 9. Merge Customers

### POST `/api/v1/customers/merge`

Merge duplicate customer accounts.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "primary_customer_id": "customer_123",
  "duplicate_customer_id": "customer_125",
  "merge_appointments": true,
  "merge_notes": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "primary_customer_id": "customer_123",
    "merged_appointments": 5,
    "merged_notes": 2,
    "merged_at": "2025-10-15T09:40:00Z"
  },
  "message": "Customer accounts merged successfully"
}
```

**Implementation Notes**:
- Merge digunakan untuk consolidate duplicate accounts
- Semua data dari duplicate account dipindah ke primary account
- Duplicate account di-deactivate setelah merge

---

## 10. Export Customers

### GET `/api/v1/customers/export`

Export customer data to CSV/Excel.

**Authentication**: JWT Required (Owner/Admin)

**Query Parameters**:
```
?format=csv&status=active&include_stats=true
```

**Response Success (200 OK)**:
- Content-Type: text/csv or application/xlsx
- File download

---

## Implementation Guide untuk Dashboard

### Customer List Page

```typescript
// Get all customers
const getCustomers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(`/api/v1/customers?${params}`);
  return response.data;
};

// Search customers
const searchCustomers = async (query: string) => {
  return getCustomers({ search: query, status: 'active' });
};

// Display customers table
const displayCustomers = async () => {
  const customers = await getCustomers({ status: 'active', page: 1 });

  return customers.map(customer => ({
    id: customer.customer_id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    totalVisits: customer.total_appointments,
    totalSpent: formatCurrency(customer.total_spent),
    lastVisit: formatDate(customer.last_visit)
  }));
};
```

### Customer Detail Page

```typescript
// Get customer details
const getCustomerDetails = async (customerId: string) => {
  const response = await makeAuthenticatedRequest(`/api/v1/customers/${customerId}`);
  return response.data;
};

// Get customer appointments
const getCustomerAppointments = async (customerId: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/customers/${customerId}/appointments`
  );
  return response.data;
};

// Get customer statistics
const getCustomerStats = async (customerId: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/customers/${customerId}/statistics`
  );
  return response.data;
};

// Customer profile component
const CustomerProfile = ({ customerId }) => {
  const details = await getCustomerDetails(customerId);
  const stats = await getCustomerStats(customerId);

  return {
    name: details.personal_info.name,
    email: details.personal_info.email,
    phone: details.personal_info.phone,
    memberSince: formatDate(details.account_info.member_since),
    totalSpent: formatCurrency(stats.metrics.total_spent),
    totalVisits: stats.metrics.total_appointments,
    favoriteServices: stats.favorite_services,
    favoriteStaff: stats.favorite_staff
  };
};
```

### Create/Edit Customer Form

```typescript
// Create customer
const createCustomer = async (customerData: CustomerFormData) => {
  const response = await makeAuthenticatedRequest('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(customerData)
  });

  if (response.status === 'success') {
    showSuccess('Customer created successfully!');
    return response.data;
  }
};

// Update customer
const updateCustomer = async (customerId: string, customerData: CustomerFormData) => {
  const response = await makeAuthenticatedRequest(`/api/v1/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(customerData)
  });

  return response;
};

// Customer form component
const CustomerForm = ({ customerId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      province: '',
      postal_code: ''
    },
    preferences: {
      communication_preferences: {
        email_notifications: true,
        sms_notifications: true,
        marketing_emails: true
      }
    }
  });

  const handleSubmit = async () => {
    if (customerId) {
      await updateCustomer(customerId, formData);
    } else {
      await createCustomer(formData);
    }
  };

  return { formData, setFormData, handleSubmit };
};
```

### Customer Notes Component

```typescript
// Add customer note
const addCustomerNote = async (customerId: string, content: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/customers/${customerId}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ content, is_private: false })
    }
  );

  return response;
};

// Display notes
const CustomerNotes = ({ customerId }) => {
  const details = await getCustomerDetails(customerId);

  return details.notes.map(note => ({
    content: note.content,
    createdBy: note.created_by,
    createdAt: formatDate(note.created_at)
  }));
};
```

### Customer Search & Autocomplete

```typescript
// Search for booking
const customerSearchAutocomplete = async (query: string) => {
  if (query.length < 2) return [];

  const customers = await searchCustomers(query);

  return customers.map(customer => ({
    value: customer.customer_id,
    label: `${customer.name} - ${customer.phone}`,
    email: customer.email,
    phone: customer.phone
  }));
};

// Usage in booking form
const BookingForm = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleCustomerSearch = async (query: string) => {
    const results = await customerSearchAutocomplete(query);
    return results;
  };

  return {
    selectedCustomer,
    setSelectedCustomer,
    handleCustomerSearch
  };
};
```

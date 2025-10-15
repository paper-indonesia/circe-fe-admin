# Services Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin/Manager)

API untuk mengelola layanan/treatment yang ditawarkan oleh bisnis.

---

## 1. Get All Services

### GET `/api/v1/services`

Mendapatkan daftar semua services.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?category=hair&outlet_id=outlet_123&status=active&page=1&limit=50
```

**Parameters**:
- `category` (optional, string): Filter by category
- `outlet_id` (optional, string): Filter by outlet
- `status` (optional, enum): active, inactive, all (default: active)
- `search` (optional, string): Search by name
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "service_id": "service_123",
      "name": "Hair Cut & Wash",
      "description": "Professional hair cut with premium products",
      "category": "hair",
      "duration_minutes": 45,
      "price": 150000,
      "currency": "IDR",
      "status": "active",
      "image": "https://storage.url/service123.jpg",
      "available_at_outlets": [
        {
          "outlet_id": "outlet_123",
          "outlet_name": "Beauty Salon XYZ - Central"
        }
      ],
      "staff_count": 5,
      "total_bookings": 230,
      "rating": 4.7,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "total_pages": 1
  }
}
```

**Service Categories**:
- `hair` - Hair services
- `facial` - Facial treatments
- `body_treatment` - Body treatments
- `nails` - Nail services
- `makeup` - Makeup services
- `massage` - Massage services
- `waxing` - Waxing services
- `spa` - Spa packages
- `other` - Other services

---

## 2. Get Service Details

### GET `/api/v1/services/{service_id}`

Mendapatkan detail lengkap service.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `service_id` (required, string): ID service

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "name": "Hair Cut & Wash",
    "description": "Professional hair cut with premium products including scalp massage",
    "category": "hair",
    "duration_minutes": 45,
    "buffer_time_minutes": 15,
    "price": 150000,
    "currency": "IDR",
    "status": "active",
    "image": "https://storage.url/service123.jpg",
    "available_at_outlets": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central",
        "price_override": null
      },
      {
        "outlet_id": "outlet_124",
        "outlet_name": "Beauty Salon XYZ - South",
        "price_override": 160000
      }
    ],
    "qualified_staff": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "photo": "https://storage.url/staff456.jpg",
        "rating": 4.9
      }
    ],
    "pricing_tiers": [
      {
        "tier_name": "Junior Stylist",
        "price": 150000
      },
      {
        "tier_name": "Senior Stylist",
        "price": 180000
      },
      {
        "tier_name": "Master Stylist",
        "price": 220000
      }
    ],
    "requirements": {
      "min_booking_notice_hours": 2,
      "max_advance_booking_days": 30,
      "cancellation_policy": "Cancel up to 24 hours before appointment"
    },
    "statistics": {
      "total_bookings": 230,
      "completed_bookings": 218,
      "rating": 4.7,
      "total_reviews": 156,
      "total_revenue": 34500000
    },
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-10-15T08:00:00Z"
  }
}
```

---

## 3. Create Service

### POST `/api/v1/services`

Buat service baru.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Request Body**:
```json
{
  "name": "Hair Coloring Full",
  "description": "Full hair coloring with professional dye and treatment",
  "category": "hair",
  "duration_minutes": 120,
  "buffer_time_minutes": 15,
  "price": 350000,
  "outlet_ids": ["outlet_123", "outlet_124"],
  "staff_ids": ["staff_456", "staff_457"],
  "requirements": {
    "min_booking_notice_hours": 4,
    "max_advance_booking_days": 30,
    "cancellation_policy": "Cancel up to 48 hours before appointment"
  }
}
```

**Field Descriptions**:
- `name` (required, string): Nama service
- `description` (required, string): Deskripsi lengkap service
- `category` (required, enum): Kategori service
- `duration_minutes` (required, integer): Durasi service dalam menit
- `buffer_time_minutes` (optional, integer): Waktu buffer setelah service (default: 15)
- `price` (required, integer): Harga base service
- `outlet_ids` (optional, array): Outlet yang menyediakan service
- `staff_ids` (optional, array): Staff yang qualified untuk service
- `requirements` (optional, object): Persyaratan booking

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_129",
    "name": "Hair Coloring Full",
    "price": 350000,
    "created_at": "2025-10-15T09:00:00Z"
  },
  "message": "Service created successfully"
}
```

**Validation Rules**:
- Name: minimal 3 karakter, maksimal 100 karakter
- Duration: minimal 15 menit, maksimal 480 menit (8 jam)
- Price: minimal 0 (untuk free service)
- Buffer time: default 15 menit

---

## 4. Update Service

### PUT `/api/v1/services/{service_id}`

Update data service.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `service_id` (required, string): ID service

**Request Body**:
```json
{
  "name": "Hair Cut & Wash Premium",
  "description": "Premium hair cut with luxury products and head massage",
  "duration_minutes": 60,
  "price": 180000,
  "outlet_ids": ["outlet_123", "outlet_124", "outlet_125"],
  "staff_ids": ["staff_456", "staff_457", "staff_458"]
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "name": "Hair Cut & Wash Premium",
    "updated_at": "2025-10-15T09:15:00Z"
  },
  "message": "Service updated successfully"
}
```

---

## 5. Set Service Price per Outlet

### PUT `/api/v1/services/{service_id}/outlet-pricing`

Set harga berbeda untuk outlet tertentu.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `service_id` (required, string): ID service

**Request Body**:
```json
{
  "outlet_pricing": [
    {
      "outlet_id": "outlet_123",
      "price": 150000
    },
    {
      "outlet_id": "outlet_124",
      "price": 160000
    },
    {
      "outlet_id": "outlet_125",
      "price": 170000
    }
  ]
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Service pricing updated for outlets"
}
```

**Implementation Notes**:
- Jika outlet tidak ada di list, gunakan base price
- Price override per outlet untuk lokasi dengan harga berbeda

---

## 6. Assign Staff to Service

### POST `/api/v1/services/{service_id}/staff`

Assign staff yang qualified untuk service.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `service_id` (required, string): ID service

**Request Body**:
```json
{
  "staff_ids": ["staff_456", "staff_457", "staff_458"],
  "pricing_tier": "standard"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "qualified_staff_count": 3
  },
  "message": "Staff assigned to service successfully"
}
```

---

## 7. Deactivate Service

### POST `/api/v1/services/{service_id}/deactivate`

Nonaktifkan service (soft delete).

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `service_id` (required, string): ID service

**Request Body**:
```json
{
  "reason": "Service no longer offered",
  "cancel_future_appointments": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "status": "inactive",
    "deactivated_at": "2025-10-15T09:30:00Z",
    "appointments_canceled": 5
  },
  "message": "Service deactivated successfully"
}
```

---

## 8. Upload Service Image

### POST `/api/v1/services/{service_id}/image`

Upload gambar service.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `service_id` (required, string): ID service

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
```
image: [File]
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "image_url": "https://storage.url/service123.jpg",
    "uploaded_at": "2025-10-15T09:40:00Z"
  },
  "message": "Service image uploaded successfully"
}
```

---

## 9. Get Service Statistics

### GET `/api/v1/services/{service_id}/statistics`

Mendapatkan statistik performa service.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `service_id` (required, string): ID service

**Query Parameters**:
```
?period=month&start_date=2025-10-01&end_date=2025-10-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "service_id": "service_123",
    "service_name": "Hair Cut & Wash",
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "metrics": {
      "total_bookings": 45,
      "completed_bookings": 42,
      "canceled_bookings": 2,
      "no_show_bookings": 1,
      "completion_rate": 93.3,
      "total_revenue": 6750000,
      "average_price": 150000,
      "rating": 4.7,
      "total_reviews": 38
    },
    "booking_trend": [
      { "date": "2025-10-01", "bookings": 3, "revenue": 450000 },
      { "date": "2025-10-02", "bookings": 4, "revenue": 600000 }
    ],
    "top_staff": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "bookings": 18,
        "revenue": 2700000
      }
    ],
    "outlet_performance": [
      {
        "outlet_id": "outlet_123",
        "outlet_name": "Central Branch",
        "bookings": 28,
        "revenue": 4200000
      }
    ]
  }
}
```

---

## Implementation Guide untuk Dashboard

### Services List Page

```typescript
// Get all services
const getServices = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(`/api/v1/services?${params}`);
  return response.data;
};

// Filter by category
const getServicesByCategory = async (category: string) => {
  return getServices({ category, status: 'active' });
};

// Display services grid
const displayServices = async () => {
  const services = await getServices({ status: 'active' });

  return services.map(service => ({
    id: service.service_id,
    name: service.name,
    category: service.category,
    price: formatCurrency(service.price),
    duration: `${service.duration_minutes} min`,
    rating: service.rating,
    image: service.image
  }));
};
```

### Create/Edit Service Form

```typescript
// Create service
const createService = async (serviceData: ServiceFormData) => {
  const response = await makeAuthenticatedRequest('/api/v1/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  });

  if (response.status === 'success') {
    showSuccess('Service created successfully!');
    router.push('/services');
  }

  return response;
};

// Update service
const updateService = async (serviceId: string, serviceData: ServiceFormData) => {
  const response = await makeAuthenticatedRequest(`/api/v1/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  });

  return response;
};

// Service form component
const ServiceForm = () => {
  return {
    name: '',
    description: '',
    category: 'hair',
    duration_minutes: 45,
    buffer_time_minutes: 15,
    price: 0,
    outlet_ids: [],
    staff_ids: [],
    requirements: {
      min_booking_notice_hours: 2,
      max_advance_booking_days: 30,
      cancellation_policy: 'Cancel up to 24 hours before appointment'
    }
  };
};
```

### Service Detail Page

```typescript
// Get service details
const getServiceDetails = async (serviceId: string) => {
  const response = await makeAuthenticatedRequest(`/api/v1/services/${serviceId}`);
  return response.data;
};

// Get service statistics
const getServiceStats = async (serviceId: string, period = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/services/${serviceId}/statistics?period=${period}`
  );
  return response.data;
};

// Assign staff to service
const assignStaffToService = async (serviceId: string, staffIds: string[]) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/services/${serviceId}/staff`,
    {
      method: 'POST',
      body: JSON.stringify({ staff_ids: staffIds })
    }
  );

  return response;
};
```

### Service Catalog Component (Customer View)

```typescript
// For customer booking flow
const ServiceCatalog = ({ outletId }) => {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Use Public API endpoint
    fetch(`/api/v1/public/outlets/${outletId}/services`)
      .then(res => res.json())
      .then(data => setServices(data.data));
  }, [outletId]);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return filteredServices;
};
```

### Outlet Pricing Manager

```typescript
// Set different prices per outlet
const setOutletPricing = async (serviceId: string, outletPricing: OutletPrice[]) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/services/${serviceId}/outlet-pricing`,
    {
      method: 'PUT',
      body: JSON.stringify({ outlet_pricing: outletPricing })
    }
  );

  return response;
};

// Usage
const outletPricing = [
  { outlet_id: 'outlet_123', price: 150000 },
  { outlet_id: 'outlet_124', price: 160000 }
];

await setOutletPricing('service_123', outletPricing);
```

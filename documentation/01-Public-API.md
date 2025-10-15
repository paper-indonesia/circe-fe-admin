# Public API

**Level Akses**: 🟩 Public (Tidak perlu autentikasi)

Endpoint public untuk akses tanpa autentikasi, digunakan untuk browse bisnis, cek availability, dan tenant registration.

---

## 1. Tenant Registration

### POST `/api/v1/public/register`

Endpoint untuk self-registration tenant baru (pendaftaran bisnis baru).

**Authentication**: Tidak diperlukan

**Request Body**:
```json
{
  "business_name": "Beauty Salon XYZ",
  "email": "owner@beautysalon.com",
  "phone": "+62812345678",
  "owner_name": "John Doe",
  "password": "SecurePassword123!",
  "business_type": "beauty_salon",
  "address": {
    "street": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12190",
    "country": "Indonesia"
  },
  "subscription_plan": "FREE"
}
```

**Field Descriptions**:
- `business_name` (required, string): Nama bisnis
- `email` (required, string): Email bisnis (akan digunakan untuk login)
- `phone` (required, string): Nomor telepon dengan format internasional
- `owner_name` (required, string): Nama pemilik bisnis
- `password` (required, string): Password minimal 8 karakter
- `business_type` (required, enum): Tipe bisnis
  - `beauty_salon`
  - `spa`
  - `barbershop`
  - `nail_salon`
  - `wellness_center`
  - `other`
- `address` (required, object): Alamat lengkap bisnis
- `subscription_plan` (optional, string): Default "FREE", bisa: FREE, PRO, ENTERPRISE

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "tenant_id": "tenant_abc123",
    "business_name": "Beauty Salon XYZ",
    "email": "owner@beautysalon.com",
    "subscription_plan": "FREE",
    "created_at": "2025-10-15T10:30:00Z",
    "verification_required": true,
    "verification_email_sent": true
  },
  "message": "Tenant registered successfully. Please check your email for verification."
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

**Validation Rules**:
- Email harus format valid dan unique
- Phone harus format valid (dengan country code)
- Password minimal 8 karakter, harus ada huruf besar, huruf kecil, dan angka
- Business name minimal 3 karakter

**Implementation Notes**:
- Setelah registrasi berhasil, tenant akan menerima email verifikasi
- Status tenant awal adalah "pending_verification"
- Default subscription adalah FREE plan
- Auto-create outlet pertama dengan nama yang sama dengan business_name

---

## 2. Browse Businesses/Outlets

### GET `/api/v1/public/outlets`

Browse daftar bisnis/outlet yang tersedia di area tertentu.

**Authentication**: Tidak diperlukan

**Query Parameters**:
```
?city=Jakarta&business_type=beauty_salon&page=1&limit=20
```

**Parameters**:
- `city` (optional, string): Filter berdasarkan kota
- `business_type` (optional, string): Filter berdasarkan tipe bisnis
- `search` (optional, string): Pencarian berdasarkan nama bisnis
- `page` (optional, integer): Halaman (default: 1)
- `limit` (optional, integer): Jumlah per halaman (default: 20, max: 100)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "outlet_id": "outlet_123",
      "tenant_id": "tenant_abc123",
      "business_name": "Beauty Salon XYZ",
      "outlet_name": "Beauty Salon XYZ - Central",
      "business_type": "beauty_salon",
      "address": {
        "street": "Jl. Sudirman No. 123",
        "city": "Jakarta",
        "province": "DKI Jakarta",
        "postal_code": "12190"
      },
      "phone": "+62812345678",
      "email": "contact@beautysalon.com",
      "rating": 4.8,
      "total_reviews": 156,
      "is_open": true,
      "distance_km": 2.5,
      "services_count": 25,
      "staff_count": 8,
      "images": [
        "https://storage.url/image1.jpg",
        "https://storage.url/image2.jpg"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Implementation Notes**:
- Response sudah include rating dan jumlah reviews
- `is_open` menunjukkan status buka/tutup saat ini (berdasarkan operating hours)
- `distance_km` dihitung jika user mengirim location coordinates (lat, long)
- Hanya menampilkan outlet dengan status "active"
- Default sorting by rating (highest first)

---

## 3. Get Outlet Details

### GET `/api/v1/public/outlets/{outlet_id}`

Mendapatkan detail lengkap dari sebuah outlet.

**Authentication**: Tidak diperlukan

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "tenant_id": "tenant_abc123",
    "business_name": "Beauty Salon XYZ",
    "outlet_name": "Beauty Salon XYZ - Central",
    "business_type": "beauty_salon",
    "description": "Premium beauty salon with experienced staff",
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
    "email": "contact@beautysalon.com",
    "website": "https://beautysalon.com",
    "social_media": {
      "instagram": "@beautysalonxyz",
      "facebook": "beautysalonxyz"
    },
    "rating": 4.8,
    "total_reviews": 156,
    "operating_hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      "wednesday": { "open": "09:00", "close": "18:00" },
      "thursday": { "open": "09:00", "close": "18:00" },
      "friday": { "open": "09:00", "close": "20:00" },
      "saturday": { "open": "10:00", "close": "20:00" },
      "sunday": { "closed": true }
    },
    "is_open": true,
    "services_count": 25,
    "staff_count": 8,
    "images": [
      "https://storage.url/image1.jpg",
      "https://storage.url/image2.jpg"
    ],
    "amenities": ["WiFi", "Parking", "Refreshments", "Air Conditioning"]
  }
}
```

**Response Error (404 Not Found)**:
```json
{
  "status": "error",
  "message": "Outlet not found",
  "code": "OUTLET_NOT_FOUND"
}
```

**Implementation Notes**:
- Endpoint ini untuk detail page outlet di customer app
- Include operating hours untuk menampilkan status buka/tutup
- Coordinates digunakan untuk maps integration
- Images array untuk gallery outlet

---

## 4. Get Services by Outlet

### GET `/api/v1/public/outlets/{outlet_id}/services`

Mendapatkan daftar layanan yang tersedia di outlet tertentu.

**Authentication**: Tidak diperlukan

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Query Parameters**:
```
?category=hair&min_price=50000&max_price=500000
```

**Parameters**:
- `category` (optional, string): Filter berdasarkan kategori service
- `min_price` (optional, integer): Harga minimum
- `max_price` (optional, integer): Harga maximum
- `search` (optional, string): Pencarian berdasarkan nama service

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
      "is_available": true,
      "image": "https://storage.url/service-image.jpg",
      "rating": 4.7,
      "total_bookings": 230
    },
    {
      "service_id": "service_124",
      "name": "Hair Coloring",
      "description": "Full hair coloring with professional dye",
      "category": "hair",
      "duration_minutes": 120,
      "price": 350000,
      "currency": "IDR",
      "is_available": true,
      "image": "https://storage.url/service-image2.jpg",
      "rating": 4.9,
      "total_bookings": 187
    }
  ]
}
```

**Implementation Notes**:
- Categories: hair, facial, body_treatment, nails, makeup, massage
- Price dalam format integer (Rupiah)
- Duration dalam menit untuk kalkulasi time slot
- `is_available` indicates if service can be booked currently

---

## 5. Check Availability

### GET `/api/v1/public/outlets/{outlet_id}/availability`

Check ketersediaan slot appointment untuk tanggal dan service tertentu.

**Authentication**: Tidak diperlukan

**Path Parameters**:
- `outlet_id` (required, string): ID outlet

**Query Parameters**:
```
?date=2025-10-20&service_id=service_123&staff_id=staff_456
```

**Parameters**:
- `date` (required, string): Tanggal dalam format YYYY-MM-DD
- `service_id` (required, string): ID service yang akan di-book
- `staff_id` (optional, string): ID staff tertentu (jika customer pilih staff)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "date": "2025-10-20",
    "outlet_id": "outlet_123",
    "service_id": "service_123",
    "available_slots": [
      {
        "start_time": "09:00",
        "end_time": "09:45",
        "staff": {
          "staff_id": "staff_456",
          "name": "Jane Smith",
          "photo": "https://storage.url/staff-photo.jpg",
          "rating": 4.8
        },
        "is_available": true
      },
      {
        "start_time": "10:00",
        "end_time": "10:45",
        "staff": {
          "staff_id": "staff_789",
          "name": "Sarah Johnson",
          "photo": "https://storage.url/staff-photo2.jpg",
          "rating": 4.9
        },
        "is_available": true
      },
      {
        "start_time": "11:00",
        "end_time": "11:45",
        "staff": null,
        "is_available": false
      }
    ],
    "total_available_slots": 12
  }
}
```

**Implementation Notes**:
- Slot duration otomatis disesuaikan dengan service duration
- Jika staff_id tidak dispesifikkan, return available slots untuk semua staff
- Time slots berdasarkan outlet operating hours dan staff availability
- Buffer time antar appointment sudah diperhitungkan
- Slot yang sudah di-book akan ditandai `is_available: false`

---

## Implementation Guide untuk Dashboard

### Integrasi untuk Customer Booking Flow

1. **Discovery Page**:
   ```typescript
   // Browse outlets
   const outlets = await fetch('/api/v1/public/outlets?city=Jakarta');
   ```

2. **Outlet Detail Page**:
   ```typescript
   // Get outlet details
   const outlet = await fetch(`/api/v1/public/outlets/${outletId}`);

   // Get services
   const services = await fetch(`/api/v1/public/outlets/${outletId}/services`);
   ```

3. **Booking Page**:
   ```typescript
   // Check availability
   const availability = await fetch(
     `/api/v1/public/outlets/${outletId}/availability?date=${date}&service_id=${serviceId}`
   );
   ```

4. **Registration Page**:
   ```typescript
   // Tenant registration
   const response = await fetch('/api/v1/public/register', {
     method: 'POST',
     body: JSON.stringify(registrationData)
   });
   ```

### Error Handling

```typescript
try {
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.status === 'error') {
    // Handle error
    console.error(data.message);
    throw new Error(data.message);
  }

  return data.data;
} catch (error) {
  // Handle network error
  console.error('API Error:', error);
  throw error;
}
```

# Products (Services) API Documentation

Base URL: `https://circe-fastapi-backend-740443181568.europe-west1.run.app`

All endpoints require authentication via Bearer token in the Authorization header.

## Endpoints

### 1. Get All Services
**GET** `/api/v1/services`

Retrieve a paginated list of all services.

#### Query Parameters
- `page` (integer, optional): Page number (default: 1)
- `size` (integer, optional): Number of items per page (default: 50)
- `search` (string, optional): Search by name or description
- `category` (string, optional): Filter by category
- `is_active` (boolean, optional): Filter by active status

#### Response (200 OK)
```json
{
  "items": [
    {
      "_id": "string",
      "tenant_id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "category": "string",
      "duration_minutes": 60,
      "preparation_minutes": 0,
      "cleanup_minutes": 0,
      "max_advance_booking_days": 30,
      "min_advance_booking_hours": 2,
      "requires_staff": true,
      "required_staff_count": 1,
      "allow_parallel_bookings": false,
      "max_parallel_bookings": 1,
      "pricing": {
        "base_price": 0,
        "currency": "USD"
      },
      "tags": ["tag1", "tag2"],
      "image_url": "string",
      "is_active": true,
      "status": "active",
      "assigned_staff": ["staff_id_1", "staff_id_2"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 0,
  "page": 1,
  "size": 50,
  "pages": 1
}
```

---

### 2. Create New Service
**POST** `/api/v1/services`

Create a new service.

#### Request Body
```json
{
  "tenant_id": "string (required, auto-filled from auth context)",
  "name": "string (required)",
  "slug": "string (optional, auto-generated from name if not provided)",
  "description": "string (optional)",
  "category": "string (required, e.g., facial, massage, spa, nails, hair)",
  "duration_minutes": 60,
  "preparation_minutes": 0,
  "cleanup_minutes": 0,
  "max_advance_booking_days": 30,
  "min_advance_booking_hours": 2,
  "requires_staff": true,
  "required_staff_count": 1,
  "allow_parallel_bookings": false,
  "max_parallel_bookings": 1,
  "pricing": {
    "base_price": 0,
    "currency": "USD"
  },
  "tags": ["tag1", "tag2"],
  "image_url": "string (optional)",
  "is_active": true,
  "status": "active"
}
```

**Note:**
- `tenant_id` is automatically added from authentication context
- `slug` is auto-generated from `name` if not provided (lowercase, hyphenated)
- `durationMin` from frontend should be sent as `duration_minutes`
- `assignedStaff` from frontend should be sent as `assigned_staff`
- `photo` field should be mapped to `image_url`
- `price` from frontend should be sent as `pricing.base_price`
- `currency` from frontend should be sent as `pricing.currency`

#### Response (201 Created)
```json
{
  "_id": "string",
  "tenant_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "category": "string",
  "duration_minutes": 60,
  "pricing": {
    "base_price": 0,
    "currency": "USD"
  },
  "image_url": "string",
  "is_active": true,
  "status": "active",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 3. Get Service by ID
**GET** `/api/v1/services/{service_id}`

Retrieve details of a specific service.

#### Path Parameters
- `service_id` (string, required): The service ID

#### Response (200 OK)
```json
{
  "_id": "string",
  "tenant_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "category": "string",
  "duration_minutes": 60,
  "preparation_minutes": 0,
  "cleanup_minutes": 0,
  "pricing": {
    "base_price": 0,
    "currency": "USD"
  },
  "image_url": "string",
  "is_active": true,
  "assigned_staff": ["staff_id_1"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 4. Update Service
**PUT** `/api/v1/services/{service_id}`

Update an existing service.

#### Path Parameters
- `service_id` (string, required): The service ID

#### Request Body
```json
{
  "name": "string (optional)",
  "slug": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "duration_minutes": 60 (optional),
  "preparation_minutes": 0 (optional),
  "cleanup_minutes": 0 (optional),
  "pricing": {
    "base_price": 0,
    "currency": "USD"
  } (optional),
  "image_url": "string (optional)",
  "assigned_staff": ["staff_id_1"] (optional),
  "is_active": true (optional)
}
```

#### Response (200 OK)
```json
{
  "_id": "string",
  "tenant_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "category": "string",
  "duration_minutes": 60,
  "pricing": {
    "base_price": 0,
    "currency": "USD"
  },
  "image_url": "string",
  "is_active": true,
  "assigned_staff": ["staff_id_1"],
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 5. Delete Service
**DELETE** `/api/v1/services/{service_id}`

Delete a service (soft delete by setting is_active to false).

#### Path Parameters
- `service_id` (string, required): The service ID

#### Response (200 OK)
```json
{
  "message": "Service deleted successfully"
}
```

---

## Field Mapping (Frontend ↔ Backend)

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `id` | `_id` | MongoDB ID |
| `durationMin` | `duration_minutes` | Duration in minutes |
| `assignedStaff` | `assigned_staff` | Array of staff IDs |
| `photo` | `image_url` | Image URL |
| `price` | `pricing.base_price` | Base price in pricing object |
| `currency` | `pricing.currency` | Currency in pricing object |
| `isActive` | `is_active` | Boolean status |
| `tenantId` | `tenant_id` | Tenant identifier |

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Service not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Notes

1. All endpoints require a valid JWT token in the Authorization header
2. The `_id` field in responses should be mapped to `id` in the frontend
3. Services are soft-deleted by setting `is_active` to `false`
4. The API only runs when the user accesses the Products/Services menu
5. Field names use snake_case in the backend and camelCase in the frontend
6. `slug` is automatically generated from service name if not provided
7. Pricing information is stored in a nested `pricing` object with `base_price` and `currency` fields

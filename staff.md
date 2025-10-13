# Staff Management API Documentation

Base URL: `https://circe-fastapi-backend-740443181568.europe-west1.run.app`

All endpoints require authentication via Bearer token in the Authorization header.

## Endpoints

### 1. Get All Staff Members
**GET** `/api/v1/staff`

Retrieve a paginated list of all staff members.

#### Query Parameters
- `page` (integer, optional): Page number (default: 1)
- `size` (integer, optional): Number of items per page (default: 50)
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role
- `is_active` (boolean, optional): Filter by active status
- `outlet_id` (string, optional): Filter by outlet

#### Response (200 OK)
```json
{
  "items": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "role": "string",
      "skills": ["string"],
      "workingSchedule": {
        "Monday": ["09:00-17:00"],
        "Tuesday": ["09:00-17:00"]
      },
      "workingDays": ["Monday", "Tuesday"],
      "workingHours": ["09:00-17:00"],
      "avatar": "string",
      "rating": 0,
      "capacity": 1,
      "balance": 0,
      "totalEarnings": 0,
      "notes": "string",
      "isActive": true,
      "outletId": "string",
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

### 2. Create New Staff Member
**POST** `/api/v1/staff`

Create a new staff member.

#### Request Body
```json
{
  "tenant_id": "string (required, auto-filled from auth context)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "position": "string (required)",
  "hire_date": "string (required, ISO 8601 date: 2025-01-15)",
  "skills": {
    "skill_name": "proficiency_level"
  },
  "workingSchedule": {
    "Monday": ["09:00-17:00"],
    "Tuesday": ["09:00-17:00"]
  },
  "workingDays": ["Monday", "Tuesday"],
  "workingHours": ["09:00-17:00"],
  "avatar": "string (optional)",
  "capacity": 1,
  "notes": "string (optional)",
  "outlet_id": "string (optional)"
}
```

**Note:**
- `name` field should be split into `first_name` and `last_name`
- `role` should be sent as `position`
- `skills` should be an object/dictionary, not an array
- `tenant_id` is automatically added from authentication context

#### Response (201 Created)
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "skills": ["string"],
  "workingSchedule": {
    "Monday": ["09:00-17:00"]
  },
  "workingDays": ["Monday"],
  "workingHours": ["09:00-17:00"],
  "avatar": "string",
  "rating": 0,
  "capacity": 1,
  "balance": 0,
  "totalEarnings": 0,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 3. Get Staff Member by ID
**GET** `/api/v1/staff/{staff_id}`

Retrieve details of a specific staff member.

#### Path Parameters
- `staff_id` (string, required): The staff member ID

#### Response (200 OK)
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "skills": ["string"],
  "workingSchedule": {
    "Monday": ["09:00-17:00"]
  },
  "workingDays": ["Monday"],
  "workingHours": ["09:00-17:00"],
  "avatar": "string",
  "rating": 0,
  "capacity": 1,
  "balance": 0,
  "totalEarnings": 0,
  "notes": "string",
  "isActive": true,
  "outletId": "string",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 4. Update Staff Member
**PUT** `/api/v1/staff/{staff_id}`

Update an existing staff member.

#### Path Parameters
- `staff_id` (string, required): The staff member ID

#### Request Body
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "role": "string (optional)",
  "skills": ["string"],
  "workingSchedule": {
    "Monday": ["09:00-17:00"]
  },
  "workingDays": ["Monday"],
  "workingHours": ["09:00-17:00"],
  "avatar": "string (optional)",
  "capacity": 1,
  "notes": "string (optional)",
  "isActive": true
}
```

#### Response (200 OK)
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "skills": ["string"],
  "workingSchedule": {
    "Monday": ["09:00-17:00"]
  },
  "workingDays": ["Monday"],
  "workingHours": ["09:00-17:00"],
  "avatar": "string",
  "rating": 0,
  "capacity": 1,
  "balance": 0,
  "totalEarnings": 0,
  "notes": "string",
  "isActive": true,
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 5. Delete Staff Member
**DELETE** `/api/v1/staff/{staff_id}`

Delete a staff member (soft delete by setting isActive to false).

#### Path Parameters
- `staff_id` (string, required): The staff member ID

#### Response (200 OK)
```json
{
  "message": "Staff member deleted successfully"
}
```

---

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
  "detail": "Staff member not found"
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
3. Staff members are soft-deleted by setting `isActive` to `false`
4. `workingSchedule` is a map of day names to arrays of time ranges
5. `workingHours` is an array of time ranges (legacy field, prefer workingSchedule)
6. The API only runs when the user accesses the Staff menu

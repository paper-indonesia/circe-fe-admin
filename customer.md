GET
/api/v1/customers
List All Customers


Retrieve all customers with advanced search and filtering capabilities.

Features:

Full-text search across name, email, and phone
Tag-based filtering (VIP, regular, walk-in, etc.)
Registration type filtering (password vs walk-in)
Email verification status filtering
Date range filtering for customer creation
Paginated results with configurable page size
Access: All staff members can view customer list

Query Parameters:

search: Text search across customer details
tags: Comma-separated list of tags to filter
has_password: Filter by registration type
email_verified: Filter by verification status
created_from/created_to: Date range for creation time
Returns:

Paginated list of customers
Total count for pagination
Page metadata with current page and total pages

curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/customers?search=John&tags=vip%2Cregular&has_password=true&email_verified=true&created_from=2025-01-01&created_to=2025-12-31&page=1&size=20' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAwNzc1MzYsInN1YiI6IjY4ZTM4YmY1NTcwZDBlODEzNDY5ZmVlMCIsImlhdCI6MTc2MDA3MzkzNiwianRpIjoiNjhlODk4ZDA5YTlkMWQ0ZDgxMDRlZmMyIiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoiYXJpbEBlZHV0ZWNoLmNvbSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJ0ZW5hbnRfaWQiOiI2OGUzOGJlZjU3MGQwZTgxMzQ2OWZlZGUifQ.vU2zbhSA42Lbw7J-OM8ByiE_yguLGnyuSCpdzExxxBY'

  response:
  {
  "items": [
    {
      "created_at": "2025-01-15T10:30:00Z",
      "email": "customer@example.com",
      "email_verified": true,
      "first_name": "Jane",
      "gender": "female",
      "id": "507f1f77bcf86cd799439011",
      "is_active": true,
      "last_name": "Doe",
      "loyalty_points": 150,
      "phone": "+1234567890",
      "preferences": {
        "marketing_consent": true,
        "preferred_outlet_id": "507f1f77bcf86cd799439013"
      },
      "total_appointments": 15
    }
  ],
  "total": 0,
  "page": 1,
  "size": 1,
  "pages": 0
}

POST
/api/v1/customers
Create New Customer


Create a new customer with automatic duplicate detection.

Features:

Automatic duplicate detection by email and phone
Support for walk-in customers (no password required)
Support for self-registered customers (with password)
Automatic tag assignment based on creation method
Default preference initialization
Access: All staff members can create customers

Business Rules:

Email must be unique within the tenant
Phone number must be unique within the tenant
If password is provided, it will be hashed for portal access
Walk-in customers are tagged as "staff-created"
Process:

Validate input data against schema
Check for existing customers if duplicate check enabled
Hash password if provided
Create customer record with tenant isolation
Initialize default preferences
Return created customer profile
Returns:

Complete customer profile with generated ID
Default preferences and settings
Creation timestamp and metadata
Note: Walk-in customers without passwords cannot access the customer portal

body:
{
  "email": "customer@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "source": "website",
  "tenant_id": "507f1f77bcf86cd799439011"
}

response:
{
  "created_at": "2025-01-15T10:30:00Z",
  "email": "customer@example.com",
  "email_verified": true,
  "first_name": "Jane",
  "gender": "female",
  "id": "507f1f77bcf86cd799439011",
  "is_active": true,
  "last_name": "Doe",
  "loyalty_points": 150,
  "phone": "+1234567890",
  "preferences": {
    "marketing_consent": true,
    "preferred_outlet_id": "507f1f77bcf86cd799439013"
  },
  "total_appointments": 15
}

GET
/api/v1/customers/{customer_id}
Get Customer Details


Retrieve detailed information about a specific customer.

Features:

Complete customer profile with all details
Registration and verification status
Preferences and communication settings
Account metadata and timestamps
Access: All staff members can view customer details

Returns:

Customer profile information
Preferences and settings
Registration status
Creation and modification timestamps
Note: Returns 404 if customer not found or belongs to different tenant

response:
{
  "created_at": "2025-01-15T10:30:00Z",
  "email": "customer@example.com",
  "email_verified": true,
  "first_name": "Jane",
  "gender": "female",
  "id": "507f1f77bcf86cd799439011",
  "is_active": true,
  "last_name": "Doe",
  "loyalty_points": 150,
  "phone": "+1234567890",
  "preferences": {
    "marketing_consent": true,
    "preferred_outlet_id": "507f1f77bcf86cd799439013"
  },
  "total_appointments": 15
}

PUT
/api/v1/customers/{customer_id}
Update Customer


Update customer information with duplicate validation.

Features:

Update basic customer information
Automatic duplicate detection for email/phone changes
Tag management for customer categorization
Address and contact information updates
Access: TENANT_ADMIN, OUTLET_MANAGER, or SUPER_ADMIN only

Business Rules:

Email must remain unique within tenant
Phone must remain unique within tenant
Cannot change tenant assignment
Preserves creation metadata
Returns:

Updated customer profile
Modification timestamp
All current customer data
Note: Validates uniqueness before applying changes

body:
{
  "first_name": "Jane",
  "phone": "+1234567890",
  "preferences": {
    "marketing_consent": true,
    "preferred_outlet_id": "507f1f77bcf86cd799439013"
  }
}

output:
{
  "created_at": "2025-01-15T10:30:00Z",
  "email": "customer@example.com",
  "email_verified": true,
  "first_name": "Jane",
  "gender": "female",
  "id": "507f1f77bcf86cd799439011",
  "is_active": true,
  "last_name": "Doe",
  "loyalty_points": 150,
  "phone": "+1234567890",
  "preferences": {
    "marketing_consent": true,
    "preferred_outlet_id": "507f1f77bcf86cd799439013"
  },
  "total_appointments": 15
}

DELETE
/api/v1/customers/{customer_id}
Delete Customer


Delete a customer with soft delete option for data preservation.

Features:

Soft delete by default (preserves data for audit)
Permanent delete option for SUPER_ADMIN
Maintains referential integrity
Audit trail preservation
Access: TENANT_ADMIN or SUPER_ADMIN only

Business Rules:

Default soft delete sets is_deleted=True and is_active=False
Permanent delete requires SUPER_ADMIN role
Soft deleted customers can be restored
Preserves appointment history
Note: Soft deleted customers remain in database but are excluded from normal queries


response:
{
  "message": "Customer has been deleted successfully"
}

GET
/api/v1/customers/{customer_id}/appointments
Get Customer Appointments


Retrieve appointment history and statistics for a specific customer.

Features:

Paginated appointment history
Status-based filtering
Date range filtering
Appointment statistics and analytics
Service and payment details
Access: All staff members can view appointment history

Query Parameters:

status: Filter by appointment status (confirmed, completed, cancelled, etc.)
from_date/to_date: Date range for appointment filtering
Standard pagination parameters
Returns:

Paginated list of appointments
Appointment statistics (total, completed, cancelled, no-show, upcoming)
Pagination metadata
Note: Results include full appointment details with service information

curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/customers/122/appointments?status=confirmed&from_date=2025-01-01&to_date=2025-12-31&page=1&size=20' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAwNzc1MzYsInN1YiI6IjY4ZTM4YmY1NTcwZDBlODEzNDY5ZmVlMCIsImlhdCI6MTc2MDA3MzkzNiwianRpIjoiNjhlODk4ZDA5YTlkMWQ0ZDgxMDRlZmMyIiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoiYXJpbEBlZHV0ZWNoLmNvbSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJ0ZW5hbnRfaWQiOiI2OGUzOGJlZjU3MGQwZTgxMzQ2OWZlZGUifQ.vU2zbhSA42Lbw7J-OM8ByiE_yguLGnyuSCpdzExxxBY'

  response:
  {
  "appointments": [
    {
      "id": "507f1f77bcf86cd799439040",
      "tenant_id": "507f1f77bcf86cd799439010",
      "outlet_id": "507f1f77bcf86cd799439022",
      "customer_id": "507f1f77bcf86cd799439011",
      "staff_id": "507f1f77bcf86cd799439021",
      "service_id": "507f1f77bcf86cd799439020",
      "appointment_date": "2025-01-25",
      "start_time": "14:00:00",
      "end_time": "15:30:00",
      "status": "confirmed",
      "total_price": 350000,
      "notes": "Customer prefers window seat",
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ],
  "statistics": {
    "total_appointments": 28,
    "completed": 24,
    "cancelled": 2,
    "no_show": 1,
    "upcoming": 3
  },
  "pagination": {
    "total": 28,
    "page": 1,
    "size": 20,
    "pages": 2
  }
}

PUT
/api/v1/customers/{customer_id}/preferences
Update Customer Preferences


Update customer preferences for bookings and communications.

Features:

Service and staff preference management
Communication channel configuration
Outlet location preferences
Marketing consent management
Language and accessibility settings
Access: All staff members can update preferences

Updatable Preferences:

Preferred services and categories
Preferred staff members
Preferred outlet locations
Communication channels (SMS, email, push)
Marketing and promotional consent
Language and accessibility preferences
Returns:

Updated customer profile with new preferences
All current customer data
Modification timestamp
Note: Preferences affect booking recommendations and communication delivery

response:
{
  "communication_preferences": {
    "email": true,
    "push_notifications": true,
    "sms": true,
    "whatsapp": false
  },
  "language": "en",
  "marketing_consent": true,
  "notes": "Prefers morning appointments",
  "preferred_outlet_id": "507f1f77bcf86cd799439013",
  "preferred_services": [
    "507f1f77bcf86cd799439011"
  ],
  "preferred_staff_ids": [
    "507f1f77bcf86cd799439012"
  ]
}

GET
/api/v1/customers/statistics/summary
Get Customer Analytics


Retrieve comprehensive customer analytics and statistics.

Features:

Customer growth and acquisition metrics
Customer segmentation analysis
Revenue and loyalty analytics
Registration type breakdown
Retention and engagement metrics
Access: TENANT_ADMIN or SUPER_ADMIN only

Query Parameters:

from_date/to_date: Date range for analytics calculation
Defaults to all-time statistics if no dates provided
Returns:

Total customer counts (active, inactive, deleted)
New customer acquisition in period
Customer type breakdown (walk-in vs registered)
Top customers by appointment frequency and revenue
Retention and churn metrics
Period metadata and generation timestamp
Note: Analytics calculations may take time for large datasets

response:
{
  "statistics": {
    "total_customers": 145,
    "active_customers": 138,
    "inactive_customers": 7,
    "verified_emails": 92,
    "customers_with_password": 115,
    "walk_in_customers": 30,
    "new_customers_in_period": 12,
    "total_appointments": 3456,
    "total_revenue": 125000000,
    "total_loyalty_points": 45000,
    "avg_appointments_per_customer": 23.8,
    "avg_spent_per_customer": 862068,
    "retention_rate": 78.5,
    "top_customers_by_appointments": [
      {
        "customer_id": "507f1f77bcf86cd799439011",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "total_appointments": 52,
        "total_spent": 4500000
      }
    ],
    "top_customers_by_revenue": [
      {
        "customer_id": "507f1f77bcf86cd799439012",
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "total_appointments": 38,
        "total_spent": 6200000
      }
    ],
    "customer_segments": {
      "vip": 25,
      "regular": 90,
      "new": 12,
      "at_risk": 18
    }
  },
  "period": {
    "from": "2025-01-01",
    "to": "2025-12-31"
  },
  "generated_at": "2025-10-08T10:00:00Z"
}
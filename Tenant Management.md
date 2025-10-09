Get Tenant Details¶
Endpoint: GET /api/v1/tenants/{tenant_id}

Access:

SUPER_ADMIN: Can access any tenant
TENANT_ADMIN/OUTLET_MANAGER/STAFF: Can only access their own tenant
Features:

Complete tenant profile including settings and subscription
Automatic tenant access validation based on user role
Full configuration and preference details
Subscription and billing information
Response:


{
  "id": "6501234567890abcdef12345",
  "name": "Glamour Beauty Spa",
  "slug": "glamour-spa",
  "email": "admin@glamourspa.com",
  "phone": "+639171234567",
  "description": "Premium beauty and wellness services",
  "website": "https://glamourspa.com",
  "is_active": true,
  "subscription": {
    "plan": "pro",
    "status": "active",
    "trial_ends_at": null,
    "current_period_start": "2025-10-01T00:00:00Z",
    "current_period_end": "2025-11-01T00:00:00Z"
  },
  "settings": {
    "timezone": "Asia/Manila",
    "currency": "PHP",
    "language": "en",
    "business_type": "spa"
  },
  "client_partner_id": "partner_abc123xyz",
  "created_at": "2025-10-07T10:30:00Z",
  "updated_at": "2025-10-07T10:30:00Z"
}


Update Tenant¶
Endpoint: PUT /api/v1/tenants/{tenant_id}

Access:

SUPER_ADMIN: Can update any tenant
TENANT_ADMIN: Can only update their own tenant
Features:

Partial updates supported for all tenant fields
Settings updates including wallet, loyalty, and payment configurations
Subscription and billing settings modification (except plan - use subscription endpoints)
Historical data preserved during updates
Business Rules:

Slug cannot be updated (intentionally excluded to prevent breaking integrations)
Cannot update subscription status directly (use /api/v1/subscriptions/* endpoints)
Settings changes apply immediately to all outlets
Request Example:


{
  "name": "Glamour Beauty & Wellness Spa",
  "description": "Premium beauty, wellness and massage services",
  "phone": "+639171234568",
  "settings": {
    "timezone": "Asia/Manila",
    "currency": "PHP",
    "language": "en"
  }
}
Response: Returns updated tenant object with all changes applied.

Get Tenant Statistics¶
Endpoint: GET /api/v1/tenants/{tenant_id}/stats

Access:

SUPER_ADMIN: Can access any tenant statistics
TENANT_ADMIN: Can only access their own tenant statistics
Features:

Complete outlet and user analytics
Customer acquisition and retention metrics
Appointment volume and status distribution
Revenue and subscription insights
Real-time data with historical trends
Statistics Include:

Outlet count with active/inactive breakdown
User distribution by role and status
Customer metrics including recent signups (last 30 days)
Appointment volume for current month with status breakdown
Subscription plan and billing status
Response Example:


{
  "outlets": {
    "total": 3,
    "active": 3,
    "inactive": 0
  },
  "users": {
    "total": 15,
    "active": 15,
    "by_role": {
      "tenant_admin": 2,
      "outlet_manager": 3,
      "staff": 8,
      "receptionist": 2
    }
  },
  "customers": {
    "total": 1250,
    "active": 1180,
    "recent_signups": 45
  },
  "appointments": {
    "this_month": 380,
    "this_month_by_status": {
      "confirmed": 120,
      "pending": 45,
      "completed": 180,
      "cancelled": 25,
      "no_show": 10
    }
  },
  "subscription": {
    "plan": "pro",
    "status": "active",
    "trial_ends_at": null
  },
  "generated_at": "2025-10-07T15:30:00Z",
  "tenant_info": {
    "id": "6501234567890abcdef12345",
    "name": "Glamour Beauty Spa",
    "slug": "glamour-spa",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
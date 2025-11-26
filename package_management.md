Package Management¶
Complete guide to managing service packages and credit bundles in the Reserva platform.

Overview¶
The package management system provides comprehensive service bundle management with support for:

Package CRUD - Create, read, update, and delete service bundles
Credit-Based System - Multi-treatment bundles with redeemable credits
Automatic Discount Calculation - Server-side discount metrics
Subscription Tier Limits - Plan-based package creation restrictions
Outlet Availability - Location-specific package availability
Purchase Statistics - Revenue and usage tracking
Key Concepts:

Package = Service bundle with multiple treatments at a discounted price
Package Items = Individual services included in the package with quantities
Credits = Redeemable units for booked services
Discount = Savings compared to purchasing services individually
Validity Period = Days until package credits expire after purchase
Subscription Plan Limits¶
Package features are restricted by subscription plan tier:

Plan	Max Packages	Max Items Per Package	Feature Enabled
FREE	1 package	3 items	Yes
PRO	10 packages	10 items	Yes
ENTERPRISE	100 packages	20 items	Yes
Limit Enforcement:

Creating a package will fail with HTTP 402 if limits are exceeded
Only non-archived packages count toward the limit
Check current usage: GET /api/v1/packages/limits
Upgrade required for more packages: See Subscription Management
Error Response (Limit Exceeded):


{
  "error": "subscription_limit_reached",
  "message": "Package limit reached for FREE plan. Current: 1/1. Upgrade to PRO for more packages.",
  "upgrade_required": true
}
Related Limits:

See Subscription Management - Usage Tracking for monitoring subscription limits
See Service Management for service limits that affect package items
Available Endpoints¶
Endpoint	Method	Purpose	Access
/packages	GET	List all packages	Staff
/packages	POST	Create new package	TENANT_ADMIN+
/packages/limits	GET	Get package limits info	All authenticated
/packages/{package_id}	GET	Get package details	Staff
/packages/{package_id}	PATCH	Update package	TENANT_ADMIN+
/packages/{package_id}	DELETE	Archive package (soft delete)	TENANT_ADMIN+
Create Package¶
Create a new service bundle with automatic validation and discount calculation.

Endpoint¶

POST /api/v1/packages
Authentication: Required (TENANT_ADMIN or SUPER_ADMIN)

Request Body¶

{
  "name": "Hair Care Premium Package",
  "description": "Complete hair care bundle with 3 haircuts and 2 treatments",
  "package_items": [
    {
      "service_id": "507f1f77bcf86cd799439013",
      "service_name": "Hair Cut & Style",
      "quantity": 3,
      "unit_price": 75000
    },
    {
      "service_id": "507f1f77bcf86cd799439014",
      "service_name": "Hair Treatment",
      "quantity": 2,
      "unit_price": 50000
    }
  ],
  "package_price": 300000,
  "currency": "IDR",
  "validity_days": 90,
  "is_active": true,
  "status": "active",
  "outlet_ids": []
}
Parameters¶
Field	Type	Required	Description
name	string	Yes	Package name (3-100 chars)
description	string	No	Package description (max 500 chars)
package_items	array	Yes	List of services (1-10 items based on plan)
package_items[].service_id	string	Yes	Valid service ObjectId
package_items[].service_name	string	No	Service name (auto-enriched)
package_items[].quantity	integer	Yes	Number of credits (1-100)
package_items[].unit_price	decimal	No	Unit price (auto-enriched from service)
package_price	decimal	Yes	Total package price (must be discounted)
currency	string	No	Currency code (default: "IDR")
validity_days	integer	No	Days until credits expire (7-365, null = never)
is_active	boolean	No	Availability toggle (default: true)
status	string	No	Status: active, inactive, archived (default: active)
outlet_ids	array	No	Outlet availability (empty = all outlets)
Response¶

{
  "id": "507f1f77bcf86cd799439011",
  "tenant_id": "507f1f77bcf86cd799439010",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "name": "Hair Care Premium Package",
  "description": "Complete hair care bundle with 3 haircuts and 2 treatments",
  "package_items": [
    {
      "service_id": "507f1f77bcf86cd799439013",
      "service_name": "Hair Cut & Style",
      "quantity": 3,
      "unit_price": "75000.0"
    },
    {
      "service_id": "507f1f77bcf86cd799439014",
      "service_name": "Hair Treatment",
      "quantity": 2,
      "unit_price": "50000.0"
    }
  ],
  "package_price": "300000.0",
  "currency": "IDR",
  "validity_days": 90,
  "is_active": true,
  "status": "active",
  "outlet_ids": [],
  "total_purchased": 0,
  "active_credits_count": 0,
  "total_revenue": "0.0",
  "total_individual_price": "325000.0",
  "discount_amount": "25000.0",
  "discount_percentage": 7.69
}
Business Rules¶
Package must contain 1-10 items (based on subscription tier)
All services must exist, be active, and belong to tenant
Package price must be less than sum of individual prices (discount required)
No duplicate services allowed in package
Service names and unit prices are auto-enriched from service catalog
Outlet IDs must belong to tenant (if specified)
Empty outlet_ids array means available at all outlets
Tenant isolation is automatically enforced
Subscription Limits¶
HTTP 402 Payment Required if:

Package count exceeds plan limit
Package items exceed plan limit
Check limits before creating:


curl -X GET https://api.example.com/api/v1/packages/limits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Process Flow¶
graph TD
    A[Create Package Request] --> B{Validate Subscription Tier}
    B -->|Limit Exceeded| C[HTTP 402 - Upgrade Required]
    B -->|OK| D{Validate Services}
    D -->|Service Not Found| E[HTTP 400 - Invalid Service]
    D -->|OK| F[Enrich Package Items]
    F --> G{Validate Package Price}
    G -->|Not Discounted| H[HTTP 400 - Price Must Be Discounted]
    G -->|OK| I[Create Package]
    I --> J[Calculate Discount Metrics]
    J --> K[Return PackageOut]
List Packages¶
Retrieve paginated list of packages with filtering and discount metrics.

Endpoint¶

GET /api/v1/packages?page=1&size=20&status=active&is_active=true&outlet_id=507f1f77bcf86cd799439011
Authentication: Required (TENANT_ADMIN, SUPER_ADMIN, or STAFF)

Query Parameters¶
Parameter	Type	Required	Description
page	integer	No	Page number (default: 1)
size	integer	No	Page size (default: 20, max: 100)
status	string	No	Filter by status: active, inactive, archived
is_active	boolean	No	Filter by availability flag
outlet_id	string	No	Filter packages available at specific outlet
Response¶

{
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Hair Care Premium Package",
      "package_price": 300000,
      "currency": "IDR",
      "total_individual_price": 325000,
      "discount_percentage": 7.69,
      "validity_days": 90,
      "is_active": true,
      "status": "active",
      "total_purchased": 15
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Spa Relaxation Bundle",
      "package_price": 450000,
      "currency": "IDR",
      "total_individual_price": 550000,
      "discount_percentage": 18.18,
      "validity_days": 60,
      "is_active": true,
      "status": "active",
      "total_purchased": 8
    }
  ],
  "total": 25,
  "page": 1,
  "size": 10,
  "pages": 3
}
Business Rules¶
Packages with empty outlet_ids are available at all outlets
Discount percentage calculated as: (individual_total - package_price) / individual_total * 100
Results filtered by tenant automatically
Staff can view all packages including inactive/archived
Get Package Limits¶
Retrieve subscription tier limits and current usage for packages.

Endpoint¶

GET /api/v1/packages/limits
Authentication: Required (any authenticated user)

Response¶

{
  "packages_enabled": true,
  "max_packages": 10,
  "current_packages": 3,
  "remaining_packages": 7,
  "max_package_items": 10,
  "limit_reached": false
}
Response Fields¶
Field	Type	Description
packages_enabled	boolean	Whether packages feature is available
max_packages	integer	Maximum allowed packages for plan
current_packages	integer	Current non-archived package count
remaining_packages	integer	Available creation slots
max_package_items	integer	Maximum items allowed per package
limit_reached	boolean	Whether tenant has reached limit
Use Cases¶
Display quota information in UI
Show upgrade prompts when limits are reached
Pre-validate before package creation attempts
Get Package Details¶
Retrieve complete package information with all items and metrics.

Endpoint¶

GET /api/v1/packages/{package_id}
Authentication: Required (TENANT_ADMIN, SUPER_ADMIN, or STAFF)

Path Parameters¶
Parameter	Type	Required	Description
package_id	string	Yes	Package ObjectId
Response¶

{
  "id": "507f1f77bcf86cd799439011",
  "tenant_id": "507f1f77bcf86cd799439010",
  "name": "Hair Care Premium Package",
  "description": "Complete hair care bundle with 3 haircuts and 2 treatments",
  "package_items": [
    {
      "service_id": "507f1f77bcf86cd799439013",
      "service_name": "Hair Cut & Style",
      "quantity": 3,
      "unit_price": 75000
    },
    {
      "service_id": "507f1f77bcf86cd799439014",
      "service_name": "Hair Treatment",
      "quantity": 2,
      "unit_price": 50000
    }
  ],
  "package_price": 300000,
  "currency": "IDR",
  "validity_days": 90,
  "is_active": true,
  "status": "active",
  "outlet_ids": [],
  "total_purchased": 15,
  "active_credits_count": 45,
  "total_revenue": 4500000,
  "total_individual_price": 325000,
  "discount_amount": 25000,
  "discount_percentage": 7.69,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T14:45:00Z"
}
Response Fields¶
Field	Type	Description
total_purchased	integer	Number of times package was purchased
active_credits_count	integer	Total active credits across all customers
total_revenue	decimal	Total revenue generated from package
total_individual_price	decimal	Sum of all service prices x quantities
discount_amount	decimal	Savings vs buying individually
discount_percentage	float	Percentage saved
Business Rules¶
Package must belong to current tenant
Returns 404 if package not found or wrong tenant
Discount metrics calculated server-side
Update Package¶
Update an existing package with partial field updates.

Endpoint¶

PATCH /api/v1/packages/{package_id}
Authentication: Required (TENANT_ADMIN or SUPER_ADMIN)

Path Parameters¶
Parameter	Type	Required	Description
package_id	string	Yes	Package ObjectId
Request Body¶
Supports partial updates - only include fields to change:


{
  "name": "Hair Care Deluxe Package",
  "description": "Updated description with new terms",
  "package_price": 280000,
  "validity_days": 120,
  "is_active": true
}
Updatable Fields¶
Field	Type	Description
name	string	Package display name
description	string	Package details and terms
package_price	decimal	Total price (must remain discounted)
validity_days	integer	Days until credits expire
is_active	boolean	Enable/disable sales
status	string	Lifecycle management
outlet_ids	array	Outlet availability
Response¶

{
  "id": "691fe42548fe115a9834642c",
  "tenant_id": "68ff515191f9eb31e48653cf",
  "created_at": "2025-11-21T04:01:41.508000",
  "updated_at": "2025-11-21T07:54:36.250000",
  "name": "Hair Care Deluxe Package",
  "description": "Updated description with new terms",
  "package_items": [
    {
      "service_id": "68ff526691f9eb31e48653d5",
      "service_name": "Premium Therapy Treatment",
      "quantity": 1,
      "unit_price": "10000.0"
    },
    {
      "service_id": "68ff546e91f9eb31e48653da",
      "service_name": "Yoga Class",
      "quantity": 1,
      "unit_price": "18000.0"
    }
  ],
  "package_price": "25000.0",
  "currency": "IDR",
  "validity_days": 120,
  "is_active": true,
  "status": "active",
  "outlet_ids": [],
  "total_purchased": 0,
  "active_credits_count": 0,
  "total_revenue": "0.0",
  "total_individual_price": "28000.0",
  "discount_amount": "3000.0",
  "discount_percentage": 10.71
}
Business Rules¶
Cannot update package_items after purchases exist (preserves credit integrity)
Package price must remain less than sum of individual prices
Package must belong to current tenant
Update preserves purchase statistics
Protected Fields¶
After any customer purchases the package: - package_items - Locked to maintain credit validity

Rationale: Changing package items after purchase would invalidate existing customer credits.

Error Response (Items Locked):


{
  "detail": "Cannot modify package items after purchases exist. Create a new package instead."
}
Archive Package (Delete)¶
Archive a package (soft delete) while preserving purchase history and customer credits.

Endpoint¶

DELETE /api/v1/packages/{package_id}
Authentication: Required (TENANT_ADMIN or SUPER_ADMIN)

Path Parameters¶
Parameter	Type	Required	Description
package_id	string	Yes	Package ObjectId
Response¶

{
  "message": "Package entry has been deleted successfully"
}
Business Rules¶
Always soft delete - Packages are archived, never permanently removed
Sets status to ARCHIVED and is_active to False
Existing customer credits remain valid and usable
Package no longer appears in customer-facing lists
Archived packages still visible to staff
Purchase history and revenue statistics preserved
No new purchases allowed
What Happens on Archive¶
status set to ARCHIVED
is_active set to false
is_deleted set to true
Package removed from customer listings
Customer credits unaffected
Data Preservation¶
Preserved:

All package configuration
Purchase history
Revenue statistics
Customer credits (remain usable)
Removed:

Customer-facing visibility
Ability to purchase
Package Status Lifecycle¶
Packages follow a defined lifecycle with status management:

Status Values¶
Status	Description	Customer Visible	Purchasable
active	Package is live and available	Yes	Yes
inactive	Temporarily unavailable	No	No
archived	Deleted or discontinued	No	No
Status Transitions¶
graph LR
    A[Create Package] --> B[active]
    B --> C[inactive]
    C --> B
    B --> D[archived]
    C --> D
Allowed Transitions:

active → inactive - Temporarily disable package
inactive → active - Re-enable package
active → archived - Archive package
inactive → archived - Archive inactive package
is_active vs status¶
Two-Level Control:

is_active (boolean) - Quick availability toggle
status (enum) - Detailed lifecycle state
Active Package Requirements: - is_active=true AND status=active

Discount Calculation¶
Package discount metrics are calculated server-side automatically.

Formulas¶

total_individual_price = sum(unit_price × quantity) for all items

discount_amount = total_individual_price - package_price

discount_percentage = (discount_amount / total_individual_price) × 100
Example Calculation¶
Package Items:

Hair Cut (quantity: 3, unit_price: 75,000) = 225,000
Hair Treatment (quantity: 2, unit_price: 50,000) = 100,000
Calculation:


total_individual_price = 225,000 + 100,000 = 325,000
package_price = 300,000
discount_amount = 325,000 - 300,000 = 25,000
discount_percentage = (25,000 / 325,000) × 100 = 7.69%
Validation¶
Package price must be less than total_individual_price
Zero or negative discounts are rejected
Discount metrics are read-only (calculated fields)
Integration Examples¶
Complete Package Creation Flow¶

# 1. Check subscription limits
curl -X GET https://api.example.com/api/v1/packages/limits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: {"max_packages": 10, "current_packages": 2, "remaining_packages": 8}

# 2. Get available services
curl -X GET https://api.example.com/api/v1/services?is_active=true \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Create package
curl -X POST https://api.example.com/api/v1/packages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hair Care Premium Package",
    "description": "Complete hair care bundle",
    "package_items": [
      {
        "service_id": "507f1f77bcf86cd799439013",
        "quantity": 3
      },
      {
        "service_id": "507f1f77bcf86cd799439014",
        "quantity": 2
      }
    ],
    "package_price": 300000,
    "currency": "IDR",
    "validity_days": 90,
    "is_active": true
  }'

# 4. Verify creation
curl -X GET https://api.example.com/api/v1/packages/{package_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Update Package Status¶

# Temporarily disable package
curl -X PATCH https://api.example.com/api/v1/packages/{package_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false,
    "status": "inactive"
  }'

# Re-enable package
curl -X PATCH https://api.example.com/api/v1/packages/{package_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": true,
    "status": "active"
  }'
Archive Package¶

# Archive (soft delete) package
curl -X DELETE https://api.example.com/api/v1/packages/{package_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: {"message": "Package entry has been deleted successfully"}
Best Practices¶
Package Creation¶
DO:

Calculate appropriate discount (10-30% typical)
Set realistic validity periods
Include complementary services in bundles
Check subscription limits before creation
Use clear, descriptive names
Test service availability before including
DON'T:

Create packages with minimal discounts (<5%)
Include services from different outlets without checking availability
Set very long validity periods (>365 days)
Create too many similar packages (confuses customers)
Include inactive services
Package Pricing¶
DO:

Research competitor package pricing
Offer meaningful discounts (10%+ recommended)
Consider service costs in pricing
Use round numbers for easy comprehension
Document pricing strategy
DON'T:

Price too close to individual prices
Change prices frequently after launch
Forget to update if service prices change
Use complex decimal prices
Package Lifecycle¶
DO:

Use inactive status for temporary unavailability
Archive packages that won't return
Create new versions instead of heavily modifying
Communicate changes to staff
Monitor purchase statistics
DON'T:

Delete packages with active customer credits
Change package items after purchases
Archive popular packages without replacement
Reactivate old packages without review
Error Handling¶
Common Errors¶
Error Code	Cause	Solution
400 Bad Request	Invalid input or business rule violation	Check field formats and business rules
401 Unauthorized	Missing/invalid token	Verify JWT token is valid
402 Payment Required	Subscription limit exceeded	Upgrade subscription plan
403 Forbidden	Insufficient permissions	Check user role (TENANT_ADMIN required)
404 Not Found	Package not found or wrong tenant	Verify package ID and tenant
500 Internal Server Error	Server error	Contact support with error details
Subscription Limit Errors¶
Package Count Exceeded:


{
  "error": "subscription_limit_reached",
  "message": "Package limit reached for FREE plan. Current: 1/1. Upgrade to PRO for more packages.",
  "upgrade_required": true
}
Package Items Exceeded:


{
  "error": "subscription_limit_reached",
  "message": "Package items limit exceeded for FREE plan. Maximum 3 items allowed, but 5 were provided.",
  "upgrade_required": true
}
Solution: Upgrade to higher plan - See Subscription Management

Business Rule Errors¶
Price Not Discounted:


{
  "detail": "Package price (350000) must be less than total individual price (325000)"
}
Package Items Locked:


{
  "detail": "Cannot modify package items after purchases exist. Create a new package instead."
}
Invalid Service:


{
  "detail": "Service 507f1f77bcf86cd799439013 not found or inactive"
}
Related Documentation¶
Package System¶
Customer Package Management - Customer-facing package browsing and purchasing
Staff Customer Package Management - Staff-side package operations and credit management
Customer Package Payments - Payment processing for package purchases
Appointment Integration¶
Appointment Management - Complete appointment booking guide
Appointment Credit Redemption - Using package credits for appointments
Supporting Documentation¶
Service Management - Managing services included in packages
Subscription Management - Plan limits and upgrades
Invoice Management - Package purchase invoices
Payment History - Package payment records
Webhook Integration - Package payment webhooks
API Reference Summary¶
Endpoint	Method	Purpose	Access	Subscription Limit
/packages	GET	List packages	Staff	None
/packages	POST	Create package	TENANT_ADMIN+	Plan limits apply
/packages/limits	GET	Get limits info	All authenticated	None
/packages/{id}	GET	Get details	Staff	None
/packages/{id}	PATCH	Update package	TENANT_ADMIN+	None
/packages/{id}	DELETE	Archive package	TENANT_ADMIN+	None
Next Steps:

Check package limits: GET /packages/limits
Review available services: GET /services?is_active=true
Create your first package: POST /packages
Test customer browsing: See Customer Package Management
Monitor purchases: GET /packages/{id} (check total_purchased)
For complete API testing, see Swagger UI or ReDoc.

Frontend UI Suggestions¶
This section provides UI/UX recommendations for frontend developers implementing package management features.

Use Case 1: Package List Dashboard (Staff View)¶
Display all packages with key metrics for staff/admin management.

Wireframe:


┌─────────────────────────────────────────────────────────────────────────┐
│ Package Management                              [+ Create Package]      │
├─────────────────────────────────────────────────────────────────────────┤
│ Filter: [All Status ▼] [All Outlets ▼]              Search: [________] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📦 Hair Care Premium Package                      [Active] ●        │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ 💰 Rp 300,000  (Save 7.69%)        📊 15 sold | 45 active credits   │ │
│ │ 📅 Valid 90 days                   💵 Revenue: Rp 4,500,000         │ │
│ │ Services: Hair Cut x3, Treatment x2                                 │ │
│ │                                         [Edit] [View] [Archive]     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🧖 Spa Relaxation Bundle                          [Active] ●        │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ 💰 Rp 450,000  (Save 18.18%)       📊 8 sold | 24 active credits    │ │
│ │ 📅 Valid 60 days                   💵 Revenue: Rp 3,600,000         │ │
│ │ Services: Massage x2, Facial x2, Sauna x1                           │ │
│ │                                         [Edit] [View] [Archive]     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 25 packages                        [<] [1] [2] [3] [>] │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Status Badge: Color-coded (green=active, yellow=inactive, gray=archived)
Discount Display: Highlight savings percentage prominently
Quick Stats: Show sold count, active credits, revenue at a glance
Action Buttons: Edit, View Details, Archive with confirmation modal
Use Case 2: Create Package Form¶
Multi-step form for creating new packages with real-time validation.

Wireframe - Step 1 (Basic Info):


┌─────────────────────────────────────────────────────────────────────────┐
│ Create New Package                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Basic Info] ━━━━━━ [2. Services] ────── [3. Pricing] ──────  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Subscription Limit ────────────────────────────────────────────────┐ │
│ │ 📦 Package Slots: 3/10 used (7 remaining)     Plan: PRO             │ │
│ │ 📋 Items per Package: Up to 10 services                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Package Name *                                                          │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Hair Care Premium Package                                         │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Description                                                             │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Complete hair care bundle with multiple treatments                │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│ 0/500 characters                                                        │
│                                                                         │
│ Validity Period *                                                       │
│ ┌──────────────┐                                                        │
│ │ 90    days   │  (Credits expire after this many days)                 │
│ └──────────────┘                                                        │
│                                                                         │
│ Available At                                                            │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ ☑ All Outlets                                                     │   │
│ │ ☐ Main Branch        ☐ Downtown Location    ☐ Mall Outlet         │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                              [Cancel]  [Next: Services] │
└─────────────────────────────────────────────────────────────────────────┘
Wireframe - Step 2 (Select Services):


┌─────────────────────────────────────────────────────────────────────────┐
│ Create New Package                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Basic Info] ━━━━━━ [2. Services] ━━━━━━ [3. Pricing] ──────  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Select Services (3/10 max items)                     Search: [_______]  │
│                                                                         │
│ ┌─ Available Services ────────────────────────────────────────────────┐ │
│ │ ☐ Hair Cut & Style           Rp 75,000    30 min      [+ Add]      │ │
│ │ ☐ Hair Treatment             Rp 50,000    45 min      [+ Add]      │ │
│ │ ☐ Hair Coloring              Rp 150,000   90 min      [+ Add]      │ │
│ │ ☐ Deep Conditioning          Rp 35,000    20 min      [+ Add]      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ Selected Services (Package Items) ─────────────────────────────────┐ │
│ │                                                                     │ │
│ │ Hair Cut & Style                Rp 75,000 × [3 ▼] = Rp 225,000  [✕]│ │
│ │ Hair Treatment                  Rp 50,000 × [2 ▼] = Rp 100,000  [✕]│ │
│ │                                                                     │ │
│ │ ───────────────────────────────────────────────────────────────    │ │
│ │ Total Individual Value:                           Rp 325,000       │ │
│ │ Total Credits:                                    5 credits        │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                       [Back: Basic Info]  [Next: Price] │
└─────────────────────────────────────────────────────────────────────────┘
Wireframe - Step 3 (Set Pricing):


┌─────────────────────────────────────────────────────────────────────────┐
│ Create New Package                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Basic Info] ━━━━━━ [2. Services] ━━━━━━ [3. Pricing] ━━━━━━  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Package Summary ───────────────────────────────────────────────────┐ │
│ │ Hair Care Premium Package                                           │ │
│ │ 5 credits • Valid 90 days • All outlets                             │ │
│ │                                                                     │ │
│ │ • Hair Cut & Style × 3                              Rp 225,000      │ │
│ │ • Hair Treatment × 2                                Rp 100,000      │ │
│ │ ──────────────────────────────────────────────────────────────────  │ │
│ │ Total Individual Value                              Rp 325,000      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Set Package Price *                                                     │
│ ┌────────────────────────────────────────┐                              │
│ │ Rp  300,000                            │                              │
│ └────────────────────────────────────────┘                              │
│ ⚠️ Must be less than Rp 325,000 (require discount)                      │
│                                                                         │
│ ┌─ Discount Preview ──────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │   💰 Customer Saves: Rp 25,000 (7.69%)                              │ │
│ │                                                                     │ │
│ │   ┌─────────────────────────────────────────┐                       │ │
│ │   │ ████████████████████████░░░ 7.69%      │ Discount               │ │
│ │   └─────────────────────────────────────────┘                       │ │
│ │                                                                     │ │
│ │   💡 Recommended: 10-30% discount for best conversion               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                   [Back: Services]  [Create Package]    │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Progress Stepper: Visual indication of multi-step process
Limit Indicator: Show subscription limits before user starts
Real-time Calculation: Update discount preview as price changes
Validation Feedback: Inline errors for price validation
Service Selector: Drag-and-drop or checkbox with quantity spinner
Use Case 3: Package Detail View (Staff)¶
Comprehensive view for staff to see package performance and details.

Wireframe:


┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Packages                          [Edit] [Deactivate] [Delete]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Hair Care Premium Package ─────────────────────────────────────────┐ │
│ │                                                         [Active] ●  │ │
│ │ Complete hair care bundle with 3 haircuts and 2 treatments          │ │
│ │                                                                     │ │
│ │ 💰 Rp 300,000                      📅 Valid for 90 days             │ │
│ │ 🏷️ Save 7.69% (Rp 25,000)          📍 Available at all outlets      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ Package Performance ───────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│ │   │     15       │  │     45       │  │  Rp 4.5M     │              │ │
│ │   │   Packages   │  │   Active     │  │   Total      │              │ │
│ │   │    Sold      │  │   Credits    │  │   Revenue    │              │ │
│ │   └──────────────┘  └──────────────┘  └──────────────┘              │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ Included Services ─────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │ Service               Qty    Unit Price    Subtotal                 │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ Hair Cut & Style       3     Rp 75,000     Rp 225,000               │ │
│ │ Hair Treatment         2     Rp 50,000     Rp 100,000               │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ Individual Total                           Rp 325,000               │ │
│ │ Package Price                              Rp 300,000               │ │
│ │ Customer Savings                           Rp  25,000  (7.69%)      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ Customer Credits Using This Package ───────────────────────────────┐ │
│ │                                                                     │ │
│ │ Customer          Purchase Date    Credits Left    Expires          │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ John Smith        Jan 15, 2025     3/5            Apr 15, 2025      │ │
│ │ Jane Doe          Jan 20, 2025     5/5            Apr 20, 2025      │ │
│ │ Mike Johnson      Feb 01, 2025     2/5            May 02, 2025      │ │
│ │                                                                     │ │
│ │                                            [View All Customers →]   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Status Banner: Prominent status with quick actions
Performance Cards: Key metrics in scannable card format
Service Breakdown: Table showing individual service values
Customer List: Quick view of customers with active credits
Use Case 4: Customer Package Catalog (Customer View)¶
Public-facing package browsing for customers.

Wireframe:


┌─────────────────────────────────────────────────────────────────────────┐
│ Our Packages                                           📍 All Locations │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │  🌟 BEST VALUE                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │                                                                 │ │ │
│ │ │  Hair Care Premium Package                                      │ │ │
│ │ │                                                                 │ │ │
│ │ │  ✓ 3× Hair Cut & Style                                          │ │ │
│ │ │  ✓ 2× Hair Treatment                                            │ │ │
│ │ │                                                                 │ │ │
│ │ │  ┌────────────────────┐  ┌────────────────────┐                 │ │ │
│ │ │  │   Rp 300,000       │  │   SAVE 7.69%       │                 │ │ │
│ │ │  │   ̶R̶p̶ ̶3̶2̶5̶,̶0̶0̶0̶       │  │   Rp 25,000        │                 │ │ │
│ │ │  └────────────────────┘  └────────────────────┘                 │ │ │
│ │ │                                                                 │ │ │
│ │ │  📅 Valid for 90 days after purchase                            │ │ │
│ │ │                                                                 │ │ │
│ │ │                                    [Buy Now]                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │                                                                 │ │ │
│ │ │  Spa Relaxation Bundle                                          │ │ │
│ │ │                                                                 │ │ │
│ │ │  ✓ 2× Full Body Massage                                         │ │ │
│ │ │  ✓ 2× Facial Treatment                                          │ │ │
│ │ │  ✓ 1× Sauna Session                                             │ │ │
│ │ │                                                                 │ │ │
│ │ │  ┌────────────────────┐  ┌────────────────────┐                 │ │ │
│ │ │  │   Rp 450,000       │  │   SAVE 18.18%      │                 │ │ │
│ │ │  │   ̶R̶p̶ ̶5̶5̶0̶,̶0̶0̶0̶       │  │   Rp 100,000       │                 │ │ │
│ │ │  └────────────────────┘  └────────────────────┘                 │ │ │
│ │ │                                                                 │ │ │
│ │ │  📅 Valid for 60 days after purchase                            │ │ │
│ │ │                                                                 │ │ │
│ │ │                                    [Buy Now]                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Savings Badge: Prominent discount percentage
Strikethrough Price: Show original vs package price
Service List: Clear breakdown of what's included
Validity Info: Clear expiration information
Best Value Tag: Highlight recommended packages
Use Case 5: Subscription Limit Warning¶
Display when tenant approaches or reaches package limits.

Wireframe - Approaching Limit:


┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Package Limit Warning                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  You're approaching your package limit on the FREE plan.                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ██████████████████████████████░░░░░░░░░░  1/1 packages used     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  📦 Current: 1 package                                                  │
│  📋 Max items per package: 3 services                                   │
│                                                                         │
│  Upgrade to PRO for:                                                    │
│  ✓ Up to 10 packages                                                    │
│  ✓ Up to 10 items per package                                           │
│  ✓ Advanced analytics                                                   │
│                                                                         │
│                                    [Maybe Later]  [Upgrade to PRO →]    │
└─────────────────────────────────────────────────────────────────────────┘
Wireframe - Limit Reached (on Create):


┌─────────────────────────────────────────────────────────────────────────┐
│ 🚫 Package Limit Reached                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  You've reached the maximum number of packages for your FREE plan.      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ████████████████████████████████████████  1/1 packages (100%)   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  To create more packages, you can:                                      │
│                                                                         │
│  1. Archive an existing package to free up a slot                       │
│  2. Upgrade your subscription plan                                      │
│                                                                         │
│  ┌─ Plan Comparison ──────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  FREE          PRO               ENTERPRISE                        │ │
│  │  1 package     10 packages       100 packages                      │ │
│  │  3 items       10 items          20 items                          │ │
│  │  Current ●     Recommended       For large businesses              │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                          [Archive Package]  [Upgrade Plan →]            │
└─────────────────────────────────────────────────────────────────────────┘
UI Component Library Suggestions¶
React/JSX Component Examples:


// PackageCard.jsx - Reusable package display card
const PackageCard = ({ package, onEdit, onArchive, variant = 'staff' }) => {
  const isCustomerView = variant === 'customer';

  return (
    <div className="package-card">
      <div className="package-header">
        <h3>{package.name}</h3>
        <StatusBadge status={package.status} />
      </div>

      <div className="package-pricing">
        <span className="package-price">
          {formatCurrency(package.package_price)}
        </span>
        {package.discount_percentage > 0 && (
          <DiscountBadge
            percentage={package.discount_percentage}
            amount={package.discount_amount}
            originalPrice={package.total_individual_price}
          />
        )}
      </div>

      <div className="package-services">
        {package.package_items.map(item => (
          <ServiceItem key={item.service_id} {...item} />
        ))}
      </div>

      <div className="package-validity">
        Valid for {package.validity_days} days after purchase
      </div>

      {!isCustomerView && (
        <div className="package-stats">
          <StatCard label="Sold" value={package.total_purchased} />
          <StatCard label="Active Credits" value={package.active_credits_count} />
          <StatCard label="Revenue" value={formatCurrency(package.total_revenue)} />
        </div>
      )}

      <div className="package-actions">
        {isCustomerView ? (
          <Button onClick={() => onPurchase(package.id)}>Buy Now</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onEdit(package.id)}>Edit</Button>
            <Button variant="danger" onClick={() => onArchive(package.id)}>Archive</Button>
          </>
        )}
      </div>
    </div>
  );
};

// DiscountBadge.jsx - Highlight package savings
const DiscountBadge = ({ percentage, amount, originalPrice }) => (
  <div className="discount-badge">
    <span className="discount-percentage">Save {percentage.toFixed(1)}%</span>
    <span className="original-price strikethrough">
      {formatCurrency(originalPrice)}
    </span>
    <span className="savings-amount">
      Save {formatCurrency(amount)}
    </span>
  </div>
);

// SubscriptionLimitBanner.jsx - Show package quota
const SubscriptionLimitBanner = ({ limits, onUpgrade }) => {
  const usagePercent = (limits.current_packages / limits.max_packages) * 100;
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = limits.limit_reached;

  return (
    <div className={`limit-banner ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}>
      <div className="limit-info">
        <span>Package Slots: {limits.current_packages}/{limits.max_packages}</span>
        <ProgressBar value={usagePercent} />
      </div>

      {(isNearLimit || isAtLimit) && (
        <Button variant="upgrade" onClick={onUpgrade}>
          Upgrade Plan
        </Button>
      )}
    </div>
  );
};

// PackageServiceSelector.jsx - Service picker for package creation
const PackageServiceSelector = ({
  availableServices,
  selectedItems,
  maxItems,
  onAddService,
  onRemoveService,
  onQuantityChange
}) => {
  const totalCredits = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = selectedItems.reduce(
    (sum, item) => sum + (item.unit_price * item.quantity),
    0
  );

  return (
    <div className="service-selector">
      <div className="available-services">
        <h4>Available Services</h4>
        {availableServices.map(service => (
          <ServiceRow
            key={service.id}
            service={service}
            isSelected={selectedItems.some(i => i.service_id === service.id)}
            onAdd={() => onAddService(service)}
            disabled={selectedItems.length >= maxItems}
          />
        ))}
      </div>

      <div className="selected-services">
        <h4>Package Items ({selectedItems.length}/{maxItems})</h4>
        {selectedItems.map(item => (
          <SelectedServiceRow
            key={item.service_id}
            item={item}
            onQuantityChange={(qty) => onQuantityChange(item.service_id, qty)}
            onRemove={() => onRemoveService(item.service_id)}
          />
        ))}

        <div className="selection-summary">
          <div>Total Credits: {totalCredits}</div>
          <div>Total Value: {formatCurrency(totalValue)}</div>
        </div>
      </div>
    </div>
  );
};
State Management Recommendations¶
TypeScript Interface for Package State:


// types/package.ts
interface PackageState {
  // List view
  packages: Package[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    status: 'active' | 'inactive' | 'archived' | null;
    outletId: string | null;
    searchQuery: string;
  };

  // Pagination
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };

  // Subscription limits
  limits: {
    packages_enabled: boolean;
    max_packages: number;
    current_packages: number;
    remaining_packages: number;
    max_package_items: number;
    limit_reached: boolean;
  };

  // Create/Edit form
  form: {
    step: 1 | 2 | 3;
    data: PackageFormData;
    validation: ValidationState;
    isSubmitting: boolean;
  };
}

interface PackageFormData {
  name: string;
  description: string;
  validity_days: number;
  outlet_ids: string[];
  package_items: PackageItemInput[];
  package_price: number;
}

interface PackageItemInput {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
}

// Computed values (derive from state, don't store)
interface PackageFormComputed {
  totalIndividualPrice: number;
  totalCredits: number;
  discountAmount: number;
  discountPercentage: number;
  isValidDiscount: boolean;
}
API Integration Patterns¶
React Query Example:


// hooks/usePackages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch package limits
export const usePackageLimits = () => {
  return useQuery({
    queryKey: ['packages', 'limits'],
    queryFn: () => api.get('/api/v1/packages/limits'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// List packages with filters
export const usePackages = (filters: PackageFilters) => {
  return useQuery({
    queryKey: ['packages', filters],
    queryFn: () => api.get('/api/v1/packages', { params: filters }),
  });
};

// Create package mutation
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PackageCreate) => api.post('/api/v1/packages', data),
    onSuccess: () => {
      // Invalidate package list and limits
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error) => {
      if (error.response?.status === 402) {
        // Handle subscription limit error
        showUpgradeModal();
      }
    },
  });
};

// Archive package mutation
export const useArchivePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => api.delete(`/api/v1/packages/${packageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
Error Handling UI Patterns¶
Subscription Limit Error:


// Handle 402 Payment Required
const handleCreatePackage = async (data) => {
  try {
    await createPackage(data);
    toast.success('Package created successfully!');
    navigate('/packages');
  } catch (error) {
    if (error.response?.status === 402) {
      const { message, upgrade_required } = error.response.data;

      showModal({
        type: 'subscription_limit',
        title: 'Package Limit Reached',
        message: message,
        actions: [
          { label: 'Archive Existing', onClick: () => navigate('/packages?action=archive') },
          { label: 'Upgrade Plan', onClick: () => navigate('/settings/subscription'), primary: true },
        ],
      });
    } else if (error.response?.status === 400) {
      // Validation error
      const { detail } = error.response.data;
      toast.error(detail);
    }
  }
};
Price Validation UI:


const PriceInput = ({ value, onChange, maxPrice }) => {
  const isValid = value < maxPrice;
  const discount = maxPrice - value;
  const discountPercent = ((discount / maxPrice) * 100).toFixed(2);

  return (
    <div className="price-input-wrapper">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={!isValid ? 'error' : ''}
      />

      {!isValid && (
        <div className="error-message">
          Package price must be less than {formatCurrency(maxPrice)}
        </div>
      )}

      {isValid && discount > 0 && (
        <div className="discount-preview">
          Customer saves: {formatCurrency(discount)} ({discountPercent}%)
        </div>
      )}

      {isValid && discountPercent < 10 && (
        <div className="warning-message">
          Consider a larger discount (10%+) for better conversion
        </div>
      )}
    </div>
  );
};
Accessibility Considerations¶
Form Labels: All inputs must have associated labels
Error Messages: Use aria-describedby for validation errors
Progress Indicators: Use aria-live for step changes
Status Badges: Include aria-label for color-blind users
Price Formatting: Use aria-label with full currency name
Modal Focus: Trap focus within modals, return focus on close
Mobile Responsive Guidelines¶

/* Package card responsive layout */
.package-card {
  /* Desktop: side-by-side stats */
  @media (min-width: 768px) {
    .package-stats {
      display: flex;
      gap: 1rem;
    }
  }

  /* Mobile: stacked layout */
  @media (max-width: 767px) {
    .package-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .package-actions {
      flex-direction: column;
    }

    .package-actions button {
      width: 100%;
    }
  }
}

/* Service selector responsive */
.service-selector {
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  @media (max-width: 1023px) {
    /* Tabbed interface on mobile */
    .available-services,
    .selected-services {
      display: none;
    }

    .available-services.active,
    .selected-services.active {
      display: block;
    }
  }
}
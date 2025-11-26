Staff Customer Package Management¶
Complete guide to staff-side customer package operations including manual purchases, credit management, and walk-in transactions in the Reserva platform.

Overview¶
The staff customer package management system provides staff-facing tools for managing customer package operations with support for:

Manual Package Purchase - Create package purchases for walk-in customers
Credit Inquiry - View customer credit balances and details
Credit Summary - Quick dashboard view of customer package status
Manual Credit Redemption - Redeem credits on behalf of customers
Audit Trail - Staff activity tracking for all operations
Key Concepts:

Manual On-Spot = Walk-in payments processed at the venue (cash, POS terminal)
Credit Redemption = Using package credits for services (FIFO - First In, First Out)
Staff Audit = All operations tracked with staff member ID
Payment Confirmation = Auto-confirm for on-spot, webhook for digital payments
Portal: Staff Portal (Admin Dashboard)

Access Level: STAFF, TENANT_ADMIN, SUPER_ADMIN

Available Endpoints¶
Endpoint	Method	Purpose	Access
/staff/customer-packages	POST	Create package purchase for customer	STAFF+
/staff/customer-packages/{customer_id}/credits	GET	Get customer credits	STAFF+
/staff/customer-packages/{customer_id}/summary	GET	Get credit summary	STAFF+
/staff/customer-packages/credits/redeem	POST	Redeem customer credit	STAFF+
Create Package Purchase¶
Create a package purchase on behalf of a customer for walk-in or manual transactions.

Endpoint¶
POST /api/v1/staff/customer-packages
Authentication: Required (Staff JWT - STAFF, TENANT_ADMIN, SUPER_ADMIN)

Request Body¶
{
  "customer_id": "507f1f77bcf86cd799439011",
  "package_id": "507f1f77bcf86cd799439012",
  "outlet_id": "507f1f77bcf86cd799439013",
  "payment_method": "manual_onspot",
  "amount_paid": 500000,
  "currency": "IDR",
  "notes": "Walk-in customer, paid cash"
}
Parameters¶
Field	Type	Required	Description
customer_id	string	Yes	Customer ID purchasing the package
package_id	string	Yes	Package ID being purchased
outlet_id	string	Yes	Outlet ID where purchase occurs
payment_method	string	No	Payment method (default: manual_onspot)
amount_paid	decimal	Yes	Amount paid (must be > 0)
currency	string	No	Currency code (default: "IDR")
notes	string	No	Optional purchase notes (max 500 chars)
Payment Methods¶
Method	Description	Status Flow	Credit Activation
manual_onspot	Cash/POS at venue	Auto-confirmed → PAID	Immediate
paper_digital	Digital via Paper.id	Pending → Webhook confirms	On webhook
bank_transfer	Bank transfer	Pending → Staff confirms	On confirmation
Response¶
{
  "id": "507f1f77bcf86cd799439020",
  "tenant_id": "507f1f77bcf86cd799439010",
  "customer_id": "507f1f77bcf86cd799439011",
  "package_id": "507f1f77bcf86cd799439012",
  "outlet_id": "507f1f77bcf86cd799439013",
  "payment_method": "manual_onspot",
  "payment_status": "paid",
  "amount_paid": 500000,
  "currency": "IDR",
  "package_name": "Hair Care Deluxe Package",
  "validity_days": 120,
  "purchased_at": "2025-01-20T10:30:00Z",
  "expires_at": "2025-05-20T23:59:59Z",
  "payment_confirmed_at": "2025-01-20T10:30:00Z",
  "status": "active",
  "total_credits": 10,
  "used_credits": 0,
  "remaining_credits": 10,
  "expired_credits": 0,
  "notes": "Walk-in customer, paid cash",
  "created_at": "2025-01-20T10:30:00Z",
  "updated_at": "2025-01-20T10:30:00Z",
  "package_details": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Hair Care Deluxe Package",
    "description": "Premium hair care services",
    "price": 500000,
    "validity_days": 120,
    "package_items": [
      {
        "service_id": "507f1f77bcf86cd799439014",
        "service_name": "Hair Coloring",
        "quantity": 5,
        "unit_price": 75000
      },
      {
        "service_id": "507f1f77bcf86cd799439015",
        "service_name": "Hair Treatment",
        "quantity": 5,
        "unit_price": 50000
      }
    ]
  },
  "credits_details": [
    {
      "id": "507f1f77bcf86cd799439030",
      "service_id": "507f1f77bcf86cd799439014",
      "service_name": "Hair Coloring",
      "total_credits": 5,
      "used_credits": 0,
      "remaining_credits": 5,
      "expires_at": "2025-05-20T23:59:59Z"
    },
    {
      "id": "507f1f77bcf86cd799439031",
      "service_id": "507f1f77bcf86cd799439015",
      "service_name": "Hair Treatment",
      "total_credits": 5,
      "used_credits": 0,
      "remaining_credits": 5,
      "expires_at": "2025-05-20T23:59:59Z"
    }
  ],
  "days_until_expiry": 120,
  "is_expiring_soon": false
}
Response Fields¶
Field	Type	Description
package_details	object	Full package information (name, items, prices)
credits_details	array	Itemized credits breakdown by service
days_until_expiry	integer	Calculated days until expiration
is_expiring_soon	boolean	True if expires within 7 days
payment_confirmed_at	datetime	When payment was confirmed (null if pending)
Business Rules¶
Customer must exist and belong to current tenant
Package must exist, be active, and belong to current tenant
Outlet must exist and belong to current tenant
Manual on-spot payments auto-confirm with immediate credit allocation
Digital/bank transfer payments start pending until confirmation
Staff member ID recorded for audit trail
Amount paid must be greater than zero
Package Status Flow¶
graph TD
    A[Staff Creates Purchase] --> B{Payment Method?}
    B -->|manual_onspot| C[Status: ACTIVE]
    B -->|paper_digital| D[Status: PENDING_PAYMENT]
    B -->|bank_transfer| D
    C --> E[Credits Allocated]
    D --> F[Awaiting Confirmation]
    F -->|Webhook/Staff Confirms| C
Process Flow¶
Validate customer, package, and outlet existence
Verify tenant isolation for all resources
Create payment record (for manual on-spot)
Create package purchase with appropriate status
Link payment record to customer package
Allocate credits (only if payment auto-confirmed)
Record staff member audit information
Return enriched response with package and credit details
Get Customer Credits¶
Retrieve customer's package credits with flexible filtering options.

Endpoint¶
GET /api/v1/staff/customer-packages/{customer_id}/credits?service_id=507f1f77bcf86cd799439014&include_used=false&include_expired=false
Authentication: Required (Staff JWT - STAFF, TENANT_ADMIN, SUPER_ADMIN)

Path Parameters¶
Parameter	Type	Required	Description
customer_id	string	Yes	Customer ID to check credits for
Query Parameters¶
Parameter	Type	Required	Default	Description
service_id	string	No	null	Filter credits for specific service
include_used	boolean	No	false	Include fully used credits (remaining = 0)
include_expired	boolean	No	false	Include expired credits
Response¶
[
  {
    "id": "507f1f77bcf86cd799439030",
    "tenant_id": "507f1f77bcf86cd799439010",
    "customer_id": "507f1f77bcf86cd799439011",
    "customer_package_id": "507f1f77bcf86cd799439020",
    "service_id": "507f1f77bcf86cd799439014",
    "service_name": "Hair Coloring",
    "allocated_credits": 5,
    "used_credits": 2,
    "remaining_credits": 3,
    "expires_at": "2026-01-20T23:59:59Z",
    "is_expired": false,
    "created_at": "2025-01-20T10:30:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439031",
    "tenant_id": "507f1f77bcf86cd799439010",
    "customer_id": "507f1f77bcf86cd799439011",
    "customer_package_id": "507f1f77bcf86cd799439021",
    "service_id": "507f1f77bcf86cd799439015",
    "service_name": "Facial Treatment",
    "allocated_credits": 10,
    "used_credits": 0,
    "remaining_credits": 10,
    "expires_at": "2025-12-31T23:59:59Z",
    "is_expired": false,
    "created_at": "2025-01-15T14:20:00Z"
  }
]
Response Fields¶
Field	Type	Description
customer_package_id	string	Reference to the purchased package
service_name	string	Cached service name for display
allocated_credits	integer	Total credits originally allocated
used_credits	integer	Credits already redeemed
remaining_credits	integer	Credits available for use
is_expired	boolean	Whether credits have expired
Business Rules¶
Customer must exist and belong to current tenant
By default, returns only available credits (remaining > 0, not expired)
Credits ordered by expiry date (FIFO - oldest first)
Service filter validates service exists if provided
Empty array returned if no credits match filters
Use Cases¶
Check customer credit balance before appointment booking
Verify customer has available credits for specific service
Review complete credit usage history (with filters enabled)
Display available credits in booking interface
Get Credit Summary¶
Retrieve aggregated summary of customer's package credit status.

Endpoint¶
GET /api/v1/staff/customer-packages/{customer_id}/summary
Authentication: Required (Staff JWT - STAFF, TENANT_ADMIN, SUPER_ADMIN)

Path Parameters¶
Parameter	Type	Required	Description
customer_id	string	Yes	Customer ID to get summary for
Response¶
{
  "total_packages": 5,
  "active_packages": 3,
  "total_credits": 50,
  "used_credits": 30,
  "remaining_credits": 15,
  "expired_credits": 5,
  "expiring_soon": 8
}
Response Fields¶
Field	Type	Description
total_packages	integer	Count of all packages purchased
active_packages	integer	Packages with remaining credits and not expired
total_credits	integer	Sum of all allocated credits
used_credits	integer	Sum of redeemed credits
remaining_credits	integer	Sum of available credits
expired_credits	integer	Sum of unused expired credits
expiring_soon	integer	Count of credits expiring within 30 days
Business Rules¶
Customer must exist and belong to current tenant
Active packages = packages with remaining_credits > 0 and not expired
Expiring soon = credits expiring within next 30 days
Summary aggregates across all customer packages
Use Cases¶
Quick credit balance check at front desk
Customer service inquiries about package status
Staff dashboard display of customer credit overview
Pre-booking credit availability verification
Redeem Customer Credit¶
Manually redeem one credit from customer's package for walk-in or phone bookings.

Endpoint¶
POST /api/v1/staff/customer-packages/credits/redeem
Authentication: Required (Staff JWT - STAFF, TENANT_ADMIN, SUPER_ADMIN)

Request Body¶
{
  "customer_id": "507f1f77bcf86cd799439011",
  "service_id": "507f1f77bcf86cd799439014",
  "notes": "Walk-in service redemption"
}
Parameters¶
Field	Type	Required	Description
customer_id	string	Yes	Customer ID redeeming credit
service_id	string	Yes	Service ID for credit redemption
notes	string	No	Optional redemption notes (max 500 chars)
Response¶
{
  "id": "507f1f77bcf86cd799439030",
  "tenant_id": "507f1f77bcf86cd799439010",
  "customer_id": "507f1f77bcf86cd799439011",
  "customer_package_id": "507f1f77bcf86cd799439020",
  "service_id": "507f1f77bcf86cd799439014",
  "service_name": "Hair Coloring",
  "allocated_credits": 5,
  "used_credits": 3,
  "remaining_credits": 2,
  "expires_at": "2026-01-20T23:59:59Z",
  "is_expired": false,
  "redeemed_by_staff_id": "507f1f77bcf86cd799439015",
  "redemption_notes": "Walk-in service redemption",
  "redeemed_at": "2025-01-20T14:30:00Z"
}
Business Rules¶
Customer must exist and belong to current tenant
Service must exist and belong to current tenant
Credit must be available (remaining_credits > 0)
Credit must not be expired (expires_at > now or null)
Payment must be confirmed (package payment_status = PAID)
FIFO redemption: Oldest credits (by expiry date) used first
Only one credit redeemed per request
Staff member ID recorded in audit trail
FIFO Redemption Logic¶
Credits are redeemed in First In, First Out order:

Credits ordered by expiry date (ascending)
Closest to expiration redeemed first
Prevents credit expiration waste
Automatic selection - no manual credit ID needed
graph TD
    A[Redemption Request] --> B[Get Available Credits]
    B --> C[Order by Expiry Date ASC]
    C --> D[Select First Credit - Oldest]
    D --> E{Has Remaining Credits?}
    E -->|Yes| F[Redeem 1 Credit]
    E -->|No| G[Error: No Credits Available]
    F --> H[Update Credit Record]
    H --> I[Record Staff Audit]
    I --> J[Return Updated Credit]
Use Cases¶
Walk-in customer service redemption at front desk
Phone booking with credit payment
Manual appointment creation using customer credit
Staff-assisted credit redemption for offline services
Validation Errors¶
No Available Credits:

{
  "detail": "No available credits for service 507f1f77bcf86cd799439014"
}
Customer Not Found:

{
  "detail": "Customer 507f1f77bcf86cd799439011 not found"
}
Service Not Found:

{
  "detail": "Service 507f1f77bcf86cd799439014 not found"
}
Integration with Appointment Booking¶
Manual credit redemption is separate from appointment booking credit redemption:

Scenario	Endpoint	Use Case
Walk-in service	POST /staff/customer-packages/credits/redeem	Service performed without prior appointment
Appointment booking	POST /appointments with use_package_credit=true	Online/scheduled booking with credit
Relationship to Appointment Flow¶
When creating an appointment with package credits through the appointment booking system, the credit is automatically redeemed via the CustomerPackageService.redeem_credit() method with the appointment_id linked.

Manual redemption (this endpoint) is for scenarios where:

Service is performed without an appointment
Walk-in customers with package credits
Phone/in-person service requests
Staff needs to redeem credit outside booking flow
See Appointment Management for appointment-based credit redemption.

Audit Trail¶
All staff operations are tracked for accountability:

Package Purchase Audit¶
Field	Description
created_by_staff_id	Staff member who created the purchase
notes	Staff notes about the transaction
payment_confirmed_at	When payment was confirmed
Credit Redemption Audit¶
Field	Description
redeemed_by_staff_id	Staff member who performed redemption
redemption_notes	Staff notes about the redemption
redeemed_at	Timestamp of redemption
Error Handling¶
Common Errors¶
Error Code	Cause	Solution
400 Bad Request	Invalid input or no available credits	Check parameters and credit availability
401 Unauthorized	Missing/invalid token	Verify JWT token
403 Forbidden	Insufficient permissions	Requires STAFF+ role
404 Not Found	Customer/Package/Service not found	Verify resource IDs
422 Validation Error	Invalid ObjectId format	Check ID format
500 Internal Server Error	Server error	Contact support
Validation Errors¶
Invalid ObjectId:

{
  "detail": [
    {
      "loc": ["body", "customer_id"],
      "msg": "Invalid ObjectId format: invalid-id",
      "type": "value_error"
    }
  ]
}
Customer Not in Tenant:

{
  "detail": "Customer 507f1f77bcf86cd799439011 not found"
}
Package Not Available:

{
  "detail": "Package 507f1f77bcf86cd799439012 not found"
}
Best Practices¶
Package Purchases¶
DO:

Verify customer identity before processing walk-in purchases
Record accurate payment amounts
Add descriptive notes for transaction context
Use manual_onspot for immediate cash/POS payments
Confirm customer understands package terms and expiry
DON'T:

Process purchases without verifying customer exists
Use incorrect payment methods (affects credit activation)
Skip notes for unusual transactions
Assume credits are activated without checking payment status
Credit Redemptions¶
DO:

Check available credits before service
Inform customer which credits are being used (FIFO)
Add notes explaining redemption context
Verify service matches credit type
Monitor expiring credits and suggest usage
DON'T:

Redeem credits without customer awareness
Skip verification of credit availability
Forget to record redemption notes
Assume credits exist without checking
Customer Service¶
DO:

Use summary endpoint for quick balance checks
Use credits endpoint for detailed breakdown
Proactively notify customers of expiring credits
Document all staff-customer interactions
DON'T:

Provide inaccurate credit information
Process redemptions without customer consent
Ignore expiring credit warnings
Related Documentation¶
Package System¶
Customer Package Management - Customer-facing self-service package operations
Package Management - Admin package creation and configuration
Customer Package Payments - Payment processing for packages
Appointment Integration¶
Appointment Management - Complete appointment booking guide
Appointment Credit Redemption - Using credits during appointment booking
Automatic credit validation and FIFO selection
Atomic appointment + credit redemption
Automatic refund on cancellation
Supporting Documentation¶
Customer Management - Customer profile management
Service Management - Service catalog management
Invoice Management - Package purchase invoices
Subscription Management - Plan limits and features
Subscription Plan Considerations¶
Package features availability depends on the tenant's subscription plan:

Plan	Packages Feature	Max Packages	Max Items/Package
FREE	Yes	1	3
PRO	Yes	10	10
ENTERPRISE	Yes	100	20
Note: Staff can create package purchases for any existing package, regardless of plan. Plan limits apply to package creation, not customer purchases.

For package creation limits, see Package Management - Subscription Plan Limits.

API Reference Summary¶
Endpoint	Method	Purpose	Access
/staff/customer-packages	POST	Create package purchase	STAFF+
/staff/customer-packages/{id}/credits	GET	Get customer credits	STAFF+
/staff/customer-packages/{id}/summary	GET	Get credit summary	STAFF+
/staff/customer-packages/credits/redeem	POST	Redeem credit	STAFF+
Next Steps:

Verify customer exists: Check customer management system
Check available packages: GET /packages?is_active=true
Create package purchase: POST /staff/customer-packages
Verify credits allocated: GET /staff/customer-packages/{customer_id}/credits
Redeem credits as needed: POST /staff/customer-packages/credits/redeem
For complete API testing, see Swagger UI or ReDoc.

Frontend UI Suggestions¶
This section provides UI/UX recommendations for frontend developers implementing staff-side customer package management features.

Use Case 1: Staff Dashboard - Customer Credit Lookup¶
Quick lookup interface for staff to check customer credit status.

Wireframe:

┌─────────────────────────────────────────────────────────────────────────┐
│ Customer Credit Lookup                                    Staff Portal  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Search Customer                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ 🔍 Search by name, phone, or email...                             │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌─ Recent Customers ────────────────────────────────────────────────┐   │
│ │ John Smith        +62812345678     john@email.com    [Select]     │   │
│ │ Jane Doe          +62823456789     jane@email.com    [Select]     │   │
│ │ Mike Johnson      +62834567890     mike@email.com    [Select]     │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Customer: John Smith ─────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │  📞 +62812345678          ✉️ john@email.com                        │  │
│ │                                                                    │  │
│ │  ┌─ Credit Summary ──────────────────────────────────────────────┐ │  │
│ │  │                                                               │ │  │
│ │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │  │
│ │  │  │    3     │ │   15     │ │   12     │ │    3     │          │ │  │
│ │  │  │ Active   │ │  Total   │ │  Used    │ │Remaining │          │ │  │
│ │  │  │ Packages │ │ Credits  │ │ Credits  │ │ Credits  │          │ │  │
│ │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │ │  │
│ │  │                                                               │ │  │
│ │  │  ⚠️ 2 credits expiring in 7 days                              │ │  │
│ │  │                                                               │ │  │
│ │  └───────────────────────────────────────────────────────────────┘ │  │
│ │                                                                    │  │
│ │  [View Details]   [Sell Package]   [Redeem Credit]                 │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Search Autocomplete: Instant search with customer preview
Recent Customers: Quick access to recently interacted customers
Summary Cards: At-a-glance credit status
Expiring Warning: Highlight credits needing attention
Quick Actions: Prominent buttons for common operations
Use Case 2: Detailed Credit View¶
Comprehensive view of customer's credits with filtering options.

Wireframe:

┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Lookup          John Smith - Credit Details                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Filter: [All Services ▼] [☐ Include Used] [☐ Include Expired]           │
│                                                                         │
│ ┌─ Available Credits ───────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ ┌───────────────────────────────────────────────────────────────┐ │   │
│ │ │ 💇 Hair Coloring                                              │ │   │
│ │ │ Package: Hair Care Deluxe                                     │ │   │
│ │ │                                                               │ │   │
│ │ │ Credits: [██████████░░░░░░░░░░] 3/5 remaining                 │ │   │
│ │ │                                                               │ │   │
│ │ │ ⏰ Expires: Apr 15, 2025 (85 days)                            │ │   │
│ │ │                                                               │ │   │
│ │ │                                         [Redeem 1 Credit]     │ │   │
│ │ └───────────────────────────────────────────────────────────────┘ │   │
│ │                                                                   │   │
│ │ ┌───────────────────────────────────────────────────────────────┐ │   │
│ │ │ 💆 Hair Treatment                          ⚠️ EXPIRING SOON   │ │   │
│ │ │ Package: Hair Care Deluxe                                     │ │   │
│ │ │                                                               │ │   │
│ │ │ Credits: [████░░░░░░░░░░░░░░░░] 2/5 remaining                 │ │   │
│ │ │                                                               │ │   │
│ │ │ ⏰ Expires: Feb 01, 2025 (7 days) 🔴                          │ │   │
│ │ │                                                               │ │   │
│ │ │                                         [Redeem 1 Credit]     │ │   │
│ │ └───────────────────────────────────────────────────────────────┘ │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌─ Credit History ──────────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ Date           Service           Action      Staff        Notes   │   │
│ │ ──────────────────────────────────────────────────────────────── │   │
│ │ Jan 20, 2025   Hair Coloring     Redeemed    Sarah T.     Walk-in│   │
│ │ Jan 18, 2025   Hair Treatment    Redeemed    Mike R.      Appt   │   │
│ │ Jan 15, 2025   Hair Care Deluxe  Purchased   Sarah T.     Cash   │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Service Filter: Dropdown to filter by specific service
Toggle Filters: Checkboxes for used/expired credits
Progress Bars: Visual representation of credit usage
Expiration Badges: Clear visual for expiring soon status
Credit History: Audit trail of all credit transactions
Use Case 3: Walk-in Package Purchase¶
Staff interface for selling packages to walk-in customers.

Wireframe - Step 1 (Select Package):

┌─────────────────────────────────────────────────────────────────────────┐
│ Sell Package to Customer                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Select Package] ━━━━━━ [2. Payment] ────── [3. Confirm] ────  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Customer: John Smith (+62812345678)                      [Change]       │
│ Outlet: Main Branch - Downtown                           [Change]       │
│                                                                         │
│ ┌─ Available Packages ──────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ ○ Hair Care Deluxe Package                        Rp 500,000      │   │
│ │   • Hair Coloring × 5                                             │   │
│ │   • Hair Treatment × 5                                            │   │
│ │   Valid: 120 days | Save 15%                                      │   │
│ │                                                                   │   │
│ │ ● Spa Relaxation Bundle                           Rp 450,000      │   │
│ │   • Full Body Massage × 3                                ✓        │   │
│ │   • Facial Treatment × 3                                          │   │
│ │   Valid: 90 days | Save 18%                                       │   │
│ │                                                                   │   │
│ │ ○ Premium Wellness Package                        Rp 800,000      │   │
│ │   • All Services × 2                                              │   │
│ │   Valid: 180 days | Save 25%                                      │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                              [Cancel]  [Next: Payment]  │
└─────────────────────────────────────────────────────────────────────────┘
Wireframe - Step 2 (Payment):

┌─────────────────────────────────────────────────────────────────────────┐
│ Sell Package to Customer                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Select Package] ━━━━━━ [2. Payment] ━━━━━━ [3. Confirm] ────  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Order Summary ───────────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ Package: Spa Relaxation Bundle                                    │   │
│ │ Customer: John Smith                                              │   │
│ │ Outlet: Main Branch - Downtown                                    │   │
│ │                                                                   │   │
│ │ Price:                                           Rp 450,000       │   │
│ │ Discount:                                        Rp  99,000 (18%) │   │
│ │ ─────────────────────────────────────────────────────────────     │   │
│ │ Total:                                           Rp 450,000       │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Payment Method                                                          │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ ● Cash / POS Terminal (manual_onspot)                             │   │
│ │   Credits activated immediately                                   │   │
│ │                                                                   │   │
│ │ ○ Digital Payment (paper_digital)                                 │   │
│ │   Customer pays via link, credits activated on payment            │   │
│ │                                                                   │   │
│ │ ○ Bank Transfer (bank_transfer)                                   │   │
│ │   Manual confirmation required, credits pending                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Amount Received *                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Rp  450,000                                                       │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Notes (optional)                                                        │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Walk-in customer, paid cash                                       │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                     [Back: Package]  [Process Payment]  │
└─────────────────────────────────────────────────────────────────────────┘
Wireframe - Step 3 (Confirmation):

┌─────────────────────────────────────────────────────────────────────────┐
│ Sell Package to Customer                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Step: [1. Select Package] ━━━━━━ [2. Payment] ━━━━━━ [3. Confirm] ━━━━  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                              ✅                                         │
│                                                                         │
│                    Package Purchase Successful!                         │
│                                                                         │
│ ┌─ Purchase Details ────────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ Package:       Spa Relaxation Bundle                              │   │
│ │ Customer:      John Smith                                         │   │
│ │ Amount Paid:   Rp 450,000                                         │   │
│ │ Payment:       Cash (Confirmed)                                   │   │
│ │                                                                   │   │
│ │ ─────────────────────────────────────────────────────────────     │   │
│ │                                                                   │   │
│ │ Credits Allocated:                                                │   │
│ │ • Full Body Massage: 3 credits                                    │   │
│ │ • Facial Treatment: 3 credits                                     │   │
│ │                                                                   │   │
│ │ Expires: Apr 20, 2025 (90 days)                                   │   │
│ │                                                                   │   │
│ │ Transaction ID: PKG-2025012001234                                 │   │
│ │ Processed by: Sarah Thompson                                      │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│            [Print Receipt]   [New Sale]   [View Customer Credits]       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Progress Stepper: Clear indication of purchase flow
Package Radio Selection: Clear selection with pricing
Payment Method Info: Explain credit activation timing
Success Confirmation: Transaction details with print option
Use Case 4: Manual Credit Redemption¶
Staff interface for redeeming credits for walk-in services.

Wireframe:

┌─────────────────────────────────────────────────────────────────────────┐
│ Redeem Credit - Walk-in Service                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Customer: John Smith                                    [Change]        │
│                                                                         │
│ ┌─ Available Credits for Redemption ────────────────────────────────┐   │
│ │                                                                   │   │
│ │ Select Service to Redeem:                                         │   │
│ │                                                                   │   │
│ │ ┌─────────────────────────────────────────────────────────────┐   │   │
│ │ │ ● 💇 Hair Coloring                                          │   │   │
│ │ │   3 credits available                                       │   │   │
│ │ │   Expires: Apr 15, 2025 (85 days)                           │   │   │
│ │ │   From: Hair Care Deluxe Package                            │   │   │
│ │ └─────────────────────────────────────────────────────────────┘   │   │
│ │                                                                   │   │
│ │ ┌─────────────────────────────────────────────────────────────┐   │   │
│ │ │ ○ 💆 Hair Treatment                        ⚠️ Expires Soon  │   │   │
│ │ │   2 credits available                                       │   │   │
│ │ │   Expires: Feb 01, 2025 (7 days) 🔴                         │   │   │
│ │ │   From: Hair Care Deluxe Package                            │   │   │
│ │ │   💡 Recommend using before expiration                      │   │   │
│ │ └─────────────────────────────────────────────────────────────┘   │   │
│ │                                                                   │   │
│ │ ┌─────────────────────────────────────────────────────────────┐   │   │
│ │ │ ○ 💆 Full Body Massage                                      │   │   │
│ │ │   3 credits available                                       │   │   │
│ │ │   Expires: Apr 20, 2025 (90 days)                           │   │   │
│ │ │   From: Spa Relaxation Bundle                               │   │   │
│ │ └─────────────────────────────────────────────────────────────┘   │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Redemption Notes (optional)                                             │
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ Walk-in service                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌─ Redemption Summary ──────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ Service: Hair Coloring                                            │   │
│ │ Credits to use: 1                                                 │   │
│ │ Remaining after: 2 credits                                        │   │
│ │                                                                   │   │
│ │ ℹ️ Using FIFO: Oldest credits will be used first                  │   │
│ │                                                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                      [Cancel]   [Confirm Redemption]    │
└─────────────────────────────────────────────────────────────────────────┘
Confirmation Modal:

┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ Credit Redeemed Successfully                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Service:          Hair Coloring                                         │
│ Customer:         John Smith                                            │
│ Credits Used:     1                                                     │
│ Remaining:        2 credits                                             │
│                                                                         │
│ Redeemed by:      Sarah Thompson                                        │
│ Time:             Jan 20, 2025 14:30                                    │
│                                                                         │
│                                          [Close]   [Redeem Another]     │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Radio Selection: Only one service can be redeemed at a time
Expiring Soon Badge: Visual indicator for expiring credits
FIFO Explanation: Help text explaining credit selection logic
Confirmation Modal: Clear summary after redemption
Use Case 5: Pending Payment Management¶
Staff interface for managing pending package payments.

Wireframe:

┌─────────────────────────────────────────────────────────────────────────┐
│ Pending Package Payments                                Staff Portal    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Filter: [All Methods ▼]  [Last 7 Days ▼]       Search: [____________]   │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⏳ PENDING                                                          │ │
│ │                                                                     │ │
│ │ John Smith                                    Jan 18, 2025 14:30    │ │
│ │ Hair Care Deluxe Package                                            │ │
│ │ Rp 500,000 via Bank Transfer                                        │ │
│ │                                                                     │ │
│ │ Notes: Waiting for bank transfer confirmation                       │ │
│ │ Created by: Mike R.                                                 │ │
│ │                                                                     │ │
│ │                                   [View Details]  [Confirm Payment] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⏳ PENDING                                                          │ │
│ │                                                                     │ │
│ │ Jane Doe                                      Jan 17, 2025 10:15    │ │
│ │ Premium Wellness Package                                            │ │
│ │ Rp 800,000 via Digital Payment (Paper.id)                           │ │
│ │                                                                     │ │
│ │ Notes: Payment link sent to customer                                │ │
│ │ Created by: Sarah T.                                                │ │
│ │                                                                     │ │
│ │ 🔗 Payment Link: https://pay.paper.id/xxx    [Copy] [Resend]        │ │
│ │                                                                     │ │
│ │                                   [View Details]  [Cancel Purchase] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Showing 2 pending payments                                              │
└─────────────────────────────────────────────────────────────────────────┘
Key UI Elements:

Status Badge: Clear pending indicator
Payment Method: Display method with action options
Payment Link: Copy/resend options for digital payments
Confirm Button: For bank transfer confirmations
UI Component Library Suggestions¶
React/JSX Component Examples:

// CustomerCreditSummary.jsx - Quick credit overview
const CustomerCreditSummary = ({ customerId }) => {
  const { data: summary, isLoading } = useCustomerCreditSummary(customerId);

  if (isLoading) return <Skeleton />;

  return (
    <div className="credit-summary">
      <div className="summary-grid">
        <StatCard
          label="Active Packages"
          value={summary.active_packages}
          total={summary.total_packages}
        />
        <StatCard
          label="Remaining Credits"
          value={summary.remaining_credits}
          variant={summary.remaining_credits > 0 ? 'success' : 'muted'}
        />
        <StatCard
          label="Used Credits"
          value={summary.used_credits}
        />
        <StatCard
          label="Expired"
          value={summary.expired_credits}
          variant={summary.expired_credits > 0 ? 'warning' : 'muted'}
        />
      </div>

      {summary.expiring_soon > 0 && (
        <Alert variant="warning">
          {summary.expiring_soon} credits expiring within 30 days
        </Alert>
      )}
    </div>
  );
};

// CreditCard.jsx - Individual credit display
const CreditCard = ({ credit, onRedeem }) => {
  const daysUntilExpiry = differenceInDays(new Date(credit.expires_at), new Date());
  const isExpiringSoon = daysUntilExpiry <= 7;
  const usagePercent = (credit.remaining_credits / credit.allocated_credits) * 100;

  return (
    <div className={`credit-card ${isExpiringSoon ? 'expiring-soon' : ''}`}>
      <div className="credit-header">
        <ServiceIcon serviceId={credit.service_id} />
        <h4>{credit.service_name}</h4>
        {isExpiringSoon && <Badge variant="warning">Expiring Soon</Badge>}
      </div>

      <ProgressBar
        value={usagePercent}
        label={`${credit.remaining_credits}/${credit.allocated_credits} remaining`}
      />

      <div className="credit-expiry">
        <ClockIcon />
        <span>Expires: {formatDate(credit.expires_at)}</span>
        {isExpiringSoon && (
          <span className="days-left">({daysUntilExpiry} days)</span>
        )}
      </div>

      <Button
        onClick={() => onRedeem(credit)}
        disabled={credit.remaining_credits === 0}
      >
        Redeem 1 Credit
      </Button>
    </div>
  );
};

// PackagePurchaseForm.jsx - Walk-in package sale
const PackagePurchaseForm = ({ customerId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('manual_onspot');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: createPurchase, isLoading } = useCreatePackagePurchase();

  const handleSubmit = () => {
    createPurchase({
      customer_id: customerId,
      package_id: selectedPackage.id,
      outlet_id: currentOutlet.id,
      payment_method: paymentMethod,
      amount_paid: parseFloat(amount),
      notes: notes
    }, {
      onSuccess: (data) => {
        setStep(3);
        onSuccess?.(data);
      }
    });
  };

  return (
    <div className="purchase-form">
      <Stepper currentStep={step} steps={['Package', 'Payment', 'Confirm']} />

      {step === 1 && (
        <PackageSelector
          packages={availablePackages}
          selected={selectedPackage}
          onSelect={setSelectedPackage}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PaymentForm
          package={selectedPackage}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          amount={amount}
          onAmountChange={setAmount}
          notes={notes}
          onNotesChange={setNotes}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}

      {step === 3 && (
        <PurchaseConfirmation
          purchase={purchaseResult}
          onPrintReceipt={handlePrint}
          onNewSale={() => resetForm()}
          onViewCredits={() => navigate(`/customers/${customerId}/credits`)}
        />
      )}
    </div>
  );
};

// RedemptionModal.jsx - Credit redemption confirmation
const RedemptionModal = ({ customer, credit, onConfirm, onClose }) => {
  const [notes, setNotes] = useState('');
  const { mutate: redeemCredit, isLoading } = useRedeemCredit();

  const handleRedeem = () => {
    redeemCredit({
      customer_id: customer.id,
      service_id: credit.service_id,
      notes: notes
    }, {
      onSuccess: () => {
        toast.success('Credit redeemed successfully');
        onConfirm();
      }
    });
  };

  return (
    <Modal open onClose={onClose}>
      <ModalHeader>Confirm Credit Redemption</ModalHeader>

      <ModalBody>
        <div className="redemption-summary">
          <InfoRow label="Customer" value={customer.name} />
          <InfoRow label="Service" value={credit.service_name} />
          <InfoRow label="Credits to use" value="1" />
          <InfoRow
            label="Remaining after"
            value={`${credit.remaining_credits - 1} credits`}
          />
        </div>

        <Alert variant="info">
          Using FIFO: Oldest credits will be used first
        </Alert>

        <TextArea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Walk-in service redemption"
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleRedeem} loading={isLoading}>
          Confirm Redemption
        </Button>
      </ModalFooter>
    </Modal>
  );
};
State Management Recommendations¶
TypeScript Interface for Staff Package State:

// types/staffPackage.ts
interface StaffPackageState {
  // Customer lookup
  selectedCustomer: Customer | null;
  customerCredits: CustomerCredit[];
  creditSummary: CreditSummary | null;

  // Package purchase
  purchaseForm: {
    step: 1 | 2 | 3;
    selectedPackage: Package | null;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes: string;
    outletId: string;
  };
  purchaseResult: CustomerPackage | null;

  // Redemption
  redemptionInProgress: boolean;
  selectedCredit: CustomerCredit | null;
  redemptionNotes: string;

  // Pending payments
  pendingPayments: PendingPayment[];

  // UI state
  isLoading: boolean;
  error: string | null;
}

interface CreditSummary {
  total_packages: number;
  active_packages: number;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  expired_credits: number;
  expiring_soon: number;
}

interface CustomerCredit {
  id: string;
  customer_package_id: string;
  service_id: string;
  service_name: string;
  allocated_credits: number;
  used_credits: number;
  remaining_credits: number;
  expires_at: string;
  is_expired: boolean;
}

type PaymentMethod = 'manual_onspot' | 'paper_digital' | 'bank_transfer';

// Payment method helper
const PAYMENT_METHODS = {
  manual_onspot: {
    label: 'Cash / POS Terminal',
    description: 'Credits activated immediately',
    requiresConfirmation: false
  },
  paper_digital: {
    label: 'Digital Payment',
    description: 'Customer pays via link, credits activated on payment',
    requiresConfirmation: true
  },
  bank_transfer: {
    label: 'Bank Transfer',
    description: 'Manual confirmation required, credits pending',
    requiresConfirmation: true
  }
};
API Integration Patterns¶
React Query Hooks:

// hooks/useStaffPackages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Get customer credit summary
export const useCustomerCreditSummary = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-credits', 'summary', customerId],
    queryFn: () => api.get(`/api/v1/staff/customer-packages/${customerId}/summary`),
    enabled: !!customerId,
  });
};

// Get customer credits with filters
export const useCustomerCredits = (
  customerId: string,
  filters: { serviceId?: string; includeUsed?: boolean; includeExpired?: boolean }
) => {
  return useQuery({
    queryKey: ['customer-credits', customerId, filters],
    queryFn: () => api.get(`/api/v1/staff/customer-packages/${customerId}/credits`, {
      params: {
        service_id: filters.serviceId,
        include_used: filters.includeUsed,
        include_expired: filters.includeExpired
      }
    }),
    enabled: !!customerId,
  });
};

// Create package purchase
export const useCreatePackagePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PackagePurchaseInput) =>
      api.post('/api/v1/staff/customer-packages', data),
    onSuccess: (_, variables) => {
      // Invalidate customer credits
      queryClient.invalidateQueries({
        queryKey: ['customer-credits', variables.customer_id]
      });
      // Invalidate package stats
      queryClient.invalidateQueries({
        queryKey: ['packages']
      });
    }
  });
};

// Redeem credit
export const useRedeemCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { customer_id: string; service_id: string; notes?: string }) =>
      api.post('/api/v1/staff/customer-packages/credits/redeem', data),
    onSuccess: (_, variables) => {
      // Invalidate customer credits
      queryClient.invalidateQueries({
        queryKey: ['customer-credits', variables.customer_id]
      });
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        const message = error.response.data.detail;
        if (message.includes('No available credits')) {
          toast.error('No available credits for this service');
        } else {
          toast.error(message);
        }
      }
    }
  });
};
Error Handling UI Patterns¶
Common Error Scenarios:

// Error handling for credit operations
const handleRedemptionError = (error) => {
  const status = error.response?.status;
  const detail = error.response?.data?.detail || '';

  switch (status) {
    case 400:
      if (detail.includes('No available credits')) {
        showModal({
          type: 'error',
          title: 'No Credits Available',
          message: 'This customer has no available credits for the selected service.',
          actions: [
            { label: 'Check Other Services', onClick: () => showCreditDetails() },
            { label: 'Sell Package', onClick: () => openPurchaseFlow(), primary: true }
          ]
        });
      } else if (detail.includes('expired')) {
        showModal({
          type: 'warning',
          title: 'Credits Expired',
          message: 'The credits for this service have expired.',
          actions: [
            { label: 'View Active Credits', onClick: () => showActiveCredits() }
          ]
        });
      }
      break;

    case 404:
      toast.error('Customer or service not found');
      break;

    default:
      toast.error('An error occurred. Please try again.');
  }
};

// Inline validation for purchase form
const validatePurchaseForm = (form) => {
  const errors = {};

  if (!form.selectedPackage) {
    errors.package = 'Please select a package';
  }

  if (!form.amountPaid || form.amountPaid <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (form.paymentMethod === 'manual_onspot' &&
      form.amountPaid !== form.selectedPackage?.package_price) {
    errors.amount = `Amount should match package price (${formatCurrency(form.selectedPackage.package_price)})`;
  }

  return errors;
};
Accessibility Considerations¶
Customer Search: Implement keyboard navigation for search results
Credit Cards: Use role="listitem" for credit cards in list
Form Steps: Announce step changes with aria-live
Progress Bars: Include aria-valuenow and aria-valuemax
Expiration Warnings: Use role="alert" for expiring soon notices
Modal Focus: Auto-focus first interactive element in modals
Mobile Responsive Guidelines¶
/* Staff credit lookup responsive */
.credit-lookup {
  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .credit-card {
      padding: 1rem;
    }

    .credit-card .credit-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

/* Package purchase form responsive */
.purchase-form {
  @media (max-width: 768px) {
    .stepper {
      .step-label {
        display: none;
      }
    }

    .package-selector {
      .package-option {
        padding: 0.75rem;
      }

      .package-services {
        font-size: 0.875rem;
      }
    }

    .payment-form {
      .payment-methods {
        flex-direction: column;
      }
    }
  }
}

/* Touch-friendly buttons for tablet POS */
@media (pointer: coarse) {
  .redeem-button,
  .purchase-button {
    min-height: 48px;
    padding: 12px 24px;
  }

  .credit-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }
}
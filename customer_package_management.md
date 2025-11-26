Customer Package Management¶
Complete guide to customer-facing package browsing, purchasing, and credit management in the Reserva platform.

Overview¶
The customer package management system provides self-service package purchasing and credit tracking with support for:

Package Browsing - View available service bundles with discounts
Self-Service Purchase - Buy packages with multiple payment options
Credit Management - Track and use purchased credits for bookings
Payment Flexibility - Online (Paper.id), bank transfer, or pay at venue
Expiry Tracking - Monitor credit expiration with warnings
FIFO Redemption - Use oldest credits first for fair usage
Key Concepts:

Customer Package = A purchased instance of a package with allocated credits
Package Credits = Redeemable units for specific services (tracked per service)
FIFO Redemption = First In, First Out - oldest credits used first
Expiry Warning = Alert when credits expire within 7 days
Payment Methods = Online (Paper.id), bank transfer, pay at venue
Available Endpoints¶
Endpoint	Method	Purpose	Access
/customer/packages/browse	GET	Browse available packages	Customer
/customer/packages/purchase	POST	Purchase a package	Customer
/customer/packages	GET	List my purchased packages	Customer
/customer/packages/{id}	GET	Get specific package details	Customer
/customer/packages/credits/available	GET	Get available credits for service	Customer
/customer/package-payments/{id}/record-payment	POST	Record manual payment	Staff
/customer/package-payments/{id}/create-payment-link	POST	Create payment link	Staff
/customer/package-payments/{id}/payment-status	GET	Check payment status	Staff/Customer
Browse Available Packages¶
View all active packages available for purchase.

Endpoint¶
GET /api/v1/customer/packages/browse?outlet_id=507f1f77bcf86cd799439012&page=1&size=10
Authentication: Required (Customer JWT)

Query Parameters¶
Parameter	Type	Required	Description
outlet_id	string	No	Filter packages available at specific outlet
page	integer	No	Page number (default: 1)
size	integer	No	Page size (default: 10)
Response¶
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Luxury Spa Package",
      "package_price": 500000,
      "currency": "IDR",
      "total_individual_price": 750000,
      "discount_percentage": 33.33,
      "validity_days": 90,
      "is_active": true,
      "status": "active",
      "total_purchased": 125
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Hair Care Bundle",
      "package_price": 300000,
      "currency": "IDR",
      "total_individual_price": 400000,
      "discount_percentage": 25.0,
      "validity_days": 60,
      "is_active": true,
      "status": "active",
      "total_purchased": 89
    }
  ],
  "total": 5,
  "page": 1,
  "size": 10,
  "pages": 1
}
Response Fields¶
Field	Type	Description
id	string	Package ID
name	string	Package display name
package_price	decimal	Discounted bundle price
total_individual_price	decimal	Sum of individual service prices
discount_percentage	float	Savings percentage
validity_days	integer	Days until credits expire (null = never)
total_purchased	integer	Popularity metric
Business Rules¶
Only shows ACTIVE packages (status=active, is_active=true)
Packages with empty outlet_ids are available at all outlets
Discount percentage calculated from individual service prices
Results filtered by customer's tenant automatically
Purchase Package¶
Purchase a package with flexible payment options.

Endpoint¶
POST /api/v1/customer/packages/purchase
Authentication: Required (Customer JWT)

Request Body¶
{
  "package_id": "507f1f77bcf86cd799439012",
  "outlet_id": "507f1f77bcf86cd799439013",
  "payment_method": "paper_digital",
  "send_email": true,
  "send_whatsapp": false,
  "send_sms": false,
  "notes": "Online purchase"
}
Parameters¶
Field	Type	Required	Description
package_id	string	Yes	Package ID to purchase
outlet_id	string	Yes	Outlet where package will be used
payment_method	string	No	paper_digital, bank_transfer, or pay_on_visit (default: paper_digital)
send_email	boolean	No	Send payment link via email (default: true)
send_whatsapp	boolean	No	Send payment link via WhatsApp (default: false)
send_sms	boolean	No	Send payment link via SMS (default: false)
notes	string	No	Optional purchase notes (max 500 chars)
Payment Methods¶
Method	Description	Payment Flow
paper_digital	Online payment via Paper.id	Payment link sent, webhook activates credits
bank_transfer	Manual bank transfer	Customer pays, staff confirms, credits activated
pay_on_visit	Pay at venue	Customer visits, pays, staff confirms
Response - Online Payment (paper_digital)¶
{
  "status": "payment_link_created",
  "message": "Package purchase initiated - Payment link sent via email",
  "customer_package": {
    "id": "507f1f77bcf86cd799439020",
    "package_id": "507f1f77bcf86cd799439012",
    "package_name": "Luxury Spa Package",
    "amount": 500000,
    "currency": "IDR",
    "payment_method": "paper_digital",
    "payment_status": "pending",
    "status": "pending_payment",
    "validity_days": 90
  },
  "invoice": {
    "id": "507f1f77bcf86cd799439021",
    "invoice_number": "INV-PKG-20250120-103000",
    "amount": 500000,
    "due_date": "2025-01-25",
    "payment_url": "https://paper.id/invoice/abc123"
  },
  "delivery_methods": ["email"]
}
Response - Manual Payment (bank_transfer / pay_on_visit)¶
{
  "status": "pending_payment",
  "message": "Package purchase created - Please complete payment via bank transfer. Staff will confirm your payment.",
  "customer_package": {
    "id": "507f1f77bcf86cd799439020",
    "package_id": "507f1f77bcf86cd799439012",
    "package_name": "Luxury Spa Package",
    "amount": 500000,
    "currency": "IDR",
    "payment_method": "bank_transfer",
    "payment_status": "pending",
    "status": "pending_payment",
    "validity_days": 90
  },
  "payment_instructions": {
    "method": "bank_transfer",
    "message": "Please transfer to the venue's bank account. Contact the venue for bank details. Show your purchase ID when making payment.",
    "purchase_id": "507f1f77bcf86cd799439020",
    "amount": 500000,
    "currency": "IDR"
  }
}
Business Rules¶
Package must be active and belong to customer's tenant
Outlet must be valid and belong to tenant
Package must be available at selected outlet
For paper_digital: Customer must have email OR phone
Credits are NEVER activated until payment is confirmed
Manual payments require staff confirmation
Payment Flow Diagrams¶
Online Payment (paper_digital):

graph TD
    A[Customer selects package] --> B[System creates customer_package]
    B --> C[Paper.id payment link generated]
    C --> D[Payment link sent via email/WhatsApp/SMS]
    D --> E[Customer completes payment]
    E --> F[Paper.id webhook received]
    F --> G[Credits automatically activated]
    G --> H[Package status: ACTIVE]
Manual Payment (bank_transfer / pay_on_visit):

graph TD
    A[Customer selects package] --> B[System creates customer_package]
    B --> C[Customer receives payment instructions]
    C --> D[Customer pays bank/at venue]
    D --> E[Staff confirms payment]
    E --> F[Credits activated by staff]
    F --> G[Package status: ACTIVE]
List My Purchased Packages¶
Retrieve all packages purchased by the authenticated customer.

Endpoint¶
GET /api/v1/customer/packages?status=active&include_details=false&page=1&size=10
Authentication: Required (Customer JWT)

Query Parameters¶
Parameter	Type	Required	Description
status	string	No	Filter: active, depleted, expired, pending_payment
include_details	boolean	No	Include full package and credits details (default: false)
page	integer	No	Page number (default: 1)
size	integer	No	Page size (default: 10)
Response¶
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439013",
      "customer_id": "507f1f77bcf86cd799439014",
      "package_id": "507f1f77bcf86cd799439011",
      "package_name": "Luxury Spa Package",
      "payment_method": "paper_digital",
      "payment_status": "paid",
      "amount_paid": 500000,
      "currency": "IDR",
      "validity_days": 90,
      "purchased_at": "2025-01-15T10:30:00Z",
      "expires_at": "2025-04-15T10:30:00Z",
      "status": "active",
      "total_credits": 10,
      "used_credits": 3,
      "remaining_credits": 7,
      "days_until_expiry": 45,
      "is_expiring_soon": false
    }
  ],
  "total": 3,
  "page": 1,
  "size": 10,
  "pages": 1
}
Response Fields¶
Field	Type	Description
total_credits	integer	Total credits allocated
used_credits	integer	Credits already redeemed
remaining_credits	integer	Credits available for use
days_until_expiry	integer	Days remaining (null if never expires)
is_expiring_soon	boolean	True if expires within 7 days
Customer Package Statuses¶
Status	Description
pending_payment	Awaiting payment confirmation
active	Paid and credits available
partially_used	Some credits redeemed
depleted	All credits used
expired	Credits expired (validity_days exceeded)
Get My Package Details¶
Retrieve complete details about a specific purchased package.

Endpoint¶
GET /api/v1/customer/packages/{customer_package_id}
Authentication: Required (Customer JWT)

Path Parameters¶
Parameter	Type	Required	Description
customer_package_id	string	Yes	Customer package ID
Response¶
{
  "id": "507f1f77bcf86cd799439013",
  "customer_id": "507f1f77bcf86cd799439014",
  "package_id": "507f1f77bcf86cd799439011",
  "package_name": "Luxury Spa Package",
  "payment_method": "paper_digital",
  "payment_status": "paid",
  "amount_paid": 500000,
  "currency": "IDR",
  "validity_days": 90,
  "purchased_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-04-15T10:30:00Z",
  "status": "active",
  "total_credits": 10,
  "used_credits": 3,
  "remaining_credits": 7,
  "days_until_expiry": 45,
  "is_expiring_soon": false,
  "package_details": {
    "name": "Luxury Spa Package",
    "description": "Complete spa experience with multiple treatments",
    "package_price": 500000,
    "total_individual_price": 750000,
    "discount_percentage": 33.33,
    "package_items": [
      {
        "service_id": "507f1f77bcf86cd799439015",
        "service_name": "Full Body Massage",
        "quantity": 5,
        "unit_price": 100000
      },
      {
        "service_id": "507f1f77bcf86cd799439016",
        "service_name": "Facial Treatment",
        "quantity": 5,
        "unit_price": 50000
      }
    ]
  },
  "credits_details": [
    {
      "credit_id": "507f1f77bcf86cd799439017",
      "service_id": "507f1f77bcf86cd799439015",
      "service_name": "Full Body Massage",
      "total_credits": 5,
      "used_credits": 2,
      "remaining_credits": 3,
      "expires_at": "2025-04-15T10:30:00Z"
    },
    {
      "credit_id": "507f1f77bcf86cd799439018",
      "service_id": "507f1f77bcf86cd799439016",
      "service_name": "Facial Treatment",
      "total_credits": 5,
      "used_credits": 1,
      "remaining_credits": 4,
      "expires_at": "2025-04-15T10:30:00Z"
    }
  ]
}
Business Rules¶
Customer can only view packages they own
Returns 403 if package belongs to different customer
Always includes full package_details and credits_details
Expiry warning shown if expires within 7 days
Get Available Credits for Service¶
Find available credits for a specific service during booking.

Endpoint¶
GET /api/v1/customer/packages/credits/available?service_id=507f1f77bcf86cd799439016
Authentication: Required (Customer JWT)

Query Parameters¶
Parameter	Type	Required	Description
service_id	string	Yes	Service ID to check credits for
Response¶
[
  {
    "credit_id": "507f1f77bcf86cd799439015",
    "customer_package_id": "507f1f77bcf86cd799439013",
    "package_name": "Luxury Spa Package",
    "service_id": "507f1f77bcf86cd799439016",
    "service_name": "Full Body Massage",
    "remaining_credits": 3,
    "purchased_at": "2025-01-15T10:30:00Z",
    "expires_at": "2025-04-15T10:30:00Z",
    "days_until_expiry": 45,
    "is_expiring_soon": false
  },
  {
    "credit_id": "507f1f77bcf86cd799439017",
    "customer_package_id": "507f1f77bcf86cd799439018",
    "package_name": "Wellness Bundle",
    "service_id": "507f1f77bcf86cd799439016",
    "service_name": "Full Body Massage",
    "remaining_credits": 1,
    "purchased_at": "2024-12-01T08:00:00Z",
    "expires_at": "2025-01-25T08:00:00Z",
    "days_until_expiry": 5,
    "is_expiring_soon": true
  }
]
Business Rules¶
Only returns credits with remaining_credits > 0
Excludes expired credits (expires_at < now)
Ordered by FIFO (oldest purchase first)
Marks credits expiring within 7 days
Empty array if no credits available
Use Case¶
Customer is booking "Full Body Massage" and wants to use package credits:

Call this endpoint with service_id
Display available credits to customer
Credits expiring soon shown with warning
Oldest credits suggested first (FIFO)
Staff Payment Endpoints¶
Record Manual Payment¶
Staff endpoint to record offline payment and activate credits.

POST /api/v1/customer/package-payments/{customer_package_id}/record-payment
Authentication: Required (Staff JWT - TENANT_ADMIN, OUTLET_MANAGER, RECEPTIONIST)

Request Body¶
{
  "amount": 500000,
  "payment_method": "cash",
  "notes": "Paid in cash for package purchase",
  "receipt_number": "PKG-RCPT-2025-001"
}
Supported Payment Methods¶
cash - Cash payment at location
pos_terminal - Credit/debit card via POS
bank_transfer - Direct bank transfer
Response¶
{
  "status": "success",
  "message": "Payment recorded successfully - package credits activated",
  "payment": {
    "id": "507f1f77bcf86cd799439011",
    "amount": 500000.0,
    "method": "cash",
    "status": "completed",
    "recorded_by": "Jane Smith",
    "recorded_at": "2025-01-20T10:30:00",
    "receipt_number": "PKG-RCPT-2025-001",
    "reference_id": "PAY-PKG-20250120103000"
  },
  "package": {
    "id": "507f1f77bcf86cd799439012",
    "status": "active",
    "payment_status": "paid",
    "expires_at": "2025-04-20T10:30:00",
    "total_credits": 10
  }
}
Business Rules¶
Payment amount must match package price exactly
Package must be in pending_payment status
Cannot record payment for already paid packages
Credits activated automatically upon recording
Staff member tracked in audit trail
Create Payment Link¶
Staff endpoint to generate Paper.id payment link.

POST /api/v1/customer/package-payments/{customer_package_id}/create-payment-link
Authentication: Required (Staff JWT)

Request Body¶
{
  "send_email": true,
  "send_whatsapp": true,
  "send_sms": false,
  "notes": "Payment link for package purchase",
  "due_date": "2025-01-25"
}
Response¶
{
  "status": "payment_link_created",
  "message": "Payment link sent to customer via email, whatsapp",
  "invoice": {
    "id": "507f1f77bcf86cd799439011",
    "invoice_number": "INV-PKG-20250120-103000",
    "amount": 500000.0,
    "subtotal": 500000.0,
    "platform_fee": 0.0,
    "platform_fee_percentage": 0.0,
    "currency": "IDR",
    "due_date": "2025-01-25",
    "paper_invoice_id": "paper_inv_abc123",
    "invoice_url": "https://paper.id/invoice/abc123"
  },
  "payment": {
    "id": "507f1f77bcf86cd799439012",
    "reference_id": "PKG-507f1f77bcf86cd799439011-20250120103000",
    "status": "pending",
    "amount": 500000.0
  },
  "customer": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+628123456789"
  },
  "delivery_methods": ["email", "whatsapp"],
  "webhook_url": "/webhooks/paper/507f1f77bcf86cd799439010"
}
Platform Fees¶
Plan	Platform Fee
FREE	0%
PRO	0%
ENTERPRISE	0%
Note: Package purchases are fee-exempt across all subscription tiers.

Get Payment Status¶
Check payment status for a package purchase.

GET /api/v1/customer/package-payments/{customer_package_id}/payment-status
Authentication: Required (Staff or Customer JWT)

Response¶
{
  "customer_package_id": "507f1f77bcf86cd799439011",
  "package_name": "Premium Hair Package - 10 Sessions",
  "package_price": 500000.0,
  "payment_status": "paid",
  "package_status": "active",
  "total_paid": 500000.0,
  "remaining_balance": 0.0,
  "is_paid": true,
  "credits_activated": true,
  "payments": [
    {
      "id": "507f1f77bcf86cd799439012",
      "amount": 500000.0,
      "method": "cash",
      "provider": "manual",
      "status": "completed",
      "reference_id": "PAY-PKG-20250120103000",
      "created_at": "2025-01-20T10:30:00",
      "paid_at": "2025-01-20T10:30:00"
    }
  ]
}
Credit Redemption During Booking¶
When booking an appointment, customers can use package credits instead of paying.

How Credit Redemption Works¶
Customer selects a service for booking
System checks for available credits via /credits/available
Credits ordered by FIFO (oldest first)
Customer chooses to use credit or pay normally
Credit is deducted upon appointment confirmation
Payment status automatically set to "paid" when using credits
Redemption Rules¶
Credits validated against customer ownership
Cannot redeem from expired packages
Cannot redeem from depleted packages
One credit = one service appointment
Credits are non-transferable
See Customer Booking for appointment creation with package credits.

Expiry Tracking¶
Package credits have validity periods that require careful monitoring.

Expiry Calculation¶
expires_at = purchased_at + validity_days
Expiry Warning Thresholds¶
Days Until Expiry	Status
> 7 days	Normal
1-7 days	is_expiring_soon: true
0 days	Expires today
< 0 days	Expired
Best Practices for Customers¶
Check days_until_expiry regularly
Use credits expiring soon first (FIFO helps)
Set reminders for packages expiring within 30 days
Book appointments before credits expire
Integration Examples¶
Complete Purchase Flow¶
# 1. Browse available packages
curl -X GET "https://api.example.com/api/v1/customer/packages/browse?outlet_id=507f1f77bcf86cd799439013" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# 2. Purchase package with online payment
curl -X POST https://api.example.com/api/v1/customer/packages/purchase \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": "507f1f77bcf86cd799439012",
    "outlet_id": "507f1f77bcf86cd799439013",
    "payment_method": "paper_digital",
    "send_email": true
  }'

# Response includes payment_url - customer completes payment

# 3. Check payment status (after webhook)
curl -X GET "https://api.example.com/api/v1/customer/package-payments/507f1f77bcf86cd799439020/payment-status" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# 4. View purchased packages
curl -X GET https://api.example.com/api/v1/customer/packages \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"
Using Credits for Booking¶
# 1. Check available credits for a service
curl -X GET "https://api.example.com/api/v1/customer/packages/credits/available?service_id=507f1f77bcf86cd799439016" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# 2. Book appointment using credit (see Customer Booking docs)
curl -X POST https://api.example.com/api/v1/customer/appointments \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "507f1f77bcf86cd799439016",
    "outlet_id": "507f1f77bcf86cd799439013",
    "staff_id": "507f1f77bcf86cd799439019",
    "start_time": "2025-01-25T10:00:00Z",
    "use_package_credit": true
  }'
Error Handling¶
Common Errors¶
Error Code	Cause	Solution
400 Bad Request	Invalid input or package unavailable	Check parameters and package status
401 Unauthorized	Missing/invalid token	Verify JWT token
403 Forbidden	Accessing another customer's package	Only access own packages
404 Not Found	Package or outlet not found	Verify IDs are correct
409 Conflict	Package already paid	Cannot re-pay completed packages
Package Not Available¶
{
  "detail": "Package is not available for purchase"
}
Causes: - Package is_active is false - Package status is not "active" - Package archived or deleted

Missing Contact Information¶
{
  "detail": "Customer must have either email or phone number to receive payment link"
}
Solution: Update customer profile with email or phone number

Outlet Restriction¶
{
  "detail": "Package is not available at the selected outlet"
}
Cause: Package restricted to specific outlets

Solution: Select an outlet where the package is available

Related Documentation¶
Package Management - Staff portal package creation and management
Customer Booking - Booking appointments with package credits
Customer Payment Processing - General payment handling
Invoice Management - Package purchase invoices
Webhook Integration - Payment confirmation webhooks
API Reference Summary¶
Endpoint	Method	Purpose	Access
/customer/packages/browse	GET	Browse packages	Customer
/customer/packages/purchase	POST	Purchase package	Customer
/customer/packages	GET	List my packages	Customer
/customer/packages/{id}	GET	Get package details	Customer
/customer/packages/credits/available	GET	Check credits	Customer
/customer/package-payments/{id}/record-payment	POST	Record manual payment	Staff
/customer/package-payments/{id}/create-payment-link	POST	Create payment link	Staff
/customer/package-payments/{id}/payment-status	GET	Check payment status	Staff/Customer

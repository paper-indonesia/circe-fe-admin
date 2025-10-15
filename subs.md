GET
/api/v1/subscriptions/current
Get Current Subscription


Retrieve the current active subscription details for the tenant.

Features:

Complete subscription plan information
Billing cycle details and next payment date
Feature access and usage limits
Subscription status and health
Access: All staff members

Returns:

Current subscription plan and tier
Billing information and next payment date
Feature limits and current usage
Subscription metadata and timestamps

curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/subscriptions/current' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAwNzA3NjgsInN1YiI6IjY4ZTM4YmY1NTcwZDBlODEzNDY5ZmVlMCIsImlhdCI6MTc2MDA2NzE2OCwianRpIjoiNjhlODdlNjA5YTlkMWQ0ZDgxMDRlZmE1IiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoiYXJpbEBlZHV0ZWNoLmNvbSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJ0ZW5hbnRfaWQiOiI2OGUzOGJlZjU3MGQwZTgxMzQ2OWZlZGUifQ.4IUMFDYNn-mAcXEuE-zxTK5VQCcxvqp8YFJO8NG56B0'


  response:
  {
  "id": "68e38bf4570d0e813469fedf",
  "tenant_id": "68e38bef570d0e813469fede",
  "plan": "free",
  "billing_period": "monthly",
  "status": "active",
  "trial_end": null,
  "current_period_start": "2025-10-06",
  "current_period_end": "2025-11-05",
  "cancelled_at": null,
  "cancel_at_period_end": false,
  "features": {
    "max_outlets": 1,
    "max_staff_per_outlet": 2,
    "max_customers": 100,
    "max_services": 10,
    "max_appointments_per_month": 200,
    "custom_branding": false,
    "api_access": false,
    "priority_support": false,
    "whatsapp_notifications": false,
    "email_notifications": true,
    "sms_notifications": false,
    "payment_processing": false,
    "analytics_dashboard": false,
    "staff_app_access": true,
    "customer_portal": true,
    "online_booking": true,
    "recurring_appointments": false,
    "loyalty_program": false,
    "custom_domain": false,
    "webhook_integrations": false,
    "platform_fee_enabled": true,
    "platform_fee_rate": "0.08"
  },
  "usage": {
    "current_outlets": 0,
    "current_staff": 0,
    "current_customers": 0,
    "current_services": 0,
    "appointments_this_month": 0,
    "last_updated": "2025-10-06T09:29:24.052024"
  },
  "created_at": "2025-10-06T09:29:24.051000",
  "updated_at": "2025-10-06T09:29:24.051000"
}


GET
/api/v1/subscriptions/plans
Get Available Plans


Retrieve all available subscription plans and their features.

Features:

Complete plan catalog (FREE, PRO, ENTERPRISE)
Feature comparison matrix
Pricing and billing information
Upgrade/downgrade path validation
Access: All staff members

Returns:

All subscription tiers with features
Pricing information for each plan
Feature limits and capabilities
Upgrade/downgrade eligibility matrix

curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/subscriptions/plans' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAwNzA3NjgsInN1YiI6IjY4ZTM4YmY1NTcwZDBlODEzNDY5ZmVlMCIsImlhdCI6MTc2MDA2NzE2OCwianRpIjoiNjhlODdlNjA5YTlkMWQ0ZDgxMDRlZmE1IiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoiYXJpbEBlZHV0ZWNoLmNvbSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJ0ZW5hbnRfaWQiOiI2OGUzOGJlZjU3MGQwZTgxMzQ2OWZlZGUifQ.4IUMFDYNn-mAcXEuE-zxTK5VQCcxvqp8YFJO8NG56B0'

  {
  "plans": [
    {
      "plan": "free",
      "name": "Free",
      "description": "Free plan",
      "features": {
        "max_outlets": 1,
        "max_staff_per_outlet": 2,
        "max_customers": 100,
        "max_services": 10,
        "max_appointments_per_month": 200,
        "custom_branding": false,
        "api_access": false,
        "priority_support": false,
        "whatsapp_notifications": false,
        "email_notifications": true,
        "sms_notifications": false,
        "payment_processing": false,
        "analytics_dashboard": false,
        "staff_app_access": true,
        "customer_portal": true,
        "online_booking": true,
        "recurring_appointments": false,
        "loyalty_program": false,
        "custom_domain": false,
        "webhook_integrations": false,
        "platform_fee_enabled": true,
        "platform_fee_rate": "0.08"
      },
      "pricing": {
        "monthly_price": "0",
        "yearly_price": "0",
        "setup_fee": "0",
        "currency": "IDR",
        "yearly_discount_percent": 0
      }
    },
    {
      "plan": "pro",
      "name": "Pro",
      "description": "Pro plan",
      "features": {
        "max_outlets": 3,
        "max_staff_per_outlet": 10,
        "max_customers": 1000,
        "max_services": 50,
        "max_appointments_per_month": 2000,
        "custom_branding": true,
        "api_access": false,
        "priority_support": true,
        "whatsapp_notifications": true,
        "email_notifications": true,
        "sms_notifications": true,
        "payment_processing": true,
        "analytics_dashboard": true,
        "staff_app_access": true,
        "customer_portal": true,
        "online_booking": true,
        "recurring_appointments": true,
        "loyalty_program": true,
        "custom_domain": false,
        "webhook_integrations": false,
        "platform_fee_enabled": true,
        "platform_fee_rate": "0.05"
      },
      "pricing": {
        "monthly_price": "499000",
        "yearly_price": "4990000",
        "setup_fee": "0",
        "currency": "IDR",
        "yearly_discount_percent": 16.67
      }
    },
    {
      "plan": "enterprise",
      "name": "Enterprise",
      "description": "Enterprise plan",
      "features": {
        "max_outlets": 999999,
        "max_staff_per_outlet": 999999,
        "max_customers": 999999,
        "max_services": 999999,
        "max_appointments_per_month": 999999,
        "custom_branding": true,
        "api_access": true,
        "priority_support": true,
        "whatsapp_notifications": true,
        "email_notifications": true,
        "sms_notifications": true,
        "payment_processing": true,
        "analytics_dashboard": true,
        "staff_app_access": true,
        "customer_portal": true,
        "online_booking": true,
        "recurring_appointments": true,
        "loyalty_program": true,
        "custom_domain": true,
        "webhook_integrations": true,
        "platform_fee_enabled": true,
        "platform_fee_rate": "0.03"
      },
      "pricing": {
        "monthly_price": "1999000",
        "yearly_price": "19990000",
        "setup_fee": "2999000",
        "currency": "IDR",
        "yearly_discount_percent": 16.67
      }
    }
  ],
  "current_plan": null,
  "upgrade_paths": [],
  "downgrade_paths": []
}


POST
/api/v1/subscriptions/upgrade
Upgrade Subscription with Invoice


Upgrade subscription to higher tier with Paper.id invoice payment.

Complete Flow (12 Steps):

Validate current subscription exists and is active
Validate upgrade path is valid (FREE→PRO→ENTERPRISE hierarchy)
Calculate prorated amount for remaining billing period
Prepare invoice line items with upgrade metadata
Create invoice record in our database
Prepare Paper.id customer data from tenant profile
Prepare Paper.id invoice items with pricing
Create Paper.id sales invoice via API
Extract Paper.id invoice data (ID, URLs, PDF)
Link Paper.id invoice to our invoice record
Update subscription metadata with pending_upgrade
Return comprehensive response with payment URLs
Features:

Prorated charges for fair billing
Automatic Paper.id invoice generation
Webhook-based payment confirmation
Automatic upgrade activation after payment
Complete audit trail and metadata tracking
Access: All staff members (TENANT_ADMIN+ recommended for production)

Business Rules Applied:

Must have active subscription (FREE, PRO, or ENTERPRISE)
Target plan must be higher tier than current plan
Valid upgrade paths: FREE→PRO, FREE→ENTERPRISE, PRO→ENTERPRISE
Proration formula: (days_remaining / total_days) × target_plan_price
Invoice created with 3-day payment window
Upgrade not activated until payment confirmed via webhook
Original plan features remain active until payment complete
If Paper.id API fails, invoice is cancelled for rollback
Proration Example:

Current Plan: FREE
Target Plan: PRO Monthly (IDR 499,900)
Days Remaining: 15 days out of 30-day period
Prorated Charge: (15/30) × IDR 499,900 = IDR 249,950
After Payment:

Paper.id sends webhook to /api/v1/webhooks/paper-invoice
Webhook handler validates payment and invoice
Subscription plan automatically upgraded to target tier
New features activated immediately
pending_upgrade metadata cleared from subscription
Payment record created for audit trail
Email confirmation sent to tenant
Returns:

status: "payment_pending" (upgrade not yet active)
message: Success message with next steps
subscription: Current subscription (still on old plan)
invoice: Invoice details with Paper.id payment URLs
upgrade_details: Proration breakdown and upgrade info
next_steps: Step-by-step payment instructions
Response Structure:

{
  "status": "payment_pending",
  "message": "Invoice created successfully...",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "plan": "free",
    "status": "active",
    "current_period_end": "2025-02-15"
  },
  "invoice": {
    "id": "507f1f77bcf86cd799439012",
    "invoice_number": "INV-2025-001",
    "amount": "249950",
    "currency": "IDR",
    "due_date": "2025-01-18",
    "paper_invoice_url": "https://stg-v2.paper.id/abc123",
    "paper_pdf_url": "https://stg-v2.paper.id/pdf/xyz789",
    "paper_payment_url": "https://payper.id/short123"
  },
  "upgrade_details": {
    "from_plan": "free",
    "to_plan": "pro",
    "prorated_amount": "249950",
    "days_remaining": 15,
    "total_days": 30,
    "billing_period": "monthly",
    "prorated": true
  },
  "next_steps": [...]
}
Error Handling:

400: Invalid upgrade path or validation error
404: No current subscription found
502: Paper.id API failure (invoice automatically cancelled)
Note: Original plan remains active until payment confirmed. Frontend should direct user to paper_payment_url to complete payment.


requests body 
{
  "billing_period": "yearly",
  "prorate_charges": true,
  "target_plan": "enterprise"
}

response:
{
  "status": "payment_pending",
  "message": "Invoice created. Please complete payment to activate upgrade.",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "plan": "free",
    "status": "active"
  },
  "invoice": {
    "id": "507f1f77bcf86cd799439012",
    "invoice_number": "INV-2025-001",
    "amount": "249950",
    "currency": "IDR",
    "due_date": "2025-01-18",
    "paper_invoice_url": "https://stg-v2.paper.id/abc123",
    "paper_pdf_url": "https://stg-v2.paper.id/pdf/xyz789"
  },
  "upgrade_details": {
    "from_plan": "free",
    "to_plan": "pro",
    "prorated_amount": "249950",
    "days_remaining": 15,
    "billing_period": "monthly"
  },
  "next_steps": [
    "1. Open the payment URL to complete payment",
    "2. Choose your preferred payment method",
    "3. Your subscription will be upgraded automatically upon payment confirmation",
    "4. You will receive an email confirmation once activated"
  ]
}

POST
/api/v1/subscriptions/renew
Renew Subscription Period


Renew subscription for next billing period with Paper.id invoice.

Features:

Full period renewal (no proration)
Paper.id invoice generation
Automatic period extension upon payment
Support for monthly and yearly billing cycles
Renewal history tracking
Access: All staff members

Business Rules:

Only PRO and ENTERPRISE plans can renew
FREE plans must upgrade first
Charges full period price (no proration)
Period extends by one billing cycle (monthly +1 month, yearly +1 year)
Plan and features remain unchanged
7-day payment window
Renewal Flow:

Validate subscription is renewable (PRO/ENTERPRISE, active status)
Calculate full period price (no proration)
Create renewal invoice in database
Generate Paper.id sales invoice
Return payment URLs
Await webhook for payment confirmation
Extend subscription period (no plan change)
Process:

Validate subscription belongs to tenant and is renewable
Calculate next period dates (current_period_end + 1 cycle)
Create invoice with full period price
Generate Paper.id payment invoice
Update subscription metadata with pending_renewal
Return payment URL for tenant
Returns:

Payment pending status
Invoice with Paper.id payment URL
Next period start/end dates
Current subscription (not yet renewed)
Next steps for payment completion
Note: Period extension happens automatically after payment confirmation via webhook

body:
{
  "subscription_id": "string"
}

output:
{
  "status": "payment_pending",
  "message": "Renewal invoice created. Please complete payment to continue subscription.",
  "subscription": {
    "id": "507f1f77bcf86cd799439011",
    "plan": "pro",
    "current_period_end": "2025-02-15"
  },
  "invoice": {
    "id": "507f1f77bcf86cd799439012",
    "amount": "49.99",
    "paper_invoice_url": "https://stg-v2.paper.id/abc123"
  },
  "renewal_details": {
    "renewing_plan": "pro",
    "billing_period": "monthly",
    "next_period_start": "2025-02-15",
    "next_period_end": "2025-03-15"
  }
}

POST
/api/v1/subscriptions/downgrade
Schedule Subscription Downgrade


Schedule subscription downgrade to a lower tier.

Features:

Delayed downgrade activation (next billing cycle)
Current plan features maintained until transition
Automatic billing adjustment
Downgrade reason tracking
PaymentProcessor integration for future refund logic
Access: All staff members with downgrade permissions

Business Rules Applied:

Validates current subscription exists and is active
Validates downgrade path (target tier must be lower)
Schedules downgrade for next billing cycle (not immediate)
Maintains current features until transition date
Prepared for future refund logic via PaymentProcessor
Business Rules:

Must have valid current subscription
Target plan must be lower tier than current
Cannot downgrade from FREE plan
Downgrade effective at next billing cycle only
Process:

Validate current subscription and downgrade eligibility
Schedule downgrade for next billing cycle date
Maintain current features until transition
Update billing cycle for reduced rate
Send confirmation and timeline notification
Returns:

Updated subscription with scheduled downgrade
Current plan details (active until transition)
Downgrade schedule and effective date
Note: Current features remain active until next billing cycle. PaymentProcessor is available for future refund logic implementation.

body:
{
  "billing_period": "monthly",
  "effective_date": "2025-02-15",
  "reason": "Scaling down operations",
  "target_plan": "free"
}

output:
{
  "billing_period": "monthly",
  "created_at": "2025-01-15T10:30:00Z",
  "current_period_end": "2025-02-15",
  "current_period_start": "2025-01-15",
  "features": {
    "custom_branding": true,
    "max_outlets": 3,
    "max_staff_per_outlet": 10
  },
  "id": "507f1f77bcf86cd799439011",
  "plan": "pro",
  "status": "active",
  "tenant_id": "507f1f77bcf86cd799439012",
  "trial_end": "2025-02-15",
  "updated_at": "2025-01-15T10:30:00Z",
  "usage": {
    "appointments_this_month": 890,
    "current_outlets": 2,
    "current_staff": 15
  }
}

GET
/api/v1/subscriptions/usage
Get Subscription Usage


Retrieve comprehensive subscription usage statistics and limits.

Features:

Real-time usage metrics across all features
Plan limits and remaining quotas
Usage trends and historical data
Upgrade recommendations and alerts
Access: All staff members

Returns:

Current usage counts for all features
Plan limits and remaining capacity
Usage percentage and trend analysis
Alerts for approaching limits
Upgrade recommendations when near capacity
Note: Usage data is updated in real-time for accurate monitoring


output:
{
  "approaching_limits": [],
  "billing_period": "monthly",
  "current_period_end": "2025-02-15",
  "current_period_start": "2025-01-15",
  "plan": "pro",
  "subscription_id": "507f1f77bcf86cd799439011",
  "tenant_id": "507f1f77bcf86cd799439012",
  "upgrade_recommended": false,
  "usage_summary": {
    "outlets": {
      "limit": 3,
      "percentage": 66.67,
      "used": 2
    },
    "staff": {
      "limit": 30,
      "percentage": 50,
      "used": 15
    }
  }
}

POST
/api/v1/subscriptions/cancel
Cancel Subscription


Cancel subscription with grace period until end of billing cycle.

Features:

Delayed cancellation (end of billing cycle)
Feature access maintained until cancellation
Automatic billing termination
Cancellation confirmation and timeline
Access: All staff members with cancellation permissions

Business Rules:

Cannot cancel FREE plan subscriptions
Must have active paid subscription
Cancellation effective at end of current billing cycle
All features remain active until cancellation date
Process:

Validate current subscription and eligibility
Schedule cancellation for end of billing cycle
Stop future billing and recurring charges
Maintain current features until cancellation date
Send cancellation confirmation with timeline
Returns:

Updated subscription with cancellation schedule
Current plan details (active until cancellation)
Cancellation date and final billing information
Note: Account will downgrade to FREE plan after cancellation


responese:
{
  "billing_period": "monthly",
  "created_at": "2025-01-15T10:30:00Z",
  "current_period_end": "2025-02-15",
  "current_period_start": "2025-01-15",
  "features": {
    "custom_branding": true,
    "max_outlets": 3,
    "max_staff_per_outlet": 10
  },
  "id": "507f1f77bcf86cd799439011",
  "plan": "pro",
  "status": "active",
  "tenant_id": "507f1f77bcf86cd799439012",
  "trial_end": "2025-02-15",
  "updated_at": "2025-01-15T10:30:00Z",
  "usage": {
    "appointments_this_month": 890,
    "current_outlets": 2,
    "current_staff": 15
  }
}

GET
/api/v1/subscriptions/payments
Get Payment History


Retrieve paginated payment history for the tenant with fee information.

Features:

Paginated payment list with flexible limits
Payment status filtering
Complete transaction details
Paper.id integration data
Platform fee display via FeeCalculator
Access: All staff members

Business Rules Applied:

Returns payments for current tenant only (tenant isolation)
Includes platform fee information for transparency
Fee rates based on subscription tier at time of payment
Query Parameters:

limit: Number of payments per page (1-100, default 20)
offset: Starting position for pagination (default 0)
status: Filter by payment status (pending, completed, failed, refunded)
Returns:

Paginated list of payment records
Payment amounts with platform fee breakdown
Dates, status, and transaction information
Paper.id transaction references and metadata
Subscription and billing cycle associations
Note: Payments are returned in reverse chronological order (newest first). FeeCalculator is available for displaying current fee rates in UI.

input:
curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/subscriptions/payments?limit=20&offset=0&status=completed' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAwNzA3NjgsInN1YiI6IjY4ZTM4YmY1NTcwZDBlODEzNDY5ZmVlMCIsImlhdCI6MTc2MDA2NzE2OCwianRpIjoiNjhlODdlNjA5YTlkMWQ0ZDgxMDRlZmE1IiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoiYXJpbEBlZHV0ZWNoLmNvbSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJ0ZW5hbnRfaWQiOiI2OGUzOGJlZjU3MGQwZTgxMzQ2OWZlZGUifQ.4IUMFDYNn-mAcXEuE-zxTK5VQCcxvqp8YFJO8NG56B0'

output:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "amount": "150000.00",
    "appointment_id": "507f1f77bcf86cd799439012",
    "created_at": "2025-01-15T14:30:00Z",
    "currency": "IDR",
    "customer_id": "507f1f77bcf86cd799439013",
    "description": "Hair styling appointment",
    "merchant_amount": "142500.00",
    "paid_at": "2025-01-15T14:35:00Z",
    "payment_method": "e_wallet",
    "payment_type": "appointment",
    "platform_fee": "7500.00",
    "platform_fee_rate": "0.05",
    "reference_id": "APT-507f1f77bcf86cd799439012-20250115143000",
    "status": "completed",
    "tenant_id": "507f1f77bcf86cd799439011",
    "total_amount": "150000.00",
    "updated_at": "2025-01-15T14:35:00Z"
  }
]


GET
/api/v1/subscriptions/payments/{payment_id}
Get Payment Details


Retrieve comprehensive details for a specific payment transaction with fee breakdown.

Features:

Complete payment transaction details
Transaction timeline and status history
Paper.id webhook and gateway data
Refund and dispute information
Platform fee breakdown via FeeCalculator
Access: All staff members

Business Rules Applied:

Payment must belong to current tenant (tenant isolation)
Payment ID must be valid ObjectId format
Includes all transaction metadata and status changes
Platform fee information for transparency
Business Rules:

Payment must belong to current tenant
Payment ID must be valid ObjectId format
Includes all transaction metadata and status changes
Returns:

Complete payment information and metadata
Transaction timeline with status changes
Platform fee breakdown (base amount, fee, total)
Paper.id gateway data and webhook responses
Refund details and dispute information if applicable
Associated subscription and billing information
Note: Sensitive payment data is filtered based on staff permissions. FeeCalculator is available for displaying fee rate context.


response:
{
  "_id": "507f1f77bcf86cd799439011",
  "amount": "150000.00",
  "appointment_id": "507f1f77bcf86cd799439012",
  "created_at": "2025-01-15T14:30:00Z",
  "currency": "IDR",
  "customer_id": "507f1f77bcf86cd799439013",
  "description": "Hair styling appointment",
  "merchant_amount": "142500.00",
  "paid_at": "2025-01-15T14:35:00Z",
  "payment_method": "e_wallet",
  "payment_type": "appointment",
  "platform_fee": "7500.00",
  "platform_fee_rate": "0.05",
  "reference_id": "APT-507f1f77bcf86cd799439012-20250115143000",
  "status": "completed",
  "tenant_id": "507f1f77bcf86cd799439011",
  "total_amount": "150000.00",
  "updated_at": "2025-01-15T14:35:00Z"
}



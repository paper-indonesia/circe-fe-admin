# Subscription Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin only)

API untuk mengelola subscription plans, billing, dan upgrade/downgrade subscription.

---

## 1. Get Available Plans

### GET `/api/v1/subscriptions/plans`

Mendapatkan daftar subscription plans yang tersedia.

**Authentication**: JWT Required (Staff) atau Public

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "plan_id": "free",
      "name": "FREE",
      "description": "Perfect for getting started",
      "price": 0,
      "currency": "IDR",
      "billing_cycle": "monthly",
      "features": {
        "outlets": 1,
        "staff": 5,
        "monthly_appointments": 100,
        "features_list": [
          "Basic appointment scheduling",
          "Customer management",
          "Email notifications",
          "Mobile app access"
        ]
      },
      "limitations": [
        "No SMS notifications",
        "No analytics",
        "Limited customization"
      ]
    },
    {
      "plan_id": "pro",
      "name": "PRO",
      "description": "For growing businesses",
      "price": 299000,
      "currency": "IDR",
      "billing_cycle": "monthly",
      "yearly_price": 2990000,
      "yearly_discount_percentage": 16.7,
      "features": {
        "outlets": 10,
        "staff": 50,
        "monthly_appointments": 2000,
        "features_list": [
          "Everything in FREE",
          "Multiple outlets",
          "SMS & WhatsApp notifications",
          "Advanced analytics",
          "Custom branding",
          "Priority support"
        ]
      },
      "is_popular": true
    },
    {
      "plan_id": "enterprise",
      "name": "ENTERPRISE",
      "description": "For large businesses",
      "price": 999000,
      "currency": "IDR",
      "billing_cycle": "monthly",
      "yearly_price": 9990000,
      "yearly_discount_percentage": 16.7,
      "features": {
        "outlets": -1,
        "staff": -1,
        "monthly_appointments": -1,
        "features_list": [
          "Everything in PRO",
          "Unlimited everything",
          "API access",
          "Custom integrations",
          "Dedicated account manager",
          "24/7 priority support",
          "Custom reports"
        ]
      },
      "contact_sales": false
    }
  ]
}
```

**Implementation Notes**:
- `outlets`, `staff`, `monthly_appointments` = -1 berarti unlimited
- `is_popular` untuk highlight di pricing page
- `yearly_discount_percentage` untuk tampilkan savings

---

## 2. Get Current Subscription

### GET `/api/v1/subscriptions/current`

Mendapatkan detail subscription tenant saat ini.

**Authentication**: JWT Required (Staff)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "subscription_id": "sub_abc123",
    "tenant_id": "tenant_abc123",
    "plan": {
      "plan_id": "pro",
      "name": "PRO",
      "price": 299000,
      "currency": "IDR",
      "billing_cycle": "monthly"
    },
    "status": "active",
    "started_at": "2025-01-01T00:00:00Z",
    "current_period_start": "2025-10-01T00:00:00Z",
    "current_period_end": "2025-10-31T23:59:59Z",
    "next_billing_date": "2025-11-01T00:00:00Z",
    "cancel_at_period_end": false,
    "usage": {
      "outlets": {
        "limit": 10,
        "used": 3,
        "percentage": 30
      },
      "staff": {
        "limit": 50,
        "used": 15,
        "percentage": 30
      },
      "monthly_appointments": {
        "limit": 2000,
        "used": 456,
        "percentage": 22.8
      }
    },
    "payment_method": {
      "type": "credit_card",
      "last4": "4242",
      "brand": "Visa",
      "expires": "12/2026"
    }
  }
}
```

**Subscription Status Values**:
- `active` - Aktif dan berjalan normal
- `trialing` - Dalam masa trial
- `past_due` - Pembayaran tertunda
- `canceled` - Dibatalkan (akan berakhir di akhir period)
- `expired` - Sudah berakhir

---

## 3. Upgrade/Downgrade Subscription

### POST `/api/v1/subscriptions/change-plan`

Upgrade atau downgrade subscription plan.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "new_plan_id": "enterprise",
  "billing_cycle": "monthly",
  "prorate": true
}
```

**Field Descriptions**:
- `new_plan_id` (required, string): ID plan baru (free, pro, enterprise)
- `billing_cycle` (required, enum): monthly, yearly
- `prorate` (optional, boolean): Apakah prorate billing (default: true)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "subscription_id": "sub_abc123",
    "old_plan": "PRO",
    "new_plan": "ENTERPRISE",
    "effective_date": "2025-10-15T08:30:00Z",
    "prorated_amount": 700000,
    "next_billing_amount": 999000,
    "next_billing_date": "2025-11-01T00:00:00Z"
  },
  "message": "Subscription upgraded successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Cannot downgrade with active outlets exceeding new plan limit",
  "code": "DOWNGRADE_LIMIT_EXCEEDED",
  "details": {
    "current_outlets": 12,
    "new_plan_limit": 10,
    "action_required": "Please remove 2 outlets before downgrading"
  }
}
```

**Implementation Notes**:
- Upgrade langsung efektif
- Downgrade: cek dulu apakah current usage melebihi new plan limits
- Prorate: hitung selisih biaya untuk sisa periode
- Jika downgrade ke FREE dari paid plan, ada konfirmasi

---

## 4. Cancel Subscription

### POST `/api/v1/subscriptions/cancel`

Cancel subscription (akan berakhir di akhir billing period).

**Authentication**: JWT Required (Owner only)

**Request Body**:
```json
{
  "reason": "Too expensive",
  "feedback": "Great service but I need to cut costs",
  "cancel_immediately": false
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "subscription_id": "sub_abc123",
    "status": "canceled",
    "cancel_at_period_end": true,
    "canceled_at": "2025-10-15T08:30:00Z",
    "ends_at": "2025-10-31T23:59:59Z",
    "downgrade_to": "FREE",
    "days_remaining": 16
  },
  "message": "Subscription will be canceled at the end of current period"
}
```

**Implementation Notes**:
- Default: cancel di akhir period (cancel_immediately: false)
- Jika cancel_immediately: true, langsung downgrade ke FREE
- Tenant masih bisa gunakan fitur sampai akhir period
- Owner menerima confirmation email

---

## 5. Reactivate Subscription

### POST `/api/v1/subscriptions/reactivate`

Reactivate subscription yang sudah di-cancel.

**Authentication**: JWT Required (Owner/Admin)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "subscription_id": "sub_abc123",
    "status": "active",
    "reactivated_at": "2025-10-16T09:00:00Z",
    "next_billing_date": "2025-11-01T00:00:00Z"
  },
  "message": "Subscription reactivated successfully"
}
```

**Implementation Notes**:
- Hanya bisa reactivate jika belum expired
- Cancel_at_period_end di-set ke false

---

## 6. Get Billing History

### GET `/api/v1/subscriptions/billing-history`

Mendapatkan riwayat pembayaran subscription.

**Authentication**: JWT Required (Owner/Admin)

**Query Parameters**:
```
?page=1&limit=20
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "invoice_id": "inv_123",
      "invoice_number": "INV-2025-10-001",
      "date": "2025-10-01T00:00:00Z",
      "description": "PRO Plan - Monthly",
      "period": {
        "start": "2025-10-01",
        "end": "2025-10-31"
      },
      "amount": 299000,
      "currency": "IDR",
      "status": "paid",
      "payment_method": "Credit Card (****4242)",
      "paid_at": "2025-10-01T00:15:32Z",
      "invoice_url": "https://storage.url/invoices/inv_123.pdf"
    },
    {
      "invoice_id": "inv_122",
      "invoice_number": "INV-2025-09-001",
      "date": "2025-09-01T00:00:00Z",
      "description": "PRO Plan - Monthly",
      "amount": 299000,
      "currency": "IDR",
      "status": "paid",
      "paid_at": "2025-09-01T00:12:45Z",
      "invoice_url": "https://storage.url/invoices/inv_122.pdf"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "total_pages": 1
  }
}
```

**Invoice Status Values**:
- `draft` - Invoice belum finalized
- `pending` - Menunggu pembayaran
- `paid` - Sudah dibayar
- `failed` - Pembayaran gagal
- `refunded` - Sudah di-refund

---

## 7. Download Invoice

### GET `/api/v1/subscriptions/invoices/{invoice_id}`

Download invoice PDF.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `invoice_id` (required, string): ID invoice

**Response Success (200 OK)**:
- Content-Type: application/pdf
- File download

---

## 8. Update Payment Method

### PUT `/api/v1/subscriptions/payment-method`

Update payment method untuk subscription.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "payment_method_type": "credit_card",
  "token": "tok_abc123xyz"
}
```

**Field Descriptions**:
- `payment_method_type` (required, enum): credit_card, bank_transfer, ewallet
- `token` (required, string): Payment token dari payment gateway

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "payment_method": {
      "type": "credit_card",
      "last4": "5678",
      "brand": "Mastercard",
      "expires": "08/2027"
    },
    "updated_at": "2025-10-15T09:00:00Z"
  },
  "message": "Payment method updated successfully"
}
```

---

## 9. Apply Coupon Code

### POST `/api/v1/subscriptions/apply-coupon`

Apply promo/coupon code ke subscription.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "coupon_code": "PROMO2025"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "coupon_code": "PROMO2025",
    "discount_type": "percentage",
    "discount_value": 20,
    "discount_amount": 59800,
    "new_amount": 239200,
    "valid_until": "2025-12-31T23:59:59Z",
    "applied_at": "2025-10-15T09:05:00Z"
  },
  "message": "Coupon applied successfully. You save Rp 59,800!"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Invalid or expired coupon code",
  "code": "INVALID_COUPON"
}
```

**Discount Types**:
- `percentage` - Persentase diskon (e.g., 20%)
- `fixed_amount` - Jumlah tetap (e.g., Rp 50,000)
- `free_trial` - Extend free trial period

---

## Webhooks untuk Subscription Events

Subscription events yang dikirim via webhook:

```json
{
  "event": "subscription.created",
  "data": {
    "subscription_id": "sub_abc123",
    "tenant_id": "tenant_abc123",
    "plan": "PRO",
    "status": "active"
  }
}

{
  "event": "subscription.updated",
  "data": {
    "subscription_id": "sub_abc123",
    "old_plan": "FREE",
    "new_plan": "PRO"
  }
}

{
  "event": "subscription.canceled",
  "data": {
    "subscription_id": "sub_abc123",
    "canceled_at": "2025-10-15T08:30:00Z",
    "ends_at": "2025-10-31T23:59:59Z"
  }
}

{
  "event": "invoice.paid",
  "data": {
    "invoice_id": "inv_123",
    "amount": 299000,
    "paid_at": "2025-10-01T00:15:32Z"
  }
}

{
  "event": "invoice.payment_failed",
  "data": {
    "invoice_id": "inv_124",
    "amount": 299000,
    "attempt": 1,
    "next_attempt": "2025-10-03T00:00:00Z"
  }
}
```

---

## Implementation Guide untuk Dashboard

### Pricing Page

```typescript
// Get available plans
const getPlans = async () => {
  const response = await fetch('/api/v1/subscriptions/plans');
  const data = await response.json();
  return data.data;
};

// Display plans
const displayPlans = async () => {
  const plans = await getPlans();

  return plans.map(plan => ({
    name: plan.name,
    price: plan.price,
    features: plan.features.features_list,
    isPopular: plan.is_popular
  }));
};
```

### Subscription Management Page

```typescript
// Get current subscription
const getCurrentSubscription = async () => {
  const response = await makeAuthenticatedRequest('/api/v1/subscriptions/current');
  return response.data;
};

// Upgrade/Downgrade
const changePlan = async (newPlanId: string, billingCycle: string) => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/subscriptions/change-plan', {
      method: 'POST',
      body: JSON.stringify({
        new_plan_id: newPlanId,
        billing_cycle: billingCycle,
        prorate: true
      })
    });

    if (response.status === 'success') {
      showSuccess('Subscription updated successfully!');
      return response.data;
    }
  } catch (error) {
    if (error.code === 'DOWNGRADE_LIMIT_EXCEEDED') {
      showError(error.message);
      showError(`Action required: ${error.details.action_required}`);
    }
  }
};

// Cancel subscription
const cancelSubscription = async (reason: string, feedback: string) => {
  const confirmed = await confirmDialog(
    'Are you sure you want to cancel your subscription?'
  );

  if (confirmed) {
    const response = await makeAuthenticatedRequest('/api/v1/subscriptions/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason, feedback })
    });

    return response;
  }
};
```

### Billing History Page

```typescript
// Get billing history
const getBillingHistory = async (page = 1) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/subscriptions/billing-history?page=${page}&limit=20`
  );
  return response.data;
};

// Download invoice
const downloadInvoice = async (invoiceId: string) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`/api/v1/subscriptions/invoices/${invoiceId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
};
```

### Usage Meter Widget

```typescript
// Display usage meters
const displayUsageMeters = async () => {
  const subscription = await getCurrentSubscription();
  const usage = subscription.usage;

  return {
    outlets: {
      percentage: usage.outlets.percentage,
      text: `${usage.outlets.used} / ${usage.outlets.limit}`,
      warning: usage.outlets.percentage > 80
    },
    staff: {
      percentage: usage.staff.percentage,
      text: `${usage.staff.used} / ${usage.staff.limit}`,
      warning: usage.staff.percentage > 80
    },
    appointments: {
      percentage: usage.monthly_appointments.percentage,
      text: `${usage.monthly_appointments.used} / ${usage.monthly_appointments.limit}`,
      warning: usage.monthly_appointments.percentage > 80
    }
  };
};
```

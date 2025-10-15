# Payment Management API

**Level Akses**: 🟧 Staff Portal & 🟦 Customer Portal

API untuk mengelola pembayaran appointment dan transaksi.

---

## 1. Get All Payments

### GET `/api/v1/payments`

Mendapatkan daftar semua payments.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?status=paid&start_date=2025-10-01&end_date=2025-10-31&page=1&limit=20
```

**Parameters**:
- `appointment_id` (optional, string): Filter by appointment
- `customer_id` (optional, string): Filter by customer
- `status` (optional, enum): pending, partial, paid, failed, refunded
- `payment_method` (optional, enum): cash, credit_card, debit_card, ewallet, bank_transfer
- `start_date` (optional, string): From date
- `end_date` (optional, string): To date
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "payment_id": "pay_123",
      "payment_number": "PAY-2025-10-001",
      "appointment": {
        "appointment_id": "apt_123",
        "appointment_number": "APT-2025-10-001"
      },
      "customer": {
        "customer_id": "customer_123",
        "name": "John Customer"
      },
      "amount": 150000,
      "currency": "IDR",
      "payment_method": "cash",
      "payment_status": "paid",
      "paid_at": "2025-10-20T14:50:00Z",
      "created_at": "2025-10-20T14:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "total_pages": 8
  }
}
```

**Payment Status**:
- `pending` - Belum dibayar
- `partial` - Dibayar sebagian
- `paid` - Sudah dibayar penuh
- `failed` - Pembayaran gagal
- `refunded` - Di-refund

**Payment Methods**:
- `cash` - Tunai
- `credit_card` - Kartu kredit
- `debit_card` - Kartu debit
- `ewallet` - E-wallet (GoPay, OVO, Dana, dll)
- `bank_transfer` - Transfer bank
- `qris` - QRIS

---

## 2. Get Payment Details

### GET `/api/v1/payments/{payment_id}`

Mendapatkan detail lengkap payment.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `payment_id` (required, string): ID payment

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "payment_id": "pay_123",
    "payment_number": "PAY-2025-10-001",
    "appointment": {
      "appointment_id": "apt_123",
      "appointment_number": "APT-2025-10-001",
      "appointment_date": "2025-10-20",
      "start_time": "14:00",
      "service_name": "Hair Cut & Wash"
    },
    "customer": {
      "customer_id": "customer_123",
      "name": "John Customer",
      "email": "john@customer.com",
      "phone": "+62812345680"
    },
    "breakdown": {
      "service_amount": 150000,
      "discount": 0,
      "discount_code": null,
      "tax": 0,
      "platform_fee": 0,
      "subtotal": 150000,
      "total_amount": 150000
    },
    "payment_info": {
      "payment_method": "cash",
      "payment_status": "paid",
      "paid_amount": 150000,
      "change_amount": 0,
      "payment_gateway": null,
      "transaction_id": null
    },
    "timestamps": {
      "created_at": "2025-10-20T14:45:00Z",
      "paid_at": "2025-10-20T14:50:00Z",
      "updated_at": "2025-10-20T14:50:00Z"
    },
    "processed_by": {
      "staff_id": "staff_456",
      "staff_name": "Jane Smith"
    },
    "receipt_url": "https://storage.url/receipts/pay_123.pdf"
  }
}
```

---

## 3. Create Payment (Process Payment)

### POST `/api/v1/payments`

Process pembayaran untuk appointment.

**Authentication**: JWT Required (Staff)

**Request Body**:
```json
{
  "appointment_id": "apt_123",
  "payment_method": "cash",
  "amount": 150000,
  "notes": "Payment received in cash"
}
```

**Field Descriptions**:
- `appointment_id` (required, string): ID appointment yang dibayar
- `payment_method` (required, enum): Metode pembayaran
- `amount` (required, integer): Jumlah yang dibayar
- `notes` (optional, string): Catatan pembayaran

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "payment_id": "pay_124",
    "payment_number": "PAY-2025-10-002",
    "appointment_id": "apt_123",
    "amount": 150000,
    "payment_method": "cash",
    "payment_status": "paid",
    "paid_at": "2025-10-15T09:00:00Z",
    "receipt_url": "https://storage.url/receipts/pay_124.pdf"
  },
  "message": "Payment processed successfully"
}
```

---

## 4. Create Payment Link (Online Payment)

### POST `/api/v1/payments/create-link`

Buat payment link untuk online payment (via Paper.id gateway).

**Authentication**: JWT Required (Staff or Customer)

**Request Body**:
```json
{
  "appointment_id": "apt_123",
  "payment_methods": ["credit_card", "ewallet", "bank_transfer"],
  "success_redirect_url": "https://app.beautysalon.com/payment/success",
  "failure_redirect_url": "https://app.beautysalon.com/payment/failed"
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "payment_link_id": "plink_123",
    "payment_url": "https://pay.paper.id/xxxxxxxx",
    "qr_code_url": "https://storage.url/qr/plink_123.png",
    "amount": 150000,
    "expires_at": "2025-10-15T10:00:00Z",
    "status": "active"
  },
  "message": "Payment link created successfully"
}
```

**Implementation Notes**:
- Payment link valid selama 1 jam
- Support multiple payment methods
- Auto-update appointment payment status setelah payment berhasil
- Webhook notification dari payment gateway

---

## 5. Check Payment Status

### GET `/api/v1/payments/{payment_id}/status`

Check status pembayaran (untuk online payment).

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `payment_id` (required, string): ID payment

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "payment_id": "pay_123",
    "payment_status": "paid",
    "amount": 150000,
    "paid_at": "2025-10-20T14:50:00Z",
    "transaction_id": "TRX-PAPERID-123456",
    "payment_gateway_status": "settlement"
  }
}
```

---

## 6. Process Refund

### POST `/api/v1/payments/{payment_id}/refund`

Process refund pembayaran.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `payment_id` (required, string): ID payment

**Request Body**:
```json
{
  "refund_amount": 150000,
  "reason": "Appointment canceled by customer",
  "refund_method": "original_payment_method"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "payment_id": "pay_123",
    "refund_id": "ref_123",
    "refund_amount": 150000,
    "refund_status": "processing",
    "refund_method": "credit_card",
    "estimated_arrival": "2025-10-22",
    "refunded_at": "2025-10-15T09:30:00Z"
  },
  "message": "Refund processed successfully"
}
```

**Refund Status**:
- `pending` - Menunggu proses
- `processing` - Sedang diproses
- `completed` - Refund berhasil
- `failed` - Refund gagal

---

## 7. Apply Discount Code

### POST `/api/v1/payments/apply-discount`

Apply discount/promo code ke appointment.

**Authentication**: JWT Required (Staff or Customer)

**Request Body**:
```json
{
  "appointment_id": "apt_123",
  "discount_code": "FIRST2025"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "discount_code": "FIRST2025",
    "discount_type": "percentage",
    "discount_value": 20,
    "discount_amount": 30000,
    "original_amount": 150000,
    "final_amount": 120000,
    "valid": true
  },
  "message": "Discount applied successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Invalid or expired discount code",
  "code": "INVALID_DISCOUNT_CODE"
}
```

---

## 8. Get Payment Summary

### GET `/api/v1/payments/summary`

Mendapatkan summary pembayaran (untuk dashboard).

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?period=month&start_date=2025-10-01&end_date=2025-10-31&outlet_id=outlet_123
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "overview": {
      "total_revenue": 23400000,
      "total_transactions": 142,
      "average_transaction_value": 164789,
      "paid_transactions": 135,
      "pending_transactions": 5,
      "refunded_transactions": 2,
      "total_refunded_amount": 300000
    },
    "payment_methods_breakdown": [
      {
        "method": "cash",
        "count": 85,
        "amount": 12750000,
        "percentage": 54.5
      },
      {
        "method": "credit_card",
        "count": 35,
        "amount": 7350000,
        "percentage": 31.4
      },
      {
        "method": "ewallet",
        "count": 22,
        "amount": 3300000,
        "percentage": 14.1
      }
    ],
    "daily_revenue": [
      { "date": "2025-10-01", "revenue": 1200000, "transactions": 8 },
      { "date": "2025-10-02", "revenue": 1800000, "transactions": 12 }
    ],
    "status_breakdown": {
      "paid": 135,
      "pending": 5,
      "partial": 0,
      "failed": 0,
      "refunded": 2
    }
  }
}
```

---

## 9. Download Receipt

### GET `/api/v1/payments/{payment_id}/receipt`

Download receipt PDF.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `payment_id` (required, string): ID payment

**Response Success (200 OK)**:
- Content-Type: application/pdf
- File download

---

## 10. Send Receipt Email

### POST `/api/v1/payments/{payment_id}/send-receipt`

Kirim receipt via email.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `payment_id` (required, string): ID payment

**Request Body**:
```json
{
  "email": "john@customer.com"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Receipt sent to john@customer.com"
}
```

---

## Webhooks untuk Payment Events

Payment gateway (Paper.id) akan send webhooks untuk payment events:

```json
{
  "event": "payment.success",
  "data": {
    "payment_id": "pay_123",
    "appointment_id": "apt_123",
    "amount": 150000,
    "transaction_id": "TRX-PAPERID-123456",
    "payment_method": "credit_card",
    "paid_at": "2025-10-20T14:50:00Z"
  }
}

{
  "event": "payment.failed",
  "data": {
    "payment_id": "pay_124",
    "appointment_id": "apt_124",
    "amount": 150000,
    "failure_reason": "Insufficient funds"
  }
}

{
  "event": "refund.completed",
  "data": {
    "refund_id": "ref_123",
    "payment_id": "pay_123",
    "refund_amount": 150000,
    "refunded_at": "2025-10-15T09:35:00Z"
  }
}
```

---

## Implementation Guide untuk Dashboard

### Payment Processing

```typescript
// Process cash payment
const processCashPayment = async (
  appointmentId: string,
  amount: number
) => {
  const response = await makeAuthenticatedRequest('/api/v1/payments', {
    method: 'POST',
    body: JSON.stringify({
      appointment_id: appointmentId,
      payment_method: 'cash',
      amount,
      notes: 'Cash payment received'
    })
  });

  if (response.status === 'success') {
    showSuccess('Payment processed successfully!');
    return response.data;
  }
};

// Create online payment link
const createPaymentLink = async (appointmentId: string) => {
  const response = await makeAuthenticatedRequest('/api/v1/payments/create-link', {
    method: 'POST',
    body: JSON.stringify({
      appointment_id: appointmentId,
      payment_methods: ['credit_card', 'ewallet', 'bank_transfer'],
      success_redirect_url: `${window.location.origin}/payment/success`,
      failure_redirect_url: `${window.location.origin}/payment/failed`
    })
  });

  return response.data;
};
```

### Payment Dashboard

```typescript
// Get payment summary
const getPaymentSummary = async (period = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/payments/summary?period=${period}`
  );
  return response.data;
};

// Display payment metrics
const PaymentDashboard = ({ period }) => {
  const summary = await getPaymentSummary(period);

  return {
    totalRevenue: formatCurrency(summary.overview.total_revenue),
    totalTransactions: summary.overview.total_transactions,
    avgTransaction: formatCurrency(summary.overview.average_transaction_value),
    paymentMethods: summary.payment_methods_breakdown,
    dailyRevenue: summary.daily_revenue,
    statusBreakdown: summary.status_breakdown
  };
};
```

### Payment List Page

```typescript
// Get all payments
const getPayments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(`/api/v1/payments?${params}`);
  return response.data;
};

// Filter payments
const filterPayments = async (status: string, dateRange: DateRange) => {
  return getPayments({
    status,
    start_date: dateRange.start,
    end_date: dateRange.end
  });
};

// Display payments table
const PaymentsList = ({ filters }) => {
  const payments = await getPayments(filters);

  return payments.map(payment => ({
    paymentNumber: payment.payment_number,
    customer: payment.customer.name,
    amount: formatCurrency(payment.amount),
    method: payment.payment_method,
    status: payment.payment_status,
    paidAt: formatDate(payment.paid_at)
  }));
};
```

### Refund Processing

```typescript
// Process refund
const processRefund = async (
  paymentId: string,
  refundAmount: number,
  reason: string
) => {
  const confirmed = await confirmDialog(
    `Are you sure you want to refund ${formatCurrency(refundAmount)}?`
  );

  if (confirmed) {
    const response = await makeAuthenticatedRequest(
      `/api/v1/payments/${paymentId}/refund`,
      {
        method: 'POST',
        body: JSON.stringify({
          refund_amount: refundAmount,
          reason,
          refund_method: 'original_payment_method'
        })
      }
    );

    if (response.status === 'success') {
      showSuccess('Refund processed successfully!');
      return response.data;
    }
  }
};
```

### Discount Code Application

```typescript
// Apply discount code
const applyDiscountCode = async (
  appointmentId: string,
  discountCode: string
) => {
  try {
    const response = await makeAuthenticatedRequest(
      '/api/v1/payments/apply-discount',
      {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: appointmentId,
          discount_code: discountCode
        })
      }
    );

    if (response.status === 'success') {
      const discount = response.data;
      showSuccess(
        `Discount applied! You save ${formatCurrency(discount.discount_amount)}`
      );
      return discount;
    }
  } catch (error) {
    if (error.code === 'INVALID_DISCOUNT_CODE') {
      showError('Invalid or expired discount code');
    }
    return null;
  }
};
```

### Receipt Actions

```typescript
// Download receipt
const downloadReceipt = async (paymentId: string) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`/api/v1/payments/${paymentId}/receipt`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${paymentId}.pdf`;
  a.click();
};

// Send receipt email
const sendReceiptEmail = async (paymentId: string, email: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/payments/${paymentId}/send-receipt`,
    {
      method: 'POST',
      body: JSON.stringify({ email })
    }
  );

  showSuccess(`Receipt sent to ${email}`);
  return response;
};
```

### Payment Status Checker (for online payments)

```typescript
// Poll payment status
const pollPaymentStatus = async (paymentId: string) => {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (polling every 5 seconds)

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++;

      const response = await makeAuthenticatedRequest(
        `/api/v1/payments/${paymentId}/status`
      );

      if (response.data.payment_status === 'paid') {
        clearInterval(interval);
        resolve(response.data);
      } else if (response.data.payment_status === 'failed') {
        clearInterval(interval);
        reject(new Error('Payment failed'));
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error('Payment timeout'));
      }
    }, 5000);
  });
};

// Usage
const handleOnlinePayment = async (appointmentId: string) => {
  // Create payment link
  const paymentLink = await createPaymentLink(appointmentId);

  // Open payment page
  window.open(paymentLink.payment_url, '_blank');

  // Start polling for status
  try {
    const payment = await pollPaymentStatus(paymentLink.payment_link_id);
    showSuccess('Payment successful!');
    router.push(`/appointments/${appointmentId}`);
  } catch (error) {
    showError(error.message);
  }
};
```

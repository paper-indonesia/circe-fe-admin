# Webhooks API

**Level Akses**: 🟧 Staff Portal (Owner/Admin only)

Webhooks untuk menerima real-time notifications dari sistem saat events terjadi.

---

## Overview

Webhooks memungkinkan aplikasi Anda untuk menerima notifikasi real-time saat events tertentu terjadi di sistem Circe. Ketika event terjadi, sistem akan send HTTP POST request ke endpoint URL yang Anda konfigurasi.

---

## Webhook Events

### Appointment Events

#### `appointment.created`
Triggered saat appointment baru dibuat.

**Payload**:
```json
{
  "event": "appointment.created",
  "timestamp": "2025-10-15T09:00:00Z",
  "data": {
    "appointment_id": "apt_123",
    "appointment_number": "APT-2025-10-001",
    "customer_id": "customer_123",
    "customer_name": "John Customer",
    "service_id": "service_123",
    "service_name": "Hair Cut & Wash",
    "staff_id": "staff_456",
    "staff_name": "Jane Smith",
    "outlet_id": "outlet_123",
    "appointment_date": "2025-10-20",
    "start_time": "14:00",
    "end_time": "14:45",
    "status": "confirmed",
    "total_amount": 150000,
    "created_via": "customer_app"
  }
}
```

#### `appointment.updated`
Triggered saat appointment di-update.

**Payload**:
```json
{
  "event": "appointment.updated",
  "timestamp": "2025-10-15T09:15:00Z",
  "data": {
    "appointment_id": "apt_123",
    "changes": {
      "appointment_date": {
        "old": "2025-10-20",
        "new": "2025-10-21"
      },
      "start_time": {
        "old": "14:00",
        "new": "15:00"
      }
    }
  }
}
```

#### `appointment.confirmed`
Triggered saat appointment dikonfirmasi.

#### `appointment.completed`
Triggered saat appointment selesai.

#### `appointment.canceled`
Triggered saat appointment dibatalkan.

**Payload**:
```json
{
  "event": "appointment.canceled",
  "timestamp": "2025-10-15T09:20:00Z",
  "data": {
    "appointment_id": "apt_123",
    "cancellation_reason": "Customer requested",
    "canceled_by": "customer_123",
    "refund_processed": true,
    "refund_amount": 150000
  }
}
```

#### `appointment.no_show`
Triggered saat customer tidak datang.

---

### Payment Events

#### `payment.success`
Triggered saat pembayaran berhasil.

**Payload**:
```json
{
  "event": "payment.success",
  "timestamp": "2025-10-20T14:50:00Z",
  "data": {
    "payment_id": "pay_123",
    "payment_number": "PAY-2025-10-001",
    "appointment_id": "apt_123",
    "customer_id": "customer_123",
    "amount": 150000,
    "payment_method": "credit_card",
    "transaction_id": "TRX-PAPERID-123456",
    "paid_at": "2025-10-20T14:50:00Z"
  }
}
```

#### `payment.failed`
Triggered saat pembayaran gagal.

**Payload**:
```json
{
  "event": "payment.failed",
  "timestamp": "2025-10-20T14:50:00Z",
  "data": {
    "payment_id": "pay_124",
    "appointment_id": "apt_124",
    "amount": 150000,
    "payment_method": "credit_card",
    "failure_reason": "Insufficient funds",
    "failed_at": "2025-10-20T14:50:00Z"
  }
}
```

#### `payment.refunded`
Triggered saat refund diproses.

**Payload**:
```json
{
  "event": "payment.refunded",
  "timestamp": "2025-10-15T09:35:00Z",
  "data": {
    "refund_id": "ref_123",
    "payment_id": "pay_123",
    "appointment_id": "apt_123",
    "refund_amount": 150000,
    "refund_reason": "Appointment canceled",
    "refunded_at": "2025-10-15T09:35:00Z"
  }
}
```

---

### Customer Events

#### `customer.registered`
Triggered saat customer baru register.

**Payload**:
```json
{
  "event": "customer.registered",
  "timestamp": "2025-10-15T10:00:00Z",
  "data": {
    "customer_id": "customer_125",
    "name": "Jane Customer",
    "email": "jane@customer.com",
    "phone": "+62812345681",
    "registration_source": "customer_app"
  }
}
```

#### `customer.updated`
Triggered saat customer profile di-update.

---

### Subscription Events

#### `subscription.created`
Triggered saat subscription baru dibuat.

**Payload**:
```json
{
  "event": "subscription.created",
  "timestamp": "2025-10-15T10:00:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "tenant_id": "tenant_abc123",
    "plan": "PRO",
    "status": "active",
    "started_at": "2025-10-15T10:00:00Z"
  }
}
```

#### `subscription.updated`
Triggered saat subscription di-upgrade/downgrade.

**Payload**:
```json
{
  "event": "subscription.updated",
  "timestamp": "2025-10-15T10:00:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "tenant_id": "tenant_abc123",
    "old_plan": "FREE",
    "new_plan": "PRO",
    "effective_date": "2025-10-15T10:00:00Z"
  }
}
```

#### `subscription.canceled`
Triggered saat subscription dibatalkan.

#### `subscription.expired`
Triggered saat subscription expired.

---

### Invoice Events

#### `invoice.paid`
Triggered saat invoice dibayar.

**Payload**:
```json
{
  "event": "invoice.paid",
  "timestamp": "2025-10-01T00:15:32Z",
  "data": {
    "invoice_id": "inv_123",
    "invoice_number": "INV-2025-10-001",
    "tenant_id": "tenant_abc123",
    "amount": 299000,
    "paid_at": "2025-10-01T00:15:32Z"
  }
}
```

#### `invoice.payment_failed`
Triggered saat pembayaran invoice gagal.

**Payload**:
```json
{
  "event": "invoice.payment_failed",
  "timestamp": "2025-10-01T00:15:32Z",
  "data": {
    "invoice_id": "inv_124",
    "tenant_id": "tenant_abc123",
    "amount": 299000,
    "attempt": 1,
    "next_attempt": "2025-10-03T00:00:00Z",
    "failure_reason": "Card declined"
  }
}
```

---

## Webhook Management

### 1. Register Webhook

#### POST `/api/v1/webhooks`

Register webhook endpoint baru.

**Authentication**: JWT Required (Owner/Admin)

**Request Body**:
```json
{
  "url": "https://your-app.com/webhooks/circe",
  "events": [
    "appointment.created",
    "appointment.completed",
    "appointment.canceled",
    "payment.success",
    "payment.failed"
  ],
  "secret": "your_webhook_secret_key",
  "active": true
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "webhook_id": "webhook_123",
    "url": "https://your-app.com/webhooks/circe",
    "events": [...],
    "secret": "your_webhook_secret_key",
    "active": true,
    "created_at": "2025-10-15T10:00:00Z"
  },
  "message": "Webhook registered successfully"
}
```

---

### 2. Get All Webhooks

#### GET `/api/v1/webhooks`

Mendapatkan daftar webhooks.

**Authentication**: JWT Required (Owner/Admin)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "webhook_id": "webhook_123",
      "url": "https://your-app.com/webhooks/circe",
      "events": [
        "appointment.created",
        "payment.success"
      ],
      "active": true,
      "last_triggered_at": "2025-10-15T09:00:00Z",
      "total_deliveries": 156,
      "failed_deliveries": 2,
      "success_rate": 98.7,
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### 3. Update Webhook

#### PUT `/api/v1/webhooks/{webhook_id}`

Update webhook configuration.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `webhook_id` (required, string): ID webhook

**Request Body**:
```json
{
  "url": "https://your-app.com/webhooks/circe-v2",
  "events": [
    "appointment.created",
    "appointment.completed",
    "payment.success"
  ],
  "active": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Webhook updated successfully"
}
```

---

### 4. Delete Webhook

#### DELETE `/api/v1/webhooks/{webhook_id}`

Hapus webhook.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `webhook_id` (required, string): ID webhook

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Webhook deleted successfully"
}
```

---

### 5. Test Webhook

#### POST `/api/v1/webhooks/{webhook_id}/test`

Test webhook dengan sample payload.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `webhook_id` (required, string): ID webhook

**Request Body**:
```json
{
  "event": "appointment.created"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "webhook_id": "webhook_123",
    "test_sent": true,
    "response_status": 200,
    "response_time_ms": 245
  },
  "message": "Test webhook sent successfully"
}
```

---

### 6. Get Webhook Logs

#### GET `/api/v1/webhooks/{webhook_id}/logs`

Mendapatkan delivery logs webhook.

**Authentication**: JWT Required (Owner/Admin)

**Path Parameters**:
- `webhook_id` (required, string): ID webhook

**Query Parameters**:
```
?status=failed&page=1&limit=20
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "log_id": "log_001",
      "event": "appointment.created",
      "payload": {...},
      "status": "success",
      "response_status": 200,
      "response_time_ms": 245,
      "attempts": 1,
      "delivered_at": "2025-10-15T09:00:00Z"
    },
    {
      "log_id": "log_002",
      "event": "payment.success",
      "payload": {...},
      "status": "failed",
      "response_status": 500,
      "error_message": "Internal server error",
      "attempts": 3,
      "last_attempted_at": "2025-10-15T09:10:00Z",
      "next_retry_at": "2025-10-15T09:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## Webhook Security

### Signature Verification

Setiap webhook request include signature di header untuk verify authenticity.

**Request Headers**:
```
X-Circe-Signature: sha256=abc123...
X-Circe-Event: appointment.created
X-Circe-Timestamp: 2025-10-15T09:00:00Z
```

**Verify Signature (Implementation)**:
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

// Usage in webhook handler
app.post('/webhooks/circe', (req, res) => {
  const signature = req.headers['x-circe-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  const event = req.body;
  handleWebhookEvent(event);

  res.status(200).json({ received: true });
});
```

---

## Retry Policy

Jika webhook delivery gagal, sistem akan retry dengan policy:

1. **Retry 1**: Immediate (0 seconds)
2. **Retry 2**: After 1 minute
3. **Retry 3**: After 5 minutes
4. **Retry 4**: After 15 minutes
5. **Retry 5**: After 1 hour

Setelah 5 failed attempts, webhook di-mark sebagai failed dan tidak di-retry lagi. Admin akan receive notification.

---

## Implementation Guide

### Webhook Handler (Express.js)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/webhooks/circe', async (req, res) => {
  try {
    // 1. Verify signature
    const signature = req.headers['x-circe-signature'] as string;
    const payload = JSON.stringify(req.body);
    const secret = process.env.CIRCE_WEBHOOK_SECRET!;

    if (!verifyWebhookSignature(payload, signature, secret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Get event data
    const event = req.body;
    console.log(`Received webhook: ${event.event}`);

    // 3. Handle event
    await handleWebhookEvent(event);

    // 4. Respond quickly (within 5 seconds)
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Event handler
async function handleWebhookEvent(event: any) {
  switch (event.event) {
    case 'appointment.created':
      await handleAppointmentCreated(event.data);
      break;

    case 'appointment.completed':
      await handleAppointmentCompleted(event.data);
      break;

    case 'appointment.canceled':
      await handleAppointmentCanceled(event.data);
      break;

    case 'payment.success':
      await handlePaymentSuccess(event.data);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;

    default:
      console.log(`Unhandled event: ${event.event}`);
  }
}

// Example handlers
async function handleAppointmentCreated(data: any) {
  console.log('New appointment created:', data.appointment_id);

  // Send notification to staff
  // Update calendar
  // Trigger automated workflows
}

async function handlePaymentSuccess(data: any) {
  console.log('Payment successful:', data.payment_id);

  // Update accounting system
  // Send receipt
  // Update inventory
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}
```

### Webhook Registration (Dashboard)

```typescript
// Register webhook
const registerWebhook = async (webhookData: WebhookConfig) => {
  const response = await makeAuthenticatedRequest('/api/v1/webhooks', {
    method: 'POST',
    body: JSON.stringify(webhookData)
  });

  if (response.status === 'success') {
    showSuccess('Webhook registered successfully!');
    return response.data;
  }
};

// Test webhook
const testWebhook = async (webhookId: string, event: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/webhooks/${webhookId}/test`,
    {
      method: 'POST',
      body: JSON.stringify({ event })
    }
  );

  if (response.status === 'success') {
    showSuccess(
      `Test webhook sent successfully! Response time: ${response.data.response_time_ms}ms`
    );
  }

  return response;
};

// Webhook management component
const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);

  const loadWebhooks = async () => {
    const response = await makeAuthenticatedRequest('/api/v1/webhooks');
    setWebhooks(response.data);
  };

  const handleRegister = async () => {
    const webhookData = {
      url: 'https://your-app.com/webhooks/circe',
      events: [
        'appointment.created',
        'appointment.completed',
        'payment.success'
      ],
      secret: generateRandomSecret(),
      active: true
    };

    await registerWebhook(webhookData);
    await loadWebhooks();
  };

  return { webhooks, loadWebhooks, handleRegister };
};
```

### Webhook Logs Viewer

```typescript
// Get webhook logs
const getWebhookLogs = async (webhookId: string, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(
    `/api/v1/webhooks/${webhookId}/logs?${params}`
  );
  return response.data;
};

// Display logs
const WebhookLogs = ({ webhookId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getWebhookLogs(webhookId).then(setLogs);
  }, [webhookId]);

  return logs.map(log => ({
    event: log.event,
    status: log.status,
    responseStatus: log.response_status,
    responseTime: `${log.response_time_ms}ms`,
    attempts: log.attempts,
    deliveredAt: formatDate(log.delivered_at),
    errorMessage: log.error_message
  }));
};
```

---

## Best Practices

1. **Respond Quickly**: Webhook handlers harus respond dalam 5 detik
2. **Process Async**: Process webhook payload di background job
3. **Verify Signature**: Selalu verify webhook signature
4. **Idempotency**: Handle duplicate webhooks (same event dikirim 2x)
5. **Error Handling**: Proper error handling dan logging
6. **Monitoring**: Monitor webhook delivery success rate
7. **Security**: Use HTTPS untuk webhook endpoint
8. **Testing**: Test webhook dengan test endpoint sebelum production

# Appointments Management API

**Level Akses**: 🟧 Staff Portal & 🟦 Customer Portal

API untuk mengelola appointment/booking. Staff dapat manage semua appointments, Customer hanya appointments milik sendiri.

---

## 1. Get All Appointments

### GET `/api/v1/appointments`

Mendapatkan daftar appointments.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?outlet_id=outlet_123&staff_id=staff_456&status=confirmed&date=2025-10-20&page=1&limit=20
```

**Parameters**:
- `outlet_id` (optional, string): Filter by outlet
- `staff_id` (optional, string): Filter by staff
- `customer_id` (optional, string): Filter by customer
- `status` (optional, enum): pending, confirmed, completed, canceled, no_show
- `date` (optional, string): Filter by specific date (YYYY-MM-DD)
- `start_date` (optional, string): Filter from date
- `end_date` (optional, string): Filter to date
- `page` (optional, integer): Page number
- `limit` (optional, integer): Items per page

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "appointment_id": "apt_123",
      "appointment_number": "APT-2025-10-001",
      "customer": {
        "customer_id": "customer_123",
        "name": "John Customer",
        "phone": "+62812345680",
        "email": "john@customer.com"
      },
      "service": {
        "service_id": "service_123",
        "service_name": "Hair Cut & Wash",
        "duration_minutes": 45
      },
      "staff": {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "photo": "https://storage.url/staff456.jpg"
      },
      "outlet": {
        "outlet_id": "outlet_123",
        "outlet_name": "Beauty Salon XYZ - Central"
      },
      "appointment_date": "2025-10-20",
      "start_time": "14:00",
      "end_time": "14:45",
      "status": "confirmed",
      "payment_status": "pending",
      "total_amount": 150000,
      "notes": "",
      "created_by": "customer_123",
      "created_via": "customer_app",
      "created_at": "2025-10-18T10:00:00Z"
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

**Appointment Status**:
- `pending` - Menunggu konfirmasi
- `confirmed` - Sudah dikonfirmasi
- `in_progress` - Sedang berlangsung
- `completed` - Selesai
- `canceled` - Dibatalkan
- `no_show` - Customer tidak datang

**Payment Status**:
- `pending` - Belum dibayar
- `partial` - Dibayar sebagian (deposit)
- `paid` - Sudah dibayar penuh
- `refunded` - Di-refund

---

## 2. Get Appointment Details

### GET `/api/v1/appointments/{appointment_id}`

Mendapatkan detail lengkap appointment.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "appointment_number": "APT-2025-10-001",
    "customer": {
      "customer_id": "customer_123",
      "name": "John Customer",
      "phone": "+62812345680",
      "email": "john@customer.com",
      "profile_photo": "https://storage.url/customer123.jpg"
    },
    "service": {
      "service_id": "service_123",
      "service_name": "Hair Cut & Wash",
      "description": "Professional hair cut with premium products",
      "duration_minutes": 45,
      "price": 150000
    },
    "staff": {
      "staff_id": "staff_456",
      "staff_name": "Jane Smith",
      "photo": "https://storage.url/staff456.jpg",
      "phone": "+62812345679"
    },
    "outlet": {
      "outlet_id": "outlet_123",
      "outlet_name": "Beauty Salon XYZ - Central",
      "address": "Jl. Sudirman No. 123, Jakarta",
      "phone": "+62812345678"
    },
    "appointment_date": "2025-10-20",
    "start_time": "14:00",
    "end_time": "14:45",
    "status": "confirmed",
    "payment_info": {
      "payment_status": "pending",
      "subtotal": 150000,
      "discount": 0,
      "total_amount": 150000,
      "paid_amount": 0,
      "remaining_amount": 150000,
      "payment_method": null
    },
    "notes": "Customer requested specific hair style",
    "customer_notes": "Please use organic products",
    "internal_notes": "",
    "cancellation_policy": "Cancel up to 24 hours before appointment",
    "reminders_sent": [
      {
        "type": "email",
        "sent_at": "2025-10-19T14:00:00Z"
      },
      {
        "type": "sms",
        "sent_at": "2025-10-20T10:00:00Z"
      }
    ],
    "created_by": {
      "type": "customer",
      "id": "customer_123",
      "name": "John Customer"
    },
    "created_via": "customer_app",
    "created_at": "2025-10-18T10:00:00Z",
    "updated_at": "2025-10-18T10:00:00Z"
  }
}
```

---

## 3. Create Appointment (Staff Portal)

### POST `/api/v1/appointments`

Buat appointment baru dari staff portal.

**Authentication**: JWT Required (Staff)

**Request Body**:
```json
{
  "customer_id": "customer_123",
  "service_id": "service_123",
  "staff_id": "staff_456",
  "outlet_id": "outlet_123",
  "appointment_date": "2025-10-25",
  "start_time": "15:00",
  "notes": "Customer requested window seat",
  "auto_confirm": true,
  "send_notifications": true
}
```

**Field Descriptions**:
- `customer_id` (required, string): ID customer
- `service_id` (required, string): ID service
- `staff_id` (required, string): ID staff
- `outlet_id` (required, string): ID outlet
- `appointment_date` (required, string): Tanggal appointment (YYYY-MM-DD)
- `start_time` (required, string): Jam mulai (HH:MM)
- `notes` (optional, string): Catatan appointment
- `auto_confirm` (optional, boolean): Langsung confirm (default: true untuk staff)
- `send_notifications` (optional, boolean): Kirim notifikasi ke customer (default: true)

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_124",
    "appointment_number": "APT-2025-10-002",
    "customer_name": "John Customer",
    "service_name": "Hair Cut & Wash",
    "staff_name": "Jane Smith",
    "appointment_date": "2025-10-25",
    "start_time": "15:00",
    "end_time": "15:45",
    "status": "confirmed",
    "total_amount": 150000,
    "created_at": "2025-10-15T09:00:00Z"
  },
  "message": "Appointment created successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Staff is not available at the selected time",
  "code": "STAFF_NOT_AVAILABLE",
  "details": {
    "staff_id": "staff_456",
    "date": "2025-10-25",
    "time": "15:00",
    "conflict": "Already has appointment at this time"
  }
}
```

---

## 4. Create Appointment (Customer Portal)

### POST `/api/v1/customer/booking/appointments`

Buat appointment dari customer app.

**Authentication**: Customer JWT Required

**Request Body**:
```json
{
  "service_id": "service_123",
  "outlet_id": "outlet_123",
  "appointment_date": "2025-10-25",
  "start_time": "15:00",
  "staff_id": "staff_456",
  "customer_notes": "Please use organic products"
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_125",
    "appointment_number": "APT-2025-10-003",
    "status": "pending",
    "requires_confirmation": true,
    "appointment_date": "2025-10-25",
    "start_time": "15:00",
    "end_time": "15:45",
    "total_amount": 150000,
    "payment_required": false
  },
  "message": "Appointment request submitted. Waiting for confirmation."
}
```

---

## 5. Update Appointment

### PUT `/api/v1/appointments/{appointment_id}`

Update appointment details.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "appointment_date": "2025-10-26",
  "start_time": "16:00",
  "staff_id": "staff_457",
  "notes": "Updated notes",
  "send_notifications": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "appointment_date": "2025-10-26",
    "start_time": "16:00",
    "end_time": "16:45",
    "updated_at": "2025-10-15T09:15:00Z"
  },
  "message": "Appointment updated successfully"
}
```

---

## 6. Confirm Appointment

### POST `/api/v1/appointments/{appointment_id}/confirm`

Konfirmasi appointment yang pending.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "send_confirmation": true,
  "notes": "Confirmed by staff"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "status": "confirmed",
    "confirmed_by": "staff_456",
    "confirmed_at": "2025-10-15T09:20:00Z"
  },
  "message": "Appointment confirmed"
}
```

---

## 7. Start Appointment

### POST `/api/v1/appointments/{appointment_id}/start`

Mulai appointment (set status in_progress).

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "status": "in_progress",
    "started_at": "2025-10-20T14:00:00Z"
  },
  "message": "Appointment started"
}
```

---

## 8. Complete Appointment

### POST `/api/v1/appointments/{appointment_id}/complete`

Selesaikan appointment.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "actual_end_time": "14:50",
  "payment_status": "paid",
  "payment_method": "cash",
  "internal_notes": "Customer was satisfied with the service"
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "status": "completed",
    "completed_at": "2025-10-20T14:50:00Z",
    "payment_status": "paid",
    "review_requested": true
  },
  "message": "Appointment completed successfully"
}
```

---

## 9. Cancel Appointment

### POST `/api/v1/appointments/{appointment_id}/cancel`

Batalkan appointment.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "reason": "Customer requested cancellation",
  "canceled_by": "customer",
  "refund_payment": true,
  "send_notifications": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "status": "canceled",
    "cancellation_reason": "Customer requested cancellation",
    "canceled_by": "customer_123",
    "canceled_at": "2025-10-19T10:00:00Z",
    "refund_processed": true,
    "refund_amount": 150000
  },
  "message": "Appointment canceled successfully"
}
```

---

## 10. Mark as No-Show

### POST `/api/v1/appointments/{appointment_id}/no-show`

Tandai appointment sebagai no-show (customer tidak datang).

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "notes": "Customer did not show up and did not notify",
  "charge_no_show_fee": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "status": "no_show",
    "no_show_fee": 50000,
    "marked_at": "2025-10-20T14:30:00Z"
  },
  "message": "Appointment marked as no-show"
}
```

---

## 11. Reschedule Appointment

### POST `/api/v1/appointments/{appointment_id}/reschedule`

Reschedule appointment ke tanggal/waktu lain.

**Authentication**: JWT Required (Staff or Customer Self)

**Path Parameters**:
- `appointment_id` (required, string): ID appointment

**Request Body**:
```json
{
  "new_date": "2025-10-27",
  "new_start_time": "15:00",
  "new_staff_id": "staff_456",
  "reason": "Customer requested different time",
  "send_notifications": true
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "appointment_id": "apt_123",
    "old_date": "2025-10-20",
    "old_time": "14:00",
    "new_date": "2025-10-27",
    "new_time": "15:00",
    "rescheduled_at": "2025-10-18T11:00:00Z"
  },
  "message": "Appointment rescheduled successfully"
}
```

---

## 12. Get Appointment Calendar

### GET `/api/v1/appointments/calendar`

Mendapatkan appointments dalam format calendar.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?outlet_id=outlet_123&staff_id=staff_456&start_date=2025-10-15&end_date=2025-10-31&view=week
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "view": "week",
    "start_date": "2025-10-15",
    "end_date": "2025-10-21",
    "appointments": [
      {
        "appointment_id": "apt_123",
        "title": "Hair Cut - John Customer",
        "customer_name": "John Customer",
        "service_name": "Hair Cut & Wash",
        "staff_name": "Jane Smith",
        "start": "2025-10-20T14:00:00Z",
        "end": "2025-10-20T14:45:00Z",
        "status": "confirmed",
        "color": "#4CAF50"
      }
    ]
  }
}
```

---

## 13. Get Appointment Statistics

### GET `/api/v1/appointments/statistics`

Mendapatkan statistik appointments.

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
    "metrics": {
      "total_appointments": 156,
      "confirmed_appointments": 140,
      "completed_appointments": 135,
      "canceled_appointments": 12,
      "no_show_appointments": 4,
      "pending_appointments": 5,
      "completion_rate": 86.5,
      "cancellation_rate": 7.7,
      "no_show_rate": 2.6,
      "total_revenue": 23400000,
      "average_appointment_value": 150000
    },
    "daily_trend": [
      { "date": "2025-10-01", "appointments": 8, "revenue": 1200000 },
      { "date": "2025-10-02", "appointments": 12, "revenue": 1800000 }
    ],
    "status_breakdown": {
      "confirmed": 140,
      "completed": 135,
      "canceled": 12,
      "no_show": 4,
      "pending": 5
    },
    "peak_hours": [
      { "hour": "14:00", "appointments": 24 },
      { "hour": "15:00", "appointments": 22 }
    ]
  }
}
```

---

## Implementation Guide untuk Dashboard

### Appointments List/Calendar Page

```typescript
// Get appointments
const getAppointments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await makeAuthenticatedRequest(`/api/v1/appointments?${params}`);
  return response.data;
};

// Get appointments for specific date
const getAppointmentsByDate = async (date: string, outletId?: string) => {
  return getAppointments({
    date,
    ...(outletId && { outlet_id: outletId })
  });
};

// Calendar view
const getAppointmentCalendar = async (startDate: string, endDate: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/calendar?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};
```

### Create Appointment (Booking Form)

```typescript
// Create appointment
const createAppointment = async (appointmentData: AppointmentFormData) => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });

    if (response.status === 'success') {
      showSuccess('Appointment created successfully!');
      return response.data;
    }
  } catch (error) {
    if (error.code === 'STAFF_NOT_AVAILABLE') {
      showError('Staff is not available at the selected time');
      showError(`Conflict: ${error.details.conflict}`);
    } else {
      showError(error.message);
    }
  }
};

// Booking form flow
const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    outlet_id: '',
    staff_id: '',
    appointment_date: '',
    start_time: '',
    notes: ''
  });

  // Step 1: Select customer
  // Step 2: Select service
  // Step 3: Select outlet
  // Step 4: Select date & time slot
  // Step 5: Confirm booking

  const handleSubmit = async () => {
    const appointment = await createAppointment(formData);
    router.push(`/appointments/${appointment.appointment_id}`);
  };

  return { step, formData, setFormData, handleSubmit };
};
```

### Appointment Detail Page

```typescript
// Get appointment details
const getAppointmentDetails = async (appointmentId: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/${appointmentId}`
  );
  return response.data;
};

// Appointment actions
const confirmAppointment = async (appointmentId: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/${appointmentId}/confirm`,
    {
      method: 'POST',
      body: JSON.stringify({ send_confirmation: true })
    }
  );

  showSuccess('Appointment confirmed!');
  return response;
};

const startAppointment = async (appointmentId: string) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/${appointmentId}/start`,
    { method: 'POST' }
  );

  return response;
};

const completeAppointment = async (
  appointmentId: string,
  paymentData: PaymentData
) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/${appointmentId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }
  );

  showSuccess('Appointment completed!');
  return response;
};

const cancelAppointment = async (appointmentId: string, reason: string) => {
  const confirmed = await confirmDialog('Are you sure you want to cancel this appointment?');

  if (confirmed) {
    const response = await makeAuthenticatedRequest(
      `/api/v1/appointments/${appointmentId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason, send_notifications: true })
      }
    );

    return response;
  }
};
```

### Appointment Calendar Component

```typescript
// Full calendar integration
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const AppointmentCalendar = ({ outletId }) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async (start: Date, end: Date) => {
    const calendar = await getAppointmentCalendar(
      formatDate(start),
      formatDate(end)
    );

    const events = calendar.appointments.map(apt => ({
      id: apt.appointment_id,
      title: apt.title,
      start: apt.start,
      end: apt.end,
      color: apt.color,
      extendedProps: {
        customer: apt.customer_name,
        staff: apt.staff_name,
        status: apt.status
      }
    }));

    setEvents(events);
  };

  return {
    events,
    fetchEvents,
    handleEventClick: (info) => {
      router.push(`/appointments/${info.event.id}`);
    }
  };
};
```

### Appointment Statistics Dashboard

```typescript
// Get statistics
const getAppointmentStats = async (period = 'month') => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/appointments/statistics?period=${period}`
  );
  return response.data;
};

// Display stats
const AppointmentMetrics = ({ period }) => {
  const stats = await getAppointmentStats(period);

  return {
    totalAppointments: stats.metrics.total_appointments,
    completionRate: `${stats.metrics.completion_rate}%`,
    cancellationRate: `${stats.metrics.cancellation_rate}%`,
    totalRevenue: formatCurrency(stats.metrics.total_revenue),
    avgValue: formatCurrency(stats.metrics.average_appointment_value),
    dailyTrend: stats.daily_trend,
    statusBreakdown: stats.status_breakdown,
    peakHours: stats.peak_hours
  };
};
```

# Availability Management API

**Level Akses**: 🟧 Staff Portal (Owner/Admin/Manager/Staff)

API untuk mengelola ketersediaan staff, termasuk working hours, time off, dan override schedule.

---

## 1. Get Staff Availability Schedule

### GET `/api/v1/availability/staff/{staff_id}`

Mendapatkan jadwal ketersediaan staff.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Query Parameters**:
```
?start_date=2025-10-15&end_date=2025-10-31&outlet_id=outlet_123
```

**Parameters**:
- `start_date` (required, string): Format YYYY-MM-DD
- `end_date` (required, string): Format YYYY-MM-DD
- `outlet_id` (optional, string): Filter by outlet

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "staff_name": "Jane Smith",
    "default_working_hours": {
      "monday": { "available": true, "start": "09:00", "end": "18:00" },
      "tuesday": { "available": true, "start": "09:00", "end": "18:00" },
      "wednesday": { "available": true, "start": "09:00", "end": "18:00" },
      "thursday": { "available": true, "start": "09:00", "end": "18:00" },
      "friday": { "available": true, "start": "09:00", "end": "20:00" },
      "saturday": { "available": true, "start": "10:00", "end": "20:00" },
      "sunday": { "available": false }
    },
    "schedule": [
      {
        "date": "2025-10-15",
        "day_of_week": "tuesday",
        "is_available": true,
        "working_hours": {
          "start": "09:00",
          "end": "18:00"
        },
        "outlet_id": "outlet_123",
        "appointments": [
          {
            "appointment_id": "apt_123",
            "start_time": "10:00",
            "end_time": "10:45",
            "service_name": "Hair Cut & Wash"
          }
        ],
        "available_slots_count": 12,
        "has_override": false
      },
      {
        "date": "2025-10-16",
        "day_of_week": "wednesday",
        "is_available": false,
        "reason": "Time off",
        "time_off_id": "timeoff_789",
        "has_override": true
      }
    ]
  }
}
```

---

## 2. Get Available Slots

### GET `/api/v1/availability/slots`

Check available time slots untuk booking.

**Authentication**: JWT Required (Staff) atau Public

**Query Parameters**:
```
?date=2025-10-20&service_id=service_123&outlet_id=outlet_123&staff_id=staff_456
```

**Parameters**:
- `date` (required, string): Format YYYY-MM-DD
- `service_id` (required, string): ID service yang akan di-book
- `outlet_id` (required, string): ID outlet
- `staff_id` (optional, string): ID staff tertentu (jika customer pilih staff)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "date": "2025-10-20",
    "service_id": "service_123",
    "service_name": "Hair Cut & Wash",
    "service_duration": 45,
    "outlet_id": "outlet_123",
    "available_slots": [
      {
        "slot_id": "slot_001",
        "start_time": "09:00",
        "end_time": "09:45",
        "staff": {
          "staff_id": "staff_456",
          "staff_name": "Jane Smith",
          "photo": "https://storage.url/staff456.jpg",
          "rating": 4.9
        },
        "is_available": true,
        "price": 150000
      },
      {
        "slot_id": "slot_002",
        "start_time": "10:00",
        "end_time": "10:45",
        "staff": {
          "staff_id": "staff_457",
          "staff_name": "John Therapist",
          "photo": "https://storage.url/staff457.jpg",
          "rating": 4.7
        },
        "is_available": true,
        "price": 150000
      },
      {
        "slot_id": "slot_003",
        "start_time": "11:00",
        "end_time": "11:45",
        "staff": {
          "staff_id": "staff_456",
          "staff_name": "Jane Smith",
          "photo": "https://storage.url/staff456.jpg",
          "rating": 4.9
        },
        "is_available": false,
        "reason": "Already booked"
      }
    ],
    "total_available_slots": 24
  }
}
```

**Implementation Notes**:
- Slot duration otomatis dari service duration + buffer time
- Jika staff_id dispesifikkan, hanya return slots untuk staff tersebut
- Include only slots within outlet operating hours
- Exclude slots yang sudah booked atau staff sedang time off

---

## 3. Set Staff Working Hours

### PUT `/api/v1/availability/staff/{staff_id}/working-hours`

Update default working hours staff.

**Authentication**: JWT Required (Owner/Admin/Manager or Staff Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "working_hours": {
    "monday": { "available": true, "start": "08:00", "end": "17:00" },
    "tuesday": { "available": true, "start": "08:00", "end": "17:00" },
    "wednesday": { "available": true, "start": "08:00", "end": "17:00" },
    "thursday": { "available": true, "start": "08:00", "end": "17:00" },
    "friday": { "available": true, "start": "08:00", "end": "19:00" },
    "saturday": { "available": true, "start": "09:00", "end": "19:00" },
    "sunday": { "available": true, "start": "10:00", "end": "16:00" }
  }
}
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "staff_id": "staff_456",
    "working_hours": {...},
    "updated_at": "2025-10-15T09:00:00Z"
  },
  "message": "Working hours updated successfully"
}
```

---

## 4. Create Schedule Override

### POST `/api/v1/availability/staff/{staff_id}/overrides`

Buat override untuk tanggal tertentu (ubah jam kerja atau set unavailable).

**Authentication**: JWT Required (Owner/Admin/Manager or Staff Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Request Body**:
```json
{
  "date": "2025-10-25",
  "type": "custom_hours",
  "working_hours": {
    "start": "13:00",
    "end": "21:00"
  },
  "outlet_id": "outlet_123",
  "reason": "Special shift"
}
```

**Override Types**:
- `custom_hours` - Ubah jam kerja untuk tanggal tertentu
- `unavailable` - Set unavailable (time off)
- `available` - Override hari libur jadi available

**Request Body for Unavailable**:
```json
{
  "date": "2025-10-26",
  "type": "unavailable",
  "reason": "Personal leave"
}
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "override_id": "override_123",
    "staff_id": "staff_456",
    "date": "2025-10-25",
    "type": "custom_hours",
    "working_hours": {
      "start": "13:00",
      "end": "21:00"
    },
    "created_at": "2025-10-15T09:10:00Z"
  },
  "message": "Schedule override created successfully"
}
```

---

## 5. Get Schedule Overrides

### GET `/api/v1/availability/staff/{staff_id}/overrides`

Mendapatkan daftar schedule overrides.

**Authentication**: JWT Required (Staff)

**Path Parameters**:
- `staff_id` (required, string): ID staff

**Query Parameters**:
```
?start_date=2025-10-15&end_date=2025-10-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "override_id": "override_123",
      "date": "2025-10-25",
      "type": "custom_hours",
      "working_hours": {
        "start": "13:00",
        "end": "21:00"
      },
      "reason": "Special shift",
      "created_at": "2025-10-15T09:10:00Z"
    },
    {
      "override_id": "override_124",
      "date": "2025-10-26",
      "type": "unavailable",
      "reason": "Personal leave",
      "created_at": "2025-10-14T14:30:00Z"
    }
  ]
}
```

---

## 6. Delete Schedule Override

### DELETE `/api/v1/availability/staff/{staff_id}/overrides/{override_id}`

Hapus schedule override.

**Authentication**: JWT Required (Owner/Admin/Manager or Staff Self)

**Path Parameters**:
- `staff_id` (required, string): ID staff
- `override_id` (required, string): ID override

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Schedule override deleted successfully"
}
```

---

## 7. Request Time Off

### POST `/api/v1/availability/time-off`

Staff request time off (cuti/libur).

**Authentication**: JWT Required (Staff)

**Request Body**:
```json
{
  "staff_id": "staff_456",
  "start_date": "2025-11-01",
  "end_date": "2025-11-03",
  "type": "annual_leave",
  "reason": "Family vacation",
  "notes": "Will be out of town"
}
```

**Time Off Types**:
- `annual_leave` - Cuti tahunan
- `sick_leave` - Sakit
- `personal_leave` - Urusan pribadi
- `emergency` - Darurat
- `other` - Lainnya

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "time_off_id": "timeoff_789",
    "staff_id": "staff_456",
    "start_date": "2025-11-01",
    "end_date": "2025-11-03",
    "type": "annual_leave",
    "status": "pending",
    "days_count": 3,
    "affected_appointments": 8,
    "created_at": "2025-10-15T09:20:00Z"
  },
  "message": "Time off request submitted successfully"
}
```

**Implementation Notes**:
- Status: pending, approved, rejected
- Jika ada appointments di tanggal time off, perlu dihandle
- Owner/Admin perlu approve request

---

## 8. Get Time Off Requests

### GET `/api/v1/availability/time-off`

Mendapatkan daftar time off requests.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?staff_id=staff_456&status=pending&start_date=2025-10-01&end_date=2025-12-31
```

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "time_off_id": "timeoff_789",
      "staff": {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith"
      },
      "start_date": "2025-11-01",
      "end_date": "2025-11-03",
      "type": "annual_leave",
      "reason": "Family vacation",
      "status": "pending",
      "days_count": 3,
      "requested_at": "2025-10-15T09:20:00Z"
    }
  ]
}
```

---

## 9. Approve/Reject Time Off

### PUT `/api/v1/availability/time-off/{time_off_id}/status`

Approve atau reject time off request.

**Authentication**: JWT Required (Owner/Admin/Manager)

**Path Parameters**:
- `time_off_id` (required, string): ID time off request

**Request Body**:
```json
{
  "status": "approved",
  "admin_notes": "Approved. Have a nice vacation!",
  "cancel_appointments": true,
  "notify_customers": true
}
```

**Status Options**:
- `approved` - Disetujui
- `rejected` - Ditolak

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "time_off_id": "timeoff_789",
    "status": "approved",
    "approved_by": "admin_123",
    "approved_at": "2025-10-15T10:00:00Z",
    "appointments_canceled": 8
  },
  "message": "Time off request approved"
}
```

---

## 10. Get Availability Grid

### GET `/api/v1/availability/grid`

Mendapatkan grid view availability untuk semua staff di outlet.

**Authentication**: JWT Required (Staff)

**Query Parameters**:
```
?outlet_id=outlet_123&date=2025-10-20&view=day
```

**Parameters**:
- `outlet_id` (required, string): ID outlet
- `date` (required, string): Format YYYY-MM-DD
- `view` (optional, enum): day, week (default: day)

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "outlet_id": "outlet_123",
    "outlet_name": "Beauty Salon XYZ - Central",
    "date": "2025-10-20",
    "view": "day",
    "operating_hours": {
      "open": "09:00",
      "close": "18:00"
    },
    "staff_availability": [
      {
        "staff_id": "staff_456",
        "staff_name": "Jane Smith",
        "photo": "https://storage.url/staff456.jpg",
        "is_working": true,
        "working_hours": {
          "start": "09:00",
          "end": "18:00"
        },
        "appointments": [
          {
            "appointment_id": "apt_123",
            "start_time": "10:00",
            "end_time": "10:45",
            "service_name": "Hair Cut & Wash",
            "customer_name": "John Customer",
            "status": "confirmed"
          },
          {
            "appointment_id": "apt_124",
            "start_time": "14:00",
            "end_time": "15:30",
            "service_name": "Hair Coloring",
            "customer_name": "Jane Customer",
            "status": "confirmed"
          }
        ],
        "available_slots_count": 10,
        "utilization_rate": 45
      },
      {
        "staff_id": "staff_457",
        "staff_name": "John Therapist",
        "photo": "https://storage.url/staff457.jpg",
        "is_working": false,
        "reason": "Time off"
      }
    ]
  }
}
```

**Implementation Notes**:
- Grid view untuk scheduling dashboard
- Menampilkan visual availability semua staff
- Include appointments dan time gaps
- Utilization rate = (booked time / working hours) * 100

---

## Implementation Guide untuk Dashboard

### Availability Calendar Component

```typescript
// Get staff availability schedule
const getStaffSchedule = async (
  staffId: string,
  startDate: string,
  endDate: string
) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/availability/staff/${staffId}?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

// Display calendar
const AvailabilityCalendar = ({ staffId, month, year }) => {
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  const schedule = await getStaffSchedule(staffId, startDate, endDate);

  return schedule.schedule.map(day => ({
    date: day.date,
    isAvailable: day.is_available,
    appointments: day.appointments?.length || 0,
    reason: day.reason
  }));
};
```

### Time Slot Selector (Booking Flow)

```typescript
// Get available slots for booking
const getAvailableSlots = async (
  date: string,
  serviceId: string,
  outletId: string,
  staffId?: string
) => {
  const params = new URLSearchParams({
    date,
    service_id: serviceId,
    outlet_id: outletId,
    ...(staffId && { staff_id: staffId })
  });

  const response = await fetch(`/api/v1/availability/slots?${params}`);
  const data = await response.json();
  return data.data;
};

// Display slot picker
const TimeSlotPicker = ({ date, serviceId, outletId }) => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    getAvailableSlots(date, serviceId, outletId).then(data => {
      setSlots(data.available_slots.filter(slot => slot.is_available));
    });
  }, [date, serviceId, outletId]);

  return slots.map(slot => ({
    time: `${slot.start_time} - ${slot.end_time}`,
    staff: slot.staff.staff_name,
    price: formatCurrency(slot.price)
  }));
};
```

### Working Hours Editor

```typescript
// Update staff working hours
const updateWorkingHours = async (
  staffId: string,
  workingHours: WorkingHours
) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/availability/staff/${staffId}/working-hours`,
    {
      method: 'PUT',
      body: JSON.stringify({ working_hours: workingHours })
    }
  );

  return response;
};

// Working hours form
const WorkingHoursForm = ({ staffId, defaultHours }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const [hours, setHours] = useState(defaultHours);

  const handleSubmit = async () => {
    await updateWorkingHours(staffId, hours);
    showSuccess('Working hours updated!');
  };

  return { hours, setHours, handleSubmit };
};
```

### Time Off Management

```typescript
// Request time off
const requestTimeOff = async (timeOffData: TimeOffRequest) => {
  const response = await makeAuthenticatedRequest('/api/v1/availability/time-off', {
    method: 'POST',
    body: JSON.stringify(timeOffData)
  });

  if (response.status === 'success') {
    if (response.data.affected_appointments > 0) {
      showWarning(
        `You have ${response.data.affected_appointments} appointments during this period`
      );
    }
    showSuccess('Time off request submitted!');
  }

  return response;
};

// Approve time off (Admin)
const approveTimeOff = async (timeOffId: string, cancelAppointments: boolean) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/availability/time-off/${timeOffId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({
        status: 'approved',
        cancel_appointments: cancelAppointments,
        notify_customers: true
      })
    }
  );

  return response;
};
```

### Availability Grid View

```typescript
// Get availability grid
const getAvailabilityGrid = async (
  outletId: string,
  date: string,
  view = 'day'
) => {
  const response = await makeAuthenticatedRequest(
    `/api/v1/availability/grid?outlet_id=${outletId}&date=${date}&view=${view}`
  );
  return response.data;
};

// Display grid
const AvailabilityGrid = ({ outletId, date }) => {
  const grid = await getAvailabilityGrid(outletId, date);

  return grid.staff_availability.map(staff => ({
    name: staff.staff_name,
    isWorking: staff.is_working,
    appointments: staff.appointments,
    utilization: `${staff.utilization_rate}%`,
    availableSlots: staff.available_slots_count
  }));
};
```

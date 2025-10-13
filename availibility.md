Availability Management¶
Complete guide to managing staff availability, schedules, and working hours in the Reserva platform.

Overview¶
The availability system provides comprehensive staff scheduling with support for:

CRUD Operations - Create, read, update, delete availability entries
Recurring Patterns - Daily, weekly, monthly schedules with smart expansion
Bulk Creation - Efficiently create multiple varied schedule entries
Conflict Detection - Smart type-based overlap prevention
Working Hours Management - Regular hours, breaks, blocked time, vacation
Real-time Checking - Instant availability verification for bookings
Service-Specific Availability - Limit staff to specific services during time slots
Key Concepts:

Working Hours = Staff available for appointments
Break = Unavailable period within working hours (e.g., lunch)
Blocked = Time reserved, no appointments allowed
Vacation = Extended unavailability period
Recurrence = Pattern-based schedule creation (daily/weekly/monthly)
Bulk = Multiple varied entries in single request
Availability Types¶
The system supports four availability types with different conflict rules:

Type	Description	Can Overlap With	Use Case
working_hours	Staff available for services	break	Regular shift: "9 AM - 5 PM"
break	Unavailable within working hours	working_hours	Lunch break: "12 PM - 1 PM"
blocked	Reserved time, no bookings	nothing	Personal appointment, meeting
vacation	Extended absence	nothing	Holiday, sick leave
Smart Conflict Detection:

✅ BREAK can overlap with WORKING_HOURS - Breaks must be within work time
❌ WORKING_HOURS cannot overlap with other WORKING_HOURS - Prevents double scheduling
❌ BREAK cannot overlap with other BREAK - Each break must be distinct
❌ BLOCKED/VACATION conflicts with everything - Absolute time blocks
List Staff Availability¶
Retrieve staff availability entries with date range and type filtering.

Endpoint¶
GET /api/v1/availability
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only view own availability
TENANT_ADMIN/SUPER_ADMIN: Can view all staff availability
Query Parameters¶
Parameter	Type	Required	Description	Example
start_date	date	No	Start date for filtering (defaults to first day of current month)	2025-01-15
end_date	date	No	End date for filtering (defaults to last day of current month)	2025-01-31
staff_id	string	No	Filter by specific staff member	507f1f77bcf86cd799439011
availability_type	enum	No	Filter by type: working_hours, break, blocked, vacation	working_hours
outlet_id	string	No	Filter by outlet	507f1f77bcf86cd799439012
page	integer	No	Page number (default: 1)	1
size	integer	No	Page size (default: 20, max: 100)	20
Response¶
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439013",
      "staff_id": "507f1f77bcf86cd799439011",
      "outlet_id": "507f1f77bcf86cd799439012",
      "date": "2025-01-15",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "availability_type": "working_hours",
      "recurrence_type": "none",
      "recurrence_end_date": null,
      "recurrence_days": null,
      "is_available": true,
      "notes": "Regular working day",
      "service_ids": null,
      "created_at": "2025-01-10T08:00:00Z",
      "updated_at": "2025-01-10T08:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "staff_id": "507f1f77bcf86cd799439011",
      "outlet_id": "507f1f77bcf86cd799439012",
      "date": "2025-01-15",
      "start_time": "12:00:00",
      "end_time": "13:00:00",
      "availability_type": "break",
      "recurrence_type": "none",
      "is_available": false,
      "notes": "Lunch break",
      "service_ids": null,
      "created_at": "2025-01-10T08:00:00Z",
      "updated_at": "2025-01-10T08:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "size": 20,
  "pages": 1
}
Business Rules:

Date range must be valid (start ≤ end)
Staff users automatically limited to their own availability
Defaults to current month if no dates specified
Results sorted chronologically by date and start time
Note: service_ids: null means staff is available for ALL services they are qualified for during this time slot.

Create Staff Availability¶
Create new availability entry with automatic conflict detection and recurrence support.

Endpoint¶
POST /api/v1/availability
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only create own availability
TENANT_ADMIN/SUPER_ADMIN: Can create any staff availability
Request Body¶
Single Entry (No Recurrence):

{
  "staff_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "availability_type": "working_hours",
  "recurrence_type": "none",
  "is_available": true,
  "notes": "Regular working day"
}
Daily Recurrence:

{
  "staff_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "availability_type": "working_hours",
  "recurrence_type": "daily",
  "recurrence_end_date": "2025-01-31",
  "is_available": true,
  "notes": "Daily schedule for January"
}
Weekly Recurrence (Weekdays Only):

{
  "staff_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "availability_type": "working_hours",
  "recurrence_type": "weekly",
  "recurrence_end_date": "2025-03-31",
  "recurrence_days": [0, 1, 2, 3, 4],
  "is_available": true,
  "notes": "Monday to Friday working hours"
}
Monthly Recurrence:

{
  "staff_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "availability_type": "working_hours",
  "recurrence_type": "monthly",
  "recurrence_end_date": "2025-12-15",
  "is_available": true,
  "notes": "15th of every month"
}
Service-Specific Availability:

{
  "staff_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "15:00",
  "availability_type": "working_hours",
  "recurrence_type": "none",
  "service_ids": ["507f1f77bcf86cd799439020"],
  "notes": "Hair coloring services only today"
}
Parameters:

Field	Type	Required	Description
staff_id	string	Yes	Staff member ID
date	date	Yes	Start date (YYYY-MM-DD)
start_time	time	Yes	Start time (HH:MM format)
end_time	time	Yes	End time (HH:MM format)
availability_type	enum	Yes	Type: working_hours, break, blocked, vacation
recurrence_type	enum	Yes	Pattern: none, daily, weekly, monthly
recurrence_end_date	date	Conditional	Required if recurrence_type != none
recurrence_days	array	No	Days for weekly (0=Mon, 1=Tue, ..., 6=Sun)
is_available	boolean	No	Default: true for working_hours, false for break
notes	string	No	Additional notes
service_ids	array	No	Service IDs (null = all services staff is qualified for)
Response¶
Single Entry Response:

{
  "id": "507f1f77bcf86cd799439013",
  "staff_id": "507f1f77bcf86cd799439011",
  "outlet_id": "507f1f77bcf86cd799439012",
  "date": "2025-01-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "availability_type": "working_hours",
  "recurrence_type": "none",
  "recurrence_end_date": null,
  "recurrence_days": null,
  "is_available": true,
  "notes": "Regular working day",
  "service_ids": null,
  "created_at": "2025-01-10T08:00:00Z",
  "updated_at": "2025-01-10T08:00:00Z"
}
Recurring Entries Summary Response:

{
  "message": "Successfully created recurring availability",
  "summary": {
    "total_entries_created": 15,
    "date_range": {
      "start": "2025-10-11",
      "end": "2025-10-31"
    },
    "recurrence_pattern": {
      "type": "weekly",
      "days": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    "staff_id": "507f1f77bcf86cd799439011",
    "availability_type": "working_hours",
    "time_range": "09:00 - 17:00"
  },
  "sample_entry": {
    "id": "507f1f77bcf86cd799439013",
    "date": "2025-10-11",
    "start_time": "09:00:00",
    "end_time": "17:00:00"
  }
}
Business Rules:

No overlapping time slots for same staff (with smart type-based detection)
Working hours must be logical (start < end)
Time must be in 5-minute increments (e.g., 09:00, 09:05, 09:10)
Maximum 365 entries per recurring pattern
recurrence_end_date REQUIRED for all recurring patterns (daily/weekly/monthly)
recurrence_end_date NOT required for single entries (recurrence_type: "none")
Recurrence Types:

none: Single availability entry (no recurrence_end_date needed)
daily: Repeats every day until end date (recurrence_end_date REQUIRED)
weekly: Repeats weekly on specified days (recurrence_end_date REQUIRED, recurrence_days optional)
monthly: Repeats monthly on same date (recurrence_end_date REQUIRED)
Why Summary Response for Recurring?

Creating 100+ entries would return a massive JSON response
Summary provides all necessary confirmation data
Use GET /availability to retrieve specific entries afterward
Improves API performance and usability
Important Notes on service_ids:

Omit or set to null: Staff available for ALL services they are qualified for (most common)
Provide specific IDs: Staff available ONLY for those services (e.g., ["coloring_id"] = coloring only)
Use case: "Sarah does hair coloring on Wednesdays only, but all services other days"
Check Staff Availability¶
Verify staff availability for specific time slot with conflict details.

Endpoint¶
GET /api/v1/availability/check
Authentication: Required (JWT token)

Access Control: - STAFF/OUTLET_MANAGER: Can only check own availability - TENANT_ADMIN/SUPER_ADMIN: Can check any staff availability

Query Parameters¶
Parameter	Type	Required	Description	Example
staff_id	string	Yes	Staff member ID	507f1f77bcf86cd799439011
date	date	Yes	Date to check	2025-01-15
start_time	string	Yes	Start time (HH:MM format)	14:30
end_time	string	Yes	End time (HH:MM format)	16:00
service_id	string	No	Service ID for specific availability	507f1f77bcf86cd799439012
Response¶
Available:

{
  "available": true,
  "message": "Slot available",
  "reason": null,
  "working_hours": {
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "breaks": [
      {
        "start": "12:00:00",
        "end": "13:00:00"
      }
    ]
  },
  "conflicts": []
}
Not Available (Staff Not Working):

{
  "available": false,
  "message": "Staff not working during this time",
  "reason": "staff_not_working",
  "working_hours": {
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "breaks": []
  },
  "conflicts": []
}
Not Available (Booking Conflict):

{
  "available": false,
  "message": "Conflict detected",
  "reason": "booking_conflict",
  "working_hours": {
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "breaks": [
      {
        "start": "12:00:00",
        "end": "13:00:00"
      }
    ]
  },
  "conflicts": [
    {
      "id": "507f1f77bcf86cd799439015",
      "type": "blocked",
      "start_time": "14:00:00",
      "end_time": "15:00:00",
      "notes": "Personal appointment"
    }
  ]
}
Business Rules Applied:

Staff working hours validation
Appointment overlap detection
Break period consideration
Service-specific availability rules
Use Cases:

Pre-appointment booking validation
Schedule conflict prevention
Booking system integration
Real-time schedule checking
Note: Essential for appointment booking systems to prevent double-booking.

Get Availability Entry¶
Retrieve complete details for a specific availability entry.

Endpoint¶
GET /api/v1/availability/{availability_id}
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only view own entries
TENANT_ADMIN/SUPER_ADMIN: Can view any entries
Response¶
{
  "id": "507f1f77bcf86cd799439013",
  "staff_id": "507f1f77bcf86cd799439011",
  "outlet_id": "507f1f77bcf86cd799439012",
  "date": "2025-01-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "availability_type": "working_hours",
  "recurrence_type": "weekly",
  "recurrence_end_date": "2025-03-31",
  "recurrence_days": [0, 1, 2, 3, 4],
  "is_available": true,
  "notes": "Monday to Friday working hours",
  "service_ids": null,
  "created_at": "2025-01-10T08:00:00Z",
  "updated_at": "2025-01-10T08:00:00Z"
}
Business Rules:

Entry must exist and belong to user's tenant
Staff users limited to their own entries
Proper ObjectId format validation
Update Availability Entry¶
Update existing availability entry with conflict detection and validation.

Endpoint¶
PUT /api/v1/availability/{availability_id}
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only update own entries
TENANT_ADMIN/SUPER_ADMIN: Can update any entries
Request Body¶
{
  "start_time": "10:00",
  "end_time": "18:00",
  "notes": "Updated schedule - later shift"
}
Parameters: All fields are optional (partial updates supported)

Field	Type	Description
date	date	Update date (YYYY-MM-DD)
start_time	time	Update start time (HH:MM)
end_time	time	Update end time (HH:MM)
availability_type	enum	Update type
is_available	boolean	Update availability flag
notes	string	Update notes
service_ids	array	Update service restrictions
Response¶
{
  "id": "507f1f77bcf86cd799439013",
  "staff_id": "507f1f77bcf86cd799439011",
  "outlet_id": "507f1f77bcf86cd799439012",
  "date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "18:00:00",
  "availability_type": "working_hours",
  "recurrence_type": "none",
  "is_available": true,
  "notes": "Updated schedule - later shift",
  "service_ids": null,
  "created_at": "2025-01-10T08:00:00Z",
  "updated_at": "2025-01-15T14:30:00Z"
}
Business Rules:

Entry must exist and belong to user's tenant
No conflicting time slots after update
Time ranges must be logical (start < end)
Staff users limited to their own entries
Note: Conflicts with existing schedules will prevent updates.

Delete Availability Entry¶
Remove availability entry from staff schedule (soft delete for audit trail).

Endpoint¶
DELETE /api/v1/availability/{availability_id}
Authentication: Required (JWT token)

Access Control: - STAFF/OUTLET_MANAGER: Can only delete own entries - TENANT_ADMIN/SUPER_ADMIN: Can delete any entries

Response¶
{
  "message": "Availability entry has been deleted successfully"
}
Business Rules:

Entry must exist and belong to user's tenant
Staff users limited to their own entries
Soft delete maintains audit trail
Consider impact on scheduled appointments
Note: Deleted entries are hidden but preserved for audit purposes.

Create Bulk Availability¶
Create multiple availability entries with different configurations in a single request.

Endpoint¶
POST /api/v1/availability/bulk
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only create own bulk schedules
TENANT_ADMIN/SUPER_ADMIN: Can create any bulk schedules
When to Use This Endpoint¶
Key Difference from Recurrence Endpoint:

This endpoint: Creates entries from a list of varied specifications (different dates, times, types)
POST /availability with recurrence: Creates entries from a single pattern (same time, recurring schedule)
Use This Endpoint For:

✅ Non-uniform schedules: Different times on different days (Mon 9-5, Tue 10-6, Wed 9-3)
✅ Mixed entry types: Combining working hours + breaks + blocked time in one request
✅ Schedule templates: Applying pre-defined weekly templates with varied configurations
✅ Import operations: Bulk importing schedules from external systems or spreadsheets
✅ Complex patterns: Schedules that can't be expressed as simple daily/weekly/monthly recurrence
Use POST /availability Instead For:

❌ Uniform recurring pattern (same time every day/week/month)
❌ Simple "Mon-Fri 9-5" type schedules
❌ Single entry creation
Request Body¶
{
  "staff_id": "507f1f77bcf86cd799439011",
  "availability_entries": [
    {
      "date": "2025-01-13",
      "start_time": "09:00",
      "end_time": "17:00",
      "availability_type": "working_hours",
      "recurrence_type": "none"
    },
    {
      "date": "2025-01-13",
      "start_time": "12:00",
      "end_time": "13:00",
      "availability_type": "break",
      "is_available": false,
      "recurrence_type": "none"
    },
    {
      "date": "2025-01-14",
      "start_time": "10:00",
      "end_time": "18:00",
      "availability_type": "working_hours",
      "recurrence_type": "none"
    },
    {
      "date": "2025-01-15",
      "start_time": "09:00",
      "end_time": "15:00",
      "availability_type": "working_hours",
      "service_ids": ["507f1f77bcf86cd799439020"],
      "notes": "Coloring services only today",
      "recurrence_type": "none"
    }
  ]
}
Parameters:

Field	Type	Required	Description
staff_id	string	Yes	Staff member ID for all entries
availability_entries	array	Yes	List of availability specifications (max 50)
Each Entry in Array:

Field	Type	Required	Description
date	date	Yes	Entry date (YYYY-MM-DD)
start_time	time	Yes	Start time (HH:MM)
end_time	time	Yes	End time (HH:MM)
availability_type	enum	Yes	Type: working_hours, break, blocked, vacation
recurrence_type	enum	Yes	Pattern: none (most common for bulk)
is_available	boolean	No	Availability flag
notes	string	No	Entry notes
service_ids	array	No	Service restrictions
Response¶
{
  "message": "Successfully created bulk availability",
  "summary": {
    "total_entries_created": 4,
    "date_range": {
      "start": "2025-01-13",
      "end": "2025-01-15"
    },
    "staff_id": "507f1f77bcf86cd799439011",
    "entry_types": ["working_hours", "break"],
    "unique_dates": 3
  },
  "sample_entry": {
    "id": "507f1f77bcf86cd799439013",
    "date": "2025-01-13",
    "start_time": "09:00:00",
    "end_time": "17:00:00"
  }
}
Business Rules:

All entries must pass individual validation
No conflicts between entries in the same batch
Rollback entire operation if any entry fails
Maximum 50 entries per request (rate limiting)
Smart Conflict Detection:

BREAK can overlap with WORKING_HOURS: Breaks are allowed within work time
Example: 09:00-17:00 working + 12:00-13:00 break = ✅ Valid
WORKING_HOURS cannot overlap with other WORKING_HOURS: Prevents double scheduling
BREAK cannot overlap with other BREAK: Each break must be distinct
BLOCKED/VACATION conflicts with everything: Absolute time blocks
Why Summary Response?

Creating 50 entries would return a massive JSON response
Summary provides all necessary confirmation data
Use GET /availability to retrieve specific entries afterward
Improves API performance and usability
Note: Operation fails entirely if any entry has conflicts or validation errors.

Get Staff Schedule¶
Retrieve complete staff schedule for specified date range.

Endpoint¶
GET /api/v1/availability/staff/{staff_id}
Authentication: Required (JWT token)

Access Control:

STAFF/OUTLET_MANAGER: Can only view own schedules
TENANT_ADMIN/SUPER_ADMIN: Can view any staff schedules
Query Parameters¶
Parameter	Type	Required	Description	Example
start_date	date	Yes	Start date for range	2025-01-15
end_date	date	Yes	End date for range	2025-01-31
include_breaks	boolean	No	Include break periods (default: true)	true
Response¶
[
  {
    "id": "507f1f77bcf86cd799439013",
    "staff_id": "507f1f77bcf86cd799439011",
    "outlet_id": "507f1f77bcf86cd799439012",
    "date": "2025-01-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "availability_type": "working_hours",
    "recurrence_type": "none",
    "is_available": true,
    "notes": "Regular working day",
    "service_ids": null,
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-10T08:00:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439014",
    "staff_id": "507f1f77bcf86cd799439011",
    "outlet_id": "507f1f77bcf86cd799439012",
    "date": "2025-01-15",
    "start_time": "12:00:00",
    "end_time": "13:00:00",
    "availability_type": "break",
    "recurrence_type": "none",
    "is_available": false,
    "notes": "Lunch break",
    "service_ids": null,
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-10T08:00:00Z"
  }
]
Business Rules:

Date range must be valid (start ≤ end)
Staff users limited to their own availability
Results include all availability types unless filtered
Use Cases:

Staff schedule review and planning
Appointment booking availability checks
Schedule conflict identification
Reporting and analytics
Subscription Plan Limits¶
Availability management is subject to subscription plan limits:

Plan	Max Staff per Outlet	Appointments per Month	Notes
FREE	5	100	Limited to 1 outlet
PRO	50	2,000	Up to 10 outlets
ENTERPRISE	Unlimited	Unlimited	Unlimited outlets
How Limits Apply:

Staff Count: Number of active staff members per outlet affects availability entries
Appointment Limits: Availability schedules must accommodate monthly appointment quotas
Outlets: Multi-outlet businesses need appropriate plans
Upgrade Recommendation:

If you're hitting limits, consider upgrading:

POST /api/v1/subscriptions/upgrade
See Subscription Management for details.

Business Rules Summary¶
Time Validation¶
Start time must be before end time
Time must be in 5-minute increments (09:00, 09:05, 09:10)
Date range must be valid (start ≤ end)
Maximum 365 entries per recurring pattern
Conflict Prevention¶
Type-Based Conflict Matrix:

working_hours	break	blocked	vacation
working_hours	❌ Conflict	✅ Allowed	❌ Conflict	❌ Conflict
break	✅ Allowed	❌ Conflict	❌ Conflict	❌ Conflict
blocked	❌ Conflict	❌ Conflict	❌ Conflict	❌ Conflict
vacation	❌ Conflict	❌ Conflict	❌ Conflict	❌ Conflict
Smart Logic:

Breaks MUST overlap with working hours (breaks happen during work)
Working hours cannot overlap with other working hours
Blocked/vacation time is absolute (no overlaps allowed)
Access Control¶
Role	List All	List Own	Create	Update	Delete
STAFF	❌	✅	✅ (own)	✅ (own)	✅ (own)
OUTLET_MANAGER	❌	✅	✅ (own)	✅ (own)	✅ (own)
TENANT_ADMIN	✅	✅	✅ (all)	✅ (all)	✅ (all)
SUPER_ADMIN	✅	✅	✅ (all)	✅ (all)	✅ (all)
Recurrence Requirements¶
Recurrence Type	recurrence_end_date	recurrence_days	Max Entries
none	❌ Not required	❌ Not used	1
daily	✅ Required	❌ Not used	365
weekly	✅ Required	Optional (all days if omitted)	365
monthly	✅ Required	❌ Not used	365
Common Use Cases¶
1. Set Regular Working Hours (Mon-Fri, 9-5)¶
curl -X POST https://api.myreserva.id/api/v1/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "507f1f77bcf86cd799439011",
    "date": "2025-01-13",
    "start_time": "09:00",
    "end_time": "17:00",
    "availability_type": "working_hours",
    "recurrence_type": "weekly",
    "recurrence_end_date": "2025-12-31",
    "recurrence_days": [0, 1, 2, 3, 4],
    "notes": "Regular weekday hours"
  }'
2. Add Daily Lunch Break¶
curl -X POST https://api.myreserva.id/api/v1/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "507f1f77bcf86cd799439011",
    "date": "2025-01-13",
    "start_time": "12:00",
    "end_time": "13:00",
    "availability_type": "break",
    "recurrence_type": "weekly",
    "recurrence_end_date": "2025-12-31",
    "recurrence_days": [0, 1, 2, 3, 4],
    "is_available": false,
    "notes": "Daily lunch break"
  }'
3. Block Time for Personal Appointment¶
curl -X POST https://api.myreserva.id/api/v1/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "507f1f77bcf86cd799439011",
    "date": "2025-01-20",
    "start_time": "14:00",
    "end_time": "15:30",
    "availability_type": "blocked",
    "recurrence_type": "none",
    "notes": "Doctor appointment"
  }'
4. Schedule Vacation¶
curl -X POST https://api.myreserva.id/api/v1/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "507f1f77bcf86cd799439011",
    "date": "2025-07-01",
    "start_time": "00:00",
    "end_time": "23:59",
    "availability_type": "vacation",
    "recurrence_type": "daily",
    "recurrence_end_date": "2025-07-14",
    "notes": "Summer vacation"
  }'
5. Create Non-Uniform Weekly Schedule (Bulk)¶
curl -X POST https://api.myreserva.id/api/v1/availability/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "507f1f77bcf86cd799439011",
    "availability_entries": [
      {
        "date": "2025-01-13",
        "start_time": "09:00",
        "end_time": "17:00",
        "availability_type": "working_hours",
        "recurrence_type": "none"
      },
      {
        "date": "2025-01-14",
        "start_time": "10:00",
        "end_time": "18:00",
        "availability_type": "working_hours",
        "recurrence_type": "none"
      },
      {
        "date": "2025-01-15",
        "start_time": "09:00",
        "end_time": "15:00",
        "availability_type": "working_hours",
        "recurrence_type": "none"
      }
    ]
  }'
6. Check Availability Before Booking¶
curl -X GET "https://api.myreserva.id/api/v1/availability/check?staff_id=507f1f77bcf86cd799439011&date=2025-01-15&start_time=14:30&end_time=16:00" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Error Handling¶
Common Error Responses¶
409 Conflict - Schedule Conflict Detected:

{
  "detail": "Time conflicts with existing availability: 2025-01-15 14:00-16:00 (blocked)"
}
422 Unprocessable Entity - Validation Error:

{
  "detail": "recurrence_end_date is required for recurrence_type 'weekly'"
}
403 Forbidden - Insufficient Permissions:

{
  "detail": "Staff users can only create their own availability"
}
404 Not Found - Entry Not Found:

{
  "detail": "Availability not found"
}
Integration with Other Features¶
Appointment Booking¶
Availability management integrates with the appointment system:

Pre-Booking Validation - Use /availability/check to verify staff availability
Booking Creation - Appointment system respects availability schedules
Conflict Prevention - Appointments cannot be booked during breaks, blocked time, or vacation
Working Hours - Appointments must fall within staff working hours
See Appointment Management (coming soon) for details.

Staff Management¶
Staff profiles link to availability:

Service Assignments - Availability can be restricted to specific services
Outlet Assignments - Staff availability is outlet-specific
Skills & Qualifications - Service restrictions respect staff skills
See Staff Management for details.

Service Management¶
Service catalog integration:

Service-Specific Availability - Limit staff to certain services during time slots
Duration Validation - Appointments respect service durations
Pricing Context - Availability doesn't affect pricing but enables bookings
See Service Management for details.

Best Practices¶
For Regular Schedules¶
✅ DO:

Use weekly recurrence for consistent Mon-Fri schedules
Set breaks within working hours (breaks overlap with work)
Plan availability at least 2 weeks in advance
Use meaningful notes for context
❌ DON'T:

Create individual entries for recurring patterns (use recurrence)
Overlap working hours with other working hours
Set breaks outside working hours
Exceed 365 entries per recurrence pattern
For Complex Schedules¶
✅ DO:

Use bulk endpoint for varied weekly templates
Combine working hours + breaks in bulk requests
Import schedules from external systems via bulk
Verify conflicts before bulk creation
❌ DON'T:

Use recurrence for non-uniform schedules (use bulk)
Send more than 50 entries per bulk request
Skip conflict validation
Ignore response summaries
For Real-Time Booking¶
✅ DO:

Always use /availability/check before creating appointments
Cache working hours for performance
Handle conflicts gracefully with alternative suggestions
Respect break periods
❌ DON'T:

Create appointments without availability validation
Assume staff is always available
Ignore break periods
Skip service-specific availability rules
API Reference Summary¶
Endpoint	Method	Purpose	Response Type
/availability	GET	List availability entries with filters	Paginated list
/availability	POST	Create single/recurring entry	Single entry or summary
/availability/check	GET	Verify staff availability for slot	Availability status
/availability/{id}	GET	Get specific entry details	Single entry
/availability/{id}	PUT	Update existing entry	Updated entry
/availability/{id}	DELETE	Remove entry (soft delete)	Success message
/availability/bulk	POST	Create multiple varied entries	Summary response
/availability/staff/{id}	GET	Get complete staff schedule	Entry list

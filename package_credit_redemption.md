Package Credit Redemption¶
Use prepaid package credits to pay for appointments instantly.

Overview¶
Package credit redemption allows customers to use their prepaid service credits when booking appointments. This feature:

Zero-Cost Appointments - Credits from purchased packages cover service costs
Automatic Payment - Payment status set to PAID instantly when using credits
FIFO Ordering - Oldest credits (closest to expiry) used first
Atomic Operations - Credit redemption and appointment creation are transactional
Related Documentation:

Package Management - Create and configure service packages
Customer Package Management - Customer self-service package operations
Staff Customer Package Management - Staff-side package and credit operations
Customer Package Payments - Package payment processing
How Credit Redemption Works¶
graph TD
    A[Create Appointment Request] --> B{credit_redeemed = true?}
    B -->|No| C[Standard Flow - Payment Pending]
    B -->|Yes| D[Validate customer_package_id]
    D --> E[Check Credit Availability]
    E -->|No Credits| F[400 Error - No Available Credits]
    E -->|Has Credits| G[Create Appointment]
    G --> H[Redeem Credit - FIFO]
    H -->|Success| I[Set Payment Status = PAID]
    I --> J[Return Appointment with credit_id]
    H -->|Failure| K[Rollback - Delete Appointment]
    K --> L[400 Error - Credit Redemption Failed]
Request Format¶
To create an appointment with credit redemption, include credit_redeemed and customer_package_id:


{
  "customer_id": "507f1f77bcf86cd799439011",
  "outlet_id": "507f1f77bcf86cd799439012",
  "appointment_date": "2025-01-15",
  "start_time": "14:30",
  "services": [
    {
      "service_id": "507f1f77bcf86cd799439013",
      "staff_id": "507f1f77bcf86cd799439014"
    }
  ],
  "credit_redeemed": true,
  "customer_package_id": "507f1f77bcf86cd799439020",
  "notes": "Using package credit"
}
Parameters:

Field	Type	Required	Description
credit_redeemed	boolean	Yes*	Set to true to use package credits
customer_package_id	string	Yes*	Customer's purchased package ID containing credits
*Required only when using credit redemption

Response Format¶
Successful credit redemption returns appointment with credit information:


{
  "id": "507f1f77bcf86cd799439030",
  "tenant_id": "507f1f77bcf86cd799439010",
  "customer_id": "507f1f77bcf86cd799439011",
  "outlet_id": "507f1f77bcf86cd799439012",
  "appointment_date": "2025-01-15T00:00:00Z",
  "start_time": "14:30",
  "end_time": "15:30",
  "status": "confirmed",
  "payment_status": "paid",
  "services": [...],
  "total_price": 75000,
  "credit_redeemed": true,
  "credit_id": "507f1f77bcf86cd799439025",
  "customer_package_id": "507f1f77bcf86cd799439020",
  "created_at": "2025-01-10T10:30:00Z"
}
Credit-Specific Response Fields:

Field	Type	Description
credit_redeemed	boolean	true if package credit was used
credit_id	string	ID of the redeemed credit record
customer_package_id	string	ID of the package from which credit was redeemed
payment_status	string	Always paid when credit is used
Credit Validation Rules¶
The system validates credits before allowing redemption:

Customer Ownership - Credit must belong to the booking customer
Service Match - Credit must be for the booked service
Available Balance - Credit must have remaining_credits > 0
Not Expired - Credit expires_at must be in the future (or null)
Payment Confirmed - Parent package must have payment_status = PAID
Tenant Isolation - Credit must belong to the same tenant
FIFO Credit Selection¶
Credits are automatically selected using First In, First Out ordering:

System finds all available credits for the customer + service
Credits ordered by expires_at ascending (closest to expiry first)
First credit in list is selected for redemption
Prevents credit waste from expiration
Example:


Customer has 3 credits for "Hair Cut" service:
- Credit A: expires 2025-02-01 (selected first - closest to expiry)
- Credit B: expires 2025-03-15
- Credit C: expires 2025-06-30
Atomic Transaction & Rollback¶
Credit redemption is atomic with appointment creation:


# Simplified flow from AppointmentService
1. Create appointment record
2. Try to redeem credit
   - If SUCCESS: Update appointment with credit_id, set payment_status=PAID
   - If FAILURE: Delete appointment (hard delete), raise error
3. Return appointment
Rollback Scenarios:

Credit already fully used
Credit expired during process
Database write failure
Concurrent redemption conflict
Error Response (Rollback):


{
  "detail": "Credit redemption failed: Credit has no remaining balance. Appointment has been cancelled."
}
Credit Redemption vs Manual Payment¶
Aspect	Credit Redemption	Manual Payment
Timing	At appointment creation	After appointment creation
Payment Status	Instant PAID	PENDING → PAID
Cost to Customer	Zero (prepaid)	Full service price
Endpoint	POST /appointments	POST /appointments/{id}/record-payment
Audit Trail	credit_id, customer_package_id	payment_id, staff who recorded
Cancellation with Credit Refund¶
When a credit-paid appointment is cancelled, the credit is automatically refunded:


# AppointmentService.cancel_appointment_with_credit_refund()
1. Get appointment
2. If credit_redeemed and credit_id:
   a. Get credit record
   b. Increment remaining_credits
   c. Decrement used_credits
   d. Update customer_package remaining_credits
   e. If package was DEPLETED, set back to ACTIVE
3. Set appointment status = CANCELLED
Refund Rules:

Credit returned to original credit record
Customer package balance updated
DEPLETED packages become ACTIVE again
Refund is immediate (no pending state)
Viewing Credit Information¶
In Appointment List¶
Credit redemption info included in list response:


{
  "items": [
    {
      "id": "507f1f77bcf86cd799439030",
      "customer_name": "Maria Rodriguez",
      "payment_status": "paid",
      "credit_redeemed": true,
      "credit_id": "507f1f77bcf86cd799439025",
      "customer_package_id": "507f1f77bcf86cd799439020",
      ...
    }
  ]
}
In Appointment Details¶
Detailed appointment response includes credit tracking:


{
  "id": "507f1f77bcf86cd799439030",
  "credit_redeemed": true,
  "credit_id": "507f1f77bcf86cd799439025",
  "customer_package_id": "507f1f77bcf86cd799439020",
  "payment_status": "paid",
  "payment_details": null,
  "fee_breakdown": null
}
Note: Credit-paid appointments have:

payment_details = null (no payment transactions)
fee_breakdown = null (fees applied at package purchase, not redemption)
Checking Customer Credit Availability¶
Before booking, check if customer has available credits:

Via Staff Portal:


GET /api/v1/staff/customer-packages/{customer_id}/credits?service_id={service_id}
Via Customer Portal:


GET /api/v1/customer/packages/my-packages
See Staff Customer Package Management for details.

Error Handling¶
No Available Credits:


{
  "detail": "No available credits for service 'Hair Styling'. Customer has no valid, unexpired credits for this service."
}
Invalid Package ID:


{
  "detail": "Customer package not found or does not belong to customer"
}
Credit Already Redeemed:


{
  "detail": "Credit redemption failed: Credit has no remaining balance. Appointment has been cancelled."
}
Expired Credit:


{
  "detail": "Credit redemption failed: Credit has expired. Appointment has been cancelled."
}
Frontend UI Suggestions¶
Use Case 1: Staff Booking with Credit Option¶
Scenario: Staff member creates appointment for customer who has package credits.

Recommended UI Flow:


┌─────────────────────────────────────────────────────────────┐
│  📅 New Appointment                                         │
├─────────────────────────────────────────────────────────────┤
│  Customer: [John Doe ▼]                                     │
│  Service:  [Hair Cut & Style ▼]                             │
│  Staff:    [Jane Smith ▼]                                   │
│  Date:     [2025-01-20]  Time: [14:30]                      │
├─────────────────────────────────────────────────────────────┤
│  💳 Payment Method                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✨ Use Package Credit                               │    │
│  │    Hair Care Premium Package                        │    │
│  │    3 credits remaining • Expires Feb 15, 2025       │    │
│  │    ⚠️ Expiring soon - use within 25 days           │    │
│  └─────────────────────────────────────────────────────┘    │
│  ○ Pay at checkout (IDR 75,000)                             │
│  ○ Send payment link                                        │
├─────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Book Appointment]   │
└─────────────────────────────────────────────────────────────┘
Implementation Steps:

On Customer Selection - Fetch available credits:


// When customer is selected
const credits = await fetch(
  `/api/v1/staff/customer-packages/${customerId}/credits?service_id=${serviceId}`
);
Display Credit Option - Show only if credits available:


if (credits.length > 0) {
  // Show "Use Package Credit" option
  // Display package name, remaining credits, expiry
  // Highlight if is_expiring_soon = true
}
On Submit - Include credit fields:


const appointmentData = {
  customer_id: customerId,
  outlet_id: outletId,
  appointment_date: date,
  start_time: time,
  services: [{ service_id, staff_id }],
  // Credit redemption fields
  credit_redeemed: useCredit,
  customer_package_id: selectedPackageId,
  notes: "Using package credit"
};
Handle Response - Show success with credit info:


// Success response includes credit_id
toast.success(`Appointment booked! Credit redeemed from ${packageName}`);
// Optionally show remaining credits after booking
Use Case 2: Customer Self-Service Booking¶
Scenario: Customer books appointment on customer portal with their package credits.

Recommended UI Flow:


┌─────────────────────────────────────────────────────────────┐
│  🗓️ Book Appointment                                        │
├─────────────────────────────────────────────────────────────┤
│  Service: Hair Cut & Style                                  │
│  Duration: 60 minutes                                       │
│  Price: IDR 75,000                                          │
├─────────────────────────────────────────────────────────────┤
│  ✨ YOU HAVE CREDITS FOR THIS SERVICE!                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📦 Hair Care Premium Package                       │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3/5 used       │    │
│  │  2 credits remaining                                │    │
│  │  Expires: Feb 15, 2025 (25 days)                    │    │
│  │                                                     │    │
│  │  [Use 1 Credit - FREE] ← Primary CTA                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Or pay IDR 75,000 →                                        │
├─────────────────────────────────────────────────────────────┤
│  Select Date & Time:                                        │
│  [Calendar Component]                                       │
├─────────────────────────────────────────────────────────────┤
│                                      [Confirm Booking]      │
└─────────────────────────────────────────────────────────────┘
Implementation Steps:

Fetch Credits on Service Selection:


// Customer portal - fetch own credits
const myPackages = await fetch('/api/v1/customer/packages/my-packages');
const creditsForService = myPackages.filter(
  pkg => pkg.credits.some(c => c.service_id === serviceId && c.remaining > 0)
);
Prominent Credit Display:


{hasCredits && (
  <CreditBanner variant="success">
    <PackageIcon />
    <div>
      <h4>You have credits for this service!</h4>
      <p>{remainingCredits} credits from {packageName}</p>
      {isExpiringSoon && <WarningBadge>Expires soon</WarningBadge>}
    </div>
    <Button primary onClick={() => setUseCredit(true)}>
      Use Credit - FREE
    </Button>
  </CreditBanner>
)}
Confirmation Screen:


┌─────────────────────────────────────────────────────┐
│  ✅ Booking Confirmed!                              │
│                                                     │
│  Hair Cut & Style with Jane Smith                   │
│  Jan 20, 2025 at 2:30 PM                            │
│                                                     │
│  Payment: ✨ Package Credit Used                    │
│  Status: PAID                                       │
│                                                     │
│  📦 Hair Care Premium Package                       │
│     1 credit remaining after this booking           │
└─────────────────────────────────────────────────────┘
Use Case 3: Appointment List with Credit Indicators¶
Scenario: Staff views appointment list showing which appointments used credits.

Recommended UI:


┌──────────────────────────────────────────────────────────────────────┐
│  📋 Today's Appointments                              [+ New]        │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 10:00 AM  John Doe           Hair Cut        💳 IDR 75,000    │  │
│  │           Jane Smith         Confirmed       [View] [Check-in] │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 11:30 AM  Maria Rodriguez    Manicure        ✨ Credit Used    │  │
│  │           Alice Wong         Confirmed       [View] [Check-in] │  │
│  │           📦 Spa Bundle Package                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 2:00 PM   Sarah Chen         Facial          ⏳ Payment Pending│  │
│  │           Lisa Park          Pending         [View] [Send Link]│  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
Implementation:


// Appointment list item component
const AppointmentCard = ({ appointment }) => {
  const paymentBadge = () => {
    if (appointment.credit_redeemed) {
      return (
        <Badge variant="purple">
          <SparklesIcon /> Credit Used
        </Badge>
      );
    }
    if (appointment.payment_status === 'paid') {
      return <Badge variant="green">💳 {formatPrice(appointment.total_price)}</Badge>;
    }
    return <Badge variant="yellow">⏳ Payment Pending</Badge>;
  };

  return (
    <Card>
      <TimeSlot>{appointment.start_time}</TimeSlot>
      <CustomerName>{appointment.customer_name}</CustomerName>
      <ServiceName>{appointment.services[0].service_name}</ServiceName>
      {paymentBadge()}
      {appointment.credit_redeemed && (
        <PackageInfo>📦 {appointment.package_name}</PackageInfo>
      )}
    </Card>
  );
};
Use Case 4: Appointment Detail with Credit Information¶
Scenario: Staff views appointment detail showing credit redemption info.

Recommended UI:


┌─────────────────────────────────────────────────────────────┐
│  📅 Appointment Details                          [Edit] [×] │
├─────────────────────────────────────────────────────────────┤
│  Customer: Maria Rodriguez                                  │
│  Service:  Manicure (60 min)                                │
│  Staff:    Alice Wong                                       │
│  Date:     Jan 20, 2025 at 11:30 AM                         │
│  Status:   ● Confirmed                                      │
├─────────────────────────────────────────────────────────────┤
│  💳 Payment Information                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Status: ✅ PAID                                    │    │
│  │  Method: ✨ Package Credit                          │    │
│  │                                                     │    │
│  │  📦 Spa Relaxation Bundle                           │    │
│  │  ├─ Credit ID: 507f1f77bcf86cd799439025             │    │
│  │  ├─ Package ID: 507f1f77bcf86cd799439020            │    │
│  │  └─ Purchased: Jan 5, 2025                          │    │
│  │                                                     │    │
│  │  ℹ️ No payment transaction - prepaid via package    │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  [Cancel Appointment]  [Mark Complete]  [Mark No-Show]      │
│                                                             │
│  ⚠️ Cancelling will refund the credit to customer's package │
└─────────────────────────────────────────────────────────────┘
Implementation:


const PaymentSection = ({ appointment }) => {
  if (appointment.credit_redeemed) {
    return (
      <PaymentCard>
        <StatusBadge status="paid">✅ PAID</StatusBadge>
        <MethodBadge>✨ Package Credit</MethodBadge>

        <PackageDetails>
          <PackageIcon />
          <div>
            <h4>{appointment.package_name || 'Package'}</h4>
            <DetailRow>
              <Label>Credit ID:</Label>
              <Code>{appointment.credit_id}</Code>
            </DetailRow>
            <DetailRow>
              <Label>Package ID:</Label>
              <Code>{appointment.customer_package_id}</Code>
            </DetailRow>
          </div>
        </PackageDetails>

        <InfoNote>
          ℹ️ No payment transaction - prepaid via package
        </InfoNote>
      </PaymentCard>
    );
  }

  // Regular payment display...
  return <RegularPaymentSection appointment={appointment} />;
};
Use Case 5: Cancel Credit-Paid Appointment¶
Scenario: Staff cancels appointment and credit is refunded.

Recommended UI Flow:


┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Cancel Appointment                                      │
├─────────────────────────────────────────────────────────────┤
│  You are about to cancel this appointment:                  │
│                                                             │
│  Customer: Maria Rodriguez                                  │
│  Service:  Manicure                                         │
│  Date:     Jan 20, 2025 at 11:30 AM                         │
├─────────────────────────────────────────────────────────────┤
│  💳 Credit Refund Notice                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  This appointment was paid with a package credit.   │    │
│  │                                                     │    │
│  │  ✅ Credit will be automatically refunded to:       │    │
│  │     📦 Spa Relaxation Bundle                        │    │
│  │     Current: 2 credits → After: 3 credits           │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Cancellation Reason: [Required field                    ]  │
│                                                             │
│                    [Keep Appointment]  [Cancel & Refund]    │
└─────────────────────────────────────────────────────────────┘
After Cancellation:


┌─────────────────────────────────────────────────────────────┐
│  ✅ Appointment Cancelled                                   │
├─────────────────────────────────────────────────────────────┤
│  The appointment has been cancelled successfully.           │
│                                                             │
│  💳 Credit Refund Complete                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✅ 1 credit refunded to Spa Relaxation Bundle      │    │
│  │  Maria Rodriguez now has 3 credits remaining        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                                           [Back to List]    │
└─────────────────────────────────────────────────────────────┘
UI Component Library Suggestions¶
Credit Badge Component:


// Reusable component for showing credit payment status
const CreditBadge = ({ appointment }) => {
  if (!appointment.credit_redeemed) return null;

  return (
    <Badge
      variant="purple"
      icon={<SparklesIcon />}
      tooltip={`Credit from ${appointment.package_name}`}
    >
      Credit Used
    </Badge>
  );
};
Credit Availability Indicator:


// Show in service selection when customer has credits
const CreditAvailabilityBanner = ({ credits, serviceName }) => {
  if (!credits?.length) return null;

  const firstCredit = credits[0]; // FIFO - will be used first

  return (
    <Banner variant={firstCredit.is_expiring_soon ? 'warning' : 'success'}>
      <SparklesIcon />
      <div>
        <strong>You have {firstCredit.remaining_credits} credits for {serviceName}</strong>
        <p>From: {firstCredit.package_name}</p>
        {firstCredit.is_expiring_soon && (
          <WarningText>⚠️ Expires {formatDate(firstCredit.expires_at)}</WarningText>
        )}
      </div>
      <Button onClick={onUseCredit}>Use Credit</Button>
    </Banner>
  );
};
Payment Method Selector:


// Radio group for payment method selection
const PaymentMethodSelector = ({ credits, price, onChange }) => (
  <RadioGroup onChange={onChange}>
    {credits?.length > 0 && (
      <RadioOption
        value="credit"
        label="Use Package Credit"
        description={`${credits[0].remaining_credits} credits from ${credits[0].package_name}`}
        badge={<Badge variant="green">FREE</Badge>}
        highlighted
      />
    )}
    <RadioOption
      value="pay_later"
      label="Pay at checkout"
      description={formatPrice(price)}
    />
    <RadioOption
      value="payment_link"
      label="Send payment link"
      description="Customer pays online"
    />
  </RadioGroup>
);
State Management Recommendations¶

// Zustand/Redux store shape for appointment booking with credits
interface BookingState {
  // Customer & Service Selection
  customerId: string | null;
  serviceId: string | null;
  staffId: string | null;

  // Credit Information (fetched when customer+service selected)
  availableCredits: Credit[];
  selectedCredit: Credit | null;

  // Payment Method
  paymentMethod: 'credit' | 'pay_later' | 'payment_link';

  // Actions
  fetchCredits: (customerId: string, serviceId: string) => Promise<void>;
  selectCredit: (credit: Credit) => void;
  clearCredits: () => void;
}

// Fetch credits when both customer and service are selected
useEffect(() => {
  if (customerId && serviceId) {
    bookingStore.fetchCredits(customerId, serviceId);
  } else {
    bookingStore.clearCredits();
  }
}, [customerId, serviceId]);
Error Handling UI¶

// Handle credit redemption errors gracefully
const handleBookingError = (error) => {
  if (error.detail?.includes('No available credits')) {
    toast.error('Credit Unavailable', {
      description: 'The credit may have been used or expired. Please select a different payment method.',
      action: {
        label: 'Refresh Credits',
        onClick: () => refetchCredits()
      }
    });
  } else if (error.detail?.includes('Credit redemption failed')) {
    toast.error('Booking Failed', {
      description: 'Credit redemption failed. The booking was not created. Please try again.',
    });
  } else {
    toast.error('Booking Error', { description: error.detail });
  }
};
Best Practices¶
✅ DO:

Check credit availability before showing redemption option to customer
Display expiring credits prominently (use is_expiring_soon flag)
Inform customers which credit will be used (FIFO order)
Handle rollback errors gracefully in UI
Show credit balance after successful booking
❌ DON'T:

Allow credit redemption for services not in the package
Skip validation of customer package ownership
Assume credit is available without checking
Ignore expired credits in availability check
Mix credit redemption with manual payment for same appointment
Testing Checklist¶
[ ] Create appointment with valid credit redemption
[ ] Reject redemption when no credits available
[ ] Reject redemption for wrong service
[ ] Reject redemption with expired credits
[ ] Verify FIFO ordering selects oldest credit
[ ] Verify atomic rollback on failure
[ ] Verify payment_status = PAID after credit use
[ ] Cancel credit-paid appointment and verify refund
[ ] Verify DEPLETED package becomes ACTIVE after refund
[ ] List appointments shows credit_redeemed flag
[ ] Appointment details shows credit_id
Business Rules Summary¶
Scheduling Constraints¶
Business Hours - Appointments must be within outlet operating hours
Advance Booking - Configurable minimum/maximum advance booking days
Minimum Notice - Minimum time before appointment (e.g., 2 hours)
Duration Validation - Appointment duration must fit within working hours
Duplicate Prevention - Same customer cannot book identical service+staff+time combination
Staff Assignment¶
Skill Matching - Staff must have required skills for service
Load Balancing - Auto-assignment distributes bookings evenly
Availability Check - Staff working hours and time-off respected
Conflict Prevention - No double-booking allowed
Duplicate Detection - Customer cannot book same service+staff+time twice
Payment Rules¶
Payment Verification - Required before marking appointment as completed
Platform Fees - Applied based on subscription tier (3-8%)
✨ Partial Payments - Supports multiple partial payments until fully paid (manual payments)
Cumulative Tracking - paid_amount tracks cumulative total across all payments
Overpayment Prevention - Each payment validated against remaining balance
Offline Methods - Manual payment limited to cash, POS, bank transfer
Online Methods - Paper.id payment link for online payments
✨ Package Credits - Prepaid credits can be used at appointment creation (instant PAID status)
Credit Refunds - Cancelled credit-paid appointments automatically refund credits
Status Transitions¶

PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
            ↓              ↓
        CANCELLED      NO_SHOW
Valid Transitions:

PENDING → CONFIRMED (manual or webhook)
CONFIRMED → COMPLETED (with payment verification)
CONFIRMED → NO_SHOW (customer didn't arrive)
CONFIRMED → CANCELLED (with reason)
IN_PROGRESS → COMPLETED (with payment verification)
Invalid Transitions:

Cannot update COMPLETED appointments
Cannot update CANCELLED appointments
Cannot confirm NO_SHOW appointments
Cannot complete without payment (for paid appointments)
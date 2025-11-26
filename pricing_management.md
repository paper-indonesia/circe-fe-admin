Pricing Management¶
Complete guide to managing service pricing, promotional campaigns, outlet-specific pricing, and pricing hierarchy in the Reserva platform.

Overview¶
The pricing management system provides flexible multi-tier pricing with support for:

Base Pricing - Default price for all outlets
Promotional Pricing - Time-limited discounts with automatic expiration
Outlet-Specific Pricing - Location-based price overrides
Automatic Price Calculation - Server-authoritative pricing prevents client manipulation
Price History Tracking - Audit trail for all pricing changes
Multi-Currency Support - Currency configuration per tenant
📖 Related: Service Management for creating and managing services with pricing configuration.

Key Concepts:

Pricing Hierarchy = Promotional → Outlet-Specific → Base (priority order)
Server-Authoritative = All prices calculated server-side (security feature)
Time-Limited Promotions = Automatic validation against promotional_valid_until
Outlet Override = Location-specific pricing for multi-outlet businesses
Global Promotion = Promotional price applies to ALL outlets when valid
Pricing Hierarchy¶
The system evaluates prices in strict priority order (highest to lowest):

1. Promotional Price (if valid and not expired)
   ↓
2. Outlet-Specific Price (if outlet context provided)
   ↓
3. Base Price (final fallback)
Priority Rules¶
Priority	Price Type	Condition	Applies To	Example
1 (Highest)	Promotional	Valid date range	All outlets globally	Flash sale: 75 IDR (was 100 IDR)
2 (Medium)	Outlet-Specific	Outlet ID provided	Single outlet only	Downtown: 85 IDR, Uptown: 110 IDR
3 (Lowest)	Base Price	Always available	All outlets by default	Regular: 100 IDR
Important: Promotional price takes precedence even if outlet-specific pricing is set. This ensures consistent promotional campaigns across all locations.

Quick Navigation¶
Topic	Link
Create service with base price	Service Management - Create Service
Set outlet-specific pricing	Service Management - Set Outlet Pricing
Update service pricing	Service Management - Update Service
View service pricing details	Service Management - Get Service Details
Browse services with prices	Service Management - List Services
Service categories	Service Management - Get Service Categories
Subscription pricing limits	Service Management - Subscription Limits
Pricing Scenarios¶
Scenario 1: Base Price Only¶
Configuration:

{
  "pricing": {
    "base_price": 100000,
    "currency": "IDR",
    "outlet_prices": {},
    "promotional_price": null,
    "promotional_valid_until": null
  }
}
Result:

All outlets: 100,000 IDR
All time periods: 100,000 IDR
Simplest configuration for single-location businesses
Scenario 2: Outlet-Specific Pricing¶
Configuration:

{
  "pricing": {
    "base_price": 100000,
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": 85000,  // Downtown (discounted)
      "68e4d035886b6f295471fd52": 110000  // Uptown (premium)
    },
    "promotional_price": null,
    "promotional_valid_until": null
  }
}
Result:

Outlet	Price	Reason
Downtown	85,000 IDR	Outlet override (discounted)
Uptown	110,000 IDR	Outlet override (premium)
Other outlets	100,000 IDR	Base price fallback
No outlet context	100,000 IDR	Base price fallback
Use Case: Multi-location businesses with different cost structures (rent, demographics, competition).

Scenario 3: Valid Promotional Price¶
Configuration:

{
  "pricing": {
    "base_price": 100000,
    "currency": "IDR",
    "outlet_prices": {},
    "promotional_price": 75000,
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  }
}
Result (before Dec 31, 2025):

All outlets: 75,000 IDR ✅ (Promo active)
All time periods: 75,000 IDR ✅ (Promo active)
Result (after Dec 31, 2025):

All outlets: 100,000 IDR (Promo expired → fallback to base)
Use Case: Holiday sales, grand opening discounts, customer acquisition campaigns.

Scenario 4: Promotional vs Outlet Pricing¶
Configuration:

{
  "pricing": {
    "base_price": 100000,
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": 85000
    },
    "promotional_price": 70000,
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  }
}
Result (before Dec 31, 2025):

Outlet	Configured Outlet Price	Actual Price Applied	Winner
Downtown	85,000 IDR	70,000 IDR	✅ Promotional (priority 1)
Other outlets	—	70,000 IDR	✅ Promotional (priority 1)
Result (after Dec 31, 2025):

Outlet	Configured Outlet Price	Actual Price Applied	Winner
Downtown	85,000 IDR	85,000 IDR	✅ Outlet (priority 2)
Other outlets	—	100,000 IDR	✅ Base (priority 3)
Business Rule: Promotional pricing ALWAYS wins to ensure consistent marketing campaigns across all locations. After expiration, outlet pricing resumes.

Scenario 5: Expired Promotional Price¶
Configuration:

{
  "pricing": {
    "base_price": 100000,
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": 85000
    },
    "promotional_price": 75000,
    "promotional_valid_until": "2025-01-01T23:59:59Z"  // Past date
  }
}
Result (after Jan 1, 2025):

Outlet	Price Applied	Reason
Downtown	85,000 IDR	Promo expired → outlet override
Other outlets	100,000 IDR	Promo expired → base price
Automatic Behavior: System automatically checks promotion validity on every price request. No manual deactivation needed.

Service Pricing Model¶
ServicePricing Schema¶
class ServicePricing(BaseModel):
    """Pricing configuration for a service."""

    base_price: Decimal = Field(
        ...,
        ge=0,
        description="Base price (default across all outlets)"
    )

    currency: str = Field(
        default="USD",
        min_length=3,
        max_length=3,
        description="Currency code (ISO 4217)"
    )

    outlet_prices: Dict[str, Decimal] = Field(
        default_factory=dict,
        description="Outlet-specific price overrides {outlet_id: price}"
    )

    promotional_price: Optional[Decimal] = Field(
        default=None,
        ge=0,
        description="Special promotional price (time-limited)"
    )

    promotional_valid_until: Optional[datetime] = Field(
        default=None,
        description="Promotional price expiry date (UTC)"
    )
Example Service Document¶
{
  "id": "68e63f26241da4ebe30521c8",
  "tenant_id": "68e4cfe3886b6f295471fd4c",
  "name": "Premium Therapy Treatment",
  "slug": "premium-therapy",
  "category": "therapy",
  "duration_minutes": 90,
  "pricing": {
    "base_price": "175000.0",
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": "150000.0",
      "68e4d035886b6f295471fd52": "180000.0"
    },
    "promotional_price": "125000.0",
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  },
  "is_active": true,
  "status": "active"
}
Setting Service Pricing¶
📖 See Also: Service Management - Create Service for complete service creation workflow.

Create Service with Base Price¶
Endpoint:

POST /api/v1/services
Request Body:

{
  "tenant_id": "68e4cfe3886b6f295471fd4c",
  "name": "Premium Facial Treatment",
  "slug": "premium-facial",
  "description": "Luxurious 90-minute facial with premium products",
  "category": "facial",
  "duration_minutes": 90,
  "pricing": {
    "base_price": 175000,
    "currency": "IDR"
  }
}
Response:

{
  "id": "68e62f10466a23cf66a8ffb6",
  "pricing": {
    "base_price": "175000.0",
    "currency": "IDR",
    "outlet_prices": {},
    "promotional_price": null,
    "promotional_valid_until": null
  }
}
Set Outlet-Specific Pricing¶
Configure location-based pricing after service creation.

📖 See Also: Service Management - Set Outlet-Specific Pricing for access control and subscription requirements.

Endpoint:

POST /api/v1/services/{service_id}/pricing
Authentication: Required (TENANT_ADMIN or OUTLET_MANAGER)

Request Body:

{
  "outlet_prices": {
    "68e4d035886b6f295471fd51": 150000,
    "68e4d035886b6f295471fd52": 180000
  }
}
Response:

{
  "id": "68e63f26241da4ebe30521c8",
  "pricing": {
    "base_price": "175000.0",
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": "150000.0",
      "68e4d035886b6f295471fd52": "180000.0"
    },
    "promotional_price": null,
    "promotional_valid_until": null
  }
}
Business Rules:

OUTLET_MANAGER can only set prices for outlets they manage
TENANT_ADMIN can set prices for any outlet
Outlet prices are stored as dictionary {outlet_id: price}
Outlet IDs must be valid ObjectId format
Prices must be positive values
Set Promotional Pricing¶
Configure time-limited promotional pricing for marketing campaigns.

📖 See Also: Service Management - Update Service for complete update endpoint documentation.

Endpoint:

PUT /api/v1/services/{service_id}
Request Body:

{
  "pricing": {
    "base_price": 175000,
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": 150000
    },
    "promotional_price": 125000,
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  }
}
Response:

{
  "id": "68e63f26241da4ebe30521c8",
  "pricing": {
    "base_price": "175000.0",
    "currency": "IDR",
    "outlet_prices": {
      "68e4d035886b6f295471fd51": "150000.0"
    },
    "promotional_price": "125000.0",
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  }
}
Promotional Pricing Guidelines:

✅ DO:

Set realistic expiration dates (not too far in future)
Use promotional pricing for marketing campaigns
Communicate promotion clearly to customers
Monitor booking rates during promotion
Set promotional_price lower than base_price
❌ DON'T:

Set promotional_price higher than base_price (confusing)
Use indefinite promotions (defeats purpose)
Forget to remove expired promotions (automatic, but clean data)
Set conflicting promotional periods
Server-Authoritative Pricing¶
Security Architecture¶
All appointment creation endpoints calculate prices server-side to prevent client manipulation.

📖 See Also:

Service Management - Get Service Details to view pricing configuration
Service Management - List Services for browsing services with pricing
Flow:

Client Request - Customer/staff submits appointment with service IDs
Server Validation - System fetches service from database
Price Calculation - PricingService applies hierarchy (promotional → outlet → base)
Price Override - Client-provided prices are ignored and overwritten
Appointment Creation - Appointment created with server-calculated price
Implementation¶
Staff Portal: Create Appointment

# Step 0: Auto-populate price from service catalog
for service_item in appointment_data.services:
    service = await service_crud.get(str(service_item.service_id))

    # SECURITY: Always use server-calculated price
    server_price = await pricing_service.get_service_price(
        service_id=service_item.service_id,
        outlet_id=appointment_data.outlet_id,  # Context for outlet pricing
        tenant_id=current_tenant.id
    )
    service_item.price = server_price  # Overwrite any client price
Customer Portal: Create Appointment

# Auto-populate service details from catalog
for svc in appointment_data.services:
    # SECURITY: Always use server-calculated price (ignore client-provided)
    server_price = await pricing_service.get_service_price(
        service_id=svc.service_id,
        outlet_id=appointment_data.outlet_id,
        tenant_id=current_customer.tenant_id
    )
    svc.price = server_price  # Unconditionally overwrite
Benefits:

✅ Prevents price manipulation attacks
✅ Ensures promotional pricing always applied correctly
✅ Guarantees outlet pricing consistency
✅ No client-side price calculation needed
✅ Automatic expiration handling
PricingService API¶
Core Method: get_service_price()¶
Calculates effective price for a service with automatic hierarchy evaluation.

Method Signature:

async def get_service_price(
    self,
    service_id: str | ObjectId,
    outlet_id: Optional[str | ObjectId] = None,
    tenant_id: Optional[str | ObjectId] = None
) -> Decimal
Parameters:

service_id (required) - Service to price
outlet_id (optional) - Outlet context for location-based pricing
tenant_id (optional) - Tenant context for validation
Returns: Decimal - Effective price based on hierarchy

Pricing Logic:

# Priority 1: Check promotional pricing (global, highest priority)
if service.pricing.promotional_price and service.pricing.promotional_valid_until:
    if datetime.utcnow() < service.pricing.promotional_valid_until:
        return promotional_price  # WINNER: Promotion active

# Priority 2: Check outlet-specific pricing
if outlet_id and service.pricing.outlet_prices:
    outlet_price = service.pricing.outlet_prices.get(str(outlet_id))
    if outlet_price is not None:
        return outlet_price  # WINNER: Outlet override

# Priority 3: Return base price (final fallback)
return service.pricing.base_price  # WINNER: Default price
Logging:

The service logs pricing decisions for audit and debugging:

# Example log output
[PricingService] get_service_price | Tenant: 68e4cfe3886b6f295471fd4c | Details: {
  'service': '68e63f26241da4ebe30521c8',
  'outlet': '68e4d035886b6f295471fd51',
  'price': 125000.0,
  'source': 'promotional_price',
  'valid_until': '2025-12-31T23:59:59Z'
}
Source Types:

promotional_price - Promotional pricing applied (priority 1)
outlet_override - Outlet-specific pricing applied (priority 2)
base_price - Base price fallback applied (priority 3)
Manual Testing Procedures¶
Test Case 1: Verify Base Pricing¶
Setup: 1. Create service with base_price: 100,000 IDR 2. No outlet pricing, no promotional pricing

API Call:

curl -X POST http://localhost:8000/api/v1/staff/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "68e123...",
    "outlet_id": "68e456...",
    "appointment_date": "2025-11-15",
    "start_time": "14:00",
    "services": [{
      "service_id": "68e789...",
      "staff_id": "68eabc...",
      "duration_minutes": 60
    }]
  }'
Verification:

# Check appointment price
curl http://localhost:8000/api/v1/staff/appointments/{appointment_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Expected:

{
  "services": [{
    "service_id": "68e789...",
    "price": 100000.0,
    "service_name": "Your Service"
  }],
  "total_price": 100000.0
}
Test Case 2: Verify Outlet-Specific Pricing¶
Setup:

Set outlet pricing for Downtown: 85,000 IDR
Set outlet pricing for Uptown: 110,000 IDR
API Call (Downtown):

curl -X POST http://localhost:8000/api/v1/staff/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "68e123...",
    "outlet_id": "68e4d035886b6f295471fd51",  # Downtown outlet ID
    "appointment_date": "2025-11-15",
    "start_time": "14:00",
    "services": [{
      "service_id": "68e789...",
      "staff_id": "68eabc..."
    }]
  }'
Expected: Downtown appointment price: 85,000 IDR

API Call (Uptown):

# Same call but with Uptown outlet_id: 68e4d035886b6f295471fd52
Expected: Uptown appointment price: 110,000 IDR

Test Case 3: Verify Promotional Pricing¶
Setup: 1. Update service with promotional pricing:

curl -X PUT http://localhost:8000/api/v1/services/68e789... \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "base_price": 100000,
      "currency": "IDR",
      "promotional_price": 75000,
      "promotional_valid_until": "2025-12-31T23:59:59Z"
    }
  }'
Create appointment at Downtown outlet (which has outlet price: 85,000 IDR)
Expected Result:

Appointment price: 75,000 IDR (promo beats outlet price)
Log output: 'source': 'promotional_price'
Verification After Expiration:

Wait until promotional_valid_until passes (or manually set past date)
Create new appointment at Downtown outlet
Expected Result:

Appointment price: 85,000 IDR (expired promo → outlet override)
Log output: 'source': 'outlet_override'
Price Change Management¶
Updating Service Pricing¶
Important: Price changes only affect new appointments. Existing appointments retain their original pricing.

Update Base Price:

curl -X PUT http://localhost:8000/api/v1/services/{service_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "base_price": 120000,
      "currency": "IDR"
    }
  }'
Update Outlet Pricing:

curl -X POST http://localhost:8000/api/v1/services/{service_id}/pricing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_prices": {
      "68e4d035886b6f295471fd51": 95000,
      "68e4d035886b6f295471fd52": 125000
    }
  }'
Add Promotional Pricing:

curl -X PUT http://localhost:8000/api/v1/services/{service_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "promotional_price": 80000,
      "promotional_valid_until": "2025-12-31T23:59:59Z"
    }
  }'
Remove Promotional Pricing:

curl -X PUT http://localhost:8000/api/v1/services/{service_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "promotional_price": null,
      "promotional_valid_until": null
    }
  }'
Best Practices¶
For Base Pricing¶
✅ DO:

Set competitive base prices based on market research
Update prices annually for inflation
Consider service value and duration when pricing
Use round numbers for customer convenience (e.g., 100,000 not 99,750)
❌ DON'T:

Change base prices too frequently (confuses customers)
Set base price lower than cost (unsustainable)
Forget to communicate price changes to existing customers
For Outlet-Specific Pricing¶
📖 See: Service Management - Set Outlet-Specific Pricing for API endpoint and subscription requirements.

✅ DO:

Use outlet pricing for location-based cost differences
Set higher prices in premium locations
Set lower prices in new/smaller locations
Document reasoning for outlet price differences
❌ DON'T:

Create huge price disparities between outlets (customer confusion)
Set outlet prices drastically different from base without reason
Forget to update outlet prices when base price changes
Example Strategy:

Base Price: 100,000 IDR (standard)
Downtown (Premium Mall): +10% = 110,000 IDR (higher rent, premium clientele)
Suburban: -15% = 85,000 IDR (lower rent, price-sensitive customers)
New Location: -20% = 80,000 IDR (promotional pricing for first 6 months)
For Promotional Pricing¶
✅ DO:

Set clear start and end dates for promotions
Use promotional pricing for customer acquisition
Run promotions during slow periods to boost bookings
Promote heavily via email, social media, in-store signage
Track booking rate increase during promotion
Set promotional_price significantly lower than base (20-40% off)
❌ DON'T:

Run indefinite promotions (devalues service)
Set promotional_price too close to base price (not compelling)
Forget to communicate promotion expiration date
Extend promotions repeatedly (trains customers to wait)
Campaign Planning:

Campaign Type	Discount	Duration	Use Case
Flash Sale	30-50% off	24-48 hours	Urgency marketing, clear inventory
Holiday Promo	20-30% off	1-2 weeks	Christmas, New Year, Valentine's
New Customer	25-40% off	Ongoing	First-time customer acquisition
Loyalty Reward	15-25% off	1 week	Thank existing customers
Off-Peak	20-35% off	Weekday mornings	Fill slow time slots
Integration Examples¶
Customer Booking Flow¶
📖 See: Service Management - List Services for complete filtering and search options.

1. Browse Services with Prices:

GET /api/v1/customer/services?outlet_id=68e4d035886b6f295471fd51
Response:

{
  "items": [{
    "id": "68e63f26241da4ebe30521c8",
    "name": "Premium Therapy Treatment",
    "price": "125000.0",  // Promotional price (if valid)
    "currency": "IDR",
    "duration_minutes": 90
  }]
}
2. Create Appointment:

POST /api/v1/customer/appointments
Request:

{
  "outlet_id": "68e4d035886b6f295471fd51",
  "appointment_date": "2025-11-15",
  "start_time": "14:00",
  "services": [{
    "service_id": "68e63f26241da4ebe30521c8",
    "staff_id": "68e61599f4ae9d40e4d8a614"
  }]
}
Response:

{
  "id": "690f6e2c5d47aa89b5f123ab",
  "services": [{
    "service_id": "68e63f26241da4ebe30521c8",
    "price": 125000.0,  // Server-calculated promotional price
    "service_name": "Premium Therapy Treatment"
  }],
  "total_price": 125000.0,  // Automatic calculation
  "status": "pending",
  "payment_status": "pending"
}
3. Customer Sees Promotion in UI:

Premium Therapy Treatment
Regular: Rp 175,000  [strikethrough]
SALE: Rp 125,000  [highlighted, red text]
Save 29%! Ends Dec 31
Staff Dashboard - Pricing Management¶
📖 See: Service Management - Get Service Details and Update Service for complete service management.

1. View Current Pricing:

GET /api/v1/services/68e63f26241da4ebe30521c8
2. Set Promotional Campaign:

// Frontend form
{
  promotionalPrice: 125000,
  validUntil: "2025-12-31",
  reason: "Holiday Sale 2025"
}

// API call
PUT /api/v1/services/68e63f26241da4ebe30521c8
{
  "pricing": {
    "promotional_price": 125000,
    "promotional_valid_until": "2025-12-31T23:59:59Z"
  }
}
3. Monitor Promotion Performance:

# Get bookings during promotion period
GET /api/v1/staff/appointments?service_id=68e63f26...&date_from=2025-11-01&date_to=2025-12-31

# Compare to previous period
GET /api/v1/staff/appointments?service_id=68e63f26...&date_from=2025-10-01&date_to=2025-10-31
Troubleshooting¶
Issue 1: Wrong Price Applied¶
Symptoms: Appointment created with unexpected price

Debug Steps:

Check service pricing configuration:

curl http://localhost:8000/api/v1/services/{service_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.pricing'
Review server logs for pricing decision:

[PricingService] get_service_price | Details: {
  'service': '68e789...',
  'outlet': '68e456...',
  'price': 125000.0,
  'source': 'promotional_price'  # <-- Check this
}
Verify promotion validity:

from datetime import datetime
promo_valid_until = datetime.fromisoformat("2025-12-31T23:59:59Z")
now = datetime.utcnow()
print(f"Promo valid: {now < promo_valid_until}")
Common Causes: - Promotion expired (check promotional_valid_until) - Outlet ID mismatch (check outlet_id in request) - Service configuration not saved (check database)

Issue 2: Promotional Price Not Applied¶
Symptoms: Customer still sees base price despite active promotion

Debug Steps:

Verify promotion is set:
curl http://localhost:8000/api/v1/services/{service_id} | jq '.pricing'
Expected:

{
  "promotional_price": "125000.0",
  "promotional_valid_until": "2025-12-31T23:59:59Z"
}
Check current datetime vs expiration:

# Server time
datetime.utcnow()  # Must be < promotional_valid_until

# Client time (may be different timezone!)
# Always use UTC on server
Verify PricingService is being called:

# Check logs for pricing decision
grep "get_service_price" /var/log/reserva.log
Solution:

Ensure promotional_valid_until is future date
Verify timezone consistency (always use UTC)
Check promotional_price is not null
Restart application to clear any cached service data
Issue 3: Outlet Pricing Not Working¶
Symptoms: Outlet-specific prices not being used

Debug Steps:

Verify outlet_prices configuration:

curl http://localhost:8000/api/v1/services/{service_id}/pricing
Check outlet_id in appointment request:

{
  "outlet_id": "68e4d035886b6f295471fd51"  // Must match outlet_prices keys
}
Verify outlet_id format:

from bson import ObjectId
ObjectId.is_valid("68e4d035886b6f295471fd51")  # Must be True
Common Issues:

Outlet ID typo in configuration
Outlet ID not provided in appointment request (uses base price)
Outlet prices stored as wrong data type (must be Decimal/string)
Solution:

# Re-set outlet pricing with correct outlet ID
curl -X POST http://localhost:8000/api/v1/services/{service_id}/pricing \
  -d '{"outlet_prices": {"68e4d035886b6f295471fd51": 85000}}'
API Reference Summary¶
Endpoint	Method	Purpose	Pricing Impact
/services	POST	Create service	Set base_price
/services/{id}	PUT	Update service	Update base_price, set/remove promotional
/services/{id}/pricing	POST	Set outlet pricing	Configure outlet-specific prices
/staff/appointments	POST	Create appointment (staff)	Applies pricing hierarchy
/customer/appointments	POST	Create appointment (customer)	Applies pricing hierarchy
/services?outlet_id=X	GET	Browse services	Shows effective price for outlet

Create New User
Create a new user account with role assignment and access validation.

Features:

Automatic password generation if not provided
Email uniqueness validation across tenant
Outlet assignment validation and enforcement
Role hierarchy enforcement based on creator permissions
Optional welcome email with login credentials
Default preference initialization
Access: Role-based creation permissions

SUPER_ADMIN: Can create any user with any role
TENANT_ADMIN: Can create users within their tenant (except SUPER_ADMIN)
OUTLET_MANAGER: Can create STAFF users for their managed outlets
STAFF: Cannot create users
Business Rules:

Email must be unique within the system
Users must be assigned to valid outlets within their tenant
Role assignments respect hierarchy (cannot create higher role)
Auto-generated passwords require change on first login
Outlet managers can only assign to their managed outlets
Process:

Validate role hierarchy and permissions
Check email uniqueness across system
Validate tenant and outlet assignments
Generate secure password if not provided
Create user with hashed password
Send welcome email if requested
Returns:

Complete user profile with generated ID
All assigned outlets and tenant information
Account status and security settings
Note: Generated passwords are marked for mandatory change on first login

curl -X 'POST' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "newuser@beautysalon.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "outlet_ids": [
    "507f1f77bcf86cd799439012"
  ],
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "staff",
  "send_welcome_email": false,
  "tenant_ids": [
    "507f1f77bcf86cd799439011"
  ]
}'

output:
{
  "_id": "68e4d8238ca8dce40bc608c2",
  "created_at": "2025-10-07T09:06:43.310000",
  "email": "jane@beautysalon.com",
  "email_verified": false,
  "first_name": "Jane",
  "is_active": true,
  "last_login": "2025-10-07T10:07:30.468000",
  "last_name": "Doe",
  "outlet_ids": [
    "68e4d035886b6f295471fd51"
  ],
  "phone": "+61523232243",
  "role": "staff",
  "tenant_ids": [
    "68e4cfe3886b6f295471fd4c"
  ],
  "updated_at": "2025-10-07T10:12:23.873000"
}

Update User gunakan
PUT /api/v1/users/{user_id} 
{
  "first_name": "Jane Updated",
  "phone": "+61523232243"
}

DELETE /api/v1/users/{user_id}

get summary curl -X 'GET' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/users/stats/summary' \
  -H 'accept: application/json'


  semua doc dapat dilihat di

  https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/docs#/%F0%9F%9F%A7%20User%20Management
POST
/api/v1/auth/login
Authenticate Staff User

Authenticate staff user with flexible dual-mode login support.

Features:

Tenant-specific login with direct authentication
Central login with automatic tenant selection
Multi-tenant user support for super admins
Account security with lockout protection
Access: Public endpoint

Business Rules:

Users with single tenant access get direct login
Users with multiple tenants receive selection prompt
Account locks after failed authentication attempts
Tenant-specific mode validates tenant access rights
Process:

Validate tenant slug if provided
Authenticate user credentials
Check user account status and permissions
Generate tokens for direct login or return tenant selection
Apply role-based permissions
Returns:

LoginResponse: Direct login with tokens and context
MultiTenantResponse: Tenant selection required
Note: Supports all staff roles (SUPER_ADMIN, TENANT_ADMIN, OUTLET_MANAGER, STAFF)

Input:
{
  "email": "maria@bellavista.com",
  "password": "SecurePass123!",
  "tenant_slug": "bella-vista-spa"
}

curl -X 'POST' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "maria@bellavista.com",
  "password": "SecurePass123!",
  "tenant_slug": "bella-vista-spa"
}'

Output
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTk3MzIyNDMsInN1YiI6IjY4ZTE2NmU5ZjM4Y2UwNzMxMDc2NGQ3NCIsImlhdCI6MTc1OTcyODY0MywianRpIjoiNjhlMzU0MDMwOTkzNjRlNDA1ZGVjMTczIiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoibWFyaWFAYmVsbGF2aXN0YS5jb20iLCJyb2xlIjoidGVuYW50X2FkbWluIiwidGVuYW50X2lkIjoiNjhlMTY2ZTVmMzhjZTA3MzEwNzY0ZDcyIn0.679X2MxbbztprKgefLShhMjmHxAorSa2UQJyPUu9Hz4",
  "token_type": "bearer",
  "token_type_identifier": "user",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAzMzM0NDMsInN1YiI6IjY4ZTE2NmU5ZjM4Y2UwNzMxMDc2NGQ3NCIsImlhdCI6MTc1OTcyODY0MywianRpIjoiNjhlMzU0MDMwOTkzNjRlNDA1ZGVjMTc0IiwidHlwZSI6ImFjY2VzcyIsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwidXNlcl90eXBlIjoic3RhZmYifQ.goTWsqLvNhV7CrG9uflrYAEHVoPvjgFYgfr3Y_A5MeY",
  "user": {
    "id": "68e166e9f38ce07310764d74",
    "email": "maria@bellavista.com",
    "first_name": "Maria",
    "last_name": "Rodriguez",
    "role": "tenant_admin",
    "avatar_url": null,
    "last_login": "2025-10-06T05:28:55.855000"
  },
  "tenant": {
    "id": "68e166e5f38ce07310764d72",
    "name": "Bella Vista Spa",
    "slug": "bella-vista-spa",
    "logo_url": null,
    "theme_color": null
  },
  "outlets": [],
  "access_type": "single",
  "permissions": [
    "read:tenant",
    "write:tenant",
    "admin:outlets",
    "admin:staff",
    "admin:services",
    "read:appointments",
    "write:appointments",
    "read:customers",
    "write:customers",
    "read:reports",
    "admin:settings"
  ],
  "subscription_status": null
}



POST
/api/v1/auth/complete-login
Complete Tenant Selection

Complete the multi-tenant login process with tenant selection.

Features:

Re-authentication for security
Tenant access validation
Token generation with tenant context
Role-based permission assignment
Access: Public endpoint (requires valid credentials)

Business Rules:

User must have access to selected tenant
Tenant must be active and valid
Credentials are re-validated for security
Super admins have access to all tenants
Process:

Validate selected tenant exists and is active
Re-authenticate user credentials
Verify user has access to selected tenant
Generate access and refresh tokens with tenant context
Return complete login response with permissions
Returns:

Complete user profile and session context
Access and refresh tokens
Role-based permissions for tenant
Security: Credentials are re-validated to prevent token replay attacks

input
{
  "email": "user@example.com",
  "password": "string",
  "tenant_slug": "string"
}

curl -X 'POST' \
  'https://circe-fastapi-backend-740443181568.europe-west1.run.app/api/v1/auth/complete-login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "maria@bellavista.com",
  "password": "SecurePass123!",
  "tenant_slug": "bella-vista-spa"
}'

Output:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTk3MzI0NzIsInN1YiI6IjY4ZTE2NmU5ZjM4Y2UwNzMxMDc2NGQ3NCIsImlhdCI6MTc1OTcyODg3MiwianRpIjoiNjhlMzU0ZTgwOTkzNjRlNDA1ZGVjMTc1IiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoibWFyaWFAYmVsbGF2aXN0YS5jb20iLCJyb2xlIjoidGVuYW50X2FkbWluIiwidGVuYW50X2lkIjoiNjhlMTY2ZTVmMzhjZTA3MzEwNzY0ZDcyIn0.gcrL0SWrTnaNmTuDacDjP5bCgInumQ9ruZ_7RbvQs6E",
  "token_type": "bearer",
  "token_type_identifier": "user",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAzMzM2NzIsInN1YiI6IjY4ZTE2NmU5ZjM4Y2UwNzMxMDc2NGQ3NCIsImlhdCI6MTc1OTcyODg3MiwianRpIjoiNjhlMzU0ZTgwOTkzNjRlNDA1ZGVjMTc2IiwidHlwZSI6ImFjY2VzcyIsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwidXNlcl90eXBlIjoic3RhZmYifQ.QTF5o-Eh29aPeNWGx9ihJRXu7irZ51CClHpq8O5kWBI",
  "user": {
    "id": "68e166e9f38ce07310764d74",
    "email": "maria@bellavista.com",
    "first_name": "Maria",
    "last_name": "Rodriguez",
    "role": "tenant_admin",
    "avatar_url": null,
    "last_login": "2025-10-06T05:30:42.844000"
  },
  "tenant": {
    "id": "68e166e5f38ce07310764d72",
    "name": "Bella Vista Spa",
    "slug": "bella-vista-spa",
    "logo_url": null,
    "theme_color": null
  },
  "outlets": [],
  "access_type": "single",
  "permissions": [
    "read:tenant",
    "write:tenant",
    "admin:outlets",
    "admin:staff",
    "admin:services",
    "read:appointments",
    "write:appointments",
    "read:customers",
    "write:customers",
    "read:reports",
    "admin:settings"
  ],
  "subscription_status": null
}
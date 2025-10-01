# Database Migration: Tenant to User-based Data Isolation

This document describes the migration process from tenant-based multitenancy to user-based data isolation.

## Overview

The migration removes the path-based multitenancy structure (`/[tenant]/*`) and replaces it with user-based data isolation where each user owns their data through an `ownerId` field.

## Changes Made

### 1. Database Schema Changes
- **Users**: Removed `tenantId` field
- **All Data Models**: Replaced `tenantId` with `ownerId` field
  - Patients
  - Bookings
  - Staff
  - Treatments
  - Withdrawals

### 2. API Structure Changes
- **Old**: `/api/[tenant]/endpoint`
- **New**: `/api/endpoint`
- Authentication now determines data scope automatically

### 3. Frontend Changes
- **Old**: `/[tenant]/page`
- **New**: `/page`
- Removed tenant parameters from all API calls

## Migration Process

### Prerequisites
1. **Backup your database** before running migration
2. Ensure you have Node.js installed
3. Set up environment variables (MONGODB_URI, etc.)

### Running the Migration

#### 1. Dry Run (Recommended First)
```bash
npm run migrate:user-isolation:dry-run
```
This will show you what changes would be made without actually modifying the database.

#### 2. Live Migration
```bash
npm run migrate:user-isolation -- --force
```
This will perform the actual migration. **USE WITH CAUTION!**

### Migration Script Features

- **Automatic Backups**: Creates JSON backups of all collections before migration
- **Tenant-to-User Mapping**: Maps existing tenant data to user ownership
- **Index Updates**: Replaces tenant-based indexes with user-based indexes
- **Validation**: Checks migration results for data integrity
- **Error Handling**: Logs errors and continues processing
- **Rollback Support**: Backups allow manual rollback if needed

### Data Mapping Strategy

The migration script maps tenant data to users based on:
1. Finding the first admin user for each tenant
2. Using fallback mapping for known tenants:
   - `jakarta` → Jakarta admin user
   - `bandung` → Bandung admin user
   - `default` → Default admin user

### Post-Migration Verification

After migration, verify:
1. **Authentication**: Users can log in without tenant URLs
2. **Data Access**: Users only see their own data
3. **Calendar**: Stacking bookings work correctly
4. **API Calls**: All endpoints work without tenant parameters

### Rollback Process

If you need to rollback:
1. Stop the application
2. Restore database from backups created in `./migration-backups/`
3. Revert code changes to previous version
4. Restart application

## Security Improvements

The new user-based isolation provides:
- **Better Security**: Users cannot access other users' data
- **Simplified URLs**: Clean URLs without tenant segments
- **Automatic Scoping**: All API calls automatically scoped to logged-in user
- **Ownership Verification**: Every database operation verifies ownership

## Troubleshooting

### Common Issues

1. **Migration fails with "No user mapping found"**
   - Solution: Update the `tenantToUserMapping` in the migration script

2. **Some data missing after migration**
   - Check the migration logs for errors
   - Verify tenant-to-user mapping is correct

3. **Authentication issues**
   - Clear browser cookies and localStorage
   - Ensure JWT tokens don't include tenantId

### Manual Data Updates

If needed, you can manually update data:

```javascript
// Update patients for specific user
db.patients.updateMany(
  { tenantId: "old-tenant-id" },
  { $set: { ownerId: "user-id" }, $unset: { tenantId: 1 } }
)
```

## Testing After Migration

1. **User Registration**: Create new user account
2. **Data Creation**: Add patients, staff, treatments, bookings
3. **Data Isolation**: Verify users only see their own data
4. **Calendar Features**: Test appointment creation and stacking
5. **API Security**: Verify users cannot access other users' data

## Support

If you encounter issues during migration:
1. Check migration logs in console output
2. Review backup files in `./migration-backups/`
3. Refer to the migration script comments for details
4. Consider restoring from backup and re-running migration

## Files Modified

### Database Models
- `models/User.ts` - Removed tenantId
- `models/Patient.ts` - tenantId → ownerId
- `models/Booking.ts` - tenantId → ownerId
- `models/Staff.ts` - tenantId → ownerId
- `models/Treatment.ts` - tenantId → ownerId
- `models/Withdrawal.ts` - tenant → ownerId

### API Routes
- All routes moved from `app/api/[tenant]/*` to `app/api/*`
- Updated to use user-based authentication

### Frontend Pages
- All pages moved from `app/[tenant]/*` to `app/*`
- Updated to remove tenant parameters

### Authentication
- `lib/auth.ts` - Added user-based helpers
- `lib/api-client.ts` - Removed tenant dependencies
- `lib/auth-context.tsx` - Updated interfaces

### Migration Tools
- `scripts/migrate-to-user-isolation.js` - Main migration script
- `MIGRATION.md` - This documentation
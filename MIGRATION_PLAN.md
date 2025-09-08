# Multitenancy Migration Plan

## Overview
This document outlines the migration plan for introducing multitenancy to the Beauty Clinic Admin application using dynamic routing in Next.js.

## Architecture Summary

### Tenancy Model
- **Primary**: Path-based routing (`/[tenant]/...`)
- **Secondary**: Subdomain support (`tenant.example.com`)
- **Default Tenant**: `default` for non-tenant-specific access

### Key Components
1. **Tenant Resolution** (`lib/tenant.ts`)
   - `getTenant()`: Resolves tenant from host or path
   - `getTenantFromHost()`: Extracts tenant from subdomain
   - `getTenantFromPath()`: Extracts tenant from URL path

2. **Middleware** (`middleware.ts`)
   - Intercepts all requests
   - Adds tenant headers
   - Rewrites URLs for App Router

3. **Dynamic Routes** (`app/[tenant]/...`)
   - All pages moved under tenant scope
   - Preserves existing functionality
   - Tenant-aware layouts and metadata

4. **Data Layer** (`lib/tenant-store.ts`)
   - Tenant-scoped Zustand store
   - All entities include `tenantId`
   - Filtered data access

## Migration Steps

### Phase 1: Development Setup ✅
1. ✅ Create tenant utilities
2. ✅ Implement middleware
3. ✅ Create dynamic route structure
4. ✅ Move existing pages to tenant routes
5. ✅ Update data types with tenantId
6. ✅ Create tenant-aware store

### Phase 2: Testing
1. Test with default tenant
2. Test with multiple tenants
3. Verify data isolation
4. Check routing behavior
5. Validate middleware rewrites

### Phase 3: Production Deployment
1. Deploy with feature flag
2. Gradual rollout per tenant
3. Monitor performance
4. Collect metrics

## Rollback Plan

If issues arise, rollback is straightforward:

1. **Quick Rollback**:
   - Remove middleware.ts
   - Move pages from `app/[tenant]/` back to `app/`
   - Remove tenant fields from types

2. **Data Rollback**:
   - Data remains compatible (tenantId can be ignored)
   - No database migrations needed (using mock API)

## Test Checklist

### Unit Tests
```typescript
// Test tenant resolution
describe('Tenant Resolution', () => {
  test('resolves tenant from subdomain', () => {
    const tenant = getTenantFromHost('jakarta.beauty-clinic.com')
    expect(tenant?.slug).toBe('jakarta')
  })
  
  test('resolves tenant from path', () => {
    const tenant = getTenantFromPath('/bali/dashboard')
    expect(tenant?.slug).toBe('bali')
  })
  
  test('returns null for unknown tenant', () => {
    const tenant = getTenantFromPath('/unknown/dashboard')
    expect(tenant).toBeNull()
  })
})
```

### Integration Tests
1. **Jakarta Tenant** (`/jakarta` or `jakarta.beauty-clinic.com`)
   - [ ] Can access dashboard
   - [ ] Walk-in feature enabled
   - [ ] Theme colors applied
   - [ ] Data isolated

2. **Bali Tenant** (`/bali` or `bali.beauty-clinic.com`)
   - [ ] Can access dashboard
   - [ ] Multiple locations enabled
   - [ ] Theme colors applied
   - [ ] Data isolated

3. **Surabaya Tenant** (`/surabaya` or `surabaya.beauty-clinic.com`)
   - [ ] Can access dashboard
   - [ ] Walk-in feature disabled
   - [ ] Theme colors applied
   - [ ] Data isolated

### Manual Test Checklist
- [ ] Home page redirects to `/default`
- [ ] Direct tenant URLs work (`/jakarta/dashboard`)
- [ ] Subdomain access works (if configured)
- [ ] Navigation preserves tenant context
- [ ] API calls include tenant scope
- [ ] Theme changes per tenant
- [ ] Feature flags respected
- [ ] Session maintains tenant binding

## Configuration

### Next.js Config Updates
```javascript
// next.config.mjs
module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain rewrites if needed
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>.*).beauty-clinic.com',
            },
          ],
          destination: '/:tenant/:path*',
        },
      ],
    }
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Tenant-Enabled',
            value: 'true',
          },
        ],
      },
    ]
  },
}
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_ENABLE_MULTITENANCY=true
NEXT_PUBLIC_DEFAULT_TENANT=default
NEXT_PUBLIC_DOMAIN=beauty-clinic.com
```

## API Changes

### Before
```
GET /api/patients
POST /api/bookings
```

### After
```
GET /api/[tenant]/patients
POST /api/[tenant]/bookings
```

With automatic rewriting:
- `jakarta.beauty-clinic.com/api/patients` → `/api/jakarta/patients`
- `beauty-clinic.com/jakarta/api/patients` → `/api/jakarta/patients`

## Performance Considerations

1. **Static Generation**: 
   - Use `generateStaticParams` for known tenants
   - Enable ISR for new tenants

2. **Caching**:
   - Cache tenant configs
   - Use React Server Components where possible

3. **Database Indexing** (when migrating from mock):
   - Add composite index on `(tenantId, id)`
   - Partition large tables by tenantId

## Security Considerations

1. **Data Isolation**:
   - Always filter by tenantId
   - Validate tenant access in middleware
   - Prevent cross-tenant data leaks

2. **Session Management**:
   - Bind sessions to tenantId
   - Validate tenant access on each request
   - Clear session on tenant switch

3. **Feature Access**:
   - Check feature flags per tenant
   - Disable routes for unauthorized features

## Monitoring

Track these metrics post-deployment:

1. **Performance**:
   - Page load times per tenant
   - API response times
   - Middleware execution time

2. **Usage**:
   - Active tenants
   - Requests per tenant
   - Feature usage per tenant

3. **Errors**:
   - Tenant resolution failures
   - Unauthorized access attempts
   - Data isolation violations

## Support

For issues or questions:
1. Check middleware logs for tenant resolution
2. Verify tenant configuration in `lib/tenant.ts`
3. Ensure data includes tenantId field
4. Test with different tenant contexts

## Success Criteria

- ✅ Zero breaking changes to existing functionality
- ✅ Clean URL structure with tenant scoping
- ✅ Complete data isolation between tenants
- ✅ Tenant-specific theming and features
- ✅ Maintainable and extensible architecture
# 401 Unauthorized Error Handling

## Overview
Sistem sekarang dilengkapi dengan automatic 401 error handling yang akan:
1. Mendeteksi saat token expired atau unauthorized
2. Auto-logout user
3. Clear semua auth data
4. Redirect ke login page
5. Save current path untuk redirect setelah login

## Implementasi

### 1. API Client (`lib/api-client.ts`)

#### Automatic 401 Detection
Setiap API call yang return 401 akan otomatis trigger auto-logout:

```typescript
// Handle 401 Unauthorized - Auto logout and redirect
if (response.status === 401) {
  this.handleUnauthorized()
  throw new ApiError(
    'Session expired',
    'Your session has expired. Please log in again.',
    401,
    'Sesi Anda telah berakhir. Silakan login kembali.'
  )
}
```

#### Cleanup Process
```typescript
private handleUnauthorized(): void {
  // 1. Clear localStorage
  localStorage.removeItem('user')
  localStorage.removeItem('tenant')
  localStorage.removeItem('operational-onboarding-progress')

  // 2. Store current path untuk redirect after login
  const currentPath = window.location.pathname
  if (currentPath !== '/signin' && currentPath !== '/signup') {
    sessionStorage.setItem('redirectAfterLogin', currentPath)
  }

  // 3. Redirect to login after delay
  setTimeout(() => {
    window.location.href = '/signin'
  }, 1500)
}
```

#### Delay Reasoning
Delay 1.5 detik memberikan waktu untuk:
- Toast notification muncul
- User membaca pesan error
- Smooth transition ke login page

### 2. Auth Context (`lib/auth-context.tsx`)

#### Auto-Redirect After Login
```typescript
// Check if there's a redirect path from previous 401 error
const redirectPath = sessionStorage.getItem('redirectAfterLogin')
if (redirectPath) {
  sessionStorage.removeItem('redirectAfterLogin')
  router.push(redirectPath)
} else {
  // Default redirect to dashboard
  router.push('/dashboard')
}
```

#### Enhanced Signout
```typescript
const signout = async () => {
  // 1. Call backend signout
  await fetch('/api/auth/signout', { method: 'POST' })

  // 2. Clear local state
  setUser(null)
  localStorage.removeItem('user')
  localStorage.removeItem('tenant')
  localStorage.removeItem('operational-onboarding-progress')

  // 3. Clear session storage
  sessionStorage.removeItem('redirectAfterLogin')
  sessionStorage.removeItem('onboarding-banner-dismissed')

  // 4. Redirect to signin
  router.push('/signin')
}
```

## User Experience Flow

### Scenario 1: 401 During API Call

**Example:** User sedang di `/clients` page dan token expired

```
1. User click "Edit Client"
2. API call GET /api/customers/xxx
3. Response: 401 Unauthorized
4. System auto-trigger:
   a. Clear localStorage (user, tenant, onboarding progress)
   b. Save current path: sessionStorage['redirectAfterLogin'] = '/clients'
   c. Show error (implicit from ApiError)
   d. Wait 1.5 seconds
   e. Redirect to '/signin'
5. User login kembali
6. System check sessionStorage['redirectAfterLogin']
7. Redirect user back to '/clients' (where they were)
```

### Scenario 2: Manual Signout

**Example:** User click "Logout" button

```
1. User click "Logout"
2. signout() called
3. POST /api/auth/signout (backend cleanup)
4. Clear all localStorage items
5. Clear all sessionStorage items
6. Redirect to '/signin'
7. No auto-redirect after login (manual logout)
```

### Scenario 3: Multiple Tabs

**Example:** User open 2 tabs, token expired di tab 1

```
Tab 1:
1. API call → 401
2. Clear localStorage
3. Redirect to /signin

Tab 2:
1. Still showing old UI (cached)
2. Next API call → 401
3. Auto-redirect to /signin
```

**Note:** localStorage changes broadcast across tabs, tapi UI mungkin belum update. Setiap tab akan handle 401 sendiri.

## API Call Patterns

### Using apiClient

**Before (Manual fetch):**
```typescript
const response = await fetch('/api/customers/123')
if (!response.ok) {
  // Manual error handling
}
const data = await response.json()
```

**After (Using apiClient):**
```typescript
try {
  const data = await apiClient.getCustomer('123')
  // Auto 401 handling
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.userFriendlyMessage)
  }
}
```

### Generic Call Method
```typescript
// GET request
const data = await apiClient.call('/custom-endpoint')

// POST request
const data = await apiClient.call('/custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ foo: 'bar' })
})
```

## Error Messages

### Indonesian (User-Facing)
```
"Sesi Anda telah berakhir. Silakan login kembali."
```

### English (Developer)
```
"Session expired - Your session has expired. Please log in again."
```

## Storage Management

### localStorage (Persistent)
- `user` - User data with auth info
- `tenant` - Tenant/organization data
- `operational-onboarding-progress` - Wizard progress

**Cleared on:** 401 error, manual signout

### sessionStorage (Per-Tab)
- `redirectAfterLogin` - Path to redirect after re-login
- `onboarding-banner-dismissed` - Banner dismiss state

**Cleared on:** Manual signout only
**Preserved on:** 401 error (for auto-redirect)

## Edge Cases

### 1. Multiple Concurrent 401s
**Scenario:** 5 API calls running, all return 401

**Handling:**
- First 401 triggers handleUnauthorized()
- localStorage cleared immediately
- Subsequent 401s see empty localStorage
- All redirect to same path (last setTimeout wins)
- User only sees one redirect

### 2. 401 During Signin
**Scenario:** User di signin page, tapi ada API call yang 401

**Handling:**
- Check `currentPath !== '/signin'`
- Don't save '/signin' as redirect path
- No infinite redirect loop

### 3. Network Error vs 401
**Scenario:** Network down vs token expired

**401 Error:**
```typescript
if (response.status === 401) {
  // Handled by apiClient
}
```

**Network Error:**
```typescript
catch (error) {
  if (error instanceof TypeError) {
    // Network error, show different message
    toast({ description: "Tidak dapat terhubung ke server" })
  }
}
```

### 4. Race Condition: Logout During API Call
**Scenario:** User click logout saat ada ongoing API call

**Flow:**
```
1. API call started
2. User click logout
3. localStorage cleared
4. API call returns 401
5. handleUnauthorized() sees empty localStorage
6. Redirect to /signin (already going there)
```

**Result:** No issues, user already logging out

## Testing Scenarios

### Test Case 1: Basic 401 Handling
**Steps:**
1. Login as user
2. Manually expire token (backend)
3. Make any API call
4. Verify auto-logout
5. Verify redirect to /signin

**Expected:**
- Clear localStorage
- Save current path to sessionStorage
- Redirect after 1.5s

---

### Test Case 2: Auto-Redirect After Login
**Steps:**
1. Be on `/clients` page
2. Token expires
3. API call triggers 401
4. Login again
5. Verify redirect to `/clients`

**Expected:**
- User returns to where they were

---

### Test Case 3: Manual Signout
**Steps:**
1. Be on any page
2. Click "Logout"
3. Login again
4. Verify redirect to `/dashboard`

**Expected:**
- No saved redirect path
- Default dashboard redirect

---

### Test Case 4: Multiple Tabs
**Steps:**
1. Open 2 tabs with same user
2. Token expires
3. Make API call in Tab 1
4. Switch to Tab 2
5. Make API call in Tab 2

**Expected:**
- Both tabs redirect to /signin
- Both clear localStorage independently

---

### Test Case 5: Signin Page 401
**Steps:**
1. Be on `/signin` page
2. Some background API call returns 401
3. Verify no redirect loop

**Expected:**
- Don't save '/signin' as redirect
- Stay on signin page

---

## Benefits

### 1. Better Security
- Token expiry handled globally
- No stale auth data
- Forced re-authentication

### 2. Better UX
- User tidak stuck dengan expired token
- Auto-redirect kembali ke halaman asal
- Clear error messages dalam Bahasa Indonesia

### 3. Developer-Friendly
- No manual 401 handling di setiap API call
- Consistent error handling
- Centralized logic

### 4. Maintainable
- One place untuk update logic
- Easy to add logging/analytics
- Clear separation of concerns

## Future Enhancements

### Phase 2
- Token refresh mechanism (refresh token)
- Warning before token expiry
- Remember me functionality
- Session timeout notification

### Phase 3
- Multi-device session management
- Force logout from all devices
- Concurrent session limits
- Session activity tracking

## Troubleshooting

### User Stuck in Redirect Loop
**Symptoms:** User keeps getting redirected to /signin

**Debug:**
1. Check if token is being saved after login
2. Verify backend returns valid token
3. Check cookies are being set
4. Verify no API calls on /signin page

**Fix:**
```typescript
// Make sure signin doesn't trigger API calls before auth
if (pathname === '/signin') {
  return null
}
```

---

### Redirect Path Not Working
**Symptoms:** User redirected to dashboard instead of original page

**Debug:**
1. Check sessionStorage['redirectAfterLogin']
2. Verify it's set before redirect
3. Check it's cleared after use

**Fix:**
```typescript
// In signin method
const redirectPath = sessionStorage.getItem('redirectAfterLogin')
console.log('Redirect path:', redirectPath) // Debug
```

---

### localStorage Not Clearing
**Symptoms:** Old user data persists after 401

**Debug:**
1. Check if handleUnauthorized() is called
2. Verify localStorage.removeItem() runs
3. Check for browser localStorage permissions

**Fix:**
```typescript
// Add try-catch
try {
  localStorage.removeItem('user')
} catch (error) {
  console.error('Failed to clear localStorage:', error)
}
```

## Summary

Sistem 401 handling sekarang:
- Fully automatic
- User-friendly dengan Bahasa Indonesia
- Preserves user context (auto-redirect)
- Handles edge cases
- Zero configuration required
- Works with existing apiClient

User experience improved:
- No more stuck dengan expired token
- Clear messaging
- Seamless re-authentication
- Tetap di context yang sama setelah login

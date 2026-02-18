# BBSCART Unified Single Sign-In Implementation Plan

## Overview
Apply unified single sign-in to BBSCART, similar to ThiaMobile, so that:
- Normal sign-in/signup pages are bypassed if user is already authenticated
- Saved user credentials are loaded automatically on first launch
- User can sign in once and access all apps (BBSCART, GlobalHealth, ThiaMobile)

## Current State

### BBSCART Navigator (`src/navigation/BBSCARTNavigator.js`)
- ❌ Uses local `useAuth()` hook from `AuthContext.js`
- ❌ Only checks `auth_user` key in AsyncStorage
- ❌ Does NOT check unified auth state
- ❌ Always shows AuthStack if `isLoggedIn` is false

### BBSCART SignInScreen (`src/apps/bbscart/screens/SignInScreen.js`)
- ✅ Already uses `unifiedLogin()` service
- ✅ Already calls `unifiedLoginAction()` to save to UnifiedAuthContext
- ✅ Already integrated with unified auth

### BBSCART AuthContext (`src/apps/bbscart/contexts/AuthContext.js`)
- ❌ Only checks `auth_user` key
- ❌ Does NOT sync with UnifiedAuthContext
- ❌ Not aware of unified auth state

## ThiaMobile Implementation (Reference)

### ThiaMobile Navigator (`src/navigation/ThiaMobileNavigator.js`)
- ✅ Uses `useUnifiedAuth()` hook
- ✅ Checks `isAuthenticated` from UnifiedAuthContext
- ✅ Sets `initialRouteName={isAuthenticated ? "HomeMain" : "Welcome"}`
- ✅ Conditionally shows AuthStack only if `!isAuthenticated`
- ✅ Shows loading spinner while `authLoading` is true

## Changes Required

### 1. Update BBSCARTNavigator.js
**File:** `UnifiedApp/src/navigation/BBSCARTNavigator.js`

**Changes:**
- Replace `useAuth()` with `useUnifiedAuth()`
- Import `useUnifiedAuth` from `'../shared/contexts/UnifiedAuthContext'`
- Replace `isLoggedIn` with `isAuthenticated`
- Replace `authLoading` with `loading` from unified auth
- Update `RootNavigator` to check unified auth state
- Set `initialRouteName` based on `isAuthenticated` (like ThiaMobile)
- Conditionally show AuthStack only if `!isAuthenticated`

**Key Code Pattern (from ThiaMobile):**
```javascript
const { isAuthenticated, loading: authLoading } = useUnifiedAuth();

// In navigator:
initialRouteName={isAuthenticated ? "Home" : "SignIn"}
{!isAuthenticated && (
  <Stack.Screen name="Welcome" component={AuthStack} />
)}
```

### 2. Update BBSCART AuthContext.js (Optional - for backward compatibility)
**File:** `UnifiedApp/src/apps/bbscart/contexts/AuthContext.js`

**Changes:**
- Keep existing `AuthContext` for backward compatibility
- Sync `isLoggedIn` state with UnifiedAuthContext
- When UnifiedAuthContext detects auth, set local `isLoggedIn` to true
- This ensures existing code that uses `useAuth()` still works

**OR** (Simpler approach):
- Keep `AuthContext` as-is for backward compatibility
- Navigator will use UnifiedAuthContext directly
- Local AuthContext will be updated when user logs in via SignInScreen

### 3. Update SignUp.js (if needed)
**File:** `UnifiedApp/src/apps/bbscart/screens/SignUp.js`

**Check if:**
- SignUp already uses unified signup service
- If not, update to use `unifiedSignup()` from `unifiedAuthService.js`
- After successful signup, call `unifiedLoginAction()` to save auth state

## Expected Behavior After Changes

### First Time User (No Saved Auth)
1. App launches → Checks UnifiedAuthContext
2. No auth found → Shows Intro screen (if first launch) or SignIn screen
3. User signs in/signs up → Auth saved to UnifiedAuthContext
4. User navigated to Home screen
5. Next app launch → Automatically logged in, bypasses sign-in screen

### Returning User (Has Saved Auth)
1. App launches → Checks UnifiedAuthContext
2. Valid auth found → Directly navigates to Home screen
3. Sign-in/signup screens are bypassed
4. User is already authenticated

### Cross-App Authentication
1. User signs in to ThiaMobile → Auth saved to UnifiedAuthContext
2. User switches to BBSCART → Automatically authenticated (no sign-in needed)
3. User switches to GlobalHealth → Automatically authenticated (no sign-in needed)

## Files to Modify

1. ✅ `UnifiedApp/src/navigation/BBSCARTNavigator.js` - Main changes
2. ⚠️ `UnifiedApp/src/apps/bbscart/contexts/AuthContext.js` - Optional sync update
3. ⚠️ `UnifiedApp/src/apps/bbscart/screens/SignUp.js` - Check if needs unified signup

## Testing Checklist

- [ ] First launch shows Intro/SignIn screen
- [ ] After sign-in, user goes to Home screen
- [ ] App restart bypasses sign-in (auto-login)
- [ ] Sign-in from ThiaMobile works in BBSCART
- [ ] Sign-in from BBSCART works in ThiaMobile
- [ ] Logout clears auth across all apps
- [ ] Invalid/expired tokens are handled gracefully

## Notes

- UnifiedAuthContext already handles:
  - Token validation
  - Legacy key migration
  - Cross-app auth sync
  - Auto-login on app start

- BBSCART SignInScreen already integrated with unified auth
- Only navigator needs to be updated to check unified auth state

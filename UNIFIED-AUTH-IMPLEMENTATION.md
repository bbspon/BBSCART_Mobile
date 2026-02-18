# Unified Authentication Implementation

## Overview

The unified authentication system allows users to log in once and access all three apps (BBSCART, GlobalHealth, and ThiaMobile) with the same credentials. When a user logs in to any app, their authentication state is shared across all apps.

## Architecture

### 1. UnifiedAuthContext (`src/shared/contexts/UnifiedAuthContext.js`)

The central authentication context that:
- Manages authentication state across all apps
- Stores unified auth data in `UNIFIED_AUTH` key
- Syncs to legacy keys for backward compatibility
- Provides login, logout, and user management functions

**Key Features:**
- ✅ Single source of truth for authentication
- ✅ Automatic migration from legacy auth keys
- ✅ Backward compatibility with existing app-specific storage
- ✅ Token and user data synchronization

### 2. Unified Auth Service (`src/shared/services/unifiedAuthService.js`)

Service layer that handles API calls to all three apps:
- `unifiedLogin(appName, credentials)` - Login to any app
- `unifiedSignup(appName, userData)` - Signup for any app
- `getCurrentUser(appName, token)` - Get user info
- `verifyToken(appName, token)` - Verify token validity

**Supported Apps:**
- `bbscart` - BBSCART E-Commerce
- `globalhealth` - Global Health Access
- `thiamobile` - ThiaMobile Jewelry

## Storage Strategy

### Unified Storage Key
- **Key:** `UNIFIED_AUTH`
- **Format:**
  ```json
  {
    "token": "jwt_token_here",
    "user": { "name": "...", "email": "...", "phone": "..." },
    "activeApp": "bbscart" | "globalhealth" | "thiamobile",
    "timestamp": 1234567890
  }
  ```

### Legacy Keys (Synced for Backward Compatibility)
- **BBSCART:** `auth_user`
- **GlobalHealth:** `bbsUser`
- **ThiaMobile:** `THIAWORLD_TOKEN` + `THIAWORLD_USER`

When a user logs in, the unified auth system:
1. Stores data in `UNIFIED_AUTH`
2. Syncs to all legacy keys automatically
3. Ensures all apps can read the auth state

## Usage

### In App.js (Root)
```javascript
import { UnifiedAuthProvider } from './src/shared/contexts/UnifiedAuthContext';

export default function App() {
  return (
    <UnifiedAuthProvider>
      <RootNavigator />
    </UnifiedAuthProvider>
  );
}
```

### In Sign-In Screens
```javascript
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';
import { unifiedLogin } from '../../../shared/services/unifiedAuthService';

const SignInScreen = () => {
  const { login: unifiedLoginAction } = useUnifiedAuth();

  const handleSignIn = async () => {
    const result = await unifiedLogin('bbscart', {
      email: email.trim(),
      password,
    });

    if (result.success) {
      await unifiedLoginAction(result.token, result.user, 'bbscart');
      // User is now logged in across all apps!
    }
  };
};
```

### Checking Auth State
```javascript
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';

const MyComponent = () => {
  const { isAuthenticated, user, token, loading } = useUnifiedAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginScreen />;

  return <AuthenticatedContent user={user} />;
};
```

### Making Authenticated API Calls
```javascript
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';

const MyComponent = () => {
  const { getAuthHeaders } = useUnifiedAuth();

  const fetchData = async () => {
    const response = await fetch('https://api.example.com/data', {
      headers: getAuthHeaders(),
    });
    // ...
  };
};
```

### Logout (Clears All Apps)
```javascript
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';

const MyComponent = () => {
  const { logout } = useUnifiedAuth();

  const handleLogout = async () => {
    await logout(); // Clears auth from all apps
    // Navigate to login screen
  };
};
```

## Migration from Legacy Auth

The system automatically migrates from legacy auth keys on app startup:

1. **First Priority:** Check `UNIFIED_AUTH` key
2. **Fallback:** Check legacy keys in order:
   - `auth_user` (BBSCART)
   - `bbsUser` (GlobalHealth)
   - `THIAWORLD_TOKEN` + `THIAWORLD_USER` (ThiaMobile)
3. **Migration:** If legacy auth found, migrate to `UNIFIED_AUTH` and sync to all keys

## API Endpoints

### BBSCART
- **Base:** `https://bbscart.com/api`
- **Login:** `POST /auth/login`
- **Signup:** `POST /auth/signup`
- **Me:** `GET /auth/me`

### GlobalHealth
- **Base:** `https://healthcare.bbscart.com/api`
- **Login:** `POST /auth/login`
- **Signup:** `POST /auth/signup`
- **Me:** `GET /auth/me`

### ThiaMobile
- **Base:** `https://thiaworld.bbscart.com/api`
- **Login:** `POST /auth/login`
- **Signup:** `POST /auth/signup`
- **Me:** `GET /auth/me`

## Benefits

1. **Single Sign-On (SSO):** Login once, access all apps
2. **Seamless Experience:** No need to re-authenticate when switching apps
3. **Backward Compatible:** Existing code continues to work
4. **Centralized Management:** One place to manage auth state
5. **Easy Logout:** One logout clears all apps

## Implementation Status

✅ **Completed:**
- UnifiedAuthContext created
- Unified auth service created
- App.js wrapped with UnifiedAuthProvider
- BBSCART SignInScreen updated
- GlobalHealth SignInScreen updated
- ThiaMobile SignInScreen updated

⏳ **In Progress:**
- Update navigation to check auth state on launch
- Update logout functions in all apps

## Testing

To test unified authentication:

1. **Login to BBSCART:**
   - Open BBSCART app
   - Login with credentials
   - Verify `UNIFIED_AUTH` is set
   - Switch to GlobalHealth or ThiaMobile
   - Should be automatically logged in

2. **Login to GlobalHealth:**
   - Open GlobalHealth app
   - Login with credentials
   - Switch to BBSCART or ThiaMobile
   - Should be automatically logged in

3. **Login to ThiaMobile:**
   - Open ThiaMobile app
   - Login with credentials
   - Switch to BBSCART or GlobalHealth
   - Should be automatically logged in

4. **Logout:**
   - Logout from any app
   - All apps should be logged out
   - All storage keys should be cleared

## Notes

- The system maintains backward compatibility with existing app-specific storage keys
- Token is shared across all apps, but each app may have different user data structures
- The `activeApp` field tracks which app the user logged in from (for analytics/debugging)
- All legacy keys are synced on login to ensure existing code continues to work

# Revert summary – app not loading / latest issues

## Latest revert (saved login + keyboard + code changes)

Reverted to **original behavior** so the app matches the previous working state:

| File | What was reverted |
|------|-------------------|
| **UnifiedAuthContext.js** | Removed "only clear when isUnauthorized" and "keep stored auth on network error". Now: whenever `validationResult.valid` is false, we **always clear auth** (original behavior). |
| **unifiedAuthService.js** | Removed 400 handling as isUnauthorized. Now: only 401 returns isUnauthorized; other errors log full `error` and return short message. |
| **SignInScreen.js** | Removed last-email save/load (LAST_EMAIL_KEY, useEffect, AsyncStorage.setItem on login). Back to plain useState("") for email. |
| **KeyboardAwareContainer.js** | Removed hasMeasureInWindow check and try/catch in onFocus. Restored original: `typeof inputHandle.measureInWindow === 'function'`, and onFocus with event.persist(), target from event. |

**Note:** If the app still crashes when tapping the email field, the cause is likely the original KeyboardAwareContainer passing a native tag (number) to `scrollToInput` where `measureInWindow` is undefined—that path was reverted. A future fix would be to guard for non-object `inputHandle` without changing the rest of the flow.

---

## Earlier revert (app not loading)

These changes were **reverted** so the app can load again. Below is what was put back.

---

## 1. App.js – BatchedBridge (Method 1) restored

**Issue:** Removing the BatchedBridge deep import and using only NativeModules could break the native bridge on some RN versions and prevent the app from loading.

**Revert:** BatchedBridge interception (Method 1) was restored so both paths are used again:

- **Method 1:** `require('react-native/Libraries/BatchedBridge/BatchedBridge').default` – may show a deprecation warning but keeps bridge working.
- **Method 2:** `NativeModules.__fbBatchedBridge` – still used as fallback.

**Diff (conceptual):**
```diff
  const interceptNativeBridge = () => {
    if (nativeBridgeIntercepted) return true;
+   try {
+     const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge').default;
+     if (BatchedBridge && BatchedBridge.enqueueNativeCall) {
+       // ... patch enqueueNativeCall with 5 args (params, onFail, onSucc)
+       nativeBridgeIntercepted = true;
+       return true;
+     }
+   } catch (error) { /* try Method 2 */ }
+
    try {
      const { NativeModules } = require('react-native');
```

---

## 2. unifiedAuthService.js – getCurrentUser catch

**Issue:** Treating 400 the same as 401 and changing the logged value might have affected callers or made debugging harder.

**Revert:** Original behavior restored with a small improvement:

- **401:** Return `isUnauthorized: true`, no full error log.
- **400:** Return `isUnauthorized: true` and `error.response?.data?.message || 'Invalid token'` (no full error object in console).
- **Other errors:** Log short message only: `error.response?.data?.message || error.message` (not the full `error` object).

So 400 is still handled without spamming the console, but the response shape matches what callers expect.

**Diff (conceptual):**
```diff
  } catch (error) {
-   const status = error.response?.status;
-   const msg = error.response?.data?.message || error.message;
-   if (status === 401 || status === 400) {
-     return { success: false, error: msg || '...', isUnauthorized: true };
-   }
-   console.error(`Get current user error (${appName}):`, msg || '...');
-   return { success: false, error: msg || '...' };
+   if (error.response?.status === 401) {
+     return { success: false, error: 'Token expired or invalid', isUnauthorized: true };
+   }
+   if (error.response?.status === 400) {
+     return { success: false, error: error.response?.data?.message || 'Invalid token', isUnauthorized: true };
+   }
+   console.error(`Get current user error (${appName}):`, error.response?.data?.message || error.message);
+   return { success: false, error: error.response?.data?.message || error.message || '...' };
  }
```

---

## 3. BBSCARTNavigator.js – SafeAreaProvider removed

**Issue:** Wrapping the BBSCART tree in `SafeAreaProvider` was added to fix Dashboard navigation. Having it there can cause a native crash on load (e.g. RenderThread) so the app never opens.

**Revert:** `SafeAreaProvider` was removed from BBSCARTNavigator. The tree is back to:

- `View` → `AuthProvider` → `CartProvider` → `WishlistProvider` → `NavigationIndependentTree` → `NavigationContainer` → …

**Diff (conceptual):**
```diff
- import { SafeAreaProvider } from "react-native-safe-area-context";
  ...
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C' }}>
-     <SafeAreaProvider style={{ flex: 1 }}>
        <AuthProvider>
  ...
-     </SafeAreaProvider>
    </View>
  );
```

**Note:** Navigating to **Dashboard** may again hit “No SafeAreaProvider” or similar. If that happens, we can add SafeAreaProvider only around the screen that needs it (e.g. inside Dashboard or a wrapper that mounts only when that stack is active) instead of at BBSCART root.

---

## What to do next

1. Reload/rebuild the app and confirm it loads.
2. If it loads: keep these reverts. If Dashboard crashes when you open it, we can fix that separately (e.g. local SafeAreaProvider for that flow).
3. If it still does not load: capture the exact error (red screen or `npx react-native log-android`) and we can target the real cause.

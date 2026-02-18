# App Launch Flow & Changes vs Original (BBSCARTMobile_23Jan)

This document breaks down the **initial launch logic**, **files required/validated for launch**, and **what changed** compared to the original BBSCART app (BBSCARTMobile_23Jan) after implementing **single login** and **bottom white space** fixes (and subsequent crash fixes).

---

## 1. Initial Launch Flow (Current – UnifiedApp)

```
index.js
  → AppRegistry.registerComponent(appName, () => App)
  → App.js
      → ErrorBoundary (catches JS render errors)
      → UnifiedAuthProvider (single-login auth state)
          → RootNavigator (src/navigation/RootNavigator.js)
              → NavigationContainer
              → RootStack.Navigator (initialRouteName="BBSCART", animation: 'default')
                  → BBSCART screen = BBSCARTNavigator (src/navigation/BBSCARTNavigator.js)
```

**Inside BBSCARTNavigator:**

```
BBSCARTNavigator (default export)
  → View (flex:1, bg #0B0B0C)
  → AuthProvider, CartProvider, WishlistProvider
  → NavigationIndependentTree
  → NavigationContainer (theme: dark, fonts, colors)
      → RootNavigator (inner function – not the file RootNavigator.js)
          → useUnifiedAuth() → isAuthenticated, loading
          → AsyncStorage "bbscart_hasLaunched" → isFirstLaunch
          → if (checkingFirstLaunch || authLoading) → ActivityIndicator
          → else: isAuthenticated ? MainStack : AuthStack(showIntro: isFirstLaunch)
```

**First screen shown:**

- **First launch:** `isFirstLaunch === true` → **AuthStack** with **Intro** as initial route.
- **Not first launch, not logged in:** **AuthStack** with **SignIn** as initial route.
- **Logged in (unified auth):** **MainStack** with **Home** as initial route.

**Validations / data used at launch:**

| What | Where | Purpose |
|------|--------|---------|
| `UnifiedAuthProvider` | App.js | Loads `UNIFIED_AUTH` (or legacy keys), calls `verifyToken()`, sets `isAuthenticated`, `loading` |
| `bbscart_hasLaunched` | BBSCARTNavigator inner RootNavigator | Decides Intro vs SignIn as first auth screen |
| `AuthProvider` (local) | BBSCARTNavigator | Still used for BBSCART-specific login() after unified login |
| Theme `fonts` | BBSCARTNavigator NavigationContainer | Required by React Navigation header (avoids "regular of undefined") |

---

## 2. Files Required & Validated for Initial Launch

| File | Role at launch |
|------|-----------------|
| **index.js** | Entry; registers App. Reanimated imported first. |
| **App.js** | Root: ErrorBoundary → UnifiedAuthProvider → RootNavigator. StyleSheet/NaN filter, BatchedBridge interception, LogBox, ErrorUtils. |
| **src/navigation/RootNavigator.js** | Root stack: BBSCART / GlobalHealth / ThiaMobile. `initialRouteName="BBSCART"`, `animation: 'default'`. |
| **src/navigation/BBSCARTNavigator.js** | BBSCART: providers, theme (incl. `fonts`), first-launch check, auth check, AuthStack vs MainStack. |
| **src/shared/contexts/UnifiedAuthContext.js** | Single-login: init from `UNIFIED_AUTH` or legacy, `verifyToken()`, `loading`/`isAuthenticated`. |
| **src/shared/services/unifiedAuthService.js** | `verifyToken()`, `getCurrentUser()` used by UnifiedAuthContext on init. |
| **src/apps/bbscart/contexts/AuthContext.js** | Local BBSCART auth; used after unified login and for logout. |
| **src/apps/bbscart/screens/IntroScreen.js** | First screen when `isFirstLaunch === true`. |
| **src/apps/bbscart/screens/SignInScreen.js** | First screen when not first launch and not authenticated. |
| **src/apps/bbscart/screens/SignUp.js** | Shown from Intro “Get Started” or SignIn “Sign Up”. |
| **src/shared/components/ErrorBoundary.js** | Catches render errors so they show on screen instead of blank crash. |

---

## 3. Original vs Current – File-by-File Comparison

Reference **original** = `BBSCARTMobile_23Jan` (standalone app that “was working fine”).  
**Current** = `UnifiedApp` (after single login, white space fixes, and crash fixes).

### 3.1 Entry & root

| Aspect | Original (BBSCARTMobile_23Jan) | Current (UnifiedApp) |
|--------|--------------------------------|------------------------|
| **index.js** | Registers App only. | Imports `react-native-reanimated` first, then registers App. |
| **App.js** | Single file = full BBSCART app: AuthProvider, CartProvider, WishlistProvider, NavigationContainer, RootNavigator (inner), FlashMessage. No StyleSheet/NaN filter, no BatchedBridge, no ErrorBoundary. | Thin root: ErrorBoundary → UnifiedAuthProvider → RootNavigator. StyleSheet.create interception (NaN filter). BatchedBridge interception (NaN in params). LogBox ignores. ErrorUtils global handler. Hermes console.error filter. No NavigationContainer here. |
| **Root navigator** | N/A (everything in one App.js). | **RootNavigator.js**: Separate file. NavigationContainer + RootStack with BBSCART / GlobalHealth / ThiaMobile. `animation: 'default'` (was `fade` + `animationDuration: 0` → caused “Impossible totalDuration 0” crash). |
| **BBSCART “app”** | Same file as App.js (RootNavigator + MainStack + AuthStack + providers). | **BBSCARTNavigator.js**: Same structure but uses `useUnifiedAuth()` and theme with `fonts` and dark colors. |

### 3.2 Auth & first launch

| Aspect | Original | Current |
|--------|----------|---------|
| **Auth source** | `AuthContext`: AsyncStorage `auth_user`, no server verify. `isLoggedIn` from stored token presence. | `UnifiedAuthContext`: AsyncStorage `UNIFIED_AUTH` (and legacy keys). Calls `verifyToken()` on init. Clears auth only when token invalid/expired (not on network error). |
| **First launch key** | `hasLaunched` | `bbscart_hasLaunched` |
| **Auth gate** | `useAuth()` → `isLoggedIn` | `useUnifiedAuth()` → `isAuthenticated` |
| **Sign-in screen** | Uses `useAuth()` only; `login()` from AuthContext. | Uses `useAuth()` and `useUnifiedAuth()`; calls `unifiedLogin()` then `unifiedLoginAction()` and local `login()`. KeyboardAvoidingView + ScrollView + TouchableWithoutFeedback (KeyboardAwareContainer removed to fix focus crash). |
| **Sign-up screen** | Standard ScrollView, vector icons. | KeyboardAvoidingView + TouchableWithoutFeedback; vector icons replaced with “Show”/“Hide” text (to avoid native crash on some devices). |

### 3.3 UI / theme (bottom white space & header)

| Aspect | Original | Current |
|--------|----------|---------|
| **Theme** | No theme on NavigationContainer. | NavigationContainer in BBSCARTNavigator has `theme={{ dark: true, colors: { … }, fonts: { regular, medium, bold, heavy } }}`. `fonts` fix “regular of undefined” and header styling. |
| **Header** | `headerStyle: { backgroundColor: "white" }`, icons `color="black"`. | `headerStyle: { backgroundColor: '#0B0B0C' }`, icons `color="#FFFFFF"`. Removes “white bar” and matches dark theme. |
| **Root container** | No wrapper color. | Outer View `backgroundColor: '#0B0B0C'`. MainStack `cardStyle: { backgroundColor: '#0B0B0C' }`. |

### 3.4 Crash / stability fixes (post single-login)

| Change | File(s) | Reason |
|--------|--------|--------|
| Removed “Method 2” native bridge interception | App.js | Method 2 called native with 3 args instead of 5 → launch crash. Only BatchedBridge (Method 1) kept. |
| `animationDuration: 0` → `animation: 'default'` (no custom duration) | RootNavigator.js | `animationDuration: 0` led to Android HWUI “Impossible totalDuration 0” and RenderThread SIGABRT. |
| ErrorBoundary around app | App.js, ErrorBoundary.js | Surfaces JS errors on screen instead of blank crash. |
| KeyboardAwareContainer removed from SignIn | SignInScreen.js | Replaced with KeyboardAvoidingView + ScrollView + TouchableWithoutFeedback to avoid focus/crash. |
| Vector icons removed from SignUp | SignUp.js | Replaced with “Show”/“Hide” text to avoid native crash on some setups. |
| Theme `fonts` and header colors | BBSCARTNavigator.js | Fixes “Cannot read property 'regular' of undefined” and white header bar. |

---

## 4. Summary: What Changed for “Single Login” and “Bottom White Space”

### Single login

- **New:** `UnifiedAuthContext`, `unifiedAuthService` (verifyToken, getCurrentUser, unifiedLogin, unifiedSignup).
- **App.js:** Root is now `UnifiedAuthProvider` → RootNavigator (no AuthProvider at root; BBSCART still has local AuthProvider).
- **BBSCARTNavigator:** Uses `useUnifiedAuth()` for `isAuthenticated` and `loading`; first-launch key renamed to `bbscart_hasLaunched`.
- **Sign-in/Sign-up:** Call unified APIs and then `unifiedLoginAction` + local `login()`; auth persisted in `UNIFIED_AUTH` and validated with `verifyToken()` on next launch.
- **Persistence behavior:** Auth is cleared only when token is invalid/expired (e.g. `isUnauthorized`), not on generic network/verify errors, so “single login” is retained across restarts when token is still valid.

### Bottom white space / header

- **Theme:** NavigationContainer in BBSCARTNavigator given `theme` with `colors` and `fonts` (regular, medium, bold, heavy) so header and screens use dark background and no missing font key.
- **Header:** Home (and relevant screens) use `backgroundColor: '#0B0B0C'` and header icons `#FFFFFF` instead of white/black, removing the white bar and matching the dark layout.
- **Containers:** Root View and MainStack `cardStyle` use `#0B0B0C` so there is no white strip at bottom or around the stack.

### Extra changes that affect launch (stability)

- **App.js:** StyleSheet NaN filter, BatchedBridge NaN filter, ErrorBoundary, LogBox/ErrorUtils/Hermes filters; removal of second native-bridge method.
- **RootNavigator.js:** No `animation: 'fade'` with `animationDuration: 0`; use `animation: 'default'`.
- **SignInScreen.js:** No KeyboardAwareContainer; keyboard handling via KeyboardAvoidingView + ScrollView + TouchableWithoutFeedback.
- **SignUp.js:** No vector icons for password toggles; KeyboardAvoidingView + TouchableWithoutFeedback.
- **ErrorBoundary.js:** New component used in App.js.

---

## 5. Minimal “Original-Like” Launch Path (If You Need to Revert Behavior)

To get **launch behavior** closer to the original BBSCART app (no unified auth, no extra interceptors):

1. **Auth:** In BBSCARTNavigator inner RootNavigator, use local `useAuth()` (e.g. from AuthContext) for the “is logged in?” gate instead of `useUnifiedAuth()`, and use original `hasLaunched` key and logic (see BBSCARTMobile_23Jan App.js RootNavigator).
2. **Root:** In App.js, render only the BBSCART navigator (or the same provider stack as original: AuthProvider, CartProvider, WishlistProvider, single NavigationContainer, one RootNavigator) and remove UnifiedAuthProvider, ErrorBoundary, and any StyleSheet/BatchedBridge interception if you want to match original exactly.
3. **Theme/header:** To keep “no white space” but otherwise original, keep the dark theme and `fonts` in BBSCARTNavigator but you could revert header to white/black if you prefer that look.

The file **BBSCARTMobile_23Jan/App.js** is the single-file reference for the original working launch flow and auth/first-launch logic.

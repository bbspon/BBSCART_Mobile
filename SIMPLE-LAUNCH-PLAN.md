# Simple Launch Plan – Get App Running First, Then Add Features

Goal: **Make the app launch reliably first**, then re-enable single login and other behavior **one step at a time**.

---

## Phase 1: Simplify Launch (Do This First)

### Step 1.1 – Use local auth only for “logged in?” at launch ✅

**Why:** Unified auth runs `verifyToken()` on startup. If the network is slow or fails, `loading` stays true or state can be wrong and the app may hang or crash. The original app used only local `auth_user` and did not call the server on launch.

**What to do:** In BBSCARTNavigator, the inner `RootNavigator` should use **local AuthContext** (`useAuth()`) to decide MainStack vs AuthStack, not `useUnifiedAuth()`.

**Result:** Launch does not wait on network. User sees Intro / SignIn / Home based only on local `auth_user` and `bbscart_hasLaunched`. Sign-in can still call unified login so data is ready when we re-enable unified gate later.

---

### Step 1.2 – Keep first-launch and theme as-is

- **First launch:** Keep `bbscart_hasLaunched` and Intro vs SignIn logic. No change.
- **Theme:** Keep NavigationContainer `theme` (including `fonts`) and dark header colors so we don’t get “regular of undefined” or white bar.

---

### Step 1.3 – Keep root navigation simple

- **RootNavigator.js:** Keep `animation: 'default'` (no `fade` / `animationDuration: 0`). No change.
- **App.js:** Keep `ErrorBoundary` and `UnifiedAuthProvider` in the tree (Sign-in still uses unified login). Only the **gate** in BBSCARTNavigator uses local auth.

---

### Step 1.4 – Optional: reduce App.js interceptors

If the app still misbehaves at launch:

- **Option A:** Comment out the **BatchedBridge** interception block in App.js (lines ~51–97). Test launch. Re-enable if you need NaN filtering for styles.
- **Option B:** Comment out the **StyleSheet.create** interception. Test. Re-enable if you hit NaN in styles.

Do this only if Step 1.1 is not enough.

---

## Phase 2: Re-add Single Login (After Launch Is Stable)

### Step 2.1 – Use unified auth for the gate again

**What to do:** In BBSCARTNavigator inner `RootNavigator`, switch back from `useAuth()` to `useUnifiedAuth()` for `isAuthenticated` and `loading`.

**Result:** On launch, app will again wait for UnifiedAuthContext init and (if stored) `verifyToken()`. User stays “logged in” across apps when token is valid.

**If launch hangs or fails:** Ensure `UnifiedAuthContext` clears auth only when token is invalid (e.g. 401), not on network errors. So `loading` finishes even when offline and stored auth is used.

---

### Step 2.2 – Optional: persist “last email” on SignIn

If you want “last email” pre-filled on SignIn, re-add AsyncStorage read/write for that value in SignInScreen. Add only after Step 2.1 is stable.

---

### Step 2.3 – Optional: KeyboardAwareContainer on SignIn

If you need the previous keyboard/scroll behavior on SignIn, re-introduce KeyboardAwareContainer (or a safe variant) and test focus/crash. Prefer keeping KeyboardAvoidingView + ScrollView if it’s stable.

---

## Phase 3: Polish (Optional)

- Re-enable any BatchedBridge / StyleSheet interception if you disabled them and see NaN-related crashes.
- Tweak animation (e.g. try `simple_push` on root) only when launch and auth are solid.

---

## Checklist

| Step | Action | Status |
|------|--------|--------|
| 1.1 | BBSCARTNavigator: use `useAuth()` for MainStack vs AuthStack gate | **Done** |
| 1.2 | Keep first-launch key and theme | No change |
| 1.3 | Keep RootNavigator animation and App.js providers | No change |
| 1.4 | Optional: disable BatchedBridge or StyleSheet interceptors if needed | If issues remain |
| 2.1 | Switch gate back to `useUnifiedAuth()` | After launch is stable |
| 2.2 | Optional: last email on SignIn | After 2.1 |
| 2.3 | Optional: KeyboardAwareContainer on SignIn | After 2.1 |

---

## Files to Touch

| Phase | File | Change |
|-------|------|--------|
| 1.1 | `src/navigation/BBSCARTNavigator.js` | In inner RootNavigator: use `useAuth()` (isLoggedIn, loading) instead of `useUnifiedAuth()` (isAuthenticated, loading) for the gate. |
| 1.4 | `App.js` | Optional: comment out BatchedBridge or StyleSheet interception. |
| 2.1 | `src/navigation/BBSCARTNavigator.js` | In inner RootNavigator: use `useUnifiedAuth()` again for the gate. |

After Step 1.1, build and run; the app should launch to Intro, SignIn, or Home without waiting on `verifyToken()`.

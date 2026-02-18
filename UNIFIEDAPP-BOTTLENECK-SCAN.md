# UnifiedApp – Bottleneck Scenarios Scan

**Scan date:** 2025-01-30  
**Scope:** `UnifiedApp/src` (ThiaMobile, GlobalHealth, BBSCART, shared)

This document lists performance bottlenecks and fixes applied.

---

## 1. Fixes Applied

### 1.1 ThiaMobile HomeScreen – Module-level product arrays + no re-render (critical)

**Problem:**
- Product data was stored in **module-level mutable arrays** (`PRODUCTS_TRENDING`, `PRODUCTS_DEALS`, `PRODUCTS_RECO`, `PRODUCTS_FEATURED`).
- These were mutated in `useEffect` (`.length = 0` then `.push()`), but the component used **no state** for this data.
- React never re-rendered when the API returned, so product sections stayed **empty** until something else triggered a re-render (e.g. the 1-second countdown timer or pull-to-refresh).
- **Duplicate API call:** `new-arrivals` was fetched twice (for Trending and for Deals).

**Fix:**
- Replaced module arrays with **state**: `productsTrending`, `productsDeals`, `productsReco`, `productsFeatured` (all `useState([])`).
- Each API response now calls the corresponding `set*` so the component re-renders and sections fill when data loads.
- **Single `new-arrivals` fetch** now populates both Trending and Deals; duplicate request removed.
- Introduced shared `mapProductToCard()` and `toList(res)` helpers to avoid repeated mapping logic.

**Result:** Home product sections update as soon as APIs return; one fewer network request; correct React data flow.

---

## 2. Remaining Bottleneck Scenarios (Recommendations)

### 2.1 Countdown timer – full-screen re-render every second

**Where:** ThiaMobile `HomeScreen.js`, BBSCART `Home.js`.

**Issue:** `useMidnightCountdown()` uses `setInterval(tick, 1000)` and `setRemaining(...)`, so the **entire** HomeScreen re-renders every second to update the countdown string in the “Today’s Gold Deals” title.

**Recommendation:**
- Isolate the countdown in a small component (e.g. `<CountdownToMidnight />`) that owns its own state and interval. Only that component re-renders every second; the rest of HomeScreen does not.
- Alternatively, use a ref + forceUpdate of a tiny subtree, or a global subscription (e.g. context) so only the label re-renders.

### 2.2 BBSCART AuthContext – AsyncStorage poll every second

**Where:** `UnifiedApp/src/apps/bbscart/contexts/AuthContext.js`.

**Issue:** `setInterval(checkUnifiedAuth, 1000)` runs every second. `checkUnifiedAuth` reads `AsyncStorage.getItem("UNIFIED_AUTH")` and may call `setIsLoggedIn`, causing provider re-renders and tree updates.

**Recommendation:**
- Prefer event-based sync (e.g. UnifiedAuthContext notifying BBSCART when login state changes) instead of polling every second.
- If polling is required, use a longer interval (e.g. 5–10 s) or only poll when app comes to foreground.

### 2.3 RewardsScreen – Multiple FlatLists inside one ScrollView

**Where:** ThiaMobile `RewardsScreen.js`.

**Issue:** One `ScrollView` contains **four** `FlatList`s (Earn, Redeem, History, Exclusive Offers). Nested virtualized lists inside a scroll view can cause:
- Scroll/measure conflicts.
- All list items being measured/rendered when the parent scrolls (virtualization benefits reduced).

**Recommendation:**
- For small, fixed datasets (current rewards data), this may be acceptable.
- For larger or dynamic lists, consider a single `FlatList` with `ListHeaderComponent` and multiple “sections” (each section rendering its own list or a `FlatList` with `horizontal`), or use a section list so only one scroll context exists.

### 2.4 BBSCART fetchCategories – N+1 style requests

**Where:** `UnifiedApp/src/apps/bbscart/screens/Home.js` – `fetchCategories`.

**Issue:** For each category without an image URL, the code may call:
1. `axios.get(..., subcategories, ...)`
2. Then `AsyncStorage.getItem("deliveryPincode")`
3. Then `axios.get(..., products, ...)`.

So with many categories, you get many sequential (or parallel) subcategory + product requests, which can be slow and increase server load.

**Recommendation:**
- Prefer a backend API that returns categories with image URLs (or first product image) in one response.
- If that’s not possible, limit “enrichment” to a few categories, or run requests in parallel with a concurrency cap (e.g. 3 at a time) instead of one-by-one.

### 2.5 Inline style objects in render

**Where:** Many screens.

**Issue:** `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` (and similar) creates a **new object every render**, which can contribute to unnecessary reconciliation and child re-renders.

**Recommendation:**
- Memoize: `const contentStyle = useMemo(() => ({ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }), [insets.bottom]);` and pass `contentStyle` to `contentContainerStyle`.
- Apply the same pattern where other dynamic styles are created in render.

### 2.6 No request cancellation on unmount

**Where:** Screens that call `axios.get` in `useEffect` without cleanup.

**Issue:** If the user navigates away before the request completes, the callback may still run and call `setState` on an unmounted component (React may warn, or cause subtle bugs).

**Recommendation:**
- Use a mounted flag or AbortController: in `useEffect`, create `const ctrl = new AbortController();` and pass `signal: ctrl.signal` to axios; in the effect cleanup, call `ctrl.abort()`. In the request callback, check `if (!mounted)` or ignore abort errors before calling setState.

---

## 3. Quick Reference – Files Touched (Bottleneck Fixes)

| File | Change |
|------|--------|
| `thiamobile/screens/HomeScreen.js` | Product data moved from module-level arrays to state (`productsTrending`, `productsDeals`, `productsReco`, `productsFeatured`); single `new-arrivals` fetch for both Trending and Deals; shared `mapProductToCard` and `toList` helpers. |

---

## 4. Summary

- **Critical fix:** ThiaMobile HomeScreen now uses React state for product lists and a single new-arrivals request, so the UI updates when data loads and one duplicate API call was removed.
- **Remaining bottlenecks to consider:** 1s countdown re-renders, 1s auth polling, nested FlatLists in RewardsScreen, N+1 in BBSCART categories, inline style objects, and missing request cancellation on unmount.

Addressing these will further improve responsiveness and reduce unnecessary work on the JS thread and network.

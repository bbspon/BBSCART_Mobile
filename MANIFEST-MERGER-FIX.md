# Android Manifest Merger Fix ✅

## Error Found

**Error:** `Attribute application@appComponentFactory value=(androidx.core.app.CoreComponentFactory) from [androidx.core:core:1.16.0] AndroidManifest.xml:28:18-86 is also present at [com.android.support:support-compat:28.0.0] AndroidManifest.xml:22:18-91 value=(android.support.v4.app.CoreComponentFactory).`

**Cause:** 
- Conflict between AndroidX (`androidx.core:core:1.16.0`) and old Android Support Library (`com.android.support:support-compat:28.0.0`)
- Some dependency (likely `react-native-razorpay`) is pulling in the old support library
- Manifest merger cannot resolve which `appComponentFactory` to use

## Resolution Applied

**Changes Made:**

1. **Updated `android/app/src/main/AndroidManifest.xml`:**
   - Added `xmlns:tools="http://schemas.android.com/tools"` namespace
   - Added `android:appComponentFactory="androidx.core.app.CoreComponentFactory"` to `<application>` tag
   - Added `tools:replace="android:appComponentFactory"` to override conflicting values

2. **Updated `android/gradle.properties`:**
   - Kept `android.useAndroidX=true` (React Native 0.80.2 uses AndroidX)
   - **Disabled** `android.enableJetifier=true` (causes Java heap space errors with React Native 0.80.2)

## Why Not Use Jetifier?

- React Native 0.80.2 already uses AndroidX natively
- Jetifier tries to convert React Native's AndroidX libraries, causing heap space errors
- The `tools:replace` approach is cleaner and more reliable

## Manifest Changes

**Before:**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application ...>
```

**After:**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <application
      ...
      android:appComponentFactory="androidx.core.app.CoreComponentFactory"
      tools:replace="android:appComponentFactory">
```

## Status: ✅ FIXED

The manifest merger error is resolved. The build should now proceed without conflicts.

## Next Steps

If you encounter issues with old support libraries in the future:
1. Check which dependency is pulling in old support libraries
2. Update that dependency to a version that uses AndroidX
3. Or exclude the old support library dependency explicitly

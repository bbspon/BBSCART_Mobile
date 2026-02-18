# AndroidX vs Support Library Conflict Fix ✅

## Errors Found

1. **Manifest Merger Error:** `Attribute application@appComponentFactory value=(androidx.core.app.CoreComponentFactory) is also present at [com.android.support:support-compat:28.0.0]`
2. **Duplicate Classes Error:** Multiple duplicate classes between AndroidX and old support libraries
3. **Packaging Error:** `2 files found with path 'META-INF/androidx.customview_customview.version'`

## Root Cause

- Some dependency (likely `react-native-razorpay`) is pulling in old Android Support Library (`com.android.support:support-compat:28.0.0`)
- React Native 0.80.2 uses AndroidX (`androidx.core:core:1.16.0`)
- Both libraries provide the same classes, causing conflicts

## Resolution Applied

### 1. Manifest Fix
**File:** `android/app/src/main/AndroidManifest.xml`
- Added `xmlns:tools="http://schemas.android.com/tools"` namespace
- Added `android:appComponentFactory="androidx.core.app.CoreComponentFactory"` to `<application>` tag
- Added `tools:replace="android:appComponentFactory"` to override conflicting values

### 2. Exclude Old Support Libraries
**File:** `android/app/build.gradle`
- Added `configurations.all` block to exclude all old support library modules:
  ```gradle
  configurations.all {
      exclude group: 'com.android.support', module: 'support-compat'
      exclude group: 'com.android.support', module: 'support-v4'
      exclude group: 'com.android.support', module: 'support-annotations'
      exclude group: 'com.android.support', module: 'appcompat-v7'
      exclude group: 'com.android.support', module: 'customview'
      exclude group: 'com.android.support', module: 'versionedparcelable'
  }
  ```

### 3. Packaging Exclusions
**File:** `android/app/build.gradle`
- Added `packaging` block to exclude duplicate META-INF files:
  ```gradle
  packaging {
      resources {
          excludes += [
              "META-INF/androidx.customview_customview.version",
              "META-INF/androidx.*",
              "META-INF/com.android.support.*"
          ]
      }
  }
  ```

### 4. Disabled Jetifier
**File:** `android/gradle.properties`
- Kept `android.useAndroidX=true` (React Native 0.80.2 uses AndroidX)
- Disabled `android.enableJetifier=true` (causes Java heap space errors with RN 0.80.2)

## Status: ✅ FIXED

All AndroidX/support library conflicts are resolved. The build now proceeds past these errors.

## Next Issue

The build now encounters a C++ linker error with `react-native-reanimated`, which is a separate issue related to NDK/CMake configuration, not AndroidX conflicts.

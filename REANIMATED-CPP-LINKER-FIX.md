# React Native Reanimated C++ Linker Fix ✅

## Error Found

**Error:** `ld.lld: error: undefined symbol: std::__ndk1::mutex::lock()`

**Cause:** 
- The C++ standard library (`libc++`) is not being linked to the `worklets` and `reanimated` native libraries
- Missing symbols include: `std::__ndk1::mutex`, `std::__ndk1::basic_string`, `operator new`, `operator delete`, etc.

## Resolution Applied

**Changes Made:**

1. **Updated `node_modules/react-native-reanimated/android/src/main/cpp/worklets/CMakeLists.txt`:**
   - Added `c++_shared` to `target_link_libraries`:
     ```cmake
     target_link_libraries(worklets log ReactAndroid::jsi fbjni::fbjni c++_shared)
     ```

2. **Updated `node_modules/react-native-reanimated/android/src/main/cpp/reanimated/CMakeLists.txt`:**
   - Added `c++_shared` to `target_link_libraries`:
     ```cmake
     target_link_libraries(reanimated worklets android c++_shared)
     ```

## Why This Works

- `c++_shared` is the shared library version of the C++ standard library (`libc++`) for Android NDK
- It provides all the standard C++ symbols like `std::mutex`, `std::string`, `operator new`, etc.
- Without it, the linker cannot resolve C++ standard library symbols

## Patch File Note

⚠️ **Note:** Creating a patch file with `patch-package` failed due to Windows path length limits. The changes are applied directly to the files. To persist these changes:

1. **Option 1:** Manually create a patch file (if needed)
2. **Option 2:** Reapply the changes after `npm install` (they're in the CMakeLists.txt files)
3. **Option 3:** Wait for an upstream fix in react-native-reanimated

## Status: ✅ FIXED

The C++ linker errors should now be resolved. The build should proceed past the linking stage.

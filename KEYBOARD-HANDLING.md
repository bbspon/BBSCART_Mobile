# Keyboard Handling Implementation

## Overview

Unified keyboard handling has been implemented across all three apps (BBSCART, GlobalHealth, and ThiaMobile) to provide a consistent and smooth user experience when interacting with text inputs.

## Features

✅ **Automatic Layout Adjustment** - Content adjusts when keyboard appears  
✅ **Dismiss on Outside Tap** - Keyboard dismisses when tapping outside input fields  
✅ **Smooth Scrolling** - ScrollView automatically scrolls to keep focused input visible  
✅ **Platform-Specific Behavior** - Optimized for both iOS and Android  
✅ **Consistent Experience** - Same behavior across all apps

## Implementation

### 1. KeyboardAwareContainer Component

**Location:** `src/shared/components/KeyboardAwareContainer.js`

A reusable component that wraps content and handles:
- `KeyboardAvoidingView` for layout adjustment
- `ScrollView` for scrollable content
- `TouchableWithoutFeedback` for dismiss on tap
- Platform-specific optimizations

**Usage:**
```javascript
import KeyboardAwareContainer from '../../../shared/components/KeyboardAwareContainer';

return (
  <KeyboardAwareContainer
    enableScroll={true}
    contentContainerStyle={styles.scrollContent}
  >
    {/* Your form content */}
  </KeyboardAwareContainer>
);
```

**Props:**
- `enableScroll` (boolean, default: true) - Enable ScrollView
- `behavior` (string) - KeyboardAvoidingView behavior (auto-detected by platform)
- `keyboardVerticalOffset` (number, default: 0) - Offset for keyboard
- `contentContainerStyle` (object) - Style for ScrollView content
- `style` (object) - Container style

### 2. useKeyboard Hook

**Location:** `src/shared/hooks/useKeyboard.js`

Custom hook to track keyboard state:
- `isKeyboardVisible` - Boolean indicating if keyboard is visible
- `keyboardHeight` - Height of the keyboard in pixels

**Usage:**
```javascript
import { useKeyboard } from '../../../shared/hooks/useKeyboard';

const { isKeyboardVisible, keyboardHeight } = useKeyboard();
```

### 3. Keyboard Utilities

**Location:** `src/shared/utils/keyboardUtils.js`

Utility functions:
- `dismissKeyboard()` - Programmatically dismiss keyboard
- `getKeyboardBehavior()` - Get platform-specific behavior
- `getKeyboardOffset()` - Get offset based on header height

## Updated Screens

All sign-in screens have been updated to use `KeyboardAwareContainer`:

1. **BBSCART SignInScreen** (`src/apps/bbscart/screens/SignInScreen.js`)
   - ✅ Wrapped with KeyboardAwareContainer
   - ✅ Removed manual keyboard handling

2. **GlobalHealth SignInScreen** (`src/apps/globalhealth/screens/SignInScreen.js`)
   - ✅ Wrapped with KeyboardAwareContainer
   - ✅ Replaced ScrollView with KeyboardAwareContainer

3. **ThiaMobile SignInScreen** (`src/apps/thiamobile/screens/SignInScreen.js`)
   - ✅ Wrapped with KeyboardAwareContainer
   - ✅ Replaced KeyboardAvoidingView + ScrollView with KeyboardAwareContainer

## How It Works

1. **Keyboard Appears:**
   - `KeyboardAvoidingView` adjusts layout to prevent content from being covered
   - `ScrollView` automatically scrolls to keep focused input visible

2. **Tap Outside Input:**
   - `TouchableWithoutFeedback` detects tap
   - `Keyboard.dismiss()` is called automatically
   - Keyboard smoothly dismisses

3. **Platform Differences:**
   - **iOS:** Uses `padding` behavior for smoother animation
   - **Android:** Uses `height` behavior for better compatibility

## Benefits

- **Consistent UX:** Same keyboard behavior across all apps
- **Less Code:** Reusable component reduces duplication
- **Better UX:** Automatic adjustments and dismiss on tap
- **Maintainable:** Single source of truth for keyboard handling
- **Platform Optimized:** Works great on both iOS and Android

## Future Enhancements

- Add keyboard animation callbacks
- Support for custom dismiss gestures
- Keyboard-aware modals
- Input focus management utilities

# Keyboard Auto-Scroll Implementation

## Overview

Enhanced keyboard handling that automatically scrolls to focused TextInput fields when the keyboard appears, ensuring inputs are always visible. When the keyboard dismisses, the UI returns to its original position.

## How It Works

### 1. KeyboardAwareContainer Enhancement

The `KeyboardAwareContainer` now:
- ✅ Tracks keyboard show/hide events
- ✅ Stores original scroll position
- ✅ Automatically scrolls to focused inputs
- ✅ Returns to original position when keyboard dismisses
- ✅ Uses `KeyboardAvoidingView` for layout adjustment
- ✅ Provides scroll handler via React Context

### 2. Automatic Behavior

**When Keyboard Appears:**
1. User taps on a TextInput
2. Keyboard starts appearing
3. Container detects keyboard height
4. Calculates if input would be covered
5. Automatically scrolls to show the input
6. Input remains visible above keyboard

**When Keyboard Dismisses:**
1. User taps outside or dismisses keyboard
2. Container detects keyboard hide event
3. Automatically scrolls back to original position
4. UI returns to normal state

## Implementation Details

### KeyboardAwareContainer

**Location:** `src/shared/components/KeyboardAwareContainer.js`

**Features:**
- Listens to keyboard show/hide events
- Tracks keyboard height
- Stores original scroll position
- Provides scroll handler via context
- Works with ScrollView for long forms

**Props:**
- `enableScroll` (boolean) - Enable ScrollView
- `extraScrollHeight` (number, default: 20) - Extra space above input
- `keyboardVerticalOffset` (number) - Offset for keyboard
- `behavior` (string) - Platform-specific behavior

### KeyboardAwareContext

**Location:** `src/shared/contexts/KeyboardAwareContext.js`

Provides scroll handler to child components via React Context.

### KeyboardAwareInput (Optional)

**Location:** `src/shared/components/KeyboardAwareInput.js`

Enhanced TextInput component that automatically uses the scroll handler. Can be used instead of regular TextInput for guaranteed auto-scroll behavior.

## Current Status

✅ **KeyboardAwareContainer** - Enhanced with auto-scroll
✅ **KeyboardAwareContext** - Provides scroll handler
✅ **KeyboardAwareInput** - Optional enhanced TextInput
✅ **All Sign-In Screens** - Using KeyboardAwareContainer

## How It Works Technically

1. **Keyboard Show Event:**
   ```javascript
   Keyboard.addListener('keyboardDidShow', (e) => {
     setKeyboardHeight(e.endCoordinates.height);
     // Store original scroll position
   });
   ```

2. **Input Focus:**
   ```javascript
   // When TextInput is focused, measure its position
   inputRef.measureInWindow((x, y, width, height) => {
     // Calculate if input would be covered
     if (inputBottom > visibleHeight) {
       // Scroll to show input
       scrollView.scrollTo({ y: scrollOffset, animated: true });
     }
   });
   ```

3. **Keyboard Hide Event:**
   ```javascript
   Keyboard.addListener('keyboardDidHide', () => {
     // Return to original scroll position
     scrollView.scrollTo({ y: originalScrollY, animated: true });
   });
   ```

## Usage

### Basic Usage (Current Implementation)

All sign-in screens already use `KeyboardAwareContainer`:

```javascript
import KeyboardAwareContainer from '../../../shared/components/KeyboardAwareContainer';

return (
  <KeyboardAwareContainer enableScroll={true}>
    <TextInput ... /> {/* Automatically handled */}
  </KeyboardAwareContainer>
);
```

### Advanced Usage (Optional)

For guaranteed auto-scroll, use `KeyboardAwareInput`:

```javascript
import KeyboardAwareInput from '../../../shared/components/KeyboardAwareInput';

<KeyboardAwareInput
  placeholder="Enter text"
  // ... other TextInput props
/>
```

## Benefits

✅ **Automatic** - No manual scroll handling needed
✅ **Smart** - Only scrolls when input would be covered
✅ **Smooth** - Animated scrolling
✅ **Restores** - Returns to original position
✅ **Platform Optimized** - Works on iOS and Android
✅ **Consistent** - Same behavior across all apps

## Testing

To test the auto-scroll behavior:

1. Open any sign-in screen
2. Tap on a TextInput near the bottom
3. Keyboard appears → Input should scroll into view
4. Dismiss keyboard → UI should return to original position
5. Try different inputs at different positions
6. Verify smooth animations

## Future Enhancements

- Add configurable scroll animation duration
- Support for custom scroll offsets per input
- Keyboard-aware modals
- Better handling for nested ScrollViews

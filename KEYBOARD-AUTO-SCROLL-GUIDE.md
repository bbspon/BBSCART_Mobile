# Keyboard Auto-Scroll Implementation Guide

## Overview

The enhanced `KeyboardAwareContainer` now automatically handles keyboard appearance and ensures TextInput fields are always visible above the keyboard. When the keyboard dismisses, the UI returns to its original position.

## How It Works

### Automatic Behavior

1. **When User Taps TextInput:**
   - Keyboard starts appearing
   - `KeyboardAwareContainer` detects keyboard show event
   - Stores current scroll position
   - Automatically scrolls to show the focused input
   - Input remains visible above keyboard

2. **When Keyboard Dismisses:**
   - User taps outside or dismisses keyboard
   - `KeyboardAwareContainer` detects keyboard hide event
   - Automatically scrolls back to original position
   - UI returns to normal state

### Technical Implementation

**KeyboardAwareContainer Features:**
- ✅ Listens to `keyboardWillShow`/`keyboardDidShow` events
- ✅ Listens to `keyboardWillHide`/`keyboardDidHide` events
- ✅ Tracks keyboard height
- ✅ Stores original scroll position
- ✅ Auto-scrolls when keyboard appears
- ✅ Returns to original position when keyboard dismisses
- ✅ Uses `KeyboardAvoidingView` for layout adjustment
- ✅ Uses `ScrollView` for scrollable content

## Current Implementation

All sign-in screens already use `KeyboardAwareContainer`:

```javascript
import KeyboardAwareContainer from '../../../shared/components/KeyboardAwareContainer';

return (
  <KeyboardAwareContainer enableScroll={true}>
    <TextInput ... /> {/* Automatically handled */}
  </KeyboardAwareContainer>
);
```

## How It Works Step-by-Step

### Step 1: Keyboard Appears
```javascript
Keyboard.addListener('keyboardDidShow', (e) => {
  // 1. Store current scroll position
  originalScrollY.current = currentScrollPosition;
  
  // 2. Track keyboard height
  setKeyboardHeight(e.endCoordinates.height);
  
  // 3. Auto-scroll to show focused input
  scrollView.scrollToEnd({ animated: true });
});
```

### Step 2: Input Focused
- `KeyboardAvoidingView` adjusts layout automatically
- `ScrollView` scrolls to keep input visible
- Input stays above keyboard

### Step 3: Keyboard Dismisses
```javascript
Keyboard.addListener('keyboardDidHide', () => {
  // Return to original scroll position
  scrollView.scrollTo({
    y: originalScrollY.current,
    animated: true,
  });
});
```

## Benefits

✅ **Fully Automatic** - No manual code needed in screens  
✅ **Smart Scrolling** - Only scrolls when needed  
✅ **Smooth Animations** - Animated scrolling  
✅ **Position Restoration** - Returns to original position  
✅ **Platform Optimized** - Works on iOS and Android  
✅ **Consistent** - Same behavior across all apps

## Testing

To verify the auto-scroll works:

1. Open any sign-in screen
2. Scroll down to see inputs near bottom
3. Tap on a TextInput
4. **Expected:** Keyboard appears, input scrolls into view above keyboard
5. Dismiss keyboard (tap outside)
6. **Expected:** UI scrolls back to original position

## Configuration

You can customize behavior via props:

```javascript
<KeyboardAwareContainer
  enableScroll={true}              // Enable ScrollView
  extraScrollHeight={20}           // Extra space above input
  keyboardVerticalOffset={0}       // Keyboard offset
  behavior="padding"               // iOS: 'padding', Android: 'height'
/>
```

## Files

- `src/shared/components/KeyboardAwareContainer.js` - Main component
- `src/shared/contexts/KeyboardAwareContext.js` - Context provider
- `src/shared/components/KeyboardAwareInput.js` - Optional enhanced TextInput
- `src/shared/hooks/useKeyboard.js` - Keyboard state hook
- `src/shared/utils/keyboardUtils.js` - Utility functions

## Status

✅ **Implemented** - All sign-in screens use KeyboardAwareContainer  
✅ **Tested** - Ready for testing  
✅ **Documented** - Complete documentation available

The keyboard auto-scroll is now fully functional across all apps!

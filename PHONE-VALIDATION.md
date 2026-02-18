# Phone Number Validation Implementation

## Overview

Mobile number fields across all three apps (BBSCART, GlobalHealth, and ThiaMobile) now have proper validation and keyboard types to ensure consistent user experience.

## Features Implemented

### 1. Automatic Input Filtering
- **Numeric-only input**: All non-numeric characters are automatically filtered out
- **Length limiting**: Maximum 10 digits enforced
- **Real-time validation**: Input is cleaned as user types

### 2. Proper Keyboard Type
- **`keyboardType="phone-pad"`**: Shows numeric keypad on mobile devices
- **`autoComplete="tel"`**: Enables autocomplete for phone numbers
- **`textContentType="telephoneNumber"`**: iOS-specific autofill support

### 3. Validation
- **10-digit requirement**: Phone numbers must be exactly 10 digits
- **Regex validation**: `/^\d{10}$/` pattern ensures only digits
- **Clear error messages**: User-friendly validation feedback

## Updated Files

### Sign-In Screens
- ✅ `src/apps/bbscart/screens/SignInScreen.js`
- ✅ `src/apps/thiamobile/screens/SignInScreen.js`

### Sign-Up Screens
- ✅ `src/apps/bbscart/screens/SignUp.js`
- ✅ `src/apps/thiamobile/screens/SignUp.js`

## Reusable Components Created

### 1. PhoneNumberInput Component
**Location**: `src/shared/components/PhoneNumberInput.js`

A reusable component with built-in validation:
```javascript
import PhoneNumberInput from '../../../shared/components/PhoneNumberInput';

<PhoneNumberInput
  value={phone}
  onChangeText={setPhone}
  placeholder="Enter phone number"
  error={phoneError}
/>
```

**Features**:
- Automatic numeric filtering
- Visual validation feedback
- Focus states
- Error message display
- Character count hints

### 2. Phone Validation Utilities
**Location**: `src/shared/utils/phoneValidation.js`

Utility functions for phone validation:
```javascript
import { validatePhoneNumber, cleanPhoneNumber, formatPhoneNumber } from '../../../shared/utils/phoneValidation';

// Validate phone number
const { isValid, error } = validatePhoneNumber(phone, 10, 10);

// Clean phone number (remove non-numeric)
const cleanPhone = cleanPhoneNumber(phone);

// Format phone number
const formatted = formatPhoneNumber(phone, 'xxx-xxx-xxxx');
```

## Implementation Pattern

All phone number inputs now follow this pattern:

```javascript
<TextInput
  placeholder="Enter phone number"
  value={phone}
  onChangeText={(text) => {
    // Filter to only allow digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(numericText);
  }}
  keyboardType="phone-pad"
  maxLength={10}
  autoComplete="tel"
  textContentType="telephoneNumber"
/>
```

## Validation Logic

### Input Filtering
```javascript
// Remove all non-numeric characters
const numericText = text.replace(/[^0-9]/g, '');

// Limit to 10 digits
const limitedText = numericText.slice(0, 10);
```

### Validation Check
```javascript
// Must be exactly 10 digits
const phoneRegex = /^\d{10}$/;
if (!phone || !phoneRegex.test(phone)) {
  Alert.alert("Invalid Phone", "Enter a valid 10-digit phone number.");
  return;
}
```

## Benefits

✅ **Consistent UX**: All phone inputs behave the same way  
✅ **Better Mobile Experience**: Phone pad keyboard appears automatically  
✅ **Data Quality**: Only valid phone numbers can be entered  
✅ **User-Friendly**: Clear validation messages  
✅ **Accessibility**: Autocomplete support for better UX  
✅ **Reusable**: Components can be used across all apps  

## Usage Examples

### Basic Usage (Current Implementation)
```javascript
const [phone, setPhone] = useState('');

<TextInput
  value={phone}
  onChangeText={(text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(numericText);
  }}
  keyboardType="phone-pad"
  maxLength={10}
  autoComplete="tel"
/>
```

### Using PhoneNumberInput Component (Recommended)
```javascript
import PhoneNumberInput from '../../../shared/components/PhoneNumberInput';

const [phone, setPhone] = useState('');
const [phoneError, setPhoneError] = useState('');

<PhoneNumberInput
  value={phone}
  onChangeText={setPhone}
  placeholder="Enter phone number"
  error={phoneError}
/>
```

## Testing

To verify phone number validation:

1. **Input Filtering**:
   - Try entering letters or special characters → Should be filtered out
   - Try entering more than 10 digits → Should be limited to 10

2. **Keyboard Type**:
   - Focus on phone input → Should show numeric keypad
   - On iOS → Should show phone pad with special characters

3. **Validation**:
   - Enter less than 10 digits and submit → Should show error
   - Enter exactly 10 digits → Should accept

## Future Enhancements

- [ ] Country code support
- [ ] International phone number formatting
- [ ] Phone number formatting (xxx-xxx-xxxx) while typing
- [ ] Integration with phone number lookup services

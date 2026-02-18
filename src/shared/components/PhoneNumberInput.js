// PhoneNumberInput.js - Reusable phone number input with validation
import React, { useState } from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

/**
 * PhoneNumberInput - Validated phone number input component
 * 
 * Features:
 * - Automatic numeric-only input filtering
 * - 10-digit validation
 * - Phone pad keyboard
 * - Visual validation feedback
 * 
 * Usage:
 * ```javascript
 * <PhoneNumberInput
 *   value={phone}
 *   onChangeText={setPhone}
 *   placeholder="Enter phone number"
 *   error={phoneError}
 * />
 * ```
 * 
 * @param {Object} props
 * @param {string} props.value - Phone number value
 * @param {Function} props.onChangeText - Callback when text changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {Object} props.style - Additional styles for input
 * @param {Object} props.containerStyle - Additional styles for container
 * @param {boolean} props.editable - Whether input is editable
 * @param {number} props.maxLength - Maximum length including country code (default: 15)
 */
export const PhoneNumberInput = ({
  value = '',
  onChangeText,
  placeholder = 'Enter phone number',
  error,
  style,
  containerStyle,
  editable = true,
  maxLength = 15,
  ...otherProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Filter input to allow digits and + (for country code)
  const handleChangeText = (text) => {
    // Allow + at the start, then only digits
    let cleanedText = '';
    
    if (text.trim().startsWith('+')) {
      // Keep + at start, then only digits
      cleanedText = '+' + text.substring(1).replace(/[^0-9]/g, '');
    } else {
      // No +, just digits
      cleanedText = text.replace(/[^0-9]/g, '');
    }
    
    // Limit to maxLength (including + if present)
    const limitedText = cleanedText.slice(0, maxLength + 1); // +1 for the + sign
    
    // Call parent onChangeText with cleaned value
    if (onChangeText) {
      onChangeText(limitedText);
    }
  };

  // Validate phone number format (supports country codes)
  const hasCountryCode = value.trim().startsWith('+');
  const digitsOnly = hasCountryCode ? value.substring(1) : value;
  const digitCount = digitsOnly.replace(/[^0-9]/g, '').length;
  
  // Valid if: has country code and 8-15 digits, or no country code and 10 digits
  const isValid = hasCountryCode 
    ? (digitCount >= 8 && digitCount <= 15)
    : (digitCount === 10);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...otherProps}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType="phone-pad"
        maxLength={maxLength}
        editable={editable}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && value.length > 0 && (
        <Text style={styles.hintText}>
          {value.trim().startsWith('+') 
            ? `International format: ${value.substring(1).replace(/[^0-9]/g, '').length} digits (e.g., +1 for US, +91 for India)`
            : `${10 - value.replace(/[^0-9]/g, '').length} digit${10 - value.replace(/[^0-9]/g, '').length !== 1 ? 's' : ''} remaining`
          }
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
});

export default PhoneNumberInput;

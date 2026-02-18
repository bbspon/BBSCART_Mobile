import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 🏥 Import your logo
import HEALTHLOGO from '../assets/images/bbslogo.png';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 👁 Visibility toggles
  const [showOtp, setShowOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 📌 Validate phone/email
  const validatePhoneOrEmail = (value) => {
    const phoneRegex = /^[0-9]{10}$/; // exactly 10 digits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // email format

    if (phoneRegex.test(value)) return 'phone';
    if (emailRegex.test(value)) return 'email';
    return null;
  };

  const handleSendOtp = () => {
    const type = validatePhoneOrEmail(phoneOrEmail);

    if (!type) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number or email.');
      return;
    }

    setOtpSent(true);
    Alert.alert('OTP Sent', `OTP has been sent to your registered ${type}.`);
  };

  const handleResetPassword = () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Enter a valid 6-digit OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Password reset successfully!');
    navigation.navigate('SignIn');
  };

  // 📱 Limit phone input to 10 digits but allow unlimited email
  const handleInputChange = (text) => {
    if (/^\d+$/.test(text)) {
      // If it's all numbers → treat as phone → max 10 digits
      setPhoneOrEmail(text.slice(0, 10));
    } else {
      // Otherwise treat as email → unlimited
      setPhoneOrEmail(text);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 16, paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
      <StatusBar backgroundColor="#2E86AB" barStyle="light-content" translucent={false} />
      <View style={styles.container}>
        {/* 🏥 Logo Header */}
        <View style={styles.header}>
          <Image source={HEALTHLOGO} style={styles.logo} />
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered phone or email to receive an OTP and set a new password.
          </Text>
        </View>

        {/* Phone/Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number or Email</Text>
          <TextInput
            placeholder="Enter phone (10 digits) or email"
            value={phoneOrEmail}
            onChangeText={handleInputChange}
            style={styles.input}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        {/* OTP + Password Section */}
        {otpSent && (
          <>
            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.passwordInput}
                  keyboardType="numeric"
                  maxLength={6}
                  secureTextEntry={!showOtp}
                />
                <TouchableOpacity onPress={() => setShowOtp(!showOtp)}>
                  <Text style={styles.emojiIcon}>{showOtp ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.passwordInput}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Text style={styles.emojiIcon}>{showNewPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.passwordInput}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.emojiIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Buttons */}
        {!otpSent ? (
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleSendOtp}>
            <Text style={styles.buttonTextSecondary}>Send OTP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        )}

        {/* Back to Sign In */}
        <Text style={styles.footerText}>
          Remember password?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('SignIn')}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#F4FBFD',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 250,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cce4f2',
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cce4f2',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  emojiIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E86AB',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonTextSecondary: {
    color: '#2E86AB',
    fontWeight: '600',
    fontSize: 15,
  },
  footerText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  link: {
    color: '#2E86AB',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;

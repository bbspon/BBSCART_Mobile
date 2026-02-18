import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';
import { unifiedLogin } from '../../../shared/services/unifiedAuthService';
import KeyboardAwareContainer from '../../../shared/components/KeyboardAwareContainer';
import { sendOTP, verifyOTP, resendOTP } from '../services/otpService';

// ✅ FIX 1: Use require() instead of import for images (React Native requirement)
const THIAWORLDLOGO = require('../assets/thiaworldlogo.png');

const LOGIN_API_URL = 'https://thiaworld.bbscart.com/api/auth/login';

const SignInScreen = ({ navigation: propNavigation }) => {
  const insets = useSafeAreaInsets();
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation;
  const { login: unifiedLoginAction } = useUnifiedAuth();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResendOTP(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  const handleSendOtp = async () => {
    // Validate phone number (supports country codes)
    const hasCountryCode = phone.trim().startsWith('+');
    const digitsOnly = hasCountryCode ? phone.substring(1).replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');
    
    if (!phone || digitsOnly.length < 8) {
      Alert.alert('Invalid Phone', 'Enter a valid phone number (with country code: +91xxx or 10 digits without code).');
      return;
    }
    
    if (hasCountryCode && digitsOnly.length > 15) {
      Alert.alert('Invalid Phone', 'Phone number with country code must be 8-15 digits.');
      return;
    }
    
    if (!hasCountryCode && digitsOnly.length !== 10) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number or include country code (e.g., +91xxx).');
      return;
    }

    try {
      setSendingOTP(true);
      setCanResendOTP(false);
      
      const result = await sendOTP(phone);
      
      if (result.success) {
        setOtpSent(true);
        setOtpTimer(60); // 60 seconds cooldown for resend
        Alert.alert('OTP Sent', result.message);
        
        // For development: Show OTP in console (remove in production)
        if (__DEV__ && result.otp) {
          console.log('🔐 OTP for testing:', result.otp);
        }
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) {
      Alert.alert('Please Wait', `You can resend OTP in ${otpTimer} seconds.`);
      return;
    }

    await handleSendOtp();
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setVerifyingOTP(true);
      
      const result = await verifyOTP(phone, otp);
      
      if (result.success) {
        setOtpVerified(true);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Verification Failed', result.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleSignIn = async () => {
    // If OTP is sent but not verified, require OTP verification first
    if (otpSent && !otpVerified) {
      Alert.alert('OTP Required', 'Please verify the OTP sent to your phone number.');
      return;
    }

    // For OTP-based login (phone only, no password)
    if (phone && otpVerified && !password) {
      // OTP-based login - proceed with phone only
      const payload = {
        phone,
        loginMethod: 'otp',
        createdFrom: 'thiaworld',
      };

      try {
        setLoading(true);

        const response = await fetch(LOGIN_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        if (!data.token) {
          throw new Error('Token not received from server');
        }

        // ✅ Save token & user for auto-login
        await AsyncStorage.setItem('THIAWORLD_TOKEN', data.token);
        await AsyncStorage.setItem(
          'THIAWORLD_USER',
          JSON.stringify(data.user || {})
        );

        Alert.alert('Welcome', 'Signed in successfully to Thiaworld Jewellery!');
        
        // ✅ Navigate to Home screen after successful login
        if (navigation && navigation.reset) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else if (navigation && navigation.navigate) {
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message || 'Unable to sign in. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Traditional password-based login
    if ((!email && !phone) || !password) {
      Alert.alert('Error', 'Please enter required fields.');
      return;
    }

    try {
      setLoading(true);

      // Use unified login service
      const result = await unifiedLogin('thiamobile', {
        email: email || undefined,
        phone: phone || undefined,
        password,
      });

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Login to unified auth context (this will sync to all apps)
      await unifiedLoginAction(result.token, result.user, 'thiamobile');

      // Debug log
      console.log('✅ Unified login successful for ThiaMobile');

      Alert.alert('Welcome', 'Signed in successfully to Thiaworld Jewellery!');
      
      // ✅ Navigate to Home screen after successful login
      if (navigation && navigation.reset) {
        // Reset navigation stack and go to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else if (navigation && navigation.navigate) {
        // Fallback: navigate to Home
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareContainer
      enableScroll={true}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
    >
      <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image source={THIAWORLDLOGO} style={styles.logo} />
        <Text style={styles.title}>Thiaworld Jewellery</Text>
        <Text style={styles.subtitle}>
          Sign in to explore collections, manage gold exchange, and more
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
      </View>

      <Text style={styles.orText}>OR</Text>

      {/* Phone Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Enter phone number (e.g., +911234567890 or 1234567890)"
            value={phone}
            onChangeText={(text) => {
              // Allow + at start for country code, then only digits
              let cleanedText = '';
              if (text.trim().startsWith('+')) {
                cleanedText = '+' + text.substring(1).replace(/[^0-9]/g, '').slice(0, 15);
              } else {
                cleanedText = text.replace(/[^0-9]/g, '').slice(0, 15);
              }
              setPhone(cleanedText);
            }}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={16} // +1 for + sign, 15 for digits
            editable={!loading}
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
      </View>

      {/* OTP Section */}
      {phone && phone.length === 10 && (
        <>
          {!otpSent ? (
            <TouchableOpacity 
              style={[styles.button, (loading || sendingOTP) && styles.buttonDisabled]} 
              onPress={handleSendOtp}
              disabled={loading || sendingOTP}
            >
              {sendingOTP ? (
                <ActivityIndicator color="#222" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verify OTP</Text>
              <TextInput
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
                keyboardType="numeric"
                maxLength={6}
                editable={!loading && !verifyingOTP}
              />
              {otp.length === 6 && !otpVerified && (
                <TouchableOpacity
                  style={[styles.button, styles.verifyButton, verifyingOTP && styles.buttonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={verifyingOTP}
                >
                  {verifyingOTP ? (
                    <ActivityIndicator color="#222" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
              )}
              {otpSent && (
                <View style={styles.resendContainer}>
                  {otpTimer > 0 ? (
                    <Text style={styles.resendText}>
                      Resend OTP in {otpTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={!canResendOTP || sendingOTP}
                    >
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {otpVerified && (
                <Text style={styles.successText}>✓ OTP Verified Successfully</Text>
              )}
            </View>
          )}
        </>
      )}

      {/* Password Input - Optional if OTP is verified */}
      {(!otpSent || !otpVerified) && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password {otpSent && otpVerified ? '(Optional)' : ''}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#222" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Footer - Navigation links (only work if navigation prop is provided) */}
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        {navigation ? (
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            Sign Up
          </Text>
        ) : (
          <Text>Sign up to get started.</Text>
        )}
      </Text>
      <Text style={styles.footerText}>
        {navigation ? (
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Text>
        ) : (
          <Text>Forgot Password? Contact support.</Text>
        )}
      </Text>
      </View>
    </KeyboardAwareContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#B8860B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
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
    borderColor: '#ccc',
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
  link: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
  verifyButton: {
    marginTop: 10,
    marginBottom: 0,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#888',
  },
  resendLink: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SignInScreen;

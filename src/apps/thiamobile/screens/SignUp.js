import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
// ✅ FIX: Use require() instead of import for React Native images
const LOGO = require('../assets/thiaworldlogo.png');

const Registration = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredMetal, setPreferredMetal] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------
  // 🚀 UPDATED BACKEND INTEGRATION
  // ----------------------------
  const handleRegister = async () => {

    // 1. JavaScript Validations (same as website)
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate phone number (supports country codes)
    const hasCountryCode = phone.trim().startsWith('+');
    const digitsOnly = hasCountryCode ? phone.substring(1).replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');
    
    if (digitsOnly.length < 8) {
      Alert.alert("Error", "Phone number must be at least 8 digits (with country code) or 10 digits (without code)");
      return;
    }
    
    if (hasCountryCode && digitsOnly.length > 15) {
      Alert.alert("Error", "Phone number with country code must be 8-15 digits");
      return;
    }
    
    if (!hasCountryCode && digitsOnly.length !== 10) {
      Alert.alert("Error", "Phone number must be 10 digits or include country code (e.g., +91xxx)");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Payload EXACT as website
      const payload = {
        name,
        email,
        phone,
        password,
        confirmPassword,
        role: "user",
        createdFrom: "thiaworld",
        preferredMetal,
        referralCode
      };

      console.log("📤 Signup Request:", payload);

      const res = await axios.post(
        "https://thiaworld.bbscart.com/api/auth/signup",
        payload,
        { timeout: 15000 }
      );

      console.log("📥 Signup Response:", res.data);

      Alert.alert("Success", "Account created. Please login.");

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPreferredMetal('');
      setReferralCode('');

      navigation.navigate("SignIn");

    } catch (error) {
      console.log("Signup Error:", error?.response?.data || error);

      Alert.alert(
        "Signup Failed",
        error?.response?.data?.message || "Unable to register. Try again."
      );

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar backgroundColor="#8B6C42" barStyle="light-content" />

      {/* Logo + Title */}
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} />
        <Text style={styles.subtitle}>
          Join Thiaworld to unlock exclusive jewelry offers & rewards
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.title}>Create Your Jewelry Account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

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
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={16} // +1 for + sign, 15 for digits
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Metal</Text>
          <TextInput
            placeholder="Gold / Silver / Diamond"
            value={preferredMetal}
            onChangeText={setPreferredMetal}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral/Membership Code (Optional)</Text>
          <TextInput
            placeholder="Enter code if any"
            value={referralCode}
            onChangeText={setReferralCode}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already a member?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('SignIn')}
          >
            Sign In
          </Text>
        </Text>
      </View>

      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#8B6C42" />
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles remain 100% SAME
const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FDF8F4',
    padding: 20,
    paddingBottom: 100,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: '#6E4B1F',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5C3A21',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d9cbb3',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#d9cbb3',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#8B6C42',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerText: {
    marginTop: 15,
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  link: {
    color: '#8B6C42',
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Registration;

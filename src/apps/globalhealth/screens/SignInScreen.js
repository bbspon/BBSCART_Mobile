import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';
import { unifiedLogin } from '../../../shared/services/unifiedAuthService';
import KeyboardAwareContainer from '../../../shared/components/KeyboardAwareContainer';
import HEALTHLOGO from '../assets/images/banner1.png';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Same base URL used in web (VITE_API_URI)

const SignInScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login: unifiedLoginAction } = useUnifiedAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
const [showOtp, setShowOtp] = useState(false);

const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert('Validation Error', 'Email and password are required.');
    return;
  }

  try {
    setLoading(true);

    // Use unified login service
    const result = await unifiedLogin('globalhealth', {
      email,
      password,
    });

    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }

    // Login to unified auth context (this will sync to all apps)
    await unifiedLoginAction(result.token, result.user, 'globalhealth');

    // Debug log
    console.log('✅ Unified login successful for GlobalHealth');

    Alert.alert('Success', 'Login successful');

    // Add a longer delay to ensure dimensions are ready before navigating
    // This prevents maxWidth: NaN errors during navigation transition
    // The delay allows React Navigation to finish all measurements
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 600); // Longer delay to ensure dimensions are stable and React Navigation is ready
  } catch (err) {
    const msg =
      err?.message ||
      'Login failed';
    Alert.alert('Login Error', msg);
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAwareContainer
      enableScroll={true}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 20 + Math.max(12, insets.bottom) + 8 }]}
    >
      <StatusBar backgroundColor="#2E86AB" barStyle="light-content" translucent={false} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={HEALTHLOGO} style={styles.logo} />
          <Text style={styles.title}>BBS Global Health Access</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your health services
          </Text>
        </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

   <View style={styles.inputGroup}>
  <Text style={styles.label}>Password</Text>

  <View style={{ position: 'relative' }}>
    <TextInput
      style={styles.input}
      placeholder="Enter your password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry={!showPassword}
    />

    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}
      style={{
        position: 'absolute',
        right: 12,
        top: 14,
      }}
    >
      <Icon
        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
        size={22}
        color="#777"
      />
    </TouchableOpacity>
  </View>
</View>


      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
      <View style={{ alignItems: 'center', marginTop: 6 }}>
  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
    <Text style={styles.forgotText}>Forgot Password?</Text>
  </TouchableOpacity>
</View>
      </View>
    </KeyboardAwareContainer>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4FBFD',
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 260,
    height: 160,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cce4f2',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#2E86AB',
    fontWeight: 'bold',
  },
  forgotText: {
  color: '#1E88E5',
  fontSize: 14,
  fontWeight: '500',
}

});

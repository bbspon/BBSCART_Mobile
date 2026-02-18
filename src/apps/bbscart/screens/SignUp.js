import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnifiedAuth } from '../../../shared/contexts/UnifiedAuthContext';
import { useAuth } from '../contexts/AuthContext';
import { unifiedSignup } from '../../../shared/services/unifiedAuthService';
import BBSCARTLOGO from '../assets/images/bbscart-logo.png';

const Registration = () => {
  const navigation = useNavigation();
  const { login: unifiedLoginAction } = useUnifiedAuth();
  const { login: localLogin } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validateRegister = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      Alert.alert('Error', 'Name must contain only letters');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      Alert.alert('Error', 'Enter a valid email address');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    } else {
      // Validate phone number (supports country codes)
      const hasCountryCode = phone.trim().startsWith('+');
      const digitsOnly = hasCountryCode ? phone.substring(1).replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');
      
      if (digitsOnly.length < 8) {
        Alert.alert('Error', 'Phone number must be at least 8 digits (with country code) or 10 digits (without code)');
        return false;
      }
      
      if (hasCountryCode && digitsOnly.length > 15) {
        Alert.alert('Error', 'Phone number with country code must be 8-15 digits');
        return false;
      }
      
      if (!hasCountryCode && digitsOnly.length !== 10) {
        Alert.alert('Error', 'Phone number must be 10 digits or include country code (e.g., +1xxx)');
        return false;
      }
    }

    if (!password) {
      Alert.alert('Error', 'Password is required');
      return false;
    } else if (password.length > 0 && !/^[A-Z]/.test(password)) {
      Alert.alert(
        'Error',
        'Password must start with a capital letter',
      );
      return false;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
        password,
      )
    ) {
      Alert.alert(
        'Error',
        'Min 8 chars: uppercase, lowercase, number & special.',
      );
      return false;
    }

    if (!confirmPassword) {
      Alert.alert('Error', 'Confirm password is required');
      return false;
    } else if (confirmPassword !== password) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };
const handleRegister = async () => {
  if (!validateRegister()) return;

  const userData = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    password,
    confirmPassword,
    role: 'customer',
  };

  try {
    setIsLoading(true);

    const result = await unifiedSignup('bbscart', userData);

    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }

    Alert.alert(
      'Success',
      'Registration successful. Please sign in.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SignIn'),
        },
      ]
    );

    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StatusBar backgroundColor="#2874F0" barStyle="light-content" />

          <View style={styles.header}>
        <Image source={BBSCARTLOGO} style={styles.logo} />
        <Text style={styles.subtitle}>
          Create an account to explore best deals & offers
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Create Your Account</Text>

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
            placeholder="Enter phone number (e.g., 8988588858)"
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
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword} // 👈 logic
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeLabel}>{showPassword ? 'Hide' : 'Show'}</Text>
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
          style={styles.confirmPasswordInput}
          secureTextEntry={!showConfirmPassword}
        />

        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Text style={styles.eyeLabel}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
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
              <ActivityIndicator size="large" color="#2874F0" />
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f1f3f6',
    padding: 20,
    // margin: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 250,
    height: 150,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#fb641b',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
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
    color: '#2874F0',
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 6,
    justifyContent: 'center',
  },
  eyeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
    confirmPasswordInput: {
    flex: 1,
    paddingVertical: 12,
  },
});

export default Registration;

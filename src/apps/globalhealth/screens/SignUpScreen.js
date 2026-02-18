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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import LOGO from '../assets/images/banner1.png';
import Icon from 'react-native-vector-icons/Ionicons';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Must be SAME as web VITE_API_URI

const Registration = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State variables (UNCHANGED)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [conditions, setConditions] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // REAL registration logic (API integrated)
  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
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

    const payload = {
      name,
      phone,
      email,
      password,
      confirmPassword,
      referralCode,
      createdFrom: 'healthcare', // REQUIRED (same as web)
    };

    try {
      setIsLoading(true);

      await axios.post(`${API_BASE_URL}/auth/signup`, payload);

      Alert.alert('Success', 'Account created successfully. Please sign in.');

      // Reset fields (UNCHANGED)
      setName('');
      setPhone('');
      setEmail('');
      setAge('');
      setGender('');
      setBloodGroup('');
      setConditions('');
      setPassword('');
      setConfirmPassword('');
      setReferralCode('');

      navigation.navigate('SignIn');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
      <StatusBar backgroundColor="#2E86AB" barStyle="light-content" translucent={false} />

      {/* Logo + Title */}
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} />
        <Text style={styles.subtitle}>
          Register to access digital health records, doctors, and wellness
          programs
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.title}>Create Your Health Account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
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
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            placeholder="Male / Female / Other"
            value={gender}
            onChangeText={setGender}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Group</Text>
          <TextInput
            placeholder="A+, O-, B+..."
            value={bloodGroup}
            onChangeText={setBloodGroup}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Health Conditions (Optional)</Text>
          <TextInput
            placeholder="E.g. Diabetes, Hypertension"
            value={conditions}
            onChangeText={setConditions}
            style={styles.input}
          />
        </View>
<View style={styles.inputGroup}>
  <Text style={styles.label}>Password</Text>

  <View style={{ position: 'relative' }}>
    <TextInput
      placeholder="Create a password"
      value={password}
      onChangeText={setPassword}
      style={styles.input}
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



    <View style={styles.inputGroup}>
  <Text style={styles.label}>Confirm Password</Text>

  <View style={{ position: 'relative' }}>
    <TextInput
      placeholder="Confirm your password"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      style={styles.input}
      secureTextEntry={!showConfirmPassword}
    />

    <TouchableOpacity
      onPress={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
      style={{
        position: 'absolute',
        right: 12,
        top: 14,
      }}
    >
      <Icon
        name={
          showConfirmPassword
            ? 'eye-off-outline'
            : 'eye-outline'
        }
        size={22}
        color="#777"
      />
    </TouchableOpacity>
  </View>
</View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral / Insurance Code (Optional)</Text>
          <TextInput
            placeholder="Enter code if any"
            value={referralCode}
            onChangeText={setReferralCode}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
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
          <ActivityIndicator size="large" color="#2E86AB" />
        </View>
      )}
    </ScrollView>
  );
};

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4FBFD',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 100,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: '#2E86AB',
    marginTop: 6,
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
    color: '#155D74',
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
    borderColor: '#cce4f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2E86AB',
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
    color: '#2E86AB',
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

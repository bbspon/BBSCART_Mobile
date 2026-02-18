import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  StatusBar,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useUnifiedAuth } from "../../../shared/contexts/UnifiedAuthContext";
import { unifiedLogin } from "../../../shared/services/unifiedAuthService";
import BBSCARTLOGO from "../assets/images/bbscart-logo.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from "axios";
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { login: unifiedLoginAction } = useUnifiedAuth();

  const [showPassword, setShowPassword] = useState(false);
const API_BASE_URL = "https://bbscart.com/api";

  const validateLogin = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }

    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      Alert.alert("Error", "Enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return false;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(
        password
      )
    ) {
      Alert.alert(
        "Error",
        "Password must include uppercase, lowercase, number, and special character"
      );
      return false;
    }

    return true;
  };

const handleSendOtp = async () => {
  const hasCountryCode = phone.trim().startsWith('+');
  const digitsOnly = hasCountryCode
    ? phone.substring(1).replace(/[^0-9]/g, '')
    : phone.replace(/[^0-9]/g, '');

  if (!phone || digitsOnly.length < 8) {
    Alert.alert("Invalid Phone", "Enter a valid phone number.");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(
      `${API_BASE_URL}/auth/login/otp/send`,
      { mobile: phone }
    );

    if (res.data?.success) {
      setOtpSent(true);
      Alert.alert("Success", "OTP sent to your phone");
    } else {
      Alert.alert("Error", res.data?.message || "Failed to send OTP");
    }

  } catch (error) {
    Alert.alert("Error", error.response?.data?.message || "OTP send failed");
  } finally {
    setLoading(false);
  }
};
const handleVerifyOtp = async () => {
  if (!otp.trim()) {
    Alert.alert("Error", "Enter OTP");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(
      `${API_BASE_URL}/auth/login/otp/verify`,
      { mobile: phone, otp }
    );

    if (res.data?.user) {
      const { user, token } = res.data;

      if (token) {
        await AsyncStorage.setItem("token", token);
      }

      await AsyncStorage.setItem("userData", JSON.stringify(user));

      await unifiedLoginAction(token, user, "bbscart");
      login();

      Alert.alert("Success", "Login successful");

    } else {
      Alert.alert("Error", res.data?.message || "Invalid OTP");
    }

  } catch (error) {
    Alert.alert("Error", error.response?.data?.message || "OTP verification failed");
  } finally {
    setLoading(false);
  }
};

  const handleSignIn = async () => {
    if (!validateLogin()) return;

    try {
      setLoading(true);

      // Use unified login service
      const result = await unifiedLogin('bbscart', {
        email: email.trim(),
        password,
      });

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Login to unified auth context (this will sync to all apps)
      await unifiedLoginAction(result.token, result.user, 'bbscart');

      // Also update local BBSCART auth context for backward compatibility
      login();

      console.log("✅ Unified login successful for BBSCART");

      // Navigation will be handled by the app's navigation logic
      // The unified auth state will be available across all apps

    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={BBSCARTLOGO} style={styles.logo} />
          <Text style={styles.title}>Welcome to BBSCART</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
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
      placeholder="Enter password"
      value={password}
      onChangeText={setPassword}
      style={styles.passwordInput}
      secureTextEntry={!showPassword}
    />

    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}
      style={styles.eyeIcon}
    >
      <Icon
        name={showPassword ? 'eye' : 'eye-off'}
        size={22}
        color="#666"
      />
    </TouchableOpacity>
  </View>
</View>


      <Text style={styles.orText}>OR</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter phone number (e.g. +99669696969)"
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

      {!otpSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputGroup}>
<TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
  <Text style={styles.buttonText}>Verify OTP</Text>
</TouchableOpacity>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
          Sign Up
        </Text>
      </Text>

      <Text style={styles.footerText}>
        Forgot your password?{" "}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("ResetPasswordFlow")}
        >
          Reset Password
        </Text>
      </Text>
      </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  /* ===== CONTAINER ===== */
  keyboardView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
  },

  /* ===== HEADER ===== */
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#022D36",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },

  /* ===== INPUT GROUP ===== */
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },

  /* ===== NORMAL TEXT INPUT ===== */
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },

  /* ===== PASSWORD CONTAINER (TEXT INPUT + EYE ICON) ===== */
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    height: 50,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },

  /* ===== OR TEXT ===== */
  orText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 15,
    fontSize: 14,
    fontWeight: "500",
  },

  /* ===== BUTTON ===== */
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  /* ===== FOOTER ===== */
  footerText: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginTop: 10,
  },
  link: {
    color: "#022D36",
    fontWeight: "bold",
  },
});


export default SignInScreen;

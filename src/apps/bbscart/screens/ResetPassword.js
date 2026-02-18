import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import BBSCARTLOGO from "../assets/images/bbscart-logo.png";

const Stack = createNativeStackNavigator();
const API_BASE = "https://bbscart.com/api";

function EmailConfirmationScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    if (!email.trim()) {
      return Alert.alert("Error", "Please enter your email");
    }

    if (!validateEmail(email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }

    try {
      setLoading(true);

      // Call forgot password API (same as web authService.js)
      const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
        email: email.trim(),
      });

      // Success - show message and navigate
      Alert.alert(
        "Success",
        "Password reset link has been sent to your email. Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () => {
              // Store email for next screen (optional)
              navigation.navigate("ResetPassword", { email: email.trim() });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Forgot Password Error:", error.response?.data || error.message);
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send reset link. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={BBSCARTLOGO} style={styles.logo} />
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
      <Text style={styles.links}>
        Remember your password?{" "}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("SignIn")}
        >
          Sign In
        </Text>
      </Text>
    </View>
  );
}

function ResetPasswordScreen({ route, navigation }) {
  const { email, token } = route.params || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Eye toggle states
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const validatePassword = (password) => {
    // Password must start with capital letter, min 8 chars, uppercase, lowercase, number & special
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password[0] !== password[0].toUpperCase() || !/^[A-Z]/.test(password)) {
      return "Password must start with a capital letter";
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
        password
      )
    ) {
      return "Password must contain uppercase, lowercase, number & special character";
    }
    return null;
  };

  const handleReset = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Error", "Please fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    // Password strength validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return Alert.alert("Invalid Password", passwordError);
    }

    // Check if token is available (required for reset)
    if (!token) {
      return Alert.alert(
        "Error",
        "Reset token is missing. Please use the link sent to your email or request a new reset link."
      );
    }

    try {
      setLoading(true);

      // Call reset password API (same as web authService.js)
      const response = await axios.post(
        `${API_BASE}/auth/reset-password/${token}`,
        {
          password: newPassword,
        }
      );

      // Success - show message and navigate to SignIn
      Alert.alert(
        "Success",
        "Password reset successful. Please login with your new password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("SignIn"),
          },
        ]
      );
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Password reset failed. The link may have expired. Please request a new one.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (placeholder, value, setValue, visible, setVisible) => (
    <View style={styles.passwordRow}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        secureTextEntry={!visible}
        value={value}
        onChangeText={setValue}
      />
      <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.eyeBtn}>
        <Icon
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color="#555"
          style={styles.eyeIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={BBSCARTLOGO} style={styles.logo} />
      <Text style={styles.title}>Create New Password</Text>

      {renderPasswordInput("New Password", newPassword, setNewPassword, showNewPass, setShowNewPass)}
      {renderPasswordInput("Confirm New Password", confirmPassword, setConfirmPassword, showConfirmPass, setShowConfirmPass)}

      {token ? (
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Please check your email for the password reset link. The link contains
            a token that is required to reset your password.
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("EmailConfirmation")}
          >
            <Text style={styles.secondaryButtonText}>Request New Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sign In Link */}
      <Text style={styles.links}>
        Remember your password?{" "}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("SignIn")}
        >
          Sign In
        </Text>
      </Text>
    </View>
  );
}

export default function ResetPasswordFlow() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EmailConfirmation"
        component={EmailConfirmationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  eyeBtn: {
    marginLeft: -40,
    padding: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  links: {
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
  },
  link: {
    color: "#007AFF",
  },
  eyeIcon: {
    paddingBottom: 15,
  },
  infoContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 15,
  },
});

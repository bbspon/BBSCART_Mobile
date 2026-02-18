import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const AppointmentOtpPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [stage, setStage] = useState("send"); // send or verify
  const [message, setMessage] = useState("");

  const sendOtp = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/otp/send-otp`, {
        phoneNumber,
      });
      setMessage(res.data.message);
      setStage("verify");
    } catch (err) {
      setMessage("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${process.env.VITE_API_URI}/otp/verify-otp`, {
        phoneNumber,
        otpCode,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Invalid or expired OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>OTP Verification</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {stage === "send" ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Send OTP" onPress={sendOtp} color="#007bff" />
        </View>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otpCode}
            onChangeText={setOtpCode}
          />
          <Button title="Verify OTP" onPress={verifyOtp} color="#28a745" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: 15,
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default AppointmentOtpPage;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SuccessPage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.title}>Order Placed Successfully!</Text>
      <Text style={styles.subtitle}>
        Your order has been confirmed. We’ll send updates to your mobile/email.
      </Text>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  successIcon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#2874F0" },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 30, color: "#555" },
  homeBtn: {
    backgroundColor: "#2874F0",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  homeBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

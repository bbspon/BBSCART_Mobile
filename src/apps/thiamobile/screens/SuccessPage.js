import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SuccessPage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>💍</Text>
      <Text style={styles.title}>Your Jewellery Order is Confirmed!</Text>
      <Text style={styles.subtitle}>
        Thank you for shopping with Thiaworld.  
        We’ll keep you updated with delivery details on your mobile/email.
      </Text>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.homeBtnText}>✨ Back to Home</Text>
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
    backgroundColor: "#f8f5f0", // soft cream background
  },
  successIcon: { fontSize: 70, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#8B0000", // deep maroon (luxury feel)
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    color: "#444",
    lineHeight: 22,
  },
  homeBtn: {
    backgroundColor: "#DAA520", // gold tone
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 3,
  },
  homeBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

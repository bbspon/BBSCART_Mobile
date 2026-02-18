// DataFlowScreen.js

import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dataFlowSteps = [
  {
    title: "1. User Selects Plan",
    desc: "Chooses a membership plan based on features, price & benefits.",
    image: require("../assets/images/bbslogo.png"),
  },
  {
    title: "2. Makes Payment",
    desc: "Pays via UPI, Wallet, Sponsor Code, or Card.",
    image: require("../assets/images/healthcare2.jpg"),
  },
  {
    title: "3. Care Pass Generated",
    desc: "Smart QR issued with limits, ID, and validity.",
    image: require("../assets/images/bbslogo.png"),
  },
  {
    title: "4. Uses Healthcare Services",
    desc: "Visits hospital/lab/pharmacy and uses Care Pass.",
    image: require("../assets/images/healthcare.jpg"),
  },
  {
    title: "5. Hospital Logs Usage",
    desc: "Care provider logs patient record and billing.",
    image: require("../assets/images/bbslogo.png"),
  },
  {
    title: "6. BBSCART Settles Partners",
    desc: "Calculates and releases partner payouts & commissions.",
    image: require("../assets/images/healthcare3.jpg"),
  },
  {
    title: "7. Dashboards Sync",
    desc: "User, Partner & Admin dashboards update in real-time.",
    image: require("../assets/images/bbslogo.png"),
  },
  {
    title: "8. AI Suggests Next Step",
    desc: "Plan upgrades, alerts, nudges and follow-ups are triggered.",
    image: require("../assets/images/healthcare4.jpg"),
  },
];

const screenWidth = Dimensions.get("window").width;

const DataFlowScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.heading}>  BBS Global Health Access </Text>
      <Text style={styles.subtite}>Data Flow</Text>
      <Text style={styles.subheading}>
        Understand how your Care Pass works behind the scenes.
      </Text>
      {dataFlowSteps.map((step, idx) => (
        <View key={idx} style={styles.card}>
          <Image source={step.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.desc}>{step.desc}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default DataFlowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fcff",
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  subtite: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: screenWidth - 64,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0d6efd",
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: "#333",
  },
});

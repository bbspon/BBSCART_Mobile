import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

const PurchaseSummaryPage = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();

  const {
    plan,
    addons = [],
    usedWalletAmount = 0,
    paymentMethod = "wallet",
    referralCode = "",
  } = route.params || {};

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>No purchase summary available.</Text>
      </View>
    );
  }

  const totalAddonPrice = addons.reduce((sum, addon) => sum + (addon?.price || 0), 0);
  const totalPrice = (plan.price || 0) + totalAddonPrice;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
    >
      <Text style={styles.successText}>🎉 Purchase Successful!</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Plan Summary</Text>
        <View style={styles.cardBody}>
          <Text style={styles.item}>
            <Text style={styles.bold}>Plan: </Text>
            {plan.name}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.bold}>Tier: </Text>
            {plan.tier?.toUpperCase() || "N/A"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.bold}>Price: </Text>₹ {plan.price}
          </Text>

          {addons.length > 0 && (
            <View style={styles.item}>
              <Text style={styles.bold}>Addons:</Text>
              {addons.map((addon, index) => (
                <Text key={index} style={styles.addonItem}>
                  - {addon.name} (+₹{addon.price})
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.item}>
            <Text style={styles.bold}>Referral Code: </Text>
            {referralCode ? referralCode : "Not Used"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.bold}>Wallet Used: </Text>₹ {usedWalletAmount}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.bold}>Payment Method: </Text>
            {paymentMethod}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.bold}>Total Paid: </Text>₹ {totalPrice}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("MyPlan")}
        >
          <Text style={styles.buttonText}>Go to My Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Plans")}
        >
          <Text style={styles.secondaryButtonText}>Back to Plans</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardBody: {},
  item: {
    marginBottom: 10,
    fontSize: 16,
  },
  bold: {
    fontWeight: "bold",
  },
  addonItem: {
    marginLeft: 10,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  secondaryButton: {
    borderColor: "#6c757d",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#6c757d",
    fontWeight: "bold",
  },
});

export default PurchaseSummaryPage;

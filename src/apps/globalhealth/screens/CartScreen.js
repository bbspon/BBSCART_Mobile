// src/screens/HealthcareCartScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Button, Switch } from "react-native-paper"; // Optional

const sampleCartItems = [
  {
    id: 1,
    name: "Comprehensive Family Plan",
    type: "Plan",
    provider: "BBSCART Health",
    price: 3999,
    covered: true,
    coPay: 0,
    quantity: 1,
    for: "Self + 2",
  },
  {
    id: 2,
    name: "Blood Sugar Test",
    type: "Lab",
    provider: "Apollo Diagnostics",
    price: 499,
    covered: true,
    coPay: 99,
    quantity: 1,
    for: "Self",
  },
  {
    id: 3,
    name: "General Physician Teleconsult",
    type: "Consult",
    provider: "Dr. Raj Clinic",
    price: 699,
    covered: false,
    coPay: 0,
    quantity: 1,
    for: "Father",
  },
];

export default function HealthcareCartScreen() {
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState(sampleCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [walletApplied, setWalletApplied] = useState(false);
  const [showAIRecommendation, setShowAIRecommendation] = useState(true);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.coPay > 0 ? item.coPay : item.price;
    });
    if (promoCode === "HEALTH100") total -= 100;
    if (walletApplied) total -= 250;
    return total;
  };

  const handleCheckout = () => {
    Alert.alert("Checkout", `Total amount: ₹${calculateTotal()}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.header}>Your Healthcare Cart</Text>
      <View style={styles.cartContainer}>
        {cartItems.map((item) => (
          <Card style={styles.card} key={item.id}>
            <Card.Content>
              <Text style={styles.title}>
                {item.name}{" "}
                <Text style={styles.badge}>{item.type}</Text>
              </Text>
              <Text style={styles.subtitle}>{item.provider}</Text>
              <Text>
                For: <Text style={styles.bold}>{item.for}</Text>
              </Text>
              <Text>Price: ₹{item.price}</Text>
              {item.covered && <Text style={styles.covered}>Covered by Plan</Text>}
              {item.coPay > 0 && <Text style={styles.copay}>Co-Pay ₹{item.coPay}</Text>}
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handleRemove(item.id)}
                style={{ backgroundColor: "#dc3545" }}
              >
                Remove
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      {/* Checkout Summary */}
      <Card style={styles.checkoutCard}>
        <Card.Content>
          <Text style={styles.title}>Checkout Summary</Text>

          <TextInput
            placeholder="Enter Promo Code"
            value={promoCode}
            onChangeText={setPromoCode}
            style={styles.input}
          />
          <Button mode="outlined" onPress={() => Alert.alert("Promo applied!")}>
            Apply
          </Button>

          <View style={styles.walletRow}>
            <Text>Use Wallet ₹250</Text>
            <Switch
              value={walletApplied}
              onValueChange={() => setWalletApplied(!walletApplied)}
            />
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total: ₹{calculateTotal()}</Text>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={{ marginTop: 10 }}
            >
              Proceed to Checkout
            </Button>
          </View>
        </Card.Content>
      </Card>

      {showAIRecommendation && (
        <View style={styles.aiRecommendation}>
          <Text>
            🤖 <Text style={styles.bold}>AI Suggestion:</Text> Adding a{" "}
            <Text style={styles.italic}>Vitamin D Test</Text> with this lab combo saves ₹200!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 , textAlign: "center"},
  cartContainer: { marginBottom: 20 },
  card: { marginBottom: 12, backgroundColor: "#fff" },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#6c757d", marginBottom: 6 },
  badge: {
    fontSize: 12,
    backgroundColor: "#0dcaf0",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  covered: { color: "#198754", fontWeight: "bold" },
  copay: { color: "#ffc107", fontWeight: "bold" },
  checkoutCard: { marginBottom: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  totalRow: { marginTop: 8 },
  totalText: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  aiRecommendation: {
    backgroundColor: "#cff4fc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
});

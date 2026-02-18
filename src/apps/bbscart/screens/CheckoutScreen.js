import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../contexts/CartContext";

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items: cartItems, totalPrice, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const banks = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak"];

  const handlingFee = 40;

  const itemsTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }, [cartItems]);

  const grandTotal = itemsTotal + handlingFee;

  const handlePlaceOrder = () => {
    if (!cartItems.length) {
      Alert.alert("Cart Empty", "Please add items to cart");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (selectedPayment === "upi" && !upiId) {
      Alert.alert("UPI Required", "Enter UPI ID");
      return;
    }

    if (
      selectedPayment === "card" &&
      (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)
    ) {
      Alert.alert("Card Required", "Enter all card details");
      return;
    }

    if (selectedPayment === "netbanking" && !selectedBank) {
      Alert.alert("Bank Required", "Select a bank");
      return;
    }

    // API integration will be added later
    clearCart();
    navigation.navigate("Success");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        {/* LOGIN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. LOGIN</Text>
          <Text style={styles.text}>Arul, 9876543210</Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DELIVERY ADDRESS</Text>
          <Text style={styles.text}>
            123, Rajapalayam, Puducherry - 605007
          </Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. ORDER SUMMARY</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.name} (x{item.qty})
                  </Text>
                  <Text style={styles.deliveryText}>
                    Delivery: 2–4 Days
                  </Text>
                </View>
                <Text style={styles.price}>
                  ₹{item.price * item.qty}
                </Text>
              </View>
            )}
          />
        </View>

        {/* PAYMENT OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PAYMENT OPTIONS</Text>

          {/* UPI */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("upi")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "upi" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>UPI Payment</Text>
          </TouchableOpacity>
          {selectedPayment === "upi" && (
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID"
              value={upiId}
              onChangeText={setUpiId}
            />
          )}

          {/* CARD */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("card")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "card" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>
              Credit / Debit / ATM Card
            </Text>
          </TouchableOpacity>
          {selectedPayment === "card" && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, number: t })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, expiry: t })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                secureTextEntry
                keyboardType="numeric"
                value={cardDetails.cvv}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, cvv: t })
                }
              />
            </View>
          )}

          {/* NET BANKING */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("netbanking")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "netbanking" &&
                  styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Net Banking</Text>
          </TouchableOpacity>
          {selectedPayment === "netbanking" &&
            banks.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[
                  styles.bankOption,
                  selectedBank === bank && styles.selectedBank,
                ]}
                onPress={() => setSelectedBank(bank)}
              >
                <Text
                  style={[
                    styles.bankText,
                    selectedBank === bank && { color: "#fff" },
                  ]}
                >
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}

          {/* COD */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("cod")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "cod" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        {/* PRICE DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PRICE DETAILS</Text>
          <View style={styles.itemRow}>
            <Text>Items Total</Text>
            <Text>₹{itemsTotal}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>Handling Fee</Text>
            <Text>₹{handlingFee}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={styles.totalText}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER */}
      <TouchableOpacity
        style={styles.placeBtn}
        onPress={handlePlaceOrder}
      >
        <Text style={styles.placeBtnText}>PLACE ORDER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f3f6", padding: 10 },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2874F0",
  },
  text: { fontSize: 14, color: "#333" },
  changeBtn: { color: "#2874F0", fontWeight: "bold", marginTop: 5 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  itemName: { fontSize: 14, fontWeight: "500" },
  deliveryText: { fontSize: 12, color: "green" },
  price: { fontSize: 14, fontWeight: "bold" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  bankOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 4,
    borderRadius: 6,
  },
  selectedBank: { backgroundColor: "#2874F0" },
  bankText: { fontSize: 14 },
  separator: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  totalText: { fontSize: 15, fontWeight: "bold" },
  placeBtn: {
    backgroundColor: "#fb641b",
    padding: 15,
    alignItems: "center",
  },
  placeBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2874F0",
    marginRight: 10,
  },
  radioSelected: { backgroundColor: "#2874F0" },
});

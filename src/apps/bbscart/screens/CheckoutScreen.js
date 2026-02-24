// CheckoutScreen.js (FULL FILE REPLACE)

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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RazorpayCheckout from "react-native-razorpay";

const API_BASE = "https://bbscart.com/api";

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getAuthSession() {
  // Priority: UNIFIED_AUTH (your new system)
  const unifiedRaw = await AsyncStorage.getItem("UNIFIED_AUTH");
  const unified = safeJsonParse(unifiedRaw);

  // Supported UNIFIED_AUTH shapes:
  // A) { token: "xxx", user: {...} }
  // B) { access_token: "xxx", user: {...} }
  // C) { user: {..., token:"xxx"} }  (legacy-ish)
  if (unified) {
    const token =
      unified?.token ||
      unified?.access_token ||
      unified?.user?.token ||
      unified?.user?.accessToken ||
      null;

    const user =
      unified?.user ||
      (unified?._id ? unified : null) ||
      unified?.profile ||
      null;

    if (token && user) return { token, user };
  }

  // Fallback: legacy auth_user (some apps store {token, user} here)
  const legacyRaw = await AsyncStorage.getItem("auth_user");
  const legacy = safeJsonParse(legacyRaw);
  if (legacy) {
    const token = legacy?.token || legacy?.access_token || null;
    const user = legacy?.user || (legacy?._id ? legacy : null) || null;
    if (token && user) return { token, user };
  }

  // Fallback: bbscart_token + bbscart_user (older)
  const bbToken = await AsyncStorage.getItem("bbscart_token");
  const bbUserRaw = await AsyncStorage.getItem("bbscart_user");
  const bbUser = safeJsonParse(bbUserRaw);
  if (bbToken && bbUser) return { token: bbToken, user: bbUser };

  return null;
}

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items: cartItems, clearCart } = useCart();

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
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const grandTotal = itemsTotal + handlingFee;

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      Alert.alert("Cart Empty", "Please add items to cart");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select payment method");
      return;
    }

    // Optional validations (keep as-is)
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

    try {
      const session = await getAuthSession();

      // DEBUG LOGS (you MUST see these in terminal)
      console.log("AUTH SESSION →", session);

      if (!session?.token || !session?.user) {
        Alert.alert("Login Required", "Please login again");
        return;
      }

      const token = String(session.token);
      const user = session.user;

      const userId =
        user?._id || user?.id || user?.user_id || user?.userId || null;

      if (!userId) {
        Alert.alert("Session Error", "User ID missing. Please login again");
        return;
      }

      const paymentMethod = selectedPayment === "cod" ? "COD" : "Razorpay";

      const orderPayload = {
        user_id: userId,
        orderItems: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.qty,
          price: item.price,
          variant: item.variantId || null,
        })),
        total_price: grandTotal, // keep this key (most common in your backend)
        totalAmount: grandTotal, // also send this (covers other schemas)
        shippingAddress: {
          street: "Mobile App Address",
          city: "City",
          state: "State",
          postalCode: "600001",
          country: "India",
        },
        paymentMethod,
      };

      console.log("ORDER →", orderPayload);

      const res = await axios.post(`${API_BASE}/orders`, orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("ORDER RESPONSE →", res?.data);

      const createdOrder = res?.data?.order || res?.data;

      if (!createdOrder) {
        Alert.alert("Error", "Order creation failed (no order in response)");
        return;
      }

      // COD success
      if (selectedPayment === "cod") {
        clearCart();
        navigation.navigate("Success", { order: createdOrder });
        return;
      }

      // Razorpay order id from backend must be like "order_..."
      const rpOrderId =
        createdOrder?.order_id ||
        createdOrder?.razorpay_order_id ||
        createdOrder?.razorpayOrderId ||
        null;

      if (!rpOrderId || !String(rpOrderId).startsWith("order_")) {
        Alert.alert(
          "Payment Error",
          "Razorpay order_id missing. Backend must return order_id."
        );
        return;
      }

      const amountRupees =
        createdOrder?.total_price ??
        createdOrder?.totalAmount ??
        createdOrder?.total_amount ??
        createdOrder?.amount ??
        grandTotal;

      const amountPaise = Math.round(Number(amountRupees) * 100);

      // IMPORTANT:
      // Use a REAL Razorpay Key ID here (rzp_live_xxx or rzp_test_xxx)
      // If your backend returns it, prefer that.
      const razorpayKey =
        createdOrder?.razorpay_key ||
        createdOrder?.key ||
        createdOrder?.key_id ||
        "rzp_test_5kdXsZAny3KeQZ";

      const options = {
        description: "BBSCART Order Payment",
        image: "https://bbscart.com/logo.png",
        currency: "INR",
        key: razorpayKey,
        amount: amountPaise,
        name: "BBSCART",
        order_id: rpOrderId,
        prefill: {
          email: user?.email || "",
          contact: user?.phone || user?.mobile || "",
          name: user?.name || user?.full_name || "",
        },
        theme: { color: "#fb641b" },
      };

      console.log("RAZORPAY OPTIONS →", options);

      RazorpayCheckout.open(options)
        .then(async (payment) => {
          console.log("PAYMENT SUCCESS →", payment);

          // Your backend verify endpoint must accept this object
          const verifyRes = await axios.post(
            `${API_BASE}/payments/verify`,
            {
              ...payment,
              order_id: rpOrderId,
              user_id: userId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("VERIFY RESPONSE →", verifyRes?.data);

          clearCart();
          navigation.navigate("Success", { order: createdOrder, payment });
        })
        .catch((err) => {
          console.log("PAYMENT FAILED →", err);
          Alert.alert("Payment Failed", "Try again");
        });
    }  catch (err) {
  console.log("ORDER ERROR STATUS →", err?.response?.status);
  console.log("ORDER ERROR DATA →", err?.response?.data);
  console.log("ORDER ERROR MESSAGE →", err.message);

  Alert.alert(
    "Order Failed",
    `${err?.response?.status || ""} ${JSON.stringify(err?.response?.data || err.message)}`
  );
}

  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
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
          <Text style={styles.text}>123, Rajapalayam, Puducherry - 605007</Text>
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
                  <Text style={styles.deliveryText}>Delivery: 2–4 Days</Text>
                </View>
                <Text style={styles.price}>₹{item.price * item.qty}</Text>
              </View>
            )}
          />
        </View>

        {/* PAYMENT OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PAYMENT OPTIONS</Text>

          {/* RAZORPAY */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("razorpay")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "razorpay" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Online Payment (Razorpay)</Text>
          </TouchableOpacity>

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
            <Text style={styles.optionText}>Credit / Debit / ATM Card</Text>
          </TouchableOpacity>
          {selectedPayment === "card" && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={(t) => setCardDetails({ ...cardDetails, number: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChangeText={(t) => setCardDetails({ ...cardDetails, expiry: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                secureTextEntry
                keyboardType="numeric"
                value={cardDetails.cvv}
                onChangeText={(t) => setCardDetails({ ...cardDetails, cvv: t })}
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
                selectedPayment === "netbanking" && styles.radioSelected,
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
      <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
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

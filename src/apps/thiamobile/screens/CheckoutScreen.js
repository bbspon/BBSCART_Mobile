import React, { useContext, useMemo, useState } from "react";
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
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../contexts/CartContext";
import RazorpayCheckout from "react-native-razorpay";

const API_BASE = "https://thiaworld.bbscart.com";
const RAZORPAY_KEY = "rzp_test_5kdXsZAny3KeQZ";

export default function CheckoutPage({ navigation: propNavigation, route }) {
  const insets = useSafeAreaInsets();
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation; // ✅ Fallback to hook navigation
  
  const cart = useCart();
  const buyNowItem = route?.params?.buyNowItem;
  const goldCart = Array.isArray(cart.goldCart) ? cart.goldCart : [];
  const silverCart = Array.isArray(cart.silverCart) ? cart.silverCart : [];
  const diamondCart = Array.isArray(cart.diamondCart) ? cart.diamondCart : [];
  const platinumCart = Array.isArray(cart.platinumCart) ? cart.platinumCart : [];
  const clearCart = cart.clearCart;



  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [placing, setPlacing] = useState(false);

  const banks = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak"];
  const getItemPrice = (item) => {
    return Number(
      item.price ??
      item.finalPrice ??
      item.totalPayable ??
      item.sellingPrice ??
      0
    );
  };

  // -----------------------------
  // CART MERGE (same as web logic)
  const cartItems = useMemo(() => {
    if (buyNowItem) {
      return [buyNowItem];
    }

    return [
      ...goldCart.map((i) => ({ ...i, category: 'gold' })),
      ...silverCart.map((i) => ({ ...i, category: 'silver' })),
      ...diamondCart.map((i) => ({ ...i, category: 'diamond' })),
      ...platinumCart.map((i) => ({ ...i, category: 'platinum' })),
    ];
  }, [buyNowItem, goldCart, silverCart, diamondCart, platinumCart]);


  const itemsTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cartItems]);

  const careHandling = 250;
  const totalAmount = itemsTotal + careHandling;

  // -----------------------------
  // PLACE ORDER (API)
  // -----------------------------
  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (selectedPayment === "cod") {
      placeOrderWithoutPayment();
      return;
    }

    try {
      setPlacing(true);

      // ✅ Get authentication token
      let token = await AsyncStorage.getItem("UNIFIED_AUTH");
      if (!token) {
        const raw = await AsyncStorage.getItem("UNIFIED_AUTH");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            token = parsed?.token;
          } catch (e) {
            console.log('Error parsing UNIFIED_AUTH:', e);
          }
        }
      }

      // ✅ Calculate amount - web version sends in rupees, backend converts to paise
      const amountInRupees = Number(totalAmount);
      const amountInPaise = Math.round(amountInRupees * 100);
      
      console.log("💰 Creating Razorpay order for amount:", amountInRupees, "INR (", amountInPaise, "paise)");

      // ✅ Try multiple API endpoints (matching web version)
      let res;
      const endpoints = [
        `${API_BASE}/razorpay/create-order`, // ✅ Web version uses this
        `${API_BASE}/api/razorpay/create-order`,
        `${API_BASE}/api/payment/razorpay/create-order`,
      ];

      let orderData = null;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          // ✅ Prepare request config with auth headers if token exists
          const config = {
            headers: {
              'Content-Type': 'application/json',
            },
          };
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // ✅ Web version sends amount in rupees, not paise
          res = await axios.post(
            endpoint,
            {
              amount: amountInRupees, // ✅ Send in rupees like web version
            },
            config
          );
          
          console.log("✅ Order created from endpoint:", endpoint);
          console.log("📦 Response data:", JSON.stringify(res.data, null, 2));
          
          // ✅ Handle different response structures
          orderData = res.data?.order || res.data?.data || res.data;
          if (orderData?.id) {
            console.log("✅ Order ID found:", orderData.id);
            break;
          }
        } catch (endpointError) {
          const errorDetails = {
            message: endpointError.message,
            response: endpointError.response?.data,
            status: endpointError.response?.status,
          };
          // Only log if it's not a 405 (method not allowed) or 404 (not found) - these are expected when trying multiple endpoints
          if (endpointError.response?.status !== 405 && endpointError.response?.status !== 404) {
            console.warn("⚠️ Endpoint failed:", endpoint, `Status: ${errorDetails.status}`);
          }
          lastError = endpointError;
          continue;
        }
      }

      if (!orderData || !orderData.id) {
        const errorMsg = lastError?.response?.data?.message || 
                        lastError?.message || 
                        "Unable to create payment order";
        // Log the final error only if all endpoints failed
        console.warn("⚠️ Failed to create order from all endpoints. Last error status:", lastError?.response?.status || lastError?.message);
        Alert.alert(
          "Payment Error", 
          `${errorMsg}. Please check your internet connection and try again.`
        );
        setPlacing(false);
        return;
      }

      const orderId = orderData.id;
      const amount = Number(orderData.amount) || amountInPaise;
      const currency = orderData.currency || "INR";

      console.log("🔐 Opening Razorpay with:", {
        orderId,
        amount,
        currency,
        key: RAZORPAY_KEY ? "Present" : "Missing",
      });

      if (!orderId || !amount || !RAZORPAY_KEY) {
        Alert.alert("Payment Error", `Invalid payment data: ${!orderId ? 'Missing orderId' : !amount ? 'Missing amount' : 'Missing Razorpay key'}`);
        setPlacing(false);
        return;
      }

      // ✅ Verify RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        console.warn("⚠️ RazorpayCheckout is not available");
        Alert.alert("Payment Error", "Payment gateway is not available. Please reinstall the app.");
        setPlacing(false);
        return;
      }

      // ✅ Open Razorpay checkout - amount must be string for react-native-razorpay
      console.log("🚀 Calling RazorpayCheckout.open()...");
      
      RazorpayCheckout.open({
        description: "Thiaworld Jewellery Order Payment",
        image: "https://thiaworld.bbscart.com/uploads/thiaworldlogo.png",
        currency: currency,
        key: RAZORPAY_KEY,
        amount: amount.toString(), // ✅ Ensure amount is string
        name: "Thiaworld Jewellery",
        order_id: orderId, // ✅ Use order_id (required parameter)
        prefill: {
          email: "",
          contact: "",
          name: "",
        },
        theme: { color: "#B8860B" }, // ✅ Use app theme color
        notes: {
          order_id: orderId,
        },
      })
        .then(async (response) => {
          console.log("✅ Payment successful:", response);
          
          try {
            // ✅ Update payment status
            await axios.post(`${API_BASE}/api/checkout/update-payment-status`, {
              razorpay_order_id: orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              status: "paid",
            });

            // ✅ Clear all carts
            clearCart("gold");
            clearCart("silver");
            clearCart("diamond");
            clearCart("platinum");

            // ✅ Navigate to success page
            if (navigation && navigation.replace) {
              navigation.replace("Success");
            } else {
              Alert.alert("Success", "Payment successful! Order placed.");
            }
          } catch (updateError) {
            console.warn("⚠️ Error updating payment status:", updateError?.message || "Unknown error");
            Alert.alert("Payment Successful", "Your payment was successful, but there was an error updating the order. Please contact support.");
          }
        })
        .catch((error) => {
          // Only log unexpected errors for debugging
          if (error?.error?.code !== "BAD_REQUEST_ERROR" && error?.error?.code !== "NETWORK_ERROR") {
            console.warn("⚠️ Razorpay error:", error?.error?.code || "Unknown");
          }
          
          // ✅ Better error handling with detailed logging
          if (error?.error) {
            const errorCode = error.error.code || error.error.error_code || "UNKNOWN_ERROR";
            const errorDescription = error.error.description || error.error.reason || error.error.message || error.error.error_description || "Payment processing failed. Please try again.";
            
            // Only log unexpected errors, not user-facing errors
            if (errorCode !== "BAD_REQUEST_ERROR" && errorCode !== "NETWORK_ERROR") {
              console.warn("⚠️ Razorpay error:", errorCode, errorDescription);
            }
            
            if (errorCode === "BAD_REQUEST_ERROR") {
              Alert.alert("Payment Error", `Invalid payment request: ${errorDescription}`);
            } else if (errorCode === "GATEWAY_ERROR") {
              Alert.alert("Payment Error", "Payment gateway error. Please try again.");
            } else if (errorCode === "NETWORK_ERROR") {
              Alert.alert("Network Error", "Please check your internet connection and try again.");
            } else if (errorCode === "INVALID_ORDER_ID") {
              Alert.alert("Payment Error", "Invalid order ID. Please try again.");
            } else {
              Alert.alert("Payment Error", errorDescription || "Payment was cancelled or failed.");
            }
          } else if (error?.code) {
            // ✅ Handle direct error codes
            console.warn("⚠️ Razorpay error code:", error.code);
            Alert.alert("Payment Error", error.description || error.message || "Payment failed. Please try again.");
          } else {
            // ✅ Generic error - only log unexpected errors
            console.warn("⚠️ Razorpay error:", error?.message || "Unknown error");
            Alert.alert("Payment Error", error?.message || "Payment gateway failed to open. Please try again.");
          }
        });

    } catch (err) {
      // Only log unexpected errors
      console.warn("⚠️ Payment initialization error:", err?.response?.status || err?.message || "Unknown error");
      Alert.alert("Error", `Unable to initiate payment: ${err.message || "Please try again"}`);
    } finally {
      setPlacing(false);
    }
  };

  const placeOrderWithoutPayment = async () => {
    try {
      setPlacing(true);

      await axios.post(`${API_BASE}/api/checkout/submit`, {
        items: cartItems,
        amount: totalAmount,
        paymentMethod: "COD",
      });

      clearCart("gold");
      clearCart("silver");
      clearCart("diamond");
      clearCart("platinum");

      navigation.replace("Success");
    } catch {
      Alert.alert("Order Failed");
    } finally {
      setPlacing(false);
    }
  };

  // -----------------------------
  // UI (UNCHANGED)
  // -----------------------------
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
      >
        {/* LOGIN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. LOGIN</Text>
          <Text style={styles.text}>Thiaworld Customer</Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DELIVERY ADDRESS</Text>
          <Text style={styles.text}>Saved delivery address</Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. ORDER SUMMARY</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item, i) => `${item.category}-${i}`}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.name} (x{item.quantity || 1})
                  </Text>
                  <Text style={styles.deliveryText}>
                    Delivery in 5–7 Days
                  </Text>
                </View>
                <Text style={styles.price}>
                  ₹{Number(item.price || 0) * Number(item.quantity || 1)}


                </Text>
              </View>
            )}
          />
        </View>

        {/* PAYMENT OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PAYMENT OPTIONS</Text>

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
            <Text style={styles.optionText}>Credit / Debit Card</Text>
          </TouchableOpacity>

          {selectedPayment === "card" && (
            <>
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
            </>
          )}

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
            <Text>Jewellery Care & Handling</Text>
            <Text>₹{careHandling}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={styles.totalText}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER */}
      <TouchableOpacity
        style={styles.placeBtn}
        onPress={handlePlaceOrder}
        disabled={placing}
      >
        <Text style={styles.placeBtnText}>
          {placing ? "PLACING ORDER..." : "PLACE ORDER"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f5f0", padding: 10 },
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
    color: "#8B0000",
  },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
  changeBtn: { color: "#8B0000", fontWeight: "bold", marginTop: 5 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  itemName: { fontSize: 14, fontWeight: "500", color: "#222" },
  deliveryText: { fontSize: 12, color: "green", marginTop: 2 },
  price: { fontSize: 14, fontWeight: "bold", color: "#000" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 14, color: "#111" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  bankOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 4,
    borderRadius: 6,
  },
  bankText: { fontSize: 14, color: "#222" },
  selectedBank: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  separator: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  totalText: { fontSize: 15, fontWeight: "bold", color: "#000" },
  placeBtn: {
    backgroundColor: "#DAA520",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  placeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B0000",
    marginRight: 10,
  },
  radioSelected: { backgroundColor: "#8B0000" },
});

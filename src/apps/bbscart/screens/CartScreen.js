import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../contexts/CartContext";

export default function CartPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { items, updateQty, removeItem } = useCart();

  const [savedItems, setSavedItems] = useState([]);

  // Convert cart object → array if needed
  const cartItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    return Object.values(items || {});
  }, [items]);

  const increaseQty = (id) => {
    const item = cartItems.find((i) => i.productId === id);
    if (item) updateQty(id, item.qty + 1);
  };

  const decreaseQty = (id) => {
    const item = cartItems.find((i) => i.productId === id);
    if (item && item.qty > 1) updateQty(id, item.qty - 1);
  };

  const saveForLater = (item) => {
    setSavedItems((prev) => [...prev, item]);
    removeItem(item.productId);
  };

  const moveToCart = (item) => {
    setSavedItems((prev) =>
      prev.filter((i) => i.productId !== item.productId)
    );
    updateQty(item.productId, item.qty || 1);
  };

  const totals = useMemo(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    return {
      total,
      delivery: total > 1000 ? 0 : 100,
    };
  }, [cartItems]);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              onPress={() => decreaseQty(item.productId)}
              style={styles.qtyBtn}
            >
              <Text>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.qty}</Text>

            <TouchableOpacity
              onPress={() => increaseQty(item.productId)}
              style={styles.qtyBtn}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => removeItem(item.productId)}>
            <Text style={styles.actionText}>REMOVE</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => saveForLater(item)}>
            <Text style={styles.actionText}>SAVE FOR LATER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.productId}
        />

        {/* Saved for Later */}
        {savedItems.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Saved for Later</Text>

            {savedItems.map((item) => (
              <View key={item.productId} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  <TouchableOpacity onPress={() => moveToCart(item)}>
                    <Text style={styles.actionText}>MOVE TO CART</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Price Details</Text>

          <View style={styles.summaryRow}>
            <Text>Price ({cartItems.length} items)</Text>
            <Text>₹{totals.total}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Delivery Charges</Text>
            <Text>
              {totals.delivery === 0 ? "FREE" : `₹${totals.delivery}`}
            </Text>
          </View>

          <View
            style={[
              styles.summaryRow,
              { borderTopWidth: 1, marginTop: 5, paddingTop: 5 },
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>Total Amount</Text>
            <Text style={{ fontWeight: "bold" }}>
              ₹{totals.total + totals.delivery}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer - same pattern as ProductDetails: above system nav bar + extra padding */}
      <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom) + 8 }]}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.placeOrderText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: 12,
    marginHorizontal: 12,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  itemImage: { width: 100, height: 90, borderRadius: 6 },
  itemContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: { fontSize: 15, fontWeight: "bold", marginBottom: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: "bold" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  qtyBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qtyText: { marginHorizontal: 10, fontSize: 16 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 15,
  },
  actionText: { color: "#2874F0", fontSize: 13, fontWeight: "500" },
  savedSection: { backgroundColor: "#fff", marginTop: 10, padding: 10 },
  savedTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    margin: 15,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderBtn: {
    backgroundColor: "#fb641b",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
  },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

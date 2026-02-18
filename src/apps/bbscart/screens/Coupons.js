// frontend/screens/CouponsFlipkartSticky.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initialCoupons = [
  {
    id: "1",
    title: "Flat 20% OFF on Electronics",
    code: "ELEC20",
    discount: 20,
    type: "Percentage",
    expiry: "2025-09-05T23:59:59",
    description: "Valid on selected electronics.",
    collected: false,
    applied: false,
  },
  {
    id: "2",
    title: "₹500 Cashback on ₹2500+",
    code: "CASH500",
    discount: 500,
    type: "Cashback",
    expiry: "2025-09-12T23:59:59",
    description: "Valid for all products above ₹2500.",
    collected: false,
    applied: true,
  },
  {
    id: "3",
    title: "50% OFF Footwear",
    code: "SHOES50",
    discount: 50,
    type: "Percentage",
    expiry: "2023-12-31T23:59:59",
    description: "Applicable on selected shoes.",
    collected: false,
    applied: false,
  },
];

export default function CouponsFlipkartSticky() {
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [activeTab, setActiveTab] = useState("Active");

  const toggleCollect = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, collected: !c.collected } : c))
    );
  };

  const toggleApply = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, applied: !c.applied } : c))
    );
    Alert.alert("Coupon Applied", "Coupon applied successfully!");
  };

  const calculateCountdown = (expiry) => {
    const diff = new Date(expiry) - new Date();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  // Filter logic
  const filteredCoupons = coupons.filter((c) => {
    const now = new Date();
    const isExpired = new Date(c.expiry) < now;
    if (activeTab === "Active") return !c.applied && !isExpired;
    if (activeTab === "Applied") return c.applied && !isExpired;
    if (activeTab === "Expired") return isExpired || (c.applied && isExpired);
    return true;
  });

  const renderCoupon = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.gradientBadge}>
        <Text style={styles.discountText}>
          {item.type === "Percentage"
            ? `${item.discount}% OFF`
            : `₹${item.discount} Cashback`}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.countdown}>{calculateCountdown(item.expiry)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleCollect(item.id)}>
            <Text
              style={[styles.collectBtn, item.collected && { color: "green" }]}
            >
              {item.collected ? "Collected ✓" : "Collect"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleApply(item.id)}>
            <Text style={styles.applyBtn}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Banner */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10, paddingLeft: 10 }}
      >
        {[1, 2, 3].map((n) => (
          <Image
            key={n}
            source={{ uri: `https://picsum.photos/300/120?random=${n}` }}
            style={styles.banner}
          />
        ))}
      </ScrollView>

      {/* Sticky Tabs */}
      <View style={styles.tabBar}>
        {["Active", "Applied", "Expired"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.activeTab]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coupon List */}
      {filteredCoupons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: "#777", fontSize: 16 }}>
            No coupons in {activeTab} tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCoupons}
          keyExtractor={(item) => item.id}
          renderItem={renderCoupon}
          contentContainerStyle={{ padding: 10, paddingTop: 0, paddingBottom: 10 + insets.bottom }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 0, backgroundColor: "#f1f3f6" },
  banner: { width: 300, height: 120, borderRadius: 6, marginRight: 10 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    backgroundColor: "#fff",
    paddingVertical: 8,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: "#555" },
  activeTab: { color: "#2874F0", fontWeight: "bold", textDecorationLine: "underline" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  gradientBadge: {
    width: 80,
    backgroundColor: "#2874F0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    paddingVertical: 6,
  },
  discountText: { color: "#fff", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  title: { fontWeight: "bold", fontSize: 14 },
  description: { fontSize: 12, color: "#555", marginVertical: 4 },
  countdown: { fontSize: 11, color: "red" },
  actions: { flexDirection: "row", marginTop: 6 },
  collectBtn: { color: "#2874F0", marginRight: 12, fontWeight: "500" },
  applyBtn: {
    color: "#fff",
    backgroundColor: "#2874F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});

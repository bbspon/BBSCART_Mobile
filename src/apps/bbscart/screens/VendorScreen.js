// VendorDashboard.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// ---------- Sample Data ----------
const ordersData = [
  { id: "1", customer: "John Doe", status: "Pending", total: "$250", due: "Today" },
  { id: "2", customer: "Alice Smith", status: "Completed", total: "$500", due: "Yesterday" },
  { id: "3", customer: "Bob Johnson", status: "Pending", total: "$300", due: "Today" },
];

const productsData = [
  { id: "1", name: "Product A", stock: 12, price: "$50" },
  { id: "2", name: "Product B", stock: 5, price: "$100" },
  { id: "3", name: "Product C", stock: 0, price: "$30" },
];

const kpiData = [
  { title: "Orders", value: 25 },
  { title: "Revenue", value: "$3,500" },
  { title: "Pending Shipments", value: 8 },
  { title: "Low Stock Products", value: 3 },
];

// ---------- Vendor Dashboard ----------
const VendorDashboard = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState(ordersData);
  const [products, setProducts] = useState(productsData);
  const [searchText, setSearchText] = useState("");

  const filteredOrders = orders.filter((order) =>
    order.customer.toLowerCase().includes(searchText.toLowerCase())
  );

  const markOrderComplete = (id) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "Completed" } : order
      )
    );
    Alert.alert("Order Completed", "The order has been marked as completed!");
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.customer}</Text>
        <Text style={styles.cardMeta}>
          Status: {item.status} | Due: {item.due} | Total: {item.total}
        </Text>
      </View>
      {item.status !== "Completed" && (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => markOrderComplete(item.id)}
        >
          <Text style={styles.completeBtnText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          Stock: {item.stock} | Price: {item.price}
        </Text>
      </View>
      {item.stock === 0 && (
        <Text style={styles.lowStockText}>Low Stock!</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Vendor Dashboard</Text>
        <Text style={styles.subHeader}>
          Manage your orders, products & sales efficiently
        </Text>
      </View>

      {/* KPI Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiContainer}>
        {kpiData.map((kpi, index) => (
          <View key={index} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiTitle}>{kpi.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search orders or customers..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Orders */}
      <Text style={styles.sectionHeader}>Orders</Text>
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Products */}
      <Text style={styles.sectionHeader}>Products</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Quick Actions */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Add Product", "Navigate to Add Product Screen")}
        >
          <Text style={styles.actionBtnText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Create Offer", "Navigate to Offer Management")}
        >
          <Text style={styles.actionBtnText}>Create Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Reports", "Open Analytics Reports")}
        >
          <Text style={styles.actionBtnText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Wallet", "Open Wallet & Payments")}
        >
          <Text style={styles.actionBtnText}>Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Features */}
      <Text style={styles.sectionHeader}>Advanced / Future Features</Text>
      <View style={styles.advancedContainer}>
        <Text style={styles.advancedText}>• AI Assistance: Predict top-selling products</Text>
        <Text style={styles.advancedText}>• Gamification: Badges & Leaderboards</Text>
        <Text style={styles.advancedText}>• Wallet & Commission Tracking</Text>
        <Text style={styles.advancedText}>• Geo-Tracking for deliveries</Text>
        <Text style={styles.advancedText}>• Smart Notifications for orders & stock</Text>
        <Text style={styles.advancedText}>• Multi-language & Accessibility Support</Text>
        <Text style={styles.advancedText}>• AR/360 Product Preview</Text>
        <Text style={styles.advancedText}>• Predictive Inventory & Restocking</Text>
        <Text style={styles.advancedText}>• Customer Segmentation & Dynamic Campaigns</Text>
      </View>
    </ScrollView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  headerContainer: { marginBottom: 16 },
  header: { fontSize: 28, fontWeight: "bold", color: "#1f2937" },
  subHeader: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  kpiContainer: { marginVertical: 12 },
  kpiCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    width: 140,
  },
  kpiValue: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  kpiTitle: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginVertical: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  cardMeta: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  completeBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeBtnText: { color: "#fff", fontWeight: "bold" },
  lowStockText: { color: "#ef4444", fontWeight: "bold" },
  quickActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "bold" },
  advancedContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  advancedText: { fontSize: 14, color: "#1f2937", marginBottom: 8 },
});

export default VendorDashboard;

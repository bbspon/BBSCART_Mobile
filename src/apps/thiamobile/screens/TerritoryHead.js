import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const TerritoryDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* KPI Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Franchises</Text>
            <Text style={styles.cardValue}>12</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Agents</Text>
            <Text style={styles.cardValue}>56</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vendors</Text>
            <Text style={styles.cardValue}>23</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenue</Text>
            <Text style={styles.cardValue}>₹1.2M</Text>
          </View>
        </View>
      </View>

      {/* Heatmap Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geographic Overview</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>[Heatmap / Map Placeholder]</Text>
        </View>
      </View>

      {/* Escalations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Escalations</Text>
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>Pending Escalations: 3</Text>
        </TouchableOpacity>
      </View>

      {/* AI Insights Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>Agent A is outperforming with 20% higher sales this month.</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>Vendor delays detected in Zone 3 – attention needed.</Text>
        </View>
      </View>

      {/* Leaderboard Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>1. Agent Ramesh – 120 Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>2. Agent Priya – 110 Orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },

  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop:20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: "#666",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a73e8",
    marginTop: 5,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "#e6eaf2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  listItemText: {
    fontSize: 15,
    color: "#444",
  },
  insightCard: {
    backgroundColor: "#eef4ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: "#1a73e8",
  },
});

export default TerritoryDashboardScreen;

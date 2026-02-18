import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

const FranchiseDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <Text style={[styles.header, darkMode && styles.darkText]}>Franchise Dashboard</Text>

      {/* KPIs */}
      <View style={styles.row}>
        <View style={styles.card}><Text style={styles.cardTitle}>Sales</Text><Text style={styles.cardValue}>₹ 2.4L</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Revenue</Text><Text style={styles.cardValue}>₹ 8.1L</Text></View>
      </View>
      <View style={styles.row}>
        <View style={styles.card}><Text style={styles.cardTitle}>Agents</Text><Text style={styles.cardValue}>24</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Vendors</Text><Text style={styles.cardValue}>12</Text></View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Quick Actions</Text>
      <View style={styles.row}>
        {['Add Vendor','View Orders','Manage Agents','Support'].map((action, i) => (
          <TouchableOpacity key={i} style={styles.actionButton}><Text style={styles.actionText}>{action}</Text></TouchableOpacity>
        ))}
      </View>

      {/* Recent Transactions */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Recent Transactions</Text>
      <View style={styles.card}><Text>Order #12345 - ₹1200 - Completed</Text></View>
      <View style={styles.card}><Text>Order #12346 - ₹900 - Pending</Text></View>

      {/* Announcements */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Announcements</Text>
      <View style={styles.card}><Text>⚡ System maintenance on Sunday 2 AM</Text></View>

      {/* AI Insights */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>AI Insights</Text>
      <View style={styles.card}><Text>📈 Predicted sales up 12% this week</Text></View>

      {/* Analytics Reports */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Analytics & Reports</Text>
      <View style={styles.card}><Text>[Graph Placeholder]</Text></View>

      {/* Leaderboard */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Top Agents</Text>
      <View style={styles.card}><Text>1. Rahul - 120 Orders</Text><Text>2. Sneha - 110 Orders</Text></View>

      {/* Financial Snapshot */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Financials</Text>
      <View style={styles.row}>
        <View style={styles.card}><Text style={styles.cardTitle}>Wallet</Text><Text style={styles.cardValue}>₹ 56,000</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Pending</Text><Text style={styles.cardValue}>₹ 8,500</Text></View>
      </View>

      {/* Geo/Field Ops */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Region Coverage</Text>
      <View style={styles.card}><Text>[Map Placeholder]</Text></View>

      {/* Future Features */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Future Features</Text>
      <View style={styles.card}><Text>📶 Offline Sync: Online</Text></View>
      <View style={styles.card}><Text>💬 Team Chat: Coming Soon</Text></View>
      <View style={styles.card}><Text>📚 Learning Zone: Tips & Training</Text></View>
      <View style={styles.card}><Text>🔐 Compliance: All checks passed</Text></View>

      {/* Accessibility */}
      <View style={styles.switchRow}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 12 },
  darkContainer: { backgroundColor: "#121212" },
  header: { fontSize: 24, fontWeight: "bold", marginVertical: 12, textAlign: "center" },
  darkText: { color: "#fff" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  card: { flex: 1, backgroundColor: "#fff", padding: 16, margin: 6, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  actionButton: { flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 10, margin: 6 },
  actionText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 16 },
});

export default FranchiseDashboard;

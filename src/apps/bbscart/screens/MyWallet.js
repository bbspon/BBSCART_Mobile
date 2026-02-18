// frontend/screens/MyWalletStyled.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";

const initialWallet = {
  balance: 12500,
  cashback: 250,
  giftCard: 1000,
  transactions: [
    { id: "t1", type: "Credit", title: "Cashback from Order #1024", amount: 50, date: "2025-08-20", status: "Success" },
    { id: "t2", type: "Debit", title: "Payment for Order #1025", amount: 1200, date: "2025-08-21", status: "Success" },
    { id: "t3", type: "Credit", title: "Gift Card Added", amount: 500, date: "2025-08-22", status: "Success" },
  ],
  linkedAccounts: ["UPI: xyz@upi", "Bank: HDFC 1234"],
  rewards: [
    { id: "r1", title: "Flat ₹50 cashback on next order" },
    { id: "r2", title: "Use ₹100 gift card before 30 Aug" },
  ],
  banners: [
    { id: "b1", img: "https://picsum.photos/300/120?random=1" },
    { id: "b2", img: "https://picsum.photos/300/120?random=2" },
  ],
};

export default function MyWalletStyled() {
  const [wallet, setWallet] = useState(initialWallet);

  const addMoney = () => Alert.alert("Add Money", "Redirect to payment gateway.");
  const redeemCashback = () => {
    Alert.alert("Redeem Cashback", "Cashback applied!");
    setWallet((prev) => ({ ...prev, balance: prev.balance + prev.cashback, cashback: 0 }));
  };
  const transferMoney = () => Alert.alert("Transfer", "Send money to a friend.");
  const payWithWallet = () => Alert.alert("Pay", "Use wallet balance at checkout.");

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.transTitle}>{item.title}</Text>
        <Text style={styles.transDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transAmount, { color: item.type === "Credit" ? "#00b894" : "#d63031" }]}>
        {item.type === "Credit" ? "+" : "-"}₹{item.amount}
      </Text>
    </View>
  );

  const renderReward = ({ item }) => (
    <View style={styles.rewardCard}>
      <Text style={{ fontSize: 12, color: "#2d3436" }}>{item.title}</Text>
    </View>
  );

  const renderBanner = ({ item }) => (
    <Image source={{ uri: item.img }} style={styles.banner} />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Hero Wallet Balance */}
      <View style={styles.hero}>
        <Text style={styles.heroText}>Wallet Balance</Text>
        <Text style={styles.balance}>₹{wallet.balance}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={addMoney}>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={redeemCashback}>
            <Text style={styles.actionText}>Redeem Cashback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={transferMoney}>
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={payWithWallet}>
            <Text style={styles.actionText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Promotional Banners */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10, paddingLeft: 12 }}>
        {wallet.banners.map((b) => renderBanner({ item: b }))}
      </ScrollView>

      {/* Linked Accounts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Accounts</Text>
        {wallet.linkedAccounts.map((acc, i) => (
          <Text key={i} style={styles.linkedAcc}>{acc}</Text>
        ))}
      </View>

      {/* Rewards / Cashback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards & Cashback</Text>
        <FlatList
          horizontal
          data={wallet.rewards}
          renderItem={renderReward}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <FlatList
          data={wallet.transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Sticky CTA */}
      <TouchableOpacity style={styles.ctaBtn} onPress={payWithWallet}>
        <Text style={styles.ctaText}>Use Wallet at Checkout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  hero: {
    backgroundColor: "#2874F0",
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
  },
  heroText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  balance: { color: "#fff", fontSize: 36, fontWeight: "bold", marginVertical: 10 },
  quickActions: { flexDirection: "row", flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
    elevation: 2,
  },
  actionText: { color: "#2874F0", fontSize: 13, fontWeight: "600" },
  banner: { width: 300, height: 130, borderRadius: 10, marginRight: 10 },
  section: { padding: 14, backgroundColor: "#fff", marginVertical: 6, borderRadius: 8, elevation: 1 },
  sectionTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 6, color: "#2d3436" },
  linkedAcc: { fontSize: 12, color: "#636e72", marginVertical: 2 },
  rewardCard: {
    width: 160,
    height: 70,
    backgroundColor: "#dfe6e9",
    borderRadius: 10,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#b2bec3",
  },
  transTitle: { fontSize: 13, fontWeight: "500", color: "#2d3436" },
  transDate: { fontSize: 11, color: "#636e72" },
  transAmount: { fontWeight: "bold", fontSize: 13 },
  ctaBtn: {
    backgroundColor: "#ff9800",
    margin: 14,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  ctaText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

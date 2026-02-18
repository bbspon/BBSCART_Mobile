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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initialWallet = {
  balance: 25.5, // in grams of gold or equivalent value
  goldValue: 125000, // ₹ value of stored gold
  silverPoints: 300,
  vouchers: 2,
  transactions: [
    { id: "t1", type: "Credit", title: "Gold Savings Plan Added (5g)", amount: 32000, date: "2025-08-20", status: "Success" },
    { id: "t2", type: "Debit", title: "Payment for Diamond Ring Order #D1025", amount: 58000, date: "2025-08-21", status: "Success" },
    { id: "t3", type: "Credit", title: "Jewellery Exchange Value Added", amount: 15000, date: "2025-08-22", status: "Success" },
  ],
  linkedAccounts: ["Gold Scheme: Thiaworld Swarn Savings", "Bank: HDFC 1234", "UPI: jewellery@upi"],
  rewards: [
    { id: "r1", title: "₹1000 Voucher on Gold Coin Purchase" },
    { id: "r2", title: "Flat 2g Silver Free on next Jewellery Order" },
  ],
  banners: [
    { id: "b1", img: "https://i.ibb.co/9b7D6F3/gold-offer.jpg" },
    { id: "b2", img: "https://i.ibb.co/Fz9JcGy/jewellery-discount.jpg" },
  ],
};

export default function MyWalletStyled() {
  const insets = useSafeAreaInsets();
  const [wallet, setWallet] = useState(initialWallet);

  const addMoney = () => Alert.alert("Add Gold", "Redirect to Gold Savings / EMI.");
  const redeemRewards = () => Alert.alert("Redeem", "Rewards redeemed successfully!");
  const transferGold = () => Alert.alert("Transfer Gold", "Send gold value to family/friend.");
  const payForJewellery = () => Alert.alert("Pay", "Use wallet balance at jewellery checkout.");

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Hero Wallet Balance */}
      <View style={styles.hero}>
        <Text style={styles.heroText}>Gold Wallet Balance</Text>
        <Text style={styles.balance}>{wallet.balance} g</Text>
        <Text style={styles.subBalance}>≈ ₹{wallet.goldValue}</Text>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={addMoney}>
            <Text style={styles.actionText}>Add Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={redeemRewards}>
            <Text style={styles.actionText}>Redeem Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={transferGold}>
            <Text style={styles.actionText}>Transfer Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={payForJewellery}>
            <Text style={styles.actionText}>Pay for Jewellery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Promotional Banners */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10, paddingLeft: 12 }}>
        {wallet.banners.map((b) => renderBanner({ item: b }))}
      </ScrollView>

      {/* Linked Accounts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Jewellery Accounts</Text>
        {wallet.linkedAccounts.map((acc, i) => (
          <Text key={i} style={styles.linkedAcc}>{acc}</Text>
        ))}
      </View>

      {/* Rewards / Vouchers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jewellery Rewards & Vouchers</Text>
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
        <Text style={styles.sectionTitle}>Gold & Jewellery Transactions</Text>
        <FlatList
          data={wallet.transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Sticky CTA */}
      <TouchableOpacity style={styles.ctaBtn} onPress={payForJewellery}>
        <Text style={styles.ctaText}>Use Wallet for Jewellery</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  hero: {
    backgroundColor: "#b8860b", // gold theme
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
  },
  heroText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  balance: { color: "#fff", fontSize: 34, fontWeight: "bold", marginVertical: 6 },
  subBalance: { color: "#ffeaa7", fontSize: 14 },
  quickActions: { flexDirection: "row", flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
    elevation: 2,
  },
  actionText: { color: "#b8860b", fontSize: 13, fontWeight: "600" },
  banner: { width: 300, height: 130, borderRadius: 10, marginRight: 10 },
  section: { padding: 14, backgroundColor: "#fff", marginVertical: 6, borderRadius: 8, elevation: 1 },
  sectionTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 6, color: "#2d3436" },
  linkedAcc: { fontSize: 12, color: "#636e72", marginVertical: 2 },
  rewardCard: {
    width: 180,
    height: 70,
    backgroundColor: "#f1c40f",
    borderRadius: 10,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
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
    backgroundColor: "#d35400",
    margin: 14,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  ctaText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

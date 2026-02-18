// frontend/screens/GoldExchangeBuyback.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * GoldExchangeBuyback.js
 *
 * Implements:
 *  - Mock live rates (auto-refresh)
 *  - Calculator for gold/silver buyback/exchange
 *  - Options: Exchange for new jewellery (navigate), Credit to Wallet, Cash/Bank Transfer
 *  - Upload image placeholder (instructions to integrate react-native-image-picker)
 *  - Book store visit / pickup modal
 *  - Transaction history stored locally
 *  - Policy modal (wastage, making charges, eligibility)
 *
 * TODO:
 *  - Replace mock rates with real API & secure websocket/polling
 *  - Integrate image upload library (react-native-image-picker or expo-image-picker)
 *  - Integrate backend endpoints for booking, buyback, wallet credit, and history
 *  - Add authentication headers when calling APIs
 */

const DEFAULT_RATES = {
  gold24: 160000, // ₹ per 10g (example) — adapt to how you want units to display
  gold22: 146000,
  silver: 76000, // ₹ per kg or per 1000g depending on your unit system; we'll interpret as ₹/kg in comments
};

// Helper to format currency
const fmt = (num) => {
  if (num == null) return "-";
  return "₹" + Number(num).toLocaleString("en-IN");
};

export default function GoldExchangeBuyback({ navigation }) {
  const insets = useSafeAreaInsets();
  // Live rates
  const [rates, setRates] = useState({
    gold24: DEFAULT_RATES.gold24,
    gold22: DEFAULT_RATES.gold22,
    silver: DEFAULT_RATES.silver,
    lastUpdated: new Date(),
  });

  // Calculator inputs
  const [metal, setMetal] = useState("gold22"); // gold22 | gold24 | silver
  const [weightGrams, setWeightGrams] = useState(""); // grams
  const [purityPercent, setPurityPercent] = useState("91.6"); // for 22k default
  const [wastagePercent, setWastagePercent] = useState("2.5"); // store default deduction %
  const [makingChargePerGram, setMakingChargePerGram] = useState("0"); // optional
  const [estimatedValue, setEstimatedValue] = useState(null);

  // Modals and UI state
  const [policyVisible, setPolicyVisible] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);

  // Upload placeholder
  const [uploadedImage, setUploadedImage] = useState(null);

  // History (mock local storage of transactions)
  const [history, setHistory] = useState([
    // sample
    {
      id: "h1",
      type: "Buyback",
      metal: "gold22",
      weight: 5,
      value: 73000,
      date: "2025-08-20",
      mode: "Wallet",
    },
  ]);

  // Booking state
  const [selectedBranch, setSelectedBranch] = useState("Thiaworld - MG Road");
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000)
  ); // default 3 days later
  const [pickup, setPickup] = useState(false);

  // Auto-refresh simulation for "live" rates every 60s (mock)
  const timerRef = useRef(null);
  useEffect(() => {
    // Simulate rate fluctuation: +/- up to 0.5% every 60s
    timerRef.current = setInterval(() => {
      setRates((prev) => {
        const fluctuate = (v) =>
          Math.round(v * (1 + (Math.random() - 0.5) * 0.01)) // small random
        return {
          gold24: fluctuate(prev.gold24),
          gold22: fluctuate(prev.gold22),
          silver: fluctuate(prev.silver),
          lastUpdated: new Date(),
        };
      });
    }, 60000); // 60s

    return () => clearInterval(timerRef.current);
  }, []);

  // Core calculator: compute estimated final value (₹)
  const calculateEstimate = () => {
    // Validate input
    const w = parseFloat(weightGrams);
    if (!w || w <= 0) {
      Alert.alert("Invalid weight", "Please enter a valid weight in grams.");
      return;
    }
    // Rate unit decision:
    // For gold rates we store per 10g in this mock. Convert to per gram: rate/10
    const ratePerGram =
      metal === "gold24"
        ? rates.gold24 / 10
        : metal === "gold22"
        ? rates.gold22 / 10
        : // for silver, our mock is per kg (76000) → per gram: 76
          rates.silver / 1000; // adapt if you change units

    const purity = parseFloat(purityPercent) / 100; // e.g., 91.6% -> 0.916 (for 22K)
    const effectiveWeight = w * purity;

    // Gross value before deductions
    const gross = effectiveWeight * ratePerGram;

    // Apply wastage deduction (%) and making charges per gram (₹)
    const wastage = (parseFloat(wastagePercent) / 100) * gross;
    const makingCharges = parseFloat(makingChargePerGram || 0) * w;

    // Final estimated value
    const finalValue = Math.max(0, Math.round(gross - wastage - makingCharges));

    setEstimatedValue({
      ratePerGram: Math.round(ratePerGram),
      purityPercent: Number(purityPercent),
      effectiveWeight: Number(effectiveWeight.toFixed(3)),
      gross: Math.round(gross),
      wastage: Math.round(wastage),
      makingCharges: Math.round(makingCharges),
      finalValue,
    });
  };

  // Actions: Exchange / Credit to Wallet / Cash Transfer
  const onExchangeForNew = () => {
    if (!estimatedValue) {
      Alert.alert("Calculate first", "Please calculate estimated value first.");
      return;
    }
    // Navigate to product listing / show modal - we'll navigate to Product Listings with credit param
    // TODO: Replace 'ProductListing' with your actual route
    navigation?.navigate?.("ProductListing", {
      exchangeCredit: estimatedValue.finalValue,
      note: "Trade-in: old jewellery",
    });
  };

  const onCreditToWallet = () => {
    if (!estimatedValue) {
      Alert.alert("Calculate first", "Please calculate estimated value first.");
      return;
    }
    // Mock: Add to wallet & add history
    setHistory((prev) => [
      {
        id: "h" + (prev.length + 1),
        type: "Buyback",
        metal,
        weight: parseFloat(weightGrams),
        value: estimatedValue.finalValue,
        date: new Date().toISOString().split("T")[0],
        mode: "Wallet",
      },
      ...prev,
    ]);
    Alert.alert("Wallet Credited", `₹${estimatedValue.finalValue} credited to your wallet.`);
    // TODO: call backend to credit wallet
  };

  const onCashBankTransfer = () => {
    if (!estimatedValue) {
      Alert.alert("Calculate first", "Please calculate estimated value first.");
      return;
    }
    // Mock: prompt confirm
    Alert.alert(
      "Confirm Cash Transfer",
      `We will transfer ₹${estimatedValue.finalValue} to your registered bank once items are verified. Proceed?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: () => {
            setHistory((prev) => [
              {
                id: "h" + (prev.length + 1),
                type: "Buyback",
                metal,
                weight: parseFloat(weightGrams),
                value: estimatedValue.finalValue,
                date: new Date().toISOString().split("T")[0],
                mode: "Bank Transfer",
              },
              ...prev,
            ]);
            Alert.alert("Initiated", "Bank transfer will be processed after verification.");
            // TODO: backend bank transfer request
          },
        },
      ]
    );
  };

  // Booking appointment / pickup
  const onBookVisit = () => {
    setBookModalVisible(true);
  };

  const confirmBooking = () => {
    // TODO: call backend booking API
    setBookModalVisible(false);
    setHistory((prev) => [
      {
        id: "h" + (prev.length + 1),
        type: pickup ? "Pickup Booking" : "Store Visit",
        metal: null,
        weight: null,
        value: null,
        date: selectedDate.toISOString().split("T")[0],
        mode: pickup ? "Pickup" : "Visit",
        branch: selectedBranch,
      },
      ...prev,
    ]);
    Alert.alert("Booked", `Your ${pickup ? "pickup" : "store visit"} is booked on ${selectedDate.toDateString()} at ${selectedBranch}.`);
  };

  // Image upload placeholder
  const onUploadImage = () => {
    Alert.alert(
      "Upload Image",
      "To enable real image upload, install and configure 'react-native-image-picker' or 'expo-image-picker'.\n\nFor now this is a placeholder that simulates an uploaded image.",
      [
        {
          text: "Simulate Upload",
          onPress: () => {
            setUploadedImage({
              uri: "https://pngimg.com/uploads/jewellery/jewellery_PNG6858.png",
              name: "sample-jewel.png",
            });
            Alert.alert("Uploaded", "Sample jewelry image added (simulation).");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Clear calculator
  const resetCalculator = () => {
    setWeightGrams("");
    setPurityPercent(metal === "gold22" ? "91.6" : metal === "gold24" ? "99.9" : "100");
    setWastagePercent("2.5");
    setMakingChargePerGram("0");
    setEstimatedValue(null);
  };

  // Render helpers
  const rateLabel = (m) => (m === "gold24" ? "24K" : m === "gold22" ? "22K" : "Silver");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 + Math.max(12, insets.bottom) + 8 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gold Exchange & Buyback</Text>
        <Text style={styles.headerSubtitle}>Transparent rates • Secure process • Quick credit</Text>
      </View>

      {/* Live Rates */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Rates</Text>

        <View style={styles.rateRow}>
          <View>
            <Text style={styles.rateLabel}>22K Gold (per g)</Text>
            <Text style={styles.rateValue}> {fmt(Math.round(rates.gold22 / 10))} </Text>
          </View>

          <View>
            <Text style={styles.rateLabel}>24K Gold (per g)</Text>
            <Text style={styles.rateValue}> {fmt(Math.round(rates.gold24 / 10))} </Text>
          </View>

          <View>
            <Text style={styles.rateLabel}>Silver (per g)</Text>
            <Text style={styles.rateValue}> {fmt(Math.round(rates.silver / 1000))} </Text>
          </View>
        </View>

        <Text style={styles.smallText}>Last updated: {rates.lastUpdated.toLocaleString()}</Text>
      </View>

      {/* Calculator */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estimate Value</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.selectBtn, metal === "gold22" && styles.selectBtnActive]}
            onPress={() => {
              setMetal("gold22");
              setPurityPercent("91.6");
              setEstimatedValue(null);
            }}
          >
            <Text style={[styles.selectBtnText, metal === "gold22" && styles.selectBtnTextActive]}>22K</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectBtn, metal === "gold24" && styles.selectBtnActive]}
            onPress={() => {
              setMetal("gold24");
              setPurityPercent("99.9");
              setEstimatedValue(null);
            }}
          >
            <Text style={[styles.selectBtnText, metal === "gold24" && styles.selectBtnTextActive]}>24K</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectBtn, metal === "silver" && styles.selectBtnActive]}
            onPress={() => {
              setMetal("silver");
              setPurityPercent("100");
              setEstimatedValue(null);
            }}
          >
            <Text style={[styles.selectBtnText, metal === "silver" && styles.selectBtnTextActive]}>Silver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (g)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g., 5.0"
              value={weightGrams}
              onChangeText={(t) => setWeightGrams(t)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Purity (%)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g., 91.6"
              value={purityPercent}
              onChangeText={(t) => setPurityPercent(t)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wastage / Deduction (%)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g., 2.5"
              value={wastagePercent}
              onChangeText={(t) => setWastagePercent(t)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Making Charges (₹/g)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="0"
              value={makingChargePerGram}
              onChangeText={(t) => setMakingChargePerGram(t)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity style={styles.primaryBtn} onPress={calculateEstimate}>
            <Text style={styles.primaryBtnText}>Calculate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={resetCalculator}>
            <Text style={styles.ghostBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload / Book / Options */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Steps</Text>

        <TouchableOpacity style={styles.actionRow} onPress={onUploadImage}>
          <Text style={styles.actionText}>📸 Upload Photo of Item</Text>
          <Text style={styles.actionSub}>{uploadedImage ? "Image added ✔" : "Optional"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={onBookVisit}>
          <Text style={styles.actionText}>🏬 Book Store Visit / Pickup</Text>
          <Text style={styles.actionSub}>Visit: {selectedBranch}</Text>
        </TouchableOpacity>

        <View style={{ height: 8 }} />

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Use Estimated Value</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={[styles.secondaryBtn]} onPress={onExchangeForNew}>
            <Text style={styles.secondaryBtnText}>Exchange → Buy New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn]} onPress={onCreditToWallet}>
            <Text style={styles.secondaryBtnText}>Credit to Wallet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onCashBankTransfer}>
          <Text style={styles.secondaryBtnText}>Get Cash / Bank Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.linkBtn]} onPress={() => setPolicyVisible(true)}>
          <Text style={styles.linkBtnText}>View Buyback Policy & Terms</Text>
        </TouchableOpacity>
      </View>

      {/* Estimate Result */}
      {estimatedValue && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estimate Breakdown</Text>
          <View style={styles.breakRow}>
            <Text>Rate (per g)</Text>
            <Text>{fmt(estimatedValue.ratePerGram)}</Text>
          </View>
          <View style={styles.breakRow}>
            <Text>Purity</Text>
            <Text>{estimatedValue.purityPercent}%</Text>
          </View>
          <View style={styles.breakRow}>
            <Text>Effective weight</Text>
            <Text>{estimatedValue.effectiveWeight} g</Text>
          </View>
          <View style={styles.breakRow}>
            <Text>Gross value</Text>
            <Text>{fmt(estimatedValue.gross)}</Text>
          </View>
          <View style={styles.breakRow}>
            <Text>Wastage / Deduction</Text>
            <Text>- {fmt(estimatedValue.wastage)}</Text>
          </View>
          <View style={styles.breakRow}>
            <Text>Making charges</Text>
            <Text>- {fmt(estimatedValue.makingCharges)}</Text>
          </View>
          <View style={[styles.breakRow, { marginTop: 6 }]}>
            <Text style={{ fontWeight: "700" }}>Estimated final value</Text>
            <Text style={{ fontWeight: "700" }}>{fmt(estimatedValue.finalValue)}</Text>
          </View>
        </View>
      )}

      {/* History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Buyback / Bookings</Text>
        {history.length === 0 ? (
          <Text style={styles.smallText}>No history yet</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{item.type}</Text>
                  <Text style={styles.smallText}>
                    {item.date} • {item.branch ? item.branch + " • " : ""}
                    {item.weight ? `${item.weight} g` : ""} {item.mode ? " • " + item.mode : ""}
                  </Text>
                </View>
                <Text style={{ fontWeight: "700" }}>{item.value ? fmt(item.value) : ""}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Booking modal */}
      <Modal visible={bookModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Book Visit / Pickup</Text>

            <Text style={styles.inputLabel}>Choose branch</Text>
            {/* In real app map or picker */}
            <TouchableOpacity onPress={() => setSelectedBranch("Thiaworld - MG Road")}>
              <Text style={styles.optionText}>Thiaworld - MG Road {selectedBranch === "Thiaworld - MG Road" ? " ✓" : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedBranch("Thiaworld - City Mall")}>
              <Text style={styles.optionText}>Thiaworld - City Mall {selectedBranch === "Thiaworld - City Mall" ? " ✓" : ""}</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>Date (select)</Text>
              {/* Simple next days picker UI */}
              <View style={{ flexDirection: "row", marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((d, idx) => {
                  const dt = new Date();
                  dt.setDate(dt.getDate() + d);
                  const isSelected = selectedDate.toDateString() === dt.toDateString();
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateChip, isSelected && styles.dateChipActive]}
                      onPress={() => setSelectedDate(dt)}
                    >
                      <Text style={{ color: isSelected ? "#fff" : "#333" }}>{dt.toDateString().slice(4, 10)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}>
              <TouchableOpacity
                style={[styles.checkbox, pickup && styles.checkboxChecked]}
                onPress={() => setPickup(!pickup)}
              >
                <Text style={{ color: pickup ? "#fff" : "#333" }}>{pickup ? "✓" : ""}</Text>
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>Request pickup from my address</Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={confirmBooking}>
                <Text style={styles.primaryBtnText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8, flex: 0.7 }]} onPress={() => setBookModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Policy modal */}
      <Modal visible={policyVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: "80%" }]}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Buyback & Exchange Policy</Text>
            <ScrollView>
              <Text style={{ marginBottom: 8 }}>
                • Eligibility: Only BIS-hallmarked items accepted. Proof of purchase may be requested.
              </Text>
              <Text style={{ marginBottom: 8 }}>
                • Deductions: Wastage deduction and making charges apply. Wastage is applied to gross gold value based on store policy.
              </Text>
              <Text style={{ marginBottom: 8 }}>
                • Verification: Final value subject to in-store verification of weight & purity. Estimates are indicative.
              </Text>
              <Text style={{ marginBottom: 8 }}>
                • Payment: Choose Wallet credit, bank transfer or exchange towards new purchase. Bank transfers may take 1–3 business days.
              </Text>
              <Text style={{ marginBottom: 8 }}>
                • Disputes & refunds handled per Thiaworld policies.
              </Text>
              <Text style={{ marginTop: 12, fontWeight: "600" }}>Contact support for more details.</Text>
            </ScrollView>

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => setPolicyVisible(false)}>
              <Text style={styles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf7f2" },
  header: { padding: 16, paddingTop: Platform.OS === "ios" ? 56 : 16, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#5a3e1b" },
  headerSubtitle: { fontSize: 13, color: "#6b6b6b", marginTop: 6 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    padding: 14,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#3b2b12", marginBottom: 8 },
  rateRow: { flexDirection: "row", justifyContent: "space-between" },
  rateLabel: { fontSize: 12, color: "#555" },
  rateValue: { fontSize: 16, fontWeight: "700", color: "#b8860b" },
  smallText: { fontSize: 12, color: "#666", marginTop: 8 },

  // Calculator
  row: { flexDirection: "row", justifyContent: "space-between" },
  selectBtn: {
    flex: 1,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6d6b5",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectBtnActive: { backgroundColor: "#f4e3b8", borderColor: "#d1b15f" },
  selectBtnText: { color: "#333", fontWeight: "700" },
  selectBtnTextActive: { color: "#6b4b14" },

  inputRow: { flexDirection: "row", marginTop: 10 },
  inputGroup: { flex: 1, marginRight: 8 },
  inputLabel: { fontSize: 12, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e6e0d5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  primaryBtn: {
    backgroundColor: "#b8860b",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#b8860b",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  ghostBtnText: { color: "#b8860b", fontWeight: "700" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  actionText: { fontWeight: "600", color: "#333" },
  actionSub: { color: "#777", fontSize: 12 },

  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9c18a",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  secondaryBtnText: { color: "#5a3e1b", fontWeight: "700" },

  linkBtn: { marginTop: 10, alignItems: "center" },
  linkBtnText: { color: "#6b4b14", textDecorationLine: "underline" },

  breakRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" },

  // booking modal
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalBox: { backgroundColor: "#fff", padding: 16, width: "92%", borderRadius: 10 },
  optionText: { paddingVertical: 6, color: "#333" },
  dateChip: { padding: 8, marginRight: 8, borderRadius: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e6e6e6" },
  dateChipActive: { backgroundColor: "#b8860b" },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  checkboxChecked: { backgroundColor: "#b8860b", borderColor: "#b8860b" },

});

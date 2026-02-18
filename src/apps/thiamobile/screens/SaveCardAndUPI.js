// frontend/screens/SaveCardAndUPI.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * SaveCardAndUPI.js
 *
 * Full-featured Save Card & UPI screen (frontend-only).
 * - Saved Cards list (masked), Add/Edit/Delete
 * - Saved UPI list, Add/Delete, Verify placeholder
 * - Mark default payment method
 * - QuickPay toggle & biometric lock placeholder
 * - EMI / Offers badges placeholders per card
 * - Wallet / BNPL section placeholders
 *
 * Security note (real app): Never store raw card data on device or send CVV to your server.
 * Use tokenization via payment gateway (Razorpay, Stripe, PayU, etc.) and follow PCI & RBI guidelines.
 *
 * TODO (integration):
 * - Replace localState with backend API calls (GET/POST/DELETE saved methods)
 * - Integrate tokenization library and secure vault
 * - Add biometric auth via 'react-native-local-auth' or 'react-native-touch-id'
 * - Implement UPI verification ping (collect & verify VPA)
 * - Integrate offers / EMI API
 */

// -- Helper utilities
const maskCard = (num) => {
  if (!num) return "";
  const s = num.toString().replace(/\s+/g, "");
  const last4 = s.slice(-4);
  return `**** **** **** ${last4}`;
};

const detectCardType = (num = "") => {
  // very basic detection
  if (num.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(num)) return "MasterCard";
  if (num.startsWith("6")) return "RuPay/Discover";
  if (num.startsWith("34") || num.startsWith("37")) return "Amex";
  return "Card";
};

const fmtCurrency = (v) =>
  typeof v === "number" ? "₹" + v.toLocaleString("en-IN") : v;

// -- Mock initial data (replace with API fetch)
const INITIAL_CARDS = [
  {
    id: "c1",
    token: "tok_abc123", // payment token (placeholder)
    brand: "Visa",
    masked: "**** **** **** 4242",
    last4: "4242",
    expiry: "08/27",
    name: "Pranav",
    isDefault: true,
    offers: [{ id: "o1", text: "10% off with HDFC CC" }],
    emiAvailable: true,
  },
  {
    id: "c2",
    token: "tok_xyz456",
    brand: "MasterCard",
    masked: "**** **** **** 5555",
    last4: "5555",
    expiry: "11/26",
    name: "Pranav",
    isDefault: false,
    offers: [],
    emiAvailable: false,
  },
];

const INITIAL_UPIS = [
  { id: "u1", vpa: "pranav@ybl", verified: true, isDefault: false },
  { id: "u2", vpa: "thiaworld@upi", verified: false, isDefault: false },
];

export default function SaveCardAndUPI({ navigation }) {
  const insets = useSafeAreaInsets();
  // lists
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [upis, setUpis] = useState(INITIAL_UPIS);

  // UI state
  const [addCardModal, setAddCardModal] = useState(false);
  const [addUpiModal, setAddUpiModal] = useState(false);
  const [editCard, setEditCard] = useState(null);

  // forms
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  const [upiId, setUpiId] = useState("");
  const [quickPayEnabled, setQuickPayEnabled] = useState(true);

  // security & prefs
  const [biometricRequired, setBiometricRequired] = useState(false);
  const [showCVVOnPay, setShowCVVOnPay] = useState(false);

  // offers/wallet placeholders
  const [walletBalance, setWalletBalance] = useState(1250); // ₹
  const [bnplAvailable, setBnplAvailable] = useState(true);

  useEffect(() => {
    // In real app, fetch saved cards & upis from backend here.
    // fetch("/api/user/payment-methods")...
  }, []);

  // --- Card actions ---
  const onOpenAddCard = (c) => {
    if (c) {
      setEditCard(c);
      setCardNumber("****" + c.last4);
      setCardName(c.name || "");
      setCardExpiry(c.expiry || "");
      setCardCVV("");
    } else {
      setEditCard(null);
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCVV("");
    }
    setAddCardModal(true);
  };

  const validateCardForm = () => {
    // Basic front-end validations (server must re-validate).
    const num = cardNumber.replace(/\s+/g, "");
    if (!num || num.length < 12) {
      Alert.alert("Invalid card", "Enter a valid card number.");
      return false;
    }
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      Alert.alert("Invalid expiry", "Expiry should be MM/YY.");
      return false;
    }
    // CVV optional here; in production, CVV should be requested for tokenization.
    return true;
  };

  const onSaveCard = async () => {
    if (!validateCardForm()) return;

    // TODO: Tokenize card via payment gateway here.
    // Example: send cardNumber, expiry, name, cvv to gateway tokenization endpoint.
    // On success, store token ID + masked number on your server and return saved method id.
    // --- For demo, we'll simulate saved card ---

    // If editing an existing card:
    if (editCard) {
      setCards((prev) =>
        prev.map((c) => (c.id === editCard.id ? { ...c, name: cardName, expiry: cardExpiry } : c))
      );
      setEditCard(null);
      setAddCardModal(false);
      Alert.alert("Saved", "Card updated locally (simulate).");
      return;
    }

    const newCard = {
      id: "c" + (cards.length + 1),
      token: "tok_sim_" + Math.random().toString(36).slice(2, 8),
      brand: detectCardType(cardNumber.replace(/\s+/g, "")),
      masked: maskCard(cardNumber),
      last4: cardNumber.slice(-4),
      expiry: cardExpiry,
      name: cardName,
      isDefault: cards.length === 0, // first card default
      offers: [], // fetch offers from bank API in real app
      emiAvailable: false,
    };

    setCards((prev) => [newCard, ...prev]);
    setAddCardModal(false);
    Alert.alert("Card saved", "Card added (simulation).");
  };

  const onDeleteCard = (cardId) => {
    Alert.alert("Delete Card", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setCards((prev) => prev.filter((c) => c.id !== cardId));
        },
      },
    ]);
  };

  const onSetDefaultCard = (cardId) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === cardId })));
    Alert.alert("Default set", "Default payment method updated.");
  };

  // --- UPI actions ---
  const onOpenAddUpi = () => {
    setUpiId("");
    setAddUpiModal(true);
  };

  const validateUpi = (vpa) => {
    // Basic VPA format check: something@bank
    return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{3,}$/.test(vpa);
  };

  const onSaveUpi = () => {
    if (!validateUpi(upiId)) {
      Alert.alert("Invalid UPI", "Enter valid UPI ID like name@bank");
      return;
    }
    // TODO: Trigger UPI collect / soft-ping to verify VPA via backend or UPI SDK
    const exists = upis.some((u) => u.vpa.toLowerCase() === upiId.toLowerCase());
    if (exists) {
      Alert.alert("Already added", "This UPI ID is already saved.");
      return;
    }
    const newUpi = { id: "u" + (upis.length + 1), vpa: upiId, verified: false, isDefault: false };
    setUpis((prev) => [newUpi, ...prev]);
    setAddUpiModal(false);
    Alert.alert("UPI added", "UPI saved. Verify at checkout (simulation).");
  };

  const onDeleteUpi = (id) => {
    Alert.alert("Remove UPI", "Remove this UPI ID?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setUpis((prev) => prev.filter((u) => u.id !== id)),
      },
    ]);
  };

  const onVerifyUpi = (id) => {
    // TODO: call backend collect request to verify VPA
    setUpis((prev) => prev.map((u) => (u.id === id ? { ...u, verified: true } : u)));
    Alert.alert("UPI Verified", "This UPI ID is now verified (simulation).");
  };

  const onSetDefaultUpi = (id) => {
    setUpis((prev) => prev.map((u) => ({ ...u, isDefault: u.id === id })));
    Alert.alert("Default UPI set", "Default payment method updated.");
  };

  // --- Checkout helper (example usage) ---
  const onChooseForCheckout = (method) => {
    // method could be card or upi object. Return to checkout with selected token or vpa.
    // TODO: Navigate back to Checkout and pass chosen method
    Alert.alert("Selected for checkout", `Selected: ${method.masked || method.vpa || method.id}`);
  };

  // --- Render components ---
  const renderCardItem = ({ item }) => (
    <View style={styles.rowBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardBrand}>{item.brand} {item.isDefault ? " • Default" : ""}</Text>
        <Text style={styles.cardMasked}>{item.masked}  •  Exp {item.expiry}</Text>
        <View style={{ flexDirection: "row", marginTop: 6, alignItems: "center" }}>
          {item.emiAvailable && <View style={styles.badge}><Text style={styles.badgeText}>EMI</Text></View>}
          {item.offers && item.offers.length > 0 && <View style={[styles.badge, { backgroundColor: "#e8f4ff" }]}><Text style={[styles.badgeText, { color: "#0077cc" }]}>{item.offers[0].text}</Text></View>}
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChooseForCheckout(item)}>
          <Text style={{ color: "#1e90ff" }}>Use</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onOpenAddCard(item)}>
          <Text style={{ color: "#333" }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDeleteCard(item.id)}>
          <Text style={{ color: "#d32f2f" }}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginTop: 6 }]} onPress={() => onSetDefaultCard(item.id)}>
          <Text style={{ color: item.isDefault ? "#b8860b" : "#666" }}>{item.isDefault ? "Default" : "Set Default"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpiItem = ({ item }) => (
    <View style={styles.rowBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.upiText}>{item.vpa} {item.verified ? " • Verified" : " • Unverified"}</Text>
        <Text style={styles.smallText}>{item.isDefault ? "Default UPI" : ""}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChooseForCheckout(item)}>
          <Text style={{ color: "#1e90ff" }}>Use</Text>
        </TouchableOpacity>
        {!item.verified && <TouchableOpacity style={styles.iconBtn} onPress={() => onVerifyUpi(item.id)}><Text style={{ color: "#0077cc" }}>Verify</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDeleteUpi(item.id)}><Text style={{ color: "#d32f2f" }}>Remove</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginTop: 6 }]} onPress={() => onSetDefaultUpi(item.id)}>
          <Text style={{ color: item.isDefault ? "#b8860b" : "#666" }}>{item.isDefault ? "Default" : "Set Default"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 + Math.max(12, insets.bottom) + 8 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Saved Cards & UPI</Text>
          <Text style={styles.subtitle}>Manage payment methods, offers & preferences</Text>
        </View>

        {/* Wallet & BNPL */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Wallet & BNPL</Text>
            <Text style={styles.smallText}>{fmtCurrency(walletBalance)}</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.smallText}>Buy now pay later: {bnplAvailable ? "Available" : "Not available"}</Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity style={styles.quickBtn} onPress={() => Alert.alert("Wallet", "Go to Wallet (simulate)")}>
                <Text style={styles.quickBtnText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => Alert.alert("PayLater", "Explore BNPL options (simulate)")}>
                <Text style={styles.quickBtnText}>Explore BNPL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* QuickPay & Security toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QuickPay & Security</Text>
          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <Text>Enable QuickPay (one-tap)</Text>
            <Switch value={quickPayEnabled} onValueChange={setQuickPayEnabled} />
          </View>
          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <Text>Require Biometric to view payment methods</Text>
            <Switch value={biometricRequired} onValueChange={(v) => {
              // TODO: Check device biometric availability
              setBiometricRequired(v);
              Alert.alert("Biometric", v ? "Biometric required (simulate)" : "Biometric disabled (simulate)");
            }} />
          </View>
          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <Text>Require CVV at payment</Text>
            <Switch value={showCVVOnPay} onValueChange={setShowCVVOnPay} />
          </View>
          <Text style={[styles.smallText, { marginTop: 8 }]}>Note: Cards are tokenized and stored securely. CVV may be required during payment. This is a demo UI — integrate a payment gateway for production.</Text>
        </View>

        {/* Saved Cards */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            <TouchableOpacity onPress={() => onOpenAddCard(null)}>
              <Text style={styles.linkText}>+ Add Card</Text>
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <Text style={styles.smallText}>No saved cards</Text>
          ) : (
            <FlatList data={cards} keyExtractor={(i) => i.id} renderItem={renderCardItem} />
          )}
        </View>

        {/* Saved UPI */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Saved UPI IDs</Text>
            <TouchableOpacity onPress={onOpenAddUpi}>
              <Text style={styles.linkText}>+ Add UPI</Text>
            </TouchableOpacity>
          </View>

          {upis.length === 0 ? (
            <Text style={styles.smallText}>No saved UPI IDs</Text>
          ) : (
            <FlatList data={upis} keyExtractor={(i) => i.id} renderItem={renderUpiItem} />
          )}
        </View>

        {/* Offers & Rewards placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Rewards</Text>
          <Text style={styles.smallText}>Best card offers will appear here. (Integrate Offers API to show context-aware bank offers & reward points)</Text>
        </View>

        {/* Footer / Help */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <Text style={styles.sectionTitle}>Help & Security</Text>
          <Text style={styles.smallText}>Your card details are stored using tokenization (payment gateway). We never store raw CVV. For more, visit security settings or contact support.</Text>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={addCardModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editCard ? "Edit Card" : "Add New Card"}</Text>
            <TextInput placeholder="Card Number" keyboardType="number-pad" value={cardNumber} onChangeText={setCardNumber} style={styles.input} />
            <TextInput placeholder="Name on Card" value={cardName} onChangeText={setCardName} style={styles.input} />
            <View style={{ flexDirection: "row" }}>
              <TextInput placeholder="MM/YY" value={cardExpiry} onChangeText={setCardExpiry} style={[styles.input, { flex: 1, marginRight: 8 }]} />
              <TextInput placeholder="CVV" value={cardCVV} onChangeText={setCardCVV} style={[styles.input, { width: 100 }]} keyboardType="number-pad" secureTextEntry />
            </View>

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onSaveCard}><Text style={styles.primaryBtnText}>Save Card</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => setAddCardModal(false)}><Text style={styles.ghostBtnText}>Cancel</Text></TouchableOpacity>
            </View>

            <Text style={[styles.smallText, { marginTop: 12 }]}>By saving a card, you accept the tokenization & security policies. For production, integrate gateway tokenization (do not send CVV to your server).</Text>
          </View>
        </View>
      </Modal>

      {/* Add UPI Modal */}
      <Modal visible={addUpiModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add UPI ID</Text>
            <TextInput placeholder="example@bank" value={upiId} onChangeText={setUpiId} style={styles.input} autoCapitalize="none" />
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onSaveUpi}><Text style={styles.primaryBtnText}>Save UPI</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => setAddUpiModal(false)}><Text style={styles.ghostBtnText}>Cancel</Text></TouchableOpacity>
            </View>
            <Text style={[styles.smallText, { marginTop: 12 }]}>We will attempt to verify your VPA at the time of adding (demo: simulated). For production, call UPI collect/verify APIs.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#f6f7f9" },
  header: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 20, fontWeight: "800", color: "#222" },
  subtitle: { color: "#666", marginTop: 6 },
  section: { backgroundColor: "#fff", marginTop: 12, padding: 12, marginHorizontal: 12, borderRadius: 8 },
  sectionTitle: { fontWeight: "700", fontSize: 15 },
  smallText: { color: "#666", marginTop: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: "#1E90FF", fontWeight: "700" },

  // List items
  rowBox: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", alignItems: "center" },
  cardBrand: { fontWeight: "700", marginBottom: 4 },
  cardMasked: { color: "#444" },
  upiText: { fontWeight: "700" },
  iconBtn: { paddingVertical: 6 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: "#fff3cd", marginRight: 8 },
  badgeText: { fontSize: 12, color: "#9a6b00", fontWeight: "700" },

  quickBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e6e6e6", marginRight: 8 },
  quickBtnText: { color: "#333" },

  // modal
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalBox: { width: "92%", backgroundColor: "#fff", padding: 16, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e6e6e6", padding: 10, borderRadius: 8, backgroundColor: "#fff", marginTop: 8 },

  primaryBtn: { backgroundColor: "#1E90FF", padding: 12, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: { borderWidth: 1, borderColor: "#1E90FF", padding: 12, borderRadius: 8, alignItems: "center" },
  ghostBtnText: { color: "#1E90FF", fontWeight: "700" },

});

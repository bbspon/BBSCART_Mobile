// frontend/screens/SavedAddressScreen.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * SavedAddressScreen.js
 *
 * Full-featured Saved Address screen for a jewellery app.
 * Features implemented (frontend-only, with TODOs for integration):
 *  - List saved addresses with tags (Home/Work/Gift/Store-Pickup)
 *  - Add / Edit / Delete address modal
 *  - Default Shipping / Default Billing flags
 *  - Multiple contact numbers per address (primary + alt)
 *  - Delivery instructions, Gift message field
 *  - GST / Business billing support
 *  - Serviceability / Pincode check (mock)
 *  - Priority / Express address tagging (city-level)
 *  - KYC-verified address flag for high-value orders
 *  - Geo-location / Map placeholder (integrate Google Maps / Mapbox)
 *  - Link to BookStoreVisit (store pickup)
 *  - Checkout selection helper (returns selected address to checkout - simulated)
 *
 * Notes:
 *  - This is a front-end mock; persist using your backend endpoints:
 *    GET /user/addresses, POST /user/addresses, PATCH /user/addresses/:id, DELETE /user/addresses/:id
 *  - Integrate address auto-complete (Places API) and pincode->city/state lookup for best UX.
 *  - For KYC/verification flow, integrate secure upload + verification endpoints.
 */

// --- Helpers ---
const genId = () => "a" + Math.random().toString(36).slice(2, 9).toUpperCase();

// Sample initial addresses (mock)
const INITIAL_ADDRESSES = [
  {
    id: "a1",
    name: "Priya Lakshmi",
    primaryPhone: "+91 9876543210",
    altPhone: "",
    pincode: "600017",
    state: "Tamil Nadu",
    city: "Chennai",
    area: "T. Nagar",
    street: "7th Avenue, Flat 10A",
    landmark: "Near Durga Bakery",
    type: "Home", // Home | Work | Gift | Other | Store-Pickup
    deliveryInstructions: "Call before delivery. Leave with neighbor if not home.",
    isDefaultShipping: true,
    isDefaultBilling: true,
    gstNumber: "", // business users
    isPriority: true, // qualifies for express delivery (metro)
    isKycVerified: true, // verified address for high-value orders
    giftMessage: "",
    synced: true, // synced to cloud
  },
  {
    id: "a2",
    name: "Ramesh Kumar",
    primaryPhone: "+91 9123456780",
    altPhone: "+91 9988776655",
    pincode: "641001",
    state: "Tamil Nadu",
    city: "Coimbatore",
    area: "Town Hall",
    street: "MG Road, Shop 5",
    landmark: "Opposite Mall",
    type: "Work",
    deliveryInstructions: "Hand over to security desk.",
    isDefaultShipping: false,
    isDefaultBilling: false,
    gstNumber: "33ABCDE1234F1Z5",
    isPriority: false,
    isKycVerified: false,
    giftMessage: "",
    synced: false,
  },
];

export default function SavedAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [serviceabilityCache, setServiceabilityCache] = useState({}); // pincode -> bool (mock)
  const [showOnlyKyc, setShowOnlyKyc] = useState(false);

  useEffect(() => {
    // TODO: Replace with API fetch:
    // fetch('/api/user/addresses').then(...)
    // For now, addresses state initialized above.
  }, []);

  // Form default
  function initialForm() {
    return {
      id: null,
      name: "",
      primaryPhone: "",
      altPhone: "",
      pincode: "",
      state: "",
      city: "",
      area: "",
      street: "",
      landmark: "",
      type: "Home",
      deliveryInstructions: "",
      isDefaultShipping: false,
      isDefaultBilling: false,
      gstNumber: "",
      isPriority: false,
      isKycVerified: false,
      giftMessage: "",
      synced: false,
    };
  }

  // --- CRUD operations (frontend simulation) ---
  const openAddModal = (type = "Home") => {
    setEditingAddress(null);
    setForm({ ...initialForm(), type });
    setModalVisible(true);
  };


  const validateForm = () => {
    const required = ["name", "primaryPhone", "pincode", "street", "city", "state"];
    for (let k of required) {
      if (!form[k] || form[k].toString().trim() === "") {
        Alert.alert("Missing field", `Please fill ${k}`);
        return false;
      }
    }
    // basic pincode validation
    if (!/^\d{6}$/.test(form.pincode)) {
      Alert.alert("Invalid pincode", "Pincode should be 6 digits.");
      return false;
    }
    return true;
  };

  const saveAddress = () => {
    if (!validateForm()) return;

    // Serviceability check (mock)
    const serv = mockServiceabilityCheck(form.pincode);
    if (!serv) {
      Alert.alert(
        "Delivery not available",
        "We currently do not deliver insured jewelry to this pincode. You can still save the address for pickup."
      );
    }

    if (form.isDefaultShipping) {
      // unset existing default shipping
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefaultShipping: false })));
    }
    if (form.isDefaultBilling) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefaultBilling: false })));
    }

    if (editingAddress) {
      // update
      setAddresses((prev) => prev.map((a) => (a.id === form.id ? { ...form, synced: false } : a)));
      // TODO: PATCH /api/user/addresses/:id
      Alert.alert("Saved", "Address updated (local).");
    } else {
      const newAddr = { ...form, id: genId(), synced: false };
      setAddresses((prev) => [newAddr, ...prev]);
      // TODO: POST /api/user/addresses
      Alert.alert("Saved", "Address added to your address book.");
    }

    setModalVisible(false);
    setEditingAddress(null);
    setForm(initialForm());
  };

  const removeAddress = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((a) => a.id !== id));
          // TODO: DELETE /api/user/addresses/:id
        },
      },
    ]);
  };

  const setDefaultShipping = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefaultShipping: a.id === id })));
    // TODO: PATCH backend
    Alert.alert("Default Shipping", "Default shipping address updated.");
  };

  const setDefaultBilling = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefaultBilling: a.id === id })));
    Alert.alert("Default Billing", "Default billing address updated.");
  };

  // Mock serviceability: pincode ending with even digit = serviceable (mock rule)
  const mockServiceabilityCheck = (pincode) => {
    if (!/^\d{6}$/.test(pincode)) return false;
    const last = parseInt(pincode[pincode.length - 1], 10);
    const ok = last % 2 === 0;
    setServiceabilityCache((prev) => ({ ...prev, [pincode]: ok }));
    return ok;
  };

  const checkServiceability = (pincode) => {
    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert("Invalid pincode", "Enter 6 digit pincode to check.");
      return;
    }
    const cached = serviceabilityCache[pincode];
    if (cached !== undefined) {
      Alert.alert("Serviceability", cached ? "Deliverable to this pincode." : "Not deliverable for insured delivery.");
      return;
    }
    const ok = mockServiceabilityCheck(pincode);
    Alert.alert("Serviceability", ok ? "Deliverable to this pincode." : "Not deliverable for insured delivery.");
  };

  // Simulate syncing addresses to cloud
  const syncAddressToCloud = (id) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, synced: true } : a)));
    // TODO: call backend sync endpoint
    Alert.alert("Sync", "Address synced to cloud.");
  };

  // Select address for checkout (simulate)
  const chooseForCheckout = (addr) => {
    // In real app: navigation.navigate('Checkout', { selectedAddressId: addr.id })
    Alert.alert("Selected for Checkout", `Shipping to: ${addr.name}, ${addr.street}, ${addr.city}`);
  };

  // Quick "use store pickup" - open BookStoreVisit screen (if exists)
  const useStorePickup = () => {
    // navigate to BookStoreVisit
    if (navigation && navigation.navigate) {
      navigation.navigate("BookStoreVisit");
    } else {
      Alert.alert("Store Pickup", "Navigate to Book Store Visit (simulate).");
    }
  };

  // Render address card
  const renderAddress = ({ item }) => {
    if (showOnlyKyc && !item.isKycVerified) return null;
    const addressText = [item.street, item.area, item.landmark, item.city, item.state, item.pincode]
      .filter(Boolean)
      .join(", ");
    return (
      <View style={styles.addrCard}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.addrName}>{item.name}</Text>
            <View style={{ flexDirection: "row" }}>
              {item.isPriority && <Text style={styles.priorityBadge}>Priority</Text>}
              {item.isKycVerified && <Text style={styles.kycBadge}>KYC</Text>}
              {item.synced ? <Text style={styles.syncedText}>Synced</Text> : <Text style={styles.unsyncedText}>Unsynced</Text>}
            </View>
          </View>

          <Text style={styles.addrPhone}>{item.primaryPhone}{item.altPhone ? ` • ${item.altPhone}` : ""}</Text>
          <Text style={styles.addrText}>{addressText}</Text>
          {item.deliveryInstructions ? <Text style={styles.small}>{`Note: ${item.deliveryInstructions}`}</Text> : null}
          {item.giftMessage ? <Text style={styles.small}>{`Gift: ${item.giftMessage}`}</Text> : null}

          <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => chooseForCheckout(item)}>
              <Text style={styles.smallBtnText}>Use for Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => openEditModal(item)}>
              <Text style={styles.smallBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => removeAddress(item.id)}>
              <Text style={[styles.smallBtnText, { color: "#d32f2f" }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => syncAddressToCloud(item.id)}>
              <Text style={styles.smallBtnText}>{item.synced ? "Resync" : "Sync"}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity onPress={() => setDefaultShipping(item.id)}><Text style={item.isDefaultShipping ? styles.defaultTextActive : styles.linkText}>Set as Shipping</Text></TouchableOpacity>
            <Text style={{ marginHorizontal: 6 }}>|</Text>
            <TouchableOpacity onPress={() => setDefaultBilling(item.id)}><Text style={item.isDefaultBilling ? styles.defaultTextActive : styles.linkText}>Set as Billing</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // open edit modal prefilled
  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setForm({ ...addr });
    setModalVisible(true);
  };

  // Render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 14 + Math.max(12, insets.bottom) + 8 }}>
        <Text style={styles.title}>Address Book</Text>
        <Text style={styles.subtitle}>Save delivery, billing & gift addresses for fast checkout</Text>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal("Home")}>
            <Text style={styles.addBtnText}>+ Add Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtnOutline} onPress={() => openAddModal("Gift")}>
            <Text style={styles.addBtnOutlineText}>+ Add Gift Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickupBtn} onPress={useStorePickup}>
            <Text style={{ color: "#fff" }}>Store Pickup</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
          <Text style={styles.small}>Show only KYC-verified</Text>
          <Switch value={showOnlyKyc} onValueChange={setShowOnlyKyc} style={{ marginLeft: 8 }} />
        </View>

        {/* Address list */}
        <View style={{ marginTop: 12 }}>
          <FlatList
            data={addresses}
            keyExtractor={(i) => i.id}
            renderItem={renderAddress}
            ListEmptyComponent={<Text style={{ color: "#666" }}>No saved addresses. Add one to continue.</Text>}
          />
        </View>

        {/* Quick tips / info */}
        <View style={styles.infoBox}>
          <Text style={{ fontWeight: "700" }}>Why add addresses?</Text>
          <Text style={styles.small}>Saved addresses speed up checkout, enable insured delivery & in-store pickup. Mark an address as default for quick ordering.</Text>
        </View>

      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingAddress ? "Edit Address" : "Add New Address"}</Text>

              <TextInput placeholder="Full name" value={form.name} onChangeText={(t) => setForm((s) => ({ ...s, name: t }))} style={styles.input} />
              <TextInput placeholder="Primary phone" keyboardType="phone-pad" value={form.primaryPhone} onChangeText={(t) => setForm((s) => ({ ...s, primaryPhone: t }))} style={styles.input} />
              <TextInput placeholder="Alt phone (optional)" keyboardType="phone-pad" value={form.altPhone} onChangeText={(t) => setForm((s) => ({ ...s, altPhone: t }))} style={styles.input} />

              <View style={{ flexDirection: "row" }}>
                <TextInput placeholder="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={(t) => setForm((s) => ({ ...s, pincode: t }))} style={[styles.input, { flex: 1 }]} />
                <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8, alignSelf: "center" }]} onPress={() => checkServiceability(form.pincode)}>
                  <Text style={styles.smallBtnText}>Check</Text>
                </TouchableOpacity>
              </View>

              <TextInput placeholder="State" value={form.state} onChangeText={(t) => setForm((s) => ({ ...s, state: t }))} style={styles.input} />
              <TextInput placeholder="City" value={form.city} onChangeText={(t) => setForm((s) => ({ ...s, city: t }))} style={styles.input} />
              <TextInput placeholder="Area / Locality" value={form.area} onChangeText={(t) => setForm((s) => ({ ...s, area: t }))} style={styles.input} />
              <TextInput placeholder="Street / House no." value={form.street} onChangeText={(t) => setForm((s) => ({ ...s, street: t }))} style={styles.input} />
              <TextInput placeholder="Landmark (optional)" value={form.landmark} onChangeText={(t) => setForm((s) => ({ ...s, landmark: t }))} style={styles.input} />

              <Text style={{ marginTop: 8, fontWeight: "700" }}>Address Type</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                {["Home", "Work", "Gift", "Other"].map((t) => (
                  <TouchableOpacity key={t} onPress={() => setForm((s) => ({ ...s, type: t }))} style={[styles.typeChip, form.type === t && styles.typeChipActive]}>
                    <Text style={form.type === t ? { color: "#fff", fontWeight: "700" } : {}}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput placeholder="Delivery instructions (optional)" value={form.deliveryInstructions} onChangeText={(t) => setForm((s) => ({ ...s, deliveryInstructions: t }))} style={styles.input} />
              {form.type === "Gift" && <TextInput placeholder="Gift message (optional)" value={form.giftMessage} onChangeText={(t) => setForm((s) => ({ ...s, giftMessage: t }))} style={styles.input} />}

              <TextInput placeholder="GST / Business number (optional)" value={form.gstNumber} onChangeText={(t) => setForm((s) => ({ ...s, gstNumber: t }))} style={styles.input} />
              <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setForm((s) => ({ ...s, isDefaultShipping: !s.isDefaultShipping }))}>
                    <Text style={styles.smallBtnText}>{form.isDefaultShipping ? "Default Shipping ✓" : "Make Shipping"}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setForm((s) => ({ ...s, isDefaultBilling: !s.isDefaultBilling }))}>
                    <Text style={styles.smallBtnText}>{form.isDefaultBilling ? "Default Billing ✓" : "Make Billing"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setForm((s) => ({ ...s, isPriority: !s.isPriority }))}>
                  <Text style={styles.smallBtnText}>{form.isPriority ? "Priority ✓" : "Mark Priority"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { flex: 1, marginLeft: 8 }]} onPress={() => setForm((s) => ({ ...s, isKycVerified: !s.isKycVerified }))}>
                  <Text style={styles.smallBtnText}>{form.isKycVerified ? "KYC ✓" : "Mark KYC"}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", marginTop: 14, justifyContent: "space-between" }}>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={saveAddress}><Text style={styles.primaryBtnText}>Save Address</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ghostBtn, { flex: 1, marginLeft: 10 }]} onPress={() => { setModalVisible(false); setEditingAddress(null); setForm(initialForm()); }}><Text style={styles.ghostBtnText}>Cancel</Text></TouchableOpacity>
              </View>

              <Text style={[styles.small, { marginTop: 12 }]}>Tip: Use the Map option to auto-fill address fields. (Integrate Google Places API for best UX)</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf6" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4, color: "#2d2d2d" },
  subtitle: { color: "#666", marginBottom: 12 },

  controlsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap:7},
  addBtn: { backgroundColor: "#b8860b", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  addBtnOutline: { borderWidth: 1, borderColor: "#b8860b", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  addBtnOutlineText: { color: "#b8860b", fontWeight: "700" },
  pickupBtn: { backgroundColor: "#6b4b14", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },

  small: { color: "#666", fontSize: 12 },
  infoBox: { backgroundColor: "#fff8e6", padding: 12, borderRadius: 8, marginTop: 14 },

  addrCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginVertical: 8, elevation: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addrName: { fontWeight: "800", fontSize: 16 },
  addrPhone: { color: "#444", marginTop: 4 },
  addrText: { color: "#555", marginTop: 6 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  smallBtnText: { color: "#333", fontWeight: "700" },

  linkText: { color: "#1e90ff" },
  defaultTextActive: { color: "#b8860b", fontWeight: "700" },
  priorityBadge: { backgroundColor: "#ffe6b3", color: "#8a5d00", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 },
  kycBadge: { backgroundColor: "#e6f7ff", color: "#0077aa", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 },
  syncedText: { color: "#2e7d32", marginLeft: 8, fontSize: 12 },
  unsyncedText: { color: "#ff9800", marginLeft: 8, fontSize: 12 },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalBox: { width: "94%", height: "86%", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },

  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, padding: 10, marginTop: 8, backgroundColor: "#fff" },
  typeChip: { padding: 8, marginRight: 8, borderWidth: 1, borderColor: "#eee", borderRadius: 8, backgroundColor: "#fff" },
  typeChipActive: { backgroundColor: "#b8860b" },

  primaryBtn: { backgroundColor: "#b8860b", padding: 12, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  ghostBtn: { borderWidth: 1, borderColor: "#b8860b", padding: 12, borderRadius: 8, alignItems: "center" },
  ghostBtnText: { color: "#b8860b", fontWeight: "800" },

  smallText: { fontSize: 12, color: "#666", marginTop: 6 },
});


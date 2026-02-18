// frontend/screens/SavedCardsUPI.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";

// Dummy data
const initialPaymentMethods = {
  cards: [
    { id: "c1", type: "Visa", number: "4111111111111234", expiry: "08/25", default: true },
    { id: "c2", type: "Mastercard", number: "5500000000005678", expiry: "12/26", default: false },
  ],
  upis: [
    { id: "u1", upi: "xyz@upi", bank: "HDFC", default: true },
    { id: "u2", upi: "abc@upi", bank: "ICICI", default: false },
  ],
};

export default function SavedCardsUPI() {
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingUPI, setEditingUPI] = useState(null);
  const [newCard, setNewCard] = useState({ type: "", number: "", expiry: "" });
  const [newUPI, setNewUPI] = useState({ upi: "", bank: "" });

  // Actions
  const openAddCard = () => {
    setNewCard({ type: "", number: "", expiry: "" });
    setEditingCard(null);
    setModalVisible(true);
  };

  const openEditCard = (card) => {
    setEditingCard(card);
    setNewCard({ type: card.type, number: card.number, expiry: card.expiry });
    setModalVisible(true);
  };

  const saveCard = () => {
    if (!newCard.type || !newCard.number || !newCard.expiry) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (editingCard) {
      // Edit existing card
      setPaymentMethods((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === editingCard.id ? { ...c, ...newCard } : c
        ),
      }));
    } else {
      // Add new card
      setPaymentMethods((prev) => ({
        ...prev,
        cards: [
          ...prev.cards,
          { id: "c" + Date.now(), default: false, ...newCard },
        ],
      }));
    }
    setModalVisible(false);
  };

  const openAddUPI = () => {
    setNewUPI({ upi: "", bank: "" });
    setEditingUPI(null);
    setModalVisible(true);
  };

  const openEditUPI = (upi) => {
    setEditingUPI(upi);
    setNewUPI({ upi: upi.upi, bank: upi.bank });
    setModalVisible(true);
  };

  const saveUPI = () => {
    if (!newUPI.upi || !newUPI.bank) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (editingUPI) {
      setPaymentMethods((prev) => ({
        ...prev,
        upis: prev.upis.map((u) =>
          u.id === editingUPI.id ? { ...u, ...newUPI } : u
        ),
      }));
    } else {
      setPaymentMethods((prev) => ({
        ...prev,
        upis: [...prev.upis, { id: "u" + Date.now(), default: false, ...newUPI }],
      }));
    }
    setModalVisible(false);
  };

  const deleteCard = (card) =>
    Alert.alert("Delete Card", `Delete ${card.number}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setPaymentMethods((prev) => ({
            ...prev,
            cards: prev.cards.filter((c) => c.id !== card.id),
          })),
      },
    ]);

  const deleteUPI = (upi) =>
    Alert.alert("Delete UPI", `Delete ${upi.upi}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setPaymentMethods((prev) => ({
            ...prev,
            upis: prev.upis.filter((u) => u.id !== upi.id),
          })),
      },
    ]);

  const setDefaultCard = (cardId) =>
    setPaymentMethods((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => ({ ...c, default: c.id === cardId })),
    }));

  const setDefaultUPI = (upiId) =>
    setPaymentMethods((prev) => ({
      ...prev,
      upis: prev.upis.map((u) => ({ ...u, default: u.id === upiId })),
    }));

  // Render
  const renderCard = ({ item }) => (
    <View style={styles.methodCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.methodType}>{item.type} •••• {item.number.slice(-4)}</Text>
        <Text style={styles.methodExpiry}>Expiry: {item.expiry}</Text>
        {item.default && <Text style={styles.defaultBadge}>Default</Text>}
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditCard(item)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCard(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
        {!item.default && (
          <TouchableOpacity style={styles.defaultBtn} onPress={() => setDefaultCard(item.id)}>
            <Text style={styles.defaultBtnText}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderUPI = ({ item }) => (
    <View style={styles.methodCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.methodType}>{item.upi}</Text>
        <Text style={styles.methodExpiry}>Bank: {item.bank}</Text>
        {item.default && <Text style={styles.defaultBadge}>Default</Text>}
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditUPI(item)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteUPI(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
        {!item.default && (
          <TouchableOpacity style={styles.defaultBtn} onPress={() => setDefaultUPI(item.id)}>
            <Text style={styles.defaultBtnText}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Cards Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        <FlatList
          data={paymentMethods.cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddCard}>
          <Text style={styles.addText}>+ Add New Card</Text>
        </TouchableOpacity>
      </View>

      {/* UPI Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved UPI IDs</Text>
        <FlatList
          data={paymentMethods.upis}
          renderItem={renderUPI}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddUPI}>
          <Text style={styles.addText}>+ Add New UPI</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {editingCard !== null || editingCard === null ? (
              <>
                <Text style={styles.modalTitle}>{editingCard ? "Edit Card" : "Add Card"}</Text>
                <TextInput
                  placeholder="Card Type (Visa/Mastercard)"
                  style={styles.input}
                  value={newCard.type}
                  onChangeText={(t) => setNewCard({ ...newCard, type: t })}
                />
                <TextInput
                  placeholder="Card Number"
                  style={styles.input}
                  keyboardType="number-pad"
                  value={newCard.number}
                  onChangeText={(t) => setNewCard({ ...newCard, number: t })}
                />
                <TextInput
                  placeholder="Expiry (MM/YY)"
                  style={styles.input}
                  value={newCard.expiry}
                  onChangeText={(t) => setNewCard({ ...newCard, expiry: t })}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveCard}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{editingUPI ? "Edit UPI" : "Add UPI"}</Text>
                <TextInput
                  placeholder="UPI ID"
                  style={styles.input}
                  value={newUPI.upi}
                  onChangeText={(t) => setNewUPI({ ...newUPI, upi: t })}
                />
                <TextInput
                  placeholder="Bank Name"
                  style={styles.input}
                  value={newUPI.bank}
                  onChangeText={(t) => setNewUPI({ ...newUPI, bank: t })}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveUPI}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  section: { padding: 12, backgroundColor: "#fff", marginVertical: 6, borderRadius: 8, elevation: 1 },
  sectionTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 8, color: "#2d3436" },
  methodCard: { backgroundColor: "#eaeaea", borderRadius: 8, padding: 12, marginVertical: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  methodType: { fontSize: 14, fontWeight: "600", color: "#2d3436" },
  methodExpiry: { fontSize: 12, color: "#636e72" },
  defaultBadge: { fontSize: 10, color: "#fff", backgroundColor: "#0984e3", paddingHorizontal: 6, borderRadius: 4, marginTop: 4, alignSelf: "flex-start" },
  editBtn: { marginHorizontal: 4, padding: 6, backgroundColor: "#fdcb6e", borderRadius: 4 },
  editText: { fontSize: 12, color: "#2d3436" },
  deleteBtn: { marginHorizontal: 4, padding: 6, backgroundColor: "#d63031", borderRadius: 4 },
  deleteText: { fontSize: 12, color: "#fff" },
  defaultBtn: { marginHorizontal: 4, padding: 6, backgroundColor: "#00b894", borderRadius: 4 },
  defaultBtnText: { fontSize: 12, color: "#fff" },
  addBtn: { marginTop: 8, padding: 10, backgroundColor: "#0984e3", borderRadius: 6, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginVertical: 6 },
  saveBtn: { padding: 10, backgroundColor: "#0984e3", borderRadius: 6, width: 100, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { padding: 10, backgroundColor: "#b2bec3", borderRadius: 6, width: 100, alignItems: "center" },
  cancelText: { color: "#2d3436", fontWeight: "bold" },
});

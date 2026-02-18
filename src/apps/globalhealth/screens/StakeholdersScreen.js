// StakeholdersPage.native.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const stakeholders = [
  {
    role: "User (Patient)",
    icon: "account-heart",
    description:
      "Customer who buys and benefits from Care Pass. Accesses hospitals, labs, pharmacies at low cost.",
    action: "Explore Membership",
    link: "/health-membership",
  },
  {
    role: "Hospital",
    icon: "hospital-building",
    description:
      "Healthcare provider offering consultations, treatments, or health packages via the BBSCART ecosystem.",
    action: "Join as Hospital",
    link: "/partner-onboarding",
  },
  {
    role: "Lab / Scan Center",
    icon: "file-document-outline",
    description:
      "Diagnostic partner offering tests, scans, reports integrated with the patient journey.",
    action: "Join as Lab Partner",
    link: "/partner-onboarding",
  },
  {
    role: "Pharmacy",
    icon: "pill",
    description:
      "Medicine fulfillment partner that delivers prescriptions generated through hospitals.",
    action: "Join Pharmacy Network",
    link: "/partner-onboarding",
  },
  {
    role: "BBSCART Admin",
    icon: "cog",
    description:
      "Platform administrator managing onboarding, wallet, pricing, commissions, and all interactions.",
    action: "Go to Admin Panel",
    link: "/admin-dashboard",
  },
  {
    role: "Referral Agent / Business Partner",
    icon: "account-plus",
    description:
      "Earn commission by referring users, hospitals, or labs into the BBSCART platform.",
    action: "Refer & Earn",
    link: "/referral-portal",
  },
  {
    role: "Government / NGO (Sponsor)",
    icon: "earth",
    description:
      "Sponsor health coverage for low-income individuals via BBSCART. See your impact in dashboards.",
    action: "Become a Sponsor",
    link: "/csr-sponsorship",
  },
];

const testimonials = [
  {
    quote: "Thanks to BBSCART Care Pass, I got affordable tests done without hassle!",
    name: "Aarti, Mumbai",
    role: "User",
  },
  {
    quote: "Joining the BBSCART network helped grow our diagnostic business quickly.",
    name: "Dr. Patel",
    role: "Lab Partner",
  },
  {
    quote: "We've onboarded 100+ users via referrals. Great earnings!",
    name: "Rajesh",
    role: "Referral Agent",
  },
];

const StakeholdersPage = () => {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState(null);

  const handleShowModal = (item) => {
    setModalRole(item);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>👥 Stakeholders in the BBS Global Health Access Care Ecosystem</Text>
      <Text style={styles.subText}>
        These key contributors make affordable healthcare possible.
      </Text>

      {/* Stakeholder Cards */}
      <View style={styles.grid}>
        {stakeholders.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name={item.icon} size={28} color="#0d6efd" />
              <Text style={styles.cardTitle}>{item.role}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleShowModal(item)}
            >
              <Text style={styles.buttonText}>{item.action}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalRole?.role}</Text>
            <Text style={styles.modalText}>{modalRole?.description}</Text>
            <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ecosystem Flow */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ How the Ecosystem Works</Text>
        <Text style={styles.subText}>
          From sponsor to service, here’s how the flow connects:
        </Text>
        <Image
          source={{
            uri: "https://www.researchgate.net/profile/Roberto-Moro-Visconti/publication/341549427/figure/fig2/AS:893645062410241@1590072994517/The-Healthcare-Ecosystem.png",
          }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.smallText}>
          Diagram: Sponsor → User → Hospital → Lab/Pharmacy → Admin → Referral Agent
        </Text>
      </View>

      {/* Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 What Our Stakeholders Say</Text>
        {testimonials.map((t, idx) => (
          <View key={idx} style={styles.testimonial}>
            <Text style={styles.quote}>“{t.quote}”</Text>
            <Text style={styles.quoteFooter}>
              — {t.name}, {t.role}
            </Text>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Common Questions</Text>
        <Text style={styles.faqQ}>Q: How are stakeholders connected?</Text>
        <Text style={styles.faqA}>
          User purchases Care Pass → chooses service providers (Hospital, Lab,
          Pharmacy) → Admin verifies and coordinates → Agents refer others →
          Sponsors fund users if needed.
        </Text>
        <Text style={styles.faqQ}>Q: Can one party take multiple roles?</Text>
        <Text style={styles.faqA}>
          Yes. For example, a hospital may also operate a lab or pharmacy, or a
          sponsor may refer.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subText: { textAlign: "center", color: "#666", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { marginLeft: 8, fontWeight: "bold", fontSize: 14, flexShrink: 1 },
  cardDesc: { color: "#555", fontSize: 12, marginBottom: 8 },
  button: {
    backgroundColor: "#0d6efd",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  modalText: { fontSize: 14, color: "#555", marginBottom: 16 },
  section: { marginTop: 30 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, textAlign: "center" },
  image: { width: "100%", height: 200, marginVertical: 10 },
  smallText: { fontSize: 12, color: "#777", textAlign: "center" },
  testimonial: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  quote: { fontStyle: "italic", fontSize: 14 },
  quoteFooter: { marginTop: 6, fontSize: 12, color: "#555" },
  faqQ: { fontWeight: "bold", marginTop: 10 },
  faqA: { color: "#555", fontSize: 13 },
});

export default StakeholdersPage;

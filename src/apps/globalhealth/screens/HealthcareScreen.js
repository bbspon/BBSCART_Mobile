import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const services = [
  {
    id: 1,
    title: "Doctor",
    description: "Consult with general and specialist doctors",
    img: "https://static.vecteezy.com/system/resources/previews/035/681/291/non_2x/ai-generated-female-doctor-isolated-on-transparent-background-free-png.png",
    trending: true,
  },
  {
    id: 2,
    title: "Nurse",
    description: "Home visits, monitoring, injections",
    img: "https://www.pngmart.com/files/23/Nurse-PNG-File.png",
    trending: false,
  },
  {
    id: 3,
    title: "Psychology",
    description: "Therapy and mental wellness",
    img: "https://png.pngtree.com/png-vector/20240723/ourmid/pngtree-patient-counseling-with-psychologist-png-image_12953856.png",
    trending: true,
  },
  {
    id: 4,
    title: "Physiotherapy",
    description: "Rehab, mobility, recovery therapy",
    img: "https://tse1.explicit.bing.net/th/id/OIP.O67JQcBStEEZj-e7FlqwGwHaGb?rs=1&pid=ImgDetMain&o=7&rm=3",
    trending: false,
  },
  {
    id: 5,
    title: "Home Care",
    description: "Chronic care and elderly support",
    img: "https://png.pngtree.com/png-clipart/20231020/original/pngtree-nursing-and-caregiver-png-image_13373249.png",
    trending: false,
  },
];

export default function HealthCarePage() {
  const insets = useSafeAreaInsets();

  const [showChat, setShowChat] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filterTrending, setFilterTrending] = useState(false);

  const filteredServices = filterTrending
    ? services.filter((s) => s.trending)
    : services;

  const handleSchedulerShow = (service) => {
    setSelectedService(service);
    setShowScheduler(true);
  };

  const handleConfirmBooking = () => {
    setShowScheduler(false);

    Alert.alert(
      "Appointment Confirmed",
      `${selectedService?.title} appointment booked successfully.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 24 + Math.max(12, insets.bottom) + 8,
      }}
    >
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFilterTrending(!filterTrending)}
        >
          <Text style={{ color: "#fff" }}>
            {filterTrending ? "Showing Trending" : "Show Trending Only"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Services */}
      <Text style={styles.heading}>Support at Your Doorstep</Text>

      {filteredServices.map((service) => (
        <View key={service.id} style={styles.card}>
          {service.trending && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Trending</Text>
            </View>
          )}

          <Image source={{ uri: service.img }} style={styles.cardImg} />

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardText}>{service.description}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleSchedulerShow(service)}
            >
              <Text style={styles.btnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Your One-Stop Health, Our Priority
        </Text>

        <Text style={styles.heroText}>
          Book doctors, nurses, therapists, or home care with ease.
        </Text>

        <View style={styles.heroBtns}>
          <TouchableOpacity
            style={styles.lightBtn}
            onPress={() => handleSchedulerShow(services[0])}
          >
            <Text style={styles.btnDarkText}>Book a Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lightBtn}
            onPress={() => handleSchedulerShow(services[1])}
          >
            <Text style={styles.btnDarkText}>Talk to Nurse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => Alert.alert("Emergency", "Emergency services routed!")}
          >
            <Text style={styles.btnText}>Emergency / SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => setShowChat(true)}
          >
            <Text style={styles.btnText}>Live Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Chat Modal */}
      <Modal visible={showChat} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Live Chat Support</Text>
            <Text>Hello! How can we assist you today?</Text>

            <TextInput
              style={styles.input}
              placeholder="Type your message..."
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowChat(false)}
            >
              <Text style={styles.btnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scheduler Modal */}
      <Modal visible={showScheduler} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Book Appointment: {selectedService?.title}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Select Date & Time"
            />

            <TextInput
              style={styles.input}
              placeholder="Patient Name"
            />

            <TouchableOpacity
              style={styles.successBtn}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.btnText}>Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lightBtn}
              onPress={() => setShowScheduler(false)}
            >
              <Text style={styles.btnDarkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  filterSection: {
    backgroundColor: "#000",
    padding: 12,
    alignItems: "center",
  },

  filterToggle: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
  },

  heading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },

  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    margin: 12,
    padding: 12,
    elevation: 3,
  },

  badge: {
    position: "absolute",
    backgroundColor: "#ffc107",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    top: 8,
    right: 8,
    zIndex: 1,
  },

  badgeText: { fontSize: 10, fontWeight: "bold" },

  cardImg: {
    width: "100%",
    height: 380,
    borderRadius: 8,
    marginBottom: 12,
  },

  cardTitle: { fontSize: 16, fontWeight: "bold" },

  cardText: { fontSize: 13, color: "#555", marginVertical: 8 },

  primaryBtn: {
    backgroundColor: "#0d6efd",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },

  successBtn: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },

  infoBtn: {
    backgroundColor: "#0dcaf0",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    margin: 4,
  },

  dangerBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    margin: 4,
  },

  lightBtn: {
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    margin: 4,
  },

  btnText: { color: "#fff", fontWeight: "600" },

  btnDarkText: { color: "#000", fontWeight: "600" },

  hero: {
    backgroundColor: "#0dcaf0",
    padding: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    marginVertical: 20,
  },

  heroTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

  heroText: { color: "#fff", marginVertical: 8 },

  heroBtns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
  },
});
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';

// Dummy hospital data
const hospitalsData = [
  {
    id: 1,
    name: "BBS Global Multispecialty Hospital",
    registrationNumber: "REG-001234",
    type: "Multispecialty",
    address: "123, MG Road, Bangalore, Karnataka, 560001",
    country: "India",
    state: "Karnataka",
    city: "Bangalore",
    pincode: "560001",
    phone: "+91 9876543210",
    emergencyNumber: "+91 9999999999",
    email: "contact@bbshospital.com",
    website: "https://bbsglobalhospital.com",
    departments: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"],
    bedCapacity: { general: 150, icu: 30, ventilator: 10 },
    accreditation: ["NABH", "JCI"],
    facilities: ["24/7 Emergency", "Blood Bank", "Pharmacy", "Telemedicine"],
    pricePackages: [
      { name: "General Consultation", price: 500 },
      { name: "Cardiology Checkup", price: 2000 },
    ],
    rating: 4.5,
    reviewsCount: 124,
    description:
      "BBS Global Multispecialty Hospital offers world-class healthcare services with advanced facilities and highly qualified doctors.",
  },
  {
    id: 2,
    name: "City Care Specialty Clinic",
    registrationNumber: "REG-005678",
    type: "Specialty",
    address: "456, Park Street, Kolkata, West Bengal, 700016",
    country: "India",
    state: "West Bengal",
    city: "Kolkata",
    pincode: "700016",
    phone: "+91 1234567890",
    emergencyNumber: "+91 8888888888",
    email: "info@citycareclinic.com",
    website: "https://citycareclinic.com",
    departments: ["Dermatology", "ENT", "Orthopedics"],
    bedCapacity: { general: 50, icu: 5, ventilator: 2 },
    accreditation: ["ISO 9001"],
    facilities: ["Outpatient", "Diagnostics", "Pharmacy"],
    pricePackages: [
      { name: "Dermatology Consultation", price: 700 },
      { name: "ENT Checkup", price: 600 },
    ],
    rating: 4.1,
    reviewsCount: 78,
    description:
      "City Care Specialty Clinic provides specialized treatment with compassionate care in a comfortable environment.",
  },
];

const PartnerHospitals = () => {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const navigation = useNavigation();

  // Filter and search logic
  const filteredHospitals = useMemo(() => {
    return hospitalsData.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType ? h.type === filterType : true;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  const renderHospitalCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.text}>Type: {item.type}</Text>
      <Text style={styles.text}>
        Location: {item.city}, {item.state}
      </Text>
      <Text style={styles.text}>
        Rating: {item.rating} ⭐ ({item.reviewsCount} reviews)
      </Text>
      <Text style={styles.text}>
        {item.description.substring(0, 100)}...
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelectedHospital(item)}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Partner Hospitals</Text>

      {/* Search */}
      <TextInput
        style={styles.input}
        placeholder="Search by hospital name, city or state"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Filter (simple text input for now, you can replace with Picker) */}
      <TextInput
        style={styles.input}
        placeholder="Filter by type (e.g. Multispecialty, Specialty)"
        value={filterType}
        onChangeText={setFilterType}
      />

      {/* List of hospitals */}
      {filteredHospitals.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No hospitals found matching criteria.
        </Text>
      ) : (
        <FlatList
          data={filteredHospitals}
          renderItem={renderHospitalCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 + Math.max(12, insets.bottom) + 8 }}
        />
      )}

      {/* Hospital Detail Modal */}
      <Modal
        visible={!!selectedHospital}
        animationType="slide"
        onRequestClose={() => setSelectedHospital(null)}
      >
        <ScrollView style={styles.modalContent}>
          {selectedHospital && (
            <>
              <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
              <Text>Registration Number: {selectedHospital.registrationNumber}</Text>
              <Text>Type: {selectedHospital.type}</Text>
              <Text>Address: {selectedHospital.address}</Text>
              <Text>Phone: {selectedHospital.phone}</Text>
              <Text>Emergency: {selectedHospital.emergencyNumber}</Text>
              <Text>Email: {selectedHospital.email}</Text>
              <Text>Website: {selectedHospital.website}</Text>

              <Text style={styles.subTitle}>Departments:</Text>
              <Text>{selectedHospital.departments.join(", ")}</Text>

              <Text style={styles.subTitle}>Facilities:</Text>
              <Text>{selectedHospital.facilities.join(", ")}</Text>

              <Text style={styles.subTitle}>Bed Capacity:</Text>
              <Text>General: {selectedHospital.bedCapacity.general}</Text>
              <Text>ICU: {selectedHospital.bedCapacity.icu}</Text>
              <Text>Ventilator: {selectedHospital.bedCapacity.ventilator}</Text>

              <Text style={styles.subTitle}>Price Packages:</Text>
              {selectedHospital.pricePackages.map((pkg, idx) => (
                <Text key={idx}>
                  {pkg.name}: ₹{pkg.price}
                </Text>
              ))}

              <Text style={styles.subTitle}>Accreditations:</Text>
              <Text>{selectedHospital.accreditation.join(", ")}</Text>

              <Text style={styles.subTitle}>Description:</Text>
              <Text>{selectedHospital.description}</Text>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() =>
                  navigation.navigate("Booking", {
                    hospital: selectedHospital, // optional: pass hospital data
                  })
                }
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setSelectedHospital(null)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
};

export default PartnerHospitals;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  text: { fontSize: 14, marginBottom: 4 },
  button: {
    backgroundColor: "#0d6efd",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContent: { padding: 16, backgroundColor: "#fff" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subTitle: { marginTop: 12, fontWeight: "bold" },
  bookButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  bookButtonText: { color: "#fff", fontWeight: "bold" },
});

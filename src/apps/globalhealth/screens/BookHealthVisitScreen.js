import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

const genders = ["Male", "Female", "Other"];
const visitTypes = ["Home Visit", "Clinic Visit", "Teleconsultation"];
const urgencyLevels = ["Normal", "Urgent", "Emergency"];

const BookHealthVisit = () => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactNumber: "",
    visitDate: "",
    visitTime: "",
    visitType: "Home Visit",
    urgencyLevel: "Normal",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [bookingReference, setBookingReference] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
    if (!formData.gender) tempErrors.gender = "Select gender";
    if (!formData.contactNumber.match(/^\d{10}$/))
      tempErrors.contactNumber = "Enter valid 10-digit phone number";
    if (!formData.visitDate) tempErrors.visitDate = "Select date";
    if (!formData.visitTime) tempErrors.visitTime = "Select time";
    if (!formData.agreeTerms) tempErrors.agreeTerms = "Must agree terms";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const generateBookingReference = () =>
    `BSS-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = () => {
    if (!validateForm()) return;

    const bookingRef = generateBookingReference();
    setBookingReference(bookingRef);

    // Reset form after successful booking
    setFormData({
      fullName: "",
      dob: "",
      gender: "",
      contactNumber: "",
      visitDate: "",
      visitTime: "",
      visitType: "Home Visit",
      urgencyLevel: "Normal",
      agreeTerms: false,
    });

    Alert.alert("Booking Confirmed", `Ref: ${bookingRef}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.title}>Book a Health Visit</Text>

      {/* Full Name */}
      <TextInput
        style={[styles.input, errors.fullName && styles.errorInput]}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(val) => handleChange("fullName", val)}
      />
      {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={formData.gender}
        onValueChange={(val) => handleChange("gender", val)}
      >
        <Picker.Item label="Select" value="" />
        {genders.map((g) => (
          <Picker.Item key={g} label={g} value={g} />
        ))}
      </Picker>
      {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

      {/* Contact Number */}
      <TextInput
        style={[styles.input, errors.contactNumber && styles.errorInput]}
        placeholder="10-digit phone number"
        keyboardType="numeric"
        value={formData.contactNumber}
        onChangeText={(val) => handleChange("contactNumber", val)}
      />
      {errors.contactNumber && (
        <Text style={styles.error}>{errors.contactNumber}</Text>
      )}

      {/* Visit Date */}
      <TextInput
        style={[styles.input, errors.visitDate && styles.errorInput]}
        placeholder="Visit Date (YYYY-MM-DD)"
        value={formData.visitDate}
        onChangeText={(val) => handleChange("visitDate", val)}
      />
      {errors.visitDate && <Text style={styles.error}>{errors.visitDate}</Text>}

      {/* Visit Time */}
      <TextInput
        style={[styles.input, errors.visitTime && styles.errorInput]}
        placeholder="Visit Time (HH:MM)"
        value={formData.visitTime}
        onChangeText={(val) => handleChange("visitTime", val)}
      />
      {errors.visitTime && <Text style={styles.error}>{errors.visitTime}</Text>}

      {/* Visit Type */}
      <Text style={styles.label}>Visit Type</Text>
      <Picker
        selectedValue={formData.visitType}
        onValueChange={(val) => handleChange("visitType", val)}
      >
        {visitTypes.map((v) => (
          <Picker.Item key={v} label={v} value={v} />
        ))}
      </Picker>

      {/* Urgency */}
      <Text style={styles.label}>Urgency</Text>
      <Picker
        selectedValue={formData.urgencyLevel}
        onValueChange={(val) => handleChange("urgencyLevel", val)}
      >
        {urgencyLevels.map((u) => (
          <Picker.Item key={u} label={u} value={u} />
        ))}
      </Picker>

      {/* Terms */}
      <View style={styles.switchRow}>
        <Switch
          value={formData.agreeTerms}
          onValueChange={(val) => handleChange("agreeTerms", val)}
        />
        <Text>I agree to the terms</Text>
      </View>
      {errors.agreeTerms && <Text style={styles.error}>{errors.agreeTerms}</Text>}

      {/* Submit */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Book Visit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookHealthVisit;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  label: { marginTop: 12, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  errorInput: { borderColor: "red" },
  error: { color: "red", fontSize: 12, marginTop: 4 },
  switchRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  button: {
    backgroundColor: "#0d6efd",
    padding: 15,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});

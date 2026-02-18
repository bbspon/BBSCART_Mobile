import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

const specialists = [
  { id: 1, name: "Dr. Latha (Dermatologist)", specialty: "Skin", language: "English" },
  { id: 2, name: "Dr. Vikram (Cardiologist)", specialty: "Heart", language: "Hindi" },
  { id: 3, name: "Dr. Noor (Nutritionist)", specialty: "Diet", language: "Arabic" },
];

export default function DoctorReferralPage() {
  const insets = useSafeAreaInsets();
  const [referral, setReferral] = useState({
    doctors: [],
    reason: "",
    notes: "",
    file: null,
    priority: "Routine",
    language: "",
    consent: false,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const toggleDoctor = (doctorName) => {
    const updatedDoctors = referral.doctors.includes(doctorName)
      ? referral.doctors.filter((doc) => doc !== doctorName)
      : [...referral.doctors, doctorName];

    setReferral({ ...referral, doctors: updatedDoctors });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowConfirm(false);
  };

  const handleWhatsAppSend = () => {
    setWhatsappSent(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <View style={styles.card}>
        <Text style={styles.title}>📤 Issue Patient Referral</Text>

        {/* Specialists */}
        <Text style={styles.label}>Select Specialist(s)</Text>
        {specialists.map((doc) => (
          <View key={doc.id} style={styles.checkboxContainer}>
            <Switch
              value={referral.doctors.includes(doc.name)}
              onValueChange={() => toggleDoctor(doc.name)}
            />
            <Text style={styles.checkboxLabel}>
              {doc.name} ({doc.specialty}) - {doc.language}
            </Text>
          </View>
        ))}

        {/* Priority & Language */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={referral.priority}
              onValueChange={(value) =>
                setReferral({ ...referral, priority: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Routine" value="Routine" />
              <Picker.Item label="Urgent" value="Urgent" />
              <Picker.Item label="Critical" value="Critical" />
            </Picker>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Preferred Language</Text>
            <Picker
              selectedValue={referral.language}
              onValueChange={(value) =>
                setReferral({ ...referral, language: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Any" value="" />
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Hindi" value="Hindi" />
              <Picker.Item label="Arabic" value="Arabic" />
            </Picker>
          </View>
        </View>

        {/* Reason */}
        <Text style={styles.label}>Reason for Referral</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Follow-up Cardiology Evaluation"
          value={referral.reason}
          onChangeText={(text) =>
            setReferral({ ...referral, reason: text })
          }
        />

        {/* Notes */}
        <Text style={styles.label}>Clinical Notes</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Write any history, symptoms, prior test..."
          value={referral.notes}
          onChangeText={(text) =>
            setReferral({ ...referral, notes: text })
          }
          multiline
        />

        {/* Consent */}
        <View style={styles.checkboxContainer}>
          <Switch
            value={referral.consent}
            onValueChange={(value) =>
              setReferral({ ...referral, consent: value })
            }
          />
          <Text style={styles.checkboxLabel}>
            I have obtained patient consent for this referral
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                referral.consent && referral.doctors.length
                  ? "#28a745"
                  : "#ccc",
            },
          ]}
          disabled={!referral.consent || referral.doctors.length === 0}
          onPress={() => setShowConfirm(true)}
        >
          <Text style={styles.buttonText}>Send Referral</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Referral</Text>
            <Text>Specialists: {referral.doctors.join(", ")}</Text>
            <Text>Reason: {referral.reason}</Text>
            <Text>Priority: {referral.priority}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6c757d" }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#28a745" }]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Confirm & Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success */}
      {submitted && (
        <View style={[styles.card, { backgroundColor: "#d4edda", marginTop: 15 }]}>
          <Text>✅ Referral Sent to: {referral.doctors.join(", ")}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#155724" }]}
            onPress={handleWhatsAppSend}
          >
            <Text style={styles.buttonText}>📲 Send via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}

      {whatsappSent && (
        <View style={[styles.card, { backgroundColor: "#cce5ff", marginTop: 10 }]}>
          <Text>✅ WhatsApp summary sent (simulated)</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f2f2f2" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  checkboxLabel: { marginLeft: 10 },
  row: { flexDirection: "row" },
  col: { flex: 1, marginRight: 10 },
  picker: { height: 75 },
  button: { padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});

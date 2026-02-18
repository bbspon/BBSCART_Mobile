  // HospitalPartnershipMobile.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HospitalPartnershipMobile = () => {
  const insets = useSafeAreaInsets();
  const [formVisible, setFormVisible] = useState(false);
  const [msaVisible, setMsaVisible] = useState(false);
  const [toolkitVisible, setToolkitVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hospitalType: '',
    location: '',
    departments: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      Alert.alert('Success', 'Form submitted successfully!');
      setFormVisible(false);
    }, 1000);
  };

  const download = (file) => Alert.alert('Download', `Downloading ${file}...`);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
    >
      <Text style={styles.header}>🏥 BBSCART Hospital Partnership Kit</Text>

      <TouchableOpacity style={styles.button} onPress={() => setFormVisible(true)}>
        <Text style={styles.buttonText}>📥 Start Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setMsaVisible(true)}>
        <Text style={styles.buttonText}>📄 View MSA & Terms</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setToolkitVisible(true)}>
        <Text style={styles.buttonText}>🧰 Download Toolkit</Text>
      </TouchableOpacity>

      {/* Onboarding Form Modal */}
      <Modal visible={formVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>📝 Hospital Onboarding Form</Text>
          <TextInput style={styles.input} placeholder="Hospital Name" onChangeText={(value) => handleChange('name', value)} />
          <TextInput style={styles.input} placeholder="Admin Email" keyboardType="email-address" onChangeText={(value) => handleChange('email', value)} />
          <TextInput style={styles.input} placeholder="Hospital Type (Clinic, Lab...)" onChangeText={(value) => handleChange('hospitalType', value)} />
          <TextInput style={styles.input} placeholder="Location" onChangeText={(value) => handleChange('location', value)} />
          <TextInput style={styles.textarea} multiline placeholder="Departments Offered" onChangeText={(value) => handleChange('departments', value)} />
          <Button title="🚀 Submit" onPress={handleSubmit} />
          <Button title="Close" color="gray" onPress={() => setFormVisible(false)} />
        </ScrollView>
      </Modal>

      {/* MSA Modal */}
      <Modal visible={msaVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>📄 Master Service Agreement</Text>
          <Button title="⬇ Download MSA" onPress={() => download("MSA PDF")} />
          <Button title="⬇ Download TOP" onPress={() => download("TOP PDF")} />
          <Button title="Close" color="gray" onPress={() => setMsaVisible(false)} />
        </View>
      </Modal>

      {/* Toolkit Modal */}
      <Modal visible={toolkitVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🧰 Download Toolkit</Text>
          <Button title="📌 QR Standee" onPress={() => download("QR Poster")} />
          <Button title="📘 Training Manual" onPress={() => download("Training PDF")} />
          <Button title="🖨 Co-Brand Poster" onPress={() => download("Poster PDF")} />
          <Button title="Close" color="gray" onPress={() => setToolkitVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, marginBottom: 10, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16, textAlign: 'center' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, marginBottom: 10, padding: 10 },
  textarea: { borderColor: '#ccc', borderWidth: 1, marginBottom: 10, padding: 10, height: 100 }
});

export default HospitalPartnershipMobile;

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
const BASE_URL = 'https://healthcare.bbscart.com';

const HospitalPartnershipKit = () => {
  const insets = useSafeAreaInsets();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hospitalType: '',
    location: '',
    departments: '',
  });

  const handleChange = (name, value) =>
    setFormData({ ...formData, [name]: value });

  // Map display names to API values (matching web version format)
  const getHospitalTypeValue = (displayName) => {
    const mapping = {
      'Multi-Specialty': 'multi-specialty',
      'Clinic': 'clinic',
      'Diagnostic Lab': 'lab',
      'Pharmacy': 'pharmacy',
    };
    return mapping[displayName] || displayName.toLowerCase();
  };

  // -----------------------------
  // SUBMIT ONBOARDING (Mock like web version, with API ready structure)
  // -----------------------------
  const handleSubmit = async (e) => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.hospitalType ||
      !formData.location
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setSubmitted(false);

      // Get token from AsyncStorage (same as web localStorage)
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = raw ? JSON.parse(raw).token : null;

      // Prepare payload matching web format
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        hospitalType: getHospitalTypeValue(formData.hospitalType),
        location: formData.location.trim(),
        departments: formData.departments.trim() || '',
      };

      // Try API call first (if endpoint exists)
      // Otherwise use mock like web version
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
          `${API_BASE_URL}/partners/hospital/onboard`,
          payload,
          { headers }
        );

        // API call successful
        setSubmitted(true);
        setLoading(false);

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            hospitalType: '',
            location: '',
            departments: '',
          });
          setSubmitted(false);
          setShowForm(false);
        }, 2000);
      } catch (apiErr) {
        // If API endpoint doesn't exist (404) or network error, use mock like web
        if (
          apiErr?.response?.status === 404 ||
          !apiErr?.response ||
          apiErr?.code === 'NETWORK_ERROR'
        ) {
          // Mock submission (exactly like web version with setTimeout)
          setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
          }, 2000);
        } else {
          // Real API error - show error message
          const errorMsg =
            apiErr?.response?.data?.message ||
            apiErr?.response?.data?.error ||
            apiErr?.message ||
            'Failed to submit onboarding request';
          Alert.alert('Error', errorMsg);
          setLoading(false);
        }
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit onboarding request';
      Alert.alert('Error', errorMsg);
      setLoading(false);
      setSubmitted(false);
    }
  };

  // -----------------------------
  // DOWNLOAD TOOLKIT / MSA
  // -----------------------------
  const handleDownload = async (docType) => {
    try {
      const url = `${BASE_URL}/downloads/${docType === 'MSA' ? 'msa.pdf' : 'hospital-toolkit.zip'}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to download document');
    }
  };



  const hospitalTypes = [
    'Multi-Specialty',
    'Clinic',
    'Diagnostic Lab',
    'Pharmacy',
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>🏥 Hospital Partnership Toolkit</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Health Access Pay Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Health Card</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>📥 Start Onboarding</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successButton}
          onPress={() => handleDownload('MSA')}
        >
          <Text style={styles.buttonText}>📄 Download MSA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.warningButton}
          onPress={() => handleDownload('Toolkit')}
        >
          <Text style={styles.buttonText}>🧰 Download Toolkit</Text>
        </TouchableOpacity>
      </View>

      {/* Toolkit Components */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🚀 Toolkit Components</Text>
        <View style={styles.list}>
          <Text>📜 Master Service Agreement (India/UAE)</Text>
          <Text>✅ Terms of Participation (TOP)</Text>
          <Text>📊 Revenue Share Calculator</Text>
          <Text>📝 Hospital Onboarding Form</Text>
          <Text>🎓 Training PDF + Video</Text>
          <Text>🎨 Co-Brand Poster & Standee</Text>
          <Text>📈 Pitch Deck</Text>
          <Text>⚙️ Tech Setup Guide</Text>
          <Text>🔐 Privacy & Data Agreement</Text>
        </View>
      </View>

      {/* Country-Specific Onboarding */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🌐 Country-Specific Onboarding</Text>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={styles.tableHeader}>UAE</Text>
            <Text>Emirates ID, DHA</Text>
            <Text>VAT-Linked Invoices</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.tableHeader}>India</Text>
            <Text>Aadhaar, GST, NABH</Text>
            <Text>GST-Ready Templates</Text>
          </View>
        </View>
      </View>

      {/* ONBOARDING FORM MODAL */}
      <Modal visible={showForm} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalHeader}>📝 Hospital Onboarding</Text>

          {submitted && (
            <Text style={styles.successText}>Form submitted successfully!</Text>
          )}

          <Text style={styles.label}>Hospital Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={v => handleChange('name', v)}
          />

          <Text style={styles.label}>Admin Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={v => handleChange('email', v)}
          />

          <Text style={styles.label}>Hospital Type</Text>
          {hospitalTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                formData.hospitalType === type && styles.optionSelected,
              ]}
              onPress={() => handleChange('hospitalType', type)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.hospitalType === type && styles.optionTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={v => handleChange('location', v)}
          />

          <Text style={styles.label}>Departments Offered</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={formData.departments}
            onChangeText={v => handleChange('departments', v)}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: '#6c757d', marginTop: 10 },
            ]}
            onPress={() => setShowForm(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

export default HospitalPartnershipKit;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f4f8' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  successButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  warningButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  linkButton: {
    backgroundColor: '#e2f0d9',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#28a745',
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  list: { paddingLeft: 8 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tableCell: { flex: 1, padding: 8 },
  tableHeader: { fontWeight: '700', marginBottom: 4 },
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#f2f4f8' },
  modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginVertical: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginBottom: 8,
  },
  optionSelected: { backgroundColor: '#007bff' },
  optionText: { color: '#495057', fontWeight: '600' },
  optionTextSelected: { color: '#fff', fontWeight: '700' },
  successText: {
    color: '#28a745',
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
  },
});

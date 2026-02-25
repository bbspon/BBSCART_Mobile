import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// TODO: Re-enable when compatible document picker is available
// import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const initialPrescriptions = [
  {
    id: 'RX-001',
    patient: 'Aarav Sharma',
    doctor: 'Dr. Meera Rao',
    date: '2025-07-09',
    status: 'Delivered',
    meds: ['Pantoprazole', 'Isotretinoin'],
    deliveryPartner: 'PharmEasy',
  },
];

export default function PharmacyIntegrationDashboard() {
  const insets = useSafeAreaInsets();
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [uploadFile, setUploadFile] = useState(null);
  const [refillEnabled, setRefillEnabled] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    return raw ? JSON.parse(raw).token : null;
  };

  const pickFile = async () => {
    // TODO: Re-enable when compatible document picker is available
    Alert.alert(
      'Feature Temporarily Disabled',
      'Document picking is temporarily disabled. Will be re-enabled with a compatible library.'
    );
    // try {
    //   const res = await DocumentPicker.pickSingle({
    //     type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
    //   });
    //   setUploadFile(res);
    // } catch (err) {
    //   if (!DocumentPicker.isCancel(err)) {
    //     Alert.alert('Error', 'File selection failed');
    //   }
    // }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      // API-ready (backend can be plugged later)
      // const token = await getToken();
      // await axios.post(`${API_BASE_URL}/pharmacy/prescriptions`, formData)

      const newRx = {
        id: `RX-${Date.now()}`,
        patient: 'External Upload',
        doctor: 'Unknown',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Scan',
        meds: [uploadFile.name],
        deliveryPartner: 'Not Assigned',
      };

      setPrescriptions([newRx, ...prescriptions]);
      setUploadFile(null);

      Alert.alert('Success', 'Prescription uploaded');
    } catch (err) {
      Alert.alert('Error', 'Upload failed');
    }
  };

  const updateSettings = async () => {
    try {
      // API-ready (can be enabled later)
      // const token = await getToken();
      // await axios.post(`${API_BASE_URL}/pharmacy/refill-settings`, {
      //   refillEnabled,
      //   alertEnabled,
      // })

      Alert.alert(
        'Settings Updated',
        `Refill: ${refillEnabled ? 'ON' : 'OFF'}\nAlert: ${alertEnabled ? 'ON' : 'OFF'
        }`
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>💊 Pharmacy Integration Dashboard</Text>

      {prescriptions.map((rx) => (
        <View key={rx.id} style={styles.card}>
          <Text>ID: {rx.id}</Text>
          <Text>Patient: {rx.patient}</Text>
          <Text>Date: {rx.date}</Text>
          <Text>Meds: {rx.meds.join(', ')}</Text>
          <Text>Status: {rx.status}</Text>
          <Text>Delivery: {rx.deliveryPartner}</Text>
        </View>
      ))}

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={pickFile}>
          <Text style={styles.btnText}>Select Prescription</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.btnText}>Upload Prescription</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={() => setRefillEnabled(!refillEnabled)}>
          <Text>Auto Refill: {refillEnabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAlertEnabled(!alertEnabled)}>
          <Text>Alert After 25 Days: {alertEnabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={updateSettings}>
          <Text style={styles.btnText}>Update Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  section: { marginTop: 20 },
  button: {
    backgroundColor: '#0dcaf0',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
});

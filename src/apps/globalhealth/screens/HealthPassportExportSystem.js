import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Switch,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function HealthPassportExportSystem() {
  const insets = useSafeAreaInsets();
  const [passport, setPassport] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);

  const [filters, setFilters] = useState({
    history: 'all',
    includeSensitive: true,
    country: 'uae',
  });

  /* ===== LOAD PASSPORT ===== */
  useEffect(() => {
    const loadPassport = async () => {
      try {
        const raw = await AsyncStorage.getItem('bbsUser');
        const parsed = raw ? JSON.parse(raw) : null;
        const userId = parsed?.user?.id;

        if (!userId) {
          Alert.alert('Error', 'User not found');
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/health-passport/${userId}`,
        );

        setPassport(res.data);
        setDocuments(res.data.documents || []);

        // Use backend-provided QR only
        setQrUrl(res.data.qrValue || res.data.qrUrl || null);

        setQrLoading(false);
      } catch (err) {
        console.error('❌ Failed to load passport', err);
        Alert.alert('Error', 'Failed to load health passport');
        setQrLoading(false);
      }
    };

    loadPassport();
  }, []);

  /* ===== EXPORT HANDLER ===== */
  const handleExport = async type => {
    try {
      const endpointMap = {
        PDF: 'pdf',
        FHIR: 'fhir',
        ZIP: 'zip',
        Link: 'secure-link',
      };

      const res = await axios.post(
        `${API_BASE_URL}/health-passport/export/${endpointMap[type]}`,
      );

      Alert.alert(
        'Success',
        res.data.message || res.data.link || 'Export completed',
      );
    } catch (err) {
      console.error('❌ Export failed', err);
      Alert.alert('Error', 'Export failed');
    }
  };

  if (!passport) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text>Loading your health passport...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>🌍 BBSCART Health Passport</Text>

      {/* ===== QR ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>Digital Health Access Card</Text>

        <View style={styles.qrBox}>
          {qrLoading ? (
            <ActivityIndicator size="large" color="#0d6efd" />
          ) : qrUrl ? (
            <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          ) : (
            <Text>QR not available</Text>
          )}
        </View>

        <Text style={styles.infoText}>
          <Text style={styles.label}>ID: </Text>
          {passport.planId}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Name: </Text>
          {passport.name}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Plan: </Text>
          {passport.planName || 'Health Passport'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Valid Until: </Text>
          {passport.endDate ? new Date(passport.endDate).toDateString() : 'N/A'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Txn ID: </Text>
          {passport.transactionId || 'N/A'}
        </Text>
      </View>

      {/* ===== SUMMARY ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>Passport Summary</Text>
        <Text>Conditions: {passport.conditions?.join(', ')}</Text>
        <Text>Medications: {passport.medications?.join(', ')}</Text>
        <Text>Allergies: {passport.allergies?.join(', ')}</Text>
        <Text>
          Last Visit:{' '}
          {passport.lastVisit
            ? new Date(passport.lastVisit).toLocaleDateString()
            : 'N/A'}
        </Text>
      </View>

      {/* ===== FILTERS (UI ONLY) ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>Export Filters</Text>

        <Picker
          selectedValue={filters.history}
          onValueChange={v => setFilters({ ...filters, history: v })}
        >
          <Picker.Item label="Full History" value="all" />
          <Picker.Item label="OPD Only" value="opd" />
          <Picker.Item label="Emergency Only" value="emergency" />
        </Picker>

        <View style={styles.switchRow}>
          <Text>Hide Sensitive Info</Text>
          <Switch
            value={!filters.includeSensitive}
            onValueChange={v =>
              setFilters({ ...filters, includeSensitive: !v })
            }
          />
        </View>

        <Picker
          selectedValue={filters.country}
          onValueChange={v => setFilters({ ...filters, country: v })}
        >
          <Picker.Item label="🇦🇪 UAE" value="uae" />
          <Picker.Item label="🇨🇦 Canada" value="canada" />
          <Picker.Item label="🇮🇳 India" value="india" />
          <Picker.Item label="🇺🇸 USA" value="usa" />
          <Picker.Item label="🇫🇷 France" value="france" />
        </Picker>
      </View>

      {/* ===== EXPORT ===== */}
      <View style={styles.card}>
        {['PDF', 'FHIR', 'ZIP', 'Link'].map(t => (
          <TouchableOpacity
            key={t}
            style={styles.button}
            onPress={() => handleExport(t)}
          >
            <Text style={styles.buttonText}>Export {t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== DOCUMENTS ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>Medical Documents</Text>
        {documents.length === 0 && <Text>No documents uploaded</Text>}
        {documents.map(doc => (
          <TouchableOpacity
            key={doc._id || doc.name}
            onPress={() => Linking.openURL(doc.url)}
          >
            <Text style={styles.link}>
              📄 {doc.name} ({doc.type})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== AI SUMMARY ===== */}
      <TouchableOpacity
        style={[styles.button, { marginBottom: 40 }]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>🧠 View AI Summary</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.header}>🧠 One-Page Health Summary</Text>

          <Text>Conditions: {passport.conditions?.join(', ')}</Text>
          <Text>Medications: {passport.medications?.join(', ')}</Text>
          <Text>Allergies: {passport.allergies?.join(', ')}</Text>

          <Text style={{ marginTop: 10 }}>
            Sensitive Info:{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {filters.includeSensitive ? 'Included' : 'Filtered'}
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

/* ===== STYLES UNCHANGED ===== */

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  qrBox: { alignItems: 'center', marginVertical: 12 },
  qrImage: { width: 200, height: 200 },
  button: {
    backgroundColor: '#0d6efd',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: { color: '#0d6efd', marginVertical: 4 },
  modal: { padding: 20 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  infoText: { fontSize: 15, marginVertical: 2 },
  label: { fontWeight: 'bold' },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const InteropGovHealthSystem = () => {
  const insets = useSafeAreaInsets();
  const [consentGiven, setConsentGiven] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPlanStack, setShowPlanStack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [language, setLanguage] = useState('en');
  const [disasterZone, setDisasterZone] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);

  /* ===== LOAD SYNC HISTORY ===== */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/interop-gov`)
      .then(res => {
        const logs = (res.data?.data || []).map(
          e => `${e.message} at ${new Date(e.timestamp).toLocaleString()}`,
        );
        setSyncHistory(logs);
      })
      .catch(err => {
        console.error('❌ Failed to load sync history', err);
      });
  }, []);

  /* ===== LOG SYNC ACTION ===== */
  const logSync = async (type, message) => {
    try {
      await axios.post(`${API_BASE_URL}/interop-gov`, {
        actionType: type,
        message,
        country: 'India',
        complianceLevel: 'Full',
      });

      setSyncHistory(prev => [
        `${message} at ${new Date().toLocaleString()}`,
        ...prev,
      ]);
    } catch (err) {
      console.error('❌ Failed to log sync', err);
    }
  };

  /* ===== SIMULATED ELIGIBILITY ===== */
  const checkEligibility = async () => {
    setEligibilityResult({
      eligibleFor: 'ESI + Ayushman Bharat',
      suggestions: ['Link ABHA ID', 'Enable DigiLocker Sync'],
    });

    setAiSuggestion('Your ESI does not cover OPD. Consider BBSCART Premium+.');

    await logSync('eligibility', 'Eligibility checked');
  };

  /* ===== CONSENT TOGGLE ===== */
  const toggleConsent = async () => {
    const action = !consentGiven ? 'Granted' : 'Revoked';
    setConsentGiven(!consentGiven);
    await logSync('consent', `${action} consent`);
  };

  /* ===== DISASTER SIMULATION ===== */
  const simulateDisasterZone = async () => {
    setDisasterZone(true);
    await logSync('disaster', 'Disaster alert simulated');
    Alert.alert('Disaster Mode', 'Emergency sync triggered for authorities');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>🌍 Government Health Interoperability</Text>
      <Text style={styles.subtitle}>
        Securely link BBSCART with PM-JAY, ESI, DHA and more.
      </Text>

      <TouchableOpacity
        style={[styles.button, isOffline && styles.danger]}
        onPress={() => setIsOffline(!isOffline)}
      >
        <Text style={styles.buttonText}>
          {isOffline ? 'Offline Mode ON' : 'Go Offline'}
        </Text>
      </TouchableOpacity>

      {/* Eligibility */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Smart Eligibility Checker</Text>
        <TouchableOpacity style={styles.button} onPress={checkEligibility}>
          <Text style={styles.buttonText}>Check My Eligibility</Text>
        </TouchableOpacity>

        {eligibilityResult && (
          <View style={styles.alertSuccess}>
            <Text style={styles.bold}>
              Eligible For: {eligibilityResult.eligibleFor}
            </Text>
            {eligibilityResult.suggestions.map((s, i) => (
              <Text key={i}>• {s}</Text>
            ))}
          </View>
        )}

        {aiSuggestion && (
          <View style={styles.alertInfo}>
            <Text>🤖 {aiSuggestion}</Text>
          </View>
        )}
      </View>

      {/* Consent */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔐 Consent Manager</Text>
        <TouchableOpacity
          style={[styles.button, consentGiven && styles.danger]}
          onPress={toggleConsent}
        >
          <Text style={styles.buttonText}>
            {consentGiven ? 'Revoke Consent' : 'Grant Consent'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowConsentModal(true)}>
          <Text style={styles.link}>View Sync History</Text>
        </TouchableOpacity>
      </View>

      {/* Scheme Linking */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗺️ Government Scheme Linking</Text>
        <Text>Ayushman Bharat – ✅ Linked</Text>
        <Text>ESI – ⚠️ Suggested</Text>
        <Text>DHA (Dubai) – ⏳ Pending</Text>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowPlanStack(true)}
        >
          <Text style={styles.buttonText}>View My Linked Plans</Text>
        </TouchableOpacity>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Language Preference</Text>
        <Picker selectedValue={language} onValueChange={setLanguage}>
          <Picker.Item label="English" value="en" />
          <Picker.Item label="हिंदी" value="hi" />
          <Picker.Item label="தமிழ்" value="ta" />
          <Picker.Item label="العربية" value="ar" />
        </Picker>
      </View>

      {/* Disaster */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Emergency / Disaster Zone</Text>
        <TouchableOpacity style={styles.danger} onPress={simulateDisasterZone}>
          <Text style={styles.buttonText}>Simulate Disaster Alert</Text>
        </TouchableOpacity>

        {disasterZone && (
          <View style={styles.alertDanger}>
            <Text>
              🚑 User in disaster-affected zone. Authorities notified.
            </Text>
          </View>
        )}
      </View>

      {/* Sync History Modal */}
      <Modal visible={showConsentModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.cardTitle}>My Sync History</Text>
          <ScrollView>
            {syncHistory.map((h, i) => (
              <Text key={i}>• {h}</Text>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowConsentModal(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Linked Plans Modal */}
      <Modal visible={showPlanStack} transparent animationType="slide">
        <View style={styles.modal}>
          <Text>🟢 Government Plan: Ayushman Bharat</Text>
          <Text>🟡 BBSCART Plan: Basic (OPD + Diagnostics)</Text>
          <Text>🔁 Suggestion: Upgrade to Premium+</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowPlanStack(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default InteropGovHealthSystem;

/* ===== STYLES UNCHANGED ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  infoButton: {
    backgroundColor: '#0dcaf0',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  danger: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  link: { color: '#0d6efd', marginTop: 10 },
  alertSuccess: {
    backgroundColor: '#d1e7dd',
    padding: 10,
    marginTop: 10,
  },
  alertInfo: {
    backgroundColor: '#cff4fc',
    padding: 10,
    marginTop: 10,
  },
  alertDanger: {
    backgroundColor: '#f8d7da',
    padding: 10,
    marginTop: 10,
  },
  modal: {
    backgroundColor: '#fff',
    margin: 30,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxHeight: '80%',
  },
  bold: { fontWeight: 'bold' },
});

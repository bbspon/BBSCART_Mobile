import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

// IMPORTANT
// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const CoverageStatus = () => {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState('');
  const [coverageResult, setCoverageResult] = useState(null);

  const [simPlan, setSimPlan] = useState('');
  const [simService, setSimService] = useState('');
  const [simResult, setSimResult] = useState(null);

  const plans = ['Basic', 'Premium', 'Super Premium'];

  // -------------------------
  // CHECK USER COVERAGE
  // -------------------------
  const checkUserCoverage = async () => {
    if (!userId) {
      Alert.alert('Validation', 'Please enter User ID');
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/coverage/check?userId=${userId}`,
      );
      setCoverageResult(res.data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch coverage data');
    }
  };

  // -------------------------
  // ADMIN SIMULATION
  // -------------------------
  const handleSimulate = async () => {
    if (!simPlan || !simService) {
      Alert.alert('Validation', 'Select plan and enter service');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/coverage/simulate`, {
        plan: simPlan,
        service: simService,
      });
      setSimResult(res.data);
    } catch (err) {
      Alert.alert('Error', 'Simulation failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.heading}>🧠 Real-Time Coverage Engine</Text>

      {/* User Coverage Check */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🚦 Check User Access</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Enter User ID / QR Code"
            value={userId}
            onChangeText={setUserId}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={checkUserCoverage}
          >
            <Text style={styles.buttonText}>Check</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Coverage Result */}
      {coverageResult && (
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📋 Coverage Status</Text>
          <Text style={styles.cardTitle}>
            {coverageResult.user}{' '}
            <Text style={styles.badge}>{coverageResult.plan}</Text>
          </Text>

          <Text style={styles.serviceText}>
            Service: {coverageResult.service}
          </Text>

          <View
            style={[
              styles.alert,
              coverageResult.status === 'Active'
                ? styles.alertSuccess
                : styles.alertWarning,
            ]}
          >
            <Text style={styles.alertText}>
              {coverageResult.status} — Co-pay: {coverageResult.copay}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>OPD Visits</Text>
              <Text style={styles.tableCell}>
                {coverageResult.visitsUsed}/{coverageResult.visitsAllowed}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Amount Left</Text>
              <Text style={styles.tableCell}>{coverageResult.amountLeft}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Next Eligible</Text>
              <Text style={styles.tableCell}>
                {coverageResult.nextEligibility}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Admin Simulation */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🛠 Admin Simulation</Text>

        <Text style={styles.label}>Select Plan</Text>
        <View style={styles.optionsRow}>
          {plans.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.optionButton,
                simPlan === p && styles.optionSelected,
              ]}
              onPress={() => setSimPlan(p)}
            >
              <Text
                style={[
                  styles.optionText,
                  simPlan === p && styles.optionTextSelected,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Service Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., X-Ray"
          value={simService}
          onChangeText={setSimService}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSimulate}>
          <Text style={styles.buttonText}>Run Simulation</Text>
        </TouchableOpacity>

        {simResult && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.subHeading}>🧪 Simulation Result</Text>
            <Text>Plan: {simResult.plan}</Text>
            <Text>Service: {simResult.service}</Text>

            <View
              style={[
                styles.alert,
                simResult.status === 'Approved'
                  ? styles.alertSuccess
                  : styles.alertInfo,
              ]}
            >
              <Text style={styles.alertText}>{simResult.status}</Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Visits Allowed</Text>
                <Text style={styles.tableCell}>{simResult.visitsAllowed}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Visits Used</Text>
                <Text style={styles.tableCell}>{simResult.visitsUsed}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Balance Left</Text>
                <Text style={styles.tableCell}>{simResult.amountLeft}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Co-pay</Text>
                <Text style={styles.tableCell}>{simResult.copay}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Upcoming */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>🔮 Upcoming Features</Text>
        <Text>• Bill scan upload for pre-check approval</Text>
        <Text>• User self-check coverage bot</Text>
        <Text>• Multi-hospital balance sharing</Text>
        <Text>• Smart plan upgrade suggestion</Text>
        <Text>• AI rule explanation for staff</Text>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0d6efd',
  },

  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },

  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },

  primaryButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  badge: {
    backgroundColor: '#198754',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },

  serviceText: {
    marginBottom: 8,
    color: '#495057',
  },

  alert: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },

  alertSuccess: {
    backgroundColor: '#d1e7dd',
  },

  alertWarning: {
    backgroundColor: '#fff3cd',
  },

  alertInfo: {
    backgroundColor: '#cff4fc',
  },

  alertText: {
    fontWeight: '600',
  },

  table: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#dee2e6',
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  tableCell: {
    fontSize: 14,
  },

  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0d6efd',
  },

  optionSelected: {
    backgroundColor: '#0d6efd',
  },

  optionText: {
    color: '#0d6efd',
    fontWeight: '600',
  },

  optionTextSelected: {
    color: '#fff',
  },
});

export default CoverageStatus;

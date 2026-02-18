import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SAME backend base URL used across mobile
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const CarePassScanner = ({ userRole = 'staff' }) => {
  const insets = useSafeAreaInsets();
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------
  // SIMULATE QR SCAN (API INTEGRATED)
  // ----------------------------------
  const handleSimulateScan = async () => {
    try {
      setLoading(true);

      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/carepass/simulate`,
        {
          userId: 'USER987654', // placeholder until real QR scanner
          scannedBy: 'DemoHospital',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Map backend response to existing UI fields (NO UI CHANGE)
      setScanResult({
        id: res.data.userId,
        name: res.data.userName || 'N/A',
        validity: res.data.expiry,
        access: res.data.plan,
        tier: res.data.tier,
        status: res.data.status,
      });

      if (userRole === 'admin') {
        Alert.alert('✅ Scan Successful', `User ID: ${res.data.userId}`);
      } else {
        Alert.alert(
          'Access Limited',
          'You scanned a Care Pass, but only admins can verify full details.',
        );
      }
    } catch (err) {
      console.error('❌ CarePass scan failed', err?.response?.data || err);
      Alert.alert('Scan Failed', 'Unable to scan Care Pass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
      <Text style={styles.heading}>📷 Scan Care Pass QR</Text>

      {/* Scanner Placeholder */}
      <View style={styles.scannerBox}>
        <Text style={styles.scannerText}>
          [QR Scanner Component Placeholder]
        </Text>
      </View>

      {/* Simulate Scan Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSimulateScan}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Scanning...' : 'Simulate Scan'}
        </Text>
      </TouchableOpacity>

      {/* Show scan result if available */}
      {scanResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Scan Result</Text>
          <Text>ID: {scanResult.id}</Text>
          <Text>Plan: {scanResult.access}</Text>
          <Text>Tier: {scanResult.tier}</Text>
          <Text>Status: {scanResult.status}</Text>
          <Text>Valid Till: {scanResult.validity}</Text>

          {/* Extra feature: Only admin can verify */}
          {userRole === 'admin' ? (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: 'green', marginTop: 10 },
              ]}
              onPress={() => Alert.alert('Verified', 'Care Pass is valid ✅')}
            >
              <Text style={styles.buttonText}>Verify Pass</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ marginTop: 10, color: 'red' }}>
              🔒 Only admins can verify passes
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// -----------------------------
// STYLES (UNCHANGED)
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scannerBox: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#0d6efd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerText: {
    color: '#666',
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultBox: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default CarePassScanner;

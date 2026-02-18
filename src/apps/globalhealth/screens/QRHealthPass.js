import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const QRHealthPass = () => {
  const [qrToken, setQrToken] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== STATIC PLAN DATA (SAME AS WEB) ===== */
  const mockPlan = {
    userId: '6878cab776dff2304cdb2d72',
    planId: '687890b0e584bcbe2c5442f3',
    userName: 'Ravi Kumar',
    planName: 'Premium Multi-City OPD + IPD',
    planStatus: 'Active',
    expiryDate: '2025-12-31',
    usage: { opd: 3, ipd: 1, lab: 2 },
    walletBalance: 230.5,
    multiCity: true,
    emergencyAccess: true,
  };

  /* ===== AUTH ===== */
  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  /* ===== GENERATE QR TOKEN ===== */
  const generateQR = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await axios.post(
        `${API_BASE_URL}/qr/generate`,
        {
          userId: mockPlan.userId,
          planId: mockPlan.planId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setQrToken(res.data?.token);
    } catch (err) {
      console.error('❌ Failed to generate QR', err);
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  /* ===== FETCH SCAN HISTORY ===== */
  const fetchScanHistory = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/qr/history/${mockPlan.userId}`,
      );
      setScanHistory(res.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch scan history', err);
    }
  };

  /* ===== INIT ===== */
  useEffect(() => {
    const init = async () => {
      await generateQR();
      await fetchScanHistory();
      setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      generateQR();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ===== UI ===== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading your health card...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My BBSCART QR Health Pass</Text>

      <Text style={styles.name}>{mockPlan.userName}</Text>
      <Text style={styles.plan}>{mockPlan.planName}</Text>

      {qrToken ? (
        <Image
          source={{
            uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`,
          }}
          style={styles.qrImage}
        />
      ) : (
        <Text>Loading QR...</Text>
      )}

      <Text style={styles.info}>
        <Text style={styles.label}>Valid Until: </Text>
        {mockPlan.expiryDate}
      </Text>

      <Text style={styles.info}>
        <Text style={styles.label}>OPD Left: </Text>
        {mockPlan.usage.opd}
      </Text>

      <Text style={styles.info}>
        <Text style={styles.label}>IPD Left: </Text>
        {mockPlan.usage.ipd}
      </Text>

      <Text style={styles.info}>
        <Text style={styles.label}>Lab Left: </Text>
        {mockPlan.usage.lab}
      </Text>

      <Text style={styles.info}>
        <Text style={styles.label}>Wallet Balance: </Text>₹
        {mockPlan.walletBalance.toFixed(2)}
      </Text>

      {mockPlan.multiCity && (
        <Text style={styles.badge}>🌐 Multi-City Access Enabled</Text>
      )}

      {mockPlan.emergencyAccess && (
        <Text style={styles.badge}>🆘 Emergency Override Enabled</Text>
      )}

      <Text style={styles.historyTitle}>Recent Scan History</Text>

      {scanHistory.length === 0 && <Text>No scan history found</Text>}

      {scanHistory.map((item, idx) => (
        <Text key={idx} style={styles.historyItem}>
          ✅ {item.location} — {new Date(item.scannedAt).toLocaleString()}
        </Text>
      ))}
    </View>
  );
};

export default QRHealthPass;

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  plan: {
    fontSize: 14,
    marginBottom: 14,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  info: {
    fontSize: 15,
    marginVertical: 2,
  },
  label: {
    fontWeight: 'bold',
  },
  badge: {
    marginTop: 6,
    fontWeight: '600',
  },
  historyTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyItem: {
    fontSize: 13,
    marginTop: 4,
  },
});

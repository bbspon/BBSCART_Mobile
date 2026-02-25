import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Re-enable when compatible PDF library is available
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import RNFS from 'react-native-fs';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const DigitalHealthCard = () => {
  const insets = useSafeAreaInsets();
  const [qrData, setQrData] = useState('');
  const [refreshed, setRefreshed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // -----------------------------
  // FETCH DIGITAL CARD
  // -----------------------------
  const fetchCard = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/card/digital-card`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserInfo(res.data);
      setQrData(res.data.qrToken);
    } catch (err) {
      Alert.alert('Error', 'Failed to load digital health card');
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  // -----------------------------
  // REFRESH QR
  // -----------------------------
  const handleRefreshQR = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.put(
        `${API_BASE_URL}/card/digital-card/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setQrData(res.data.qrToken);
      setRefreshed(true);
    } catch {
      Alert.alert('Error', 'QR refresh failed');
    }
  };

  // -----------------------------
  // GENERATE PDF (WORKING)
  // -----------------------------
  const handleDownloadPDF = async () => {
    if (!userInfo) {
      Alert.alert('Error', 'Card data not loaded');
      return;
    }

    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #0d6efd; }
              .box { border: 1px solid #ddd; padding: 16px; border-radius: 8px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>BBS Digital Health Card</h1>
            <div class="box">
              <p><span class="label">Name:</span> ${userInfo.name}</p>
              <p><span class="label">Status:</span> ${userInfo.status}</p>
              <p><span class="label">Plan:</span> ${userInfo.planTier}</p>
              <p><span class="label">Valid Till:</span> ${userInfo.planExpiry}</p>
              <p><span class="label">City:</span> ${userInfo.city}, ${userInfo.state}</p>
              <p><span class="label">OPD:</span> ${userInfo.coverage?.opd ?? 'N/A'}</p>
              <p><span class="label">IPD:</span> ${userInfo.coverage?.ipd ?? 'N/A'}</p>
              <p><span class="label">Labs:</span> ${userInfo.coverage?.labs ?? 'N/A'}</p>
            </div>
          </body>
        </html>
      `;

      const options = {
        html,
        fileName: `BBS_Health_Card_${Date.now()}`,
        directory: Platform.OS === 'android' ? 'Download' : 'Documents',
      };

      // TODO: Re-enable when compatible PDF library is available
      Alert.alert(
        'Feature Temporarily Disabled',
        'PDF generation is temporarily disabled. Will be re-enabled with a compatible library.'
      );
      return;

      // const file = await RNHTMLtoPDF.convert(options);

      Alert.alert(
        'PDF Generated',
        `Saved to:\n${file.filePath}`,
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
      <Text style={styles.title}>🩺 Your Digital Health Access Card</Text>

      {userInfo ? (
        <View style={styles.card}>
          <View style={styles.qrContainer}>
            {qrData && (
              <Image
                source={{
                  uri: `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(qrData)}`,
                }}
                style={{ width: 160, height: 160 }}
              />
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{userInfo.name}</Text>

            <Text style={[styles.badge, { backgroundColor: '#28a745' }]}>
              {userInfo.status}
            </Text>

            <Text>🛡 Plan: <Text style={styles.bold}>{userInfo.planTier}</Text></Text>
            <Text>📅 Valid Till: <Text style={styles.bold}>{userInfo.planExpiry}</Text></Text>

            <Text style={styles.subHeading}>🧾 Coverage</Text>
            <Text>• OPD Visits: {userInfo.coverage?.opd ?? 'N/A'}</Text>
            <Text>• IPD Stays: {userInfo.coverage?.ipd ?? 'N/A'}</Text>
            <Text>• Lab Tests: {userInfo.coverage?.labs ?? 'N/A'}</Text>

            <Text style={styles.location}>📍 {userInfo.city}, {userInfo.state}</Text>

            <TouchableOpacity style={styles.button} onPress={handleDownloadPDF}>
              <Text style={styles.buttonText}>⬇️ Generate PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#17a2b8', marginTop: 8 }]}
              onPress={handleRefreshQR}
            >
              <Text style={styles.buttonText}>🔄 Refresh QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text>Loading your digital health card...</Text>
      )}

      {refreshed && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            🔁 QR refreshed. Valid for next 48 hours.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', elevation: 4 },
  qrContainer: { flex: 1, alignItems: 'center', marginRight: 12 },
  infoContainer: { flex: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginVertical: 6 },
  subHeading: { marginTop: 8, fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  location: { marginTop: 8, fontStyle: 'italic' },
  button: { marginTop: 12, backgroundColor: '#0d6efd', padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  alert: { marginTop: 16, backgroundColor: '#e7f3ff', padding: 10, borderRadius: 6 },
  alertText: { color: '#0d6efd' },
});

export default DigitalHealthCard;

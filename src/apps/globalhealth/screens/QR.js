import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const QRCodeDisplay = () => {
  const [qrUrl, setQrUrl] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const raw = await AsyncStorage.getItem('bbsUser');
        const session = raw ? JSON.parse(raw) : null;
        const token = session?.token;

        if (!token) {
          throw new Error('Auth token missing');
        }

        const res = await axios.get(`${API_BASE_URL}/user/qr`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQrUrl(res.data?.qr);
        setPlanInfo(res.data?.info);
      } catch (err) {
        console.error('❌ Failed to fetch QR code', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading your health card...</Text>
      </View>
    );
  }

  if (!qrUrl || !planInfo) {
    return (
      <View style={styles.center}>
        <Text>Failed to load QR code.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Digital Health Access Card</Text>

      <Image source={{ uri: qrUrl }} style={styles.qrImage} />

      <Text style={styles.infoText}>
        <Text style={styles.label}>Plan: </Text>
        {planInfo.planName || 'N/A'}
      </Text>

      <Text style={styles.infoText}>
        <Text style={styles.label}>Valid Until: </Text>
        {planInfo.endDate ? new Date(planInfo.endDate).toDateString() : 'N/A'}
      </Text>

      <Text style={styles.infoText}>
        <Text style={styles.label}>Txn ID: </Text>
        {planInfo.transactionId || 'N/A'}
      </Text>
    </View>
  );
};

export default QRCodeDisplay;

/* ===== STYLES UNCHANGED ===== */
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
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
  },
  label: {
    fontWeight: 'bold',
  },
});

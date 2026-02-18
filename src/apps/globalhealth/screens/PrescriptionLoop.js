import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

// IMPORTANT: use real API base
// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const PrescriptionLoop = ({ route }) => {
  const insets = useSafeAreaInsets();
  const userId = route?.params?.userId || null;

  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // FETCH PRESCRIPTION LOOP
  // ---------------------------
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/prescription-loop/${userId}`,
        );

        setData(res.data);
      } catch (err) {
        console.error(
          '❌ Failed to fetch prescription loop',
          err?.response?.data || err,
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleOrderMedicine = () => {
    setMessage('🛒 Redirecting to medicine ordering page...');
  };

  const handleBookLabTest = () => {
    setMessage('🧪 Redirecting to lab test booking...');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>💊 Prescription & Follow-up Loop</Text>

      {userId && <Text style={styles.subText}>User ID: {userId}</Text>}

      {message ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{message}</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {/* 📄 Prescription Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📄 Your Prescription</Text>

            {data?.prescriptions?.length ? (
              data.prescriptions.map((item, index) => (
                <Text key={index} style={styles.listItem}>
                  {`Tab ${item.medicine} ${item.dosage} - ${item.frequency}`}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No prescriptions available</Text>
            )}

            <TouchableOpacity
              style={[styles.button, styles.successBtn]}
              onPress={handleOrderMedicine}
            >
              <Text style={styles.btnText}>Order Medicine</Text>
            </TouchableOpacity>
          </View>

          {/* 🧪 Lab Tests Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 Recommended Tests</Text>

            {data?.recommendedTests?.length ? (
              data.recommendedTests.map((test, index) => (
                <Text key={index} style={styles.listItem}>
                  • {test}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No tests recommended</Text>
            )}

            <TouchableOpacity
              style={[styles.button, styles.warningBtn]}
              onPress={handleBookLabTest}
            >
              <Text style={styles.btnText}>Book Lab Test</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#e7f1ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoText: {
    color: '#084298',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    color: '#212529',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  successBtn: {
    backgroundColor: '#198754',
  },
  warningBtn: {
    backgroundColor: '#ffc107',
  },
  btnText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default PrescriptionLoop;

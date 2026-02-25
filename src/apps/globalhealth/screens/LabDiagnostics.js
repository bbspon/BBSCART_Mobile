import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT
// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const LabDiagnostics = () => {
  const insets = useSafeAreaInsets();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [testType, setTestType] = useState('');
  const [location, setLocation] = useState('');
  const [homePickup, setHomePickup] = useState(false);

  const [selectedLab, setSelectedLab] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // -----------------------------
  // FETCH LABS (same as web)
  // -----------------------------
  const fetchLabs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/labs`);

      const labsArray = Array.isArray(res.data)
        ? res.data
        : res.data?.labs || [];

      setLabs(labsArray);
    } catch (err) {
      setError('Failed to fetch labs. Try again later.');
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  // -----------------------------
  // FILTER (same logic as web)
  // -----------------------------
  const filteredLabs = labs.filter(lab => {
    return (
      lab.name.toLowerCase().includes(search.toLowerCase()) &&
      (testType === '' || lab.tests?.includes(testType)) &&
      (location === '' ||
        lab.city.toLowerCase().includes(location.toLowerCase())) &&
      (!homePickup || lab.homePickup === true)
    );
  });

  // -----------------------------
  // GET AUTH TOKEN
  // -----------------------------
  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // -----------------------------
  // BOOK LAB
  // -----------------------------
  const confirmBooking = async () => {
    if (!selectedLab) return;

    setBookingLoading(true);
    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to book a lab test.');
        setShowModal(false);
        setBookingLoading(false);
        return;
      }

      // Prepare booking payload
      const payload = {
        labId: selectedLab.id || selectedLab._id,
        labName: selectedLab.name,
        testType: testType || 'General',
        city: selectedLab.city,
        homePickup: homePickup,
      };

      // Fix: Remove extra /api from endpoint
      const response = await axios.post(`${API_BASE_URL}/labs/book`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setAlertMsg(`✅ Booking confirmed with ${selectedLab.name}`);
      setShowModal(false);
      setSelectedLab(null);
      
      // Reset form after successful booking
      setTestType('');
      setHomePickup(false);
    } catch (err) {
      console.error('Booking error:', err?.response?.data || err);
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        err?.message || 
        'Booking failed. Please try again.';
      Alert.alert('Error', `❌ ${errorMessage}`);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>🧪 Book Lab & Diagnostic Tests</Text>

      {alertMsg !== '' && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{alertMsg}</Text>
        </View>
      )}

      {error !== '' && (
        <View style={[styles.alert, { backgroundColor: '#f8d7da' }]}>
          <Text style={{ color: '#842029' }}>{error}</Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterBox}>
        <TextInput
          style={styles.input}
          placeholder="Search lab name"
          value={search}
          onChangeText={setSearch}
        />

        <TextInput
          style={styles.input}
          placeholder="Test Type (Blood / Scan)"
          value={testType}
          onChangeText={setTestType}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.switchRow}>
          <Text>Home Pickup</Text>
          <Switch value={homePickup} onValueChange={setHomePickup} />
        </View>
      </View>

      {/* Lab List */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : filteredLabs.length === 0 ? (
        <Text style={styles.empty}>No labs found</Text>
      ) : (
        filteredLabs.map(lab => (
          <View key={lab.id} style={styles.card}>
            <Text style={styles.labName}>{lab.name}</Text>
            <Text>📍 {lab.city}</Text>
            <Text>🧪 {lab.tests?.join(', ')}</Text>
            <Text>🚗 Home Pickup: {lab.homePickup ? 'Yes' : 'No'}</Text>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => {
                setSelectedLab(lab);
                setShowModal(true);
              }}
            >
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Booking Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            <Text style={{ marginVertical: 10 }}>
              Book with{' '}
              <Text style={{ fontWeight: 'bold' }}>{selectedLab?.name}</Text> in{' '}
              {selectedLab?.city}?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, bookingLoading && { opacity: 0.6 }]}
                onPress={confirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default LabDiagnostics;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  alert: {
    backgroundColor: '#d1e7dd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  alertText: {
    color: '#0f5132',
    fontWeight: '600',
  },
  filterBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  labName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookBtn: {
    marginTop: 10,
    backgroundColor: '#198754',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelBtn: {
    padding: 10,
    marginRight: 8,
  },
  confirmBtn: {
    padding: 10,
    backgroundColor: '#0d6efd',
    borderRadius: 6,
  },
});

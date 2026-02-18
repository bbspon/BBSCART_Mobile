import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/FontAwesome5';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const OfflineDeploymentDashboard = () => {
  const insets = useSafeAreaInsets();
  const [syncStatus, setSyncStatus] = useState('offline');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [deployments, setDeployments] = useState([]);

  const [form, setForm] = useState({
    locationName: '',
    address: '',
    region: '',
    deploymentType: 'Kiosk',
    status: 'Active',
    uptimeHours: 0,
    notes: '',
  });

  /* ===== TOKEN ===== */
  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  /* ===== NETWORK STATUS ===== */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setSyncStatus('offline');
        setShowEmergency(true);
      } else {
        setSyncStatus('online');
        setShowEmergency(false);
      }
    });

    fetchDeployments();
    return () => unsubscribe();
  }, []);

  /* ===== FETCH DEPLOYMENTS ===== */
  const fetchDeployments = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/offline-deployment/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeployments(res.data || []);
    } catch (err) {
      console.error('❌ Failed to load deployments', err);
    }
  };

  /* ===== CREATE DEPLOYMENT ===== */
  const handleSubmit = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      await axios.post(`${API_BASE_URL}/offline-deployment/create`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Deployment added');
      setForm({
        locationName: '',
        address: '',
        region: '',
        deploymentType: 'Kiosk',
        status: 'Active',
        uptimeHours: 0,
        notes: '',
      });
      fetchDeployments();
    } catch (err) {
      console.error('❌ Create failed', err);
      Alert.alert('Error', 'Create failed');
    }
  };

  /* ===== SIMULATIONS (NO API) ===== */
  const simulateSync = () => {
    setSyncStatus('syncing');
    Alert.alert('Sync', 'Attempting to sync...');
    setTimeout(() => {
      setSyncStatus('online');
      Alert.alert('Success', 'Data synced successfully');
    }, 3000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>🛰️ BBSCART Offline Deployment Toolkit</Text>

      {showEmergency && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>⚠️ No Internet — Emergency Mode</Text>
        </View>
      )}

      {/* SIMULATION CARDS */}
      {[
        { title: 'Offline QR Check-In', msg: 'John Doe / ID 1020 Verified' },
        { title: 'Print Patient Token', msg: 'OPD #045 Printed' },
        { title: 'USB Manual Sync', msg: 'USB Sync Started' },
        { title: 'Emergency Health Card', msg: 'Digital Card Shown' },
        { title: 'SOS', msg: 'SOS Activated' },
      ].map((item, i) => (
        <View key={i} style={styles.card}>
          <Icon name="qrcode" size={18} />
          <Text style={styles.cardTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => Alert.alert(item.title, item.msg)}
          >
            <Text style={styles.btnText}>Simulate</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* SYNC STATUS */}
      <View style={styles.card}>
        <Icon name="sync" size={18} />
        <Text style={styles.cardTitle}>Sync Status: {syncStatus}</Text>
        <TouchableOpacity style={styles.btnOutline} onPress={simulateSync}>
          <Text>Force Sync</Text>
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.subtitle}>Add Offline Deployment</Text>

        {['locationName', 'address', 'region', 'notes'].map(field => (
          <TextInput
            key={field}
            placeholder={field}
            value={form[field]}
            onChangeText={v => setForm({ ...form, [field]: v })}
            style={styles.input}
          />
        ))}

        <Picker
          selectedValue={form.deploymentType}
          onValueChange={v => setForm({ ...form, deploymentType: v })}
        >
          {['Kiosk', 'Mobile Unit', 'Community Center', 'Other'].map(t => (
            <Picker.Item key={t} label={t} value={t} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.status}
          onValueChange={v => setForm({ ...form, status: v })}
        >
          {['Active', 'Inactive', 'Maintenance'].map(s => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>

        <TextInput
          placeholder="Uptime Hours"
          keyboardType="numeric"
          style={styles.input}
          value={String(form.uptimeHours)}
          onChangeText={v => setForm({ ...form, uptimeHours: Number(v) })}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Submit Deployment</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <Text style={styles.subtitle}>Deployed Locations</Text>
      <FlatList
        data={deployments}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <Text style={styles.bold}>{item.locationName}</Text>
            <Text>{item.region}</Text>
            <Text>
              {item.deploymentType} | {item.status} | {item.uptimeHours}h
            </Text>
            <Text style={styles.muted}>{item.notes}</Text>
          </View>
        )}
      />

      {/* SOS MODAL */}
      <Modal visible={showSOS} transparent>
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.bold}>🚨 SOS Triggered</Text>
            <Text>Location saved. Will send when online.</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setShowSOS(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default OfflineDeploymentDashboard;

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: '600', marginVertical: 6 },
  btn: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  btnText: { color: '#fff', textAlign: 'center' },
  alert: {
    backgroundColor: '#ffdddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  alertText: { color: '#900' },
  form: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  bold: { fontWeight: 'bold' },
  muted: { color: '#777' },
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
});

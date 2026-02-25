import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

/* ===== STATIC DATA (SAME AS WEB) ===== */
const STATIC_CATEGORIES = [
  'Doctor',
  'Hospital',
  'Lab',
  'Pharmacy',
  'Plan',
  'Billing',
  'Other',
];

const STATIC_TIMELINE = [
  { stage: 'Raised', time: '2025-07-10 10:15', by: 'User' },
  { stage: 'Assigned', time: '2025-07-10 12:00', by: 'BBSCART' },
  { stage: 'In Progress', time: '2025-07-11 10:00', by: 'Partner' },
];

const STATIC_INBOX = [
  {
    id: 'c1',
    user: 'Jane Doe',
    category: 'Lab',
    priority: 'Critical',
    status: 'In Progress',
  },
];

const STATIC_STATS = {
  total: 125,
  resolved: 90,
  pending: 35,
  avgTAT: 48,
  partnerHotspots: ['Hospital A', 'Lab X'],
};

export default function GrievanceResolutionSystem() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('form');

  const [categories] = useState(STATIC_CATEGORIES);
  const [timeline] = useState(STATIC_TIMELINE);
  const [inbox] = useState(STATIC_INBOX);
  const [stats] = useState(STATIC_STATS);

  const [form, setForm] = useState({
    category: '',
    priority: 'Low',
    anonymous: false,
    description: '',
  });

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    return raw ? JSON.parse(raw)?.token : null;
  };

  /* ===== ONLY REAL API CALL (SAME AS WEB) ===== */
  const handleSubmit = async () => {
    if (!form.category || !form.description) {
      Alert.alert('Validation', 'Category and description are required');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const formData = new FormData();
      formData.append('type', form.category || 'Other');
      formData.append('title', `${form.priority} Complaint`);
      formData.append('description', form.description);
      formData.append('partnerId', '');
      formData.append('anonymous', form.anonymous);

      await axios.post(`${API_BASE_URL}/grievance/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Complaint submitted successfully');
      setStep('timeline');
    } catch (err) {
      console.error('❌ Submit failed', err);
      Alert.alert('Error', 'Failed to submit complaint');
    }
  };

  const progress = Math.round((stats.resolved / stats.total) * 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>BBSCART Grievance System</Text>

      {/* NAV */}
      <View style={styles.navbar}>
        {['form', 'timeline', 'inbox', 'stats'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.navLink, step === s && styles.navActive]}
            onPress={() => setStep(s)}
          >
            <Text style={styles.navText}>
              {s === 'form'
                ? 'Raise Complaint'
                : s === 'timeline'
                ? 'My Timeline'
                : s === 'inbox'
                ? 'Partner Inbox'
                : 'Admin Analytics'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FORM */}
      {step === 'form' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Raise a Complaint</Text>

          <Text>Category</Text>
          <Picker
            selectedValue={form.category}
            onValueChange={v => setForm({ ...form, category: v })}
          >
            <Picker.Item label="-- Select --" value="" />
            {categories.map(c => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>

          <Text>Description</Text>
          <TextInput
            style={styles.textInput}
            multiline
            value={form.description}
            onChangeText={t => setForm({ ...form, description: t })}
          />

          <Text>Priority</Text>
          <Picker
            selectedValue={form.priority}
            onValueChange={v => setForm({ ...form, priority: v })}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Critical" value="Critical" />
          </Picker>

          <View style={styles.row}>
            <Text>Submit Anonymously</Text>
            <Switch
              value={form.anonymous}
              onValueChange={v => setForm({ ...form, anonymous: v })}
            />
          </View>

          <TouchableOpacity style={styles.successBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Submit Complaint</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TIMELINE */}
      {step === 'timeline' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complaint Timeline</Text>
          {timeline.map((t, i) => (
            <Text key={i}>
              {t.stage}: {t.time} ({t.by})
            </Text>
          ))}
        </View>
      )}

      {/* INBOX */}
      {step === 'inbox' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Partner Inbox</Text>
          {inbox.map(i => (
            <Text key={i.id}>
              {i.user} • {i.category} • {i.status}
            </Text>
          ))}
        </View>
      )}

      {/* STATS */}
      {step === 'stats' && (
        <View style={styles.card}>
          <Text>Total Complaints: {stats.total}</Text>
          <Text>Resolved: {stats.resolved}</Text>
          <Text>Pending: {stats.pending}</Text>
          <Text>Average TAT: {stats.avgTAT} hrs</Text>
          <Text>Resolution Rate: {progress}%</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* STYLES — UNCHANGED */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  navbar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  navLink: { marginRight: 10 },
  navActive: { borderBottomWidth: 2 },
  navText: { fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  successBtn: {
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});

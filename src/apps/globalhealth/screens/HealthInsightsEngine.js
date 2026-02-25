import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

// Android Emulator → http://10.0.2.2:5000
// Physical Device → http://YOUR_PC_IP:5000
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const regions = ['All India', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'UAE'];
const diseases = [
  'Diabetes',
  'Maternal Care',
  'Respiratory Infections',
  'Cardiovascular',
  'Malaria',
];
const roles = ['Government', 'CSR Head', 'Researcher'];

const formatNumber = (val, decimals = 1) =>
  typeof val === 'number' ? val.toFixed(decimals) : 'N/A';

export default function HealthInsightsEngine() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [selectedRegion, setSelectedRegion] = useState('All India');
  const [selectedDisease, setSelectedDisease] = useState('Diabetes');
  const [selectedRole, setSelectedRole] = useState('Government');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [showMapModal, setShowMapModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedRegion, selectedDisease]);

  // ---------------------------
  // FETCH INSIGHTS (API)
  // ---------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        setData(null);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/health-insights/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data?.data?.[0]?.data?.[0] || null);
    } catch (err) {
      console.error('❌ Failed to load health insights', err);
      setData(null);
    }
    setLoading(false);
  };

  const resetFilters = () => {
    setSelectedRegion('All India');
    setSelectedDisease('Diabetes');
    setSelectedRole('Government');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>National & State-Level Health Insights</Text>

      {/* Navigation Tabs */}
      <View style={styles.tabs}>
        <Pressable onPress={() => navigation.navigate('HealthInsights')}>
          <Text style={styles.tab}>Overview</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('HealthTrends')}>
          <Text style={styles.tab}>Trends</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('HealthIntelligence')}>
          <Text style={styles.tab}>Intelligence</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('HealthIntelligence')}>
          <Text style={styles.tab}>Disease Surveillance</Text>
        </Pressable>
      </View>

      {/* Filters */}
      <Text style={styles.label}>Region</Text>
      <Picker selectedValue={selectedRegion} onValueChange={setSelectedRegion}>
        {regions.map(r => (
          <Picker.Item key={r} label={r} value={r} />
        ))}
      </Picker>

      <Text style={styles.label}>Disease</Text>
      <Picker
        selectedValue={selectedDisease}
        onValueChange={setSelectedDisease}
      >
        {diseases.map(d => (
          <Picker.Item key={d} label={d} value={d} />
        ))}
      </Picker>

      <Text style={styles.label}>User Role</Text>
      <Picker selectedValue={selectedRole} onValueChange={setSelectedRole}>
        {roles.map(r => (
          <Picker.Item key={r} label={r} value={r} />
        ))}
      </Picker>

      <Pressable style={styles.resetBtn} onPress={resetFilters}>
        <Text style={styles.resetText}>Reset Filters</Text>
      </Pressable>

      {/* Loader */}
      {loading && <ActivityIndicator size="large" />}

      {/* Cards */}
      {!loading && data && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Usage</Text>
            <Text>{data.planUsage?.toFixed(1) || 'N/A'}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disease Prevalence</Text>
            <Text>{data.diseasePrevalence || 'N/A'} cases</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>CSR Opportunity</Text>
            <Text>{formatNumber(data.csrOpportunityScore)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hospital Load</Text>
            <Text>{data.hospitalLoad || 'N/A'}%</Text>
            <Pressable onPress={() => setShowMapModal(true)}>
              <Text style={styles.link}>View Map</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Next Best Intervention</Text>
            <Text>{data.nextIntervention || 'N/A'}</Text>
            <Pressable onPress={() => setShowImpactModal(true)}>
              <Text style={styles.link}>Simulate Impact</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setShowPrivacyModal(true)}>
            <Text style={styles.link}>Data Ethics & Privacy</Text>
          </Pressable>
        </>
      )}

      {/* Modals */}
      <Modal visible={showMapModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text>Geo Health Map (Coming Soon)</Text>
          <Pressable onPress={() => setShowMapModal(false)}>
            <Text style={styles.link}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={showImpactModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text>Impact of {data?.nextIntervention || '...'}</Text>
          <Pressable onPress={() => setShowImpactModal(false)}>
            <Text style={styles.link}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={showPrivacyModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text>✔ GDPR / DPDP / UAE Compliance</Text>
          <Text>✔ Tokenized IDs</Text>
          <Text>✔ Consent-based access</Text>
          <Pressable onPress={() => setShowPrivacyModal(false)}>
            <Text style={styles.link}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  tab: { color: '#0d6efd', fontWeight: '600' },
  label: { marginTop: 10, fontWeight: '600' },
  resetBtn: {
    backgroundColor: '#6c757d',
    padding: 10,
    marginVertical: 12,
    borderRadius: 6,
  },
  resetText: { color: '#fff', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 6 },
  link: { color: '#198754', marginTop: 8 },
  modal: {
    backgroundColor: '#fff',
    margin: 40,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});

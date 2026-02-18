import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function InsuranceIntegration() {
  const insets = useSafeAreaInsets();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [pendingPolicy, setPendingPolicy] = useState(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [showHelpBot, setShowHelpBot] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  /* ===== API CALL ===== */
  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/insurance`);
      setPolicies(res.data?.data || []);
    } catch (error) {
      setErr('Failed to fetch insurance partners');
    } finally {
      setLoading(false);
    }
  };

  /* ===== SELECT PLAN ===== */
  const handleBuy = planName => {
    setPendingPolicy(planName); // temporary
    setShowCompare(true);
  };

  /* ===== CONFIRM PLAN ===== */
  const confirmPurchase = () => {
    setSelectedPolicy(pendingPolicy); // final selection
    setShowCompare(false);
  };

  const insuranceOptions = [
    { name: 'Star Health', cover: '₹10L', price: '₹299/month' },
    { name: 'Niva Bupa', cover: '₹20L', price: '₹459/month' },
    { name: 'Care Health', cover: '₹30L', price: '₹699/month' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.header}>
        🛡️ Insurance Add-On: Catastrophic Coverage
      </Text>

      <View style={styles.alert}>
        <Text>
          BBSCART covers OPD, diagnostics, and wellness. For hospitalizations,
          add insurance from IRDAI/DHA-approved partners.
        </Text>
      </View>

      {/* ================= CURRENT INSURANCE ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Current Insurance</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : err ? (
          <Text style={styles.error}>{err}</Text>
        ) : policies.length === 0 ? (
          <Text>No active policies found.</Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              {['Name', 'Coverage', 'Partner', 'Status', 'Remarks', 'Synced'].map(h => (
                <Text key={h} style={[styles.tableCell, styles.tableHeaderCell]}>
                  {h}
                </Text>
              ))}
            </View>

            {policies.map(p => (
              <View key={p._id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{p.name}</Text>
                <Text style={styles.tableCell}>{p.coverageType}</Text>
                <Text style={styles.tableCell}>{p.partnerName}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { color: p.status === 'Active' ? 'green' : 'gray', fontWeight: 'bold' },
                  ]}
                >
                  {p.status}
                </Text>
                <Text style={styles.tableCell}>{p.remarks}</Text>
                <Text style={styles.tableCell}>
                  {new Date(p.syncedOn).toLocaleDateString()}
                </Text>
              </View>
            ))}

            <View style={styles.switchRow}>
              <Text>Auto-Renew Insurance Yearly</Text>
              <Switch value={autoRenew} onValueChange={setAutoRenew} />
            </View>
          </>
        )}
      </View>

      {/* ================= COMPARE & ADD ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compare & Add New Insurance</Text>

        <FlatList
          horizontal
          data={insuranceOptions}
          keyExtractor={item => item.name}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedPolicy === item.name;
            return (
              <View style={styles.planCard}>
                <View>
                  <Text style={styles.planName}>{item.name}</Text>
                  <Text style={styles.planDetails}>{item.cover} cover • {item.price}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    isSelected && { backgroundColor: 'green' },
                  ]}
                  disabled={isSelected}
                  onPress={() => handleBuy(item.name)}
                >
                  <Text style={styles.buttonText}>
                    {isSelected ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <View style={styles.consentRow}>
          <Switch />
          <Text style={{ marginLeft: 8 }}>
            I consent to share my details with the selected insurer.
          </Text>
        </View>
      </View>

      {/* ================= HELP ================= */}
      <TouchableOpacity style={styles.helpButton} onPress={() => setShowHelpBot(true)}>
        <Text>💬 Ask Insurance Coach</Text>
      </TouchableOpacity>

      {/* ================= BUY MODAL ================= */}
      <Modal visible={showCompare} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Buy Insurance from {pendingPolicy}
            </Text>

            <Text>
              You're being redirected to {pendingPolicy}'s secure portal.
            </Text>

            <TouchableOpacity
              style={[styles.buyButton, { marginTop: 16 }]}
              onPress={confirmPurchase}
            >
              <Text style={styles.buttonText}>Continue to Insurer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowCompare(false)}>
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= HELP BOT ================= */}
      <Modal visible={showHelpBot} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insurance Coach</Text>

            <Text style={styles.question}>
              Q: Why do I need IPD insurance?
            </Text>
            <Text>
              A: OPD passes don’t cover hospitalizations or ICU stays.
            </Text>

            <TouchableOpacity onPress={() => setShowHelpBot(false)}>
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 ,textAlign: 'center',},
  alert: { backgroundColor: '#cce5ff', padding: 10, borderRadius: 4, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  error: { color: 'red' },

  tableHeader: { flexDirection: 'row', marginBottom: 4 },
  tableHeaderCell: { fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', marginBottom: 2 },
  tableCell: { flex: 1, fontSize: 12 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  planCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    width: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  planName: { 
    fontWeight: 'bold', 
    marginBottom: 4,
    fontSize: 16,
  },
  planDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },

  buyButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
    minHeight: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  helpButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  question: { fontWeight: 'bold', marginTop: 8 },
});

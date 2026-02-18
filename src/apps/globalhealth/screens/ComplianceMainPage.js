import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
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

const riskColor = risk => {
  if (risk === 'High') return '#dc3545';
  if (risk === 'Medium') return '#ffc107';
  return '#198754';
};

export default function ComplianceMainPage() {
  const insets = useSafeAreaInsets();
  const [partners, setPartners] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // -----------------------------
  // FETCH COMPLIANCE PARTNERS
  // -----------------------------
  const fetchCompliancePartners = async () => {
    try {
      const token = await getToken();

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/compliance/main`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // SAME unwrapping as web
      const nested = res.data?.data?.[0]?.data || [];
      setPartners(nested);
    } catch (err) {
      console.error('❌ Compliance fetch failed', err);
      Alert.alert('Error', 'Failed to load compliance data');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliancePartners();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.heading}>🛡️ Compliance Main Page</Text>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!loading &&
        partners.map((p, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.partnerName}>{p.name}</Text>
            <Text>Type: {p.type}</Text>

            <View style={styles.row}>
              <Text>KYC:</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      p.kyc === 'Complete' ? '#198754' : '#dc3545',
                  },
                ]}
              >
                <Text style={styles.badgeText}>{p.kyc}</Text>
              </View>
            </View>

            <Text>Verified: {p.verified ? '✅' : '❌'}</Text>

            <View style={styles.row}>
              <Text>Risk:</Text>
              <View
                style={[styles.badge, { backgroundColor: riskColor(p.risk) }]}
              >
                <Text style={styles.badgeText}>{p.risk}</Text>
              </View>
            </View>

            <Text>Docs: {p.docs?.length || 0} files</Text>
            <Text>Sync: {p.syncStatus || 'Unknown'}</Text>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => setSelected(p)}
            >
              <Text style={styles.viewBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}

      {/* DETAIL MODAL */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>Partner Compliance Info</Text>

                <Text>Name: {selected.name}</Text>
                <Text>Type: {selected.type}</Text>
                <Text>KYC: {selected.kyc}</Text>
                <Text>Verified: {selected.verified ? 'Yes' : 'No'}</Text>
                <Text>Sync Status: {selected.syncStatus}</Text>

                <View style={styles.row}>
                  <Text>Risk:</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: riskColor(selected.risk),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{selected.risk}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>📄 Documents</Text>
                {selected.docs?.length > 0 ? (
                  selected.docs.map((doc, i) => (
                    <Text key={i}>• {doc.name}</Text>
                  ))
                ) : (
                  <Text>No documents uploaded</Text>
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelected(null)}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  viewBtn: {
    marginTop: 10,
    backgroundColor: '#0d6efd',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 12,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
  },
});

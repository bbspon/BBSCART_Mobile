import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔁 Use SAME base URL used in other mobile modules
const API_BASE_URL = 'https://healthcare.bbscart.com/api'; // replace if already defined globally

const MedicalVaultScreen = () => {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // -----------------------------
  // FETCH RECORDS (API INTEGRATED)
  // -----------------------------
  const fetchRecords = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/medical-vault`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort by date (latest first) – same as web (copy before sort to avoid mutating)
      const recordsList = Array.isArray(res?.data) ? res.data : res?.data?.data || res?.data?.records || [];
      const sorted = [...recordsList].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      // Map backend fields → existing UI fields (NO UI CHANGE)
      const mapped = sorted.map(rec => ({
        id: rec._id,
        name: rec.recordName,
        type: rec.category,
        date: new Date(rec.date).toISOString().split('T')[0],
        tags: rec.tags || [],
        url: `${API_BASE_URL}/uploads/medical/${rec.fileName}`,
      }));

      setRecords(mapped);
    } catch (err) {
      console.error(
        '❌ Failed to load medical records',
        err?.response?.data || err,
      );
      Alert.alert('Error', 'Failed to load medical records');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // -----------------------------
  // UPLOAD PLACEHOLDER (UI NOT READY)
  // -----------------------------
  const handleFilePick = async () => {
    Alert.alert(
      'Upload not enabled',
      'File upload UI is not implemented yet. Backend is ready.',
    );
  };
const filtered = records.filter(rec => {
  const q = search.toLowerCase();
  return (
    (rec.name || '').toLowerCase().includes(q) ||
    (rec.type || '').toLowerCase().includes(q) ||
    rec.tags.join(' ').toLowerCase().includes(q)
  );
});


  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧬 My Medical Vault</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search records..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <MaterialCommunityIcons name="file-document-outline" size={18} />{' '}
              {item.name}
            </Text>
            <Text style={styles.cardText}>Type: {item.type}</Text>
            <Text style={styles.cardText}>Date: {item.date}</Text>

            <View style={styles.tagsContainer}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL(item.url)}
              style={styles.downloadBtn}
            >
              <MaterialCommunityIcons name="download" size={18} color="#fff" />
              <Text style={styles.downloadText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.uploadFab}
        onPress={() => setUploadModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="cloud-upload-outline"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadModalVisible}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Medical Record</Text>

            <Pressable style={styles.modalButton} onPress={handleFilePick}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="file-upload-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.buttonText}>Upload (Coming Soon)</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              onPress={() => setUploadModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// -----------------------------
// STYLES (UNCHANGED)
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  cardText: { fontSize: 13, color: '#555' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
  tag: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { color: '#fff', fontSize: 12 },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  downloadText: { color: '#fff', marginLeft: 6 },
  uploadFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 50,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: { color: '#fff', marginLeft: 8 },
});

export default MedicalVaultScreen;

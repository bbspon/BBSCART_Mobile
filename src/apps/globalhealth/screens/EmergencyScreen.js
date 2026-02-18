import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// TODO: Re-enable when compatible PDF library is available
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔁 SAME base URL used across mobile modules
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const EmergencyDashboard = () => {
  const insets = useSafeAreaInsets();
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleViewProfile = user => {
    setSelectedUser(user);
    setShowProfile(true);
  };

  // ----------------------------------
  // FETCH EMERGENCY LOGS (API)
  // ----------------------------------
  const fetchEmergencyLogs = async () => {
    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/emergency/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔁 Map backend response to existing UI structure (NO UI CHANGE)
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || res?.data?.logs || [];
      const mapped = data.map(log => ({
        user: log.guardianContact || 'N/A',
        plan: log.plan || 'No Plan Assigned',
        time: new Date(log.triggeredAt).toLocaleString(),
        location: log.location?.city || 'Unknown',
        status: log.resolved ? 'Resolved' : 'Pending',
        method: log.method || 'Triggered',
        allergies: log.allergies || 'N/A',
        conditions: log.conditions || 'N/A',
        instructions: log.instructions || 'N/A',
      }));

      setLogs(mapped);
    } catch (err) {
      console.error(
        '❌ Failed to load emergency logs',
        err?.response?.data || err,
      );
      Alert.alert('Error', 'Failed to load emergency logs');
    }
  };

  useEffect(() => {
    fetchEmergencyLogs();
  }, []);

  // ----------------------------------
  // PDF DOWNLOAD (UNCHANGED)
  // ----------------------------------
  const downloadPDF = async () => {
    if (!selectedUser) return;

    const htmlContent = `
      <h2>Emergency Health Summary</h2>
      <p><b>Name:</b> ${selectedUser.user}</p>
      <p><b>Health Plan:</b> ${selectedUser.plan}</p>
      <p><b>Allergies:</b> ${selectedUser.allergies}</p>
      <p><b>Medical Conditions:</b> ${selectedUser.conditions}</p>
      <p><b>Emergency Instructions:</b> ${selectedUser.instructions}</p>
      <p><b>Last Known Location:</b> ${selectedUser.location}</p>
      <p><b>Trigger Method:</b> ${selectedUser.method}</p>
      <p><b>Time of Event:</b> ${selectedUser.time}</p>
    `;

    try {
      // TODO: Re-enable when compatible PDF library is available
      Alert.alert(
        'Feature Temporarily Disabled',
        'PDF generation is temporarily disabled. Will be re-enabled with a compatible library.'
      );
      // const file = await RNHTMLtoPDF.convert({
      //   html: htmlContent,
      //   fileName: `Emergency_Profile_${selectedUser.user.replace(/\s+/g, '_')}`,
      //   base64: true,
      // });
      // Alert.alert('PDF Generated', `Saved to: ${file.filePath}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>
        <Icon name="alarm-light" size={22} color="red" /> Emergency Event Logs
      </Text>

      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.user}>{item.user}</Text>
              <Text>
                Plan: <Text style={styles.badge}>{item.plan}</Text>
              </Text>
              <Text>Time: {item.time}</Text>
              <Text>
                <Icon name="map-marker" size={16} color="red" /> {item.location}
              </Text>
              <Text>
                Status:
                <Text
                  style={{
                    color: item.status === 'Resolved' ? 'green' : 'orange',
                  }}
                >
                  {' '}
                  {item.status}
                </Text>
              </Text>
              <Text>Trigger: {item.method}</Text>

              <Button
                mode="outlined"
                style={styles.btn}
                onPress={() => handleViewProfile(item)}
              >
                View Profile
              </Button>
            </Card.Content>
          </Card>
        )}
      />

      {/* Modal */}
      <Modal
        visible={showProfile}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>Patient Emergency Info</Text>

              <Text>
                <Text style={styles.label}>Name:</Text> {selectedUser?.user}
              </Text>
              <Text>
                <Text style={styles.label}>Health Plan:</Text>{' '}
                {selectedUser?.plan}
              </Text>
              <Text>
                <Text style={styles.label}>Medical Conditions:</Text>{' '}
                {selectedUser?.conditions}
              </Text>
              <Text>
                <Text style={styles.label}>Allergies:</Text>{' '}
                {selectedUser?.allergies}
              </Text>
              <Text>
                <Text style={styles.label}>Emergency Instructions:</Text>{' '}
                {selectedUser?.instructions}
              </Text>
              <Text>
                <Text style={styles.label}>Location:</Text>{' '}
                {selectedUser?.location}
              </Text>
              <Text>
                <Text style={styles.label}>Trigger Method:</Text>{' '}
                {selectedUser?.method}
              </Text>
              <Text>
                <Text style={styles.label}>Time:</Text> {selectedUser?.time}
              </Text>

              <Button
                mode="contained"
                onPress={downloadPDF}
                style={{ marginTop: 10 }}
              >
                Download Emergency PDF
              </Button>

              <Button
                onPress={() => setShowProfile(false)}
                style={{ marginTop: 10 }}
              >
                Close
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EmergencyDashboard;

// -----------------------------
// STYLES (UNCHANGED)
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    marginVertical: 8,
    padding: 6,
  },
  user: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#e1f0ff',
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  btn: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
  },
});

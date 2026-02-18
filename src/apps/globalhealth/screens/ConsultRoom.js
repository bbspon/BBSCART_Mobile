import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Android Emulator → http://10.0.2.2:5000
// Physical Device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function ConsultRoom() {
  const [showNote, setShowNote] = useState(false);
  const [prescription, setPrescription] = useState('');
  const [note, setNote] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [saved, setSaved] = useState(false);
const navigation = useNavigation();

  // Same static demo values as web (can be dynamic later)
  const doctorId = '64f1b3d2b3c8e321c9999999';
  const patientId = '64f1b3d2b3c8e321c8888888';
  const patientName = 'Aisha Khan';
  const symptoms = 'Skin rash, itching';

  const sendMessage = () => {
    if (!chatMsg.trim()) return;

    setMessages([
      ...messages,
      {
        text: chatMsg,
        sender: 'doctor',
        timestamp: new Date().toISOString(),
      },
    ]);

    setChatMsg('');
  };

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // ---------------------------
  // SAVE CONSULTATION (API)
  // ---------------------------
  const handleSaveAll = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const payload = {
        doctorId,
        patientId,
        patientName,
        symptoms,
        notes: note,
        prescription,
        messages,
      };

      const res = await axios.post(
        `${API_BASE_URL}/consultation/save`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.success) {
        setSaved(true);
        Alert.alert('Success', 'Consultation saved successfully');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save consultation');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👨‍⚕️ Doctor Virtual Consult Room</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => navigation.navigate('HomeVisitBooking')}
        >
          <Text style={styles.infoText}>🏠 Home Visit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => navigation.navigate('DoctorReferral')}
        >
          <Text style={styles.infoText}>👨‍⚕️ Doctor Referral</Text>
        </TouchableOpacity>

      </View>

      {/* Video Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📹 Live Video</Text>
        <View style={styles.videoBox}>
          <Text style={{ color: '#fff' }}>[ Video Stream Placeholder ]</Text>
        </View>
      </View>

      {/* Chat Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Chat with Patient</Text>

        {messages.map((msg, i) => (
          <View key={i} style={styles.chatBubble}>
            <Text>{msg.text}</Text>
            <Text style={styles.chatTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={chatMsg}
          onChangeText={setChatMsg}
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={sendMessage}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Patient Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📄 Patient Information</Text>
        <Text>
          <Text style={styles.bold}>Name:</Text> {patientName}
        </Text>
        <Text>
          <Text style={styles.bold}>Symptoms:</Text> {symptoms}
        </Text>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setShowNote(true)}
        >
          <Text>Add Consultation Notes</Text>
        </TouchableOpacity>
      </View>

      {/* Prescription */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Prescription</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder="e.g. Tab Levocetirizine 5mg once daily"
          value={prescription}
          onChangeText={setPrescription}
        />
        <TouchableOpacity style={styles.successBtn}>
          <Text style={styles.btnText}>Save Rx to Vault</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.endBtn} onPress={handleSaveAll}>
        <Text style={styles.btnText}>End Consultation & Save</Text>
      </TouchableOpacity>
      </View>

   

      {saved && <Text style={styles.successText}>✅ Saved to vault</Text>}

      {/* Notes Modal */}
      <Modal visible={showNote} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Doctor Notes</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={note}
              onChangeText={setNote}
              placeholder="Write clinical observations..."
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setShowNote(false)}
              >
                <Text>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setShowNote(false)}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  infoBtn: {
    backgroundColor: '#0dcaf0',
    padding: 10,
    borderRadius: 6,
  },
  infoText: { color: '#000', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  videoBox: {
    backgroundColor: '#000',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#0d6efd',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  successBtn: {
    backgroundColor: '#198754',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  endBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#6c757d',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  chatBubble: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  chatTime: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  bold: { fontWeight: '700' },
  successText: {
    color: '#198754',
    fontWeight: '700',
    textAlign: 'center',
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
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

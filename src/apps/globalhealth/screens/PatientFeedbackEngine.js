// STEP 4 — Replace your entire PatientFeedbackEngine.js with this updated version
// NOTE: Your current file has placeholder image upload + simulated voice text. :contentReference[oaicite:0]{index=0}

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Voice from '@react-native-voice/voice';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Android Emulator → http://10.0.2.2:5000
// Physical device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function PatientFeedbackEngine() {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [errors, setErrors] = useState({});

  // voice
  const [isListening, setIsListening] = useState(false);
  const [voicePartial, setVoicePartial] = useState('');

  // image (local file + preview)
  const [imageAsset, setImageAsset] = useState(null); // { uri, fileName, type }
  const [imagePreview, setImagePreview] = useState(null);

  const isMountedRef = useRef(true);

  const [newFeedback, setNewFeedback] = useState({
    type: '',
    rating: '',
    tags: [],
    text: '',
  });

  // -------------------------
  // AUTH TOKEN
  // -------------------------
  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // -------------------------
  // FETCH EXISTING FEEDBACKS
  // -------------------------
  const loadFeedbacks = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/feedback/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!isMountedRef.current) return;
      setFeedbacks(res.data?.data || []);
    } catch (err) {
      console.log('❌ Feedback fetch failed', err?.message || err);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadFeedbacks();

    // Voice event handlers
    Voice.onSpeechStart = () => {
      if (!isMountedRef.current) return;
      setIsListening(true);
      setVoicePartial('');
    };

    Voice.onSpeechEnd = () => {
      if (!isMountedRef.current) return;
      setIsListening(false);
    };

    Voice.onSpeechResults = e => {
      if (!isMountedRef.current) return;
      const text = e?.value?.[0] || '';
      if (text) {
        setNewFeedback(prev => ({
          ...prev,
          text: prev.text ? `${prev.text} ${text}` : text,
        }));
      }
    };

    Voice.onSpeechPartialResults = e => {
      if (!isMountedRef.current) return;
      const text = e?.value?.[0] || '';
      setVoicePartial(text);
    };

    Voice.onSpeechError = e => {
      if (!isMountedRef.current) return;
      setIsListening(false);
      Alert.alert('Voice Error', e?.error?.message || 'Voice recognition failed');
    };

    return () => {
      isMountedRef.current = false;
      try {
        Voice.destroy().then(Voice.removeAllListeners);
      } catch (e) { }
    };
  }, []);

  // -------------------------
  // HELPERS
  // -------------------------
  const handleInputChange = (field, value) => {
    setNewFeedback({ ...newFeedback, [field]: value });
  };

  const validateForm = () => {
    const err = {};
    if (!newFeedback.type) err.type = 'Service type is required';
    const ratingNum = Number(newFeedback.rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) err.rating = 'Rating must be 1–5';
    if (!newFeedback.text) err.text = 'Feedback is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const requestMicPermissionAndroid = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'We need microphone access for voice feedback.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  // -------------------------
  // VOICE INPUT (REAL)
  // -------------------------
  const startVoice = async () => {
    const ok = await requestMicPermissionAndroid();
    if (!ok) {
      Alert.alert('Permission', 'Microphone permission denied');
      return;
    }

    try {
      setVoicePartial('');
      await Voice.start('en-US'); // change to 'ta-IN' for Tamil if you want
    } catch (e) {
      Alert.alert('Voice', 'Could not start voice input');
    }
  };

  const stopVoice = async () => {
    try {
      await Voice.stop();
    } catch (e) { }
  };

  // -------------------------
  // IMAGE PICK (REAL)
  // -------------------------
  const pickImageFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
    });

    if (res?.didCancel) return;
    if (res?.errorCode) {
      Alert.alert('Image', res?.errorMessage || 'Image picker error');
      return;
    }

    const a = res?.assets?.[0];
    if (!a?.uri) return;

    const file = {
      uri: a.uri,
      fileName: a.fileName || `feedback_${Date.now()}.jpg`,
      type: a.type || 'image/jpeg',
    };

    setImageAsset(file);
    setImagePreview(a.uri);
  };

  const takePhotoFromCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: true,
    });

    if (res?.didCancel) return;
    if (res?.errorCode) {
      Alert.alert('Camera', res?.errorMessage || 'Camera error');
      return;
    }

    const a = res?.assets?.[0];
    if (!a?.uri) return;

    const file = {
      uri: a.uri,
      fileName: a.fileName || `feedback_${Date.now()}.jpg`,
      type: a.type || 'image/jpeg',
    };

    setImageAsset(file);
    setImagePreview(a.uri);
  };

  const clearImage = () => {
    setImageAsset(null);
    setImagePreview(null);
  };

  // -------------------------
  // SUBMIT FEEDBACK
  // -------------------------
  // IMPORTANT:
  // Your current code sends JSON with image as URL string. :contentReference[oaicite:1]{index=1}
  // This updated submit sends multipart/form-data IF image is selected.
  // Your backend MUST support multipart on /feedback/submit OR you must create an upload endpoint.
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const hasImage = !!imageAsset?.uri;

      if (!hasImage) {
        // keep JSON submit if no image
        const payload = {
          type: newFeedback.type,
          rating: Number(newFeedback.rating),
          tags: newFeedback.tags,
          comment: newFeedback.text,
          image: null,
          submittedAt: new Date().toISOString(),
        };

        const res = await axios.post(`${API_BASE_URL}/feedback/submit`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFeedbacks([res.data?.data, ...feedbacks]);
        setShowModal(false);
        setNewFeedback({ type: '', rating: '', tags: [], text: '' });
        setErrors({});
        clearImage();
        return;
      }

      // multipart submit (with image)
      const form = new FormData();
      form.append('type', newFeedback.type);
      form.append('rating', String(Number(newFeedback.rating)));
      form.append('tags', JSON.stringify(newFeedback.tags || []));
      form.append('comment', newFeedback.text);
      form.append('submittedAt', new Date().toISOString());

      form.append('image', {
        uri: imageAsset.uri,
        name: imageAsset.fileName,
        type: imageAsset.type,
      });

      const res = await axios.post(`${API_BASE_URL}/feedback/submit`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFeedbacks([res.data?.data, ...feedbacks]);
      setShowModal(false);
      setNewFeedback({ type: '', rating: '', tags: [], text: '' });
      setErrors({});
      clearImage();
    } catch (err) {
      console.log('❌ Submit error', err?.response?.data || err?.message || err);
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>📊 Patient Feedback & Plan Refinement Engine</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.btnText}>+ Submit Feedback</Text>
      </TouchableOpacity>

      {feedbacks.map((fb, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{fb.type}</Text>

          <View style={styles.starRow}>
            {[...Array(fb.rating || 0)].map((_, i) => (
              <Text key={i} style={styles.star}>★</Text>
            ))}
          </View>

          <Text style={styles.muted}>Tags: {fb.tags?.join(', ') || '—'}</Text>
          <Text>{fb.comment}</Text>

          {!!fb.image && <Image source={{ uri: fb.image }} style={styles.image} />}
        </View>
      ))}

      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Submit Feedback</Text>

          <Text style={styles.label}>Service Type</Text>
          <Picker selectedValue={newFeedback.type} onValueChange={v => handleInputChange('type', v)}>
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="OPD Visit" value="opd" />
            <Picker.Item label="Doctor Appointment" value="doctor" />
            <Picker.Item label="Lab Test" value="lab" />
            <Picker.Item label="Pharmacy" value="pharmacy" />
            <Picker.Item label="App Experience" value="app" />
          </Picker>
          {errors.type && <Text style={styles.error}>{errors.type}</Text>}

          <Text style={styles.label}>Rating (1–5)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(newFeedback.rating)}
            onChangeText={v => handleInputChange('rating', v)}
          />
          {errors.rating && <Text style={styles.error}>{errors.rating}</Text>}

          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="Clean, Delay, Staff"
            onChangeText={v => handleInputChange('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
          />

          <Text style={styles.label}>Feedback</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            multiline
            value={newFeedback.text}
            onChangeText={v => handleInputChange('text', v)}
          />
          {errors.text && <Text style={styles.error}>{errors.text}</Text>}

          {/* Voice controls */}
          <View style={styles.actionRow}>
            {!isListening ? (
              <TouchableOpacity style={styles.outlineBtn} onPress={startVoice}>
                <Text>🎤 Start Voice</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.outlineBtn, styles.dangerOutline]} onPress={stopVoice}>
                <Text>🛑 Stop</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.outlineBtn} onPress={pickImageFromGallery}>
              <Text>🖼️ Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={takePhotoFromCamera}>
              <Text>📷 Camera</Text>
            </TouchableOpacity>
          </View>

          {!!voicePartial && (
            <Text style={{ marginTop: 8, color: '#6c757d' }}>
              Listening: {voicePartial}
            </Text>
          )}

          {!!imagePreview && (
            <>
              <Image source={{ uri: imagePreview }} style={styles.preview} />
              <TouchableOpacity style={styles.secondaryBtn} onPress={clearImage}>
                <Text>Remove Image</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.successBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowModal(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

// STYLES — keep your existing styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cardTitle: { fontWeight: '600', marginBottom: 4 },
  muted: { color: '#6c757d', fontSize: 12, marginBottom: 4 },
  starRow: { flexDirection: 'row', marginBottom: 6 },
  star: { color: 'gold', fontSize: 16 },
  image: { marginTop: 8, height: 120, borderRadius: 8 },
  primaryBtn: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  successBtn: {
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtn: { alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  modal: { padding: 16, backgroundColor: '#f8f9fa' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 8,
  },
  error: { color: '#dc3545', fontSize: 12, marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0d6efd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerOutline: { borderColor: '#dc3545' },
  preview: { height: 180, borderRadius: 10, marginTop: 12 },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

/* ===== STATIC DATA (SAME AS WEB) ===== */
const STATIC_CATEGORIES = [
  'Cleanliness',
  'Wait time',
  'Doctor care',
  'Billing',
  'Other',
];

const STATIC_PARTNER_STATS = {
  overallRating: 4.2,
  ratingCount: 128,
  breakdown: {
    Cleanliness: 4.0,
    'Doctor care': 4.5,
    Billing: 3.9,
  },
};

const STATIC_REVIEWS = [
  {
    id: 'r1',
    user: 'Verified User',
    time: '2025-07-10',
    emoji: '😊',
    comment: 'Good service',
    partnerReply: 'Thank you for your feedback.',
  },
  {
    id: 'r2',
    user: 'Verified User',
    time: '2025-06-20',
    emoji: '😠',
    comment: 'Overbilling in OPD',
    partnerReply: null,
  },
];

const STATIC_ADMIN_STATS = {
  total: 150,
  flagged: 12,
  avgRating: 4.2,
  lowPartners: ['Hospital A', 'Lab X'],
};

export default function UserFeedbackRatingsSystem({ partnerId }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('prompt');

  const [categories] = useState(STATIC_CATEGORIES);
  const [stats] = useState(STATIC_PARTNER_STATS);
  const [reviews] = useState(STATIC_REVIEWS);
  const [adminStats] = useState(STATIC_ADMIN_STATS);

  const [prompt, setPrompt] = useState({
    emoji: '',
    type: '', // Service type matching web: "opd", "doctor", "lab", "pharmacy", "app"
    rating: '', // Rating 1-5 (numeric)
    tags: [], // Tags array matching web
    comment: '', // Comment/feedback text matching web
    image: null,
    anonymous: false,
  });

  /* ===== IMAGE PICKER ===== */
  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo' });
    if (!res.didCancel && res.assets?.length) {
      setPrompt({ ...prompt, image: res.assets[0] });
    }
  };

  /* ===== SUBMIT FEEDBACK (Matching web version) ===== */
  const handleSubmitPrompt = async () => {
    // Validation (matching web)
    if (!prompt.type) {
      Alert.alert('Validation', 'Service type is required');
      return;
    }
    if (!prompt.rating || prompt.rating < 1 || prompt.rating > 5) {
      Alert.alert('Validation', 'Rating must be between 1 and 5');
      return;
    }
    if (!prompt.comment) {
      Alert.alert('Validation', 'Feedback text is required');
      return;
    }

    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const token = raw ? JSON.parse(raw)?.token : null;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      // Map emoji to rating if rating not set explicitly
      const ratingValue = prompt.rating || 
        (prompt.emoji === '😃' ? 5 : prompt.emoji === '😐' ? 3 : 1);

      // Prepare payload matching web version structure
      const hasImage = !!prompt.image?.uri;

      if (!hasImage) {
        // JSON submission (no image) - matching web structure
        const payload = {
          type: prompt.type,
          rating: parseInt(ratingValue),
          tags: Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags ? [prompt.tags] : []),
          comment: prompt.comment,
          image: null,
          submittedAt: new Date().toISOString(),
        };

        const res = await axios.post(
          `${API_BASE_URL}/feedback/submit`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        Alert.alert('Success', 'Feedback submitted successfully');
        // Reset form
        setPrompt({
          emoji: '',
          type: '',
          rating: '',
          tags: [],
          comment: '',
          image: null,
          anonymous: false,
        });
        setStep('partnerProfile');
        return;
      }

      // Multipart submission (with image) - matching web structure
      const formData = new FormData();
      formData.append('type', prompt.type);
      formData.append('rating', String(parseInt(ratingValue)));
      formData.append('tags', JSON.stringify(Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags ? [prompt.tags] : [])));
      formData.append('comment', prompt.comment);
      formData.append('submittedAt', new Date().toISOString());

      // Append image file
      formData.append('image', {
        uri: prompt.image.uri,
        name: prompt.image.fileName || 'feedback-image.jpg',
        type: prompt.image.type || 'image/jpeg',
      });

      const res = await axios.post(
        `${API_BASE_URL}/feedback/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Feedback submitted successfully');
      // Reset form
      setPrompt({
        emoji: '',
        type: '',
        rating: '',
        tags: [],
        comment: '',
        image: null,
        anonymous: false,
      });
      setStep('partnerProfile');
    } catch (err) {
      console.error('❌ Feedback submit failed', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit feedback';
      Alert.alert('Error', errorMsg);
    }
  };

  /* ===== UI ===== */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* NAV */}
      <View style={styles.nav}>
        {['prompt', 'partnerProfile', 'adminDashboard'].map(s => (
          <TouchableOpacity key={s} onPress={() => setStep(s)}>
            <Text style={styles.navItem}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROMPT */}
      {step === 'prompt' && (
        <View style={styles.card}>
          <Text style={styles.title}>Post-Visit Feedback</Text>

          {/* Service Type (matching web version - dropdown) */}
          <Text style={styles.label}>Service Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={prompt.type}
              onValueChange={value => setPrompt({ ...prompt, type: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="OPD Visit" value="opd" />
              <Picker.Item label="Doctor Appointment" value="doctor" />
              <Picker.Item label="Lab Test" value="lab" />
              <Picker.Item label="Pharmacy" value="pharmacy" />
              <Picker.Item label="App Experience" value="app" />
            </Picker>
          </View>

          {/* Rating Selection */}
          <Text style={styles.label}>Rating (1-5)</Text>
          <View style={styles.row}>
            {['😃', '😐', '😠'].map(e => {
              const rating = e === '😃' ? 5 : e === '😐' ? 3 : 1;
              const isSelected = prompt.rating === rating || (!prompt.rating && prompt.emoji === e);
              return (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiBtn,
                    isSelected && styles.emojiActive,
                  ]}
                  onPress={() => setPrompt({ ...prompt, emoji: e, rating: rating })}
                >
                  <Text style={styles.emoji}>{e}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Numeric Rating Input (matching web) */}
          <TextInput
            placeholder="Or enter rating (1-5)"
            style={styles.input}
            keyboardType="numeric"
            value={prompt.rating}
            onChangeText={t => setPrompt({ ...prompt, rating: t })}
          />

          {/* Tags (matching web version - comma separated) */}
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            placeholder="E.g., Clean, Delay, Staff"
            style={styles.input}
            value={Array.isArray(prompt.tags) ? prompt.tags.join(', ') : prompt.tags}
            onChangeText={t => {
              const tagsArray = t.split(',').map(tag => tag.trim()).filter(tag => tag);
              setPrompt({ ...prompt, tags: tagsArray });
            }}
          />

          <TextInput
            placeholder="Comment"
            multiline
            style={[styles.input, { height: 80 }]}
            value={prompt.comment}
            onChangeText={t => setPrompt({ ...prompt, comment: t })}
          />

          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text>Upload Image</Text>
          </TouchableOpacity>

          {prompt.image && (
            <Image source={{ uri: prompt.image.uri }} style={styles.preview} />
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmitPrompt}
          >
            <Text style={styles.submitText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PARTNER PROFILE */}
      {step === 'partnerProfile' && (
        <View style={styles.card}>
          <Text style={styles.title}>
            Rating: {stats.overallRating} ⭐ ({stats.ratingCount})
          </Text>

          {Object.entries(stats.breakdown).map(([k, v]) => (
            <Text key={k}>
              {k}: {v.toFixed(1)}
            </Text>
          ))}

          {reviews.map(r => (
            <View key={r.id} style={styles.review}>
              <Text>
                {r.emoji} {r.user} ({r.time})
              </Text>
              <Text>{r.comment}</Text>
              {r.partnerReply && (
                <Text style={styles.reply}>Reply: {r.partnerReply}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* ADMIN DASHBOARD */}
      {step === 'adminDashboard' && (
        <View style={styles.card}>
          <Text>Total Reviews: {adminStats.total}</Text>
          <Text>Flagged: {adminStats.flagged}</Text>
          <Text>Avg Rating: {adminStats.avgRating}</Text>

          <Text style={{ marginTop: 10 }}>Low Rated Partners:</Text>
          {adminStats.lowPartners.map(p => (
            <Text key={p}>• {p}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f5f5' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  navItem: { fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  row: { flexDirection: 'row', marginBottom: 12 },
  emojiBtn: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  emojiActive: { backgroundColor: '#dbeafe' },
  emoji: { fontSize: 24 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  review: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  reply: { fontStyle: 'italic', marginTop: 4 },
});

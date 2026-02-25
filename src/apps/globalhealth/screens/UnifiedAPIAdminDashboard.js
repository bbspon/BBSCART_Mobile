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

export default function UnifiedAPIAdminDashboard({ partnerId } = {}) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('prompt');

  const [categories] = useState(STATIC_CATEGORIES);
  const [stats] = useState(STATIC_PARTNER_STATS);
  const [reviews] = useState(STATIC_REVIEWS);
  const [adminStats] = useState(STATIC_ADMIN_STATS);

  const [prompt, setPrompt] = useState({
    emoji: '',
    category: '',
    comment: '',
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

  /* ===== SUBMIT FEEDBACK (ONLY REAL API) ===== */
  const handleSubmitPrompt = async () => {
    if (!prompt.emoji) {
      Alert.alert('Validation', 'Please select a rating');
      return;
    }

    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = raw ? JSON.parse(raw)?.token : null;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const formData = new FormData();
      formData.append('type', prompt.emoji);
      formData.append(
        'rating',
        prompt.emoji === '😃' ? 5 : prompt.emoji === '😐' ? 3 : 1,
      );
      formData.append('message', prompt.comment || '');
      formData.append('category', prompt.category || '');
      formData.append('anonymous', prompt.anonymous);
      formData.append('partnerId', partnerId || '');

      if (prompt.image) {
        formData.append('image', {
          uri: prompt.image.uri,
          type: prompt.image.type,
          name: prompt.image.fileName,
        });
      }

      await axios.post(`${API_BASE_URL}/feedback/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Feedback submitted successfully');
      setStep('partnerProfile');
    } catch (err) {
      console.error('❌ Feedback submit failed', err);
      Alert.alert('Error', 'Failed to submit feedback');
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

          <View style={styles.row}>
            {['😃', '😐', '😠'].map(e => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiBtn,
                  prompt.emoji === e && styles.emojiActive,
                ]}
                onPress={() => setPrompt({ ...prompt, emoji: e })}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Category"
            style={styles.input}
            value={prompt.category}
            onChangeText={t => setPrompt({ ...prompt, category: t })}
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
  row: { flexDirection: 'row', marginBottom: 12 },
  emojiBtn: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  emojiActive: { backgroundColor: '#dbeafe' },
  emoji: { fontSize: 24 },
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

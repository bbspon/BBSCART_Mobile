// FeedbackScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [feedbackType, setFeedbackType] = useState('feedback');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Load user info if available
  React.useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user) {
            setName(parsed.user.name || '');
            setEmail(parsed.user.email || '');
          }
        }
      } catch (err) {
        console.log('Error loading user info:', err);
      }
    };
    loadUserInfo();
  }, []);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Validation', 'Please fill in your name, email, and feedback message.');
      return;
    }

    if (feedbackType === 'rating' && rating === 0) {
      Alert.alert('Validation', 'Please select a rating.');
      return;
    }

    // Show success popup
    Alert.alert(
      'Thank you!',
      feedbackType === 'rating' 
        ? 'Thank you for rating our app!' 
        : 'Thank you for your feedback. We appreciate it!',
      [
        {
          text: 'OK',
          onPress: () => {
            setMessage('');
            setRating(0);
          },
        },
      ]
    );
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.starsLabel}>Rate your experience:</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <MaterialCommunityIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFD700' : '#D1D5DB'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingText}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 24 + insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.heading}>
          {feedbackType === 'rating' ? 'Rate Our App' : 'Send Feedback'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <Text style={styles.subText}>
        {feedbackType === 'rating'
          ? 'We value your opinion! Please rate your experience with our app.'
          : 'We love hearing from you! Share your thoughts, suggestions, or report any issues.'}
      </Text>

      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, feedbackType === 'feedback' && styles.typeButtonActive]}
          onPress={() => {
            setFeedbackType('feedback');
            setRating(0);
          }}
        >
          <Text style={[styles.typeButtonText, feedbackType === 'feedback' && styles.typeButtonTextActive]}>
            Send Feedback
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, feedbackType === 'rating' && styles.typeButtonActive]}
          onPress={() => {
            setFeedbackType('rating');
            setMessage('');
          }}
        >
          <Text style={[styles.typeButtonText, feedbackType === 'rating' && styles.typeButtonTextActive]}>
            Rate App
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {feedbackType === 'rating' && renderStars()}

        <TextInput
          placeholder="Your Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Your Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {feedbackType === 'feedback' && (
          <TextInput
            placeholder="Your Feedback / Suggestions"
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        )}

        {feedbackType === 'rating' && (
          <TextInput
            placeholder="Additional comments (optional)"
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {feedbackType === 'rating'
              ? 'Submit Rating'
              : 'Send Feedback'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#2563EB" />
        <Text style={styles.infoText}>
          Your feedback helps us improve the app experience for everyone.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 20,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: '#2563EB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  starsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  starsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: '#1E40AF',
    fontSize: 13,
    lineHeight: 18,
  },
});

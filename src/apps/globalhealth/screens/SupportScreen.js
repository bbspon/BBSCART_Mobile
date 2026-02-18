import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Must be SAME base URL used in web (VITE_API_URI)

const SupportPage = () => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('Billing Issue');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the issue.');
      return;
    }

    try {
      setSubmitting(true);

      // Token is optional, but added for consistency
      const raw = await AsyncStorage.getItem('bbsUser');
      const token = raw ? JSON.parse(raw).token : null;

      await axios.post(
        `${API_BASE_URL}/support/raise`,
        {
          issueCategory: category,
          issueDescription: description,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      Alert.alert('✅ Ticket Raised', 'Your support ticket was submitted.');
      setDescription('');
    } catch (err) {
      console.error('❌ Failed to raise ticket:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit. Try again later.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>🆘 Support & Escalations</Text>

      <View style={styles.card}>
        {/* Issue Category */}
        <Text style={styles.label}>Issue Category</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={category}
            onValueChange={value => setCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Billing Issue" value="Billing Issue" />
            <Picker.Item label="Tech Support" value="Tech Support" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Issue Description */}
        <Text style={styles.label}>Describe the issue</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter issue details..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Submitting...' : 'Raise Ticket'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SupportPage;

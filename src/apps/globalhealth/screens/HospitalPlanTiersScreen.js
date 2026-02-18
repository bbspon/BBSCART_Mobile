import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Must be SAME base URL used in web

const HospitalPlanTiers = () => {
  const [planName, setPlanName] = useState('');
  const [coverageDetails, setCoverageDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!planName || !coverageDetails) {
      Alert.alert('Error', 'Please fill in all fields before saving.');
      return;
    }

    try {
      setSaving(true);

      const raw = await AsyncStorage.getItem('bbsUser');
      const token = raw ? JSON.parse(raw).token : null;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again.');
        return;
      }

      const payload = {
        planName,
        coverageDetails,
      };

      // ✅ FIXED: same endpoint as WEB
      await axios.post(
        `${API_BASE_URL}/hospital/plan-tiers`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('✅ Success', `Plan "${planName}" saved successfully!`);

      setPlanName('');
      setCoverageDetails('');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save plan';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛠 Create Custom Plan Tier</Text>

      <Text style={styles.label}>Plan Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter plan name"
        value={planName}
        onChangeText={setPlanName}
      />

      <Text style={styles.label}>Coverage Details</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Enter coverage details"
        value={coverageDetails}
        onChangeText={setCoverageDetails}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>
          {saving ? 'Saving...' : 'Save Plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HospitalPlanTiers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

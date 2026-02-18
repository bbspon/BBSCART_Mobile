import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// IMPORTANT: use real API base
// Android Emulator: http://10.0.2.2:5000
// Physical device: http://YOUR_PC_IP:5000
// Production: https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const PlanEligibilityScreen = ({ navigation }) => {
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [planType, setPlanType] = useState('basic');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  const handleCheckEligibility = async () => {
    setError('');
    setResult(null);

    try {
      const token = await getToken();

      if (!token) {
        setError('❌ Please login again.');
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/plan/check-eligibility`,
        {
          age,
          city,
          planType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(
        '❌ ' + (err?.response?.data?.message || 'Something went wrong.'),
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Check Plan Eligibility</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result && (
        <Text
          style={[
            styles.result,
            { backgroundColor: result.eligible ? '#d1e7dd' : '#fff3cd' },
          ]}
        >
          {result.message}
        </Text>
      )}

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        placeholder="Enter age"
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter city"
      />

      <Text style={styles.label}>Plan Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={planType} onValueChange={setPlanType}>
          <Picker.Item label="Basic" value="basic" />
          <Picker.Item label="Prime" value="prime" />
          <Picker.Item label="Elite" value="elite" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCheckEligibility}>
        <Text style={styles.buttonText}>Check Eligibility</Text>
      </TouchableOpacity>

      {result?.eligible && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 You're eligible!</Text>
          <Text style={styles.cardText}>
            Next Step: Proceed to buy the plan
          </Text>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => navigation.navigate('BuyPlan')}
          >
            <Text style={styles.buttonText}>Buy a Plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PlanEligibilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0d6efd',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buyButton: {
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#842029',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  result: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    marginTop: 6,
    marginBottom: 10,
  },
});

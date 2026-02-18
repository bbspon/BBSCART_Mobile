import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const HomeVisitBooking = () => {
  const [serviceType, setServiceType] = useState('');
  const [slot, setSlot] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [userIdFromStorage, setUserIdFromStorage] = useState(null);

  /* ===== LOAD USER FROM ASYNC STORAGE ===== */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('bbsUser');
        const parsed = raw ? JSON.parse(raw) : null;
        setUserIdFromStorage(parsed?.user?.id);
      } catch (err) {
        console.log('❌ Failed to load user', err);
      }
    };
    fetchUser();
  }, []);

  /* ===== SUBMIT BOOKING ===== */
  const handleSubmit = async () => {
    if (!serviceType || !slot || !address) {
      setError('Please fill in all fields before proceeding.');
      return;
    }

    setError('');

    try {
      const payload = {
        serviceType,
        slot,
        address,
        userId: userIdFromStorage,
        paymentStatus: 'Paid',
      };

      const res = await axios.post(`${API_BASE_URL}/home-visits`, payload);

      console.log('✅ Booking successful', res.data);
      setSubmitted(true);
      setServiceType('');
      setSlot(new Date());
      setAddress('');
    } catch (err) {
      console.error('❌ Booking error', err);
      setError('Booking failed. Please try again.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setSlot(selectedDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏥 Book Home Doctor / Nurse Visit</Text>

      <Text style={styles.label}>Service Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={serviceType}
          onValueChange={value => setServiceType(value)}
        >
          <Picker.Item label="-- Select Service --" value="" />
          <Picker.Item label="General Physician" value="General Physician" />
          <Picker.Item label="Nurse (BP, injections)" value="Nurse" />
          <Picker.Item label="Physiotherapy" value="Physiotherapy" />
          <Picker.Item
            label="Post-discharge Monitoring"
            value="Post-discharge Monitoring"
          />
        </Picker>
      </View>

      <Text style={styles.label}>Select Time Slot</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text>{slot.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={slot}
          mode="datetime"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>Enter Your Address</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={3}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your address"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {submitted ? (
        <Text style={styles.success}>
          ✅ Booking Confirmed! Redirecting to payment...
        </Text>
      ) : null}

      <Button title="Confirm & Pay" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default HomeVisitBooking;

/* ===== STYLES UNCHANGED ===== */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  success: {
    color: 'green',
    marginVertical: 10,
  },
});

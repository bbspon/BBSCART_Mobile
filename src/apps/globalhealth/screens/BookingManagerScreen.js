import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Same base URL used in website (VITE_API_URI)

const BookingManagerScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bookingType: 'opd',
    providerName: '',
    dateTime: new Date(),
    patientName: '',
    sendWhatsapp: true,
  });

  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = async () => {
    if (!form.providerName || !form.patientName) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    const payload = {
      bookingType: form.bookingType,
      providerName: form.providerName,
      dateTime: form.dateTime.toISOString(),
      patientName: form.patientName,
      sendWhatsapp: form.sendWhatsapp,
    };

    try {
      setLoading(true);

      await axios.post(`${API_BASE_URL}/appointments`, payload);

      Alert.alert('Success', 'Appointment booked successfully');

      setForm({
        bookingType: 'opd',
        providerName: '',
        dateTime: new Date(),
        patientName: '',
        sendWhatsapp: true,
      });
    } catch (error) {
      console.error('Booking Error:', error);
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}>
      <Text style={styles.title}>📅 Book Appointment</Text>

      <Text style={styles.label}>Service Type</Text>
      <Picker
        selectedValue={form.bookingType}
        onValueChange={value => setForm({ ...form, bookingType: value })}
        style={styles.input}
      >
        <Picker.Item label="OPD" value="opd" />
        <Picker.Item label="Lab Test" value="lab" />
        <Picker.Item label="Scan" value="scan" />
        <Picker.Item label="Video Consultation" value="video" />
        <Picker.Item label="Home Collection" value="home" />
      </Picker>

      <Text style={styles.label}>Doctor / Provider</Text>
      <TextInput
        style={styles.input}
        value={form.providerName}
        onChangeText={value => setForm({ ...form, providerName: value })}
        placeholder="Dr. Rajesh Sharma"
      />

      <Text style={styles.label}>Date & Time</Text>
      <Button
        title={form.dateTime.toLocaleString()}
        onPress={() => setShowPicker(true)}
      />

      {showPicker && (
        <DateTimePicker
          value={form.dateTime}
          mode="datetime"
          display="default"
          onChange={(e, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setForm({ ...form, dateTime: selectedDate });
            }
          }}
        />
      )}

      <Text style={styles.label}>Patient Name</Text>
      <TextInput
        style={styles.input}
        value={form.patientName}
        onChangeText={value => setForm({ ...form, patientName: value })}
        placeholder="Enter full name"
      />

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" />
        ) : (
          <Button
            title="Book Appointment"
            onPress={handleSubmit}
            color="#28a745"
          />
        )}
      </View>
    </ScrollView>
  );
};

export default BookingManagerScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
  },
});

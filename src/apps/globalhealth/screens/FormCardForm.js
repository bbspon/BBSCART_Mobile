import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

export default function FormCardForm() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    bloodGroup: '',
    volunteerdonor: 'Blood Donor',
    contactNumber: '',
    emergencyContact: '',
    allergies: '',
    email: '',
    companyName: '',
    licenseNumber: '',
    issueDate: null,
    expiryDate: null,
    languagesSpoken: '',
    issuingAuthority: '',
    customerServicePhone: '',
    customerServiceEmail: '',
    profileImgFile: null,
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  /* ---------------- IMAGE PICKER ---------------- */
  const handlePhotoChange = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.7 },
      response => {
        if (!response.didCancel && !response.errorCode) {
          setFormData(prev => ({
            ...prev,
            profileImgFile: response.assets[0],
          }));
        }
      },
    );
  };

  /* ---------------- DATE PICKERS ---------------- */
  const onIssueChange = (_, date) => {
    setShowIssuePicker(false);
    if (date) handleChange('issueDate', date);
  };

  const onExpiryChange = (_, date) => {
    setShowExpiryPicker(false);
    if (date) handleChange('expiryDate', date);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      const formToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'profileImgFile') {
          formToSend.append(
            key,
            formData[key] instanceof Date
              ? formData[key].toISOString()
              : formData[key] ?? '',
          );
        }
      });

      if (formData.profileImgFile) {
        formToSend.append('profileImg', {
          uri: formData.profileImgFile.uri,
          type: formData.profileImgFile.type,
          name: formData.profileImgFile.fileName || 'photo.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/beneficiary`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formToSend,
      });

      const res = await response.json();

      if (res.success) {
        Alert.alert('Success', 'Identity Card Info Updated Successfully', [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('CardScreen', {
                id: res.data._id,
              }),
          },
        ]);
      } else {
        Alert.alert('Error', res.error || 'Submission failed');
      }
    } catch (err) {
      console.error('❌ Form submit failed', err);
      Alert.alert('Error', 'Network or server error');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <View style={styles.card}>
        <Text style={styles.header}>BBS GLOBAL HEALTH ACCESS</Text>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri:
                formData.profileImgFile?.uri ||
                'https://via.placeholder.com/100',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePhotoChange}
          >
            <Text style={styles.photoButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {[
          ['Full Name', 'name'],
          ['Age', 'age'],
          ['Address', 'address'],
          ['Blood Group', 'bloodGroup'],
          ['Donor Type', 'volunteerdonor'],
          ['Email', 'email'],
          ['Contact Number', 'contactNumber'],
          ['Emergency Contact', 'emergencyContact'],
          ['Allergies', 'allergies'],
        ].map(([label, key]) => (
          <View style={styles.formGroup} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={formData[key]}
              onChangeText={text => handleChange(key, text)}
            />
          </View>
        ))}

        <Text style={styles.sectionHeader}>Hospital Information</Text>

        {[
          ['Hospital Name', 'companyName'],
          ['License Number', 'licenseNumber'],
          ['Languages Spoken', 'languagesSpoken'],
          ['Issuing Authority', 'issuingAuthority'],
          ['Customer Service Phone', 'customerServicePhone'],
          ['Customer Service Email', 'customerServiceEmail'],
        ].map(([label, key]) => (
          <View style={styles.formGroup} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={formData[key]}
              onChangeText={t => handleChange(key, t)}
            />
          </View>
        ))}

        {/* Issue Date */}
        <Text style={styles.label}>Issue Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowIssuePicker(true)}
        >
          <Text>
            {formData.issueDate
              ? new Date(formData.issueDate).toDateString()
              : 'Select date'}
          </Text>
        </TouchableOpacity>

        {showIssuePicker && (
          <DateTimePicker
            value={formData.issueDate || new Date()}
            mode="date"
            onChange={onIssueChange}
          />
        )}

        {/* Expiry Date */}
        <Text style={styles.label}>Expiry Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowExpiryPicker(true)}
        >
          <Text>
            {formData.expiryDate
              ? new Date(formData.expiryDate).toDateString()
              : 'Select date'}
          </Text>
        </TouchableOpacity>

        {showExpiryPicker && (
          <DateTimePicker
            value={formData.expiryDate || new Date()}
            mode="date"
            onChange={onExpiryChange}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Update Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 18,
    borderRadius: 18,
    elevation: 6,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: 16,
  },
  profileContainer: { alignItems: 'center', marginBottom: 24 },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#0dcaf0',
  },
  photoButton: {
    marginTop: 12,
    backgroundColor: '#0dcaf0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  photoButtonText: { color: '#ffffff', fontWeight: '600' },
  formGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    marginVertical: 16,
    color: '#1e40af',
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: '#0dcaf0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
});

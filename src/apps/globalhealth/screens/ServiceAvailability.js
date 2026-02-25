import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// Must be SAME as web VITE_API_URI

const ServiceAvailability = ({ userRole = 'staff' }) => {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
      const token = raw ? JSON.parse(raw).token : null;

      const res = await axios.get(`${API_BASE_URL}/service-availability`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setServices(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching service availability:', err);
      Alert.alert('Error', 'Failed to load service availability');
    }
  };

  const handleEdit = dept => {
    if (userRole === 'admin') {
      Alert.alert('Edit Service', `Editing availability for ${dept}`);
    } else {
      Alert.alert(
        'Access Denied',
        'Only admin users can edit service availability.',
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.heading}>🕒 Manage Service Availability</Text>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText]}>Department</Text>
        <Text style={[styles.cell, styles.headerText]}>Days Available</Text>
        <Text style={[styles.cell, styles.headerText]}>Time Slot</Text>
        <Text style={[styles.cell, styles.headerText]}>Action</Text>
      </View>

      {/* Table Rows */}
      {services.map((item, index) => (
        <View style={styles.row} key={index}>
          <Text style={styles.cell}>{item.department}</Text>
          <Text style={styles.cell}>{item.daysAvailable}</Text>
          <Text style={styles.cell}>{item.timeSlot}</Text>

          {userRole === 'admin' ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleEdit(item.department)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.cell, { color: 'gray', fontSize: 12 }]}>
              No Access
            </Text>
          )}
        </View>
      ))}
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'center',
    margin: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ServiceAvailability;

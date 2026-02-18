import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const WellnessTrackerScreen = () => {
  const insets = useSafeAreaInsets();
  const [log, setLog] = useState({
    steps: '',
    sleepHours: '',
    waterLitres: '',
  });
  const [logs, setLogs] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  // normalize API response (same as web)
  const toArray = data => (Array.isArray(data) ? data : data?.logs || []);

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('bbsUser');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // ----------------------------------
  // FETCH RECENT LOGS
  // ----------------------------------
  const fetchLogs = async () => {
    try {
      const token = await getToken();

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/wellness/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(toArray(res.data));
    } catch (err) {
      console.error(
        '❌ Fetch recent wellness logs failed',
        err?.response?.data || err,
      );
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (name, value) => {
    setLog(prev => ({ ...prev, [name]: value }));
  };

  // ----------------------------------
  // SAVE TODAY LOG
  // ----------------------------------
  const handleSubmit = async () => {
    try {
      const token = await getToken();

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/wellness/log`,
        {
          ...log,
          date: today,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // refresh list after save
      fetchLogs();

      // reset form
      setLog({
        steps: '',
        sleepHours: '',
        waterLitres: '',
      });
    } catch (err) {
      console.error('❌ Save wellness log failed', err?.response?.data || err);
      Alert.alert('Error', 'Failed to save wellness data');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.steps}</Text>
      <Text style={styles.cell}>{item.sleepHours} hrs</Text>
      <Text style={styles.cell}>{item.waterLitres} L</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellness Tracker</Text>

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={today} editable={false} />

      <Text style={styles.label}>Steps</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={log.steps}
        onChangeText={v => handleChange('steps', v)}
        placeholder="e.g., 8000"
      />

      <Text style={styles.label}>Sleep (hours)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={log.sleepHours}
        onChangeText={v => handleChange('sleepHours', v)}
        placeholder="e.g., 7.5"
      />

      <Text style={styles.label}>Water (L)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={log.waterLitres}
        onChangeText={v => handleChange('waterLitres', v)}
        placeholder="e.g., 2.5"
      />

      <View style={styles.button}>
        <Button title="Save" onPress={handleSubmit} />
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Date</Text>
        <Text style={styles.headerCell}>Steps</Text>
        <Text style={styles.headerCell}>Sleep</Text>
        <Text style={styles.headerCell}>Water</Text>
      </View>

      {logs.length > 0 ? (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => item._id || `${item.date}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
        />
      ) : (
        <Text style={styles.empty}>No data found</Text>
      )}
    </View>
  );
};

export default WellnessTrackerScreen;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginTop: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  button: {
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  cell: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

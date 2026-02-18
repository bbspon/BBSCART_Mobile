import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerformanceScoringDashboard() {
  const insets = useSafeAreaInsets();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareHospitals, setCompareHospitals] = useState([]);
  const [userSymptoms, setUserSymptoms] = useState('');
  const [doctorList, setDoctorList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPerformanceScores();
  }, []);
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

  const fetchPerformanceScores = async () => {
    try {
      const raw = await AsyncStorage.getItem('bbsUser');
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.token;

      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/performance-scores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data || [];

      const doctors = data.filter(item => item.role === 'doctor');
      const hospitals = data.filter(item => item.role === 'hospital');

      setDoctorList(doctors);
      setHospitalList(hospitals);
      setSearchResults(doctors);
    } catch (err) {
      console.error('❌ Failed to load performance data', err);
      Alert.alert('Error', 'Failed to load performance data');
    }
  };

  const handleSymptomSearch = () => {
    const keywords = userSymptoms.toLowerCase().split(' ');
    const filtered = doctorList.filter(doc =>
      keywords.some(kw => doc.specialty?.toLowerCase().includes(kw)),
    );
    setSearchResults(filtered.length ? filtered : doctorList);
  };

  const toggleCompareHospital = hospital => {
    if (compareHospitals.some(h => h._id === hospital._id)) {
      setCompareHospitals(compareHospitals.filter(h => h._id !== hospital._id));
    } else {
      setCompareHospitals([...compareHospitals, hospital].slice(0, 3));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>
        Hospital & Doctor Performance Scoring Engine
      </Text>

      {/* Symptom Input */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter your symptoms or care need"
          value={userSymptoms}
          onChangeText={setUserSymptoms}
        />
        <Button title="Find Best Doctors" onPress={handleSymptomSearch} />
      </View>

      {/* Doctor Matches */}
      <Text style={styles.subtitle}>Doctor Matches</Text>
      {searchResults.length === 0 ? (
        <Text>No doctor matches found.</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.specialty}</Text>
              <Text>Rating: {item.rating} ⭐</Text>
              <Text>Empathy Score: {item.empathyScore}</Text>
              <Text>Timeliness: {item.consultationTimeliness}</Text>
              <Text>Outcome Score: {item.outcomeScore}</Text>
              <Button
                title="View Details"
                onPress={() => {
                  setSelectedDoctor(item);
                  setShowDoctorModal(true);
                }}
              />
            </View>
          )}
        />
      )}

      {/* Doctor Detail Modal */}
      <Modal visible={showDoctorModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDoctor?.name} - Performance Details
            </Text>
            {selectedDoctor && (
              <ScrollView>
                <Text>Specialty: {selectedDoctor.specialty}</Text>
                <Text>Rating: {selectedDoctor.rating} ⭐</Text>
                <Text>Empathy: {selectedDoctor.empathyScore}</Text>
                <Text>Timeliness: {selectedDoctor.consultationTimeliness}</Text>
                <Text>
                  Prescription Accuracy: {selectedDoctor.prescriptionAccuracy}%
                </Text>
                <Text>Outcome: {selectedDoctor.outcomeScore}</Text>
                <Text>Follow-Up: {selectedDoctor.followUpCompliance}%</Text>
                <Text>
                  Communication: {selectedDoctor.communicationClarity}
                </Text>
              </ScrollView>
            )}
            <Button title="Close" onPress={() => setShowDoctorModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Hospitals */}
      <Text style={styles.subtitle}>Hospitals & Facilities</Text>
      {hospitalList.map(hosp => (
        <View key={hosp._id} style={styles.card}>
          <Text style={styles.cardTitle}>{hosp.name}</Text>
          <Text>Bed Availability: {hosp.bedAvailability}%</Text>
          <Text>Hygiene: {hosp.hygieneRating} ⭐</Text>
          <Text>Equipment: {hosp.equipmentReadiness}%</Text>
          <Text>Staff: {hosp.staffBehavior} ⭐</Text>
          <Text>Queue: {hosp.queueManagement}</Text>
          <Text>Billing: {hosp.billingTransparency}</Text>
          <Text>Response Time: {hosp.emergencyResponseTime}</Text>
          <Text>Safety: {hosp.patientSafetyIndex}%</Text>
          <Button
            title={
              compareHospitals.some(h => h._id === hosp._id)
                ? 'Deselect for Compare'
                : 'Select for Compare'
            }
            onPress={() => toggleCompareHospital(hosp)}
          />
        </View>
      ))}

      <Button
        title="Compare Selected Hospitals"
        onPress={() => setShowCompareModal(true)}
        disabled={compareHospitals.length < 2}
      />

      {/* Comparison Modal */}
      <Modal visible={showCompareModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Hospital Comparison</Text>
            <ScrollView horizontal>
              <View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                    Metric
                  </Text>
                  {compareHospitals.map(h => (
                    <Text key={h._id} style={styles.tableCell}>
                      {h.name}
                    </Text>
                  ))}
                </View>
                {[
                  'bedAvailability',
                  'hygieneRating',
                  'equipmentReadiness',
                  'staffBehavior',
                  'queueManagement',
                  'billingTransparency',
                  'emergencyResponseTime',
                  'patientSafetyIndex',
                ].map(metric => (
                  <View key={metric} style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {metric.replace(/([A-Z])/g, ' $1')}
                    </Text>
                    {compareHospitals.map(h => (
                      <Text key={h._id} style={styles.tableCell}>
                        {h[metric]}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
            <Button title="Close" onPress={() => setShowCompareModal(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0d6efd',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: '#6c757d', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tableRow: { flexDirection: 'row', marginBottom: 4 },
  tableCell: {
    minWidth: 100,
    padding: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
    textAlign: 'center',
  },
});

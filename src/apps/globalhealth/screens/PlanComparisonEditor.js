import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Picker } from '@react-native-picker/picker';

const defaultPlans = ['Basic', 'Prime', 'Elite'];
const defaultFeatures = ['OPD Visits', 'Lab Tests', 'Surgery Coverage'];

const initialTable = defaultFeatures.map((feature, i) => ({
  id: `feature-${i}`,
  title: feature,
  values: defaultPlans.map(() => '✅'),
}));

// SAME hospitalId as web
const hospitalId = '64ffabc0123abc456789de01';

// 🔴 IMPORTANT: use real API base (not process.env in RN)
const API_BASE_URL = 'https://healthcare.bbscart.com/api';
// OR: http://YOUR_PC_IP:5000
// OR: https://api.yourdomain.com

const PlanComparisonEditor = () => {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState(defaultPlans);
  const [rows, setRows] = useState(initialTable);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');

  // ----------------------------------
  // LOAD COMPARISON TABLE (API)
  // ----------------------------------
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/plancomparison/${hospitalId}`)
      .then(res => {
        if (res.data) {
          setPlans(res.data.plans || defaultPlans);
          setRows(
            (res.data.rows || initialTable).map((r, i) => ({
              ...r,
              id: r.id || `feature-${i}`,
            })),
          );
        }
      })
      .catch(err => {
        console.error('❌ Failed to load plan comparison', err);
        Alert.alert('Error', 'Failed to load comparison table');
      });
  }, []);

  /* ---------- ADD PLAN ---------- */
  const addPlan = () => {
    if (!newPlanName.trim()) return;

    setPlans([...plans, newPlanName.trim()]);
    setRows(
      rows.map(row => ({
        ...row,
        values: [...row.values, '❌'],
      })),
    );

    setNewPlanName('');
    setShowPlanModal(false);
  };

  /* ---------- ADD FEATURE ---------- */
  const addFeature = () => {
    if (!newFeatureName.trim()) return;

    setRows([
      ...rows,
      {
        id: `feature-${rows.length}`,
        title: newFeatureName.trim(),
        values: plans.map(() => '❌'),
      },
    ]);

    setNewFeatureName('');
    setShowFeatureModal(false);
  };

  /* ---------- CELL UPDATE ---------- */
  const updateCell = (rowIndex, planIndex, value) => {
    const updated = [...rows];
    updated[rowIndex].values[planIndex] = value;
    setRows(updated);
  };

  /* ---------- SAVE TABLE (API) ---------- */
  const saveTable = () => {
    axios
      .post(`${API_BASE_URL}/plancomparison`, {
        hospitalId,
        plans,
        rows,
      })
      .then(() => Alert.alert('Success', 'Table saved'))
      .catch(err => {
        console.error('❌ Save failed', err);
        Alert.alert('Error', 'Save failed');
      });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>📊 Plan Comparison Editor</Text>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowPlanModal(true)}
        >
          <Text style={styles.btnText}>➕ Add Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => setShowFeatureModal(true)}
        >
          <Text style={styles.btnText}>➕ Add Feature</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={saveTable}>
          <Text style={styles.outlineText}>💾 Save</Text>
        </TouchableOpacity>
      </View>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Feature</Text>
        {plans.map((p, i) => (
          <Text key={i} style={styles.headerCell}>
            {p}
          </Text>
        ))}
      </View>

      {/* DRAGGABLE LIST */}
      <DraggableFlatList
        data={rows}
        keyExtractor={item => item.id}
        onDragEnd={({ data }) => setRows(data)}
        renderItem={({ item, drag, index }) => (
          <TouchableOpacity onLongPress={drag} style={styles.row}>
            <Text style={[styles.cell, { flex: 2, fontWeight: '600' }]}>
              {item.title}
            </Text>

            {item.values.map((val, pIdx) => (
              <View key={pIdx} style={styles.cell}>
                <Picker
                  selectedValue={val}
                  onValueChange={v => updateCell(index, pIdx, v)}
                >
                  <Picker.Item label="✅ Yes" value="✅" />
                  <Picker.Item label="❌ No" value="❌" />
                  <Picker.Item label="ℹ️ Info" value="ℹ️" />
                </Picker>
              </View>
            ))}
          </TouchableOpacity>
        )}
      />

      {/* ADD PLAN MODAL */}
      <Modal transparent visible={showPlanModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Plan</Text>
            <TextInput
              placeholder="Plan name"
              value={newPlanName}
              onChangeText={setNewPlanName}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowPlanModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={addPlan}>
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD FEATURE MODAL */}
      <Modal transparent visible={showFeatureModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Feature</Text>
            <TextInput
              placeholder="Feature name"
              value={newFeatureName}
              onChangeText={setNewFeatureName}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowFeatureModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.successBtn} onPress={addFeature}>
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PlanComparisonEditor;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f9fa', padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#0d6efd', padding: 10, borderRadius: 6 },
  successBtn: { backgroundColor: '#198754', padding: 10, borderRadius: 6 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 6,
  },
  btnText: { color: '#fff', fontWeight: '600' },
  outlineText: { fontWeight: '600' },
  headerRow: { flexDirection: 'row', backgroundColor: '#222', padding: 8 },
  headerCell: {
    flex: 1,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 6,
    padding: 8,
  },
  cell: { flex: 1, justifyContent: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10 },
});

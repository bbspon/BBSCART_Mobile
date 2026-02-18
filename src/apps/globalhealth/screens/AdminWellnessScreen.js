// Filename: AdminWellnessDashboard.js (React Native)

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const initialUsers = [
  { name: 'Aarav', steps: 9000, credits: 120, tier: 'Gold' },
  { name: 'Fatima', steps: 5200, credits: 60, tier: 'Silver' },
];

const initialRewards = [
  { id: 1, name: '10% OPD Discount', credits: 100 },
  { id: 2, name: 'Amazon ₹100 Card', credits: 200 },
];

export default function AdminWellnessDashboard() {
  const insets = useSafeAreaInsets();
  const [users] = useState(initialUsers);
  const [rewards, setRewards] = useState(initialRewards);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCredits, setNewRewardCredits] = useState('');
  const [tiersModalVisible, setTiersModalVisible] = useState(false);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);

  const handleAddReward = () => {
    if (!newRewardName.trim() || isNaN(newRewardCredits)) {
      Alert.alert('Validation', 'Enter valid reward name and credit value');
      return;
    }
    const newReward = {
      id: Date.now(),
      name: newRewardName,
      credits: parseInt(newRewardCredits),
    };
    setRewards([...rewards, newReward]);
    setNewRewardName('');
    setNewRewardCredits('');
  };

  const handleRemoveReward = (id) => {
    setRewards(rewards.filter((r) => r.id !== id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      <Text style={styles.header}>🏥 Admin Wellness Credits Dashboard</Text>

      {/* User Leaderboard */}
      <Text style={styles.subHeader}>User Leaderboard</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name} - {item.steps} steps - {item.credits} credits ({item.tier})</Text>
          </View>
        )}
      />

      {/* Reward Catalog */}
      <Text style={styles.subHeader}>🎁 Reward Catalog</Text>
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name} - {item.credits} credits</Text>
            <TouchableOpacity onPress={() => handleRemoveReward(item.id)}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.subHeader}>Add New Reward</Text>
      <TextInput
        placeholder="Reward Name"
        style={styles.input}
        value={newRewardName}
        onChangeText={setNewRewardName}
      />
      <TextInput
        placeholder="Credits"
        style={styles.input}
        value={newRewardCredits}
        onChangeText={setNewRewardCredits}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addBtn} onPress={handleAddReward}>
        <Text style={styles.btnText}>Add Reward</Text>
      </TouchableOpacity>

      {/* Admin Actions */}
      <Text style={styles.subHeader}>⚙️ Admin Actions</Text>
      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Export', 'Exporting Logs...')}>
        <Text style={styles.btnText}>📤 Export Logs</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => setTiersModalVisible(true)}>
        <Text style={styles.btnText}>🛠 Manage Tiers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => setChallengeModalVisible(true)}>
        <Text style={styles.btnText}>🚀 Launch New Challenge</Text>
      </TouchableOpacity>

      {/* Tiers Modal */}
      <Modal visible={tiersModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>🛠 Manage Tiers</Text>
          <Text>Bronze: 0–99 (Fixed)</Text>
          <TextInput placeholder="Silver Threshold" keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Gold Threshold" keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Platinum Threshold" keyboardType="numeric" style={styles.input} />
          <TouchableOpacity style={styles.addBtn} onPress={() => setTiersModalVisible(false)}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Challenge Modal */}
      <Modal visible={challengeModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>🚀 Launch New Challenge</Text>
          <TextInput placeholder="Challenge Name" style={styles.input} />
          <TextInput placeholder="Credit Bonus" keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Start Date" style={styles.input} />
          <TextInput placeholder="End Date" style={styles.input} />
          <TouchableOpacity style={styles.addBtn} onPress={() => setChallengeModalVisible(false)}>
            <Text style={styles.btnText}>Launch</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  listItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 10, borderRadius: 6 },
  addBtn: { backgroundColor: '#007bff', padding: 12, marginTop: 10, borderRadius: 6 },
  removeBtn: { color: 'red', marginTop: 5 },
  actionBtn: { backgroundColor: '#28a745', padding: 12, marginTop: 10, borderRadius: 6 },
  btnText: { color: '#fff', textAlign: 'center' },
  modalContainer: { padding: 20, flex: 1, justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

// Android Emulator → http://10.0.2.2:5000
// Physical Device → http://YOUR_PC_IP:5000
// Production → https://api.yourdomain.com
const API_BASE_URL = 'https://healthcare.bbscart.com/api';

const FamilyMembersPage = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { planId } = route.params || {};

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    relationship: '',
    idProofUrl: '',
  });

  const getToken = async () => {
    const raw = await AsyncStorage.getItem('UNIFIED_AUTH');
    return raw ? JSON.parse(raw)?.token : null;
  };

  // ---------------------------
  // FETCH FAMILY MEMBERS
  // ---------------------------
  const fetchMembers = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/user-plan/${planId}/family`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMembers(res.data?.data || []);
    } catch (err) {
      console.error('❌ Fetch family members failed', err);
      Alert.alert('Error', 'Failed to load family members');
    }
  };

  // ---------------------------
  // ADD FAMILY MEMBER
  // ---------------------------
  const addMember = async () => {
    if (!form.name || !form.age || !form.gender || !form.relationship) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Auth Error', 'Please login again');
        return;
      }

      await axios.post(`${API_BASE_URL}/user-plan/${planId}/family`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setForm({
        name: '',
        age: '',
        gender: '',
        relationship: '',
        idProofUrl: '',
      });

      fetchMembers();
      Alert.alert('Success', 'Family member added');
    } catch (err) {
      console.error('❌ Add family member failed', err);
      Alert.alert('Error', 'Failed to add family member');
    }
  };

  useEffect(() => {
    if (planId) fetchMembers();
  }, [planId]);

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <Text style={styles.memberName}>{item.name}</Text>
      <Text>Age: {item.age}</Text>
      <Text>Gender: {item.gender}</Text>
      <Text>Relation: {item.relationship}</Text>

      {item.idProofUrl ? (
        <TouchableOpacity onPress={() => Linking.openURL(item.idProofUrl)}>
          <Text style={styles.link}>View ID Proof</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noId}>No ID Proof</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      <Text style={styles.title}>👨‍👩‍👧 Add Family Members</Text>

      {/* Form */}
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={v => setForm({ ...form, name: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          value={form.age}
          onChangeText={v => setForm({ ...form, age: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Gender (Male/Female/Other)"
          value={form.gender}
          onChangeText={v => setForm({ ...form, gender: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Relationship"
          value={form.relationship}
          onChangeText={v => setForm({ ...form, relationship: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="ID Proof URL (optional)"
          value={form.idProofUrl}
          onChangeText={v => setForm({ ...form, idProofUrl: v })}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addMember}>
          <Text style={styles.btnText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <Text style={styles.subTitle}>Family Members</Text>

      <FlatList
        data={members}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMember}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No family members added</Text>
        }
      />
    </ScrollView>
  );
};

export default FamilyMembersPage;

// STYLES — UNCHANGED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addBtn: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  link: {
    color: '#0d6efd',
    marginTop: 4,
    fontWeight: '600',
  },
  noId: {
    color: '#6c757d',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
  },
});

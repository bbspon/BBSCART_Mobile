// ProfileSettingsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  FlatList,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://bbscart.com/api';

// ---------------- Helper ----------------
const extractPhone = (data) => {
  return (
    data?.phone ||
    data?.details?.phone ||
    data?.user?.phone ||
    ''
  );
};

// ---------------- Component ---------------- 
const ProfileSettingsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();
    const [isMounted, setIsMounted] = React.useState(false);

    // Ensure component is fully mounted before rendering content
    React.useEffect(() => {
      // Small delay to ensure screen is fully mounted and navigation is ready
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 50);
      return () => clearTimeout(timer);
    }, []);

    // Safe navigation handler
    const handleNavigate = React.useCallback((screenName) => {
      try {
        if (navigation && navigation.navigate) {
          navigation.navigate(screenName);
        }
      } catch (error) {
        console.warn(`Navigation error to ${screenName}:`, error);
      }
    }, [navigation]);
  
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [theme, setTheme] = useState('light');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    tier: '',
    profilePic: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // ---------------- Load profile ----------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (!stored) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed?.token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${parsed.token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load profile');
        }

        setProfile({
          name: data?.name || '',
          email: data?.email || '',
          phone: extractPhone(data),
          tier: data?.tier || 'Gold',
          profilePic: data?.profilePic || '',
        });

        // Optional future use
        setAddresses(data?.addresses || []);
        setPaymentMethods(data?.paymentMethods || []);

        // Sync local storage (same as web)
        parsed.user = data;
        parsed.phone = extractPhone(data);
        await AsyncStorage.setItem('auth_user', JSON.stringify(parsed));
      } catch (err) {
        console.log('Profile load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ---------------- Actions ----------------
  const toggleNotification = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const stored = await AsyncStorage.getItem('auth_user');
      if (!stored) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const parsed = JSON.parse(stored);

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${parsed.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Profile update failed');
      }

      // Update local state
      setProfile(p => ({
        ...p,
        name: data.name || p.name,
        email: data.email || p.email,
        phone: extractPhone(data),
      }));

      // Update AsyncStorage
      parsed.user = data;
      parsed.phone = extractPhone(data);
      await AsyncStorage.setItem('auth_user', JSON.stringify(parsed));

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');

    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all AsyncStorage items
              await AsyncStorage.multiRemove([
                "auth_user",
                "deliveryPincode",
                "assignedStore",
              ]);

              // Clear local state
              setProfile({
                name: "",
                email: "",
                phone: "",
                tier: "",
                profilePic: "",
              });

              // Use AuthContext to logout (this will trigger RootNavigator to switch to AuthStack)
              logout();

              Alert.alert("Success", "You have been logged out successfully");
            } catch (err) {
              console.log("Logout error:", err);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem("auth_user");
              if (!stored) {
                Alert.alert("Error", "User not logged in");
                return;
              }

              const parsed = JSON.parse(stored);
              const token = parsed?.token;

              if (!token) {
                Alert.alert("Error", "Authentication token not found");
                return;
              }

              // Call delete account API
              const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data?.message || "Failed to delete account");
              }

              // Clear all AsyncStorage items
              await AsyncStorage.multiRemove([
                "auth_user",
                "deliveryPincode",
                "assignedStore",
              ]);

              // Clear local state
              setProfile({
                name: "",
                email: "",
                phone: "",
                tier: "",
                profilePic: "",
              });

              // Use AuthContext to logout
              logout();

              Alert.alert(
                "Account Deleted",
                "Your account has been permanently deleted."
              );
            } catch (err) {
              console.log("Delete account error:", err);
              Alert.alert(
                "Error",
                err.message || "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () =>
    handleNavigate('ChangePassword');

  const handleBiometricLogin = () =>
    Alert.alert('Biometric Login', 'Setup biometric login triggered.');

  const handleAddAddress = () =>
    Alert.alert('Add Address', 'Add address screen triggered.');

  const handleAddPaymentMethod = () =>
    Alert.alert('Add Payment Method', 'Add payment method screen triggered.');

  const handleSupport = () =>
    Alert.alert('Support', 'Support screen triggered.');

  // ---------------- Render helpers ----------------
  const renderAddress = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.label}</Text>
      <Text style={styles.listDetails}>{item.details}</Text>
      <TouchableOpacity>
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.type}</Text>
      <Text style={styles.listDetails}>{item.details}</Text>
      <TouchableOpacity>
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading || !isMounted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + insets.bottom }}>
        {/* Header */}
        <View style={styles.header}>
          {profile.profilePic ? (
            <Image source={{ uri: profile.profilePic }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.tier}>{profile.tier} Tier</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                Edit Profile
              </Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                placeholder="Name"
                onChangeText={(text) => setProfile(p => ({ ...p, name: text }))}
              />
              <TextInput
                style={styles.input}
                value={profile.email}
                placeholder="Email"
                keyboardType="email-address"
                onChangeText={(text) => setProfile(p => ({ ...p, email: text }))}
              />
              <TextInput
                style={styles.input}
                value={profile.phone}
                placeholder="Phone"
                keyboardType="phone-pad"
                onChangeText={(text) => setProfile(p => ({ ...p, phone: text }))}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={{ fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <Text style={styles.infoText}>Email: {profile.email}</Text>
          <Text style={styles.infoText}>Phone: {profile.phone || 'Not added'}</Text>
        </View>

        {/* Addresses */}
        <Text style={styles.sectionTitle}>Addresses</Text>
        {Array.isArray(addresses) && addresses.length > 0 ? (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item, i) => `address-${i}`}
            scrollEnabled={false}
            listKey="addresses-list"
          />
        ) : (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No addresses added yet</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
          <Text style={styles.addText}>+ Add Address</Text>
        </TouchableOpacity>

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        {Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item, i) => `payment-${i}`}
            scrollEnabled={false}
            listKey="payments-list"
          />
        ) : (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No payment methods added yet</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleAddPaymentMethod} style={styles.addButton}>
          <Text style={styles.addText}>+ Add Payment Method</Text>
        </TouchableOpacity>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text>Push Notifications</Text>
            <Switch value={notifications.push} onValueChange={() => toggleNotification('push')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>Email Notifications</Text>
            <Switch value={notifications.email} onValueChange={() => toggleNotification('email')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>SMS Notifications</Text>
            <Switch value={notifications.sms} onValueChange={() => toggleNotification('sms')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>Dark Theme</Text>
            <Switch value={theme === 'dark'} onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </View>
        </View>

        {/* Security */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.section}>
          <TouchableOpacity onPress={handleChangePassword}>
            <Text style={styles.actionText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBiometricLogin}>
            <Text style={styles.actionText}>Setup Biometric Login</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity onPress={handleSupport}>
            <Text style={styles.actionText}>Help & FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate('ContactUs')}>
            <Text style={styles.actionText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate('Feedback')}>
            <Text style={styles.actionText}>Feedback / Rate App</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={[styles.actionText, { color: 'red' }]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={[styles.actionText, { color: 'red' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------- Styles (UNCHANGED) ----------------
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#ffd700', borderRadius: 10, margin: 10 },
  profilePic: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold' },
  tier: { fontSize: 14, marginBottom: 5 },
  editButton: { padding: 5, backgroundColor: '#fff', borderRadius: 5 },
  editText: { fontWeight: 'bold', color: '#000' },
  quickLinks: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 20 },
  section: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 15, elevation: 2 },
  infoText: { fontSize: 14, marginBottom: 5 },
  listContainer: { marginHorizontal: 10 },
  listItem: { backgroundColor: '#fff', padding: 15, marginVertical: 5, marginHorizontal: 10, borderRadius: 8, elevation: 1 },
  listLabel: { fontWeight: 'bold' },
  listDetails: { fontSize: 12, color: '#666', marginVertical: 3 },
  actionText: { color: '#007aff', marginTop: 5 },
  addButton: { padding: 15, marginHorizontal: 10, backgroundColor: '#e0f7fa', borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  addText: { fontWeight: 'bold', color: '#007aff' },
  emptyListContainer: { backgroundColor: '#fff', padding: 15, marginHorizontal: 10, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  emptyListText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginVertical: 5 },
  modalButton: { padding: 10, backgroundColor: '#e0f7fa', borderRadius: 5, width: 100, alignItems: 'center' },
});

export default ProfileSettingsScreen;

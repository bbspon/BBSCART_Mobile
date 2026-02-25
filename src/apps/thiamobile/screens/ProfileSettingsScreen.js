// ProfileSettingsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE = 'https://thiaworld.bbscart.com/api';

const ProfileSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, colors, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [tier, setTier] = useState('Gold Member');
  const [profilePic, setProfilePic] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [storeVisits, setStoreVisits] = useState([]);

  const [notifications, setNotifications] = useState({
    offers: true,
    newArrivals: true,
    goldRateAlerts: false,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);

  const NOTIFICATIONS_PREFERENCES_KEY = 'THIAWORLD_NOTIFICATION_PREFERENCES';

  /* ================= LOAD NOTIFICATION PREFERENCES ================= */

  const loadNotificationPreferences = useCallback(async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem(NOTIFICATIONS_PREFERENCES_KEY);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setNotifications({
          offers: parsed.offers !== undefined ? parsed.offers : true,
          newArrivals: parsed.newArrivals !== undefined ? parsed.newArrivals : true,
          goldRateAlerts: parsed.goldRateAlerts !== undefined ? parsed.goldRateAlerts : false,
        });
      }
    } catch (error) {
      console.log('Error loading notification preferences:', error);
    }
  }, []);

  const saveNotificationPreferences = useCallback(async (prefs) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.log('Error saving notification preferences:', error);
    }
  }, []);

  /* ================= LOAD USER ================= */

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
      const userStr = await AsyncStorage.getItem('THIAWORLD_USER');
      const cachedUser = userStr ? JSON.parse(userStr) : null;

      if (!token) {
        navigation.replace('SignIn');
        return;
      }

      // Load cached user first (fast UI)
      if (cachedUser) {
        setProfile({
          name: cachedUser.name || '',
          email: cachedUser.email || '',
          phone: cachedUser.phone || '',
        });
        setTier(cachedUser.tier || 'Gold Member');
      }

      // Refresh from DB
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.user || res.data?.data || res.data;

      const updatedUser = {
        name: data?.name || cachedUser?.name || '',
        email: data?.email || cachedUser?.email || '',
        phone: data?.phone || cachedUser?.phone || '',
        tier: data?.tier || cachedUser?.tier || 'Gold Member',
      };

      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
      setTier(updatedUser.tier);

      await AsyncStorage.setItem(
        'THIAWORLD_USER',
        JSON.stringify(updatedUser)
      );

      setLoading(false);
    } catch (err) {
      console.log('Profile load error', err);

      // ONLY redirect if token is invalid (401)
      if (err?.response?.status === 401) {
        console.log('Auth expired, staying on profile for now');
        setLoading(false);
      } else {
        // Network or server issue → stay on profile
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUser();
    loadNotificationPreferences(); // ✅ Load notification preferences on mount
  }, [loadNotificationPreferences]);

  // ✅ Reload profile when modal closes (only if it was just closed after save)
  const [justSaved, setJustSaved] = useState(false);
  
  useEffect(() => {
    if (!editModalVisible && justSaved) {
      // Modal just closed after save, reload profile to ensure UI is updated
      setJustSaved(false);
      loadUser();
    }
  }, [editModalVisible, justSaved]);

  // ✅ Reload preferences when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotificationPreferences();
    }, [loadNotificationPreferences])
  );

  /* ================= ACTIONS ================= */

  const toggleNotification = async (type) => {
    const updatedNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };
    
    // ✅ Update state immediately
    setNotifications(updatedNotifications);
    
    // ✅ Save to AsyncStorage
    await saveNotificationPreferences(updatedNotifications);
  };

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');

      if (!token) {
        Alert.alert('Session expired', 'Please login again');
        navigation.replace('SignIn');
        return;
      }

      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      console.log('📤 Updating profile with payload:', payload);

      const res = await axios.put(
        'https://thiaworld.bbscart.com/api/auth/me',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 Profile update response:', JSON.stringify(res.data, null, 2));

      // ✅ Handle different response structures
      const responseData = res.data?.user || res.data?.data || res.data;
      
      // ✅ Always use the values from the form (what user just edited) as primary source
      // API response is secondary (in case API returns updated data)
      const finalProfile = {
        name: responseData?.name ?? profile.name ?? '',
        email: responseData?.email ?? profile.email ?? '',
        phone: responseData?.phone ?? profile.phone ?? '',
        tier: responseData?.tier ?? tier ?? 'Gold Member',
      };

      console.log('✅ Updating state with:', finalProfile);

      // ✅ Update screen state IMMEDIATELY with the values we just saved
      setProfile({
        name: finalProfile.name,
        email: finalProfile.email,
        phone: finalProfile.phone,
      });
      setTier(finalProfile.tier);

      // ✅ Persist to storage
      await AsyncStorage.setItem(
        'THIAWORLD_USER',
        JSON.stringify(finalProfile)
      );

      // ✅ Mark that we just saved
      setJustSaved(true);
      
      // ✅ Close modal AFTER state update
      setEditModalVisible(false);
      
      // ✅ Show success message after a brief delay to ensure state update
      setTimeout(() => {
        Alert.alert('Success', 'Profile updated successfully');
      }, 100);
    } catch (err) {
      console.error('❌ Profile update error:', err?.response?.data || err.message || err);
      Alert.alert(
        'Update failed',
        err?.response?.data?.message || 'Unable to update profile. Please try again.'
      );
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('THIAWORLD_TOKEN');
    await AsyncStorage.removeItem('THIAWORLD_USER');
    navigation.replace('SignIn');

  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
              await axios.put(
                `${API_BASE}/auth/deactivate`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              await AsyncStorage.removeItem('UNIFIED_AUTH');
              navigation.replace('SignIn');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  /* ================= RENDERS ================= */

  const renderSavedDesign = ({ item }) => {
    const dynamicStyles = createStyles(colors, isDark);
    return (
      <View style={dynamicStyles.listItem}>
        <Text style={dynamicStyles.listLabel}>{item.label}</Text>
        <Text style={dynamicStyles.listDetails}>{item.details}</Text>
        <TouchableOpacity>
          <Text style={dynamicStyles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStoreVisit = ({ item }) => {
    const dynamicStyles = createStyles(colors, isDark);
    return (
      <View style={dynamicStyles.listItem}>
        <Text style={dynamicStyles.listLabel}>{item.label}</Text>
        <Text style={dynamicStyles.listDetails}>{item.details}</Text>
        <TouchableOpacity>
          <Text style={dynamicStyles.actionText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ✅ Create dynamic styles based on theme
  const dynamicStyles = createStyles(colors, isDark);

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + Math.max(12, insets.bottom) + 8 }}>

        {/* Header */}
        <View style={dynamicStyles.header}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={dynamicStyles.profilePic} />
          ) : (
            <View style={[dynamicStyles.profilePic, { backgroundColor: colors.primary }]} />
          )}
          <Text style={dynamicStyles.name}>{profile.name}</Text>
          <Text style={dynamicStyles.tier}>{tier}</Text>
          <TouchableOpacity style={dynamicStyles.editButton} onPress={() => setEditModalVisible(true)}>
            <Text style={dynamicStyles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalContent}>
              <Text style={[dynamicStyles.modalTitle, { color: colors.text }]}>
                Edit Profile
              </Text>

              <TextInput
                style={[dynamicStyles.input, { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                value={profile.name}
                onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[dynamicStyles.input, { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                value={profile.email}
                onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[dynamicStyles.input, { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                value={profile.phone}
                onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))}
                placeholder="Phone"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity style={dynamicStyles.modalButton} onPress={() => setEditModalVisible(false)}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.modalButton} onPress={handleSaveProfile}>
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Quick Links */}
        <View style={dynamicStyles.quickLinks}>
          <TouchableOpacity 
            style={[dynamicStyles.quickLinkItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={{ color: colors.text }}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.quickLinkItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={{ color: colors.text }}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.quickLinkItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Rewards')}
          >
            <Text style={{ color: colors.text }}>Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.quickLinkItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('GoldPlan')}
          >
            <Text style={{ color: colors.text }}>Gold Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.quickLinkItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('TryAtHome')}
          >
            <Text style={{ color: colors.text }}>Try@Home</Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <Text style={dynamicStyles.sectionTitle}>My Account</Text>
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.infoText}>Email: {profile.email}</Text>
          <Text style={dynamicStyles.infoText}>Phone: {profile.phone}</Text>
        </View>

        {/* Saved Designs */}
        <Text style={dynamicStyles.sectionTitle}>Saved Jewelry Collections</Text>
        <FlatList data={savedDesigns} renderItem={renderSavedDesign} keyExtractor={(i, k) => k.toString()} />

        {/* Store Visits */}
        <Text style={dynamicStyles.sectionTitle}>Recent Showroom Visits</Text>
        <FlatList data={storeVisits} renderItem={renderStoreVisit} keyExtractor={(i, k) => k.toString()} />

        {/* Preferences */}
        <Text style={dynamicStyles.sectionTitle}>Preferences</Text>
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.toggleRow}>
            <Text style={{ color: colors.text }}>Exclusive Offers</Text>
            <Switch 
              value={notifications.offers} 
              onValueChange={() => toggleNotification('offers')}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notifications.offers ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={dynamicStyles.toggleRow}>
            <Text style={{ color: colors.text }}>New Collection Launches</Text>
            <Switch 
              value={notifications.newArrivals} 
              onValueChange={() => toggleNotification('newArrivals')}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notifications.newArrivals ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={dynamicStyles.toggleRow}>
            <Text style={{ color: colors.text }}>Gold Rate Alerts</Text>
            <Switch 
              value={notifications.goldRateAlerts} 
              onValueChange={() => toggleNotification('goldRateAlerts')}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notifications.goldRateAlerts ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={dynamicStyles.toggleRow}>
            <Text style={{ color: colors.text }}>Dark Theme</Text>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDark ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Actions */}
        <Text style={dynamicStyles.sectionTitle}>Account Actions</Text>
        <View style={dynamicStyles.section}>
          {/* <TouchableOpacity onPress={handleLogout}>
            <Text style={[dynamicStyles.actionText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={[dynamicStyles.actionText, { color: colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

/* ================= STYLES ================= */

const { width } = Dimensions.get('window');

const createStyles = (colors, isDark) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: { 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: colors.secondary, 
    borderRadius: 10, 
    margin: 10 
  },
  profilePic: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginBottom: 10 
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: colors.text 
  },
  tier: { 
    fontSize: 14, 
    marginBottom: 5, 
    fontStyle: 'italic',
    color: colors.textSecondary 
  },
  editButton: { 
    padding: 5, 
    backgroundColor: colors.surface, 
    borderRadius: 5 
  },
  editText: { 
    fontWeight: 'bold', 
    color: colors.text 
  },
  quickLinks: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    marginVertical: 15 
  },
  quickLinkItem: { 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    width: width * 0.28, 
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 4,
    margin: 5 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 15, 
    marginTop: 20,
    color: colors.text 
  },
  section: { 
    backgroundColor: colors.card, 
    margin: 10, 
    borderRadius: 8, 
    padding: 15, 
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 4,
  },
  infoText: { 
    fontSize: 14, 
    marginBottom: 5,
    color: colors.text 
  },
  listItem: { 
    backgroundColor: colors.card, 
    padding: 15, 
    marginVertical: 5, 
    borderRadius: 8, 
    elevation: isDark ? 0 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 2,
  },
  listLabel: { 
    fontWeight: 'bold',
    color: colors.text 
  },
  listDetails: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    marginVertical: 3 
  },
  actionText: { 
    color: colors.primary, 
    marginTop: 5 
  },
  toggleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: colors.surface, 
    padding: 20, 
    borderRadius: 10, 
    width: '90%' 
  },
  modalTitle: {
    fontWeight: 'bold', 
    fontSize: 18, 
    marginBottom: 10 
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 5, 
    padding: 10, 
    marginVertical: 5 
  },
  modalButton: { 
    padding: 10, 
    backgroundColor: colors.secondary, 
    borderRadius: 5, 
    width: 100, 
    alignItems: 'center' 
  },
});

export default ProfileSettingsScreen;

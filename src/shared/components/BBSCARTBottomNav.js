import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// Export constant for bottom nav height (for padding calculations)
// Height = paddingTop (16) + icon (24) + text (12 + 4 marginTop) + paddingBottom (safe area) ≈ 80-90px
export const BOTTOM_NAV_HEIGHT = Platform.OS === 'android' && Platform.Version >= 29 ? 90 : 85;

const TrustItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.trustItem} onPress={onPress} activeOpacity={0.7}>
    <Icon name={icon} size={24} color="#fff" style={styles.trustIcon} />
    <Text style={styles.trustText}>{text}</Text>
  </TouchableOpacity>
);

const BBSCARTBottomNav = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = React.useState(false);

  // Ensure navigation is ready before rendering
  React.useEffect(() => {
    // Small delay to ensure navigation context is fully initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Use safe area bottom inset + extra padding above the system navigation bar
  const bottomPadding = Math.max(Platform.OS === 'android' ? 16 : 0, insets.bottom) + 12;

  // Safe navigation handler with error catching
  const handleNavigate = React.useCallback((screenName) => {
    try {
      if (navigation && navigation.navigate && isReady) {
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.warn(`Navigation error to ${screenName}:`, error);
    }
  }, [navigation, isReady]);

  if (!isReady) {
    return null; // Don't render until navigation is ready
  }

  return (
    <View style={[styles.trust, { paddingBottom: bottomPadding }]}>
      <TrustItem 
        icon="grid-outline" 
        text="Dashboard" 
        onPress={() => handleNavigate('Dashboard')} 
      />
      <TrustItem 
        icon="shield-checkmark-outline" 
        text="Secure Payments" 
        onPress={() => handleNavigate('Payments')} 
      />
      <TrustItem 
        icon="person-outline" 
        text="User Account" 
        onPress={() => handleNavigate('UserAccount')} 
      />
      <TrustItem 
        icon="settings-outline" 
        text="Profile Settings" 
        onPress={() => handleNavigate('ProfileSettings')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  trust: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    backgroundColor: '#1A1B1E', 
    paddingTop: 16, 
    borderTopWidth: 1,
    borderTopColor: '#2A2B2E',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  trustItem: { 
    alignItems: 'center', 
    paddingVertical: 4 
  },
  trustIcon: { 
    marginBottom: 2 
  },
  trustText: { 
    color: '#fff', 
    fontSize: 12, 
    marginTop: 4 
  },
});

export default BBSCARTBottomNav;

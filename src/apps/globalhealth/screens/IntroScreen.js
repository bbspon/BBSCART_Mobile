import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use require() for image to avoid import issues
const IntroImage = require('../assets/images/banner1.png');

const { height } = Dimensions.get('window');

const IntroScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: 40 + Math.max(12, insets.bottom) + 8 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <Image
        source={IntroImage}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.heading}>
        Your Health, Our Priority
      </Text>

      <Text style={styles.subText}>
        Book doctor appointments, track your medicines,{"\n"}
        get lab tests, and manage your health with ease.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.secondaryButtonText}>
          Already have an account? Log In
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },

  /* ✅ Responsive image */
  image: {
    width: '90%',
    height: height * 0.35,   // 35% of screen height
    maxHeight: 320,          // prevents oversized logo on tablets/web
    marginBottom: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1E3A8A',
  },

  subText: {
    fontSize: 15,
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 24,
    textAlign: 'center',
    color: '#374151',
  },

  button: {
    backgroundColor: '#34D399',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 5,
    marginTop: 10,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    marginTop: 20,
  },

  secondaryButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default IntroScreen;

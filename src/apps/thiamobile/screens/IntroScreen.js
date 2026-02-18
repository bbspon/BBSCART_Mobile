import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Use require for React Native image assets
const IntroImage = require('../assets/thiaworldlogo.png');

const IntroScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={IntroImage}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Jewellery Tagline */}
      <Text style={styles.heading}>
        Elegance, Crafted Just for You ✨
      </Text>
      <Text style={styles.subText}>
        Discover timeless gold, silver, and diamond collections.{"\n"} 
        From our artistry to your jewellery box.
      </Text>

      {/* Custom Styled Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Start Your Journey</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff8f0', // soft cream background for luxury feel
  },
  image: {
    width: 400,
    height: 350,
    marginBottom: 30,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#8B0000', // royal maroon
  },
  subText: {
    fontSize: 15,
    marginBottom: 40,
    paddingHorizontal: 40,
    textAlign: 'center',
    color: '#333',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#FFD700', // gold button
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default IntroScreen;

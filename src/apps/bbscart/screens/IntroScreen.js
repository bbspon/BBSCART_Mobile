import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import IntroImage from '../assets/images/bbscart-logo.png';
import { useNavigation } from '@react-navigation/native';
const IntroScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <Image
        source={IntroImage}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.heading}>
       From wishlist to doorstep.{"\n"}Shop easy, live better.
      </Text>
      <Text style={styles.subText}>
        Discover smart deals, delivered with care.
      </Text>

      {/* Custom Styled Button */}
   <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
  <Text style={styles.buttonText}>Get Started</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"#fff",
    marginBottom: 30,
    flex: 0.8,
  },
  image: {
    width: 550,   
    height: 450,
    marginBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    marginBottom: 40,
    paddingHorizontal: 55,
    textAlign: 'center',
  },
 button: {
  backgroundColor: '#FFD700',
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 50,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 20,
  ...(Platform.OS === 'web' && { cursor: 'pointer' }), // ← this is correct
},
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default IntroScreen;

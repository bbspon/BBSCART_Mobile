// ContactUsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE = 'https://bbscart.com/api';

export default function ContactUsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Validation', 'Please fill in your name, phone, email, and message.');
      return;
    }

    try {
      setSubmitting(true);

      // Send to backend API (matching website ContactPage.jsx)
   const response = await axios.post(`${API_BASE}/contact/send-message`, {
  name: name.trim(),
  email: email.trim(),
  message: message.trim(),
},
 {
        headers: { 'Content-Type': 'application/json' },
      });

      // Success response
      Alert.alert(
        'Message sent',
        'Thank you for contacting us. We will get back to you shortly.'
      );
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.log('Contact submit error:', err?.response?.data || err?.message || err);
      
      // Handle axios error response
      if (err.response) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Unable to submit your message. Please try again.';
        Alert.alert('Submission failed', errorMessage);
      } else if (err.request) {
        Alert.alert(
          'Network error',
          'Unable to connect to server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          err?.message || 'Something went wrong while sending your message. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.inner, { paddingBottom: 24 + insets.bottom }]}>
      {/* Header */}
      <Text style={styles.heading}>Get in Touch</Text>
      <Text style={styles.subText}>
        Need help? Reach out via phone, email, WhatsApp, or drop us a message!
      </Text>

      {/* Contact info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="phone" size={40} color="#4B5563" />
          <Text style={styles.cardTitle}>Phone Number</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('tel:+914134068916')}
          >
            +91 0413 291 5916
          </Text>
        </View>

        <View style={styles.infoCard}>
          <FontAwesome name="whatsapp" size={40} color="green" />
          <Text style={styles.cardTitle}>WhatsApp</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://wa.me/9600729596')}
          >
            +91 9600729596
          </Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="email" size={40} color="#2563EB" />
          <Text style={styles.cardTitle}>Email</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:info@bbscart.com')}
          >
            info@bbscart.com
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Entypo name="location-pin" size={40} color="red" />
          <Text style={styles.cardTitle}>Address</Text>
          <Text style={styles.address}>
          Floor, 1st, 7, 2nd Cross, Bharathy Street, Anna Nagar, Puducherry, 605005
          </Text>
        </View>
      </View>

      {/* Message Form */}
      <View style={styles.form}>
        <Text style={styles.formHeading}>Send Us a Message</Text>

        <TextInput
          placeholder="Your Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Your Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={subject}
            onValueChange={(itemValue) => setSubject(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Subject" value="" />
            <Picker.Item label="General" value="general" />
            <Picker.Item label="Order Related" value="order" />
            <Picker.Item label="Payment or Secure Plan" value="payment" />
            <Picker.Item label="Technical Help" value="technical" />
          </Picker>
        </View>

        <TextInput
          placeholder="Your Message"
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Sending...' : 'Send Message'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Social icons */}
      <View style={styles.socialRow}>
        <FontAwesome
          name="facebook-square"
          size={36}
          color="#2563EB"
          onPress={() =>
            Linking.openURL('https://www.facebook.com/profile.php?id=100090804256179')
          }
        />
        <FontAwesome
          name="instagram"
          size={36}
          color="#E1306C"
          onPress={() =>
            Linking.openURL('https://www.instagram.com/bbscart/?hl=en')
          }
        />
        <FontAwesome
          name="whatsapp"
          size={36}
          color="green"
          onPress={() => Linking.openURL('https://wa.me/914134068916')}
        />
        <FontAwesome
          name="linkedin-square"
          size={36}
          color="#0A66C2"
          onPress={() =>
            Linking.openURL(
              'https://www.linkedin.com/in/pavarasu-mayavan-50a171355/'
            )
          }
        />
        <FontAwesome
          name="youtube-play"
          size={36}
          color="red"
          onPress={() =>
            Linking.openURL(
              'https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA'
            )
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20, alignItems: 'center' },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginTop: 10 },
  subText: {
    textAlign: 'center',
    color: '#4B5563',
    marginVertical: 10,
    maxWidth: 320,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  infoCard: {
    width: '45%',
    marginVertical: 10,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginTop: 6, color: '#374151' },
  link: { color: '#2563EB', marginTop: 4 },
  address: { textAlign: 'center', color: '#4B5563', marginTop: 4 },
  form: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  formHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 30,
  },
});

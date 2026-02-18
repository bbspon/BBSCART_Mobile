import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const ContactUs = () => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!name || !email) {
      Alert.alert("Validation", "Name and Email are required!");
      return;
    }
    Alert.alert("Message Sent", `Thank you ${name}, we will contact you soon!`);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}>
      {/* Header */}
      <Text style={styles.title}>Get in Touch</Text>
      <Text style={styles.subtitle}>
        Need help? Reach out via phone, email, WhatsApp, or drop us a message!
      </Text>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.row}>
          <Icon name="phone" size={40} color="#0d6efd" />
          <View style={styles.info}>
            <Text style={styles.label}>Phone</Text>
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("tel:+914134068916")}
            >
              +91 4134068916
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <FontAwesome5 name="whatsapp" size={40} color="green" />
          <View style={styles.info}>
            <Text style={styles.label}>WhatsApp</Text>
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://wa.me/9600729596")}
            >
              +91 9600729596
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="email" size={40} color="#0d6efd" />
          <View style={styles.info}>
            <Text style={styles.label}>Email</Text>
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("mailto:info@bbscart.com")}
            >
              info@bbscart.com
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Entypo name="location-pin" size={40} color="red" />
          <View style={styles.info}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.text}>
              Address: No.7, II Floor, Bharathy Street, Ist Cross, Anna Nagar Extension, Puducherry – 605005
            </Text>
          </View>
        </View>
      </View>

      {/* Message Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Send Us a Message</Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Your Message"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.faqQ}>How long does shipping take?</Text>
        <Text style={styles.faqA}>Typically 7–10 business days.</Text>

        <Text style={styles.faqQ}>Can I return a product?</Text>
        <Text style={styles.faqA}>
          Yes, return eligible products within 7 days of delivery.
        </Text>

        <Text style={styles.faqQ}>How can I track my order?</Text>
        <Text style={styles.faqA}>
          You'll receive a tracking number via email once shipped.
        </Text>
      </View>

      {/* Social Media */}
      <View style={styles.socialRow}>
        <Icon
          name="facebook-square"
          size={40}
          color="#0d6efd"
          onPress={() =>
            Linking.openURL(
              "https://www.facebook.com/profile.php?id=100090804256179"
            )
          }
        />
        <Icon
          name="instagram"
          size={40}
          color="red"
          onPress={() => Linking.openURL("https://www.instagram.com/bbscart/?hl=en")}
        />
        <FontAwesome5
          name="whatsapp"
          size={40}
          color="green"
          onPress={() => Linking.openURL("https://wa.me/914134068916")}
        />
        <Icon
          name="linkedin-square"
          size={40}
          color="#0d6efd"
          onPress={() =>
            Linking.openURL(
              "https://www.linkedin.com/in/pavarasu-mayavan-50a171355/"
            )
          }
        />
        <Icon
          name="youtube"
          size={40}
          color="red"
          onPress={() =>
            Linking.openURL(
              "https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA"
            )
          }
        />
      </View>
    </ScrollView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  info: { marginLeft: 10, flex: 1 },
  label: { fontSize: 16, fontWeight: "500" },
  link: { color: "#0d6efd", marginTop: 4 },
  text: { color: "#333" },
  form: { backgroundColor: "#f8f9fa", padding: 16, borderRadius: 8, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0d6efd",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  faqQ: { fontWeight: "600", marginTop: 10 },
  faqA: { color: "#666", marginBottom: 8 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 30,
  },
});

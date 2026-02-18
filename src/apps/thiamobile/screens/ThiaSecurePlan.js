import { Image, View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThiaLogo from '../assets/thiaworldlogo.png';
const ThiaSecurePlan = () => {
    const insets = useSafeAreaInsets();
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
        >
            <View style={styles.logoContainer}>
                <Image
                    source={ThiaLogo}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
            {/* Title */}
            <Text style={styles.title}>Thia Secure Plan</Text>
            <Text style={styles.subtitle}>Your Jewellery. Your Way. Your Control.</Text>
            <Text style={styles.tagline}>✨ Found Only on BBSCART.COM ✨</Text>

            {/* Section: How It Works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Here’s How It Works:</Text>
                <Text style={styles.bullet}>• Pay <Text style={styles.highlight}>40%</Text> now to lock the design and price</Text>
                <Text style={styles.bullet}>• Your jewellery is safely reserved and stored</Text>
                <Text style={styles.bullet}>• Pay the remaining <Text style={styles.highlight}>60%</Text> whenever you're ready</Text>
            </View>

            {/* Section: Why People Love It */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Why People Love Thia Secure Plan:</Text>
                <Text style={styles.bullet}>• Secure gold rate lock on the day of booking</Text>
                <Text style={styles.bullet}>• Pay balance anytime with flexibility</Text>
                <Text style={styles.bullet}>• Safe storage until final purchase</Text>
                <Text style={styles.bullet}>• No hidden charges, all-inclusive pricing</Text>
            </View>

            {/* Closing Text */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Whether you’re planning a gift, preparing for a celebration, or just waiting for the perfect time —
                    <Text style={styles.highlight}> Thia Secure Plan</Text> lets you plan smart, shop calm, and sparkle with confidence.
                </Text>
                <Text style={styles.powered}>Only on BBSCART.COM – Powered by Thiaworld Jewellery & Golddex</Text>
            </View>
        </ScrollView>
    );
};

export default ThiaSecurePlan;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffaf5',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 10, // Reduced top padding
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15, // Reduced margin
        paddingHorizontal: 10, // Reduced horizontal padding
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B0000',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    tagline: {
        fontSize: 14,
        color: '#d35400',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 15,
        color: '#333',
        marginVertical: 3,
        lineHeight: 22,
    },
    highlight: {
        color: '#b22222',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 10,
        padding: 10,
    },
    footerText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        textAlign: 'center',
    },
    powered: {
        margin: 15,
        padding: 5,
        fontSize: 13,
        color: '#777',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    image: {
        width: 250,
        height: 200,
        alignSelf: 'center', // Ensure center alignment
    },
});

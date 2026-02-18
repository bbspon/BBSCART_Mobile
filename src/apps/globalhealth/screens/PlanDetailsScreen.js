// src/screens/PlanDetailsScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE_URL = 'https://healthcare.bbscart.com/api';

// Change this later if you add language / country detection
const DEFAULT_CURRENCY = 'INR';

export default function PlanDetailsScreen({ route }) {
    const insets = useSafeAreaInsets();
    const { planId } = route.params;

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/plans/${planId}`);
                setPlan(res.data);
            } catch (err) {
                console.error('Failed to load plan details', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [planId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={styles.center}>
                <Text>Plan not found.</Text>
            </View>
        );
    }

    // SAFE price extraction
    const priceObject = plan.price || {};
    const displayPrice = priceObject[DEFAULT_CURRENCY];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
        >
            <Text style={styles.title}>{plan.name}</Text>

            {displayPrice ? (
                <Text style={styles.price}>
                    ₹ {displayPrice} / year
                </Text>
            ) : (
                <Text style={styles.price}>Price not available</Text>
            )}

            <Section title="Description" value={plan.description} />
            <Section title="Coverage" value={plan.coverage} />
            <Section title="Eligibility" value={plan.eligibility} />

            {/* Optional: show all currencies */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Currencies</Text>
                {Object.keys(priceObject).map((key) => (
                    <Text key={key}>
                        {key}: {priceObject[key]}
                    </Text>
                ))}
            </View>
        </ScrollView>
    );
}

function Section({ title, value }) {
    if (!value) return null;

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionBody}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    price: {
        fontSize: 16,
        color: '#198754',
        marginVertical: 8,
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionBody: {
        fontSize: 14,
        lineHeight: 20,
    },
});

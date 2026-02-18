// GoldSilverRateScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GoldSilverRateScreen = () => {
  const insets = useSafeAreaInsets();
  const [rates, setRates] = useState({
    gold22k: '₹5,450 /g',
    gold24k: '₹5,950 /g',
    silver: '₹75 /g',
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // 🔄 Here you can call API to fetch live rates
    setTimeout(() => {
      setRates({
        gold22k: '₹5,460 /g',
        gold24k: '₹5,960 /g',
        silver: '₹76 /g',
      });
      setRefreshing(false);
    }, 1500);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.pageTitle}>Gold & Silver Rates</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Gold 22K</Text>
        <Text style={styles.rate}>{rates.gold22k}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Gold 24K</Text>
        <Text style={styles.rate}>{rates.gold24k}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Silver</Text>
        <Text style={styles.rate}>{rates.silver}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
  },
  rate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8860B', // gold-like color
  },
});

export default GoldSilverRateScreen;

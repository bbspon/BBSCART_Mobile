// RewardsScreen.js — Jewelry Store Rewards
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, 
  ScrollView,   Dimensions, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Jewelry Rewards Data
const rewardsData = {
  balance: 1250,
  tier: 'Gold Member',
  progress: 70, // percent to next tier
  expiry: '150 points expiring this month',
  earnOpportunities: [
    { id: '1', title: 'Purchase Gold Jewellery', points: 200 },
    { id: '2', title: 'Purchase Silver Jewellery', points: 100 },
    { id: '3', title: 'Book a Store Visit', points: 50 },
    { id: '4', title: 'Refer a Friend', points: 300 },
    { id: '5', title: 'Upload Wedding Date for Anniversary Gift', points: 150 },
  ],
  redeemOptions: [
    { id: '1', title: '₹1000 Off Making Charges', points: 500 },
    { id: '2', title: 'Free Silver Coin', points: 800 },
    { id: '3', title: '₹2000 Voucher for Gold Purchase', points: 1000 },
    { id: '4', title: 'Anniversary Special Gift', points: 1500 },
  ],
  history: [
    { id: '1', type: 'Earned', title: 'Purchase Silver Bangles', points: 100, date: '2025-08-20' },
    { id: '2', type: 'Redeemed', title: '₹1000 Off Making Charges', points: -500, date: '2025-08-21' },
    { id: '3', type: 'Earned', title: 'Refer a Friend', points: 300, date: '2025-08-22' },
  ],
  exclusiveOffers: [
    { id: '1', title: '10% Extra Points on Gold Coins Purchase', pointsRequired: 0 },
    { id: '2', title: 'Exclusive Preview Access for Navratri Collection', pointsRequired: 300 },
    { id: '3', title: 'Priority Store Appointment for Wedding Shopping', pointsRequired: 500 },
  ],
};

// Screen Component
const RewardsScreen = () => {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(rewardsData.balance);
  const [progress, setProgress] = useState(rewardsData.progress);

  // Handle Redeem
  const handleRedeem = (points, title) => {
    if (balance >= points) {
      setBalance(prev => prev - points);
      Alert.alert('Success', `You redeemed ${points} points for ${title}`);
    } else {
      Alert.alert('Insufficient Points', 'You do not have enough points to redeem this offer.');
    }
  };

  const renderEarnItem = ({ item }) => (
    <View style={styles.earnItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.points}>+{item.points} pts</Text>
    </View>
  );

  const renderRedeemItem = ({ item }) => (
    <TouchableOpacity style={styles.redeemItem} onPress={() => handleRedeem(item.points, item.title)}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.points}>{item.points} pts</Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={{ color: item.type === 'Earned' ? 'green' : 'red' }}>
        {item.type === 'Earned' ? `+${item.points}` : item.points}
      </Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  const renderOfferItem = ({ item }) => (
    <View style={styles.offerItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.points}>
        {item.pointsRequired > 0 ? `${item.pointsRequired} pts` : 'Free for Members'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + Math.max(12, insets.bottom) + 8 }}>
        {/* Reward Balance / Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.balanceText}>{balance} pts</Text>
          <Text style={styles.tierText}>{rewardsData.tier}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.expiryText}>{rewardsData.expiry}</Text>
        </View>

        {/* Earn Points Section */}
        <Text style={styles.sectionTitle}>Ways to Earn</Text>
        <FlatList
          data={rewardsData.earnOpportunities}
          renderItem={renderEarnItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
        />

        {/* Redeem Points Section */}
        <Text style={styles.sectionTitle}>Redeem Points</Text>
        <FlatList
          data={rewardsData.redeemOptions}
          renderItem={renderRedeemItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
        />

        {/* Reward History Section */}
        <Text style={styles.sectionTitle}>Reward History</Text>
        <FlatList
          data={rewardsData.history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          style={{ marginVertical: 10 }}
        />

        {/* Exclusive Offers Section */}
        <Text style={styles.sectionTitle}>Exclusive Jewelry Offers</Text>
        <FlatList
          data={rewardsData.exclusiveOffers}
          renderItem={renderOfferItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 30 }}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  hero: {
    backgroundColor: '#d4af37',
    padding: 20,
    
    borderRadius: 12,
    margin: 10,
    alignItems: 'center',
    elevation: 4,
  },
  balanceText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  tierText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#fff8dc',
  },
  progressBarBackground: {
    height: 10,
    width: '80%',
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  expiryText: {
    fontSize: 12,
    marginTop: 5,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 20,
    color: '#444',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  earnItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    width: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  redeemItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    width: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  points: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: '#666',
  },
  offerItem: {
    backgroundColor: '#fff5e6',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    width: width * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});

export default RewardsScreen;

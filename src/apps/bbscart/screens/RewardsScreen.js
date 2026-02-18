// RewardsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, 
  ScrollView, Dimensions, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data for demo purpose
const rewardsData = {
  balance: 1250,
  tier: 'Gold',
  progress: 70, // percent to next tier
  expiry: '150 points expiring soon',
  earnOpportunities: [
    { id: '1', title: 'Refer a friend', points: 100 },
    { id: '2', title: 'Daily check-in', points: 10 },
    { id: '3', title: 'Purchase reward', points: 50 },
    { id: '4', title: 'Special campaign', points: 200 },
  ],
  redeemOptions: [
    { id: '1', title: 'Rs 100 voucher', points: 100 },
    { id: '2', title: 'Rs 200 cashback', points: 200 },
    { id: '3', title: 'Product redemption', points: 500 },
  ],
  history: [
    { id: '1', type: 'Earned', title: 'Purchase reward', points: 50, date: '2025-08-20' },
    { id: '2', type: 'Redeemed', title: 'Rs 100 voucher', points: -100, date: '2025-08-21' },
    { id: '3', type: 'Earned', title: 'Refer a friend', points: 100, date: '2025-08-22' },
  ],
  exclusiveOffers: [
    { id: '1', title: 'Limited time 50% off on coins', pointsRequired: 300 },
    { id: '2', title: 'Bonus coins for VIP members', pointsRequired: 0 },
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
      Alert.alert('Insufficient Points', 'You do not have enough points to redeem.');
    }
  };

  const renderEarnItem = ({ item }) => (
    <View style={styles.earnItem}>
      <Text>{item.title}</Text>
      <Text style={styles.points}>+{item.points}</Text>
    </View>
  );

  const renderRedeemItem = ({ item }) => (
    <TouchableOpacity style={styles.redeemItem} onPress={() => handleRedeem(item.points, item.title)}>
      <Text>{item.title}</Text>
      <Text style={styles.points}>{item.points} pts</Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text>{item.title}</Text>
      <Text style={{ color: item.type === 'Earned' ? 'green' : 'red' }}>
        {item.type === 'Earned' ? `+${item.points}` : item.points}
      </Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  const renderOfferItem = ({ item }) => (
    <View style={styles.offerItem}>
      <Text>{item.title}</Text>
      <Text style={styles.points}>{item.pointsRequired} pts</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + insets.bottom }}>
        {/* Reward Balance / Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.balanceText}>{balance} pts</Text>
          <Text style={styles.tierText}>{rewardsData.tier} Tier</Text>
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
        <Text style={styles.sectionTitle}>Exclusive Offers</Text>
        <FlatList
          data={rewardsData.exclusiveOffers}
          renderItem={renderOfferItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
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
    backgroundColor: '#f9f9f9',
  },
  hero: {
    backgroundColor: '#ffd700',
    padding: 20,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tierText: {
    fontSize: 16,
    marginVertical: 5,
  },
  progressBarBackground: {
    height: 10,
    width: '80%',
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  expiryText: {
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 15,
  },
  earnItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    width: width * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  redeemItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    width: width * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  points: {
    fontWeight: 'bold',
    marginTop: 5,
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
    fontSize: 10,
    color: '#666',
  },
  offerItem: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    width: width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RewardsScreen;

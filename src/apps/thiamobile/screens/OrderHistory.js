import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Jewellery Order Data
const orders = [
  {
    id: '1',
    productName: '22K Gold Necklace Set',
    productImage: 'https://www.pngkey.com/png/detail/789-7899733_22k-gold-rings-for-men-ideas-22k-yellow.png',
    orderDate: '15 Aug 2025',
    status: 'Delivered',
  },
  {
    id: '2',
    productName: 'Sterling Silver Anklet',
    productImage: 'https://www.pinpng.com/pngs/m/606-6066755_gold-ring-22k-gold-ring-antique-hd-png.png',
    orderDate: '12 Aug 2025',
    status: 'Shipped',
  },
  {
    id: '3',
    productName: 'Diamond Engagement Ring',
    productImage: 'https://www.pngfind.com/pngs/m/584-5845868_22k-yellow-gold-bangle-bangle-hd-png-download.png',
    orderDate: '05 Aug 2025',
    status: 'Cancelled',
  },
];

const OrderHistory = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.productImage }} style={styles.productImage} />
      <View style={styles.details}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.orderDate}>Ordered on {item.orderDate}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'Delivered'
              ? styles.delivered
              : item.status === 'Shipped'
              ? styles.shipped
              : styles.cancelled,
          ]}
        >
          {item.status}
        </Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Jewellery Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 + Math.max(12, insets.bottom) + 8 }}
      />
    </View>
  );
};

// Styles (Premium Jewellery UI)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6f0', // subtle warm tone for jewellery
    padding: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5a3e1b', // rich brown like gold
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2d2d2d',
  },
  orderDate: {
    fontSize: 13,
    color: '#7d7d7d',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  delivered: {
    color: 'green',
  },
  shipped: {
    color: '#ff9800',
  },
  cancelled: {
    color: 'red',
  },
  detailsButton: {
    backgroundColor: '#b8860b', // gold theme
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OrderHistory;

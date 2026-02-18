import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Order Data
const orders = [
  {
    id: '1',
    productName: 'Samsung Galaxy M14 5G',
    productImage: 'https://purepng.com/public/uploads/large/samsung-phone-270.png',
    orderDate: '15 Aug 2025',
    status: 'Delivered',
  },
  {
    id: '2',
    productName: 'Nike Running Shoes',
    productImage: 'https://freepngimg.com/download/running_shoes/15-nike-running-shoes-png-image.png',
    orderDate: '12 Aug 2025',
    status: 'Shipped',
  },
  {
    id: '3',
    productName: 'Sony WH-CH520 Headphones',
    productImage: 'https://m.media-amazon.com/images/I/61l+sz394PL._SL1000_.jpg',
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
      <Text style={styles.heading}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      />
    </View>
  );
};

// Styles (Flipkart-like UI)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f3f5',
    padding: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#222',
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
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
    backgroundColor: '#007BFF',
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

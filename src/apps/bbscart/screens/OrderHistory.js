import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "https://bbscart.com/api";

export default function OrderHistory({ navigation }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

 const unifiedRaw = await AsyncStorage.getItem("UNIFIED_AUTH");

if (!unifiedRaw) {
  setOrders([]);
  return;
}

const unified = JSON.parse(unifiedRaw);
const userId = unified?.user?._id;

if (!userId) {
  setOrders([]);
  return;
}

const res = await axios.get(
  `${API_BASE}/orders/user/${userId}`,
  {
    headers: {
      Authorization: `Bearer ${unified.token}`,
    },
  }
);

const sorted = (res.data?.orders || []).sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);

setOrders(sorted);

    } catch (err) {
      console.log("Orders fetch error:", err?.response?.data || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item?.items?.[0]?.image }}
        style={styles.productImage}
      />

      <View style={styles.details}>
        <Text style={styles.productName}>
          {item?.items?.[0]?.name}
        </Text>

        <Text style={styles.orderDate}>
          Ordered on {new Date(item.created_at).toDateString()}
        </Text>

        <Text style={styles.price}>
          ₹{item?.totalAmount}
        </Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("OrderDetails", {
              orderId: item._id,
            })
          }
        >
          <Text style={styles.detailsButtonText}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fb641b" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Text style={styles.heading}>My Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
  detailsButton: {
    marginTop: 10,
  },
  detailsButtonText: {
    color: "#2874F0",
    fontSize: 13,
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#777",
  },
});

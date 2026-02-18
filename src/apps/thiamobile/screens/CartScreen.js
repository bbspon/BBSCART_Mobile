import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

// ✅ Helper function to format numbers with commas
const formatPrice = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

const buildImageUrl = (img, images) => {
  // ✅ Try multiple image sources: item.image, item.images[0], or placeholder
  let imageSource = img;
  
  // If img is not available, try images array
  if (!imageSource && images && Array.isArray(images) && images.length > 0) {
    // Handle both string and object formats
    const firstImage = images[0];
    imageSource = typeof firstImage === 'string' ? firstImage : firstImage?.url || firstImage?.src || firstImage;
  }
  
  // ✅ Safety check: handle undefined/null/empty
  if (!imageSource || typeof imageSource !== 'string' || imageSource.trim() === '') {
    console.log('⚠️ No valid image source found, using placeholder');
    return 'https://via.placeholder.com/150';
  }
  
  // ✅ Clean up the image source (remove any pipe-separated values)
  if (imageSource.includes('|')) {
    imageSource = imageSource.split('|')[0];
  }
  
  // ✅ If already a full URL, return as-is
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return imageSource;
  }
  
  // ✅ Handle paths that already start with uploads/
  if (imageSource.startsWith('uploads/')) {
    return `https://thiaworld.bbscart.com/${imageSource}`;
  }
  
  // ✅ Handle paths that start with /uploads/
  if (imageSource.startsWith('/uploads/')) {
    return `https://thiaworld.bbscart.com${imageSource}`;
  }
  
  // ✅ Default: prepend uploads path
  return `https://thiaworld.bbscart.com/uploads/${imageSource}`;
};

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const {
    mergedCart = [],
    updateQuantity,
    removeFromCart,
  } = useCart();

  // 🔒 SAFETY: empty cart
  if (!Array.isArray(mergedCart)) {
    return (
      <View style={styles.center}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  // ✅ Helper function to extract price from item (used in both renderItem and getTotal)
  const getItemPrice = (item) => {
    if (!item) return 0;
    
    // Try multiple price sources in order of preference
    if (item.price !== undefined && item.price !== null) {
      return Number(item.price) || 0;
    }
    if (item.finalPrice !== undefined && item.finalPrice !== null) {
      return Number(item.finalPrice) || 0;
    }
    if (item.totalPayable !== undefined && item.totalPayable !== null) {
      return Number(item.totalPayable) || 0;
    }
    if (item.sellingPrice !== undefined && item.sellingPrice !== null) {
      return Number(item.sellingPrice) || 0;
    }
    if (item.priceOptions && Array.isArray(item.priceOptions) && item.priceOptions.length > 0) {
      return Number(item.priceOptions[0].price) || 0;
    }
    
    // Debug: log if price not found
    console.log('⚠️ Price not found for item:', item.id, item.name, 'Available keys:', Object.keys(item));
    return 0;
  };

  const increaseQty = (item) => {
    // ✅ Safety check: ensure item has required properties
    if (!item || !item.id || !item.category) return;
    updateQuantity(item.id, item.category, (item.quantity || 1) + 1);
  };

  const decreaseQty = (item) => {
    // ✅ Safety check: ensure item has required properties
    if (!item || !item.id || !item.category) return;
    if (item.quantity > 1) {
      updateQuantity(item.id, item.category, item.quantity - 1);
    }
  };

  // ✅ Use useMemo to cache total calculation and prevent unnecessary recalculations
  const cartTotal = useMemo(() => {
    const total = mergedCart.reduce((sum, item) => {
      if (!item) return sum;
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      const itemTotal = price * quantity;
      
      // Debug: log each item's contribution
      if (price > 0) {
        console.log('📦 Item:', item.name, 'Price:', price, 'Qty:', quantity, 'Subtotal:', itemTotal);
      }
      
      return sum + itemTotal;
    }, 0);
    
    // Debug: log total calculation
    console.log('💰 Cart Total:', total, 'Items:', mergedCart.length);
    return total;
  }, [mergedCart]);

  const renderItem = ({ item }) => {
    // ✅ Safety check: ensure item exists
    if (!item) return null;
    
    // ✅ Use helper function to get price consistently
    const price = getItemPrice(item);
    const quantity = item.quantity || 1;
    const totalPrice = price * quantity;
    
    // ✅ Get image URL with better error handling
    const imageUrl = buildImageUrl(item.image, item.images);
    
    return (
      <View style={dynamicStyles.itemCard}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('❌ Image load error for item:', item.id, item.name, 'URL:', imageUrl);
          }}
        />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={dynamicStyles.itemName}>{item.name || 'Unnamed Product'}</Text>
          <Text style={styles.itemPrice}>
            ₹{formatPrice(totalPrice)}
          </Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => decreaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => increaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            // ✅ Safety check before removing
            if (item && item.id && item.category) {
              removeFromCart(item.id, item.category);
            }
          }}
        >
          <Text style={styles.removeText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  // ✅ Create dynamic styles based on theme
  const dynamicStyles = {
    ...styles,
    center: { ...styles.center, backgroundColor: colors.background },
    itemCard: { ...styles.itemCard, backgroundColor: colors.card },
    itemName: { ...styles.itemName, color: colors.text },
    summaryCard: { ...styles.summaryCard, backgroundColor: colors.card },
    summaryTitle: { ...styles.summaryTitle, color: colors.text },
    summaryLabel: { ...styles.summaryLabel, color: colors.text },
    placeOrderBtn: { ...styles.placeOrderBtn, backgroundColor: colors.primary },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: Math.max(12, insets.bottom) + 8 }}>
      {mergedCart.length === 0 ? (
        <View style={dynamicStyles.center}>
          <Text style={{ color: colors.text }}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={mergedCart}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?.id?.toString() || `cart-item-${index}`}
            contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
            ListEmptyComponent={
              <View style={dynamicStyles.center}>
                <Text style={{ color: colors.text }}>Your cart is empty</Text>
              </View>
            }
          />

          <View style={dynamicStyles.summaryCard}>
            <Text style={dynamicStyles.summaryTitle}>Price Details</Text>

            <View style={styles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>₹{formatPrice(cartTotal)}</Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity 
            style={dynamicStyles.placeOrderBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.8}
          >
            <Text style={styles.placeOrderText}>
              CHECKOUT (NEXT STEP)
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 12,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  itemImage: { width: 90, height: 90, borderRadius: 8 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#4A2C2A' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#B8860B' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  qtyText: { marginHorizontal: 10 },
  removeText: { color: '#8B0000', marginTop: 6 },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  summaryTitle: { fontWeight: 'bold', marginBottom: 6 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  placeOrderBtn: {
    backgroundColor: '#B8860B',
    padding: 16,
    alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontWeight: 'bold' },
});

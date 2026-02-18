import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const API_BASE = 'https://thiaworld.bbscart.com';

// ✅ Helper function to build image URL
const buildImageUrl = (img) => {
  if (!img) return 'https://via.placeholder.com/150';
  if (img.startsWith('http')) return img;
  if (img.startsWith('uploads/')) {
    return `${API_BASE}/${img}`;
  }
  if (img.startsWith('/uploads/')) {
    return `${API_BASE}${img}`;
  }
  return `${API_BASE}/uploads/${img}`;
};

export default function SearchScreen({ route }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const initialQuery = route?.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Try multiple search endpoints
      const searchEndpoints = [
        `${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`,
        `${API_BASE}/api/products/search?query=${encodeURIComponent(query)}`,
        `${API_BASE}/api/products?search=${encodeURIComponent(query)}`,
      ];

      let searchResults = [];
      let lastError = null;

      // Try each endpoint until one works
      for (const endpoint of searchEndpoints) {
        try {
          const response = await axios.get(endpoint, { timeout: 10000 });
          const data = response.data;

          // Handle different response formats
          if (Array.isArray(data)) {
            searchResults = data;
          } else if (data?.products && Array.isArray(data.products)) {
            searchResults = data.products;
          } else if (data?.items && Array.isArray(data.items)) {
            searchResults = data.items;
          } else if (data?.data && Array.isArray(data.data)) {
            searchResults = data.data;
          }

          if (searchResults.length > 0) {
            break; // Success, stop trying other endpoints
          }
        } catch (err) {
          lastError = err;
          continue; // Try next endpoint
        }
      }

      // If no results from search endpoints, try fetching all products and filtering
      if (searchResults.length === 0) {
        try {
          const allProductsEndpoints = [
            `${API_BASE}/api/products`,
            `${API_BASE}/api/products/all`,
            `${API_BASE}/api/products/gold`,
          ];

          for (const endpoint of allProductsEndpoints) {
            try {
              const response = await axios.get(endpoint, { timeout: 10000 });
              const data = response.data;
              const allProducts = Array.isArray(data) ? data : data?.items || data?.products || data?.data || [];

              // Filter products locally by name
              searchResults = allProducts.filter((p) =>
                (p.name || '').toLowerCase().includes(query.toLowerCase())
              );

              if (searchResults.length > 0) {
                break;
              }
            } catch (err) {
              continue;
            }
          }
        } catch (err) {
          console.log('Fallback search error:', err);
        }
      }

      // Normalize products
      const normalizedProducts = searchResults.map((p) => {
        const price = Number(p.price || p.finalPrice || p.totalPayable || 0);
        const mrp = p.discount
          ? Math.round(price / (1 - p.discount / 100))
          : price;

        return {
          id: p._id || p.id,
          name: p.name || 'Unnamed Product',
          price: price,
          mrp: mrp,
          image: p.images?.[0]
            ? buildImageUrl(p.images[0].split('|')[0])
            : buildImageUrl(p.image),
          category: p.category || 'Gold',
          rating: p.rating || 4.5,
          discount: p.discount || 0,
        };
      });

      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Perform search when query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // ✅ Perform initial search if query provided via route params
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const handleProductPress = (item) => {
    navigation.navigate('ProductDetails', { id: item.id });
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
          {item.mrp > item.price && (
            <Text style={styles.mrp}>₹{item.mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>
        {item.discount > 0 && (
          <Text style={styles.discount}>{item.discount}% OFF</Text>
        )}
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={!initialQuery}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setProducts([]);
                setHasSearched(false);
              }}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading && !hasSearched ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => performSearch(searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !hasSearched ? (
        <View style={styles.centerContainer}>
          <Icon name="search" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Start typing to search for products</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              Found {products.length} {products.length === 1 ? 'product' : 'products'}
            </Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#B8860B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
    marginRight: 8,
  },
  mrp: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 124; // Product container height (12 padding top + 100 image + 12 padding bottom)
const API_BASE = 'https://bbscart.com/api';
const IMAGE_BASE = 'https://bbscart.com/uploads/';
const STATIC_PREFIXES = ['/uploads', '/uploads-bbscart'];

// ---------------- Hero Banner ----------------
const heroBannerImages = [
  {
    id: '1',
    image: require('../assets/images/Banner_1.png'),
    title: 'Super Sale!',
  },
  {
    id: '2',
    image: require('../assets/images/Banner_2.png'),
    title: 'Latest Gadgets',
  },
  {
    id: '3',
    image: require('../assets/images/Banner_3.png'),
    title: 'Fashion Deals',
  },
];

const ProductListings = () => {
  const { addItem, updateQty } = useCart();
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get category name from route params (passed from Home screen slider)
  const initialCategoryName = route.params?.name || 'All';
  
  const [selectedQuantity, setSelectedQuantity] = useState({});
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryName);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(['All']);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Helper functions to normalize product images
  const norm = (u) => {
    if (!u) return '';
    const s = String(u).trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (STATIC_PREFIXES.some((pre) => s.startsWith(pre + '/'))) {
      return `https://bbscart.com${s}`;
    }
    return `${IMAGE_BASE}${encodeURIComponent(s)}`;
  };

  const pickImage = (p) => {
    if (p.product_img_url) return p.product_img_url;
    if (Array.isArray(p.gallery_img_urls) && p.gallery_img_urls[0]) {
      return p.gallery_img_urls[0];
    }
    const firstSingleRaw = Array.isArray(p.product_img)
      ? p.product_img[0]
      : p.product_img;
    const firstGalleryRaw = Array.isArray(p.gallery_imgs)
      ? p.gallery_imgs[0]
      : p.gallery_imgs;

    const splitFirst = (val) => {
      if (!val) return '';
      const t = String(val).trim();
      return t.includes('|')
        ? t
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)[0]
        : t;
    };

    const chosen =
      splitFirst(firstSingleRaw) ||
      splitFirst(firstGalleryRaw) ||
      p.image ||
      '';
    if (!chosen) return 'https://via.placeholder.com/300';
    return norm(chosen);
  };

  const getImageUrl = (item) => {
    return pickImage(item);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (currentIndex + 1) % heroBannerImages.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: width * nextIndex,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: event => {
        const index = Math.floor(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      },
    },
  );

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update selectedCategory when route params change (when navigating from Home slider)
  useEffect(() => {
    if (route.params?.name) {
      setSelectedCategory(route.params.name);
    }
  }, [route.params?.name]);

  // Fetch products when category changes and categories are loaded
  useEffect(() => {
    if (categoriesLoaded || selectedCategory === 'All') {
      loadProducts();
    }
  }, [selectedCategory, categoriesLoaded, categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const categoriesList = res.data || [];
      setCategories(categoriesList);
      // Extract category names for the picker
      const categoryNames = ['All', ...categoriesList.map((cat) => cat.name)];
      setCategoryOptions(categoryNames);
      setCategoriesLoaded(true);
    } catch (err) {
      console.log('❌ CATEGORY API ERROR', err);
      setCategories([]);
      setCategoriesLoaded(true);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setAllProductsLoaded(false);

      if (selectedCategory === 'All') {
        // Fetch all products
        const pincode = await AsyncStorage.getItem('deliveryPincode');
        const res = await axios.get(`${API_BASE}/products/public`, {
          params: { pincode },
        });
        const list = res.data?.products || res.data?.items || [];
        setProducts(list);
      } else {
        // Find category by name
        const category = categories.find(
          (cat) => cat.name === selectedCategory,
        );

        if (!category) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch subcategories for this category
        const subcategoriesRes = await axios.get(
          `${API_BASE}/products/catalog/subcategories`,
          {
            params: { category_id: category._id },
          },
        );

        const subcategories =
          subcategoriesRes.data?.items || subcategoriesRes.data || [];

        if (subcategories.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch products for all subcategories
        const pincode = await AsyncStorage.getItem('deliveryPincode');
        const allProducts = [];

        // Fetch products for each subcategory
        for (const subcategory of subcategories) {
          try {
            const productsRes = await axios.get(
              `${API_BASE}/products/public`,
              {
                params: { subcategoryId: subcategory._id, pincode },
              },
            );
            const subProducts =
              productsRes.data?.products || productsRes.data?.items || [];
            allProducts.push(...subProducts);
          } catch (err) {
            console.log(
              `❌ Error fetching products for subcategory ${subcategory._id}:`,
              err,
            );
          }
        }

        // Remove duplicates based on _id
        const uniqueProducts = allProducts.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p._id === product._id),
        );

        setProducts(uniqueProducts);
      }
    } catch (err) {
      console.log('❌ PRODUCT FETCH ERROR', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    // For now, we load all products at once
    // Can be enhanced with pagination if needed
    setAllProductsLoaded(true);
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {heroBannerImages.map((_, i) => {
        let opacity = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
      })}
    </View>
  );

  const formatPrice = price => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const toggleWishlist = async (productId) => {
    const isWishlisted = wishlistItems.some((item) => {
      const wProductId = item.product?._id || item._id || item.id;
      return (
        wProductId === productId ||
        wProductId?.toString() === productId?.toString()
      );
    });

    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetails', { productId: product._id });
  };

  const incrementQuantity = (productId) => {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decrementQuantity = (productId) => {
    setProductQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      if (currentQty <= 1) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return {
        ...prev,
        [productId]: currentQty - 1,
      };
    });
  };

  const renderProduct = ({ item }) => {
    const productQuantity = productQuantities[item._id] || 0;
    const productPrice = item.price || 0;

    // Check if product is in wishlist
    const isWishlisted = wishlistItems.some((wItem) => {
      const wProductId = wItem.product?._id || wItem._id || wItem.id;
      return (
        wProductId === item._id ||
        wProductId?.toString() === item._id?.toString()
      );
    });

    return (
      <View style={styles.productContainer}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => handleViewProduct(item)}
        >
          <Image
            source={{ uri: getImageUrl(item) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.productDetails}>
          <View style={styles.productTitleContainer}>
            <TouchableOpacity
              style={styles.productNameContainer}
              onPress={() => handleViewProduct(item)}
            >
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.wishlistIcon}
              onPress={() => toggleWishlist(item._id)}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={22}
                color={isWishlisted ? '#e91e63' : '#666'}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ₹{formatPrice(productPrice * productQuantity || productPrice)}
            </Text>
          </View>

          {/* Add to Cart / Quantity Control */}
          <View style={styles.actionContainer}>
            {productQuantity === 0 ? (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  incrementQuantity(item._id);
                  addItem({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    image: getImageUrl(item),
                    qty: 1,
                  });
                }}
              >
                <Ionicons name="cart-outline" size={18} color="#5a6c0d" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    decrementQuantity(item._id);
                    if (productQuantity > 1) {
                      updateQty(item._id, productQuantity - 1);
                    }
                  }}
                >
                  <Ionicons name="remove" size={18} color="#5a6c0d" />
                </TouchableOpacity>

                <Text style={styles.quantityValue}>{productQuantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    incrementQuantity(item._id);
                    updateQty(item._id, productQuantity + 1);
                  }}
                >
                  <Ionicons name="add" size={18} color="#5a6c0d" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroBanner}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
        >
          {heroBannerImages.map(item => (
            <View key={item.id} style={styles.slide}>
              <Image source={item.image} style={styles.bannerImage} />
            </View>
          ))}
        </ScrollView>
        {renderPagination()}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Filter by Category:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            style={styles.categoryPicker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {categoryOptions.map((category) => (
              <Picker.Item
                key={category}
                label={category}
                value={category}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.totalProductsContainer}>
        <Text style={styles.totalProductsText}>
          Total Products: {products.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noProductsText}>No Products Found</Text>
          <Text style={styles.noProductsSubtext}>
            {selectedCategory !== 'All'
              ? `No products available in ${selectedCategory} category`
              : 'No products available at the moment'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentContainerStyle={[styles.productList, { paddingBottom: 12 + insets.bottom }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroBanner: {
    height: height * 0.22,
    maxHeight: 200,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    zIndex: 1,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
    maxWidth: 180,
    marginLeft: 12,
  },
  categoryPicker: {
    height: 45,
    width: '100%',
  },
  totalProductsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalProductsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  productList: {
    padding: 12,
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    width: width * 0.25,
    maxWidth: 110,
    height: width * 0.25,
    maxHeight: 110,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  productTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  wishlistIcon: {
    padding: 4,
    marginTop: -4,
  },
  priceContainer: {
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2874F0',
  },
  actionContainer: {
    marginTop: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#cbda8b',
    borderRadius: 6,
    minWidth: 120,
  },
  addToCartText: {
    color: '#5a6c0d',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cbda8b',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 100,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noProductsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  noProductsSubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ProductListings;

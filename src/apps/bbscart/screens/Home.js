import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate as navigateToRoot } from '../../../shared/services/navigationService';
import BBSCARTLOGO from "../assets/images/bbscart-logo.png";
import CategoryMenu from './CategoryMenu';
import DeliverToModal from './DeliverToModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
const API_BASE = "https://bbscart.com/api";
const IMAGE_BASE = "https://bbscart.com/uploads/";
const STATIC_PREFIXES = ["/uploads", "/uploads-bbscart"]; // Support both roots
// Mock Data
// ------------------------------
const BANNERS = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop', deeplink: 'Category:Electronics' },
  { id: 'b2', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', deeplink: 'Category:Fashion' },
  { id: 'b3', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1600&auto=format&fit=crop', deeplink: 'Category:Groceries' },
];

// Categories are now loaded from API and shown with relevant images in the slider

// PRODUCTS_TRENDING is now fetched dynamically from API as "All Products"

const PRODUCTS_DEALS = Array.from({ length: 10 }).map((_, i) => ({
  id: `d${i + 1}`,
  title: `Deal Product ${i + 1}`,
  price: 999 + i * 80,
  mrp: 1799 + i * 90,
  rating: (3.8 + (i % 10) * 0.1).toFixed(1),
  image: `https://picsum.photos/seed/deal${i}/400/400`,
  discountPct: 20 + (i % 6) * 5,
}));

// PRODUCTS_RECO is now fetched dynamically from API

// ------------------------------
// Utility: Countdown to Midnight
// ------------------------------
const useMidnightCountdown = () => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      setRemaining(Math.max(0, midnight.getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const hrs = Math.floor(remaining / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// ------------------------------
// Header
// ------------------------------
const Header = ({ onSearchPress, onMenuPress, onNavigateToThiaMobile, onNavigateToGlobalHealth }) => {

  return (
    <View style={styles.container}>
      {/* Left / Search Bar */}
      {/* MENU ICON */}

   
<View style={styles.headerRow}>
  <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
     <Icon name="menu-outline" size={45} color="#f1eeee" />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.searchBar}
    onPress={onSearchPress}
    activeOpacity={0.8}
  >
    <Text style={styles.searchPlaceholder}>Search products, brands…</Text>
  </TouchableOpacity>
</View>

      {/* Right / Logo / Icons */}
      <View style={styles.headerRight}>

{/* Thiaworld Jewellery */}
<TouchableOpacity
  onPress={onNavigateToThiaMobile}
  activeOpacity={0.8}
  style={styles.linkBox}
>
  <Image
    source={require("../assets/images/thiaworld.png")}
    style={styles.logo}
    resizeMode="contain"
  />
</TouchableOpacity>

{/* BBS Global Health Access */}
<TouchableOpacity
  onPress={onNavigateToGlobalHealth}
  activeOpacity={0.8}
  style={styles.linkBox}
>
  <Image
    source={require("../assets/images/bbs-health.png")}
    style={styles.logo}
    resizeMode="contain"
  />
</TouchableOpacity>

</View>

    </View>
  );
};

const IconBadge = ({ icon, count, onPress, accessibilityLabel }) => (
  <TouchableOpacity style={styles.iconBtn} onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <Text style={styles.iconTxt}>{icon}</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ------------------------------
// Hero Carousel
// ------------------------------
const HeroCarousel = ({ banners, onBannerPress }) => {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        // Use scrollToOffset instead of scrollToIndex to avoid Reanimated errors
        if (listRef.current) {
          try {
            listRef.current.scrollToOffset({ offset: next * width, animated: true });
          } catch (err) {
            console.log('Carousel scroll error:', err);
            // Fallback to scrollToIndex without animation if scrollToOffset fails
            try {
              listRef.current.scrollToIndex({ index: next, animated: false });
            } catch (e) {
              console.log('Carousel scrollToIndex error:', e);
            }
          }
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onBannerPress?.(item)}>
      <Image source={{ uri: item.image }} style={styles.bannerImg} />
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
      />
      <View style={styles.dotsRow}>
        {banners.map((b, i) => (
          <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

// ------------------------------
// Categories
// ------------------------------
const CategoryStrip = ({ categories, onPress, loading }) => {
  // Ensure categories is a valid array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <View style={styles.catWrap}>
      {loading ? (
        <View style={styles.catLoading}>
          <ActivityIndicator size="small" color="#EAB308" />
          <Text style={styles.catLoadingText}>Loading categories…</Text>
        </View>
      ) : safeCategories.length === 0 ? (
        <View style={styles.catLoading}>
          <Text style={styles.catLoadingText}>No categories available</Text>
        </View>
      ) : (
        <FlatList
          data={safeCategories}
          keyExtractor={(item, index) => {
            // Use id/_id if available, otherwise use index as fallback
            const key = item?.id || item?._id || `cat-${index}`;
            return String(key);
          }}
          renderItem={({ item, index }) => {
            if (!item) return null;
            return (
              <TouchableOpacity style={styles.catItem} onPress={() => onPress?.(item)}>
                <Image
                  source={{ uri: item.icon || 'https://via.placeholder.com/120?text=' + encodeURIComponent((item.name || '').slice(0, 1)) }}
                  style={styles.catIcon}
                />
                <Text style={styles.catName} numberOfLines={1}>{item.name || ''}</Text>
              </TouchableOpacity>
            );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
};

// ------------------------------
// Sections & Cards
// ------------------------------
const Section = ({ title, rightLabel, onRightPress, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightLabel ? <TouchableOpacity onPress={onRightPress}><Text style={styles.sectionAction}>{rightLabel}</Text></TouchableOpacity> : null}
    </View>
    {children}
  </View>
);

const ProductCard = ({ item, onPress, small }) => (
  <TouchableOpacity style={[styles.card, small && styles.cardSmall]} onPress={() => onPress?.(item)}>
    <Image source={{ uri: item.image }} style={[styles.cardImg, small && styles.cardImgSmall]} />
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.mrp}>₹{item.mrp}</Text>
      </View>
      <Text style={styles.rating}>⭐ {item.rating}</Text>
      <View style={styles.metaRow}>
        {item.badge ? <Text style={styles.badgeChip}>{item.badge}</Text> : null}
        {item.lowStock ? <Text style={styles.lowStock}>Low stock</Text> : null}
      </View>
    </View>
  </TouchableOpacity>
);

const DealsCard = ({ item, onPress }) => (
  <TouchableOpacity style={[styles.card, styles.cardDeal]} onPress={() => onPress?.(item)}>
    <Image source={{ uri: item.image }} style={styles.cardImg} />
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.mrp}>₹{item.mrp}</Text>
      </View>
      <Text style={styles.discountTag}>{item.discountPct}% OFF</Text>
    </View>
  </TouchableOpacity>
);

// ------------------------------
// Trust Strip (bottom nav with vector icons)
// ------------------------------
import BBSCARTBottomNav from '../../../shared/components/BBSCARTBottomNav';

// ------------------------------
// HomeScreen
// ------------------------------
export default function HomeScreen({ navigation: propNavigation }) {
  // Use navigation hook to access root navigator
  const rootNavigation = useNavigation();
  const navigation = propNavigation || rootNavigation;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [showDeliverTo, setShowDeliverTo] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sliderCategories, setSliderCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const searchTimeoutRef = useRef(null);

  const countdown = useMidnightCountdown();

  // Navigate to GlobalHealth app
  const handleNavigateToGlobalHealth = () => {
    try {
      console.log('Navigating to GlobalHealth...');
      navigateToRoot('GlobalHealth');
      console.log('✅ Navigation to GlobalHealth triggered');
    } catch (error) {
      console.error('❌ Error navigating to GlobalHealth:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Global Health. Please try again.');
    }
  };

  // Navigate to ThiaMobile app
  const handleNavigateToThiaMobile = () => {
    try {
      console.log('Navigating to ThiaMobile...');
      navigateToRoot('ThiaMobile');
      console.log('✅ Navigation to ThiaMobile triggered');
    } catch (error) {
      console.error('❌ Error navigating to ThiaMobile:', error);
      Alert.alert('Navigation Error', 'Could not navigate to ThiaMobile. Please try again.');
    }
  };
  const openCategoryMenu = () => {
    console.log("☰ MENU CLICKED");
    setCategoryVisible(true);
  };

  const closeCategoryMenu = () => {
    console.log("❌ MENU CLOSED");
    setCategoryVisible(false);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const id = setTimeout(() => {
      if (!mounted) return;
      setLoading(false);
    }, 800);
    return () => { mounted = false; clearTimeout(id); };
  }, []);
useEffect(() => {
  AsyncStorage.getItem("deliveryPincode").then((p) => {
    if (!p) setShowDeliverTo(true);
  });
}, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchRecommendedProducts(), fetchAllProducts(), fetchCategories()]);
    setTimeout(() => setRefreshing(false), 800);
  }, [fetchRecommendedProducts, fetchAllProducts, fetchCategories]);

  const navigate = (screen, params) => {
    if (navigation && navigation.navigate) navigation.navigate(screen, params);
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const onBannerPress = (item) => {
    const [type, name] = item.deeplink.split(':');
    if (type === 'Category') navigate('Category', { name });
  };

  const onProductPress = (item) => {
    // Handle both API products (_id) and mock products (id)
    const productId = item._id || item.id;
    navigate('ProductDetails', { productId });
  };

  // Helper function to normalize image URLs (handles various formats)
  const norm = (u) => {
    if (!u) return "";
    const s = String(u).trim();
    // Absolute URLs as-is
    if (/^https?:\/\//i.test(s)) return s;
    
    // Server static paths: allow /uploads and /uploads-bbscart (and nested images/YYYY/MM)
    if (STATIC_PREFIXES.some((pre) => s.startsWith(pre + "/"))) {
      return `https://bbscart.com${s}`;
    }
    
    // Bare filename: fall back to the preferred products folder under /uploads
    return `${IMAGE_BASE}${encodeURIComponent(s)}`;
  };

  // Helper function to pick the best image from product (matches website implementation)
  const pickImage = (p) => {
    // 1) Prefer explicit, already-built URLs from backend
    if (p.product_img_url) return p.product_img_url;
    if (Array.isArray(p.gallery_img_urls) && p.gallery_img_urls[0]) {
      return p.gallery_img_urls[0];
    }
    
    // 2) Fallback to stored fields that might be arrays OR pipe-joined strings
    const firstSingleRaw = Array.isArray(p.product_img)
      ? p.product_img[0]
      : p.product_img;
    const firstGalleryRaw = Array.isArray(p.gallery_imgs)
      ? p.gallery_imgs[0]
      : p.gallery_imgs;
    
    // Handle pipe-joined strings like "a.webp|b.webp"
    const splitFirst = (val) => {
      if (!val) return "";
      const t = String(val).trim();
      return t.includes("|")
        ? t
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)[0]
        : t;
    };
    
    const chosen = splitFirst(firstSingleRaw) || splitFirst(firstGalleryRaw) || p.image || "";
    if (!chosen) return "https://via.placeholder.com/300";
    
    // 3) Normalize into a usable URL (handles absolute, /uploads, /uploads-bbscart, bare filename)
    return norm(chosen);
  };

  // Helper function to get image URL (uses pickImage for consistency)
  const getImageUrl = (item) => {
    return pickImage(item);
  };

  // Map API product to ProductCard format
  const mapProductToCard = (product) => {
    return {
      id: product._id || product.id,
      _id: product._id,
      title: product.name || product.title || "Unknown Product",
      price: product.price || 0,
      mrp: product.mrp || product.oldPrice || null,
      rating: product.rating || product.avgRating || product.reviews_avg || "0.0",
      image: getImageUrl(product),
      badge: product.badge || undefined,
      lowStock: (product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0,
    };
  };

  // Fetch recommended products from API
  const fetchRecommendedProducts = useCallback(async () => {
    try {
      const pincode = await AsyncStorage.getItem("deliveryPincode");
      
      if (!pincode) {
        // If no pincode, don't fetch products
        setRecommendedProducts([]);
        return;
      }

      const res = await axios.get(`${API_BASE}/products/public`, {
        params: { 
          pincode,
          limit: 12, // Limit to 12 products for recommended section
        },
      });

      const list = res.data?.products || res.data?.items || [];
      
      // Map API products to card format
      const mappedProducts = list
        .slice(0, 12) // Ensure max 12 products
        .map(mapProductToCard);
      
      setRecommendedProducts(mappedProducts);
    } catch (err) {
      console.log("❌ RECOMMENDED PRODUCTS FETCH ERROR", err.response?.data || err.message);
      setRecommendedProducts([]);
    }
  }, []);

  // Fetch all products from API
  const fetchAllProducts = useCallback(async () => {
    try {
      const pincode = await AsyncStorage.getItem("deliveryPincode");
      
      if (!pincode) {
        // If no pincode, don't fetch products
        setAllProducts([]);
        return;
      }

      const res = await axios.get(`${API_BASE}/products/public`, {
        params: { 
          pincode,
          limit: 50, // Fetch more products for "All Products" section
        },
      });

      const list = res.data?.products || res.data?.items || [];
      
      // Map API products to card format
      const mappedProducts = list.map(mapProductToCard);
      
      setAllProducts(mappedProducts);
    } catch (err) {
      console.log("❌ ALL PRODUCTS FETCH ERROR", err.response?.data || err.message);
      setAllProducts([]);
    }
  }, []);

  // Fetch categories from API and enrich with relevant image (category image or first product image)
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await axios.get(`${API_BASE}/categories`);
      const list = res.data || [];
      
      // Ensure list is an array
      if (!Array.isArray(list)) {
        setSliderCategories([]);
        setCategoriesLoading(false);
        return;
      }
      
      const enriched = [];
      for (const c of list) {
        if (!c || !c._id) continue; // Skip invalid categories
        
        let iconUrl = null;
        const raw = c.image || c.icon || c.category_img || c.img;
        if (raw) {
          const s = String(raw).trim();
          if (/^https?:\/\//i.test(s)) iconUrl = s;
          else if (STATIC_PREFIXES.some((pre) => s.startsWith(pre + "/"))) iconUrl = `https://bbscart.com${s}`;
          else iconUrl = `${IMAGE_BASE}${encodeURIComponent(s)}`;
        }
        if (!iconUrl) {
          try {
            const subRes = await axios.get(`${API_BASE}/products/catalog/subcategories`, { params: { category_id: c._id } });
            const subs = subRes.data?.items || subRes.data || [];
            if (subs && subs[0]) {
              const pincode = await AsyncStorage.getItem("deliveryPincode");
              const prodRes = await axios.get(`${API_BASE}/products/public`, {
                params: { subcategoryId: subs[0]._id, pincode, limit: 1 },
              });
              const prods = prodRes.data?.products || prodRes.data?.items || [];
              if (prods && prods[0]) iconUrl = getImageUrl(prods[0]);
            }
          } catch (_) {
            // Silently continue if subcategory fetch fails
          }
        }
        enriched.push({
          id: c._id,
          _id: c._id,
          name: c.name || "",
          icon: iconUrl || `https://via.placeholder.com/120?text=${encodeURIComponent((c.name || "").slice(0, 1))}`,
        });
      }
      
      // Update state with the enriched categories array
      setSliderCategories(enriched);
      setCategoriesLoading(false);
    } catch (err) {
      console.log("❌ CATEGORIES FETCH ERROR", err?.response?.data || err?.message);
      setSliderCategories([]);
      setCategoriesLoading(false);
    }
  }, []);

  // Search products and brands
  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const pincode = await AsyncStorage.getItem("deliveryPincode");
      
      const res = await axios.get(`${API_BASE}/products/public`, {
        params: { 
          q: query.trim(),
          pincode: pincode || undefined,
          limit: 50,
        },
      });

      const list = res.data?.products || res.data?.items || [];
      const mappedProducts = list.map(mapProductToCard);
      setSearchResults(mappedProducts);
    } catch (err) {
      console.log("❌ SEARCH ERROR", err.response?.data || err.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search handler
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search API call
    if (text.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(text);
      }, 500); // Wait 500ms after user stops typing
    } else {
      setSearchResults([]);
    }
  }, [searchProducts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch recommended products on mount
  useEffect(() => {
    fetchRecommendedProducts();
    fetchAllProducts();
  }, [fetchRecommendedProducts, fetchAllProducts]);

  const renderHorizontal = (data, renderCard) => (
    <FlatList
      data={data}
      keyExtractor={(it) => it._id || it.id}
      renderItem={({ item }) => renderCard(item)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
          backgroundColor="#0B0B0C"
          translucent={false}
        />
        <Header onSearchPress={openSearchModal} onCartPress={() => navigate('Cart')} onNotifPress={() => navigate('Cart')} />
        <View style={styles.skeletonBanner} />
        <View style={styles.skeletonRow} />
        <View style={styles.skeletonRow} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header onSearchPress={openSearchModal} onCartPress={() => navigate('Cart')} onNotifPress={() => navigate('Notifications')} />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setError(null)}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
        backgroundColor="#0B0B0C"
        translucent={false}
      />
      <View style={styles.mainContainer}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        >
          <Header
            onSearchPress={openSearchModal}
            onMenuPress={openCategoryMenu}
            onNavigateToThiaMobile={handleNavigateToThiaMobile}
            onNavigateToGlobalHealth={handleNavigateToGlobalHealth}
          />
          <CategoryMenu
            visible={categoryVisible}
            onClose={closeCategoryMenu}
          />
          <DeliverToModal
            visible={showDeliverTo}
            onDone={() => {
              setShowDeliverTo(false);
              // Fetch recommended products and all products after pincode is set
              fetchRecommendedProducts();
              fetchAllProducts();
            }}
          />

          <HeroCarousel banners={BANNERS} onBannerPress={onBannerPress} />
          <CategoryStrip
            categories={sliderCategories}
            loading={categoriesLoading}
            onPress={(c) => navigate('Products', { name: c.name })}
          />
          <Section title={`Deals of the Day  ⏱  ${countdown}`} rightLabel="View all" onRightPress={() => navigate('Products')}>
            {renderHorizontal(PRODUCTS_DEALS, (p) => <DealsCard key={p.id} item={p} onPress={onProductPress} />)}
          </Section>
          <Section 
            title="All Products" 
            rightLabel="View all" 
            onRightPress={() => navigate('Products')}
          >
            {allProducts.length > 0 ? (
              renderHorizontal(allProducts, (p) => (
                <ProductCard key={p._id || p.id} item={p} onPress={onProductPress} />
              ))
            ) : (
              <View style={styles.emptyRecommended}>
                <Text style={styles.emptyText}>
                  {refreshing ? "Loading..." : "No products available. Please set your delivery pincode."}
                </Text>
              </View>
            )}
          </Section>
          <Section 
            title="Recommended For You" 
            rightLabel="Refresh" 
            onRightPress={fetchRecommendedProducts}
          >
            {recommendedProducts.length > 0 ? (
              renderHorizontal(recommendedProducts, (p) => (
                <ProductCard key={p._id || p.id} item={p} onPress={onProductPress} small />
              ))
            ) : (
              <View style={styles.emptyRecommended}>
                <Text style={styles.emptyText}>
                  {refreshing ? "Loading..." : "No products available. Please set your delivery pincode."}
                </Text>
              </View>
            )}
          </Section>
        </ScrollView>
        
        {/* Bottom Navigation Bar - Only on Home Screen */}
        <BBSCARTBottomNav />
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={false}
        onRequestClose={closeSearchModal}
      >
        <SafeAreaView style={styles.searchModalContainer}>
          <StatusBar 
            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
            backgroundColor="#0B0B0C"
            translucent={false}
          />
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, brands…"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus={true}
                returnKeyType="search"
              />
              {searching && (
                <ActivityIndicator size="small" color="#EAB308" style={styles.searchLoader} />
              )}
            </View>
            <TouchableOpacity onPress={closeSearchModal} style={styles.searchCancelBtn}>
              <Text style={styles.searchCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchQuery.trim().length > 0 ? (
            searching && searchResults.length === 0 ? (
              <View style={styles.searchEmpty}>
                <ActivityIndicator size="large" color="#EAB308" />
                <Text style={styles.searchEmptyText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      closeSearchModal();
                      onProductPress(item);
                    }}
                  >
                    <Image source={{ uri: item.image }} style={styles.searchResultImage} />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.searchResultPrice}>₹{item.price}</Text>
                      {item.badge && (
                        <Text style={styles.searchResultBadge}>{item.badge}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.searchResultsList}
              />
            ) : (
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyText}>No products found</Text>
                <Text style={styles.searchEmptySubtext}>Try a different search term</Text>
              </View>
            )
          ) : (
            <View style={styles.searchEmpty}>
              <Text style={styles.searchEmptyText}>Start typing to search...</Text>
              <Text style={styles.searchEmptySubtext}>Search for products and brands</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({

 headerRow: {
    flexDirection: "row",
    alignItems: "center",          // vertical center
    justifyContent: "space-between", // space between menu & search
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: "#1c1c1c",     // optional (header bg)
  },

  menuBtn: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  searchBar: {
    flex: 1,                        // take remaining space
    marginLeft: 12,                 // gap from menu icon
    height: 42,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  searchPlaceholder: {
    color: "#999",
    fontSize: 14,
  },


menuIcon: {
  fontSize: 48,
  color: "#000",
},




  container: { flex: 1, backgroundColor: '#0B0B0C' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  brand: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginRight: 6 },


  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A1B1E', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconTxt: { fontSize: 18 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF4D4F', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  bannerImg: { width, height: Math.round(width * 0.45), resizeMode: 'cover', borderRadius: 0 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 4, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: '#fff' },

  catWrap: { paddingVertical: 12 },
  catLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  catLoadingText: { color: '#fff', fontSize: 14 },
  catItem: { width: 84, alignItems: 'center', marginHorizontal: 6 },
  catIcon: { width: 60, height: 60, marginBottom: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  catName: { color: '#fff', fontSize: 12, textAlign: 'center' },

  section: { marginVertical: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 6 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionAction: { color: '#EAB308', fontWeight: '600', fontSize: 12 },

  card: { width: 140, marginRight: 12, backgroundColor: '#1A1B1E', borderRadius: 12, overflow: 'hidden' },
  cardSmall: { width: 120 },
  cardDeal: { width: 160 },
  cardImg: { width: '100%', height: 120, resizeMode: 'cover' },
  cardImgSmall: { height: 100 },
  cardBody: { padding: 6 },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mrp: { color: '#888', textDecorationLine: 'line-through', fontSize: 12 },
  rating: { color: '#FACC15', fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  badgeChip: { color: '#fff', fontSize: 10, backgroundColor: '#2563EB', paddingHorizontal: 4, borderRadius: 4 },
  lowStock: { color: '#EF4444', fontSize: 10, fontWeight: '700' },
  discountTag: { color: '#EF4444', fontSize: 12, fontWeight: '700', marginTop: 2 },

  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 100, // Space for global sticky bottom bar
  },

  skeletonBanner: { width, height: Math.round(width * 0.45), backgroundColor: '#333', marginBottom: 8 },
  skeletonRow: { height: 100, backgroundColor: '#333', marginVertical: 6, marginHorizontal: 12, borderRadius: 12 },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 14, marginBottom: 8 },
  retryBtn: { backgroundColor: '#EAB308', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  retryTxt: { color: '#000', fontWeight: '700' },
  category: { color: '#000', fontWeight: '700' },
  logo: {
    width: 180,
    height: 80,
    resizeMode: 'contain',
    marginLeft: 8,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: -10,
    marginBottom: 10,
  },


  menuIcon: {
    fontSize: 26,
    color: '#fff',
  },
  emptyRecommended: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  // Search Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1B1E',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  searchCancelText: {
    color: '#EAB308',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultsList: {
    padding: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  searchResultBadge: {
    color: '#fff',
    fontSize: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  searchEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchEmptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  searchEmptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

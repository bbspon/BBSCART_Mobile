// ProductListings.js — Thiaworld Jewellery (Gold Collection - API Integrated)
import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator,
    Animated, ScrollView, Dimensions, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 200;

const GOLD_PRODUCTS_API = 'https://thiaworld.bbscart.com/api/products/gold';

// ✅ IMAGE URL FIX (VERY IMPORTANT) - Enhanced version
const buildImageUrl = (img) => {
    // ✅ Safety check: handle undefined/null/empty
    if (!img || typeof img !== 'string' || img.trim() === '') {
        return 'https://via.placeholder.com/150'; // Return placeholder instead of empty string
    }

    // ✅ Clean up the image source (remove any pipe-separated values)
    let imageSource = img;
    if (imageSource.includes('|')) {
        imageSource = imageSource.split('|')[0].trim();
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

// ---------------- Hero Banner (UNCHANGED) ----------------
const heroBannerImages = [
    { id: '1', image: require('../assets/img/banner1.jpg'), title: 'Gold Festive Collection' },
    { id: '2', image: require('../assets/img/banner2.jpg'), title: 'Gold Divine Collection' },
    { id: '3', image: require('../assets/img/banner3.jpg'), title: 'Gold Wedding Specials' },
];

const ProductListings = () => {
    const insets = useSafeAreaInsets();
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist(); // ✅ Use WishlistContext

    const [selectedQuantity, setSelectedQuantity] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('default');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // ---------------- Auto Slide Banners (UNCHANGED) ----------------
    useEffect(() => {
        const intervalId = setInterval(() => {
            const nextIndex = (currentIndex + 1) % heroBannerImages.length;
            setCurrentIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: width * nextIndex,
                animated: true,
            });
        }, 4000);
        return () => clearInterval(intervalId);
    }, [currentIndex]);

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                setCurrentIndex(index);
            },
        }
    );

    // ---------------- FETCH GOLD PRODUCTS FROM API ----------------
    useEffect(() => {
        loadGoldProducts();
    }, [searchQuery, sortOption]);

    const loadGoldProducts = async () => {
        try {
            setLoading(true);

            const response = await fetch(GOLD_PRODUCTS_API);
            const result = await response.json();

            const rawProducts = Array.isArray(result)
                ? result
                : result.items || result.data || [];

            // ✅ Debug: Log first product to see image structure
            if (rawProducts.length > 0) {
                console.log('📦 Sample product from API:', {
                    id: rawProducts[0]._id,
                    name: rawProducts[0].name,
                    hasImages: !!rawProducts[0].images,
                    imagesType: Array.isArray(rawProducts[0].images) ? 'array' : typeof rawProducts[0].images,
                    imagesValue: rawProducts[0].images,
                    hasImage: !!rawProducts[0].image,
                    imageValue: rawProducts[0].image,
                });
            }

            let mappedProducts = rawProducts.map((p) => {
                // ✅ Extract image from multiple possible sources
                let imageSource = null;

                // Try images array first
                if (p.images && Array.isArray(p.images) && p.images.length > 0) {
                    const firstImage = p.images[0];
                    // Handle string or object format
                    if (typeof firstImage === 'string') {
                        imageSource = firstImage;
                    } else if (typeof firstImage === 'object' && firstImage !== null) {
                        imageSource = firstImage.url || firstImage.src || firstImage.image || firstImage.uri;
                    }
                }

                // Fallback to single image field
                if (!imageSource) {
                    imageSource = p.image || p.product_img || p.productImg || p.product_image || p.mainImage;
                }

                // Build final image URL
                const finalImage = imageSource ? buildImageUrl(imageSource) : 'https://via.placeholder.com/150';

                return {
                    id: p._id,
                    _id: p._id, // Keep _id for navigation
                    name: p.name,
                    category: (p.category || 'gold').toLowerCase(), // Ensure lowercase
                    image: finalImage,
                    images: p.images || [], // Keep images array for product details
                    price: p.finalPrice || p.price || 0, // Add direct price field
                    mrp: p.mrp || p.strikePrice || p.finalPrice || p.price || 0, // Add MRP field
                    priceOptions: [
                        {
                            weight: `${p.netWeight || 0}g`,
                            price: p.finalPrice || p.price || 0,
                        },
                    ],
                };
            });

            // Search
            if (searchQuery) {
                mappedProducts = mappedProducts.filter((p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Sorting
            if (sortOption === 'lowToHigh') {
                mappedProducts.sort(
                    (a, b) => a.priceOptions[0].price - b.priceOptions[0].price
                );
            } else if (sortOption === 'highToLow') {
                mappedProducts.sort(
                    (a, b) => b.priceOptions[0].price - a.priceOptions[0].price
                );
            }

            setProducts(mappedProducts);
        } catch (error) {
            console.log('Gold product fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleAddToCart = (product) => {
        try {
            const selectedQty = productQuantities[product.id] || 1;

            const cartProduct = {
                id: product.id || product._id,
                name: product.name,
                category: (product.category || 'gold').toLowerCase(),
                price: product.priceOptions?.[0]?.price || product.price || 0,
                image: product.image,
                images: product.images || [],
                quantity: selectedQty,
                mrp: product.mrp || product.priceOptions?.[0]?.price || 0,
            };

            addToCart(cartProduct);
            setProductQuantities(prev => ({
                ...prev,
                [product.id]: 1
            }));
            Alert.alert(
                'Added to Cart',
                `${product.name}\nQuantity: ${selectedQty}`,
                [{ text: 'OK' }]
            );

        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart.');
        }
    };

    const handleToggleWishlist = async (productId) => {
        try {
            await toggleWishlist(productId);
        } catch (error) {
            console.log('Wishlist toggle error:', error);
            // Error handling is done in WishlistContext
        }
    };

    const handleViewProduct = (product) => {
        navigation.navigate('ProductDetails', {
            id: product._id || product.id,
        });
    };

    const incrementQuantity = (productId) => {
        setProductQuantities((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 1) + 1,
        }));
    };

    const decrementQuantity = (productId) => {
        setProductQuantities((prev) => ({
            ...prev,
            [productId]: prev[productId] > 1 ? prev[productId] - 1 : 1,
        }));
    };

    const renderProduct = ({ item }) => {
        const currentPriceOption = selectedQuantity[item.id] || item.priceOptions[0];
        const productQuantity = productQuantities[item.id] || 1;
        const itemIsWishlisted = isWishlisted(item.id); // ✅ Use WishlistContext

        return (
            <View style={styles.productContainer}>
                <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={(error) => {
                        console.log('❌ Product image load error:', item.id, item.name, 'URL:', item.image);
                    }}
                />

                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>

                    <Text style={styles.productPrice}>
                        ₹{formatPrice(currentPriceOption.price * productQuantity)}
                    </Text>

                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                            <Text>➖</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{productQuantity}</Text>
                        <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
                            <Text>➕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionIcons}>
                        <TouchableOpacity
                            onPress={() => handleToggleWishlist(item.id)}
                            style={styles.wishlistButton}
                        >
                            <Icon
                                name={itemIsWishlisted ? 'heart' : 'heart-outline'}
                                size={24}
                                color={itemIsWishlisted ? 'red' : '#666'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Icon name="cart-outline" size={16} color="#333" style={{ marginRight: 4 }} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleViewProduct(item)}
                            style={styles.viewButton}
                        >
                            <Icon name="eye-outline" size={24} color="#666" />
                        </TouchableOpacity>
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
                    {heroBannerImages.map((item) => (
                        <View key={item.id} style={styles.slide}>
                            <Image source={item.image} style={styles.bannerImage} />
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Search gold jewellery..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <View style={styles.filterRow}>
                <View style={styles.filterContainer}>
                    <Text style={styles.filterText}>Sort:</Text>
                    <Picker
                        selectedValue={sortOption}
                        style={styles.categoryPicker}
                        onValueChange={(value) => setSortOption(value)}
                    >
                        <Picker.Item label="Default" value="default" />
                        <Picker.Item label="Price: Low to High" value="lowToHigh" />
                        <Picker.Item label="Price: High to Low" value="highToLow" />
                    </Picker>
                </View>
            </View>

            <Text style={styles.totalProductsText}>
                Total Products: {products.length}
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color="#c5a900" />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
                    getItemLayout={(data, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
                />
            )}
        </View>
    );
};

// ---------------- STYLES (UNCHANGED) ----------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9f6' },
    heroBanner: { height: 180, marginBottom: 10 },
    slide: { width, justifyContent: 'center', alignItems: 'center' },
    bannerImage: { width: '100%', height: 180, resizeMode: 'cover' },
    searchBar: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    filterText: { fontWeight: 'bold', marginRight: 5 },
    categoryPicker: { height: 50, width: 200 },
    totalProductsText: {
        textAlign: 'right',
        marginRight: 15,
        color: '#777',
    },
    productContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        margin: 10,
        borderRadius: 8,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#f5f5f5', // Background color for placeholder
    },
    productDetails: { flex: 1, paddingLeft: 10 },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#6c4a00' },
    productPrice: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    quantityValue: { marginHorizontal: 10 },
    actionIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 8,
    },
    wishlistButton: {
        padding: 4,
    },
    addToCartButton: {
        backgroundColor: '#e6d36f',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    addToCartText: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 14,
    },
    viewButton: {
        padding: 4,
    },
});

export default ProductListings;

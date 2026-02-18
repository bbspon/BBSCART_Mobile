// BBSCART Navigator - Migrated from BBSCARTMobile_23Jan/App.js
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FlashMessage from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BBSCARTLOGO from "../apps/bbscart/assets/images/bbscart-logo.png";

// ---------- Screens ----------
import Home from "../apps/bbscart/screens/Home";
import Dashboard from "../apps/bbscart/screens/Dashboard";
import FranchiseHeadScreen from "../apps/bbscart/screens/FranchiseHeadScreen";
import Franchisee from "../apps/bbscart/screens/Franchisee";
import TerritoryHead from "../apps/bbscart/screens/TerritoryHead";
import AgentScreen from "../apps/bbscart/screens/AgentScreen";
import AgentForm from "../apps/bbscart/screens/AgentForm";
import VendorScreen from "../apps/bbscart/screens/VendorScreen";
import VendorForm from "../apps/bbscart/screens/VendorForm";
import BecomeVendorScreen from "../apps/bbscart/screens/BecomeVendorScreen";
import CustomerBVendor from "../apps/bbscart/screens/CustomerBVendor";
import ProfileSettingsScreen from "../apps/bbscart/screens/ProfileSettings";
import CartPage from "../apps/bbscart/screens/CartScreen";
import ProductListings from "../apps/bbscart/screens/ProductListings";
import CheckoutPage from "../apps/bbscart/screens/CheckoutScreen";
import SuccessPage from "../apps/bbscart/screens/SuccessPage";
import Notifications from "../apps/bbscart/screens/Notifications";
import ProductDetails from "../apps/bbscart/screens/ProductDetails";
import Registration from "../apps/bbscart/screens/SignUp";
import SignIn from "../apps/bbscart/screens/SignInScreen";
import IntroScreen from "../apps/bbscart/screens/IntroScreen";
import UserAccount from "../apps/bbscart/screens/UserAccount";
import OrderHistory from "../apps/bbscart/screens/OrderHistory";
import Wishlist from "../apps/bbscart/screens/Wishlist";
import Coupons from "../apps/bbscart/screens/Coupons";
import MyWallet from "../apps/bbscart/screens/MyWallet";
import SavedCardsUPI from "../apps/bbscart/screens/SavedCardsUPI";
import RewardsScreen from "../apps/bbscart/screens/RewardsScreen";
import ResetPasswordFlow from "../apps/bbscart/screens/ResetPassword";
import ContactUsScreen from "../apps/bbscart/screens/ContactUsScreen";
import FeedbackScreen from "../apps/bbscart/screens/FeedbackScreen";
import AppSettingsScreen from "../apps/bbscart/screens/AppSettingsScreen";
import ChangePassword from "../apps/bbscart/screens/ChangePasswordScreen";
import TermsOfUse from "../apps/bbscart/screens/TermsOfUseScreen";
import PrivacyPolicyScreen from "../apps/bbscart/screens/PrivacyPolicyScreen";
import CancellationPolicyScreen from "../apps/bbscart/screens/CancellationPolicyScreen";
import ShippingPolicyScreen from "../apps/bbscart/screens/ShippingPolicyScreen";
import RefundPolicyScreen from "../apps/bbscart/screens/RefundPolicyScreen";
import BuybackPolicyScreen from "../apps/bbscart/screens/BuybackPolicyScreen";
import ExchangePolicyScreen from "../apps/bbscart/screens/ExchangePolicyScreen";
import BankCashbackPolicyScreen from "../apps/bbscart/screens/BankCashbackPolicyScreen";
import SubcategoryProductsScreen from "../apps/bbscart/screens/SubcategoryProductsScreen";

// ---------- Contexts ----------
import { CartProvider, useCart } from "../apps/bbscart/contexts/CartContext";
import { WishlistProvider, useWishlist } from "../apps/bbscart/contexts/WishlistContext";
import { AuthProvider, useAuth } from "../apps/bbscart/contexts/AuthContext";

const Stack = createNativeStackNavigator();

/* ---------------- HEADER ICONS WITH COUNTS COMPONENT ---------------- */
function HeaderIcons({ navigation }) {
  const { totalCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length || 0;

  return (
    <View style={styles.headerIconsContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Notifications")}
        style={styles.iconButton}
      >
        <Icon name="bell-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate("Cart")}
        style={styles.iconButton}
      >
        <View style={styles.iconWrapper}>
          <Icon name="cart-outline" size={24} color="#FFFFFF" />
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalCount > 99 ? "99+" : totalCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Wishlist")}
        style={styles.iconButton}
      >
        <View style={styles.iconWrapper}>
          <Icon name="heart-outline" size={24} color="#FFFFFF" />
          {wishlistCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- AUTH STACK ---------------- */
function AuthStack({ showIntro }) {
  return (
    <Stack.Navigator initialRouteName={showIntro ? "Intro" : "SignIn"}>
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={Registration}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPasswordFlow"
        component={ResetPasswordFlow}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

/* ---------------- HEADER LOGO COMPONENT ---------------- */
function HeaderLogo() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={BBSCARTLOGO}
        style={styles.headerLogo}
        resizeMode="contain"
      />
    </View>
  );
}

/* ---------------- MAIN APP STACK ---------------- */
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'default', // Use default animation to avoid Reanimated issues
        animationDuration: 200, // Shorter animation duration
        cardStyle: { backgroundColor: '#0B0B0C' }, // Set default background color for all screens
      }}
    >
        <Stack.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            headerTitle: () => <HeaderLogo />,
            headerTitleAlign: "center",
            headerStyle: { 
              backgroundColor: '#0B0B0C',
              height: 60,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleContainerStyle: {
              left: 0,
              right: 0,
              justifyContent: "center",
              alignItems: "center",
              height: 60,
              overflow: "visible",
            },
            headerRight: () => <HeaderIcons navigation={navigation} />,
          })}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard}
          options={{
            title: 'Dashboard',
            animation: 'simple_push',
            headerStyle: { backgroundColor: '#0B0B0C' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
          }}
        />
        <Stack.Screen name="FranchiseHead" component={FranchiseHeadScreen} />
        <Stack.Screen name="Franchisee" component={Franchisee} />
        <Stack.Screen name="TerritoryHead" component={TerritoryHead} />
        <Stack.Screen name="Agent" component={AgentScreen} />
        <Stack.Screen name="AgentForm" component={AgentForm} />
        <Stack.Screen name="Vendor" component={VendorScreen} />
        <Stack.Screen name="VendorForm" component={VendorForm} />
        <Stack.Screen name="BecomeAVendor" component={BecomeVendorScreen} />
        <Stack.Screen name="CustomerBVendor" component={CustomerBVendor} />
        <Stack.Screen name="UserAccount" component={UserAccount} />
        <Stack.Screen name="Cart" component={CartPage} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Products" component={ProductListings} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen 
          name="ProfileSettings" 
          component={ProfileSettingsScreen}
          options={{
            animation: 'simple_push', // Simpler animation for ProfileSettings
          }}
        />
        <Stack.Screen name="Settings" component={AppSettingsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutPage} />
        <Stack.Screen name="Success" component={SuccessPage} />
        <Stack.Screen name="Orders" component={OrderHistory} />
        <Stack.Screen name="Wishlist" component={Wishlist} />
        <Stack.Screen name="Coupons" component={Coupons} />
        <Stack.Screen name="Wallet" component={MyWallet} />
        <Stack.Screen name="Payments" component={SavedCardsUPI} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUse} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
        <Stack.Screen name="ShippingPolicy" component={ShippingPolicyScreen} />
        <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
        <Stack.Screen name="BuybackPolicy" component={BuybackPolicyScreen} />
        <Stack.Screen name="ExchangePolicy" component={ExchangePolicyScreen} />
        <Stack.Screen name="BankCashbackPolicy" component={BankCashbackPolicyScreen} />
        <Stack.Screen name="SubcategoryProducts" component={SubcategoryProductsScreen} />
      </Stack.Navigator>
  );
}

/* ---------------- ROOT NAVIGATOR ---------------- */
function RootNavigator() {
  // Step 1.1 Simple launch: use local auth only for gate (no verifyToken on startup).
  // Switch back to useUnifiedAuth() in Step 2.1 when re-adding single login.
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [checkingFirstLaunch, setCheckingFirstLaunch] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("bbscart_hasLaunched");
        if (hasLaunched === null) {
          // First launch - show intro
          setIsFirstLaunch(true);
          await AsyncStorage.setItem("bbscart_hasLaunched", "true");
        } else {
          // Not first launch - skip intro
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.log("Error checking first launch:", error);
        setIsFirstLaunch(false);
      } finally {
        setCheckingFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Show loading while checking first launch and auth status
  if (checkingFirstLaunch || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  // If logged in (local auth), show MainStack; else AuthStack (Intro or SignIn)
  return isLoggedIn ? <MainStack /> : <AuthStack showIntro={isFirstLaunch} />;
}

/* ---------------- APP ROOT ---------------- */
export default function BBSCARTNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C' }}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NavigationIndependentTree>
              <NavigationContainer
                theme={{
                  dark: true,
                  colors: {
                    primary: '#0B0B0C',
                    background: '#0B0B0C',
                    card: '#0B0B0C',
                    text: '#FFFFFF',
                    border: '#1A1B1E',
                    notification: '#EAB308',
                  },
                  fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '800' },
                  },
                }}
              >
                <RootNavigator />
              </NavigationContainer>
            </NavigationIndependentTree>
            <FlashMessage position="top" />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  logoContainer: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    position: "relative",
  },
  headerLogo: {
    width: 350,
    height: 150,
    marginTop: -45,
    marginBottom: -45,
  },
  headerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    overflow: "visible",
  },
  iconButton: {
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "white",
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 14,
  },
});

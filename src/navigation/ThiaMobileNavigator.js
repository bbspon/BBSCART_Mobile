// ThiaMobile Navigator - Migrated from ThiaMobile_23Jan/App.js
import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartProvider } from '../apps/thiamobile/contexts/CartContext';
import { WishlistProvider } from '../apps/thiamobile/contexts/WishlistContext';
import { ThemeProvider, useTheme } from '../apps/thiamobile/contexts/ThemeContext';
import { useUnifiedAuth } from '../shared/contexts/UnifiedAuthContext';
import ErrorBoundary from '../apps/thiamobile/components/ErrorBoundary';
import CustomDrawer from '../apps/thiamobile/components/CustomDrawer';

// ✅ Logo for header
const ThiaworldLogo = require('../apps/thiamobile/assets/thiaworldlogo.png');
import Home from '../apps/thiamobile/screens/HomeScreen';
import ProductListings from '../apps/thiamobile/screens/ProductListing';
import ProductDetails from '../apps/thiamobile/screens/ProductDetail';
import CartPage from '../apps/thiamobile/screens/CartScreen';
import Notifications from '../apps/thiamobile/screens/Notifications';
import ProfileSettingsScreen from '../apps/thiamobile/screens/ProfileSettingsScreen';
import AppSettingsScreen from '../apps/thiamobile/screens/AppSettingsScreen';
import UserAccount from '../apps/thiamobile/screens/UserAccount';
import MyWalletStyled from '../apps/thiamobile/screens/MyWallet';
import OrderHistory from '../apps/thiamobile/screens/OrderHistory';
import JewelryWishlist from '../apps/thiamobile/screens/Wishlist';
import GoldExchangeBuyback from '../apps/thiamobile/screens/GoldExchangeBuyback';
import SaveCardAndUPI from '../apps/thiamobile/screens/SaveCardAndUPI';
import BookStoreVisit from '../apps/thiamobile/screens/BookStoreVisit';
import RewardsScreen from '../apps/thiamobile/screens/RewardsScreen';
import SavedAddressScreen from '../apps/thiamobile/screens/SavedAddressScreen';
import DashboardScreen from '../apps/thiamobile/screens/Dashboard';
import FranchiseDashboard from '../apps/thiamobile/screens/FranchiseHeadScreen';
import TerritoryDashboardScreen from '../apps/thiamobile/screens/TerritoryHead';
import AgentScreen from '../apps/thiamobile/screens/AgentScreen';
import VendorDashboard from '../apps/thiamobile/screens/VendorScreen';
import BecomeVendorDashboard from '../apps/thiamobile/screens/BecomeVendorScreen';
import CheckoutPage from '../apps/thiamobile/screens/CheckoutScreen';
import SuccessPage from '../apps/thiamobile/screens/SuccessPage';
import IntroScreen from '../apps/thiamobile/screens/IntroScreen';
import SignInScreen from '../apps/thiamobile/screens/SignInScreen';
import Registration from '../apps/thiamobile/screens/SignUp';
import ForgotPasswordScreen from '../apps/thiamobile/screens/ForgotPasswordScreen';
import GoldSilverRatesScreen from '../apps/thiamobile/screens/GoldSilverRatesScreen';
import AboutUsScreen from '../apps/thiamobile/screens/Aboutus';
import TermsAndConditionsPage from '../apps/thiamobile/screens/TermsAndConditions';
import ContactUsScreen from '../apps/thiamobile/screens/ContactUs';
import ThiaSecurePlan from '../apps/thiamobile/screens/ThiaSecurePlan';
import SearchScreen from '../apps/thiamobile/screens/SearchScreen';
import GoldPlanScreen from '../apps/thiamobile/screens/GoldPlanScreen';
import TryAtHomeScreen from '../apps/thiamobile/screens/TryAtHomeScreen';

// Navigators
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

/* ------------------ Auth Stack ------------------ */
function AuthStack() {
  const { colors, isDark } = useTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={Registration} options={{ headerShown: false }} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      />
    </Stack.Navigator>
  );
}

/* ------------------ Home Drawer Navigator ------------------ */
function HomeDrawer() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: true,
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        headerStyle: {
          backgroundColor: colors.header,
          height: 56 + insets.top,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStatusBarHeight: insets.top,
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="HomeMain"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

/* ------------------ Main App Navigator (with Theme) ------------------ */
function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, loading: authLoading } = useUnifiedAuth();
  const statusBarBg = colors.header || (isDark ? '#1a1a1a' : '#fff');
  
  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? statusBarBg : undefined}
        translucent={false}
      />
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      {/* Show loading while checking auth */}
      {authLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Stack.Navigator 
          initialRouteName={isAuthenticated ? "HomeMain" : "Welcome"}
          screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { 
              color: colors.text,
              fontWeight: '600',
            },
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          {/* Auth Flow - Only show if not authenticated */}
          {!isAuthenticated && (
            <Stack.Screen 
              name="Welcome" 
              component={AuthStack}  
              options={{ headerShown: false }}
            />
          )}

          {/* Main App - Always accessible */}
          <Stack.Screen
            name="HomeMain"
            component={HomeDrawer}
            options={{ headerShown: false }}
          />

          {/* Main App Screens */}
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
          options={{
            title: '',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              color: colors.text,
            },
            headerStyle: {
              backgroundColor: colors.header,
            },
          }}
        />

        <Stack.Screen
          name="SignUp"
          component={Registration}
          options={{
            title: 'Sign Up',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="ThiaSecurePlan"
          component={ThiaSecurePlan}
          options={{
            title: 'Thia Secure Plan',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{
            title: 'Sign In',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />
         
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: 'Forgot Password',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Home"
          component={HomeDrawer}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Products"
          component={ProductListings}
          options={{
            title: 'Product Listings',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="ProductDetails"
          component={ProductDetails}
          options={{
            title: 'Product Details',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Cart"
          component={CartPage}
          options={{
            title: 'My Cart',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Account"
          component={UserAccount}
          options={{
            title: 'Account',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name='MyWallet'
          component={MyWalletStyled}
          options={{
            title: 'My Wallet',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileSettingsScreen}
          options={{
            title: 'Profile',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Orders"
          component={OrderHistory}
          options={{
            title: 'Order History',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Wishlist"
          component={JewelryWishlist}
          options={{
            title: 'My Wishlist',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Exchange"
          component={GoldExchangeBuyback}
          options={{
            title: 'Gold Exchange Buy ',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Payments"
          component={SaveCardAndUPI}
          options={{
            title: 'My Bank Account ',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="StoreVisit"
          component={BookStoreVisit}
          options={{
            title: 'Book Store Visit ',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Rewards"
          component={RewardsScreen}
          options={{
            title: 'Exclusive Offers',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="GoldPlan"
          component={GoldPlanScreen}
          options={{
            title: 'Gold Plan',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="TryAtHome"
          component={TryAtHomeScreen}
          options={{
            title: 'Try@Home',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="ProfileSettings"
          component={ProfileSettingsScreen}
          options={{
            title: 'Profile Settings',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Settings"
          component={AppSettingsScreen}
          options={{
            title: 'App Settings',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Addresses"
          component={SavedAddressScreen}
          options={{
            title: 'My Address',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />
        
        <Stack.Screen
          name="Ratings"
          component={GoldSilverRatesScreen}
          options={{
            title: 'Gold & Silver Ranges',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Franchise"
          component={FranchiseDashboard}
          options={{
            title: 'Franchise Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Territory"
          component={TerritoryDashboardScreen}
          options={{
            title: 'Territory Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Agent"
          component={AgentScreen}
          options={{
            title: 'Agent Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Vendor"
          component={VendorDashboard}
          options={{
            title: 'Vendor Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="BecomeAVendor"
          component={BecomeVendorDashboard}
          options={{
            title: 'Become A Vendor Dashboard',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutPage}
          options={{
            title: 'Checkout',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />
        
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{
            title: 'About Us',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditionsPage}
          options={{
            title: 'Terms And Conditions',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{
            title: 'Contact Us',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />

        <Stack.Screen
          name="Success"
          component={SuccessPage}
          options={{
            title: 'Successfully',
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
          }}
        />
        </Stack.Navigator>
      )}
    </NavigationContainer>
    </>
  );
}

// --------- Root App ----------
export default function ThiaMobileNavigator() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WishlistProvider>
          <CartProvider>
            <NavigationIndependentTree>
              <AppNavigator />
            </NavigationIndependentTree>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

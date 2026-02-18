// GlobalHealth Navigator - Migrated from GlobalHealth_23Jan/App.js
import React, { useMemo, useState, useEffect } from 'react';
import { StatusBar, TouchableOpacity, View, ActivityIndicator, Dimensions, InteractionManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { ThemeProvider, useAppTheme } from '../shared/contexts/ThemeContext';
import { useUnifiedAuth } from '../shared/contexts/UnifiedAuthContext';

// Import all GlobalHealth screens
import Intro from '../apps/globalhealth/screens/IntroScreen';
import Registration from '../apps/globalhealth/screens/SignUpScreen';
import SignInScreen from '../apps/globalhealth/screens/SignInScreen';
import HomeScreen from '../apps/globalhealth/screens/HomeScreen';
import ForgotPasswordScreen from '../apps/globalhealth/screens/ForgotPasswordScreen';
import HealthPlansLandingScreen from '../apps/globalhealth/screens/HealthPlansLandingScreen';
import AboutUs from '../apps/globalhealth/screens/AboutUsScreen';
import HospitalDashboardHome from '../apps/globalhealth/screens/HospitalDashboard';
import HospitalOnboardingForm from '../apps/globalhealth/screens/HospitalOnboarding';
import PlanComparisonScreen from '../apps/globalhealth/screens/PlanComparisonScreen';
import MyPlanScreen from '../apps/globalhealth/screens/MyPlanScreen';
import HealthAccessScreen from '../apps/globalhealth/screens/HealthAccessScreen';
import AdminWellnessDashboard from '../apps/globalhealth/screens/AdminWellnessScreen';
import BookingScreen from '../apps/globalhealth/screens/BookingManagerScreen';
import DataFlowScreen from '../apps/globalhealth/screens/DataFlowScreen';
import MedicalVaultScreen from '../apps/globalhealth/screens/MedicalVaultScreen';
import PlanUsageScreen from '../apps/globalhealth/screens/PlanUsageScreen';
import HealthMembershipScreen from '../apps/globalhealth/screens/HealthMembershipScreen';
import PartnerHospitals from '../apps/globalhealth/screens/PartnerHospitalsScreen';
import BookHealthVisit from '../apps/globalhealth/screens/BookHealthVisitScreen';
import ContactUs from '../apps/globalhealth/screens/ContactUsScreens';
import DownloadsPage from '../apps/globalhealth/screens/DownloadScreen';
import TermsConditionsAdvanced from '../apps/globalhealth/screens/TermsConditionsScreen';
import DataProtectionPolicy from '../apps/globalhealth/screens/DataProtection';
import HelpCenter from '../apps/globalhealth/screens/HelpCenter';
import HealthcareCartScreen from '../apps/globalhealth/screens/CartScreen';
import StakeholdersPage from '../apps/globalhealth/screens/StakeholdersScreen';
import HealthCarePage from '../apps/globalhealth/screens/HealthcareScreen';
import HospitalPlanTiers from '../apps/globalhealth/screens/HospitalPlanTiersScreen';
import ServiceAvailability from '../apps/globalhealth/screens/ServiceAvailability';
import CarePassScanner from '../apps/globalhealth/screens/CarePassScannerScreen';
import AnalyticsPage from '../apps/globalhealth/screens/BillAnalyticsScreen';
import SupportPage from '../apps/globalhealth/screens/SupportScreen';
import PaymentsWalletPage from '../apps/globalhealth/screens/PaymentsWalletScreen';
import DigitalHealthCard from '../apps/globalhealth/screens/DigitalHealthCardScreen';
import RevenueEngineDashboardScreen from '../apps/globalhealth/screens/RevenueEngineScreen';
import EmergencyDashboard from '../apps/globalhealth/screens/EmergencyScreen';
import WellnessTrackerScreen from '../apps/globalhealth/screens/WellnessTrackerScreen';
import PlanComparisonEditor from '../apps/globalhealth/screens/PlanComparisonEditor';
import PlanEligibility from '../apps/globalhealth/screens/PlanEligibilityScreen';
import PrescriptionLoop from '../apps/globalhealth/screens/PrescriptionLoop';
import PlanPaymentScreen from '../apps/globalhealth/screens/PlanPaymentScreen';
import AIDiseasePredictionRiskEngine from '../apps/globalhealth/screens/AIDiseasePredictionRiskEngine';
import CountryPlans from '../apps/globalhealth/screens/CountryPlans';
import CoverageStatus from '../apps/globalhealth/screens/CoverageStatus';
import HospitalPartnershipKit from '../apps/globalhealth/screens/HospitalPartnershipKit';
import HealthAccessPage from '../apps/globalhealth/screens/HealthAccessPage';
import LabDiagnostics from '../apps/globalhealth/screens/LabDiagnostics';
import ComplianceMainPage from '../apps/globalhealth/screens/ComplianceMainPage';
import PatientFeedbackEngine from '../apps/globalhealth/screens/PatientFeedbackEngine';
import familyHealthTimeline from '../apps/globalhealth/screens/FamilyHealthTimeline';
import FamilyMember from '../apps/globalhealth/screens/FamilyMembersPage';
import consultRoom from '../apps/globalhealth/screens/ConsultRoom';
import healthInsightsEngine from '../apps/globalhealth/screens/HealthInsightsEngine';
import grievanceResolution from '../apps/globalhealth/screens/GrievanceResolutionSystem';
import PharmacyIntegrationDashboard from '../apps/globalhealth/screens/PharmacyIntegrationDashboard';
import UserFeedbackRatingsSystem from '../apps/globalhealth/screens/UserFeedbackRatingsSystem';
import UnifiedAPIAdminDashboard from '../apps/globalhealth/screens/UnifiedAPIAdminDashboard';
import PurchaseSummary from '../apps/globalhealth/screens/PurchaseSummary';
import QRHealthPass from '../apps/globalhealth/screens/QRHealthPass';
import PerformanceScoring from '../apps/globalhealth/screens/PerformanceScoring';
import AppointmentOtp from '../apps/globalhealth/screens/AppointmentOtp';
import PublicPartnerAccessDashboard from '../apps/globalhealth/screens/PublicPartnerAccessDashboard';
import Notifications from '../apps/globalhealth/screens/Notifications';
import OfflineDeployment from '../apps/globalhealth/screens/OfflineDeployment';
import InteropGovHealthSystem from '../apps/globalhealth/screens/InteropGovHealthSystem';
import UAEInsuranceIntegration from '../apps/globalhealth/screens/UAEInsuranceIntegration';
import InsuranceIntegration from '../apps/globalhealth/screens/InsuranceIntegration';
import HomeVisitBooking from '../apps/globalhealth/screens/HomeVisitBooking';
import QR from '../apps/globalhealth/screens/QR';
import HealthInsightsTrendsAI from '../apps/globalhealth/screens/HealthInsightsTrendsAI';
import HealthPassportExportSystem from '../apps/globalhealth/screens/HealthPassportExportSystem';
import FormCard from '../apps/globalhealth/screens/FormCardForm';
import PlanDetailsScreen from '../apps/globalhealth/screens/PlanDetailsScreen';
import DoctorReferral from '../apps/globalhealth/screens/DoctorReferral';

// --------- Stack & Drawer instances ----------
const RootStack = createNativeStackNavigator();
const AuthStackNav = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HospitalStackNav = createNativeStackNavigator();
const OnboardingStackNav = createNativeStackNavigator();
const DataFlowStackNav = createNativeStackNavigator();
const MedicalVaultStackNav = createNativeStackNavigator();
const PlanUsageStackNav = createNativeStackNavigator();
const HealthMembershipStackNav = createNativeStackNavigator();
const HospitalPartnerStackNav = createNativeStackNavigator();
const PartnerHospitalsStackNav = createNativeStackNavigator();
const BookHealthVisitStackNav = createNativeStackNavigator();
const CartStackNav = createNativeStackNavigator();
const PlanTierPlanStackNav = createNativeStackNavigator();
const ServiceAvailabilityStackNav = createNativeStackNavigator();
const CarePassScannerStackNav = createNativeStackNavigator();
const BillAnalyticsStackNav = createNativeStackNavigator();
const SupportStackNav = createNativeStackNavigator();
const WalletStackNav = createNativeStackNavigator();
const DigitalHealthStackNav = createNativeStackNavigator();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Intro" component={Intro} />
      <AuthStackNav.Screen name="SignUp" component={Registration} />
      <AuthStackNav.Screen name="SignIn" component={SignInScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
  );
}

// --------- Drawer Flow (theme aware) ----------
function DrawerStack() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [drawerReady, setDrawerReady] = useState(() => {
    // Check dimensions synchronously
    try {
      const { width, height } = Dimensions.get('window');
      return !!(width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (drawerReady) return;

    // Wait for interactions and add longer delay
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        try {
          const { width, height } = Dimensions.get('window');
          if (width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
            setDrawerReady(true);
          } else {
            // Retry if dimensions are not valid
            setTimeout(() => {
              try {
                const { width: w, height: h } = Dimensions.get('window');
                if (w && h && !isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                  setDrawerReady(true);
                }
              } catch (err) {
                console.warn('⚠️ Error retrying dimensions in DrawerStack:', err);
              }
            }, 500);
          }
        } catch (error) {
          console.warn('⚠️ Error checking dimensions in DrawerStack:', error);
        }
      }, 600); // Longer delay to ensure everything is ready
    });

    // Also check immediately with delay
    const immediateCheck = setTimeout(() => {
      try {
        const { width, height } = Dimensions.get('window');
        if (width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          setDrawerReady(true);
        }
      } catch (error) {
        // Will be handled by InteractionManager
      }
    }, 600);

    return () => {
      interactionHandle.cancel();
      clearTimeout(immediateCheck);
    };
  }, [drawerReady]);

  const drawerActive = '#0dcaf0';
  const drawerInactive = isDark ? '#bbb' : '#333';
  const headerBg = isDark ? '#111' : '#0dcaf0';
  const headerText = '#fff';

  // Don't render drawer until dimensions are ready
  // Use a longer delay to ensure React Navigation has completely finished all measurements
  if (!drawerReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0b0b0b' : '#fff' }}>
        <ActivityIndicator size="large" color="#0dcaf0" />
      </View>
    );
  }

  // Get validated dimensions for drawer width
  const getDrawerWidth = () => {
    try {
      const { width } = Dimensions.get('window');
      if (width && !isNaN(width) && width > 0) {
        // Drawer should be about 70% of screen width, but cap at 280
        const calculated = Math.min(width * 0.7, 280);
        return !isNaN(calculated) && calculated > 0 ? calculated : 280;
      }
    } catch (error) {
      console.warn('⚠️ Error calculating drawer width:', error);
    }
    return 280; // Fallback
  };

  const drawerWidth = getDrawerWidth();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: drawerActive,
        drawerInactiveTintColor: drawerInactive,
        headerStyle: { 
          backgroundColor: headerBg,
          // Height = status bar inset + header content so UI is not behind camera/battery
          height: 56 + insets.top,
        },
        headerStatusBarHeight: insets.top, // Top padding so header content is below status bar
        headerTintColor: headerText,
        headerTitleAlign: 'center',
        // Explicitly set drawer width to prevent React Navigation from calculating it
        drawerStyle: { 
          backgroundColor: isDark ? '#0b0b0b' : '#fff',
          width: drawerWidth,
          maxWidth: undefined,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: drawerReady,
        gestureHandlerProps: {
          enabled: drawerReady,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.navigate('Cart')}>
              <MaterialCommunityIcons name="cart" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />

      <Drawer.Screen
        name="Health"
        component={HealthAccessPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Health Plans"
        component={HealthPlansLandingScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="About Us"
        component={AboutUs}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Hospital Partner"
        component={HospitalDashboardHome}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="medical-bag" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Plan Comparison"
        component={PlanComparisonScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="My Plan"
        component={MyPlanScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb-group" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Health Access"
        component={HealthAccessScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="leaf" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Admin Wellness"
        component={AdminWellnessDashboard}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="kodi" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Wellness Tracker"
        component={WellnessTrackerScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="kodi" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Contact Us"
        component={ContactUs}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="card-account-phone-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Download"
        component={DownloadsPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="download-multiple" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Terms & Conditions"
        component={TermsConditionsAdvanced}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="triforce" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Data Protection Policy"
        component={DataProtectionPolicy}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="access-point" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Help Center"
        component={HelpCenter}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="help-network-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Stakeholders"
        component={StakeholdersPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="horizontal-rotate-counterclockwise" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Health Partners"
        component={HealthCarePage}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Revenue Engine"
        component={RevenueEngineDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightning-bolt-circle" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="CoverageStatus"
        component={CoverageStatus}
        options={{ drawerItemStyle: { display: 'none' } }}
      />

      <Drawer.Screen
        name="Emergency Care"
        component={EmergencyDashboard}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wall-sconce-flat-variant-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function OnboardingStack() {
  return (
    <OnboardingStackNav.Navigator screenOptions={{ headerShown: true }}>
      <OnboardingStackNav.Screen name="Onboarding" component={HospitalOnboardingForm} options={{ title: 'Onboarding' }} />
    </OnboardingStackNav.Navigator>
  );
}

function BookingStack() {
  return (
    <HospitalStackNav.Navigator screenOptions={{ headerShown: true }}>
      <HospitalStackNav.Screen name="BookingManager" component={BookingScreen} options={{ title: 'Booking Manager' }} />
    </HospitalStackNav.Navigator>
  );
}

function DataFlowStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <DataFlowStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <DataFlowStackNav.Screen name="DataFlow" component={DataFlowScreen} options={{ title: 'Health Data Flow' }} />
    </DataFlowStackNav.Navigator>
  );
}

function HospitalPartnerStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <HospitalPartnerStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <HospitalPartnerStackNav.Screen name="HospitalPartner" component={HospitalDashboardHome} options={{ title: 'Hospital Partner' }} />
    </HospitalPartnerStackNav.Navigator>
  );
}

function MedicalVaultStack() {
  return (
    <MedicalVaultStackNav.Navigator screenOptions={{ headerShown: true }}>
      <MedicalVaultStackNav.Screen name="MedicalVaultHome" component={MedicalVaultScreen} options={{ title: 'Medical Vault' }} />
    </MedicalVaultStackNav.Navigator>
  );
}

function PlanUsageStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <PlanUsageStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <PlanUsageStackNav.Screen name="PlanUsageHome" component={PlanUsageScreen} options={{ title: 'Plan Usage' }} />
    </PlanUsageStackNav.Navigator>
  );
}

function PartnerHospitalsStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <PartnerHospitalsStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <PartnerHospitalsStackNav.Screen name="PartnerHospitals" component={PartnerHospitals} options={{ title: 'Partner Hospitals' }} />
    </PartnerHospitalsStackNav.Navigator>
  );
}

function HealthMembershipStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <HealthMembershipStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <HealthMembershipStackNav.Screen name="HealthMembership" component={HealthMembershipScreen} options={{ title: 'Health Membership' }} />
    </HealthMembershipStackNav.Navigator>
  );
}

function BookHealthVisitStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <BookHealthVisitStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <BookHealthVisitStackNav.Screen name="BookHealthVisit" component={BookHealthVisit} options={{ title: 'Book Health Visit' }} />
    </BookHealthVisitStackNav.Navigator>
  );
}

function CartStack() {
  const { isDark } = useAppTheme();
  const headerBg = isDark ? '#111' : '#0dcaf0';

  return (
    <CartStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <CartStackNav.Screen name="Cart" component={HealthcareCartScreen} options={{ title: 'Cart' }} />
    </CartStackNav.Navigator>
  );
}

function PlanTierPlanStack() {
  return (
    <PlanTierPlanStackNav.Navigator screenOptions={{ headerShown: true }}>
      <PlanTierPlanStackNav.Screen name="PlanTierPlan" component={HospitalPlanTiers} options={{ title: 'PlanTierPlan' }} />
    </PlanTierPlanStackNav.Navigator>
  );
}

function ServiceAvailabilityStack() {
  return (
    <ServiceAvailabilityStackNav.Navigator screenOptions={{ headerShown: true }}>
      <ServiceAvailabilityStackNav.Screen name="ServiceAvailability" component={ServiceAvailability} options={{ title: 'ServiceAvailability' }} />
    </ServiceAvailabilityStackNav.Navigator>
  );
}

function CarePassScannerStack() {
  return (
    <CarePassScannerStackNav.Navigator screenOptions={{ headerShown: true }}>
      <CarePassScannerStackNav.Screen name="CarePassScanner" component={CarePassScanner} options={{ title: 'CarePassScanner' }} />
    </CarePassScannerStackNav.Navigator>
  );
}

function BillAnalyticsStack() {
  return (
    <BillAnalyticsStackNav.Navigator screenOptions={{ headerShown: true }}>
      <BillAnalyticsStackNav.Screen name="BillAnalyticsHome" component={AnalyticsPage} options={{ title: 'Bill Analytics' }} />
    </BillAnalyticsStackNav.Navigator>
  );
}

function SupportStack() {
  return (
    <SupportStackNav.Navigator screenOptions={{ headerShown: true }}>
      <SupportStackNav.Screen name="SupportHome" component={SupportPage} options={{ title: 'Support' }} />
    </SupportStackNav.Navigator>
  );
}

function WalletStack() {
  return (
    <WalletStackNav.Navigator screenOptions={{ headerShown: true }}>
      <WalletStackNav.Screen name="WalletHome" component={PaymentsWalletPage} options={{ title: 'Wallet' }} />
    </WalletStackNav.Navigator>
  );
}

function DigitalHealthStack() {
  return (
    <DigitalHealthStackNav.Navigator screenOptions={{ headerShown: true }}>
      <DigitalHealthStackNav.Screen name="DigitalHealth" component={DigitalHealthCard} options={{ title: 'Digital Health' }} />
    </DigitalHealthStackNav.Navigator>
  );
}

// --------- App Shell (theme -> navigation + paper) ----------
function AppShell() {
  const { isDark } = useAppTheme();
  // Check unified authentication state for auto-login
  const { isAuthenticated, loading: authLoading } = useUnifiedAuth();
  const [dimensionsReady, setDimensionsReady] = useState(() => {
    // Check dimensions synchronously on mount
    try {
      const { width, height } = Dimensions.get('window');
      return !!(width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0);
    } catch {
      return false;
    }
  });

  const navTheme = useMemo(() => (isDark ? DarkTheme : DefaultTheme), [isDark]);

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;

    // Optional: keep your brand color consistent
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: '#0dcaf0',
      },
    };
  }, [isDark]);

  // Ensure dimensions are ready before rendering NavigationContainer
  // This prevents React Navigation from measuring views before dimensions are available
  useEffect(() => {
    if (dimensionsReady) return; // Skip if already ready

    // Wait for all interactions (including navigation transitions) to complete
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      // Add delay to ensure React Navigation has finished all measurements
      setTimeout(() => {
        try {
          const { width, height } = Dimensions.get('window');
          if (width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
            setDimensionsReady(true);
          }
        } catch (error) {
          console.warn('⚠️ Error checking dimensions in GlobalHealthNavigator:', error);
        }
      }, 200);
    });

    // Also check immediately if dimensions are already available
    try {
      const { width, height } = Dimensions.get('window');
      if (width && height && !isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        setTimeout(() => {
          setDimensionsReady(true);
        }, 200);
      }
    } catch (error) {
      // Will be handled by InteractionManager callback
    }

    return () => {
      interactionHandle.cancel();
    };
  }, [dimensionsReady]);

  // Show loading while waiting for dimensions to be ready OR checking auth
  if (!dimensionsReady || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#000' : '#fff'} translucent={false} />
        <ActivityIndicator size="large" color="#0dcaf0" />
      </View>
    );
  }

  // Set initial route based on authentication state
  // If user is authenticated (from BBSCART, ThiaMobile, or GlobalHealth), go directly to Main (HomeScreen)
  // If not authenticated, show Auth stack (Intro/SignIn)
  const initialRoute = isAuthenticated ? 'Main' : 'Auth';

  const statusBarBg = isDark ? '#111' : '#0dcaf0';

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationIndependentTree>
        <NavigationContainer theme={navTheme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Platform.OS === 'android' ? statusBarBg : undefined}
            translucent={false}
          />
          <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          <RootStack.Screen name="Auth" component={AuthStack} />
          <RootStack.Screen name="Main" component={DrawerStack} />
          <RootStack.Screen name="Booking" component={BookingStack} />
          <RootStack.Screen name="Onboarding" component={OnboardingStack} />
          <RootStack.Screen name="DataFlow" component={DataFlowStack} />
          <RootStack.Screen name="MedicalVaultStack" component={MedicalVaultStack} />
          <RootStack.Screen name="PlanUsage" component={PlanUsageStack} />
          <RootStack.Screen name="HealthMembership" component={HealthMembershipStack} />
          <RootStack.Screen name="HospitalPartner" component={HospitalPartnerStack} />
          <RootStack.Screen name="PartnerHospitals" component={PartnerHospitalsStack} />
          <RootStack.Screen name="BookHealthVisit" component={BookHealthVisitStack} />
          <RootStack.Screen name="Cart" component={CartStack} />
          <RootStack.Screen name="PlanTierPlan" component={PlanTierPlanStack} />
          <RootStack.Screen name="ServiceAvailability" component={ServiceAvailabilityStack} />
          <RootStack.Screen name="CarePassScanner" component={CarePassScannerStack} />
          <RootStack.Screen name="BillAnalyticsStack" component={BillAnalyticsStack} />
          <RootStack.Screen name="Support" component={SupportStack} />
          <RootStack.Screen name="Wallet" component={WalletStack} />
          <RootStack.Screen name="DigitalHealth" component={DigitalHealthStack} />
          <RootStack.Screen name="PlanComparisonEditor" component={PlanComparisonEditor} />
          <RootStack.Screen name="PlanEligibility" component={PlanEligibility} />
          <RootStack.Screen name="PrescriptionLoop" component={PrescriptionLoop} />
          <RootStack.Screen name="PlanPaymentScreen" component={PlanPaymentScreen} />
          <RootStack.Screen name="HospitalPartnershipKit" component={HospitalPartnershipKit} />
          <RootStack.Screen name="LabDiagnostics" component={LabDiagnostics} />
          <RootStack.Screen name="ComplianceMainPage" component={ComplianceMainPage} />
          <RootStack.Screen name="PatientFeedbackEngine" component={PatientFeedbackEngine} />
          <RootStack.Screen name="AIDiseasePredictionRiskEngine" component={AIDiseasePredictionRiskEngine} />
          <RootStack.Screen name="CountryPlans" component={CountryPlans} />
          <RootStack.Screen name="FamilyHealthTimeline" component={familyHealthTimeline} />
          <RootStack.Screen name="FamilyMember" component={FamilyMember} />
          <RootStack.Screen name="ConsultRoom" component={consultRoom} />
          <RootStack.Screen name="HealthInsightsEngine" component={healthInsightsEngine} />
          <RootStack.Screen name="GrievanceResolutionSystem" component={grievanceResolution} />
          <RootStack.Screen name="PharmacyIntegrationDashboard" component={PharmacyIntegrationDashboard} />
          <RootStack.Screen name="UserFeedbackRatingsSystem" component={UserFeedbackRatingsSystem} />
          <RootStack.Screen name="UnifiedAPIAdminDashboard" component={UnifiedAPIAdminDashboard} />
          <RootStack.Screen name="PurchaseSummary" component={PurchaseSummary} />
          <RootStack.Screen name="QRHealthPass" component={QRHealthPass} />
          <RootStack.Screen name="PerformanceScoring" component={PerformanceScoring} />
          <RootStack.Screen name="AppointmentOtp" component={AppointmentOtp} />
          <RootStack.Screen name="PublicPartnerAccessDashboard" component={PublicPartnerAccessDashboard} />
          <RootStack.Screen name="Notifications" component={Notifications} />
          <RootStack.Screen name="OfflineDeployment" component={OfflineDeployment} />
          <RootStack.Screen name="InteropGovHealthSystem" component={InteropGovHealthSystem} />
          <RootStack.Screen name="UAEInsuranceIntegration" component={UAEInsuranceIntegration} />
          <RootStack.Screen name="InsuranceIntegration" component={InsuranceIntegration} />
          <RootStack.Screen name="HomeVisitBooking" component={HomeVisitBooking} />
          <RootStack.Screen name="HealthInsightsTrendsAI" component={HealthInsightsTrendsAI} />
          <RootStack.Screen name="HealthPassport" component={HealthPassportExportSystem} />
          <RootStack.Screen name="FormCard" component={FormCard} />
          <RootStack.Screen name="QR" component={QR} />
          <RootStack.Screen name="PlanDetails" component={PlanDetailsScreen} />
          <RootStack.Screen name="PlanTerms" component={TermsConditionsAdvanced} />
          <RootStack.Screen name="CoverageStatus" component={CoverageStatus} />
          <RootStack.Screen name="DoctorReferral" component={DoctorReferral} />
        </RootStack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </PaperProvider>
  );
}

// --------- Root App ----------
export default function GlobalHealthNavigator() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

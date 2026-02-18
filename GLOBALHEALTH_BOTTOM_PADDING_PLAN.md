# Global Health – Bottom navigation bar padding (before applying)

**Formula (same as ProductDetails):**  
`paddingBottom: (base) + Math.max(12, insets.bottom) + 8`

**Already have bottom padding (no change):**
- IntroScreen.js
- SignInScreen.js
- SignUpScreen.js
- ForgotPasswordScreen.js
- HomeScreen.js
- CartScreen.js

---

## Screens to update (add `useSafeAreaInsets` + bottom padding)

| # | Screen | Current scroll/list | Change |
|---|--------|---------------------|--------|
| 1 | AboutUsScreen.js | ScrollView `contentContainerStyle={styles.content}` | Add insets, merge `paddingBottom: 20 + Math.max(12, insets.bottom) + 8` |
| 2 | AdminWellnessScreen.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 3 | AIDiseasePredictionRiskEngine.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 4 | BillAnalyticsScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 5 | BookHealthVisitScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 6 | BookingManagerScreen.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 7 | CarePassScannerScreen.js | ScrollView `contentContainerStyle={styles.content}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 8 | ComplianceMainPage.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 9 | ContactUsScreens.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 10 | CountryPlans.js | ScrollView + FlatList | Add insets, main ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 11 | CoverageStatus.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 12 | DataFlowScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 13 | DataProtection.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 14 | DigitalHealthCardScreen.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 15 | DoctorReferral.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 16 | DownloadScreen.js | ScrollView (vertical) | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` to vertical ScrollView |
| 17 | EmergencyScreen.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 18 | FamilyHealthTimeline.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 19 | FamilyMembersPage.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 20 | FormCardForm.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 21 | GrievanceResolutionSystem.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 22 | HealthAccessPage.js | ScrollView + FlatList (paddingBottom: 16) | Add insets, FlatList `contentContainerStyle={{ paddingBottom: 16 + Math.max(12, insets.bottom) + 8 }}` |
| 23 | HealthAccessScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 24 | HealthcareScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 25 | HealthInsightsEngine.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 26 | HealthInsightsTrendsAI.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 27 | HealthMembershipScreen.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 28 | HealthPassportExportSystem.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 29 | HealthPlansLandingScreen.js | FlatList `contentContainerStyle={styles.list}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 30 | HelpCenter.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 31 | HospitalDashboard.js | ScrollView `contentContainerStyle={styles.container}` (has paddingBottom: 40) | Add insets, merge `paddingBottom: 40 + Math.max(12, insets.bottom) + 8` |
| 32 | HospitalOnboarding.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 33 | HospitalPartnershipKit.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 34 | HospitalPartnershipMobile.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 35 | HospitalPartnershipScreen.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 36 | InsuranceIntegration.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 37 | InteropGovHealthSystem.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 38 | LabDiagnostics.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 39 | MedicalVaultScreen.js | FlatList only | Add insets, FlatList `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 40 | MyPlanScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 41 | Notifications.js | FlatList | Add insets, FlatList `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 42 | OfflineDeployment.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 43 | PartnerHospitalsScreen.js | FlatList (paddingBottom: 20) | Add insets, merge `paddingBottom: 20 + Math.max(12, insets.bottom) + 8` |
| 44 | PatientFeedbackEngine.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 45 | PaymentsWalletScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 46 | PerformanceScoring.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 47 | PharmacyIntegrationDashboard.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 48 | PlanComparisonEditor.js | ScrollView + DraggableFlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 49 | PlanComparisonScreen.js | ScrollView `style={styles.screen}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 50 | PlanDetailsScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 51 | PlanUsageScreen.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 16 + Math.max(12, insets.bottom) + 8` |
| 52 | PrescriptionLoop.js | ScrollView `style={styles.screen}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 53 | PublicPartnerAccessDashboard.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 54 | PurchaseSummary.js | ScrollView `contentContainerStyle={styles.container}` | Add insets, merge `paddingBottom: 24 + Math.max(12, insets.bottom) + 8` |
| 55 | RevenueEngineScreen.js | FlatList + ScrollView (rs(12)) | Add insets, update FlatList/ScrollView paddingBottom with insets |
| 56 | ServiceAvailability.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 57 | StakeholdersScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 58 | SupportScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 59 | TermsConditionsScreen.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 60 | UAEInsuranceIntegration.js | ScrollView + FlatList | Add insets, ScrollView `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 61 | UnifiedAPIAdminDashboard.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 62 | UserFeedbackRatingsSystem.js | ScrollView `style={styles.container}` | Add insets, add `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |
| 63 | WellnessTrackerScreen.js | FlatList | Add insets, FlatList `contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}` |

**Skipped (no main scroll/list or different structure):** PlanPaymentScreen, QR.js, QRHealthPass, TestScreen, AppointmentOtp – to be checked if needed.

---

**Total: 63 screens to update** (6 already done = 69 with scroll/list content).

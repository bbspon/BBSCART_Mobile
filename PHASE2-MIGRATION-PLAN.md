# Phase 2: GlobalHealth Code Migration Plan

## Overview
Migrating GlobalHealth codebase from:
- React Native 0.71.0 → 0.80.2
- React 18.2.0 → 19.1.0
- React Navigation v6 → v7
- Reanimated v2 → v3 (if used)

## Analysis Results

### Files Requiring Updates
- **React Navigation files:** 19 files identified
- **Reanimated usage:** None found ✅ (No migration needed)
- **Main App.js:** Uses createNativeStackNavigator and createDrawerNavigator

### Migration Strategy

#### Step 1: React Navigation v6 → v7 Migration
**Status:** Mostly compatible, minor API changes

**Key Changes:**
1. `createNativeStackNavigator` - API mostly unchanged
2. `createDrawerNavigator` - API mostly unchanged
3. Screen options - Mostly compatible
4. Navigation props - Compatible

**Files to Update:**
- App.js (main navigation setup)
- 19 screen files using navigation

#### Step 2: React 18 → 19 Compatibility
**Status:** Mostly compatible

**Potential Issues:**
- No deprecated APIs found in initial scan
- React 19 is backward compatible with most React 18 code

#### Step 3: Other Dependency Updates
- react-native-paper: 5.10.6 → 5.12.5 (compatible)
- react-native-webview: 11.26.0 → 13.12.2 (API changes possible)
- react-native-permissions: ^3.10.1 → ^4.1.5 (API changes)

## Migration Steps

### Phase 2.1: Update App.js Navigation ✅ IN PROGRESS
- [ ] Verify createNativeStackNavigator compatibility
- [ ] Verify createDrawerNavigator compatibility
- [ ] Test navigation structure

### Phase 2.2: Update Screen Files
- [ ] Update 19 screen files with navigation imports
- [ ] Verify navigation prop usage
- [ ] Test screen navigation

### Phase 2.3: Update Other Dependencies
- [ ] Check react-native-webview usage
- [ ] Check react-native-permissions usage
- [ ] Update API calls if needed

### Phase 2.4: Testing
- [ ] Test all navigation flows
- [ ] Test all GlobalHealth features
- [ ] Verify no runtime errors

## Files Identified for Migration

### Navigation Files (19 files)
1. src/screens/HomeScreen.js
2. src/screens/HealthAccessScreen.js
3. src/screens/HelpCenter.js
4. src/screens/HospitalDashboard.js
5. src/screens/SignInScreen.js
6. src/screens/ConsultRoom.js
7. src/components/HealthAccess/PlanCard.js
8. src/screens/FamilyHealthTimeline.js
9. src/HealthPlansLandingScreen.js
10. src/screens/FamilyMembersPage.js
11. src/screens/ForgotPasswordScreen.js
12. src/screens/FormCardForm.js
13. src/screens/HealthAccessPage.js
14. src/screens/HealthInsightsEngine.js
15. src/screens/IntroScreen.js
16. src/screens/PartnerHospitalsScreen.js
17. src/screens/PlanComparisonScreen.js
18. src/screens/PurchaseSummary.js
19. src/screens/SignUpScreen.js

## Next Steps
Starting with App.js migration, then proceeding to screen files.

# Navigation Architecture - BBSCART as Primary App

## Overview

BBSCART is now the **primary app** and serves as the main entry point. GlobalHealth and ThiaMobile are accessible from within BBSCART through navigation buttons in the header.

## Navigation Structure

```
RootNavigator (Root Level)
├── BBSCART (Initial Route) ⭐ Primary App
│   └── BBSCARTNavigator (Nested)
│       ├── AuthStack
│       └── MainStack
│           └── Home (with navigation buttons)
├── GlobalHealth
│   └── GlobalHealthNavigator (Nested)
└── ThiaMobile
    └── ThiaMobileNavigator (Nested)
```

## How It Works

### 1. App Launch
- App starts with **BBSCART** as the initial route
- User sees BBSCART home screen immediately
- No app selector screen

### 2. Navigation to Other Apps
- **From BBSCART Home Screen:**
  - Header contains two logo buttons:
    - **Thiaworld Logo** → Navigates to ThiaMobile app
    - **BBS Health Logo** → Navigates to GlobalHealth app
  - Uses `navigation.getParent().navigate()` to navigate to root level screens

### 3. Navigation Back to BBSCART
- From GlobalHealth or ThiaMobile:
  - Users can use the back button (Android) or swipe back (iOS)
  - Or navigate programmatically using `navigation.getParent().navigate('BBSCART')`

## Implementation Details

### RootNavigator.js
```javascript
<RootStack.Navigator initialRouteName="BBSCART">
  <RootStack.Screen name="BBSCART" component={BBSCARTNavigator} />
  <RootStack.Screen name="GlobalHealth" component={GlobalHealthNavigator} />
  <RootStack.Screen name="ThiaMobile" component={ThiaMobileNavigator} />
</RootStack.Navigator>
```

### BBSCART Home Screen (Home.js)
```javascript
// Navigate to GlobalHealth
const handleNavigateToGlobalHealth = () => {
  const parent = rootNavigation.getParent();
  if (parent) {
    parent.navigate('GlobalHealth');
  }
};

// Navigate to ThiaMobile
const handleNavigateToThiaMobile = () => {
  const parent = rootNavigation.getParent();
  if (parent) {
    parent.navigate('ThiaMobile');
  }
};
```

## User Flow

1. **App Opens** → BBSCART Home Screen
2. **User clicks Thiaworld logo** → Navigates to ThiaMobile app
3. **User clicks BBS Health logo** → Navigates to GlobalHealth app
4. **User presses back** → Returns to BBSCART

## Benefits

✅ **Single Entry Point:** Users start in BBSCART (primary app)  
✅ **Easy Access:** One-tap access to other apps from header  
✅ **Seamless Navigation:** Smooth transitions between apps  
✅ **Unified Auth:** Login once, access all apps  
✅ **Clear Hierarchy:** BBSCART is clearly the primary app

## Future Enhancements

- Add back button in GlobalHealth/ThiaMobile headers to return to BBSCART
- Add app switcher menu in BBSCART
- Add recent apps section
- Add quick access shortcuts

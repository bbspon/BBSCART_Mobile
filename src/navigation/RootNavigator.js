// Root Navigator - BBSCART as Primary App
import React, { useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import GlobalHealthNavigator from './GlobalHealthNavigator';
import BBSCARTNavigator from './BBSCARTNavigator';
import ThiaMobileNavigator from './ThiaMobileNavigator';
import { setNavigationRef } from '../shared/services/navigationService';

const RootStack = createNativeStackNavigator();

// Root Navigator Component
// BBSCART is the primary app - users start here
// GlobalHealth and ThiaMobile are accessible from within BBSCART
export default function RootNavigator() {
  const navigationRef = useRef(null);

  // Store navigation ref globally for access from nested navigators
  React.useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef);
    }
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setNavigationRef(navigationRef);
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          // Use default slide; 'fade' on Android 11 can still trigger HWUI "Impossible totalDuration 0" assert
          animation: 'default',
        }}
        initialRouteName="BBSCART"
      >
        <RootStack.Screen name="BBSCART" component={BBSCARTNavigator} />
        <RootStack.Screen name="GlobalHealth" component={GlobalHealthNavigator} />
        <RootStack.Screen name="ThiaMobile" component={ThiaMobileNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

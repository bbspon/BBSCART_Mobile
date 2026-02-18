// ⚠️ CRITICAL: Reanimated must be imported FIRST, before anything else
import 'react-native-reanimated';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app component - must match MainActivity.getMainComponentName()
AppRegistry.registerComponent(appName, () => App);

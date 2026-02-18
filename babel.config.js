module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ⚠️ CRITICAL: react-native-reanimated/plugin MUST be the LAST plugin
    'react-native-reanimated/plugin',
  ],
};

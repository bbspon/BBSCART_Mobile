import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ThemedView - A View component that automatically applies theme background color
 * Usage: Replace <View> with <ThemedView> in your screens
 */
export const ThemedView = ({ style, children, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[{ backgroundColor: colors.background }, style]} {...props}>
      {children}
    </View>
  );
};

/**
 * ThemedText - A Text component that automatically applies theme text color
 * Usage: Replace <Text> with <ThemedText> in your screens
 */
export const ThemedText = ({ style, children, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <Text style={[{ color: colors.text }, style]} {...props}>
      {children}
    </Text>
  );
};

/**
 * ThemedCard - A View component styled as a card with theme colors
 */
export const ThemedCard = ({ style, children, ...props }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 15,
          elevation: isDark ? 0 : 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.1,
          shadowRadius: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

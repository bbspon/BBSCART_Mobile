// SafeView - Wrapper component that filters out NaN values from styles
import React from 'react';
import { View } from 'react-native';

/**
 * Recursively cleans style objects to remove NaN values
 */
const cleanStyle = (style) => {
  if (!style) return style;
  
  if (Array.isArray(style)) {
    return style.map(cleanStyle).filter(s => s !== null && s !== undefined);
  }
  
  if (typeof style === 'object') {
    const cleaned = {};
    for (const key in style) {
      if (style.hasOwnProperty(key)) {
        const value = style[key];
        
        // Skip NaN values
        if (typeof value === 'number' && isNaN(value)) {
          continue; // Skip this property
        }
        
        // Recursively clean nested objects (like shadowOffset: { width: 0, height: 6 })
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const cleanedNested = cleanStyle(value);
          if (cleanedNested && Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }
  
  return style;
};

/**
 * SafeView - A View component that automatically filters NaN values from styles
 * Use this instead of View when you suspect style calculations might produce NaN
 */
export const SafeView = ({ style, ...props }) => {
  const cleanedStyle = cleanStyle(style);
  return <View style={cleanedStyle} {...props} />;
};

export default SafeView;

// KeyboardAwareContainer.js - Enhanced keyboard handling with auto-scroll
import React, { useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { KeyboardAwareProvider } from '../contexts/KeyboardAwareContext';

/**
 * KeyboardAwareContainer - Enhanced keyboard handling with auto-scroll to focused inputs
 * 
 * Features:
 * - Automatically adjusts layout when keyboard appears
 * - Auto-scrolls to focused TextInput when keyboard appears
 * - Returns to original position when keyboard dismisses
 * - Dismisses keyboard when tapping outside input fields
 * - Works on both iOS and Android
 * - Supports ScrollView for long forms
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {boolean} props.enableScroll - Enable ScrollView (default: true)
 * @param {string} props.behavior - KeyboardAvoidingView behavior (default: 'padding' for iOS, 'height' for Android)
 * @param {number} props.keyboardVerticalOffset - Offset for keyboard (default: 0)
 * @param {string} props.contentContainerStyle - Style for ScrollView content
 * @param {string} props.style - Container style
 * @param {number} props.extraScrollHeight - Extra space above input when scrolling (default: 20)
 */
export const KeyboardAwareContainer = ({
  children,
  enableScroll = true,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  style,
  extraScrollHeight = 20,
}) => {
  const scrollViewRef = useRef(null);
  const originalScrollY = useRef(0);
  const currentScrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const screenHeight = Dimensions.get('window').height;

  // Use refs only (no setState) so we don't re-render when keyboard shows/hides.
  // Re-rendering while the user is editing the email input can cause crashes.
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        try {
          const kbHeight = e.endCoordinates?.height ?? 0;
          keyboardHeightRef.current = kbHeight;
          originalScrollY.current = currentScrollYRef.current;
        } catch (err) {}
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        try {
          keyboardHeightRef.current = 0;
          if (scrollViewRef.current && originalScrollY.current >= 0) {
            setTimeout(() => {
              try {
                scrollViewRef.current?.scrollTo({ y: originalScrollY.current, animated: true });
              } catch (e) {}
              originalScrollY.current = 0;
            }, 100);
          } else if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        } catch (err) {}
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };


  // Enhanced scroll handler - ONLY scrolls if input would be hidden by keyboard
  // On React Native, event.nativeEvent.target is often a number (native tag), not an object with measureInWindow
  const scrollToInput = (inputHandle) => {
    if (!scrollViewRef.current || !enableScroll || !inputHandle) return;

    const hasMeasureInWindow = typeof inputHandle === 'object' && inputHandle !== null && typeof inputHandle.measureInWindow === 'function';

    setTimeout(() => {
      try {
        const kbHeight = keyboardHeightRef.current;
        if (kbHeight === 0) return;

        if (hasMeasureInWindow) {
          inputHandle.measureInWindow((x, y, width, inputHeight) => {
            // Validate all measurements are valid numbers
            if (typeof x !== 'number' || isNaN(x) ||
                typeof y !== 'number' || isNaN(y) ||
                typeof width !== 'number' || isNaN(width) ||
                typeof inputHeight !== 'number' || isNaN(inputHeight)) {
              console.warn('⚠️ Invalid measurement values in KeyboardAwareContainer:', { x, y, width, inputHeight });
              return; // Skip if measurements are invalid
            }

            // Double-check keyboard is still visible
            const currentKbHeight = keyboardHeightRef.current;
            if (currentKbHeight === 0 || typeof currentKbHeight !== 'number' || isNaN(currentKbHeight)) {
              return; // Keyboard dismissed or invalid, don't scroll
            }

            // Validate screenHeight
            if (typeof screenHeight !== 'number' || isNaN(screenHeight) || screenHeight <= 0) {
              console.warn('⚠️ Invalid screenHeight in KeyboardAwareContainer:', screenHeight);
              return;
            }

            const visibleHeight = screenHeight - currentKbHeight;
            const inputBottom = y + inputHeight;
            const inputTop = y;
            
            // ✅ CRITICAL: Don't scroll if input is in the top portion of the screen
            // If input top is above 40% of screen height, it's definitely visible - don't scroll
            // This prevents scrolling for inputs at the top (like email field in sign-in screens)
            const topThreshold = screenHeight * 0.4; // Top 40% of screen
            if (inputTop < topThreshold) {
              return; // Input is at the top, already visible - no scroll needed
            }
            
            // ✅ KEY LOGIC: Only scroll if input would be hidden by keyboard
            // Check if input bottom is below the visible area (would be covered by keyboard)
            const buffer = 10;
            const threshold = visibleHeight - buffer;
            
            // Validate threshold is valid
            if (typeof threshold !== 'number' || isNaN(threshold)) {
              console.warn('⚠️ Invalid threshold in KeyboardAwareContainer:', threshold);
              return;
            }
            
            if (inputBottom > threshold) {
              // Input is hidden by keyboard - calculate scroll needed
              const hiddenAmount = inputBottom - visibleHeight;
              
              // Validate hiddenAmount
              if (typeof hiddenAmount !== 'number' || isNaN(hiddenAmount)) {
                console.warn('⚠️ Invalid hiddenAmount in KeyboardAwareContainer:', hiddenAmount);
                return;
              }
              
              // We need to scroll by the hidden amount plus extra space
              const scrollAmount = hiddenAmount + extraScrollHeight;
              
              // Validate scrollAmount
              if (typeof scrollAmount !== 'number' || isNaN(scrollAmount) || scrollAmount <= 0) {
                return; // Invalid or no scroll needed
              }
              
              // Get current scroll position
              const currentScroll = currentScrollYRef.current;
              
              // Validate currentScroll
              if (typeof currentScroll !== 'number' || isNaN(currentScroll)) {
                currentScrollYRef.current = 0; // Reset to 0 if invalid
              }
              
              const targetScroll = (currentScrollYRef.current || 0) + scrollAmount;
              
              // Validate targetScroll before scrolling
              if (typeof targetScroll === 'number' && !isNaN(targetScroll) && targetScroll >= 0) {
                scrollViewRef.current?.scrollTo({
                  y: targetScroll,
                  animated: true,
                });
                // Update ref after scroll
                currentScrollYRef.current = targetScroll;
              }
            }
            // If input is already visible (inputBottom <= threshold), don't scroll at all
          });
        } else {
          // inputHandle is native tag (number) or has no measureInWindow - do nothing to avoid crash
          // (scrollToEnd can crash when user is editing; KeyboardAvoidingView already handles layout)
        }
      } catch (error) {
        try {
          if (scrollViewRef.current) scrollViewRef.current.scrollToEnd({ animated: true });
        } catch (e) {}
      }
    }, Platform.OS === 'ios' ? 300 : 500);
  };

  // Recursively enhance all TextInput components with auto-scroll onFocus
  const enhanceChildrenWithAutoScroll = (childrenToEnhance) => {
    return React.Children.map(childrenToEnhance, (child) => {
      if (!React.isValidElement(child)) return child;

      // Check if it's a TextInput
      const isTextInput = child.type === require('react-native').TextInput || 
                         child.type?.displayName === 'TextInput' ||
                         child.type?.name === 'TextInput';

      if (isTextInput) {
        const originalOnFocus = child.props.onFocus;
        return React.cloneElement(child, {
          ...child.props,
          onFocus: (event) => {
            try {
              if (originalOnFocus) originalOnFocus(event);
            } catch (e) {}
            try {
              const target = event?.nativeEvent?.target ?? event?.target;
              if (target != null) {
                setTimeout(() => scrollToInput(target), Platform.OS === 'ios' ? 350 : 550);
              }
            } catch (e) {
              // Prevent crash when tapping input (e.g. native tag or measure)
            }
          },
        });
      }

      // Recursively enhance children
      if (child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: enhanceChildrenWithAutoScroll(child.props.children),
        });
      }

      return child;
    });
  };

  const content = (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      {enableScroll ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          onScrollBeginDrag={dismissKeyboard}
          onScroll={(event) => {
            // Track current scroll position
            currentScrollYRef.current = event.nativeEvent.contentOffset.y;
          }}
        >
          {enhanceChildrenWithAutoScroll(children)}
        </ScrollView>
      ) : (
        <>{enhanceChildrenWithAutoScroll(children)}</>
      )}
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAwareProvider scrollViewRef={scrollViewRef} extraScrollHeight={extraScrollHeight} scrollToInput={scrollToInput}>
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {content}
      </KeyboardAvoidingView>
    </KeyboardAwareProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAwareContainer;

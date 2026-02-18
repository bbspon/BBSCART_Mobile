# Black Screen Debug Steps

## Changes Applied

1. **Added TestScreen** - Simple screen to verify navigation works
2. **Changed image import** - IntroScreen now uses `require()` instead of `import` for image
3. **Added initialRouteName** - AuthStack now explicitly sets "Test" as initial route
4. **Added debug logging** - AppShell now logs when it renders

## Testing Steps

1. **Reload the app** (press R, R)
2. **Check what you see:**
   - If you see "Test Screen - Navigation Working!" → Navigation is working, issue is with IntroScreen
   - If still black screen → Check Metro bundler console for errors

## Expected Results

### Scenario 1: TestScreen appears
- ✅ Navigation is working
- ✅ Issue is likely with IntroScreen (image import or component error)
- **Next:** Switch back to Intro as initial route and fix IntroScreen

### Scenario 2: Still black screen
- ❌ Navigation might not be initializing
- **Check:**
  - Metro bundler console for red errors
  - React Native debugger for JavaScript errors
  - Android logcat for native errors

## Console Logs to Look For

When app loads, you should see in Metro console:
```
AppShell render - ready: true isDark: false
AppShell: Rendering NavigationContainer...
```

If you see:
```
AppShell: Not ready, showing loading...
```
Then ThemeContext is still not ready (shouldn't happen with our fix).

## Next Steps Based on Results

1. **If TestScreen works:** Change `initialRouteName` back to "Intro" and fix IntroScreen
2. **If still black:** Check for JavaScript errors in Metro console
3. **If errors appear:** Fix the specific error shown

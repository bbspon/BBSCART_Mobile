# Emulator / app not loading – checklist

## 1. Start the emulator (if it’s not open)

**Option A – Let React Native start it**
```powershell
cd "d:\Merge\BBS ONEAPP\UnifiedApp"
npx react-native run-android
```
This will launch an AVD if none is running, then build and install the app.

**Option B – Start an AVD manually**
- Open **Android Studio** → **Device Manager** (or **Tools** → **Device Manager**).
- Click **Run** (▶) next to an AVD (e.g. Pixel_5).
- Wait until the emulator home screen is visible.

Then in a terminal:
```powershell
cd "d:\Merge\BBS ONEAPP\UnifiedApp"
npx react-native run-android
```

---

## 2. Start Metro (separate terminal)

Metro must be running so the app can load the JS bundle.

**Terminal 1 – Metro**
```powershell
cd "d:\Merge\BBS ONEAPP\UnifiedApp"
npm start
```
Leave this running. You should see “Welcome to Metro” and “Dev server ready.”

**Terminal 2 – Run app on emulator**
```powershell
cd "d:\Merge\BBS ONEAPP\UnifiedApp"
npx react-native run-android
```

---

## 3. If the emulator is on but the app is white / not loading

1. **Reload the app:** Press `R` twice in the Metro terminal, or shake the emulator (Ctrl+M or Cmd+M) → **Reload**.
2. **Check Metro connection:** In Metro you should see something like “Connection established to app='com.frontend'”. If not, run `npx react-native run-android` again.
3. **Reset Metro cache (if needed):**
   ```powershell
   npm start -- --reset-cache
   ```
   Then in another terminal: `npx react-native run-android`.

---

## 4. If no emulator appears in `adb devices`

```powershell
adb kill-server
adb start-server
adb devices
```

If the list is empty, start an AVD from Android Studio (Device Manager → Run on an AVD), then run `adb devices` again.

---

## 5. Quick one-shot (Metro already running)

If Metro is already running in another terminal:

```powershell
cd "d:\Merge\BBS ONEAPP\UnifiedApp"
npx react-native run-android
```

This builds, installs, and launches the app on the connected emulator (e.g. emulator-5554).

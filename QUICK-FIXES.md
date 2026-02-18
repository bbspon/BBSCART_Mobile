# Quick Fixes for Common Issues

## Metro Bundler Port Conflict

**Error:** `listen EADDRINUSE: address already in use :::8081`

**Quick Fix:**
```powershell
# Kill process on port 8081
$port = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($port) { Stop-Process -Id $port.OwningProcess -Force }
npm start
```

**Or use different port:**
```bash
npm start -- --port 8082
```

## Build Tools Version

**Error:** `Failed to find Build Tools revision 36.0.0`

**Fixed:** Changed to `buildToolsVersion = "34.0.0"` in `android/build.gradle`

## jcenter() Repository Errors

**Fixed:** 
- `react-native-tts` - Patched
- `@react-native-voice/voice` - Patched

**Patches auto-apply** via `postinstall` script

## All Issues Resolved ✅

The app is ready to run!

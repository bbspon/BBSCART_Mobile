# Metro Bundler Port Conflict - Fix Guide

## Error

**Error:** `listen EADDRINUSE: address already in use :::8081`

**Cause:** Port 8081 is already in use by another Metro bundler instance (likely from another React Native project)

## Solutions

### Option 1: Kill the Process Using Port 8081 (Recommended)

**Windows PowerShell:**
```powershell
# Find the process
$process = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "✅ Process killed"
}

# Then start Metro
npm start
```

**Or manually:**
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find `node.exe` processes
3. End the one using port 8081

### Option 2: Use a Different Port

```bash
npm start -- --port 8082
```

Then update your Android/iOS build to use port 8082, or use:
```bash
npm run android -- --port 8082
```

### Option 3: Kill All Node Processes (Nuclear Option)

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

⚠️ **Warning:** This will kill ALL Node.js processes, including other projects

## Quick Fix Command

Run this in PowerShell:
```powershell
$port = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($port) { Stop-Process -Id $port.OwningProcess -Force; Write-Host "✅ Port 8081 freed" } else { Write-Host "Port 8081 is free" }
```

Then start Metro:
```bash
npm start
```

## Prevention

To avoid this in the future:
- Always stop Metro bundler (Ctrl+C) before closing terminal
- Use different ports for different projects
- Check for running Metro instances before starting

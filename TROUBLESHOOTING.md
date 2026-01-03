# Network Request Failed - Troubleshooting Guide

## Error: `Network request failed` when accessing `http://192.168.68.63:3000/api/books`

### Quick Checklist

1. ✅ **Is the server running?**
   ```bash
   npm run server:dev
   ```
   You should see: `express server serving on port 3000`

2. ✅ **Can you access the server from your computer?**
   ```bash
   curl http://192.168.68.63:3000/api/books
   ```
   Or open in browser: `http://192.168.68.63:3000/api/books`

3. ✅ **Is your IP address correct?**
   - On Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - On Windows: `ipconfig`
   - On Linux: `hostname -I`
   - Verify it matches `192.168.68.63` in your `.env` file

4. ✅ **Are both devices on the same WiFi network?**
   - Your computer and phone must be on the same network
   - Check WiFi network name on both devices

5. ✅ **Is the firewall blocking port 3000?**
   - **Mac**: System Settings → Network → Firewall → Options → Allow incoming connections
   - **Windows**: Windows Defender Firewall → Allow an app → Node.js
   - Or temporarily disable firewall to test

6. ✅ **Is the `.env` file configured correctly?**
   ```env
   EXPO_PUBLIC_DOMAIN=http://192.168.68.63:3000
   ```
   - No trailing slashes
   - No quotes around the URL
   - Must match your actual IP address

### Step-by-Step Diagnosis

#### Step 1: Verify Server is Running
```bash
# Terminal 1: Start the server
npm run server:dev

# You should see:
# express server serving on port 3000
```

#### Step 2: Test Server Locally
```bash
# From your computer, test the API
curl http://localhost:3000/api/books

# Should return JSON array (even if empty: [])
```

#### Step 3: Test Server from Network IP
```bash
# From your computer, test using the network IP
curl http://192.168.68.63:3000/api/books

# If this fails, the server isn't accessible from the network
```

#### Step 4: Test from Your Phone's Browser
1. Make sure your phone is on the same WiFi network
2. Open Safari (iOS) or Chrome (Android)
3. Navigate to: `http://192.168.68.63:3000/api/books`
4. You should see JSON data

#### Step 5: Check Server Logs
When you make a request, the server should log:
```
GET /api/books 200
```

If you don't see this, the request isn't reaching the server.

### Common Issues & Solutions

#### Issue 1: Server Not Accessible from Network
**Symptom**: Works on `localhost` but not from phone

**Solution**:
- Server is already configured to listen on `0.0.0.0` (all interfaces)
- Check firewall settings (see above)
- Verify IP address is correct

#### Issue 2: Wrong IP Address
**Symptom**: IP address changed (DHCP)

**Solution**:
1. Find your current IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `.env`: `EXPO_PUBLIC_DOMAIN=http://YOUR_NEW_IP:3000`
3. Restart Metro: `npm start -- --clear`

#### Issue 3: Port Already in Use
**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run server:dev
# Then update .env: EXPO_PUBLIC_DOMAIN=http://192.168.68.63:3001
```

#### Issue 4: CORS Errors
**Symptom**: Request reaches server but fails with CORS error

**Solution**:
- Server already allows all origins in development
- Check server logs for CORS headers

#### Issue 5: Metro Bundler Cache
**Symptom**: Environment variables not updating

**Solution**:
```bash
# Clear Metro cache
npm start -- --clear

# Or
npx expo start --clear
```

### Testing Commands

```bash
# Test server health
curl http://192.168.68.63:3000/api/shelves

# Test from phone browser
# Open: http://192.168.68.63:3000/api/books

# Check if port is open
nc -zv 192.168.68.63 3000

# Check server process
lsof -i :3000
```

### Still Not Working?

1. **Check server console** for any error messages
2. **Check Expo console** for network errors
3. **Try a different port** (e.g., 3001) to rule out port conflicts
4. **Try connecting from a different device** to isolate the issue
5. **Check router settings** - some routers block device-to-device communication

### Debug Mode

Enable verbose logging in the app:
- Check Expo console for `[API] GET http://192.168.68.63:3000/api/books`
- Check server console for incoming requests


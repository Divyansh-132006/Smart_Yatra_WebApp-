# 🔒 HTTPS Setup Guide - Encryption Protection

## What's Protected Now

### ✅ Vulnerability #3: /geofences Endpoint (NOW FIXED)
- **Before**: Anyone could access geofence data without authentication
- **After**: Authentication required (`verifyToken` middleware added)
- **Impact**: Only logged-in users can query geofences

### ✅ Vulnerability #4: HTTP Communication (NOW FIXED)
- **Before**: All traffic in plain text (tokens, location, OTP sniffable)
- **After**: All communication encrypted with HTTPS
- **Impact**: WiFi attackers cannot sniff sensitive data

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Generate Self-Signed SSL Certificates
```bash
cd backend/smartyatra_backend
node generate-certs.js
```

**Output:**
```
✅ Certificates generated successfully!

📁 Certificate files:
   - certs/key.pem (private key)
   - certs/cert.pem (certificate)
```

### Step 2: Update Environment Variables
Edit `.env` file:
```bash
# Copy template if you don't have .env yet
cp .env.example .env

# Edit .env and ensure these are set:
HTTPS_ENABLED=true
REACT_APP_API_URL=https://192.168.1.175:3001
REACT_APP_USE_HTTPS=true
```

### Step 3: Start Backend & Frontend
```bash
# Terminal 1: Backend (HTTPS on port 3001)
cd backend/smartyatra_backend
npm install  # If not done yet
npm run dev

# Terminal 2: Frontend
cd frontend/Smart_Yatra
npm run dev
```

---

## 🔐 What Changed

### Backend Changes

**1. New File: `generate-certs.js`**
- Generates self-signed SSL certificate + private key
- Saves to `certs/cert.pem` and `certs/key.pem`
- Valid for 365 days
- For development ONLY

**2. Modified: `src/app.js`**
- Imports `https` and `fs` modules
- Reads SSL certificates from `certs/` directory
- Creates HTTPS server when `HTTPS_ENABLED=true`
- Falls back to HTTP if certificates not found or HTTPS disabled
- **Code Pattern**:
  ```javascript
  import https from 'https';
  import fs from 'fs';
  
  if (httpsEnabled && certsExist) {
    const credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
  }
  ```

**3. Modified: `src/routes/Tourist_route.js`**
- Added `verifyToken` middleware to `/geofences` endpoint
- Now requires valid JWT token to access
- **Before**: `router.get('/geofences', geofenceLimiter, getGeofences);`
- **After**: `router.get('/geofences', verifyToken, geofenceLimiter, getGeofences);`

**4. Updated: `.env.example`**
- Added `HTTPS_ENABLED=true` (enables HTTPS)
- Changed API URL from 3000 → 3001 (HTTPS port)
- Changed protocol from http:// → https://

**5. Updated: `package.json`**
- Added scripts:
  - `npm run generate-certs` - Generate SSL certificates
  - `npm run setup-https` - Auto-generate certs + start server

### Frontend Changes

**1. Updated: `src/config/api.js`**
- Changed from HTTP → HTTPS
- Uses port 3001 (HTTPS) instead of 3000 (HTTP)
- **Before**: `BASE_URL = 'http://192.168.1.175:3000'`
- **After**: `BASE_URL = 'https://192.168.1.175:3001'`
- Respects `REACT_APP_USE_HTTPS` environment variable

**2. New File: `src/utils/httpsConfig.js`**
- Handles self-signed certificate acceptance
- Provides HTTPS validation utilities
- Functions:
  - `configureCertificateValidation()` - Setup at app startup
  - `setupHTTPSInterceptors()` - Add logging for secure requests

**3. Updated: `src/context/AuthContext.js`**
- Imports and calls `configureCertificateValidation()`
- Initializes HTTPS support on app startup
- Added comment: `// 🔒 Initialize HTTPS certificate validation`

---

## 🧪 Testing HTTPS Setup

### Test 1: Verify Backend is Running on HTTPS
```bash
# Try connecting to HTTPS (will show certificate warning - that's OK for dev)
curl -k https://192.168.1.175:3001/

# Expected output:
# "🔒 Smart Yatra API is running (secured)..."
```

### Test 2: Test /geofences Now Requires Authentication
```bash
# Without token (should fail)
curl -k https://192.168.1.175:3001/api/tourists/geofences

# Expected: 401 Unauthorized
# Response: {"message":"No authorization token provided"}

# With valid token (should succeed)
curl -k https://192.168.1.175:3001/api/tourists/geofences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Expected: 200 OK with geofences data
```

### Test 3: Verify Frontend Can Connect
- Open app on physical phone or emulator
- Should connect without errors to `https://192.168.1.175:3001`
- Check console logs for: `✅ Secure Request` and `✅ Secure Response`

### Test 4: Verify Data is Encrypted (Network Monitoring)
```bash
# On same WiFi, try to sniff with tcpdump
# You should see HTTPS encrypted data, NOT plain text tokens/locations
```

---

## 🆘 Troubleshooting

### Error: "Certificates not found"
```
⚠️ HTTPS_ENABLED=true but certificates not found
```
**Solution**:
```bash
node generate-certs.js
```

### Error: "Cannot find module 'https'"
**Solution**: Make sure you're using Node.js version 10+
```bash
node --version  # Should be v10 or higher
```

### Error: "Backend connection refused"
**Possible Causes**:
1. Backend not running
2. Wrong port (should be 3001 for HTTPS)
3. Certificates not generated

**Solution**:
```bash
# Check certificate status
ls -la certs/

# If not found, generate:
node generate-certs.js

# Start backend:
npm run dev
```

### Error: "Certificate error in React Native"
**This is normal for development** - the app is configured to accept self-signed certs
- Check `src/utils/httpsConfig.js` is properly initialized
- Verify `AuthContext.js` imports `configureCertificateValidation`

### Frontend Still Connecting to HTTP
**Solution**: Check environment variables
```bash
# Verify .env has:
REACT_APP_USE_HTTPS=true
REACT_APP_API_URL=https://192.168.1.175:3001

# Or in frontend:
# Check src/config/api.js console logs
```

---

## 🔄 Production Deployment Checklist

### Before Going Live

- [ ] 1. Remove self-signed certificates
- [ ] 2. Purchase real SSL certificate from trusted CA (Let's Encrypt, Comodo, etc)
- [ ] 3. Update `.env` with production certificate paths
- [ ] 4. Test with real certificate
- [ ] 5. Set `NODE_ENV=production`
- [ ] 6. Update CORS origins to production domain only
- [ ] 7. Enable HTTP → HTTPS redirect (optional)
- [ ] 8. Set secure cookie flags on production

**Real Certificate Setup**:
```javascript
// For production, update app.js:
const keyPath = '/etc/letsencrypt/live/yourdomain.com/privkey.pem';
const certPath = '/etc/letsencrypt/live/yourdomain.com/fullchain.pem';
```

---

## 📊 Security Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Data Encryption | None (HTTP) | Full (HTTPS) | ✅ 100% |
| Geofence Access | Open (anyone) | Authenticated | ✅ |
| WiFi Sniffing | Tokens visible | Encrypted | ✅ |
| Location Data | Plain text | Encrypted | ✅ |
| OTP in Transit | Visible | Encrypted | ✅ |
| Token Exposure Risk | High | Low | ✅ |

---

## 🎯 Success Criteria

✅ Backend responds with `https://` in logs
✅ Frontend connects without SSL errors
✅ `/geofences` requires authentication token
✅ All traffic encrypted (can't see in WiFi packet analyzer)
✅ Certificates valid for 365 days
✅ No warning messages about certificates in frontend

---

## 📝 File Summary

| File | Purpose | Status |
|------|---------|--------|
| `generate-certs.js` | Generate SSL certificates | ✅ NEW |
| `certs/cert.pem` | SSL certificate (auto-generated) | 📁 NEW |
| `certs/key.pem` | SSL private key (auto-generated) | 📁 NEW |
| `src/app.js` | HTTPS server setup | ✅ UPDATED |
| `src/routes/Tourist_route.js` | Auth on /geofences | ✅ UPDATED |
| `.env.example` | HTTPS environment vars | ✅ UPDATED |
| `src/config/api.js` | Switch to HTTPS URLs | ✅ UPDATED |
| `src/utils/httpsConfig.js` | Certificate handling | ✅ NEW |
| `src/context/AuthContext.js` | Initialize HTTPS support | ✅ UPDATED |
| `package.json` | npm scripts for HTTPS | ✅ UPDATED |

---

## 🚀 Next Steps

1. **Immediate**: Run `node generate-certs.js`
2. **Immediate**: Update `.env` with HTTPS settings
3. **Immediate**: Test with `curl -k https://192.168.1.175:3001/`
4. **Today**: Test frontend connection to HTTPS
5. **This Week**: Do security penetration testing with WiFi analyzer
6. **Before Production**: Replace with real SSL certificate


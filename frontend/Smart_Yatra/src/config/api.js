// API Configuration file - centralized URL management
// This ensures all screens use the same API endpoints

const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

// Change this URL to your backend server address
// For development:
//   - Android Emulator: http://10.0.2.2:3000 (localhost from emulator)
//   - Physical Device/Phone: http://192.168.1.148:3000 (your computer's IP on LAN)
//   - iOS Simulator: http://localhost:3000
//   - Web/Browser: http://localhost:3000

// 🔒 SECURITY: Using HTTP for development (no OpenSSL available)
// For production, switch to HTTPS with proper SSL certificates
const useHTTPS = process.env.REACT_APP_USE_HTTPS === 'true'; // Default: false for dev

// Detect platform and set appropriate BASE_URL
let BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL) {
  try {
    const { Platform } = require('react-native');
    const protocol = useHTTPS ? 'https' : 'http';
    const port = useHTTPS ? 3001 : 3000; // 3001 for HTTPS, 3000 for HTTP
    
    if (Platform.OS === 'web') {
      BASE_URL = `${protocol}://localhost:${port}`;
    } else if (Platform.OS === 'android') {
      // For physical Android devices use your laptop IP
      BASE_URL = `${protocol}://192.168.1.175:${port}`; // Your laptop IP
      // If you run on Android emulator instead of real phone,
      // change the above line to: `${protocol}://10.0.2.2:${port}`
    } else if (Platform.OS === 'ios') {
      // For physical iOS devices use your laptop IP
      BASE_URL = `${protocol}://192.168.1.175:${port}`; // Your laptop IP
    } else {
      BASE_URL = `${protocol}://localhost:${port}`;
    }
  } catch (e) {
    // Fallback for web or when Platform is not available
    const protocol = useHTTPS ? 'https' : 'http';
    const port = useHTTPS ? 3001 : 3000;
    BASE_URL = `${protocol}://localhost:${port}`;
  }
}

// Ensure no trailing slashes
const API_BASE_URL = `${BASE_URL}/api`.replace(/\/$/, '');

// 🔍 DEBUG: Log the API configuration on startup
console.log(`🌐 API Configuration:`);
console.log(`   Base URL: ${BASE_URL}`);
console.log(`   API Base: ${API_BASE_URL}`);
console.log(`   Safety Points: ${API_BASE_URL}/tourists/safety-points`);
console.log(`   Tourist Places: ${API_BASE_URL}/tourists/tourist-places`);

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/tourists/login`,
  LOGIN_ALT: `${API_BASE_URL}/tourists/auth/login`,
  REGISTER: `${API_BASE_URL}/tourists/register`,
  REGISTER_TEAMLEAD: `${API_BASE_URL}/tourists/register-teamlead`,
  REGISTER_AUTHORITY: `${API_BASE_URL}/tourists/register-authority`,
  REFRESH_TOKEN: `${API_BASE_URL}/tourists/auth/refresh`,
  
  // OTP endpoints
  SEND_OTP: `${API_BASE_URL}/tourists/sendRegistrationOTP`,
  VERIFY_OTP: `${API_BASE_URL}/tourists/verifyOTP`,
  
  // Tourist profile endpoints
  GET_PROFILE: (id) => `${API_BASE_URL}/tourists/profile/${id}`,
  UPDATE_PROFILE: (id) => `${API_BASE_URL}/tourists/profile/update/${id}`,
  GET_LOCATION: (id) => `${API_BASE_URL}/tourists/location/${id}`,
  UPDATE_LOCATION: (id) => `${API_BASE_URL}/tourists/location/${id}`,
  UPDATE_NAME: (id) => `${API_BASE_URL}/tourists/name/${id}`,
};

export const API_BASE = API_BASE_URL;

export default {
  API_ENDPOINTS,
  API_BASE,
  isDevelopment,
};

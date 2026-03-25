// API Configuration file - centralized URL management
// This ensures all screens use the same API endpoints

const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

// Change this URL to your backend server address
// For development:
//   - Android Emulator: http://10.0.2.2:3000 (localhost from emulator)
//   - Physical Device/Phone: http://192.168.1.74:3000 (your computer's IP on LAN)
//   - iOS Simulator: http://localhost:3000
//   - Web/Browser: http://localhost:3000

// Detect platform and set appropriate BASE_URL
let BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL) {
  // Try to detect platform
  try {
    // First try to import Platform - works for React Native environments
    const { Platform } = require('react-native');
    if (Platform.OS === 'web') {
      BASE_URL = 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      // For physical Android devices use your computer's IP
      // For emulator use 10.0.2.2
      BASE_URL = 'http://192.168.1.74:3000';
    } else if (Platform.OS === 'ios') {
      BASE_URL = 'http://192.168.1.74:3000';
    } else {
      BASE_URL = 'http://localhost:3000';
    }
  } catch (e) {
    // Fallback for web or when Platform is not available
    BASE_URL = 'http://localhost:3000';
  }
}

// Ensure no trailing slashes
const API_BASE_URL = `${BASE_URL}/api`.replace(/\/$/, '');

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/tourists/login`,
  LOGIN_ALT: `${API_BASE_URL}/tourists/auth/login`,
  REGISTER: `${API_BASE_URL}/tourists/register`,
  REGISTER_TEAMLEAD: `${API_BASE_URL}/tourists/register-teamlead`,
  REGISTER_AUTHORITY: `${API_BASE_URL}/tourists/register-authority`,
  REFRESH_TOKEN: `${API_BASE_URL}/tourists/auth/refresh`,
  
  // OTP endpoints (disabled - not required for signup/login)
  // SEND_OTP: `${API_BASE_URL}/tourists/sendRegistrationOTP`,
  // VERIFY_OTP: `${API_BASE_URL}/tourists/verifyOTP`,
  
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

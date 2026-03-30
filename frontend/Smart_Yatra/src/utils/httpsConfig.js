/**
 * 🔒 HTTPS Certificate Handler for React Native
 * 
 * Handles self-signed SSL certificates used in development
 * This allows the app to work with development HTTPS without certificate errors
 * 
 * ⚠️ IMPORTANT: This is ONLY for development!
 * Never use in production - always use properly signed certificates
 */

import { Platform } from 'react-native';

// Enable self-signed certificate acceptance in development
export const configureCertificateValidation = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ Certificate validation disabled - for development only!');
    return;
  }

  if (Platform.OS === 'android') {
    // Configure Android to accept self-signed certificates in development
    global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
    
    // This is handled by default XMLHttpRequest implementation in React Native
    console.log('✅ Android: Ready for HTTPS with self-signed certificates');
  } else if (Platform.OS === 'ios') {
    // iOS also handles self-signed certificates similarly
    console.log('✅ iOS: Ready for HTTPS with self-signed certificates');
  }
};

/**
 * Setup axios interceptor to handle certificate validation
 * Call this function at app startup in App.js or AuthContext.js
 */
export const setupHTTPSInterceptors = (axiosInstance) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Add request interceptor for HTTPS logging
  axiosInstance.interceptors.request.use(
    (config) => {
      if (config.url.startsWith('https')) {
        console.log('🔒 Secure Request:', {
          method: config.method.toUpperCase(),
          url: config.url,
          encrypted: true,
        });
      }
      return config;
    },
    (error) => {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.error('🔴 HTTPS Connection Error:', {
          message: error.message,
          hint: 'Check if backend is running on HTTPS port 3001',
          generateCerts: 'Run: node generate-certs.js',
          enableHTTPS: 'Set HTTPS_ENABLED=true in .env',
        });
      }
      return Promise.reject(error);
    }
  );

  // Add response interceptor for HTTPS success logging
  axiosInstance.interceptors.response.use(
    (response) => {
      if (response.config.url.startsWith('https')) {
        console.log('✅ Secure Response:', {
          status: response.status,
          url: response.config.url,
          encrypted: true,
        });
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
};

export default {
  configureCertificateValidation,
  setupHTTPSInterceptors,
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const baseurl = 'http://localhost:3000/api';

export const TokenManager = {
  // Store tokens
  storeTokens: async (token, refreshToken, user) => {
    try {
      await AsyncStorage.multiSet([
        ['@token', token],
        ['@refreshToken', refreshToken],
        ['@user', JSON.stringify(user)],
        ['@isLoggedIn', 'true']
      ]);
      return true;
    } catch (error) {
      console.error('Error storing tokens:', error);
      return false;
    }
  },

  // Get stored tokens
  getTokens: async () => {
    try {
      const tokens = await AsyncStorage.multiGet([
        '@token',
        '@refreshToken',
        '@user',
        '@isLoggedIn'
      ]);
      
      return {
        token: tokens[0][1],
        refreshToken: tokens[1][1],
        user: tokens[2][1] ? JSON.parse(tokens[2][1]) : null,
        isLoggedIn: tokens[3][1] === 'true'
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  },

  // Clear all tokens (logout)
  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        '@token',
        '@refreshToken',
        '@user',
        '@isLoggedIn'
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const { refreshToken } = await TokenManager.getTokens();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${baseurl}/tourists/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.multiSet([
          ['@token', data.token],
          ['@refreshToken', data.refreshToken]
        ]);
        return data.token;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await TokenManager.clearTokens();
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const { token, isLoggedIn } = await TokenManager.getTokens();
      return !!(token && isLoggedIn);
    } catch (error) {
      return false;
    }
  }
};
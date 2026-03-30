import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureCertificateValidation } from '../utils/httpsConfig';

// 🔒 Initialize HTTPS certificate validation for development
configureCertificateValidation();

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [touristId, setTouristId] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('@isLoggedIn');
      const token = await AsyncStorage.getItem('@token');
      const storedUser = await AsyncStorage.getItem('@user');
      const storedTouristId = await AsyncStorage.getItem('@tourist_id');
      
      if (isLoggedIn === 'true' && token !== null) {
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedTouristId) {
          setTouristId(storedTouristId);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@token',
        '@refreshToken',
        '@user',
        '@tourist_id',
        '@isLoggedIn'
      ]);
      setIsAuthenticated(false);
      setUser(null);
      setTouristId(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const login = async (token, refreshToken, user) => {
    try {
      const userId = user._id || user.id;
      await AsyncStorage.multiSet([
        ['@token', token],
        ['@refreshToken', refreshToken],
        ['@user', JSON.stringify(user)],
        ['@tourist_id', userId],
        ['@isLoggedIn', 'true']
      ]);
      setIsAuthenticated(true);
      setUser(user);
      setTouristId(userId);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('@token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const getTouristId = async () => {
    try {
      return await AsyncStorage.getItem('@tourist_id');
    } catch (error) {
      console.error('Error getting tourist ID:', error);
      return null;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Prevent rendering children until auth check is complete
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        user,
        touristId,
        logout, 
        login, 
        checkAuthStatus,
        getToken,
        getTouristId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
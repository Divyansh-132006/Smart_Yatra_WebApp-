import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext'; 
const { width, height } = Dimensions.get('window');
import { Image } from 'react-native';

const baseurl = 'http://10.10.148.57:3000/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    const loginData = {
      email: email.trim().toLowerCase(),
      password: password,
      role: 'tourist'
    };

    console.log('Sending login request:', { email: loginData.email, role: loginData.role });

    try {
      const response = await fetch(`${baseurl}/tourists/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Login response status:', response.status);
      const responseData = await response.json();
      console.log('Login response data:', responseData);

      if (response.status === 200 && responseData.success) {
        // Login successful - access nested data
        const { token, refreshToken, user } = responseData.data;
        
        // Store tourist_id for profile fetching
        await AsyncStorage.setItem('@tourist_id', user._id || user.id);
        
        await login(token, refreshToken, user);
        console.log('Login successful, user authenticated');
        
      } else if (response.status === 400) {
        Alert.alert('Error', responseData.message || 'Invalid request');
      } else if (response.status === 401) {
        Alert.alert('Error', 'Invalid email or password');
      } else if (response.status === 404) {
        Alert.alert(
          'Account Not Found',
          'No account found with this email address. Would you like to create a new account?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Up', onPress: () => navigation.navigate('UserTypeSelection') }
          ]
        );
      } else if (response.status === 500) {
        Alert.alert('Error', 'Server error. Please try again later.');
      } else {
        Alert.alert('Error', responseData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>SmartYatra</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationWrapper}>
            <LottieView
              source={require('../../../assets/animation/Tourists by car.json')}
              autoPlay
              loop
              style={styles.travelGif}
            />
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Log in to continue your journey</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                email && !validateEmail(email) && styles.errorInput
              ]}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {email && !validateEmail(email) && (
              <Text style={styles.errorText}>Please enter a valid email</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => {
                console.log('Forgot password clicked');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton,
              (!email || !password || isLoading) && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={!email || !password || isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserTypeSelection')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  travelGif: {
    width: width * 0.7,
    height: 220,
    borderRadius: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  illustrationWrapper: {
    width: width * 0.8,
    height: 210,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  errorInput: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 16,
  },
  signUpLink: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
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
import { API_ENDPOINTS } from '../../config/api';
const { width, height } = Dimensions.get('window');
import { Image } from 'react-native';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const navigation = useNavigation();

  // Add email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add password strength validation
const validatePassword = (password) => {
  return password.length >= 6;
};

  // Update the handleSignUp function with better validation
  const handleSignUp = async () => {
    // Enhanced validation
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!mobile.trim()) {
      Alert.alert('Missing Mobile', 'Please enter your mobile number');
      return;
    }

    if (mobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!password) {
      Alert.alert('Missing Password', 'Please create a password');
      return;
    }
    
    if (!validatePassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    setIsRegistering(true);

    const registrationData = {
      name: fullName,
      email: email,
      phone: mobile,
      password: password
    };

    console.log('Sending registration request:', registrationData);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.status === 200 || response.status === 201) {
        // Registration successful
        Alert.alert(
          'Success!', 
          'Account created successfully! You can now login with your credentials.',
          [
            { 
              text: 'Go to Login', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        
        // Optionally store the token for auto-login
        if (data.token) {
          // You can store the token in AsyncStorage here if needed
          console.log('Registration token received:', data.token);
        }

         navigation.navigate('Login');
      } else if (response.status === 400) {
        // Handle validation errors
        Alert.alert('Validation Error', data.message || 'Please check your input and try again');
      } else if (response.status === 409) {
        // Handle conflict - user already exists
        if (data.message && data.message.includes('phone number already exists')) {
          Alert.alert(
            'Account Exists', 
            'An account with this phone number already exists. Would you like to login instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Go to Login', 
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        } else if (data.message && data.message.includes('email')) {
          Alert.alert(
            'Account Exists', 
            'An account with this email already exists. Would you like to login instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Go to Login', 
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        } else {
          Alert.alert('Account Exists', data.message || 'An account with these details already exists');
        }
      } else if (response.status === 500) {
        // Handle server errors
        Alert.alert(
          'Server Error', 
          'Something went wrong on our end. Please try again later.'
        );
      } else {
        // Handle other status codes
        Alert.alert('Registration Failed', data.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Network Error', 
        'Please check your internet connection and try again.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Add visual feedback for form validation
const getInputStyle = (field, value) => {
  let baseStyle = [styles.textInput];
  
  if (field === 'email' && value && !validateEmail(value)) {
    baseStyle.push(styles.errorInput);
  } else if (field === 'password' && value && !validatePassword(value)) {
    baseStyle.push(styles.errorInput);
  }
  
  return baseStyle;
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
          <Text style={styles.welcomeTitle}>Create Your Account</Text>
          <Text style={styles.welcomeSubtitle}>Unlock your next great adventure</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={getInputStyle('email', email)}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {email && !validateEmail(email) && (
              <Text style={styles.errorText}>Please enter a valid email</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your mobile number"
              placeholderTextColor="#9CA3AF"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={getInputStyle('password', password)}
              placeholder="Create Password (min 6 characters)"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {password && !validatePassword(password) && (
              <Text style={styles.errorText}>Password must be at least 6 characters</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              isRegistering && styles.disabledButton
            ]} 
            onPress={handleSignUp}
            disabled={isRegistering}
          >
            <Text style={styles.signupButtonText}>
              {isRegistering ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>Already have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpLink} onPress={() => navigation.navigate('Login')}>Login here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  illustrationWrapper: {
    width: width * 0.85,
    height: 220,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  travelGif: {
    width: '90%',
    height: 200,
    borderRadius: 15,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  inputContainer: {
    marginBottom: 18,
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifiedInput: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  verifiedIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  otpButton: {
    backgroundColor: '#10B981',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorInput: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
});

export default SignupScreen;
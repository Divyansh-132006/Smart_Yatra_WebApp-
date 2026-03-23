import React, { useState, useEffect } from 'react';
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
const { width, height } = Dimensions.get('window');
import { Image } from 'react-native';

const baseurl = 'http://10.10.148.57:3000/api';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false); // Add loading state

  const navigation = useNavigation();

  // Timer effect for resend OTP
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

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
    // Temporarily disabled OTP verification
    // if (!otpVerified) {
    //   Alert.alert('Verify OTP', 'Please verify your mobile number first');
    //   return;
    // }
    
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
      const response = await fetch(`${baseurl}/tourists/register`, {
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
        if (data.message && data.message.includes('All fields are required')) {
          Alert.alert('Missing Information', 'Please fill in all required fields');
        } else if (data.message && data.message.includes('verify your phone number')) {
          Alert.alert(
            'OTP Not Verified', 
            'Please verify your phone number with OTP first',
            [
              { 
                text: 'Verify Now', 
                onPress: () => {
                  setOtpVerified(false);
                  setOtpSent(false);
                  setOtp('');
                }
              }
            ]
          );
        } else {
          Alert.alert('Validation Error', data.message || 'Please check your input and try again');
        }
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

  const sendOtp = async () => {
    if (mobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address first');
      return;
    }
    
    try {
      const response = await fetch(`${baseurl}/tourists/sendRegistrationOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: mobile, 
          email: email
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'OTP Sent!',
          data.message || `OTP has been sent to your registered mobile number ${mobile}`,
          [{ text: 'OK' }]
        );
        setOtpSent(true);
        setTimer(60);
        setIsTimerActive(true);
        setOtpAttempts(0); // Reset attempts counter
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }
    
    const requestData = { 
      phone: mobile, 
      otp: otp,
      purpose: 'registration'
    };
    
    console.log('Sending OTP verification request:', requestData); // Debug log
    
    try {
      const response = await fetch(`${baseurl}/tourists/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (response.status === 200 && data.verified) {
        // OTP verified successfully
        Alert.alert('Success', 'OTP verified successfully!');
        setOtpVerified(true);
        setIsTimerActive(false);
      } else if (response.status === 400) {
        // Handle 400 Bad Request - OTP validation errors
        if (data.message && data.message.includes('attempts remaining')) {
          // Extract remaining attempts from message
          const attemptsMatch = data.message.match(/(\d+) attempts remaining/);
          const remainingAttempts = attemptsMatch ? attemptsMatch[1] : '0';
          Alert.alert(
            'Invalid OTP', 
            `Wrong OTP entered. ${remainingAttempts} attempts remaining.`
          );
          // Clear OTP input for retry
          setOtp('');
        } else if (data.message && data.message.includes('Too many failed attempts')) {
          Alert.alert(
            'Too Many Attempts', 
            'You have exceeded the maximum attempts. Please request a new OTP.',
            [{ 
              text: 'Request New OTP', 
              onPress: () => {
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
                setIsTimerActive(false);
                setTimer(0);
              }
            }]
          );
        } else if (data.message && data.message.includes('expired')) {
          Alert.alert(
            'OTP Expired', 
            'Your OTP has expired. Please request a new one.',
            [{ 
              text: 'Request New OTP', 
              onPress: () => {
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
                setIsTimerActive(false);
                setTimer(0);
              }
            }]
          );
        } else if (data.message && data.message.includes('OTP not found')) {
          Alert.alert(
            'OTP Not Found', 
            'No valid OTP found. Please request a new one.',
            [{ 
              text: 'Request New OTP', 
              onPress: () => {
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
                setIsTimerActive(false);
                setTimer(0);
              }
            }]
          );
        } else if (data.message && data.message.includes('required')) {
          Alert.alert('Missing Information', 'Phone, OTP, and purpose are required');
        } else {
          // Generic 400 error - likely invalid OTP
          Alert.alert(
            'Invalid OTP', 
            data.message || 'The OTP you entered is incorrect. Please try again.'
          );
          setOtp(''); // Clear OTP input for retry
        }
      } else if (response.status === 409) {
        // Handle conflict errors (if any)
        Alert.alert('Error', data.message || 'Conflict error occurred');
      } else if (response.status === 500) {
        // Handle server errors
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
      } else {
        // Handle other status codes
        Alert.alert('Error', data.message || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    }
  };

  const resendOtp = async () => {
    setOtp('');
    setOtpVerified(false);
    
    try {
      const response = await fetch(`${baseurl}/tourists/sendRegistrationOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: mobile, 
          email: email
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTimer(60);
        setIsTimerActive(true);
        setOtpAttempts(0);
        Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number');
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add visual feedback for form validation
const getInputStyle = (field, value) => {
  let baseStyle = [styles.textInput];
  
  if (field === 'email' && value && !validateEmail(value)) {
    baseStyle.push(styles.errorInput);
  } else if (field === 'password' && value && !validatePassword(value)) {
    baseStyle.push(styles.errorInput);
  } else if (field === 'mobile' && otpVerified) {
    baseStyle.push(styles.verifiedInput);
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
              style={[styles.textInput, otpVerified && styles.verifiedInput]}
              placeholder="Enter your mobile number"
              placeholderTextColor="#9CA3AF"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              maxLength={10}
              editable={!otpVerified}
            />
            {otpVerified && (
              <View style={styles.verifiedIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            )}
          </View>

          {/* OTP Input - appears above the send/verify button */}
          {otpSent && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput, 
                  otpVerified && styles.verifiedInput
                ]}
                placeholder="Enter the 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                editable={!otpVerified}
              />
              {otpVerified && (
                <View style={styles.verifiedIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              )}
            </View>
          )}

          {/* OTP Action Button */}
          {!otpSent ? (
            <TouchableOpacity
              style={[
                styles.otpButton, 
                (mobile.length < 10 || !email) && styles.disabledButton
              ]}
              onPress={sendOtp}
              disabled={mobile.length < 10 || !email}
            >
              <Text style={styles.otpButtonText}>Send OTP</Text>
            </TouchableOpacity>
          ) : !otpVerified ? (
            <>
              <TouchableOpacity
                style={[styles.verifyButton, otp.length < 6 && styles.disabledButton]}
                onPress={verifyOtp}
                disabled={otp.length < 6}
              >
                <Text style={styles.otpButtonText}>Verify OTP</Text>
              </TouchableOpacity>
              
              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {isTimerActive ? (
                  <Text style={styles.timerText}>
                    Resend OTP in {formatTime(timer)}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={resendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.verifiedContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.verifiedText}>Mobile number verified!</Text>
            </View>
          )}

          {/* Password field - only show after OTP verification */}
          {otpVerified && (
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
          )}

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              (!otpVerified || isRegistering) && styles.disabledButton
            ]} 
            onPress={handleSignUp}
            disabled={!otpVerified || isRegistering}
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
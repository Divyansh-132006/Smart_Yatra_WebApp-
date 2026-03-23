


// individual one 



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
const { width, height } = Dimensions.get('window');
import { Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const baseurl = 'http://10.0.2.2:3000/tourists'; // Android emulator

const SignupScreenOffical = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [idnumber, setidnumber] = useState('');
    const [govType, setGovType] = useState('');
    const [otp, setOtp] = useState('');
    const [mobile, setMobile] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [department, setDepartment] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigation = useNavigation();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleSignUp = async () => {
        // Validation
        if (!fullName.trim()) {
            Alert.alert('Missing Name', 'Please enter your full name');
            return;
        }

        if (!govType) {
            Alert.alert('Select Government Type', 'Please select State or Central Government');
            return;
        }

        if (!department) {
            Alert.alert('Select Department', 'Please select your department');
            return;
        }

        if (!idnumber.trim()) {
            Alert.alert('Missing ID', 'Please enter your ID number');
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
            password: password,
            idnumber: idnumber,
            govType: govType,
            department: department
        };

        console.log('Sending authority registration request:', registrationData);

        try {
            const response = await fetch(`${baseurl}/register-authority`, {
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
                Alert.alert(
                    'Success!',
                    'Authority account created successfully! You can now login with your credentials.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
                navigation.navigate('Login');
            } else if (response.status === 400) {
                Alert.alert('Validation Error', data.message || 'Please check your input and try again');
            } else if (response.status === 409) {
                Alert.alert(
                    'Account Exists',
                    'An account with this phone number or email already exists. Would you like to login instead?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Go to Login',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            } else if (response.status === 500) {
                Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
            } else {
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
    const sendOtp = () => {
        if (mobile.length < 10) {
            Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
            return;
        }
        Alert.alert(
            'OTP Sent!',
            `OTP has been sent to your registered mobile number ${mobile}`,
            [{ text: 'OK' }]
        );
        setOtpSent(true);
    };

    // OTP functionality temporarily disabled
    /* 
                    <TouchableOpacity
                        style={[styles.otpButton, otpSent && styles.otpButtonSent]}
                        onPress={sendOtp}
                        disabled={otpSent || mobile.length < 10}
                    >
                        <Text style={styles.otpButtonText}>
                            {otpSent ? 'OTP Sent ✓' : 'Send OTP'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.textInput, !otpSent && styles.disabledInput]}
                            placeholder="Enter the OTP"
                            placeholderTextColor="#9CA3AF"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="numeric"
                            maxLength={6}
                            editable={otpSent}
                        />
                    </View>
    */

const departments = [
  { label: "Select Department", value: "" },
  { label: "Ministry of Tourism (Central)", value: "central_tourism" },
  { label: "State Tourism Department", value: "state_tourism" },
  { label: "Wildlife / Forest & Eco-Tourism", value: "wildlife_forest" },
  { label: "Archaeology / Cultural Heritage Dept", value: "heritage" },
  { label: "National Disaster Management Authority", value: "ndma" },
  { label: "State Disaster Management Authority", value: "sdma" },
  { label: "Tourist Police / Assistance Unit", value: "tourist_police" },
  { label: "Transport & Road Safety Department", value: "transport" },
];


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
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
                            source={require('../../../assets/animation/guider.json')}
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
                        <Picker
                            selectedValue={govType}
                            onValueChange={(itemValue) => setGovType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Government Type" value="" />
                            <Picker.Item label="State Government" value="state" />
                            <Picker.Item label="Central Government" value="central" />
                        </Picker>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={department}
                            onValueChange={(itemValue) => setDepartment(itemValue)}
                            style={styles.picker}
                        >
                            {departments.map((dept, index) => (
                                <Picker.Item
                                    key={index}
                                    label={dept.label}
                                    value={dept.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your ID number"
                            placeholderTextColor="#9CA3AF"
                            value={idnumber}
                            onChangeText={setidnumber}
                            keyboardType="numeric"
                            maxLength={12}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder=" Offical Email Address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
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

                    {/* OTP functionality temporarily disabled */}
                    {/* 
                    <TouchableOpacity
                        style={[styles.otpButton, otpSent && styles.otpButtonSent]}
                        onPress={sendOtp}
                        disabled={otpSent || mobile.length < 10}
                    >
                        <Text style={styles.otpButtonText}>
                            {otpSent ? 'OTP Sent ✓' : 'Send OTP'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.textInput, !otpSent && styles.disabledInput]}
                            placeholder="Enter the OTP"
                            placeholderTextColor="#9CA3AF"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="numeric"
                            maxLength={6}
                            editable={otpSent}
                        />
                    </View>
                    */}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Create Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={handleSignUp}
                        disabled={isRegistering}
                    >
                        <Text style={styles.signupButtonText}>
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
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
    backgroundColor: '#F1F5F9', // light background
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20, // consistent horizontal padding
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 18,
  },
  picker: {
    height: 50,
    color: '#1F2937',
    paddingHorizontal: 10,
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
  otpButtonSent: {
    backgroundColor: '#6B7280',
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});


export default SignupScreenOffical;
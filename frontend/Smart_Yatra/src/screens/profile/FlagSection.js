// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Alert,
//   StyleSheet,
// } from "react-native";

// export default function Report() {
//   const [selectedIssues, setSelectedIssues] = useState([]);
//   const [comment, setComment] = useState("");

//   const issueOptions = ["Road Blocked", "Unsafe Area", "Heavy Traffic", "Poor Lighting"];

//   const handleIssueChange = (issue) => {
//     setSelectedIssues((prev) =>
//       prev.includes(issue)
//         ? prev.filter((i) => i !== issue)
//         : [...prev, issue]
//     );
//   };

//   const handleSubmitReport = () => {
//     console.log("Submitted Issues:", selectedIssues);
//     console.log("Additional Comment:", comment);
//     Alert.alert("Success", "Report submitted!");
//     setSelectedIssues([]);
//     setComment("");
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//       <Text style={styles.title}>Report an Issue</Text>

//       {issueOptions.map((issue, idx) => (
//         <TouchableOpacity
//           key={idx}
//           style={styles.issueButton}
//           onPress={() => handleIssueChange(issue)}
//         >
//           <Text style={styles.issueText}>{issue}</Text>
//           <Text style={styles.checkbox}>
//             {selectedIssues.includes(issue) ? "✅" : "⬜"}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       <TextInput
//         style={styles.textInput}
//         placeholder="Other issues..."
//         value={comment}
//         onChangeText={setComment}
//         multiline={true}
//         numberOfLines={4}
//         textAlignVertical="top"
//       />

//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleSubmitReport}
//       >
//         <Text style={styles.submitButtonText}>Submit Report</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: '#000000',
//   },
//   issueButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#d1d5db',
//     backgroundColor: 'transparent',
//   },
//   issueText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#000000',
//   },
//   checkbox: {
//     fontSize: 16,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 8,
//     padding: 12,
//     marginVertical: 12,
//     minHeight: 80,
//     fontSize: 16,
//     backgroundColor: '#ffffff',
//   },
//   submitButton: {
//     backgroundColor: '#2563eb',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

/* ---------------- Custom Components ---------------- */
const TabButton = ({ title, isActive, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text style={styles.tabIcon}>{icon}</Text>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CustomButton = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity
    style={[styles.button, style, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

/* ---------------- Flag Component ---------------- */
const FlagComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [customIssue, setCustomIssue] = useState('');

  const commonIssues = [
    'Road damage/Pothole',
    'Broken streetlight',
    'Garbage disposal issue',
    'Water leakage',
    'Traffic signal problem',
    'Illegal parking',
    'Noise pollution',
    'Other'
  ];

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location permission denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      setCurrentLocation(`GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.log('Location error:', error);
      setCurrentLocation('Unable to fetch location');
    }
  };

  const handleImageCapture = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      await getCurrentLocation();
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setCurrentLocation('Location: From gallery image');
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please capture an image first');
      return;
    }
    if (!selectedIssue && !customIssue.trim()) {
      Alert.alert('Error', 'Please select or describe the issue');
      return;
    }

    Alert.alert('Success', 'Your flag report has been submitted successfully!');
    setSelectedImage(null);
    setCurrentLocation('');
    setSelectedIssue('');
    setCustomIssue('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Camera Section */}
      <Card>
        <Text style={styles.cardTitle}>📷 Capture Issue</Text>
        <TouchableOpacity style={styles.captureButton} onPress={handleImageCapture}>
          <Text style={styles.captureButtonIcon}>📷</Text>
          <Text style={styles.captureButtonText}>Take Photo</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <Text style={styles.successText}>✓ Image captured successfully</Text>
          </View>
        )}

        {currentLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>📍 Location:</Text>
            <Text style={styles.locationText}>{currentLocation}</Text>
          </View>
        )}
      </Card>

      {/* Common Issues Section */}
      <Card style={styles.marginTop}>
        <Text style={styles.cardTitle}>🚩 Common Issues</Text>
        <View style={styles.issuesGrid}>
          {commonIssues.map((issue, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.issueButton,
                selectedIssue === issue && styles.selectedIssueButton
              ]}
              onPress={() => setSelectedIssue(issue)}
            >
              <Text style={[
                styles.issueButtonText,
                selectedIssue === issue && styles.selectedIssueButtonText
              ]}>
                {issue}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Custom Issue Section */}
      <Card style={styles.marginTop}>
        <Text style={styles.cardTitle}>💬 Describe Your Issue</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please describe the issue in detail..."
          value={customIssue}
          onChangeText={setCustomIssue}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      {/* Submit Button */}
      <CustomButton
        title="Submit Flag Report"
        onPress={handleSubmit}
        style={[styles.submitButton, { backgroundColor: '#dc2626' }]}
      />
    </ScrollView>
  );
};

/* ---------------- Feedback Component ---------------- */
const FeedbackComponent = () => {
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(0);

  const handleRatingPress = (star) => {
    setRating(star);
  };

  const handleSubmitFeedback = () => {
    if (!experience.trim()) {
      Alert.alert('Error', 'Please share your experience');
      return;
    }

    Alert.alert('Success', 'Your feedback has been submitted successfully!');
    setExperience('');
    setRating(0);
  };

  const getRatingText = () => {
    if (rating === 0) return 'Tap to rate';
    return `${rating} star${rating > 1 ? 's' : ''}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.cardTitle}>⭐ Rate Your Experience</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleRatingPress(star)}
              >
                <Text style={[
                  styles.star,
                  star <= rating && styles.activeStar
                ]}>
                  ⭐
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>
      </Card>

      <Card style={styles.marginTop}>
        <Text style={styles.cardTitle}>💬 Share Your Experience</Text>
        <TextInput
          style={[styles.textArea, { height: 120 }]}
          placeholder="Tell us about your experience with our service..."
          value={experience}
          onChangeText={setExperience}
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
        />
      </Card>

      <CustomButton
        title="Submit Feedback"
        onPress={handleSubmitFeedback}
        style={[styles.submitButton, { backgroundColor: '#16a34a' }]}
      />
    </ScrollView>
  );
};

/* ---------------- Main App Component ---------------- */
export default function Flag() {
  const [activeTab, setActiveTab] = useState('flag');
  const [location] = useState('Delhi');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Experience</Text>
          <Text style={styles.headerSubtitle}>Flag issues and share your feedback</Text>
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText}>📍 {location}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Flag"
          icon="🚩"
          isActive={activeTab === 'flag'}
          onPress={() => setActiveTab('flag')}
        />
        <TabButton
          title="Feedback"
          icon="💬"
          isActive={activeTab === 'feedback'}
          onPress={() => setActiveTab('feedback')}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'flag' ? <FlagComponent /> : <FeedbackComponent />}
      </View>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  locationBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  locationBadgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  activeTabButton: { backgroundColor: '#3b82f6' },
  tabIcon: { fontSize: 16 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  activeTabText: { color: '#ffffff' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  container: { flex: 1 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marginTop: { marginTop: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  captureButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonIcon: { fontSize: 48, marginBottom: 8 },
  captureButtonText: { fontSize: 16, color: '#3b82f6', fontWeight: '500' },
  imagePreview: { alignItems: 'center', marginTop: 16 },
  previewImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 8 },
  successText: { color: '#16a34a', fontSize: 14, fontWeight: '500' },
  locationContainer: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  locationLabel: { color: '#1d4ed8', fontWeight: '500', marginBottom: 4 },
  locationText: { color: '#6b7280', fontSize: 12 },
  issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  issueButton: {
    width: (width - 80) / 2,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedIssueButton: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  issueButtonText: { fontSize: 12, color: '#374151', textAlign: 'center', fontWeight: '500' },
  selectedIssueButtonText: { color: '#ffffff' },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  submitButton: { marginTop: 24, marginBottom: 20 },
  disabledButton: { opacity: 0.5 },
  ratingContainer: { alignItems: 'center' },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  starButton: { padding: 8, borderRadius: 20 },
  star: { fontSize: 32, color: '#d1d5db' },
  activeStar: { color: '#fbbf24' },
  ratingText: { fontSize: 14, color: '#6b7280' },
});

// Package.json dependencies that need to be installed:
/*
{
  "dependencies": {
    "react": "18.x.x",
    "react-native": "0.72.x",
    "react-native-image-picker": "^5.6.0",
    "@react-native-community/geolocation": "^3.0.6",
    "react-native-permissions": "^3.8.0"
  }
}

Installation commands:
npm install react-native-image-picker @react-native-community/geolocation react-native-permissions

For iOS:
cd ios && pod install

Android permissions (android/app/src/main/AndroidManifest.xml):
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

iOS permissions (ios/YourApp/Info.plist):
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to capture images</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to tag issues</string>
*/
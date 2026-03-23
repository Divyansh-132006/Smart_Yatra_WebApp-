import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera,
  Heart, Globe, Plane, Languages, Star, Mountain, Compass, Shield,
  Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Lock
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const baseurl = 'http://10.10.148.57:3000/api';

// Move ProfileField outside the main component
const ProfileField = React.memo(({ 
  icon: Icon, 
  label, 
  name, 
  value, 
  type = "text", 
  multiline = false, 
  options = null,
  isEditing,
  editData,
  onTextChange,
  onSelectChange,
  onDatePress,
  formatDate,
  disabled = false
}) => (
  <View style={styles.profileField}>
    <View style={styles.profileFieldContent}>
      <Icon size={24} color={disabled ? "#9CA3AF" : "#6366F1"} />
      <View style={styles.profileFieldTextContainer}>
        <View style={styles.fieldHeader}>
          <Text style={[styles.profileFieldLabel, disabled && styles.disabledLabel]}>
            {label}
          </Text>
          {disabled && <Lock size={14} color="#9CA3AF" />}
        </View>
        {isEditing && !disabled ? (
          type === 'select' ? (
            <View style={styles.selectContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    editData[name] === option.value && styles.selectOptionActive
                  ]}
                  onPress={() => onSelectChange(name, option.value)}
                >
                  <Text style={[
                    styles.selectOptionText,
                    editData[name] === option.value && styles.selectOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : type === 'date' ? (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={onDatePress}
            >
              <Text style={styles.dateButtonText}>
                {editData[name] ? formatDate(editData[name]) : 'Select Date'}
              </Text>
              <Calendar size={20} color="#6366F1" />
            </TouchableOpacity>
          ) : (
            <TextInput
              style={[styles.profileFieldInput, multiline && styles.multilineInput]}
              value={(editData[name] || '').toString()}
              onChangeText={(text) => onTextChange(name, text)}
              placeholder={`Enter ${label.toLowerCase()}`}
              keyboardType={type === 'email' ? 'email-address' : type === 'tel' ? 'phone-pad' : 'default'}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              autoFocus={false}
              blurOnSubmit={false}
              returnKeyType={multiline ? 'default' : 'done'}
            />
          )
        ) : (
          <View style={[styles.valueContainer, disabled && styles.disabledValueContainer]}>
            <Text style={[styles.profileFieldValue, disabled && styles.disabledValue]}>
              {type === "date" ? formatDate(value) : value || 'Not provided'}
            </Text>
            {disabled && (
              <Text style={styles.disabledHint}>
                {name === 'email' ? 'Email cannot be changed' : 'Phone cannot be changed'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  </View>
));

// Move GovtIdField outside the main component
const GovtIdField = React.memo(({ 
  profile, 
  showGovtId, 
  onToggleGovtId, 
  onVerifyGovtId, 
  maskGovtId,
  isEditing,
  editData,
  onTextChange,
  onSelectChange
}) => {
  const govtIdTypeOptions = [
    { label: 'Aadhaar', value: 'aadhaar' },
    { label: 'Passport', value: 'passport' },
    { label: 'Driving License', value: 'driving_license' },
    { label: 'Voter ID', value: 'voter_id' }
  ];

  return (
    <View style={styles.profileField}>
      <View style={styles.profileFieldContent}>
        <Shield size={24} color="#6366F1" />
        <View style={styles.profileFieldTextContainer}>
          <View style={styles.govtIdHeader}>
            <Text style={styles.profileFieldLabel}>Government ID</Text>
            <View style={styles.verificationStatus}>
              {profile.aadhaar_verified ? (
                <CheckCircle size={16} color="#10B981" />
              ) : (
                <AlertCircle size={16} color="#F59E0B" />
              )}
              <Text style={[
                styles.verificationText,
                { color: profile.aadhaar_verified ? '#10B981' : '#F59E0B' }
              ]}>
                {profile.aadhaar_verified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
          
          {/* Government ID Type */}
          <View style={styles.govtIdSubField}>
            <Text style={styles.govtIdSubLabel}>ID Type</Text>
            {isEditing ? (
              <View style={styles.selectContainer}>
                {govtIdTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.selectOption,
                      editData.govt_id_type === option.value && styles.selectOptionActive
                    ]}
                    onPress={() => onSelectChange('govt_id_type', option.value)}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      editData.govt_id_type === option.value && styles.selectOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.govtIdType}>
                {profile.govt_id_type ? profile.govt_id_type.toUpperCase() : 'Not provided'}
              </Text>
            )}
          </View>

          {/* Government ID Number */}
          <View style={styles.govtIdSubField}>
            <Text style={styles.govtIdSubLabel}>ID Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.profileFieldInput}
                value={editData.govt_id_number || ''}
                onChangeText={(text) => onTextChange('govt_id_number', text)}
                placeholder="Enter ID number"
                autoFocus={false}
                blurOnSubmit={false}
                returnKeyType="done"
              />
            ) : (
              <View style={styles.govtIdRow}>
                <Text style={styles.govtIdNumber}>
                  {showGovtId ? profile.govt_id_number : maskGovtId(profile.govt_id_number)}
                </Text>
                <TouchableOpacity 
                  onPress={onToggleGovtId}
                  style={styles.eyeButton}
                >
                  {showGovtId ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.verifyButton} 
            onPress={onVerifyGovtId}
          >
            <Shield size={16} color="white" />
            <Text style={styles.verifyButtonText}>
              {profile.aadhaar_verified ? 'Re-verify ID' : 'Verify Government ID'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// Move EmergencyContactsField outside the main component
const EmergencyContactsField = React.memo(({ 
  editData, 
  isEditing, 
  onRemoveContact, 
  newEmergencyContact, 
  onChangeNewContact, 
  onAddContact 
}) => {
  const emergencyContacts = editData.emergency_contacts || [];
  
  return (
    <View style={styles.profileField}>
      <View style={styles.profileFieldContent}>
        <Phone size={24} color="#6366F1" />
        <View style={styles.profileFieldTextContainer}>
          <Text style={styles.profileFieldLabel}>Emergency Contacts</Text>
          
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.emergencyContactRow}>
                <Text style={styles.emergencyContactText}>{contact}</Text>
                {isEditing && (
                  <TouchableOpacity 
                    onPress={() => onRemoveContact(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.profileFieldValue}>No emergency contacts added</Text>
          )}

          {isEditing && (
            <View style={styles.addContactContainer}>
              <TextInput
                style={styles.addContactInput}
                value={newEmergencyContact}
                onChangeText={onChangeNewContact}
                placeholder="Add emergency contact"
                keyboardType="phone-pad"
                autoFocus={false}
                blurOnSubmit={false}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.addContactButton}
                onPress={onAddContact}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const ProfileSection = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGovtId, setShowGovtId] = useState(false);
  const [newEmergencyContact, setNewEmergencyContact] = useState('');
  const { logout, getToken, getTouristId } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const token = await getToken();
      const touristId = await getTouristId();
      
      if (!token || !touristId) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        await logout();
        return;
      }

      console.log('Fetching profile for tourist ID:', touristId);

      // Use the tourist ID in the URL path
      const response = await fetch(`${baseurl}/tourists/profile/${touristId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Profile fetch response status:', response.status);
      
      // Handle non-JSON responses
      let result;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        Alert.alert('Error', 'Invalid response from server. Please try again.');
        return;
      }

      console.log('Profile fetch response:', result);

      if (response.ok && result.success) {
        const profileData = {
          ...result.data,
          emergency_contacts: result.data.emergency_contacts || [],
          dob: result.data.dob ? result.data.dob.split('T')[0] : null, // Format date properly
          // Map backend field names to frontend field names
          name: result.data.name || result.data.full_name,
          phone: result.data.phone || result.data.phone_number,
          profileImage: result.data.profileImage || result.data.profile_image,
          govt_id_type: result.data.govt_id_type || result.data.government_id_type,
          govt_id_number: result.data.govt_id_number || result.data.government_id_number,
          aadhaar_verified: result.data.aadhaar_verified || result.data.is_verified || false,
        };
        
        setProfile(profileData);
        setEditData({ ...profileData });
        console.log('Profile loaded successfully');
      } else if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
        await logout();
      } else if (response.status === 404) {
        Alert.alert('Error', 'Profile not found. Please check your account.');
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData) => {
    try {
      setUpdating(true);
      
      const token = await getToken();
      const touristId = await getTouristId();
      
      if (!token || !touristId) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        await logout();
        return false;
      }

      // Prepare data for API (exclude fields that shouldn't be updated)
      const { _id, __v, createdAt, updatedAt, password_hash, profileImage, email, phone, ...updatePayload } = updateData;
      
      // Only include fields that are allowed to be updated
      const allowedFields = {
        name: updatePayload.name,
        dob: updatePayload.dob,
        gender: updatePayload.gender,
        nationality: updatePayload.nationality,
        emergency_contacts: updatePayload.emergency_contacts,
        govt_id_type: updatePayload.govt_id_type,
        govt_id_number: updatePayload.govt_id_number,
      };

      // Remove undefined fields
      const finalPayload = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
      );

      console.log('Updating profile with data:', finalPayload);

      // Use the new update endpoint
      const response = await fetch(`${baseurl}/tourists/profile/update/${touristId}`, {
        method: 'PUT',
        headers: {
          
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload),
      });

      console.log('Profile update response status:', response.status);
      
      // Handle non-JSON responses
      let result;
      try {
        const text = await response.text();
        console.log('Update response text:', text);
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        Alert.alert('Error', 'Invalid response from server. Please try again.');
        return false;
      }

      console.log('Profile update response:', result);

      if (response.ok && result.success) {
        const updatedProfile = {
          ...result.data,
          emergency_contacts: result.data.emergency_contacts || [],
          dob: result.data.dob ? result.data.dob.split('T')[0] : null,
          // Map backend field names to frontend field names
          name: result.data.name || result.data.full_name,
          phone: result.data.phone || result.data.phone_number,
          profileImage: result.data.profileImage || result.data.profile_image,
          govt_id_type: result.data.govt_id_type || result.data.government_id_type,
          govt_id_number: result.data.govt_id_number || result.data.government_id_number,
          aadhaar_verified: result.data.aadhaar_verified || result.data.is_verified || false,
        };
        
        setProfile(updatedProfile);
        Alert.alert('Success', 'Profile updated successfully!');
        return true;
      } else if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
        await logout();
        return false;
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const requestPermissions = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraPerm.status !== 'granted' || galleryPerm.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera and gallery permissions are required.');
      return false;
    }
    return true;
  };

  const handleImagePicker = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      updateProfileImage(imageUri);
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      updateProfileImage(imageUri);
    }
  };

  const updateProfileImage = (imageUri) => {
    if (imageUri) {
      const updatedData = { ...editData, profileImage: imageUri };
      setEditData(updatedData);
      if (!isEditing) {
        setProfile({ ...updatedData });
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData({ ...profile });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    
    const success = await updateProfile(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({ ...profile });
    }
    setIsEditing(false);
  };

  // Use useCallback to prevent re-rendering
  const handleTextChange = useCallback((name, value) => {
    setEditData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setEditData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleDatePress = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleTextChange('dob', selectedDate.toISOString().split('T')[0]);
    }
  };

  const addEmergencyContact = useCallback(() => {
    if (newEmergencyContact.trim()) {
      const currentContacts = editData?.emergency_contacts || [];
      const updatedContacts = [...currentContacts, newEmergencyContact.trim()];
      setEditData(prevData => ({ ...prevData, emergency_contacts: updatedContacts }));
      setNewEmergencyContact('');
    }
  }, [newEmergencyContact, editData?.emergency_contacts]);

  const removeEmergencyContact = useCallback((index) => {
    const currentContacts = editData?.emergency_contacts || [];
    const updatedContacts = currentContacts.filter((_, i) => i !== index);
    setEditData(prevData => ({ ...prevData, emergency_contacts: updatedContacts }));
  }, [editData?.emergency_contacts]);

  const maskGovtId = useCallback((id) => {
    if (!id) return 'Not provided';
    const visibleDigits = 4;
    const maskedPart = '*'.repeat(Math.max(0, id.length - visibleDigits));
    const visiblePart = id.slice(-visibleDigits);
    return maskedPart + visiblePart;
  }, []);

  const handleVerifyGovtId = () => {
    Alert.alert(
      'Verify Government ID',
      'This will redirect you to the verification process.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          console.log('Navigate to govt ID verification');
        }}
      ]
    );
  };

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return 'Not provided';
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleGovtId = useCallback(() => {
    setShowGovtId(prev => !prev);
  }, []);

  // Memoize gender options
  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ], []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile || !editData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Yatra Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ 
                uri: profile.profileImage || profile.profile_image || 'https://via.placeholder.com/160x160/6366F1/white?text=User'
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleImagePicker}
              activeOpacity={0.8}
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name || profile.full_name || 'User Name'}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>

            <View style={styles.actionButtons}>
              {!isEditing ? (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Edit3 size={20} color="white" />
                  <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editingButtons}>
                  <TouchableOpacity 
                    style={[styles.saveButton, updating && styles.disabledButton]} 
                    onPress={handleSave}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Save size={20} color="white" />
                    )}
                    <Text style={styles.buttonText}>
                      {updating ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <X size={20} color="white" />
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.profileFields}>
          <ProfileField 
            icon={User} 
            label="Full Name" 
            name="name" 
            value={profile.name || profile.full_name}
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
          />
          
          <ProfileField 
            icon={Mail} 
            label="Email" 
            name="email" 
            value={profile.email} 
            type="email"
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
            disabled={true}
          />
          
          <ProfileField 
            icon={Phone} 
            label="Phone" 
            name="phone" 
            value={profile.phone || profile.phone_number} 
            type="tel"
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
            disabled={true}
          />
          
          <ProfileField 
            icon={Calendar} 
            label="Date of Birth" 
            name="dob" 
            value={profile.dob} 
            type="date"
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
          />
          
          <ProfileField 
            icon={User} 
            label="Gender" 
            name="gender" 
            value={profile.gender} 
            type="select"
            options={genderOptions}
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
          />
          
          <ProfileField 
            icon={Globe} 
            label="Nationality" 
            name="nationality" 
            value={profile.nationality}
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
            onDatePress={handleDatePress}
            formatDate={formatDate}
          />

          <GovtIdField 
            profile={profile}
            showGovtId={showGovtId}
            onToggleGovtId={toggleGovtId}
            onVerifyGovtId={handleVerifyGovtId}
            maskGovtId={maskGovtId}
            isEditing={isEditing}
            editData={editData}
            onTextChange={handleTextChange}
            onSelectChange={handleSelectChange}
          />
          
          <EmergencyContactsField 
            editData={editData}
            isEditing={isEditing}
            onRemoveContact={removeEmergencyContact}
            newEmergencyContact={newEmergencyContact}
            onChangeNewContact={setNewEmergencyContact}
            onAddContact={addEmergencyContact}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={editData?.dob ? new Date(editData.dob) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  profileFields: {
    gap: 16,
  },
  profileField: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileFieldContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  profileFieldTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  profileFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disabledLabel: {
    color: '#9CA3AF',
  },
  valueContainer: {
    flex: 1,
  },
  disabledValueContainer: {
    opacity: 0.7,
  },
  profileFieldValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  disabledValue: {
    color: '#6B7280',
  },
  disabledHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },
  profileFieldInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectOptionActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  govtIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  govtIdSubField: {
    marginBottom: 12,
  },
  govtIdSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  govtIdType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  govtIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  govtIdNumber: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeButton: {
    padding: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emergencyContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  emergencyContactText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  removeButton: {
    padding: 4,
  },
  addContactContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addContactInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addContactButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default ProfileSection;
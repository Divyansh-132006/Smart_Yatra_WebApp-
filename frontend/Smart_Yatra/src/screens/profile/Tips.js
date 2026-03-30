import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// 🔑 Common Gemini API Key (Shared for all users)
const GEMINI_API_KEY = 'AIzaSyBJBYJY0Jay2thMpTR679o5hmhqArYYvfE';

// Gemini API Integration
const generateTipsUsingGemini = async (apiKey, location, latitude, longitude) => {
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    throw new Error('API Key not configured properly');
  }

  try {
    const locationContext = `Location: ${location} (Coordinates: ${latitude?.toFixed(4)}, ${longitude?.toFixed(4)})`;
    
    const prompt = `You are a travel safety expert. Generate 3 specific, actionable, and practical safety/travel tips for someone currently traveling in ${locationContext}. 

The tips should be:
1. Location-specific (relevant to the area's geography, culture, and current conditions)
2. Safe and practical for travelers
3. Based on local knowledge

Format your response as exactly 3 numbered tips, each on a new line. Be concise (max 100 chars per tip).`;

    console.log('🔄 Calling Gemini API with location:', location);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    console.log('✅ Response Status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        console.error('API Error Data:', errorData);
      } catch (e) {
        const text = await response.text();
        console.error('Error Response:', text);
      }
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('✅ Gemini Response:', data);
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('📝 Generated Text:', text);
      
      // Parse the numbered tips
      const tips = text.split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(tip => tip.length > 0);
      
      if (tips.length > 0) {
        console.log('✅ Parsed Tips:', tips);
        return tips;
      }
      console.log('⚠️ No numbered tips found, returning full text');
      return [text.trim()];
    }

    throw new Error('No response content from Gemini API');
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw error;
  }
};

// Get reverse geocoding data
const getLocationName = async (latitude, longitude) => {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (result && result[0]) {
      const { city, region, country } = result[0];
      return `${city || region || 'Unknown'}, ${country || ''}`.trim();
    }
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }
};

const Tips = ({ userLocation = null }) => {
  const [tip, setTip] = useState('');
  const [tips, setTips] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [newTip, setNewTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userTips, setUserTips] = useState([]);
  const [locationName, setLocationName] = useState('Getting location...');
  const [hasGeneratedTips, setHasGeneratedTips] = useState(false);

  // Initialize on component mount - ONLY ONCE
  useEffect(() => {
    getLocationData();
  }, []);

  // Auto-generate tips ONLY when location name is set (not on every location update)
  useEffect(() => {
    if (locationName && !hasGeneratedTips && userLocation?.latitude) {
      handleGenerateTip();
      setHasGeneratedTips(true);
    }
  }, [locationName]);

  const getLocationData = async () => {
    try {
      if (userLocation?.latitude && userLocation?.longitude) {
        console.log('✅ Tips received location:', userLocation);
        const name = await getLocationName(userLocation.latitude, userLocation.longitude);
        console.log('✅ Tips location name:', name);
        setLocationName(name);
      } else {
        console.log('⚠️ Tips: No valid location yet');
        setLocationName('Location not available');
      }
    } catch (error) {
      console.error('❌ Error getting location data:', error);
      setLocationName('Unable to determine location');
    }
  };

  const handleGenerateTip = useCallback(async () => {
    if (!userLocation?.latitude || !userLocation?.longitude) {
      Alert.alert('Location Required', 'Please enable location services to generate tips.');
      return;
    }

    setLoading(true);
    try {
      // Validate location name is not still loading
      if (locationName === 'Getting location...') {
        Alert.alert('Please Wait', 'Still getting your location. Try again in a moment.');
        setLoading(false);
        return;
      }

      const generatedTips = await generateTipsUsingGemini(
        GEMINI_API_KEY,
        locationName,
        userLocation.latitude,
        userLocation.longitude
      );
      
      setTips(generatedTips);
      setCurrentTipIndex(0);
      setTip(generatedTips[0]);
      
      Alert.alert('✅ Tips Generated', `Generated ${generatedTips.length} AI-powered safety tips!`);
    } catch (error) {
      console.error('Full Error Details:', error);
      const errorMsg = error?.message || 'Unknown error occurred';
      
      // Fallback tips if API fails
      const fallbackTips = [
        '🔒 Stay in well-lit, populated areas. Avoid traveling alone at night.',
        '📞 Save local emergency numbers and share your location with trusted contacts.',
        '💳 Keep valuables secure. Use only ATMs in safe, monitored locations.'
      ];
      
      setTips(fallbackTips);
      setCurrentTipIndex(0);
      setTip(fallbackTips[0]);
      
      Alert.alert(
        '⚠️ Using Default Tips',
        `API Error: ${errorMsg}\n\nShowing general safety tips instead.`,
        [
          { text: 'Retry API', onPress: handleGenerateTip },
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [userLocation, locationName]);

  const getNextTip = () => {
    if (tips.length > 0) {
      const nextIndex = (currentTipIndex + 1) % tips.length;
      setCurrentTipIndex(nextIndex);
      setTip(tips[nextIndex]);
    }
  };

  const handleSubmitTip = async () => {
    if (!newTip.trim()) {
      Alert.alert('Empty Tip', 'Please enter a tip before submitting.');
      return;
    }

    setSubmitting(true);
    
    setTimeout(() => {
      const tipData = {
        id: Date.now(),
        text: newTip.trim(),
        location: locationName,
        timestamp: new Date().toLocaleDateString(),
      };
      
      setUserTips(prev => [tipData, ...prev]);
      
      Alert.alert(
        'Success! 🎉',
        'Thank you for sharing your local knowledge! Other travelers will find it helpful.',
        [{ text: 'Great!', style: 'default' }]
      );
      
      setNewTip('');
      setSubmitting(false);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>✨ Smart Travel Tips</Text>
          <Text style={styles.headerSubtitle}>AI-Powered by Gemini</Text>
          <Text style={styles.locationTag}>📍 {locationName}</Text>
        </LinearGradient>

        {/* AI Tips Section */}
        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <Text style={styles.sectionTitle}>💡 AI Tips for {locationName}</Text>
            <TouchableOpacity 
              style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
              onPress={handleGenerateTip}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? '⏳' : '🤖'}
              </Text>
            </TouchableOpacity>
          </View>

            {tips.length > 0 ? (
              <>
                <View style={styles.tipCard}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#667eea" />
                      <Text style={styles.loadingText}>Generating AI tips...</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.tipIndicator}>
                        <Text style={styles.tipNumber}>{currentTipIndex + 1}/{tips.length}</Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </>
                  )}
                </View>
                
                {tips.length > 1 && (
                  <TouchableOpacity style={styles.nextButton} onPress={getNextTip}>
                    <Text style={styles.nextButtonText}>Next Tip →</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyTipsCard}>
                <Text style={styles.emptyTipsText}>Tap the 🤖 button to generate AI-powered tips for your location</Text>
              </View>
            )}
          </View>

        {/* Share Your Tip Section */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>✍ Share Local Knowledge</Text>
          <Text style={styles.shareSubtitle}>
            Help other travelers with insider tips about {locationName}
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Share a helpful tip for travelers..."
              placeholderTextColor="#999"
              value={newTip}
              onChangeText={setNewTip}
              multiline={true}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>
              {newTip.length}/200
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitTip}
            disabled={submitting}
          >
            <LinearGradient
              colors={submitting ? ['#ccc', '#aaa'] : ['#56ab2f', '#a8e6cf']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <View style={styles.submittingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>🚀 Share Tip</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* User Tips History */}
        {userTips.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📝 Your Tips</Text>
            {userTips.map((userTip) => (
              <View key={userTip.id} style={styles.userTipCard}>
                <Text style={styles.userTipText}>{userTip.text}</Text>
                <Text style={styles.userTipDate}>{userTip.timestamp}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e8e8e8',
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 10,
  },
  locationTag: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  setupCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  setupCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  setupCardText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  setupCardButton: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  tipSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    marginBottom: 12,
  },
  tipIndicator: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  loadingText: {
    marginLeft: 10,
    color: '#667eea',
    fontSize: 14,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontWeight: '400',
  },
  emptyTipsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#f0f0f0',
  },
  emptyTipsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  nextButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  shareSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  shareSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginTop: 5,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    fontSize: 16,
    minHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  charCount: {
    position: 'absolute',
    right: 15,
    bottom: 10,
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    elevation: 1,
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
  },
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userTipCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#56ab2f',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userTipText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  userTipDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  footer: {
    height: 30,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#999',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  modalLink: {
    color: '#667eea',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  getKeyButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  getKeyButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 13,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 3,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: '#fee',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  modalButtonSecondaryText: {
    color: '#c66',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Tips;
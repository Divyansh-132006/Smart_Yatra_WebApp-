import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // If using Expo
// For non-Expo: import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Tips = ({ location = 'Delhi' }) => {
  const [tip, setTip] = useState('');
  const [newTip, setNewTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userTips, setUserTips] = useState([]);

  const tipsData = {
    Delhi: [
      'Avoid peak hours near Connaught Place (8-10 AM, 6-8 PM)',
      'Use Delhi Metro for faster commute during rush hours',
      'Carry water bottle, Delhi can get very hot in summer',
      'Best time to visit Red Fort is early morning',
    ],
    Mumbai: [
      'Stay hydrated, humidity is high in coastal areas',
      'Local trains are fastest but crowded during peak hours',
      'Try street food at Mohammed Ali Road for authentic experience',
      'Monsoon season (June-September) can cause heavy flooding',
    ],
    Shillong: [
      'Drive carefully on hilly roads, fog is common',
      'Carry warm clothes even in summer, nights can be cold',
      'Best time to visit is March to June',
      'Try local Khasi cuisine at Police Bazaar',
    ],
  };

  const locationEmojis = {
    Delhi: '🏛',
    Mumbai: '🌊',
    Shillong: '⛰',
  };

  const handleShowTip = () => {
    setLoading(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      const tips = tipsData[location];
      if (tips && tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
      } else {
        setTip('No tips available for this location yet. Be the first to share one!');
      }
      setLoading(false);
    }, 500);
  };

  const handleSubmitTip = async () => {
    if (!newTip.trim()) {
      Alert.alert('Empty Tip', 'Please enter a tip before submitting.');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const tipData = {
        id: Date.now(),
        text: newTip.trim(),
        location: location,
        timestamp: new Date().toLocaleDateString(),
      };
      
      setUserTips(prev => [tipData, ...prev]);
      console.log('New tip submitted:', tipData);
      
      Alert.alert(
        'Success! 🎉',
        'Thank you for sharing your tip! Other travelers will find it helpful.',
        [{ text: 'Great!', style: 'default' }]
      );
      
      setNewTip('');
      setSubmitting(false);
    }, 1000);
  };

  const getNewTip = () => {
    handleShowTip();
  };

  useEffect(() => {
    handleShowTip();
  }, [location]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>
          {locationEmojis[location]} Travel Tips
        </Text>
        <Text style={styles.headerSubtitle}>for {location}</Text>
      </LinearGradient>

      {/* Current Tip Section */}
      <View style={styles.tipSection}>
        <View style={styles.tipHeader}>
          <Text style={styles.sectionTitle}>💡 Tip of the Moment</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={getNewTip}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? '⏳' : '🔄'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.loadingText}>Getting a fresh tip...</Text>
            </View>
          ) : (
            <Text style={styles.tipText}>{tip}</Text>
          )}
        </View>
      </View>

      {/* Share Tip Section */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>✍ Share Your Experience</Text>
        <Text style={styles.shareSubtitle}>
          Help fellow travelers with your local knowledge
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Share a helpful tip for travelers in ${location}...`}
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
              <Text style={styles.submitButtonText}>🚀 Submit Tip</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* User Tips History */}
      {userTips.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>📝 Your Recent Tips</Text>
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
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
    height: 20,
  },
});

export default Tips;
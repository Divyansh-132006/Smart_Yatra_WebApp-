import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const UserTypeSelection = () => {

  const navigation = useNavigation();

  const handleUserTypeSelection = (userType) => {
    if (userType === 'guide') {
      navigation.navigate('SignupScreenGuider');
    } else if (userType === 'tourist') {
      navigation.navigate('SignupScreen');
    }else{
         navigation.navigate('SignupScreenOffical');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#94bae7ff" />
      
  
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Intro')}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Account Type</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>How would you like to join?</Text>
          <Text style={styles.subtitle}>Select the option that best describes you</Text>
        </View>

       
        <View style={styles.cardsContainer}>
        
         
          <TouchableOpacity 
            style={styles.userTypeCard}
            onPress={() => handleUserTypeSelection('guide')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={50} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Guide</Text>
            <Text style={styles.cardDescription}>
              Register as a tourist guider and enjoy the safe tour
            </Text>
           
          </TouchableOpacity>

         
          <TouchableOpacity 
            style={styles.userTypeCard}
            onPress={() => handleUserTypeSelection('tourist')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="airplane" size={50} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Individual Tourist</Text>
            <Text style={styles.cardDescription}>
              Join as a traveler to explore destinations and think to plan new journey
            </Text>
          
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity 
          style={styles.backToLoginContainer}
          onPress={() => navigation.goBack()}
        >
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  userTypeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  cardFeatures: {
    width: '100%',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backToLoginLink: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default UserTypeSelection;
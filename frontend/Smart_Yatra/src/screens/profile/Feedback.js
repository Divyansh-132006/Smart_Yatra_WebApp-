import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Report from '../profile/FlagSection';
// import Tips from './Tips';

const { width } = Dimensions.get('window');

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('report');
  const [location, setLocation] = useState('Delhi');
  const [slideAnimation] = useState(new Animated.Value(0));

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    // Animate the active indicator
    Animated.spring(slideAnimation, {
      toValue: tab === 'report' ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback</Text>
        <Text style={styles.headerSubtitle}>Share your experience and get tips</Text>
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          {/* Animated Background Indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [{
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.4],
                  })
                }]
              }
            ]}
          />
          
          {/* Tab Buttons */}
          <TouchableOpacity
            style={[styles.tabButton, styles.leftTab]}
            onPress={() => handleTabPress('report')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'report' && styles.activeTabText
            ]}>
              📝 Report
            </Text>
            {activeTab === 'report' && <View style={styles.tabDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, styles.rightTab]}
            onPress={() => handleTabPress('tips')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'tips' && styles.activeTabText
            ]}>
              💡 Tips
            </Text>
            {activeTab === 'tips' && <View style={styles.tabDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area with Animation */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: slideAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.3, 1],
              })
            }
          ]}
        >
          {activeTab === 'report' && <Report />}
          {activeTab === 'tips' && <Tips location={location} />}
        </Animated.View>
      </View>

      {/* Location Badge */}
      <View style={styles.locationBadge}>
        <Text style={styles.locationText}>📍 {location}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: width * 0.4,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'column',
    position: 'relative',
  },
  leftTab: {
    marginRight: 2,
  },
  rightTab: {
    marginLeft: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    marginTop: 2,
    position: 'absolute',
    bottom: -2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  content: {
    flex: 1,
  },
  locationBadge: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  locationText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
});
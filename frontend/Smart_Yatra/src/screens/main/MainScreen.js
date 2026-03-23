import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
import ProfileSection from '../profile/ProfileSection';

import Tips from '../profile/Tips';
import greaterNoidaGeoFenceZones from '../../data/greaterNoidaGeoFenceZones.json';
import Flag from '../profile/FlagSection';

// Updated safety points for Greater Noida area
const safetyPoints = [
  {
    id: 1,
    name: 'Greater Noida Police Station',
    type: 'police',
    coordinates: [28.4580, 77.4850],
    distance: '0.3 km',
    icon: '🚔',
    phone: '100'
  },
  {
    id: 2,
    name: 'Yatharth Hospital',
    type: 'hospital',
    coordinates: [28.4530, 77.4790],
    distance: '0.5 km',
    icon: '🏥',
    phone: '01203805000'
  },
  {
    id: 3,
    name: 'Emergency Services',
    type: 'emergency',
    coordinates: [28.4600, 77.4880],
    distance: '0.2 km',
    icon: '🚨',
    phone: '112'
  },
  {
    id: 4,
    name: 'Fire Station Greater Noida',
    type: 'fire',
    coordinates: [28.4620, 77.4920],
    distance: '0.4 km',
    icon: '🚒',
    phone: '101'
  }
];

const MapViewComponent = ({ userLocation, onZoneChange, isLoading }) => {
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (userLocation && !isLoading) {
      setMapKey(prev => prev + 1);
    }
  }, [userLocation]);

  const generateMapHTML = () => {
    if (isLoading || !userLocation) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                    font-family: Arial, sans-serif;
                    color: white;
                }
                .loading {
                    text-align: center;
                    animation: fadeIn 1s ease-in;
                }
                .spinner {
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="loading">
                <div class="spinner"></div>
                <h3>🗺 Loading Map...</h3>
                <p>📍 Getting your location...</p>
            </div>
        </body>
        </html>
      `;
    }

    const lat = userLocation.latitude;
    const lng = userLocation.longitude;
    const accuracy = userLocation.accuracy || 20;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Smart Yatra Safety Map - Greater Noida</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }
        #map { 
            height: 100vh; 
            width: 100vw; 
            position: relative;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
            margin: 12px 16px;
            line-height: 1.4;
        }
        .zone-popup { 
            font-size: 14px; 
            max-width: 220px;
        }
        .zone-popup strong {
            font-size: 16px;
            display: block;
            margin-bottom: 6px;
        }
        .safety-point { 
            font-size: 13px; 
            max-width: 200px;
        }
        .call-button {
            background: linear-gradient(45deg, #10B981, #059669);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 8px;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .call-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16,185,129,0.4);
        }
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-size: 16px;
            color: #374151;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="loading" class="loading-overlay">
        <div>🗺 Initializing Greater Noida Safety Map...</div>
    </div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        console.log('Starting Greater Noida map initialization...');
        
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }, 1000);
        
        try {
            const map = L.map('map', {
                center: [${lat}, ${lng}],
                zoom: 15,
                zoomControl: true,
                attributionControl: true,
                preferCanvas: true
            });

            console.log('Map initialized at:', ${lat}, ${lng});

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            console.log('Tile layer added');

            const createCustomIcon = (color, size = 20) => {
                return L.divIcon({
                    className: 'custom-marker',
                    html: \`<div style="
                        background-color: \${color}; 
                        width: \${size}px; 
                        height: \${size}px; 
                        border-radius: 50%; 
                        border: 3px solid white; 
                        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                        position: relative;
                    "></div>\`,
                    iconSize: [size, size],
                    iconAnchor: [size/2, size/2]
                });
            };

            const userIcon = L.divIcon({
                className: 'user-marker',
                html: \`<div style="
                    position: relative;
                    width: 24px;
                    height: 24px;
                ">
                    <div style="
                        background-color: #3B82F6; 
                        width: 20px; 
                        height: 20px; 
                        border-radius: 50%; 
                        border: 3px solid white; 
                        box-shadow: 0 0 20px rgba(59,130,246,0.6);
                        position: absolute;
                        top: 2px;
                        left: 2px;
                        z-index: 2;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 2px solid #3B82F6;
                        animation: pulse 2s infinite;
                        z-index: 1;
                    "></div>
                </div>\`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const style = document.createElement('style');
            style.textContent = \`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    70% { transform: scale(1.8); opacity: 0; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
            \`;
            document.head.appendChild(style);

            // Load Greater Noida zones
            const greenZones = ${JSON.stringify(greaterNoidaGeoFenceZones.greenZones)};
            const yellowZones = ${JSON.stringify(greaterNoidaGeoFenceZones.yellowZones)};
            const redZones = ${JSON.stringify(greaterNoidaGeoFenceZones.redZones)};

            // Add green zones
            greenZones.forEach(zone => {
                const polygon = L.polygon(zone.coordinates, {
                    color: '#10B981',
                    fillColor: '#10B981',
                    fillOpacity: 0.25,
                    weight: 2
                }).addTo(map);
                
                const center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], {
                    icon: createCustomIcon('#10B981')
                }).addTo(map).bindPopup(\`
                    <div class="zone-popup">
                        <strong>🟢 \${zone.name}</strong>
                        <em>Type: \${zone.type}</em><br/>
                        \${zone.description}<br/>
                        <span style="color: #10B981; font-weight: bold;">✅ SAFE ZONE</span>
                    </div>
                \`);
            });

            // Add yellow zones
            yellowZones.forEach(zone => {
                const polygon = L.polygon(zone.coordinates, {
                    color: '#F59E0B',
                    fillColor: '#F59E0B',
                    fillOpacity: 0.25,
                    weight: 2
                }).addTo(map);
                
                const center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], {
                    icon: createCustomIcon('#F59E0B')
                }).addTo(map).bindPopup(\`
                    <div class="zone-popup">
                        <strong>🟡 \${zone.name}</strong>
                        <em>Type: \${zone.type}</em><br/>
                        \${zone.description}<br/>
                        <span style="color: #F59E0B; font-weight: bold;">⚠ MODERATE RISK</span>
                    </div>
                \`);
            });

            // Add red zones
            redZones.forEach(zone => {
                const polygon = L.polygon(zone.coordinates, {
                    color: '#EF4444',
                    fillColor: '#EF4444',
                    fillOpacity: 0.25,
                    weight: 2
                }).addTo(map);
                
                const center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], {
                    icon: createCustomIcon('#EF4444')
                }).addTo(map).bindPopup(\`
                    <div class="zone-popup">
                        <strong>🔴 \${zone.name}</strong>
                        <em>Type: \${zone.type}</em><br/>
                        \${zone.description}<br/>
                        <span style="color: #EF4444; font-weight: bold;">🚨 HIGH RISK AREA</span>
                    </div>
                \`);
            });

            // Add safety points
            const safetyPoints = ${JSON.stringify(safetyPoints)};
            safetyPoints.forEach(point => {
                const iconMap = {
                    'police': '🚔',
                    'hospital': '🏥',
                    'emergency': '🚨',
                    'fire': '🚒'
                };
                
                const safetyIcon = L.divIcon({
                    className: 'safety-marker',
                    html: \`<div style="
                        background-color: white; 
                        padding: 8px; 
                        border-radius: 50%; 
                        border: 3px solid #059669; 
                        font-size: 18px; 
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">\${iconMap[point.type] || '🏢'}</div>\`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });

                L.marker(point.coordinates, {icon: safetyIcon}).addTo(map)
                    .bindPopup(\`
                        <div class="safety-point">
                            <strong>\${point.name}</strong><br/>
                            <em>Type: \${point.type}</em><br/>
                            Distance: \${point.distance}<br/>
                            Phone: \${point.phone}<br/>
                            <button class="call-button" onclick="callEmergency('\${point.phone}')">
                                📞 Call Now
                            </button>
                        </div>
                    \`);
            });

            // Add user location
            const userMarker = L.marker([${lat}, ${lng}], {icon: userIcon}).addTo(map);
            userMarker.bindPopup(\`
                <div class="zone-popup">
                    <strong>📍 Your Current Location</strong><br/>
                    Greater Noida Area<br/>
                    Latitude: ${lat.toFixed(6)}<br/>
                    Longitude: ${lng.toFixed(6)}<br/>
                    Accuracy: ±${accuracy}m
                </div>
            \`);

            // Add accuracy circle
            L.circle([${lat}, ${lng}], {
                radius: ${accuracy},
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 1
            }).addTo(map);

            console.log('All markers and zones added successfully for Greater Noida');

            // Zone detection function
            function isPointInPolygon(point, polygon) {
                const [x, y] = point;
                let inside = false;
                
                for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                    const [xi, yi] = polygon[i];
                    const [xj, yj] = polygon[j];
                    
                    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                        inside = !inside;
                    }
                }
                return inside;
            }

            // Check current zone
            function checkUserZone() {
                const userPoint = [${lat}, ${lng}];
                let currentZone = 'unknown';
                let zoneInfo = null;

                // Check red zones first (highest priority)
                for (const zone of redZones) {
                    if (isPointInPolygon(userPoint, zone.coordinates)) {
                        currentZone = 'red';
                        zoneInfo = zone;
                        break;
                    }
                }

                // Check yellow zones if not in red
                if (currentZone === 'unknown') {
                    for (const zone of yellowZones) {
                        if (isPointInPolygon(userPoint, zone.coordinates)) {
                            currentZone = 'yellow';
                            zoneInfo = zone;
                            break;
                        }
                    }
                }

                // Check green zones if not in red or yellow
                if (currentZone === 'unknown') {
                    for (const zone of greenZones) {
                        if (isPointInPolygon(userPoint, zone.coordinates)) {
                            currentZone = 'green';
                            zoneInfo = zone;
                            break;
                        }
                    }
                }

                console.log('Current zone in Greater Noida:', currentZone, zoneInfo);

                // Send to React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'zoneChange',
                        zone: currentZone,
                        zoneInfo: zoneInfo
                    }));
                }
            }

            // Emergency call function
            window.callEmergency = function(phone) {
                console.log('Emergency call requested:', phone);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'call',
                        phone: phone
                    }));
                }
            };

            // Check zone after map loads
            map.whenReady(() => {
                console.log('Greater Noida map is ready');
                setTimeout(() => {
                    checkUserZone();
                    // Send ready signal
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'mapReady'
                        }));
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('Map initialization error:', error);
            document.body.innerHTML = \`
                <div style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    background-color: #f3f4f6;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    color: #374151;
                ">
                    <div>
                        <h3>⚠ Map Loading Error</h3>
                        <p>Unable to load the Greater Noida safety map. Please check your internet connection.</p>
                        <button onclick="location.reload()" style="
                            background-color: #3B82F6;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Retry</button>
                    </div>
                </div>
            \`;
        }
    </script>
</body>
</html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📱 WebView message:', data);
      
      switch (data.type) {
        case 'mapReady':
          console.log('✅ Map is ready');
          break;
        case 'zoneChange':
          onZoneChange(data.zone, data.zoneInfo);
          break;
        case 'call':
          Linking.openURL(`tel:${data.phone}`).catch(err => {
            console.error('Call error:', err);
            Alert.alert('Error', 'Unable to make phone call');
          });
          break;
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  };

  return (
    <View style={styles.map}>
      <WebView
        key={mapKey}
        style={{ flex: 1 }}
        source={{ html: generateMapHTML() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        cacheEnabled={false}
        onError={(error) => console.error('WebView error:', error)}
        onHttpError={(error) => console.error('HTTP error:', error)}
        onLoadStart={() => console.log('🔄 WebView load started')}
        onLoadEnd={() => console.log('✅ WebView loaded')}
      />
    </View>
  );
};

const HomeScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [currentZone, setCurrentZone] = useState('unknown');
  const [zoneInfo, setZoneInfo] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Permission status:', status);
      
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setLocationLoading(false);
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show safety zones around you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      console.log('📍 Location obtained:', location.coords);

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      setLocationLoading(false);

      // Watch for location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          console.log('📍 Location updated:', newLocation.coords);
          setUserLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
          });
        }
      );

    } catch (error) {
      console.error('📍 Location error:', error);
      setLocationError('Failed to get location');
      setLocationLoading(false);
      
      // Use fallback location for Greater Noida (near Galgotias University)
      setUserLocation({
        latitude: 28.4580,
        longitude: 77.4900,
        accuracy: 50,
      });
    }
  };

  const handleZoneChange = (zone, info) => {
    console.log('🗺 Zone changed:', zone, info?.name);
    setCurrentZone(zone);
    setZoneInfo(info);
    
    // Show zone alerts
    if (zone === 'red' && info) {
      Alert.alert('🚨 High Risk Area', `You are entering: ${info.name}\n\n${info.description}\n\nPlease exercise extreme caution!`);
    } else if (zone === 'yellow' && info) {
      console.log(`⚠ Moderate risk area: ${info.name}`);
    } else if (zone === 'green' && info) {
      console.log(`✅ Safe zone: ${info.name}`);
    }
  };

  const handleSOSPress = () => {
    Alert.alert(
      '🚨 Emergency Call',
      'Choose emergency service:',
      [
        { text: 'Police (100)', onPress: () => Linking.openURL('tel:100') },
        { text: 'Medical (108)', onPress: () => Linking.openURL('tel:108') },
        { text: 'Fire (101)', onPress: () => Linking.openURL('tel:101') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'green': return '#10B981';
      case 'yellow': return '#F59E0B';
      case 'red': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getZoneText = (zone) => {
    switch (zone) {
      case 'green': return '✅ Safe Zone';
      case 'yellow': return '⚠ Moderate Risk';
      case 'red': return '🚨 High Risk';
      default: return '📍 Getting Location...';
    }
  };

  if (locationError && !userLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>📍 Location Error</Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Zone Status Banner */}
      <View style={[styles.zoneBanner, { backgroundColor: getZoneColor(currentZone) }]}>
        <Text style={styles.zoneText}>
          {getZoneText(currentZone)}
          {zoneInfo && ` - ${zoneInfo.name}`}
        </Text>
        {userLocation && (
          <Text style={styles.locationText}>
            📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapViewComponent
          userLocation={userLocation}
          onZoneChange={handleZoneChange}
          isLoading={locationLoading} />
      </View>

      <ScrollView style={styles.safetyPointsContainer}>
        <Text style={styles.sectionTitle}>🛡 Nearby Safety Points</Text>
        {safetyPoints.map((point) => (
          <TouchableOpacity
            key={point.id}
            style={styles.safetyPointCard}
            onPress={() => Linking.openURL(`tel:${point.phone}`)}
            activeOpacity={0.7}
          >
            <View style={styles.safetyPointIcon}>
              <Text style={styles.iconText}>{point.icon}</Text>
            </View>
            <View style={styles.safetyPointInfo}>
              <Text style={styles.safetyPointName}>{point.name}</Text>
              <Text style={styles.safetyPointDistance}>{point.distance}</Text>
              <Text style={styles.safetyPointPhone}>📞 {point.phone}</Text>
            </View>
            <Text style={styles.navigationIcon}>📞</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress} activeOpacity={0.8}>
        <Text style={styles.sosButtonText}>SOS</Text>
        <Text style={styles.sosButtonSubtext}>Emergency</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          
          if (route.name === 'Home') {
            icon = '🏠';
          }
          else if (route.name === 'Experience') {
            icon = '🔐';
          }
          else if (route.name === 'Tips') {
            icon = '✍';
          }
          else if (route.name === 'Profile') {
           icon = '👤';
         }

          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: '#000000ff',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 7,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileSection} />
      <Tab.Screen name="Tips" component={Tips} />
      <Tab.Screen name="Flag" component={Flag} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafbce',
  },
  zoneBanner: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  mapContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  safetyPointsContainer: {
    maxHeight: 200,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  safetyPointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
    elevation: 2,
  },
  safetyPointIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  safetyPointInfo: {
    flex: 1,
  },
  safetyPointName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  safetyPointDistance: {
    fontSize: 12,
    color: '#6B7280',
  },
  safetyPointPhone: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  navigationIcon: {
    fontSize: 16,
    color: '#059669',
  },
  sosButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 70,
    height: 70,
    backgroundColor: '#DC2626',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sosButtonSubtext: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default MainScreen;
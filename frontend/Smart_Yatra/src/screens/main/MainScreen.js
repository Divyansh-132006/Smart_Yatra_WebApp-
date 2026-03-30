import React, { useState, useEffect, useMemo } from 'react';
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
import Flag from '../profile/FlagSection';
import { fetchNearbyPlaces, generateDynamicPlacesAroundLocation } from '../../utils/placesService';

// Simple Haversine distance in kilometers
const toRad = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MIN_MAP_RELOAD_DISTANCE_KM = 0.3;
const MIN_PLACES_RELOAD_DISTANCE_KM = 1.0;

const MapViewComponent = ({ userLocation, onZoneChange, isLoading, safetyPoints, touristPlaces }) => {
  const [lastMapLocation, setLastMapLocation] = useState(null);
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const RELOAD_COOLDOWN_MS = 8000;

  useEffect(() => {
    if (userLocation && !lastMapLocation && !isLoading) {
      setLastMapLocation(userLocation);
      setLastReloadTime(Date.now());
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !lastMapLocation || isLoading) return;

    const timeSinceLastReload = Date.now() - lastReloadTime;
    if (timeSinceLastReload < RELOAD_COOLDOWN_MS) return;

    const movedKm = getDistanceKm(
      lastMapLocation.latitude,
      lastMapLocation.longitude,
      userLocation.latitude,
      userLocation.longitude,
    );

    if (movedKm >= MIN_MAP_RELOAD_DISTANCE_KM) {
      setLastMapLocation(userLocation);
      setLastReloadTime(Date.now());
    }
  }, [userLocation, isLoading, lastMapLocation, lastReloadTime]);

  const mapHTML = useMemo(() => {
    const generateMapHTML = () => {
      if (isLoading || !lastMapLocation) {
        return `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  body { 
                      margin: 0; padding: 0; 
                      display: flex; justify-content: center; align-items: center; 
                      height: 100vh; 
                      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                      font-family: Arial, sans-serif; color: white;
                  }
                  .loading { text-align: center; animation: fadeIn 1s ease-in; }
                  .spinner {
                      border: 4px solid rgba(255,255,255,0.3);
                      border-top: 4px solid white;
                      border-radius: 50%; width: 50px; height: 50px;
                      animation: spin 1s linear infinite; margin: 0 auto 20px;
                  }
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
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

      const lat = lastMapLocation.latitude;
      const lng = lastMapLocation.longitude;
      const accuracy = lastMapLocation.accuracy || 20;

      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Smart Yatra Safety Map</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow: hidden; }
        #map { height: 100vh; width: 100vw; position: relative; }
        .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .leaflet-popup-content { margin: 12px 16px; line-height: 1.4; }
        .zone-popup { font-size: 14px; max-width: 220px; }
        .zone-popup strong { font-size: 16px; display: block; margin-bottom: 6px; }
        .safety-point { font-size: 13px; max-width: 200px; }
        .call-button {
            background: linear-gradient(45deg, #10B981, #059669);
            color: white; border: none; padding: 8px 12px; border-radius: 6px;
            cursor: pointer; margin-top: 8px; font-size: 12px; font-weight: 600;
        }
        .loading-overlay {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.9); display: flex;
            justify-content: center; align-items: center;
            z-index: 1000; font-size: 16px; color: #374151;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            70% { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(1.8); opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="loading" class="loading-overlay">
      <div>🗺 Initializing safety map for your area...</div>
    </div>

    <script>
      // ── FIX: guard so initializeMap only ever runs once ──
      var _mapInitialized = false;

      function generateDynamicZones(centerLat, centerLng, radiusKm) {
        var offsetDegrees = radiusKm / 111;
        return {
          greenZones: [
            {
              id: 'dynamic_green_1', name: 'Safe Area - Center',
              description: 'Safe area around current location', type: 'Safe Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.3, centerLng - offsetDegrees * 0.3],
                [centerLat + offsetDegrees * 0.3, centerLng + offsetDegrees * 0.3],
                [centerLat - offsetDegrees * 0.3, centerLng + offsetDegrees * 0.3],
                [centerLat - offsetDegrees * 0.3, centerLng - offsetDegrees * 0.3]
              ]
            },
            {
              id: 'dynamic_green_2', name: 'Safe Area - North',
              description: 'Developed safe area', type: 'Safe Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.7, centerLng - offsetDegrees * 0.2],
                [centerLat + offsetDegrees * 0.7, centerLng + offsetDegrees * 0.2],
                [centerLat + offsetDegrees * 0.1, centerLng + offsetDegrees * 0.2],
                [centerLat + offsetDegrees * 0.1, centerLng - offsetDegrees * 0.2]
              ]
            },
            {
              id: 'dynamic_green_3', name: 'Safe Area - South',
              description: 'Residential safe area', type: 'Safe Zone',
              coordinates: [
                [centerLat - offsetDegrees * 0.1, centerLng - offsetDegrees * 0.2],
                [centerLat - offsetDegrees * 0.1, centerLng + offsetDegrees * 0.2],
                [centerLat - offsetDegrees * 0.7, centerLng + offsetDegrees * 0.2],
                [centerLat - offsetDegrees * 0.7, centerLng - offsetDegrees * 0.2]
              ]
            }
          ],
          yellowZones: [
            {
              id: 'dynamic_yellow_1', name: 'Caution Area - East',
              description: 'Moderate caution - exercise awareness', type: 'Caution Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.2, centerLng + offsetDegrees * 0.3],
                [centerLat + offsetDegrees * 0.2, centerLng + offsetDegrees * 0.7],
                [centerLat - offsetDegrees * 0.2, centerLng + offsetDegrees * 0.7],
                [centerLat - offsetDegrees * 0.2, centerLng + offsetDegrees * 0.3]
              ]
            },
            {
              id: 'dynamic_yellow_2', name: 'Caution Area - West',
              description: 'Busy area - stay alert', type: 'Caution Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.2, centerLng - offsetDegrees * 0.7],
                [centerLat + offsetDegrees * 0.2, centerLng - offsetDegrees * 0.3],
                [centerLat - offsetDegrees * 0.2, centerLng - offsetDegrees * 0.3],
                [centerLat - offsetDegrees * 0.2, centerLng - offsetDegrees * 0.7]
              ]
            },
            {
              id: 'dynamic_yellow_3', name: 'Caution Area - Northeast',
              description: 'Mixed development area', type: 'Caution Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.5, centerLng + offsetDegrees * 0.15],
                [centerLat + offsetDegrees * 0.5, centerLng + offsetDegrees * 0.45],
                [centerLat + offsetDegrees * 0.15, centerLng + offsetDegrees * 0.45],
                [centerLat + offsetDegrees * 0.15, centerLng + offsetDegrees * 0.15]
              ]
            }
          ],
          redZones: [
            {
              id: 'dynamic_red_1', name: 'Risk Area - Industrial',
              description: 'High alert area - avoid if possible', type: 'High Risk Zone',
              coordinates: [
                [centerLat + offsetDegrees * 0.9, centerLng + offsetDegrees * 0.15],
                [centerLat + offsetDegrees * 0.9, centerLng + offsetDegrees * 0.65],
                [centerLat + offsetDegrees * 0.3, centerLng + offsetDegrees * 0.65],
                [centerLat + offsetDegrees * 0.3, centerLng + offsetDegrees * 0.15]
              ]
            },
            {
              id: 'dynamic_red_2', name: 'Risk Area - Undeveloped',
              description: 'Underdeveloped area - use caution', type: 'High Risk Zone',
              coordinates: [
                [centerLat - offsetDegrees * 0.25, centerLng - offsetDegrees * 0.15],
                [centerLat - offsetDegrees * 0.25, centerLng - offsetDegrees * 0.65],
                [centerLat - offsetDegrees * 0.75, centerLng - offsetDegrees * 0.65],
                [centerLat - offsetDegrees * 0.75, centerLng - offsetDegrees * 0.15]
              ]
            }
          ]
        };
      }

      function initializeMap() {
        // ── FIX 1: prevent double-initialization ──
        if (_mapInitialized) { console.log('Map already initialized, skipping.'); return; }
        _mapInitialized = true;

        try {
            var loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';

            var map = L.map('map', {
                center: [${lat}, ${lng}],
                zoom: 15,
                zoomControl: true,
                attributionControl: true,
                preferCanvas: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            var createCustomIcon = function(color, size) {
                size = size || 20;
                return L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background-color:' + color + ';width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);"></div>',
                    iconSize: [size, size],
                    iconAnchor: [size/2, size/2]
                });
            };

            var userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div style="position:relative;width:24px;height:24px;">' +
                    '<div style="background-color:#3B82F6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(59,130,246,0.6);position:absolute;top:2px;left:2px;z-index:2;"></div>' +
                    '<div style="position:absolute;top:0;left:0;width:24px;height:24px;border-radius:50%;border:2px solid #3B82F6;animation:pulse 2s infinite;z-index:1;"></div>' +
                    '</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            var userZones = generateDynamicZones(${lat}, ${lng}, 3);
            var greenZones = userZones.greenZones;
            var yellowZones = userZones.yellowZones;
            var redZones = userZones.redZones;

            // Add green zones
            greenZones.forEach(function(zone) {
                var polygon = L.polygon(zone.coordinates, {
                    color: '#10B981', fillColor: '#10B981', fillOpacity: 0.25, weight: 2
                }).addTo(map);
                var center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], { icon: createCustomIcon('#10B981') })
                    .addTo(map)
                    .bindPopup('<div class="zone-popup"><strong>🟢 ' + zone.name + '</strong><em>Type: ' + zone.type + '</em><br/>' + zone.description + '<br/><span style="color:#10B981;font-weight:bold;">✅ SAFE ZONE</span></div>');
            });

            // Add yellow zones
            yellowZones.forEach(function(zone) {
                var polygon = L.polygon(zone.coordinates, {
                    color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.25, weight: 2
                }).addTo(map);
                var center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], { icon: createCustomIcon('#F59E0B') })
                    .addTo(map)
                    .bindPopup('<div class="zone-popup"><strong>🟡 ' + zone.name + '</strong><em>Type: ' + zone.type + '</em><br/>' + zone.description + '<br/><span style="color:#F59E0B;font-weight:bold;">⚠ MODERATE RISK</span></div>');
            });

            // Add red zones
            redZones.forEach(function(zone) {
                var polygon = L.polygon(zone.coordinates, {
                    color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.25, weight: 2
                }).addTo(map);
                var center = polygon.getBounds().getCenter();
                L.marker([center.lat, center.lng], { icon: createCustomIcon('#EF4444') })
                    .addTo(map)
                    .bindPopup('<div class="zone-popup"><strong>🔴 ' + zone.name + '</strong><em>Type: ' + zone.type + '</em><br/>' + zone.description + '<br/><span style="color:#EF4444;font-weight:bold;">🚨 HIGH RISK AREA</span></div>');
            });

            // Add safety points
            var safetyPoints = ${JSON.stringify(safetyPoints || [])};
            var iconMap = { 'police': '🚔', 'hospital': '🏥', 'emergency': '🚨', 'fire': '🚒' };
            safetyPoints.forEach(function(point) {
                var safetyIcon = L.divIcon({
                    className: 'safety-marker',
                    html: '<div style="background-color:white;padding:8px;border-radius:50%;border:3px solid #059669;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">' + (iconMap[point.type] || '🏢') + '</div>',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                L.marker(point.coordinates, { icon: safetyIcon }).addTo(map)
                    .bindPopup('<div class="safety-point"><strong>' + point.name + '</strong><br/><em>Type: ' + point.type + '</em><br/>' + (point.distanceLabel || '') + '<br/>Phone: ' + point.phone + '<br/><button class="call-button" onclick="callEmergency(\'' + point.phone + '\')">📞 Call Now</button></div>');
            });

            // Add tourist places
            var touristPlaces = ${JSON.stringify(touristPlaces || [])};
            touristPlaces.forEach(function(place) {
                var placeIcon = L.divIcon({
                    className: 'tourist-marker',
                    html: '<div style="background-color:white;padding:6px 8px;border-radius:999px;border:2px solid #3B82F6;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;">⭐</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                L.marker(place.coordinates, { icon: placeIcon }).addTo(map)
                    .bindPopup('<div class="safety-point"><strong>⭐ ' + (place.name || '') + '</strong><br/><em>' + (place.category || 'Tourist place') + '</em><br/>' + (place.distanceLabel || '') + '</div>');
            });

            // Add user location marker
            L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map)
                .bindPopup('<div class="zone-popup"><strong>📍 Your Current Location</strong><br/>Latitude: ${lat.toFixed(6)}<br/>Longitude: ${lng.toFixed(6)}<br/>Accuracy: ±${accuracy}m</div>');

            L.circle([${lat}, ${lng}], {
                radius: ${accuracy},
                fillColor: '#3B82F6', fillOpacity: 0.1, color: '#3B82F6', weight: 1
            }).addTo(map);

            function isPointInPolygon(point, polygon) {
                var x = point[0], y = point[1], inside = false;
                for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                    var xi = polygon[i][0], yi = polygon[i][1];
                    var xj = polygon[j][0], yj = polygon[j][1];
                    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
                }
                return inside;
            }

            function checkUserZone() {
                var userPoint = [${lat}, ${lng}];
                var currentZone = 'unknown', zoneInfo = null;
                for (var i = 0; i < redZones.length; i++) {
                    if (isPointInPolygon(userPoint, redZones[i].coordinates)) { currentZone = 'red'; zoneInfo = redZones[i]; break; }
                }
                if (currentZone === 'unknown') {
                    for (var i = 0; i < yellowZones.length; i++) {
                        if (isPointInPolygon(userPoint, yellowZones[i].coordinates)) { currentZone = 'yellow'; zoneInfo = yellowZones[i]; break; }
                    }
                }
                if (currentZone === 'unknown') {
                    for (var i = 0; i < greenZones.length; i++) {
                        if (isPointInPolygon(userPoint, greenZones[i].coordinates)) { currentZone = 'green'; zoneInfo = greenZones[i]; break; }
                    }
                }
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'zoneChange', zone: currentZone, zoneInfo: zoneInfo }));
                }
            }

            window.callEmergency = function(phone) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'call', phone: phone }));
                }
            };

            map.whenReady(function() {
                setTimeout(function() {
                    checkUserZone();
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('Map initialization error:', error);
            // ── FIX 2: reset guard so user can retry ──
            _mapInitialized = false;
            document.body.innerHTML =
                '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f3f4f6;font-family:Arial,sans-serif;text-align:center;color:#374151;">' +
                '<div><h3>⚠ Map Loading Error</h3><p>Unable to initialize the map. Please tap Retry.</p>' +
                '<button onclick="location.reload()" style="background:#3B82F6;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:15px;">🔄 Retry</button></div></div>';
        }
      }

      // ── FIX 3: Load Leaflet JS inline via createElement (more reliable than CDN <script> tag in WebView) ──
      // ── FIX 4: Increased timeout to 10s, and only call initializeMap if NOT already initialized ──
      var leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      var leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.onload = function() {
          console.log('✅ Leaflet loaded via onload');
          initializeMap();
      };
      leafletScript.onerror = function() {
          // ── FIX 5: Try jsDelivr as fallback CDN if unpkg fails ──
          console.warn('⚠ unpkg failed, trying jsDelivr fallback...');
          var fallbackScript = document.createElement('script');
          fallbackScript.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
          fallbackScript.onload = function() {
              console.log('✅ Leaflet loaded via jsDelivr fallback');
              var fallbackCSS = document.createElement('link');
              fallbackCSS.rel = 'stylesheet';
              fallbackCSS.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
              document.head.appendChild(fallbackCSS);
              initializeMap();
          };
          fallbackScript.onerror = function() {
              document.body.innerHTML =
                  '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#fee2e2;font-family:Arial,sans-serif;text-align:center;color:#991b1b;">' +
                  '<div><h3>⚠ Map Library Issue</h3><p>Unable to load map library. Please check your internet connection and tap Retry.</p>' +
                  '<button onclick="location.reload()" style="background:#DC2626;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:15px;margin-top:10px;">🔄 Retry</button></div></div>';
          };
          document.head.appendChild(fallbackScript);
      };
      document.head.appendChild(leafletScript);

      // ── FIX 6: Safety-net timeout raised to 12s, only triggers if map not yet initialized ──
      setTimeout(function() {
          if (!_mapInitialized) {
              if (window.L) {
                  console.warn('⏰ Safety-net timeout: Leaflet present, initializing now');
                  initializeMap();
              } else {
                  console.error('❌ Leaflet still not loaded after 12s');
                  document.body.innerHTML =
                      '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#fee2e2;font-family:Arial,sans-serif;text-align:center;color:#991b1b;">' +
                      '<div><h3>⚠ Map Library Issue</h3><p>The map library failed to load. Please check your internet and tap Retry.</p>' +
                      '<button onclick="location.reload()" style="background:#DC2626;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:15px;margin-top:10px;">🔄 Retry</button></div></div>';
              }
          }
      }, 12000);
    <\/script>
</body>
</html>
      `;
    };
    return generateMapHTML();
  }, [lastMapLocation, isLoading, safetyPoints, touristPlaces]);

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
        style={{ flex: 1 }}
        source={{ html: mapHTML }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        cacheEnabled={false}
        originWhitelist={['*']}
        onError={(error) => console.error('WebView error:', error)}
        onHttpError={(error) => console.error('HTTP error:', error)}
        onLoadStart={() => console.log('🔄 WebView load started')}
        onLoadEnd={() => console.log('✅ WebView loaded')}
      />
    </View>
  );
};

const HomeScreen = ({ initialLocation = null, locationLoading = true }) => {
  const [userLocation, setUserLocation] = useState(initialLocation);
  const [currentZone, setCurrentZone] = useState('unknown');
  const [zoneInfo, setZoneInfo] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbySafetyPoints, setNearbySafetyPoints] = useState([]);
  const [nearbyTouristPlaces, setNearbyTouristPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [lastPlacesLocation, setLastPlacesLocation] = useState(null);
  const [lastSuccessfulPlaces, setLastSuccessfulPlaces] = useState(null);

  // ✅ FIXED: Backend API now provides dynamic data based on user location
  // No hardcoded Greater Noida data - everything is based on current location

  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
      setLocationError(null);
    } else if (!locationLoading) {
      setLocationError('Location not available');
    }
  }, [initialLocation, locationLoading]);

  const handleZoneChange = (zone, info) => {
    setCurrentZone(zone);
    setZoneInfo(info);
    if (zone === 'red' && info) {
      Alert.alert('🚨 High Risk Area', `You are entering: ${info.name}\n\n${info.description}\n\nPlease exercise extreme caution!`);
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

  useEffect(() => {
    const loadPlaces = async () => {
      if (!userLocation) return;
      if (lastPlacesLocation) {
        const movedKm = getDistanceKm(lastPlacesLocation.latitude, lastPlacesLocation.longitude, userLocation.latitude, userLocation.longitude);
        if (movedKm < MIN_PLACES_RELOAD_DISTANCE_KM) return;
      }
      try {
        setPlacesLoading(true);
        console.log(`📍 Loading places for location: ${userLocation.latitude}, ${userLocation.longitude}`);
        
        // Try to fetch from backend API
        const result = await fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, 5);
        
        // If we have data from backend, use it
        let safetyPointsData = result?.safetyPoints;
        let touristPlacesData = result?.touristPlaces;
        
        // If backend has no data, generate dynamic fallback based on current user location
        if (!safetyPointsData || safetyPointsData.length === 0) {
          console.log('📍 No safety points from backend, generating dynamic fallback...');
          const dynamicData = generateDynamicPlacesAroundLocation(userLocation.latitude, userLocation.longitude, 5);
          safetyPointsData = dynamicData.safetyPoints;
        }
        
        if (!touristPlacesData || touristPlacesData.length === 0) {
          console.log('📍 No tourist places from backend, generating dynamic fallback...');
          const dynamicData = generateDynamicPlacesAroundLocation(userLocation.latitude, userLocation.longitude, 5);
          touristPlacesData = dynamicData.touristPlaces;
        }

        // Map and sort by distance from user
        const mappedSafety = safetyPointsData.map((point) => {
          const [lat, lng] = point.coordinates;
          const distanceKm = getDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
          return { ...point, distanceKm, distanceLabel: `${distanceKm.toFixed(1)} km away` };
        }).sort((a, b) => a.distanceKm - b.distanceKm);

        const mappedTourist = touristPlacesData.map((place) => {
          const [lat, lng] = place.coordinates;
          const distanceKm = getDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
          return { ...place, distanceKm, distanceLabel: `${distanceKm.toFixed(1)} km away` };
        }).sort((a, b) => a.distanceKm - b.distanceKm);

        console.log(`✅ Loaded ${mappedSafety.length} safety points and ${mappedTourist.length} tourist places`);
        setNearbySafetyPoints(mappedSafety);
        setNearbyTouristPlaces(mappedTourist);
        setLastSuccessfulPlaces({ safetyPoints: mappedSafety, touristPlaces: mappedTourist });
        setLastPlacesLocation(userLocation);
      } catch (mainError) {
        console.error('❌ Error loading places:', mainError?.message);
        
        // If all else fails, generate dynamic fallback data
        if (!lastSuccessfulPlaces) {
          console.log('⚠️ Using dynamic fallback data...');
          const { safetyPoints: fallbackSafety, touristPlaces: fallbackTourist } = generateDynamicPlacesAroundLocation(userLocation.latitude, userLocation.longitude, 5);
          
          const mappedSafety = fallbackSafety.map((point) => {
            const [lat, lng] = point.coordinates;
            const distanceKm = getDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
            return { ...point, distanceKm, distanceLabel: `${distanceKm.toFixed(1)} km away` };
          }).sort((a, b) => a.distanceKm - b.distanceKm);
          
          const mappedTourist = fallbackTourist.map((place) => {
            const [lat, lng] = place.coordinates;
            const distanceKm = getDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
            return { ...place, distanceKm, distanceLabel: `${distanceKm.toFixed(1)} km away` };
          }).sort((a, b) => a.distanceKm - b.distanceKm);
          
          setNearbySafetyPoints(mappedSafety);
          setNearbyTouristPlaces(mappedTourist);
          setLastSuccessfulPlaces({ safetyPoints: mappedSafety, touristPlaces: mappedTourist });
        }
      } finally {
        setPlacesLoading(false);
      }
    };
    loadPlaces();
  }, [userLocation?.latitude, userLocation?.longitude]);

  if (locationError && !userLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>📍 Location Error</Text>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          isLoading={locationLoading}
          safetyPoints={nearbySafetyPoints}
          touristPlaces={nearbyTouristPlaces}
        />
      </View>

      <ScrollView style={styles.safetyPointsContainer}>
        {nearbyTouristPlaces.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📍 Famous places near you</Text>
            {nearbyTouristPlaces.map((place) => (
              <View key={place.id} style={styles.safetyPointCard}>
                <View style={styles.safetyPointIcon}>
                  <Text style={styles.iconText}>{place.icon}</Text>
                </View>
                <View style={styles.safetyPointInfo}>
                  <Text style={styles.safetyPointName}>{place.name}</Text>
                  <Text style={styles.safetyPointDistance}>{place.distanceLabel}</Text>
                  {place.category && <Text style={styles.safetyPointPhone}>{place.category}</Text>}
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>🛡 Nearby Safety Points ({nearbySafetyPoints.length})</Text>
        {nearbySafetyPoints.length === 0 && (
          <Text style={styles.emptyText}>No safety points found nearby yet. SOS button still works with national emergency numbers.</Text>
        )}
        {nearbySafetyPoints.map((point) => (
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
              <Text style={styles.safetyPointDistance}>{point.distanceLabel}</Text>
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
  const [userLocationState, setUserLocationState] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLocationLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setUserLocationState({ latitude: 28.4580, longitude: 77.4900, accuracy: 50 });
          setLocationLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000,
        });
        setUserLocationState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });
        setLocationLoading(false);

        const subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 50 },
          (newLocation) => {
            setUserLocationState({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
            });
          }
        );
        return () => { if (subscription) subscription.remove(); };
      } catch (error) {
        console.error('❌ MainScreen Location error:', error);
        setLocationLoading(false);
        setUserLocationState({ latitude: 28.4580, longitude: 77.4900, accuracy: 50 });
      }
    };
    initializeLocation();
  }, []);

  const HomeScreenWrapper = () => (
    <HomeScreen initialLocation={userLocationState} locationLoading={locationLoading} />
  );

  const TipsScreenWrapper = () => (
    <Tips userLocation={userLocationState} />
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Experience') icon = '🔐';
          else if (route.name === 'Tips') icon = '✍';
          else if (route.name === 'Profile') icon = '👤';
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
      <Tab.Screen name="Home" component={HomeScreenWrapper} />
      <Tab.Screen name="Profile" component={ProfileSection} />
      <Tab.Screen name="Tips" component={TipsScreenWrapper} />
      <Tab.Screen name="Flag" component={Flag} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafbce' },
  zoneBanner: { padding: 12, alignItems: 'center', justifyContent: 'center' },
  zoneText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  locationText: { color: 'white', fontSize: 12, textAlign: 'center', marginTop: 4, opacity: 0.9 },
  mapContainer: {
    flex: 1, margin: 8, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#f0f0f0',
  },
  map: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 10 },
  errorText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  safetyPointsContainer: { maxHeight: 200, paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  safetyPointCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, marginBottom: 6, borderRadius: 8, elevation: 2 },
  safetyPointIcon: { width: 36, height: 36, backgroundColor: '#F3F4F6', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 18 },
  safetyPointInfo: { flex: 1 },
  safetyPointName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  safetyPointDistance: { fontSize: 12, color: '#6B7280' },
  safetyPointPhone: { fontSize: 12, color: '#059669', fontWeight: '500' },
  navigationIcon: { fontSize: 16, color: '#059669' },
  emptyText: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  sosButton: { position: 'absolute', bottom: 20, right: 20, width: 70, height: 70, backgroundColor: '#DC2626', borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  sosButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  sosButtonSubtext: { color: 'white', fontSize: 10, fontWeight: '500' },
});

export default MainScreen;
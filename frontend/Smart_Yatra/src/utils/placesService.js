// Utility to fetch nearby safety points and tourist places
// Now uses backend API instead of Overpass (which is unreliable)
import { API_BASE } from '../config/api';

const API_ENDPOINTS = {
  SAFETY_POINTS: `${API_BASE}/tourists/safety-points`,
  TOURIST_PLACES: `${API_BASE}/tourists/tourist-places`,
};

// Fetch nearby places from backend API
export const fetchNearbyPlaces = async (latitude, longitude, radiusKm = 5) => {
  try {
    console.log(`🔍 Fetching nearby places from backend:`);
    console.log(`   URL: ${API_ENDPOINTS.SAFETY_POINTS}`);
    console.log(`   Params: lat=${latitude}, lng=${longitude}, radius=${radiusKm}km`);

    // Create AbortController for proper timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let safetyPoints = [];
    let touristPlaces = [];

    try {
      // Fetch safety points and tourist places in parallel
      const [safetyResponse, placesResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.SAFETY_POINTS}?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`, { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch(`${API_ENDPOINTS.TOURIST_PLACES}?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`, { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }),
      ]);

      clearTimeout(timeoutId);

      // Process safety points response
      if (safetyResponse.ok) {
        const safetyData = await safetyResponse.json();
        if (safetyData.data?.safetyPoints) {
          safetyPoints = safetyData.data.safetyPoints.map(point => ({
            id: point._id || point.id,
            name: point.name,
            type: point.type,
            coordinates: [point.latitude, point.longitude],
            phone: point.phone,
            address: point.address,
            icon: point.icon || '🚔',
            description: point.description,
          }));
          console.log(`✅ Fetched ${safetyPoints.length} safety points from backend`);
        }
      } else {
        console.warn('⚠️ Failed to fetch safety points:', safetyResponse.status);
      }

      // Process tourist places response
      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        if (placesData.data?.touristPlaces) {
          touristPlaces = placesData.data.touristPlaces.map(place => ({
            id: place._id || place.id,
            name: place.name,
            category: place.category,
            coordinates: [place.latitude, place.longitude],
            icon: place.icon || '⭐',
            rating: place.rating,
            address: place.address,
            description: place.description,
          }));
          console.log(`✅ Fetched ${touristPlaces.length} tourist places from backend`);
        }
      } else {
        console.warn('⚠️ Failed to fetch tourist places:', placesResponse.status);
      }

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

    return {
      safetyPoints: safetyPoints.length > 0 ? safetyPoints : null,
      touristPlaces: touristPlaces.length > 0 ? touristPlaces : null,
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout fetching places from backend (10 seconds exceeded)');
      console.error(`   Backend URL: ${API_ENDPOINTS.SAFETY_POINTS}`);
      console.error('   Make sure backend is running on port 3000');
    } else {
      console.error('❌ Error fetching places from backend:', error?.message);
      console.error('   Error type:', error?.name);
      console.error('   Stack:', error?.stack);
    }
    return { safetyPoints: null, touristPlaces: null };
  }
};

// Generate synthetic/dynamic places around user location
// Used as fallback when backend is empty or as placeholder while loading
export const generateDynamicPlacesAroundLocation = (lat, lng, radiusKm = 5) => {
  console.log(`🔨 Generating dynamic fallback places around ${lat}, ${lng}`);
  
  const offsetDegrees = (radiusKm / 111); // Rough conversion from km to degrees

  // Generate synthetic safety points around user - based on user's current location
  const safetyPoints = [
    {
      id: 'dynamic_police_' + Math.random(),
      name: 'Nearest Police Station',
      type: 'police',
      coordinates: [lat + offsetDegrees * 0.3, lng + offsetDegrees * 0.3],
      phone: '100',
      icon: '🚔',
      description: 'Police emergency services',
    },
    {
      id: 'dynamic_hospital_' + Math.random(),
      name: 'Nearest Medical Hospital',
      type: 'hospital',
      coordinates: [lat - offsetDegrees * 0.2, lng + offsetDegrees * 0.4],
      phone: '108',
      icon: '🏥',
      description: 'Hospital emergency services',
    },
    {
      id: 'dynamic_fire_' + Math.random(),
      name: 'Fire Safety Station',
      type: 'fire',
      coordinates: [lat + offsetDegrees * 0.2, lng - offsetDegrees * 0.3],
      phone: '101',
      icon: '🚒',
      description: 'Fire safety and rescue services',
    },
    {
      id: 'dynamic_medical_' + Math.random(),
      name: 'Nearby Medical Clinic',
      type: 'medical',
      coordinates: [lat - offsetDegrees * 0.3, lng - offsetDegrees * 0.2],
      phone: '108',
      icon: '🩺',
      description: 'Medical clinic and urgent care',
    },
  ];

  // Generate synthetic tourist places around user - based on user's current location
  const touristPlaces = [
    {
      id: 'dynamic_attraction_' + Math.random(),
      name: 'Popular Local Attraction',
      category: 'attraction',
      coordinates: [lat + offsetDegrees * 0.25, lng - offsetDegrees * 0.35],
      icon: '🏛️',
      rating: 4.5,
      description: 'Well-known local landmark and attraction',
    },
    {
      id: 'dynamic_restaurant_' + Math.random(),
      name: 'Local Restaurant',
      category: 'restaurant',
      coordinates: [lat - offsetDegrees * 0.15, lng + offsetDegrees * 0.2],
      icon: '🍽️',
      rating: 4.2,
      description: 'Popular dining and food spot',
    },
    {
      id: 'dynamic_park_' + Math.random(),
      name: 'Public Park & Garden',
      category: 'park',
      coordinates: [lat + offsetDegrees * 0.35, lng + offsetDegrees * 0.1],
      icon: '🌳',
      rating: 4.0,
      description: 'Green recreational space',
    },
    {
      id: 'dynamic_shopping_' + Math.random(),
      name: 'Shopping & Market Area',
      category: 'shopping',
      coordinates: [lat - offsetDegrees * 0.25, lng - offsetDegrees * 0.25],
      icon: '🛍️',
      rating: 4.3,
      description: 'Shopping centers and markets',
    },
  ];

  return {
    safetyPoints,
    touristPlaces,
  };
};

export default {
  fetchNearbyPlaces,
  generateDynamicPlacesAroundLocation,
};

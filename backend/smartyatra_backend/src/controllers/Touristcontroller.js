import { successResponse,errorResponse } from "../utils/Responseformatter.js";
import Tourist from "../models/Tourist.js";
import GeoFence from "../models/GeoFence.js";
import SafetyPoint from "../models/SafetyPoint.js";
import TouristPlace from "../models/TouristPlace.js";

export const getTouristProfile = async (req, res) => {
    try {
        const touristId = req.params.id;
        const tourist = await Tourist.findById(touristId).select('-password_hash');
        if (!tourist) {
            return errorResponse(res, 'Tourist not found', 404);
        }
        return successResponse(res, 'Tourist profile retrieved successfully', tourist, 200);
    } catch (error) {
        console.error("Error retrieving tourist profile:", error);
        return errorResponse(res, 'Internal server error', 500);
    }
};
export const getLocation = async (req, res) => {
    try {
        const touristId = req.params.id;
        const tourist = await Tourist.findById(touristId).select('current_location_lat current_location_lng');
        if (!tourist) {
            return errorResponse(res, 'Tourist not found', 404);
        }
        return successResponse(res, 'Tourist location retrieved successfully', {
            latitude: tourist.current_location_lat,
            longitude: tourist.current_location_lng
        });
    }
    catch (error) {
        console.error("Error retrieving tourist location:", error);
        return errorResponse(res, 'Internal server error', 500);
    }
};
export const updateLocation = async (req, res) => {
    try {
        const touristId = req.params.id;
        const { latitude, longitude } = req.body;
        if (latitude === undefined || longitude === undefined) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }
        const tourist = await Tourist.findById(touristId);
        if (!tourist) {
            return errorResponse(res, 'Tourist not found', 404);
        }
        tourist.current_location_lat = latitude;
        tourist.current_location_lng = longitude;
        await tourist.save();
        return successResponse(res, 'Tourist location updated successfully', {
            latitude: tourist.current_location_lat,
            longitude: tourist.current_location_lng
        });
    }
    catch (error) {
        console.error("Error updating tourist location:", error);
        return errorResponse(res, 'Internal server error', 500);
    }
};
export const updatename = async (req, res) => {
    try {
        const touristId = req.params.id;
        const { name } = req.body;
        if (!name) {
            return errorResponse(res, 'Name is required', 400);
        }
        const tourist = await Tourist.findById(touristId);
        if (!tourist) {
            return errorResponse(res, 'Tourist not found', 404);
        }
        tourist.name = name;
        await tourist.save();
        return successResponse(res, 'Tourist name updated successfully', { name: tourist.name }, 200);
    }
    catch (error) {
        console.error("Error updating tourist name:", error);
        return errorResponse(res, 'Internal server error', 500);
    }
};
export const updateUserProfile = async (req, res) => {
    try {
        const touristId = req.params.id;
        const { 
            name, 
            dob, 
            gender, 
            nationality, 
            emergency_contacts,
            govt_id_type,
            govt_id_number,
            govt_id_image_url
        } = req.body;

        // Validate that at least one field is provided
        if (!name && !dob && !gender && !nationality && !emergency_contacts && !govt_id_type && !govt_id_number && !govt_id_image_url) {
            return errorResponse(res, 'At least one field is required to update', 400);
        }

        const tourist = await Tourist.findById(touristId);
        if (!tourist) {
            return errorResponse(res, 'Tourist not found', 404);
        }

        // Update only the fields that are provided (phone and email are not updatable)
        if (name !== undefined) tourist.name = name;
        if (dob !== undefined) tourist.dob = dob;
        if (gender !== undefined) tourist.gender = gender;
        if (nationality !== undefined) tourist.nationality = nationality;
        if (emergency_contacts !== undefined) tourist.emergency_contacts = emergency_contacts;
        if (govt_id_type !== undefined) tourist.govt_id_type = govt_id_type;
        if (govt_id_number !== undefined) tourist.govt_id_number = govt_id_number;
        if (govt_id_image_url !== undefined) tourist.govt_id_image_url = govt_id_image_url;

        await tourist.save();
        
        // Return updated tourist without password
        const updatedTourist = await Tourist.findById(touristId).select('-password_hash');
        return successResponse(res, 'Tourist profile updated successfully', updatedTourist, 200);
    } catch (error) {
        console.error("Error updating tourist profile:", error);
        return errorResponse(res, 'Internal server error', 500);
    }
};

// Get geofences near user's location
export const getGeofences = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        
        // 🔒 SECURITY: Strict input validation
        if (!lat || !lng) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const searchRadius = parseFloat(radius) || 5;

        // Validate latitude range (-90 to 90)
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            console.warn(`⚠️ Invalid latitude provided: ${lat}`);
            return errorResponse(res, 'Latitude must be between -90 and 90', 400);
        }

        // Validate longitude range (-180 to 180)
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            console.warn(`⚠️ Invalid longitude provided: ${lng}`);
            return errorResponse(res, 'Longitude must be between -180 and 180', 400);
        }

        // Validate search radius (max 50 km to prevent expensive queries)
        if (isNaN(searchRadius) || searchRadius <= 0 || searchRadius > 50) {
            console.warn(`⚠️ Invalid radius provided: ${radius}`);
            return errorResponse(res, 'Radius must be between 0 and 50 km', 400);
        }

        console.log(`📍 Geofence query: lat=${latitude}, lng=${longitude}, radius=${searchRadius}km`);

        // Use MongoDB geospatial query to find geofences near the user location
        const radiusMeters = searchRadius * 1000;

        // Fetch all geofences and filter by distance
        const geofences = await GeoFence.find({}).lean().limit(100); // Limit results to prevent memory issues

        // Haversine formula to calculate distance
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Filter geofences within search radius
        const nearbyGeofences = geofences.filter(gf => {
            const distance = calculateDistance(latitude, longitude, gf.center_lat, gf.center_lng);
            return distance <= searchRadius;
        });

        // Organize by zone type
        const zonesByType = {
            safe: [],
            restricted: [],
            danger: [],
            tourist_zone: [],
            emergency: []
        };

        nearbyGeofences.forEach(gf => {
            const zoneInfo = {
                id: gf._id.toString(),
                name: gf.name,
                latitude: gf.center_lat,
                longitude: gf.center_lng,
                radius: gf.radius_meters,
                description: gf.name,
                type: gf.zone_type
            };
            if (zonesByType[gf.zone_type]) {
                zonesByType[gf.zone_type].push(zoneInfo);
            }
        });

        // Generate dynamic polygon coordinates for each zone
        const generatePolygonCoordinates = (centerLat, centerLng, radiusMeters) => {
            const offsetDegrees = (radiusMeters / 1000) / 111;
            return [
                [centerLat + offsetDegrees, centerLng - offsetDegrees],
                [centerLat + offsetDegrees, centerLng + offsetDegrees],
                [centerLat - offsetDegrees, centerLng + offsetDegrees],
                [centerLat - offsetDegrees, centerLng - offsetDegrees]
            ];
        };

        // Add coordinates to all zones
        const allZones = { greenZones: [], yellowZones: [], redZones: [] };
        
        // Map zone types to UI colors
        zonesByType.safe.forEach(zone => {
            allZones.greenZones.push({
                ...zone,
                coordinates: generatePolygonCoordinates(zone.latitude, zone.longitude, zone.radius)
            });
        });

        zonesByType.restricted.concat(zonesByType.tourist_zone).forEach(zone => {
            allZones.yellowZones.push({
                ...zone,
                coordinates: generatePolygonCoordinates(zone.latitude, zone.longitude, zone.radius)
            });
        });

        zonesByType.danger.concat(zonesByType.emergency).forEach(zone => {
            allZones.redZones.push({
                ...zone,
                coordinates: generatePolygonCoordinates(zone.latitude, zone.longitude, zone.radius)
            });
        });

        console.log(`✅ Geofences returned - Green: ${allZones.greenZones.length}, Yellow: ${allZones.yellowZones.length}, Red: ${allZones.redZones.length}`);

        return successResponse(res, 'Geofences retrieved for location', allZones, 200);
    } catch (error) {
        console.error("❌ Error retrieving geofences:", error);
        return errorResponse(res, 'Error fetching geofences', 500);
    }
};

// 🏥 Get nearby safety points (police, hospital, fire station, etc)
export const getNearestSafetyPoints = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;
        
        // Validate inputs
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            return errorResponse(res, 'Latitude must be between -90 and 90', 400);
        }
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            return errorResponse(res, 'Longitude must be between -180 and 180', 400);
        }
        
        const searchRadius = Math.min(parseFloat(radius) || 5, 50); // Default 5km, max 50km
        if (isNaN(searchRadius) || searchRadius <= 0) {
            return errorResponse(res, 'Radius must be positive', 400);
        }

        console.log(`🏥 Safety Points query: lat=${latitude}, lng=${longitude}, radius=${searchRadius}km`);

        // Haversine formula for distance calculation
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Fetch all safety points
        const safetyPoints = await SafetyPoint.find({}).lean().limit(100);

        // Filter by distance
        const nearbySafetyPoints = safetyPoints.filter(point => {
            const distance = calculateDistance(latitude, longitude, point.latitude, point.longitude);
            return distance <= searchRadius;
        }).map(point => ({
            ...point,
            distance: calculateDistance(latitude, longitude, point.latitude, point.longitude)
        })).sort((a, b) => a.distance - b.distance);

        console.log(`✅ Found ${nearbySafetyPoints.length} safety points within ${searchRadius}km`);
        return successResponse(res, 'Safety points retrieved', { safetyPoints: nearbySafetyPoints }, 200);

    } catch (error) {
        console.error('Error fetching safety points:', error);
        return errorResponse(res, 'Error fetching safety points', 500);
    }
};

// ⭐ Get nearby tourist places
export const getNearestTouristPlaces = async (req, res) => {
    try {
        const { latitude, longitude, radius, category } = req.query;
        
        // Validate inputs
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            return errorResponse(res, 'Latitude must be between -90 and 90', 400);
        }
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            return errorResponse(res, 'Longitude must be between -180 and 180', 400);
        }
        
        const searchRadius = Math.min(parseFloat(radius) || 5, 50); // Default 5km, max 50km
        if (isNaN(searchRadius) || searchRadius <= 0) {
            return errorResponse(res, 'Radius must be positive', 400);
        }

        console.log(`⭐ Tourist Places query: lat=${latitude}, lng=${longitude}, radius=${searchRadius}km, category=${category || 'any'}`);

        // Haversine formula for distance calculation
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Build query
        const query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        // Fetch tourist places
        const touristPlaces = await TouristPlace.find(query).lean().limit(100);

        // Filter by distance
        const nearbyTouristPlaces = touristPlaces.filter(place => {
            const distance = calculateDistance(latitude, longitude, place.latitude, place.longitude);
            return distance <= searchRadius;
        }).map(place => ({
            ...place,
            distance: calculateDistance(latitude, longitude, place.latitude, place.longitude)
        })).sort((a, b) => a.distance - b.distance);

        console.log(`✅ Found ${nearbyTouristPlaces.length} tourist places within ${searchRadius}km`);
        return successResponse(res, 'Tourist places retrieved', { touristPlaces: nearbyTouristPlaces }, 200);

    } catch (error) {
        console.error('Error fetching tourist places:', error);
        return errorResponse(res, 'Error fetching tourist places', 500);
    }
};

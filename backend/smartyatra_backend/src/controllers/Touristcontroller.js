import { successResponse,errorResponse } from "../utils/Responseformatter.js";
import Tourist from "../models/Tourist.js";

// Get tourist profile by ID
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

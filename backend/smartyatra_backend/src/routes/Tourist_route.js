import { registerTourist,loginTourist,sendRegistrationOTP,verifyOTP,refreshToken, registerTeamLead, registerAuthority } from "../controllers/Authcontroller.js";
import { getTouristProfile, getLocation, updateLocation, updatename, updateUserProfile, getGeofences, getNearestSafetyPoints, getNearestTouristPlaces } from "../controllers/Touristcontroller.js";
import express from "express";
import { verifyToken, verifyOwnership } from "../middleware/auth.js";
import { 
  otpLimiter, 
  otpVerifyLimiter, 
  loginLimiter, 
  registrationLimiter,
  geofenceLimiter,
  profileUpdateLimiter 
} from "../middleware/rateLimiter.js";

const router = express.Router();

// ===== Public Routes (No Authentication Required) =====
// 🔒 SECURITY: Rate limiting applied to prevent abuse
router.post("/register", registrationLimiter, registerTourist);
router.post("/register-teamlead", registrationLimiter, registerTeamLead);
router.post("/register-authority", registrationLimiter, registerAuthority);
router.post("/login", loginLimiter, loginTourist);
router.post("/sendRegistrationOTP", otpLimiter, sendRegistrationOTP);
router.post("/verifyOTP", otpVerifyLimiter, verifyOTP);
router.post('/auth/login', loginLimiter, loginTourist);
router.post('/auth/refresh', refreshToken);

// 🔒 SECURITY: Geofences now require authentication to prevent unauthorized access
// Rate limiting prevents single user from overwhelming the server
router.get('/geofences', verifyToken, geofenceLimiter, getGeofences);

// 🏥 Safety Points - Public endpoints with rate limiting
router.get('/safety-points', geofenceLimiter, getNearestSafetyPoints);

// ⭐ Tourist Places - Public endpoints with rate limiting  
router.get('/tourist-places', geofenceLimiter, getNearestTouristPlaces);

// ===== Protected Routes (Authentication Required) =====
router.get('/profile/:id', verifyOwnership, getTouristProfile);
router.get('/location/:id', verifyOwnership, getLocation);
router.put('/location/:id', verifyOwnership, updateLocation);
router.put('/name/:id', verifyOwnership, updatename);
router.put('/profile/update/:id', verifyOwnership, profileUpdateLimiter, updateUserProfile);

export default router;
import { registerTourist,loginTourist,sendRegistrationOTP,verifyOTP,refreshToken, registerTeamLead, registerAuthority } from "../controllers/Authcontroller.js";
import { getTouristProfile, getLocation, updateLocation, updatename, updateUserProfile } from "../controllers/Touristcontroller.js";
import express from "express";
import { verifyToken, verifyOwnership } from "../middleware/auth.js";

const router = express.Router();

// ===== Public Routes (No Authentication Required) =====
router.post("/register", registerTourist);
router.post("/register-teamlead", registerTeamLead);
router.post("/register-authority", registerAuthority);
router.post("/login", loginTourist);
router.post("/sendRegistrationOTP", sendRegistrationOTP);
router.post("/verifyOTP", verifyOTP);
router.post('/auth/login', loginTourist);
router.post('/auth/refresh', refreshToken);

// ===== Protected Routes (Authentication Required) =====
router.get('/profile/:id', verifyOwnership, getTouristProfile);
router.get('/location/:id', verifyOwnership, getLocation);
router.put('/location/:id', verifyOwnership, updateLocation);
router.put('/name/:id', verifyOwnership, updatename);
router.put('/profile/update/:id', verifyOwnership, updateUserProfile);

export default router;
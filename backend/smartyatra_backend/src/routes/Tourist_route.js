import { registerTourist,loginTourist,sendRegistrationOTP,verifyOTP,refreshToken, registerTeamLead, registerAuthority } from "../controllers/Authcontroller.js";
import { getTouristProfile, getLocation, updateLocation, updatename, updateUserProfile } from "../controllers/Touristcontroller.js";
import express from "express";

const router = express.Router();
router.post("/register", registerTourist);
router.post("/register-teamlead", registerTeamLead);
router.post("/register-authority", registerAuthority);
router.post("/login", loginTourist);
router.post("/sendRegistrationOTP", sendRegistrationOTP);
router.post("/verifyOTP", verifyOTP);
router.post('/auth/login', loginTourist);
router.post('/auth/refresh', refreshToken);
router.get('/profile/:id', getTouristProfile);
router.get('/location', getLocation);
router.put('/location', updateLocation);
router.put('/name', updatename);
router.put('/profile/update/:id', updateUserProfile);

export default router;
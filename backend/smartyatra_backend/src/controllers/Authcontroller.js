import Tourist from "../models/Tourist.js";
import TeamLead from "../models/TeamLead.js";
import Authority from "../models/Authority.js";
import { generateToken, generateRefreshToken, verifyToken } from "../config/jwt.js";
import { successResponse, errorResponse } from "../utils/Responseformatter.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcrypt";
import axios from 'axios';

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSMS = async (phone, otp) => {
    try {
        // Format phone number for Indian numbers
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
            formattedPhone = phone.startsWith('91') ? `+${phone}` : `+91${phone}`;
        }

        const message = `Your Smart Yatra OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;

        console.log('Sending SMS via TextBee to:', formattedPhone);

        const response = await axios.post(
            `https://api.textbee.dev/api/v1/gateway/devices/${process.env.TEXTBEE_DEVICE_ID}/send-sms`,
            {
                recipients: [formattedPhone],
                message: message
            },
            {
                headers: {
                    'x-api-key': process.env.TEXTBEE_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (response.status === 200) {
            console.log(`SMS sent successfully to ${phone}. Response:`, response.data);
            return true;
        } else {
            console.error('TextBee API returned error:', response.data);
            return false;
        }

    } catch (error) {
        console.error('SMS sending failed:', error.message);
        
        if (error.response) {
            console.error('TextBee API Error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('Network error - no response received');
        }
        
        return false;
    }
};

const sendEmailOTP = async (email, otp) => {
    try {
        // Validate environment variables
        if (!process.env.BREVO_API_KEY) {
            console.error('❌ BREVO_API_KEY is not configured in .env');
            return false;
        }
        if (!process.env.EMAIL_SENDER_ADDRESS) {
            console.error('❌ EMAIL_SENDER_ADDRESS is not configured in .env');
            return false;
        }

        const message = `Your Smart Yatra OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;

        console.log(`📧 Attempting to send OTP to: ${email} from: ${process.env.EMAIL_SENDER_ADDRESS}`);

        const data = {
            sender: {
                email: process.env.EMAIL_SENDER_ADDRESS,
                name: 'Smart Yatra'
            },
            to: [
                {
                    email: email
                }
            ],
            subject: 'Your Smart Yatra OTP',
            htmlContent: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Smart Yatra - OTP Verification</h2>
                    <p>Your OTP is: <strong>${otp}</strong></p>
                    <p>Valid for 10 minutes.</p>
                    <p>Do not share this code with anyone.</p>
                </div>
            `
        };

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            data,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                timeout: 15000
            }
        );

        if (response.status === 201 || response.status === 200) {
            console.log(`✅ Email OTP sent successfully to ${email}`);
            console.log('Response:', response.data);
            return true;
        }

        console.error('❌ Brevo returned non-success status:', response.status);
        console.error('Response data:', response.data);
        return false;
    } catch (error) {
        console.error('❌ Email OTP sending failed:', error.message);

        if (error.response) {
            console.error('Brevo API Error Details:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            
            // Common API errors
            if (error.response.status === 400) {
                console.error('⚠️ Bad Request - Check email format and API payload');
            } else if (error.response.status === 401) {
                console.error('⚠️ Unauthorized - Check BREVO_API_KEY validity');
            } else if (error.response.status === 429) {
                console.error('⚠️ Rate Limited - Too many requests to Brevo');
            }
        } else if (error.request) {
            console.error('❌ Network error - No response from Brevo API');
        } else {
            console.error('❌ Error setting up request:', error.message);
        }

        return false;
    }
};

// Backend code - add success field to match frontend expectations
export const sendRegistrationOTP = async (req, res) => {
    try {
        const { phone, email } = req.body;
        if (!phone || !email) {
            return res.status(400).json({ 
                success: false,
                message: "Phone and email are required" 
            });
        }
        const existingTourist = await Tourist.findOne({ 
            $or: [{ phone }, { email }] 
        });
        if (existingTourist) {
            return res.status(409).json({ 
                success: false,
                message: "Tourist with this phone or email already exists" 
            });
        }
        await OTP.deleteMany({ phone, purpose: 'registration', verified: false });
        const otpCode = generateOTP();
        const hashedOTP = await bcrypt.hash(otpCode, 10);
        
        const newOTP = new OTP({
            phone,
            email,
            otp: hashedOTP,
            purpose: 'registration'
        });
        await newOTP.save();

        // Send OTP via email (primary channel)
        const emailSent = await sendEmailOTP(email, otpCode);

        // Optionally send SMS if credentials are configured, but don't fail signup on SMS issues
        if (process.env.TEXTBEE_DEVICE_ID && process.env.TEXTBEE_API_KEY) {
            try {
                await sendSMS(phone, otpCode);
            } catch (smsError) {
                console.warn('SMS OTP sending failed, continuing with email OTP only');
            }
        }

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please try again later."
            });
        }
        
        res.status(200).json({ 
            success: true, // Added success field
            message: "OTP sent successfully to your email address",
            otpId: newOTP._id
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
}

// Backend - verifyOTP function with debug logging
export const verifyOTP = async (req, res) => {
    try {
        console.log('Received OTP verification request:', req.body); // Debug log
        
        const { phone, otp, purpose } = req.body;

        if (!phone || !otp || !purpose) {
            console.log('Missing required fields:', { phone: !!phone, otp: !!otp, purpose: !!purpose }); // Debug log
            return res.status(400).json({ 
                success: false,
                message: "Phone, OTP, and purpose are required" 
            });
        }

        // Find the latest unverified OTP for this phone
        const otpRecord = await OTP.findOne({ 
            phone, 
            purpose: purpose,
            verified: false 
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            console.log('OTP record not found for phone:', phone, 'purpose:', purpose); // Debug log
            return res.status(400).json({ 
                success: false,
                message: "OTP not found or already verified" 
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false,
                message: "OTP expired. Please request a new one." 
            });
        }

        // Check attempt limit
        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false,
                message: "Too many failed attempts. Please request a new OTP." 
            });
        }
        
        const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
        
        if (!isOTPValid) {
            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();
            
            return res.status(400).json({ 
                success: false,
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.` 
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({ 
            success: true,
            message: "OTP verified successfully",
            verified: true
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};
export const registerTourist = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingTourist = await Tourist.findOne({phone}) || await Tourist.findOne({  email });
        if (existingTourist) {
            return res.status(409).json({ message: "Tourist with this phone number already exists" });
        }

        const verifiedOTP = await OTP.findOne({ 
            phone, 
            purpose: 'registration',
            verified: true 
        });
        if (!verifiedOTP) {
            return res.status(400).json({ 
                message: "Please verify your email/phone with OTP first" 
            });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newTourist = new Tourist({ name, email, phone, password_hash });
        await newTourist.save();

        // Clean up used OTP
        await OTP.deleteMany({ phone, purpose: 'registration' });
        const token = generateToken({ id: newTourist._id, role: 'tourist' });
        const refreshToken = generateRefreshToken({ id: newTourist._id, role: 'tourist' });

    //   logger.info(`Tourist registered: ${email}`);
      
      return successResponse(res, 'Tourist registered successfully', {
        success: true,
        token,
        refreshToken,
        user: {
          id: newTourist._id,
          name: newTourist.name,
          email: newTourist.email,
          phone: newTourist.phone,
          role: 'tourist',
        },
      }, 200);
    } 
    catch (error) {
        console.error("Error registering tourist:", error);
        return errorResponse(res, 'Internal server error', 500);
    } 
};

export const registerTeamLead = async (req, res) => {
    try {
        const { name, email, phone, password, idnumber } = req.body;
        if (!name || !email || !phone || !password || !idnumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingTeamLead = await TeamLead.findOne({phone}) || await TeamLead.findOne({ email });
        if (existingTeamLead) {
            return res.status(409).json({ message: "TeamLead with this phone number already exists" });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newTeamLead = new TeamLead({ 
            name, 
            email, 
            phone, 
            password_hash,
            idnumber,
            verified: false
        });
        await newTeamLead.save();
        const token = generateToken({ id: newTeamLead._id, role: 'teamlead' });
        const refreshToken = generateRefreshToken({ id: newTeamLead._id, role: 'teamlead' });
      
      return successResponse(res, 'TeamLead registered successfully', {
        success: true,
        token,
        refreshToken,
        user: {
          id: newTeamLead._id,
          name: newTeamLead.name,
          email: newTeamLead.email,
          phone: newTeamLead.phone,
          role: 'teamlead',
        },
      }, 200);
    } 
    catch (error) {
        console.error("Error registering teamlead:", error);
        return errorResponse(res, 'Internal server error', 500);
    } 
};

export const registerAuthority = async (req, res) => {
    try {
        const { name, email, phone, password, idnumber, govType, department } = req.body;
        if (!name || !email || !phone || !password || !idnumber || !govType || !department) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingAuthority = await Authority.findOne({phone}) || await Authority.findOne({ email });
        if (existingAuthority) {
            return res.status(409).json({ message: "Authority with this phone number already exists" });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newAuthority = new Authority({ 
            name, 
            email, 
            phone, 
            password_hash,
            idnumber,
            govType,
            department,
            verified: false
        });
        await newAuthority.save();
        const token = generateToken({ id: newAuthority._id, role: 'authority' });
        const refreshToken = generateRefreshToken({ id: newAuthority._id, role: 'authority' });
      
      return successResponse(res, 'Authority registered successfully', {
        success: true,
        token,
        refreshToken,
        user: {
          id: newAuthority._id,
          name: newAuthority.name,
          email: newAuthority.email,
          phone: newAuthority.phone,
          role: 'authority',
        },
      }, 200);
    } 
    catch (error) {
        console.error("Error registering authority:", error);
        return errorResponse(res, 'Internal server error', 500);
    } 
};

export const loginTourist = async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password || !role) {
        return errorResponse(res, 'Email, password, and role are required', 400);
      }
      
      let user;
      let Model;
      let passwordField = 'password_hash'; // Default field name
      
      switch (role) {
        case 'tourist':
          Model = Tourist;
          passwordField = 'password_hash';
          break;
        case 'teamlead':
          Model = TeamLead;
          passwordField = 'password_hash';
          break;
        case 'authority':
          Model = Authority;
          passwordField = 'password_hash';
          break;
        default:
          return errorResponse(res, 'Invalid credentials', 401); // Generic message
      }

      user = await Model.findOne({ email });
      
      // 🔒 SECURITY FIX: Do NOT reveal if user exists or password is wrong
      // Return same generic message for both scenarios
      const invalidCredentialsMessage = 'Invalid email or password';
      
      if (!user) {
        // User not found - but don't say that!
        console.warn(`⚠️ Login attempt with non-existent email: ${email}`);
        return errorResponse(res, invalidCredentialsMessage, 401);
      }

      // Check if password field exists and has a value
      if (!user[passwordField]) {
        console.error(`Password field '${passwordField}' is missing for user:`, user.email);
        return errorResponse(res, invalidCredentialsMessage, 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user[passwordField]);
      
      if (!isPasswordValid) {
        console.warn(`⚠️ Failed login attempt for user: ${email}`);
        // Wrong password - same message as user not found
        return errorResponse(res, invalidCredentialsMessage, 401);
      }

      // Update last login for tourists
      if (role === 'tourist') {
        user.last_login = new Date();
        await user.save();
      }

      const token = generateToken({ id: user._id, role });
      const refreshTokenValue = generateRefreshToken({ id: user._id, role });

      console.log(`✅ Successful login for user: ${email}`);

      return successResponse(res, 'Login successful', {
        token,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Login failed', 500);
    }
  };

// Refresh Token
export const refreshToken = (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400);
      }

      const decoded = verifyToken(refreshToken);
      const newToken = generateToken({ id: decoded.id, role: decoded.role });
      const newRefreshToken = generateRefreshToken({ id: decoded.id, role: decoded.role });

      return successResponse(res, 'Token refreshed successfully', {
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return errorResponse(res, 'Invalid refresh token', 401);
    }
  };
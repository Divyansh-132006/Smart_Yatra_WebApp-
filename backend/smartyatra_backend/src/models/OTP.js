import mongoose, { Schema } from "mongoose";

const OTPSchema = new Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['registration', 'login', 'password_reset'], required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0, max: 3 },
    expiresAt: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    }
}, { timestamps: true });

// Auto-delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", OTPSchema);
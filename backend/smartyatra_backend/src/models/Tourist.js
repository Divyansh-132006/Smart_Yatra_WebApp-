import mongoose, { Schema } from "mongoose";

const TouristSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        aadhaar_verified: { type: Boolean, default: false },
        govt_id_type: { type: String, enum: ['aadhaar', 'passport', 'driving_license', 'voter_id'] },
        govt_id_number: { type: String },
        govt_id_image_url: { type: String },
        digilocker_doc_hash: { type: String },
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        nationality: { type: String },
        emergency_contacts: [{ type: String }],
        current_location_lat: { type: Number },
        current_location_lng: { type: Number },
        last_login: { type: Date, default: Date.now },
        created_at: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export default mongoose.model("Tourist", TouristSchema);
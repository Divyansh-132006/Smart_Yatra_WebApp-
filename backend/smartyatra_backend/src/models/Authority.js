import mongoose, { Schema } from "mongoose";

const AuthoritySchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        password_hash: { type: String, required: true },
        idnumber: { type: String, required: true },
        govType: { 
            type: String, 
            enum: ['state', 'central'], 
            required: true 
        },
        department: { type: String, required: true },
        role: { 
            type: String, 
            enum: ['admin', 'police', 'medical', 'rescue', 'tourism_officer'], 
            default: 'tourism_officer'
        },
        verified: { type: Boolean, default: false },
        access_level: { 
            type: String, 
            enum: ['low', 'medium', 'high', 'critical'], 
            default: 'low' 
        },
        created_at: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export default mongoose.model("Authority", AuthoritySchema);
import mongoose, { Schema } from "mongoose";

const SafetyPointSchema = new Schema(
    {
        name: { type: String, required: true },
        type: { 
            type: String, 
            enum: ['police', 'hospital', 'fire', 'medical', 'ambulance', 'emergency_shelter'], 
            required: true 
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        latitude: { type: Number, required: true }, // For easy querying
        longitude: { type: Number, required: true },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        description: { type: String },
        icon: { type: String, default: '🚔' },
        operating_hours: { type: String },
        created_by: { type: Schema.Types.ObjectId, ref: 'Authority' }
    },
    { timestamps: true }
);

// Create geospatial index for location-based queries
SafetyPointSchema.index({ coordinates: '2dsphere' });
SafetyPointSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model("SafetyPoint", SafetyPointSchema);

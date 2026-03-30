import mongoose, { Schema } from "mongoose";

const TouristPlaceSchema = new Schema(
    {
        name: { type: String, required: true },
        category: { 
            type: String, 
            enum: ['attraction', 'restaurant', 'hotel', 'temple', 'museum', 'park', 'shopping', 'adventure', 'other'], 
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
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        description: { type: String },
        icon: { type: String, default: '⭐' },
        rating: { type: Number, min: 0, max: 5 },
        opening_time: { type: String },
        closing_time: { type: String },
        phone: { type: String },
        website: { type: String },
        entry_fee: { type: String },
        created_by: { type: Schema.Types.ObjectId, ref: 'Authority' }
    },
    { timestamps: true }
);

// Create geospatial index for location-based queries
TouristPlaceSchema.index({ coordinates: '2dsphere' });
TouristPlaceSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model("TouristPlace", TouristPlaceSchema);

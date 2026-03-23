import mongoose, { Schema } from "mongoose";

const GeoFenceSchema = new Schema(
    {
        name: { type: String, required: true },
        radius_meters: { type: Number, required: true },
        zone_type: { 
            type: String, 
            enum: ['safe', 'restricted', 'danger', 'tourist_zone', 'emergency'], 
            required: true 
        },
        center_lat: { type: Number, required: true },
        center_lng: { type: Number, required: true },
        created_by: { type: Schema.Types.ObjectId, ref: 'Authority', required: true }
    },
    { timestamps: true }
);

export default mongoose.model("GeoFence", GeoFenceSchema);
import mongoose, { Schema } from "mongoose";

const AlertSchema = new Schema(
    {
        alert_type: { 
            type: String, 
            enum: ['weather', 'security', 'traffic', 'emergency', 'geofence_breach', 'incident'], 
            required: true 
        },
        message: { type: String, required: true },
        location_lat: { type: Number },
        location_lng: { type: Number },
        timestamp: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['active', 'acknowledged', 'resolved', 'expired'], 
            default: 'active' 
        },
        target_user: { 
            type: Schema.Types.ObjectId, 
            required: true,
            refPath: 'target_user_model'
        },
        target_user_model: {
            type: String,
            required: true,
            enum: ['Tourist', 'TeamLead', 'Authority']
        }
    },
    { timestamps: true }
);

export default mongoose.model("Alert", AlertSchema);
import mongoose, { Schema } from "mongoose";

const IncidentSchema = new Schema(
    {
        incident_type: { 
            type: String, 
            enum: ['medical', 'accident', 'theft', 'lost', 'natural_disaster', 'security_threat', 'other'], 
            required: true 
        },
        location_lat: { type: Number, required: true },
        location_lng: { type: Number, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['reported', 'acknowledged', 'in_progress', 'resolved', 'closed'], 
            default: 'reported' 
        },
        reported_by: { 
            type: Schema.Types.ObjectId, 
            required: true,
            refPath: 'reported_by_model'
        },
        reported_by_model: {
            type: String,
            required: true,
            enum: ['Tourist', 'TeamLead']
        },
        trip_id: { type: Schema.Types.ObjectId, ref: 'Trip' },
        handled_by: { type: Schema.Types.ObjectId, ref: 'Authority' }
    },
    { timestamps: true }
);

export default mongoose.model("Incident", IncidentSchema);
import mongoose, { Schema } from "mongoose";

const TripSchema = new Schema(
    {
        trip_name: { type: String, required: true },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        status: { 
            type: String, 
            enum: ['planned', 'active', 'completed', 'cancelled'], 
            default: 'planned' 
        },
        team_lead_id: { type: Schema.Types.ObjectId, ref: 'TeamLead', required: true },
        tourist_ids: [{ type: Schema.Types.ObjectId, ref: 'Tourist' }]
    },
    { timestamps: true }
);

export default mongoose.model("Trip", TripSchema);
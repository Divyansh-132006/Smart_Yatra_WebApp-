import mongoose, { Schema } from "mongoose";

const TeamLeadSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        team_members: [{ type: Schema.Types.ObjectId, ref: 'Tourist' }],
        assigned_trip_id: { type: Schema.Types.ObjectId, ref: 'Trip' }
    },
    { timestamps: true }
);

export default mongoose.model("TeamLead", TeamLeadSchema);
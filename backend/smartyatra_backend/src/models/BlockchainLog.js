import mongoose, { Schema } from "mongoose";

const BlockchainLogSchema = new Schema(
    {
        event_type: { 
            type: String, 
            enum: ['incident_created', 'alert_sent', 'trip_created', 'location_update', 'identity_verified'], 
            required: true 
        },
        data_hash: { type: String, required: true },
        blockchain_tx_id: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        related_id: { 
            type: Schema.Types.ObjectId, 
            required: true,
            refPath: 'related_model'
        },
        related_model: {
            type: String,
            required: true,
            enum: ['Incident', 'Alert', 'Trip', 'Tourist']
        }
    },
    { timestamps: true }
);

export default mongoose.model("BlockchainLog", BlockchainLogSchema);
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const Db_name = "smart_yatra_db";
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${Db_name}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected: " + connection.connection.host);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;

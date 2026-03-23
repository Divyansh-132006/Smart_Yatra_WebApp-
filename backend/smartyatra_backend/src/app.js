import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('API is running...');
});

// // Import and use routes
import touristRoutes from './routes/Tourist_route.js';
app.use('/api/tourists', touristRoutes);
export { app as server };
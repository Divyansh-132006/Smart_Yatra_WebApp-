import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// 🔒 SECURITY: Whitelist specific origins instead of allowing all
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.175:3000', // Your WiFi laptop IP
  'http://10.0.2.2:3000',       // Android emulator
  // Add your production domain here when deployed
];

// CORS configuration with whitelisted origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman, mobile apps making simple requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS request from disallowed origin: ${origin}`);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('🔒 Smart Yatra API is running (secured)...');
});

// Import and use routes
import touristRoutes from './routes/Tourist_route.js';
app.use('/api/tourists', touristRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  if (err.message === 'CORS not allowed for this origin') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// 🔒 SECURITY: HTTPS support with self-signed certificates for development
let server;
const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

if (httpsEnabled) {
  try {
    const certsDir = path.join(__dirname, '..', 'certs');
    const keyPath = path.join(certsDir, 'key.pem');
    const certPath = path.join(certsDir, 'cert.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const privateKey = fs.readFileSync(keyPath, 'utf8');
      const certificate = fs.readFileSync(certPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      
      server = https.createServer(credentials, app);
      console.log('🔒 HTTPS enabled with self-signed certificate');
    } else {
      console.warn('⚠️  HTTPS_ENABLED=true but certificates not found. Run: node generate-certs.js');
      server = app;
    }
  } catch (error) {
    console.error('❌ Error loading HTTPS certificates:', error);
    server = app;
  }
} else {
  server = app;
}

export { server };
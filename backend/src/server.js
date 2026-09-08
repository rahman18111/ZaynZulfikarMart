import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins so mobile & laptop on LAN can access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ZaynZulfikarStore Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend Static Dist (Single Port Hosting)
const distPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} tidak ditemukan.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.', error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 ZaynZulfikarStore Server (Full-Stack) Aktif!`);
  console.log(`📡 URL Lokal:   http://localhost:${PORT}`);
  console.log(`📡 Akses API:   http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

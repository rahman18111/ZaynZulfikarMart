import express from 'express';
import app from './app.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

// Serve Frontend Static Dist (Single Port Hosting untuk mode lokal & Render)
const distPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 ZaynZulfikarStore Server (Full-Stack) Aktif!`);
  console.log(`📡 URL Lokal:   http://localhost:${PORT}`);
  console.log(`📡 Akses API:   http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

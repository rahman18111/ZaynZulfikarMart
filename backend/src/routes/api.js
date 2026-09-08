import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { getBarang, getBarangById, createBarang, updateBarang, deleteBarang, getKategori, createKategori } from '../controllers/barangController.js';
import { createBarangMasuk, getBarangMasuk, getBarangMasukById } from '../controllers/masukController.js';
import { createTransaksi, getTransaksi, getTransaksiById } from '../controllers/transaksiController.js';
import { getStokMonitoring, adjustStok } from '../controllers/stokController.js';
import { getLaporan } from '../controllers/laporanController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 1. Auth routes
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

// 2. Dashboard
router.get('/dashboard', authMiddleware, getDashboardSummary);

// 3. Kategori & Barang
router.get('/kategori', authMiddleware, getKategori);
router.post('/kategori', authMiddleware, createKategori);

router.get('/barang', authMiddleware, getBarang);
router.get('/barang/:id', authMiddleware, getBarangById);
router.post('/barang', authMiddleware, createBarang);
router.put('/barang/:id', authMiddleware, updateBarang);
router.delete('/barang/:id', authMiddleware, deleteBarang);

// 4. Barang Masuk
router.get('/barang-masuk', authMiddleware, getBarangMasuk);
router.get('/barang-masuk/:id', authMiddleware, getBarangMasukById);
router.post('/barang-masuk', authMiddleware, createBarangMasuk);

// 5. Transaksi / Kasir (POS)
router.get('/transaksi', authMiddleware, getTransaksi);
router.get('/transaksi/:id', authMiddleware, getTransaksiById);
router.post('/transaksi', authMiddleware, createTransaksi);

// 6. Stok Monitoring & Adjustment
router.get('/stok', authMiddleware, getStokMonitoring);
router.put('/stok/:id/adjust', authMiddleware, adjustStok);

// 7. Laporan
router.get('/laporan', authMiddleware, getLaporan);

export default router;

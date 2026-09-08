-- =======================================================
-- ZaynZulfikarStore - Database Schema for Supabase (PostgreSQL)
-- Anda dapat langsung menjalankan script ini di Supabase SQL Editor!
-- =======================================================

-- 1. Tabel Users (Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Kategori Barang
CREATE TABLE IF NOT EXISTS kategori (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE,
    keterangan VARCHAR(255) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Data Barang
CREATE TABLE IF NOT EXISTS barang (
    id SERIAL PRIMARY KEY,
    kode_barang VARCHAR(50) NOT NULL UNIQUE,
    nama_barang VARCHAR(150) NOT NULL,
    kategori_id INT NULL REFERENCES kategori(id) ON DELETE SET NULL,
    harga_beli NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    harga_jual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stok INT NOT NULL DEFAULT 0,
    stok_minimum INT NOT NULL DEFAULT 5,
    satuan VARCHAR(20) NOT NULL DEFAULT 'Pcs',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Barang Masuk
CREATE TABLE IF NOT EXISTS barang_masuk (
    id SERIAL PRIMARY KEY,
    kode_masuk VARCHAR(50) NOT NULL UNIQUE,
    tanggal TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_item INT NOT NULL DEFAULT 0,
    total_biaya NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    catatan TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Detail Barang Masuk
CREATE TABLE IF NOT EXISTS barang_masuk_detail (
    id SERIAL PRIMARY KEY,
    barang_masuk_id INT NOT NULL REFERENCES barang_masuk(id) ON DELETE CASCADE,
    barang_id INT NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
    jumlah INT NOT NULL,
    harga_beli NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL
);

-- 6. Tabel Transaksi Penjualan
CREATE TABLE IF NOT EXISTS transaksi (
    id SERIAL PRIMARY KEY,
    kode_transaksi VARCHAR(50) NOT NULL UNIQUE,
    tanggal TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_belanja NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_modal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    laba_kotor NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    uang_bayar NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    kembalian NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    metode_bayar VARCHAR(30) DEFAULT 'Tunai',
    nama_pelanggan VARCHAR(100) DEFAULT 'Pelanggan Umum',
    catatan TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Detail Transaksi Penjualan
CREATE TABLE IF NOT EXISTS transaksi_detail (
    id SERIAL PRIMARY KEY,
    transaksi_id INT NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
    barang_id INT NULL REFERENCES barang(id) ON DELETE SET NULL,
    nama_barang_snapshot VARCHAR(150) NOT NULL,
    harga_jual NUMERIC(12, 2) NOT NULL,
    harga_beli NUMERIC(12, 2) NOT NULL,
    jumlah INT NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    laba NUMERIC(14, 2) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_barang_kode ON barang(kode_barang);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal);
CREATE INDEX IF NOT EXISTS idx_barang_masuk_tanggal ON barang_masuk(tanggal);

-- =======================================================
-- ZaynZulfikarStore - Database Schema (MySQL)
-- =======================================================

CREATE DATABASE IF NOT EXISTS `zayn_zulfikar_store` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `zayn_zulfikar_store`;

-- 1. Tabel Admin / Pengguna
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nama_lengkap` VARCHAR(100) NOT NULL,
    `role` ENUM('admin') DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Kategori Barang
CREATE TABLE IF NOT EXISTS `kategori` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_kategori` VARCHAR(100) NOT NULL UNIQUE,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Data Barang
CREATE TABLE IF NOT EXISTS `barang` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_barang` VARCHAR(50) NOT NULL UNIQUE,
    `nama_barang` VARCHAR(150) NOT NULL,
    `kategori_id` INT NULL,
    `harga_beli` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `harga_jual` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `stok` INT NOT NULL DEFAULT 0,
    `stok_minimum` INT NOT NULL DEFAULT 5,
    `satuan` VARCHAR(20) NOT NULL DEFAULT 'Pcs',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tabel Barang Masuk (Restock)
CREATE TABLE IF NOT EXISTS `barang_masuk` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_masuk` VARCHAR(50) NOT NULL UNIQUE,
    `tanggal` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `total_item` INT NOT NULL DEFAULT 0,
    `total_biaya` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `catatan` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Tabel Detail Barang Masuk
CREATE TABLE IF NOT EXISTS `barang_masuk_detail` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `barang_masuk_id` INT NOT NULL,
    `barang_id` INT NOT NULL,
    `jumlah` INT NOT NULL,
    `harga_beli` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    FOREIGN KEY (`barang_masuk_id`) REFERENCES `barang_masuk`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barang_id`) REFERENCES `barang`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Tabel Transaksi Penjualan (Kasir)
CREATE TABLE IF NOT EXISTS `transaksi` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_transaksi` VARCHAR(50) NOT NULL UNIQUE,
    `tanggal` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `total_belanja` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `total_modal` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `laba_kotor` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `uang_bayar` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `kembalian` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `metode_bayar` ENUM('Tunai', 'QRIS', 'Transfer') DEFAULT 'Tunai',
    `nama_pelanggan` VARCHAR(100) DEFAULT 'Pelanggan Umum',
    `catatan` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Tabel Detail Transaksi Penjualan
CREATE TABLE IF NOT EXISTS `transaksi_detail` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaksi_id` INT NOT NULL,
    `barang_id` INT NULL,
    `nama_barang_snapshot` VARCHAR(150) NOT NULL,
    `harga_jual` DECIMAL(12, 2) NOT NULL,
    `harga_beli` DECIMAL(12, 2) NOT NULL,
    `jumlah` INT NOT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `laba` DECIMAL(14, 2) NOT NULL,
    FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barang_id`) REFERENCES `barang`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_barang_kode ON `barang`(`kode_barang`);
CREATE INDEX idx_transaksi_tanggal ON `transaksi`(`tanggal`);
CREATE INDEX idx_barang_masuk_tanggal ON `barang_masuk`(`tanggal`);

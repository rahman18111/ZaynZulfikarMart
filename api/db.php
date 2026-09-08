<?php
// ==============================================================
// ZaynZulfikarMart - Database Connection & Auto Setup (SQLite)
// ==============================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0777, true);
}

$dbPath = $dbDir . DIRECTORY_SEPARATOR . 'zayn_mart.db';

try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Foreign keys support in SQLite
    $pdo->exec("PRAGMA foreign_keys = ON;");

    // Initialize Tables if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS barang (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama_barang TEXT NOT NULL,
            satuan TEXT DEFAULT 'pcs',
            kategori TEXT DEFAULT 'Umum',
            harga_modal REAL NOT NULL DEFAULT 0,
            harga_jual REAL NOT NULL DEFAULT 0,
            stok REAL NOT NULL DEFAULT 0,
            stok_minimum REAL DEFAULT 5,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transaksi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kode_transaksi TEXT UNIQUE NOT NULL,
            tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_belanja REAL NOT NULL DEFAULT 0,
            total_modal REAL NOT NULL DEFAULT 0,
            laba_kotor REAL NOT NULL DEFAULT 0,
            uang_bayar REAL NOT NULL DEFAULT 0,
            kembalian REAL NOT NULL DEFAULT 0,
            metode_bayar TEXT NOT NULL DEFAULT 'Tunai', -- 'Tunai', 'Kasbon'
            status_bayar TEXT NOT NULL DEFAULT 'Lunas', -- 'Lunas', 'Belum Lunas'
            nama_pelanggan TEXT DEFAULT NULL,
            catatan TEXT DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS detail_transaksi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaksi_id INTEGER NOT NULL,
            barang_id INTEGER DEFAULT NULL,
            nama_barang TEXT NOT NULL,
            satuan TEXT DEFAULT 'pcs',
            qty REAL NOT NULL,
            harga_modal REAL NOT NULL DEFAULT 0,
            harga_jual REAL NOT NULL DEFAULT 0,
            subtotal REAL NOT NULL DEFAULT 0,
            subtotal_modal REAL NOT NULL DEFAULT 0,
            FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS riwayat_stok (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barang_id INTEGER DEFAULT NULL,
            nama_barang TEXT NOT NULL,
            jenis TEXT NOT NULL, -- 'MASUK', 'KELUAR', 'PENYESUAIAN'
            jumlah REAL NOT NULL,
            stok_sebelum REAL NOT NULL,
            stok_sesudah REAL NOT NULL,
            keterangan TEXT DEFAULT NULL,
            tanggal DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Gagal koneksi database: ' . $e->getMessage()
    ]);
    exit;
}

function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'hari_ini';

if ($method === 'GET') {
    // 1. RINGKASAN HARI INI (TUTUP BUKU HARIAN)
    if ($action === 'hari_ini') {
        $tanggal = $_GET['tanggal'] ?? date('Y-m-d');

        // Total Omset & Laba Hari Ini
        $stmtHarian = $pdo->prepare("
            SELECT 
                COUNT(id) as total_transaksi,
                COALESCE(SUM(total_belanja), 0) as omset,
                COALESCE(SUM(total_modal), 0) as modal,
                COALESCE(SUM(laba_kotor), 0) as laba_kotor,
                COALESCE(SUM(CASE WHEN metode_bayar = 'Tunai' THEN total_belanja ELSE uang_bayar END), 0) as uang_tunai_masuk,
                COALESCE(SUM(CASE WHEN metode_bayar = 'Kasbon' AND status_bayar = 'Belum Lunas' THEN (total_belanja - uang_bayar) ELSE 0 END), 0) as kasbon_baru
            FROM transaksi 
            WHERE DATE(tanggal) = ?
        ");
        $stmtHarian->execute([$tanggal]);
        $ringkasan = $stmtHarian->fetch();

        // Total Barang Terjual Hari Ini
        $stmtItems = $pdo->prepare("
            SELECT COALESCE(SUM(qty), 0) as total_item_terjual
            FROM detail_transaksi dt
            JOIN transaksi t ON dt.transaksi_id = t.id
            WHERE DATE(t.tanggal) = ?
        ");
        $stmtItems->execute([$tanggal]);
        $ringkasan['total_item_terjual'] = $stmtItems->fetchColumn();

        // 5 Barang Paling Laris Hari Ini
        $stmtTop = $pdo->prepare("
            SELECT dt.nama_barang, dt.satuan, SUM(dt.qty) as total_qty, SUM(dt.subtotal) as total_omset
            FROM detail_transaksi dt
            JOIN transaksi t ON dt.transaksi_id = t.id
            WHERE DATE(t.tanggal) = ?
            GROUP BY LOWER(dt.nama_barang)
            ORDER BY total_qty DESC
            LIMIT 5
        ");
        $stmtTop->execute([$tanggal]);
        $ringkasan['top_produk'] = $stmtTop->fetchAll();

        // Barang Stok Menipis / Perlu Kulakan
        $stmtKritis = $pdo->query("
            SELECT id, nama_barang, satuan, stok, stok_minimum, harga_modal, harga_jual
            FROM barang
            WHERE stok <= stok_minimum
            ORDER BY stok ASC
            LIMIT 15
        ");
        $ringkasan['stok_kritis'] = $stmtKritis->fetchAll();

        sendResponse(true, "Laporan hari ini ({$tanggal})", $ringkasan);
    }

    // 2. REKAP BULANAN / PERIODE
    if ($action === 'periode') {
        $startDate = $_GET['start'] ?? date('Y-m-01');
        $endDate = $_GET['end'] ?? date('Y-m-d');

        $stmtPeriode = $pdo->prepare("
            SELECT 
                DATE(tanggal) as tgl,
                COUNT(id) as jml_transaksi,
                SUM(total_belanja) as omset,
                SUM(total_modal) as modal,
                SUM(laba_kotor) as laba
            FROM transaksi
            WHERE DATE(tanggal) BETWEEN ? AND ?
            GROUP BY DATE(tanggal)
            ORDER BY tgl DESC
        ");
        $stmtPeriode->execute([$startDate, $endDate]);
        $harian = $stmtPeriode->fetchAll();

        // Total Keseluruhan Periode
        $stmtTotal = $pdo->prepare("
            SELECT 
                COUNT(id) as total_transaksi,
                COALESCE(SUM(total_belanja), 0) as total_omset,
                COALESCE(SUM(total_modal), 0) as total_modal,
                COALESCE(SUM(laba_kotor), 0) as total_laba
            FROM transaksi
            WHERE DATE(tanggal) BETWEEN ? AND ?
        ");
        $stmtTotal->execute([$startDate, $endDate]);
        $grandTotal = $stmtTotal->fetch();

        sendResponse(true, "Rekap periode {$startDate} s/d {$endDate}", [
            'harian' => $harian,
            'summary' => $grandTotal
        ]);
    }
}

sendResponse(false, 'Aksi tidak valid', null, 400);

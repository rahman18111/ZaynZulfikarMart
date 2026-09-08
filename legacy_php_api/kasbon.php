<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'list';

// ==============================================================
// GET: DAFTAR KASBON / UTANG PELANGGAN
// ==============================================================
if ($method === 'GET') {
    if ($action === 'list') {
        $status = $_GET['status'] ?? 'Belum Lunas'; // 'Belum Lunas', 'Lunas', 'Semua'

        $sql = "SELECT * FROM transaksi WHERE metode_bayar = 'Kasbon'";
        $params = [];

        if ($status !== 'Semua') {
            $sql .= " AND status_bayar = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY tanggal DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $kasbon = $stmt->fetchAll();

        // Hitung total akumulasi kasbon belum lunas
        $stmtTotal = $pdo->query("
            SELECT SUM(total_belanja - uang_bayar) as total_utang_menggantung,
                   COUNT(id) as total_faktur_belum_lunas
            FROM transaksi 
            WHERE metode_bayar = 'Kasbon' AND status_bayar = 'Belum Lunas'
        ");
        $summary = $stmtTotal->fetch();

        // Ringkasan per nama pelanggan
        $stmtPerPelanggan = $pdo->query("
            SELECT nama_pelanggan, 
                   COUNT(id) as jumlah_transaksi,
                   SUM(total_belanja) as total_tagihan,
                   SUM(uang_bayar) as total_dibayar,
                   SUM(total_belanja - uang_bayar) as sisa_utang,
                   MAX(tanggal) as tanggal_terakhir
            FROM transaksi
            WHERE metode_bayar = 'Kasbon' AND status_bayar = 'Belum Lunas'
            GROUP BY LOWER(nama_pelanggan)
            ORDER BY sisa_utang DESC
        ");
        $perPelanggan = $stmtPerPelanggan->fetchAll();

        sendResponse(true, 'Data kasbon berhasil dimuat', [
            'daftar' => $kasbon,
            'summary' => $summary,
            'per_pelanggan' => $perPelanggan
        ]);
    }
}

// ==============================================================
// POST: PELUNASAN / CICIL KASBON
// ==============================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    // 1. LUNASKAN 1 TRANSAKSI
    if ($action === 'lunaskan') {
        $transaksi_id = intval($input['transaksi_id'] ?? 0);
        if ($transaksi_id <= 0) {
            sendResponse(false, 'ID transaksi tidak valid', null, 400);
        }

        $stmtCek = $pdo->prepare("SELECT * FROM transaksi WHERE id = ?");
        $stmtCek->execute([$transaksi_id]);
        $trx = $stmtCek->fetch();

        if (!$trx) {
            sendResponse(false, 'Transaksi tidak ditemukan', null, 404);
        }

        $stmtUp = $pdo->prepare("
            UPDATE transaksi 
            SET status_bayar = 'Lunas', 
                uang_bayar = total_belanja, 
                kembalian = 0,
                catatan = COALESCE(catatan, '') || ' [Dilunasi pada ' || CURRENT_TIMESTAMP || ']'
            WHERE id = ?
        ");
        $stmtUp->execute([$transaksi_id]);

        sendResponse(true, "Kasbon #{$trx['kode_transaksi']} atas nama {$trx['nama_pelanggan']} berhasil dilunasi!");
    }

    // 2. CICIL KASBON
    if ($action === 'cicil') {
        $transaksi_id = intval($input['transaksi_id'] ?? 0);
        $jumlah_bayar = floatval($input['jumlah_bayar'] ?? 0);

        if ($transaksi_id <= 0 || $jumlah_bayar <= 0) {
            sendResponse(false, 'ID transaksi dan nominal cicilan wajib diisi dengan benar', null, 400);
        }

        $stmtCek = $pdo->prepare("SELECT * FROM transaksi WHERE id = ?");
        $stmtCek->execute([$transaksi_id]);
        $trx = $stmtCek->fetch();

        if (!$trx) {
            sendResponse(false, 'Transaksi tidak ditemukan', null, 404);
        }

        $uang_bayar_baru = floatval($trx['uang_bayar']) + $jumlah_bayar;
        $total_belanja = floatval($trx['total_belanja']);

        $status_baru = ($uang_bayar_baru >= $total_belanja) ? 'Lunas' : 'Belum Lunas';
        $kembalian = max(0, $uang_bayar_baru - $total_belanja);

        $stmtUp = $pdo->prepare("
            UPDATE transaksi 
            SET uang_bayar = ?, 
                kembalian = ?, 
                status_bayar = ?,
                catatan = COALESCE(catatan, '') || ' [Cicil Rp ' || ? || ' pada ' || CURRENT_TIMESTAMP || ']'
            WHERE id = ?
        ");
        $stmtUp->execute([$uang_bayar_baru, $kembalian, $status_baru, number_format($jumlah_bayar, 0, ',', '.'), $transaksi_id]);

        sendResponse(true, "Pembayaran cicilan berhasil dicatat. Status: {$status_baru}", [
            'status_bayar' => $status_baru,
            'uang_bayar' => $uang_bayar_baru,
            'sisa_utang' => max(0, $total_belanja - $uang_bayar_baru)
        ]);
    }
}

sendResponse(false, 'Metode atau aksi tidak didukung', null, 400);

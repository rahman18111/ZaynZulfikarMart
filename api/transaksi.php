<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'list';

// ==============================================================
// GET: RIWAYAT TRANSAKSI / DETAIL STRUK
// ==============================================================
if ($method === 'GET') {
    if ($action === 'list') {
        $tanggal = $_GET['tanggal'] ?? '';
        $limit = intval($_GET['limit'] ?? 30);

        $sql = "SELECT * FROM transaksi WHERE 1=1";
        $params = [];

        if ($tanggal !== '') {
            $sql .= " AND DATE(tanggal) = ?";
            $params[] = $tanggal;
        }

        $sql .= " ORDER BY tanggal DESC LIMIT ?";
        $params[] = $limit;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $transaksi = $stmt->fetchAll();

        sendResponse(true, 'Riwayat transaksi berhasil dimuat', $transaksi);
    }

    if ($action === 'detail') {
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0) {
            sendResponse(false, 'ID transaksi tidak valid', null, 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM transaksi WHERE id = ?");
        $stmt->execute([$id]);
        $trx = $stmt->fetch();

        if (!$trx) {
            sendResponse(false, 'Transaksi tidak ditemukan', null, 404);
        }

        $stmtDet = $pdo->prepare("SELECT * FROM detail_transaksi WHERE transaksi_id = ?");
        $stmtDet->execute([$id]);
        $trx['items'] = $stmtDet->fetchAll();

        sendResponse(true, 'Detail transaksi', $trx);
    }
}

// ==============================================================
// POST: PROSES BARANG KELUAR / KASIR PENJUALAN
// ==============================================================
if ($method === 'POST') {
    if ($action === 'keluar' || $action === 'simpan') {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $items = $input['items'] ?? [];
        if (empty($items) || !is_array($items)) {
            sendResponse(false, 'Keranjang belanja masih kosong! Masukkan minimal 1 barang.', null, 400);
        }

        $metode_bayar = trim($input['metode_bayar'] ?? 'Tunai'); // 'Tunai' atau 'Kasbon'
        $nama_pelanggan = trim($input['nama_pelanggan'] ?? '');
        $catatan = trim($input['catatan'] ?? '');
        $uang_bayar = floatval($input['uang_bayar'] ?? 0);

        if ($metode_bayar === 'Kasbon' && empty($nama_pelanggan)) {
            sendResponse(false, 'Nama pelanggan wajib diisi untuk transaksi Kasbon/Utang!', null, 400);
        }

        // Kalkulasi Total & Validasi
        $total_belanja = 0;
        $total_modal = 0;
        $clean_items = [];

        foreach ($items as $it) {
            $nama = trim($it['nama_barang'] ?? '');
            $qty = floatval($it['qty'] ?? 0);
            $harga_jual = floatval($it['harga_jual'] ?? 0);
            $harga_modal = floatval($it['harga_modal'] ?? 0);
            $satuan = trim($it['satuan'] ?? 'pcs');
            $barang_id = !empty($it['barang_id']) ? intval($it['barang_id']) : null;

            if ($nama === '' || $qty <= 0) {
                continue;
            }

            $subtotal = $qty * $harga_jual;
            $subtotal_modal = $qty * $harga_modal;

            $total_belanja += $subtotal;
            $total_modal += $subtotal_modal;

            $clean_items[] = [
                'barang_id' => $barang_id,
                'nama_barang' => $nama,
                'satuan' => $satuan,
                'qty' => $qty,
                'harga_modal' => $harga_modal,
                'harga_jual' => $harga_jual,
                'subtotal' => $subtotal,
                'subtotal_modal' => $subtotal_modal
            ];
        }

        if (empty($clean_items)) {
            sendResponse(false, 'Tidak ada item yang valid untuk diproses', null, 400);
        }

        $laba_kotor = $total_belanja - $total_modal;
        
        // Status bayar & hitung kembalian
        if ($metode_bayar === 'Kasbon') {
            $status_bayar = ($uang_bayar >= $total_belanja) ? 'Lunas' : 'Belum Lunas';
            $kembalian = max(0, $uang_bayar - $total_belanja);
        } else {
            $status_bayar = 'Lunas';
            if ($uang_bayar < $total_belanja) {
                $uang_bayar = $total_belanja; // default pas jika tidak diinput
            }
            $kembalian = max(0, $uang_bayar - $total_belanja);
        }

        // Kode Transaksi Unik
        $kode_transaksi = 'ZJM-' . date('Ymd-His') . '-' . rand(100, 999);

        $pdo->beginTransaction();
        try {
            // 1. Simpan Header Transaksi
            $stmtTrx = $pdo->prepare("
                INSERT INTO transaksi (
                    kode_transaksi, total_belanja, total_modal, laba_kotor, 
                    uang_bayar, kembalian, metode_bayar, status_bayar, 
                    nama_pelanggan, catatan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtTrx->execute([
                $kode_transaksi, $total_belanja, $total_modal, $laba_kotor,
                $uang_bayar, $kembalian, $metode_bayar, $status_bayar,
                $nama_pelanggan ?: null, $catatan ?: null
            ]);
            $transaksi_id = $pdo->lastInsertId();

            // 2. Simpan Detail Items & Kurangi Stok
            $stmtDet = $pdo->prepare("
                INSERT INTO detail_transaksi (
                    transaksi_id, barang_id, nama_barang, satuan, 
                    qty, harga_modal, harga_jual, subtotal, subtotal_modal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmtUpdateStok = $pdo->prepare("
                UPDATE barang 
                SET stok = stok - ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");

            $stmtGetStok = $pdo->prepare("SELECT stok, satuan FROM barang WHERE id = ?");

            $stmtLogStok = $pdo->prepare("
                INSERT INTO riwayat_stok (
                    barang_id, nama_barang, jenis, jumlah, 
                    stok_sebelum, stok_sesudah, keterangan
                ) VALUES (?, ?, 'KELUAR', ?, ?, ?, ?)
            ");

            foreach ($clean_items as $ci) {
                $stmtDet->execute([
                    $transaksi_id, $ci['barang_id'], $ci['nama_barang'], $ci['satuan'],
                    $ci['qty'], $ci['harga_modal'], $ci['harga_jual'], $ci['subtotal'], $ci['subtotal_modal']
                ]);

                // Jika barang terdaftar di master data, kurangi stoknya
                if ($ci['barang_id']) {
                    $stmtGetStok->execute([$ci['barang_id']]);
                    $bData = $stmtGetStok->fetch();

                    if ($bData) {
                        $stok_sebelum = floatval($bData['stok']);
                        $stok_sesudah = $stok_sebelum - $ci['qty'];

                        $stmtUpdateStok->execute([$ci['qty'], $ci['barang_id']]);

                        $stmtLogStok->execute([
                            $ci['barang_id'],
                            $ci['nama_barang'],
                            $ci['qty'],
                            $stok_sebelum,
                            $stok_sesudah,
                            "Penjualan #{$kode_transaksi}"
                        ]);
                    }
                }
            }

            $pdo->commit();

            sendResponse(true, "Transaksi berhasil disimpan! #{$kode_transaksi}", [
                'transaksi_id' => $transaksi_id,
                'kode_transaksi' => $kode_transaksi,
                'total_belanja' => $total_belanja,
                'uang_bayar' => $uang_bayar,
                'kembalian' => $kembalian,
                'metode_bayar' => $metode_bayar,
                'status_bayar' => $status_bayar,
                'items_count' => count($clean_items)
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(false, 'Gagal memproses transaksi: ' . $e->getMessage(), null, 500);
        }
    }
}

sendResponse(false, 'Metode atau aksi tidak didukung', null, 400);

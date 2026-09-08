<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'list';

// ==============================================================
// GET: DAFTAR BARANG & SUGGESTION PENCARIAN
// ==============================================================
if ($method === 'GET') {
    if ($action === 'list') {
        $q = trim($_GET['q'] ?? '');
        $lowStock = isset($_GET['low_stock']) && $_GET['low_stock'] == '1';

        $sql = "SELECT * FROM barang WHERE 1=1";
        $params = [];

        if ($q !== '') {
            $sql .= " AND nama_barang LIKE ?";
            $params[] = "%{$q}%";
        }

        if ($lowStock) {
            $sql .= " AND stok <= stok_minimum";
        }

        $sql .= " ORDER BY nama_barang ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        sendResponse(true, 'Daftar barang berhasil dimuat', $items);
    }

    if ($action === 'suggestions') {
        $q = trim($_GET['q'] ?? '');
        if ($q === '') {
            $stmt = $pdo->query("SELECT id, nama_barang, satuan, harga_modal, harga_jual, stok FROM barang ORDER BY nama_barang ASC LIMIT 20");
        } else {
            $stmt = $pdo->prepare("SELECT id, nama_barang, satuan, harga_modal, harga_jual, stok FROM barang WHERE nama_barang LIKE ? ORDER BY nama_barang ASC LIMIT 20");
            $stmt->execute(["%{$q}%"]);
        }
        sendResponse(true, 'Saran barang', $stmt->fetchAll());
    }

    if ($action === 'riwayat_stok') {
        $barang_id = $_GET['barang_id'] ?? null;
        if ($barang_id) {
            $stmt = $pdo->prepare("SELECT * FROM riwayat_stok WHERE barang_id = ? ORDER BY tanggal DESC LIMIT 50");
            $stmt->execute([$barang_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM riwayat_stok ORDER BY tanggal DESC LIMIT 50");
        }
        sendResponse(true, 'Riwayat stok berhasil dimuat', $stmt->fetchAll());
    }
}

// ==============================================================
// POST: TAMBAH STOK / BARANG MASUK / EDIT / PENYESUAIAN
// ==============================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    // 1. TAMBAH BARANG MASUK (KULAKAN / RESTOCK)
    if ($action === 'masuk') {
        $nama_barang = trim($input['nama_barang'] ?? '');
        $satuan = trim($input['satuan'] ?? 'pcs');
        $qty_masuk = floatval($input['qty_masuk'] ?? 0);
        $harga_modal = floatval($input['harga_modal'] ?? 0);
        $harga_jual = floatval($input['harga_jual'] ?? 0);
        $kategori = trim($input['kategori'] ?? 'Umum');
        $keterangan = trim($input['keterangan'] ?? 'Barang masuk / kulakan');

        if ($nama_barang === '' || $qty_masuk <= 0) {
            sendResponse(false, 'Nama barang dan jumlah masuk wajib diisi dengan benar', null, 400);
        }

        // Cek apakah barang sudah pernah ada
        $stmtCek = $pdo->prepare("SELECT * FROM barang WHERE LOWER(nama_barang) = LOWER(?) LIMIT 1");
        $stmtCek->execute([$nama_barang]);
        $existing = $stmtCek->fetch();

        $pdo->beginTransaction();
        try {
            if ($existing) {
                $barang_id = $existing['id'];
                $stok_sebelum = floatval($existing['stok']);
                $stok_sesudah = $stok_sebelum + $qty_masuk;

                // Update barang yang ada
                $stmtUpdate = $pdo->prepare("
                    UPDATE barang 
                    SET stok = ?, 
                        harga_modal = ?, 
                        harga_jual = ?, 
                        satuan = ?, 
                        kategori = ?, 
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $stmtUpdate->execute([
                    $stok_sesudah,
                    $harga_modal > 0 ? $harga_modal : $existing['harga_modal'],
                    $harga_jual > 0 ? $harga_jual : $existing['harga_jual'],
                    $satuan ?: $existing['satuan'],
                    $kategori ?: $existing['kategori'],
                    $barang_id
                ]);
            } else {
                // Buat barang baru
                $stok_sebelum = 0;
                $stok_sesudah = $qty_masuk;

                $stmtInsert = $pdo->prepare("
                    INSERT INTO barang (nama_barang, satuan, kategori, harga_modal, harga_jual, stok)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmtInsert->execute([$nama_barang, $satuan, $kategori, $harga_modal, $harga_jual, $stok_sesudah]);
                $barang_id = $pdo->lastInsertId();
            }

            // Catat ke riwayat stok
            $stmtLog = $pdo->prepare("
                INSERT INTO riwayat_stok (barang_id, nama_barang, jenis, jumlah, stok_sebelum, stok_sesudah, keterangan)
                VALUES (?, ?, 'MASUK', ?, ?, ?, ?)
            ");
            $stmtLog->execute([$barang_id, $nama_barang, $qty_masuk, $stok_sebelum, $stok_sesudah, $keterangan]);

            $pdo->commit();

            sendResponse(true, "Berhasil mencatat barang masuk: {$nama_barang} (+{$qty_masuk} {$satuan})", [
                'barang_id' => $barang_id,
                'nama_barang' => $nama_barang,
                'stok_sekarang' => $stok_sesudah
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(false, 'Gagal menyimpan barang masuk: ' . $e->getMessage(), null, 500);
        }
    }

    // 2. EDIT INFORMASI BARANG (HARGA / NAMA / STOK MINIMUM)
    if ($action === 'edit') {
        $id = intval($input['id'] ?? 0);
        $nama_barang = trim($input['nama_barang'] ?? '');
        $satuan = trim($input['satuan'] ?? 'pcs');
        $harga_modal = floatval($input['harga_modal'] ?? 0);
        $harga_jual = floatval($input['harga_jual'] ?? 0);
        $stok_minimum = floatval($input['stok_minimum'] ?? 5);

        if ($id <= 0 || $nama_barang === '') {
            sendResponse(false, 'ID barang dan nama barang wajib diisi', null, 400);
        }

        $stmt = $pdo->prepare("
            UPDATE barang 
            SET nama_barang = ?, satuan = ?, harga_modal = ?, harga_jual = ?, stok_minimum = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $stmt->execute([$nama_barang, $satuan, $harga_modal, $harga_jual, $stok_minimum, $id]);

        sendResponse(true, 'Data barang berhasil diperbarui');
    }

    // 3. PENYESUAIAN STOK MANUAL (BARANG RUSAK / EXPIRED / OPNAME)
    if ($action === 'penyesuaian') {
        $id = intval($input['id'] ?? 0);
        $stok_baru = floatval($input['stok_baru'] ?? 0);
        $alasan = trim($input['alasan'] ?? 'Penyesuaian stok fisik');

        if ($id <= 0 || $stok_baru < 0) {
            sendResponse(false, 'ID barang dan jumlah stok valid wajib disertakan', null, 400);
        }

        $stmtCek = $pdo->prepare("SELECT * FROM barang WHERE id = ?");
        $stmtCek->execute([$id]);
        $barang = $stmtCek->fetch();

        if (!$barang) {
            sendResponse(false, 'Barang tidak ditemukan', null, 404);
        }

        $stok_sebelum = floatval($barang['stok']);
        $selisih = $stok_baru - $stok_sebelum;

        $pdo->beginTransaction();
        try {
            $stmtUp = $pdo->prepare("UPDATE barang SET stok = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmtUp->execute([$stok_baru, $id]);

            $stmtLog = $pdo->prepare("
                INSERT INTO riwayat_stok (barang_id, nama_barang, jenis, jumlah, stok_sebelum, stok_sesudah, keterangan)
                VALUES (?, ?, 'PENYESUAIAN', ?, ?, ?, ?)
            ");
            $stmtLog->execute([$id, $barang['nama_barang'], $selisih, $stok_sebelum, $stok_baru, $alasan]);

            $pdo->commit();
            sendResponse(true, "Stok {$barang['nama_barang']} disesuaikan menjadi {$stok_baru} {$barang['satuan']}");
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(false, 'Gagal menyesuaikan stok: ' . $e->getMessage(), null, 500);
        }
    }

    // 4. HAPUS BARANG
    if ($action === 'hapus') {
        $id = intval($input['id'] ?? 0);
        if ($id <= 0) {
            sendResponse(false, 'ID barang tidak valid', null, 400);
        }

        $stmt = $pdo->prepare("DELETE FROM barang WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, 'Barang berhasil dihapus');
    }
}

sendResponse(false, 'Metode atau aksi tidak didukung', null, 400);

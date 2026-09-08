# ZaynZulfikarStore – Sistem Kasir & Manajemen Stok

Aplikasi web kasir (Point of Sale) & manajemen stok modern, minimalis, dan profesional yang dirancang khusus untuk operasional toko satu admin. Memiliki antarmuka **ultra-responsive** sehingga sangat nyaman digunakan melalui **Laptop / PC** maupun **Smartphone / HP**.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express.js, MySQL2 (Promise pool), JWT, BCrypt
- **Database**: MySQL (via XAMPP) — Database: `zayn_zulfikar_store`
- **Theme**: Luxury Clean White & Dark Charcoal dengan Aksen Emas (Gold)

---

## 🌐 Link Akses Website
- **Link Online (Publik Internet / HP & Laptop di Luar Jaringan)**:  
  👉 **https://brooks-comply-experiments-cuisine.trycloudflare.com**  
  *(Didukung Cloudflare Enterprise Tunnel: Bebas Bad Gateway, tanpa halaman peringatan/password, langsung terbuka instan)*
- **Akses Lokal (WiFi Toko / HP di Jaringan Sama)**:  
  👉 **http://192.168.1.15:5000** atau **http://localhost:5173**

## 🚀 Kredensial Login Admin
- **Username**: `ZaynZulfi23`
- **Password**: `#Arafat23`

---

## 📌 Alur Fitur Utama
1. **Login**: Otentikasi Admin tunggal yang aman dengan token JWT.
2. **Dashboard**: Ringkasan metrik utama (**Total Produk**, **Transaksi Hari Ini**, **Pendapatan Hari Ini**, dan **Stok Menipis & Habis**), tabel stok kritis, serta riwayat transaksi kasir terkini.
3. **Data Barang**: CRUD lengkap (Tambah, Edit, Hapus), pencarian live search, filter kategori, badge status stok (Aman, Menipis, Habis), serta perhitungan otomatis estimasi laba per unit.
4. **Barang Masuk**: Pencatatan kulakan/restock barang. Stok toko otomatis bertambah di database, opsi pembaruan harga beli master, dan riwayat faktur masuk.
5. **Kasir / Transaksi (POS)**: Katalog produk interaktif, keranjang belanja, pencarian cepat, modal pembayaran (Tunai, QRIS, Transfer), tombol uang pas & pecahan cepat, kalkulasi kembalian otomatis, pengurangan stok atomik, dan cetak struk thermal / share WhatsApp.
6. **Stok Real-time**: Monitoring seluruh stok persediaan secara langsung, filter cepat (Habis, Menipis, Aman), estimasi nilai aset modal toko, serta fitur koreksi fisik (Stock Opname ringan).
7. **Laporan Harian**: Rekapitulasi jumlah transaksi, barang terjual, barang masuk, total omset pendapatan, dan estimasi laba kotor toko berdasarkan tanggal atau rentang kustom dengan fitur cetak laporan.

---

## 💻 Cara Menjalankan Project

### Cara Cepat (1-Klik di Windows):
Cukup klik ganda (double-click) file:
👉 `jalankan_sistem.bat`

### Cara Manual (Terminal):
1. **Pastikan MySQL di XAMPP Aktif** (Port 3306).
2. **Jalankan Backend**:
   ```bash
   cd backend
   npm start
   ```
   *(Backend aktif di `http://localhost:5000`)*

3. **Jalankan Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *(Frontend aktif di `http://localhost:5173`)*

---

## 📱 Cara Membuka dari HP / Smartphone di Jaringan yang Sama (WiFi Toko)

1. Pastikan Laptop dan HP terhubung ke **WiFi yang sama**.
2. Cek IP Address lokal laptop Anda (buka CMD, ketik `ipconfig`, cari *IPv4 Address*, misalnya: `192.168.1.15`).
3. Di browser HP Anda, buka alamat:
   ```
   http://192.168.1.15:5173
   ```
4. Sistem akan langsung terbuka dengan tampilan **Bottom Navigation** yang ramah sentuhan, dan dapat langsung memproses transaksi kasir serta cek stok dari genggaman Anda!

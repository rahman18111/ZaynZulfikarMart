# Panduan Hosting ZaynZulfikarStore

Panduan lengkap untuk meng-hosting website **ZaynZulfikarStore – Sistem Kasir & Manajemen Stok** agar siap digunakan online 24 jam di semua perangkat HP & Laptop.

---

## 🏗️ Struktur Sistem Full-Stack
Project ini sudah diatur dalam arsitektur **Single-Port Production**:
- **Backend (Node.js/Express)** otomatis menyajikan seluruh aset **Frontend React** yang sudah di-compile di folder `frontend/dist`.
- Anda hanya perlu menjalankan satu service server: `node backend/src/server.js`.
- Semua request API berjalan di `/api`, bebas dari masalah CORS di domain manapun!

---

## 🚀 Pilihan 1: Deploy Gratis 24 Jam di Cloud (Render.com)

Render.com menyediakan hosting gratis dengan domain custom seperti `https://zaynzulfikarstore.onrender.com`.

### Langkah-langkah:
1. **Upload ke GitHub:**
   - Buat repositori baru di [GitHub](https://github.com) bernama `ZaynZulfikarStore`.
   - Push project ini ke repositori tersebut.
2. **Siapkan Database MySQL Cloud:**
   - Gunakan database MySQL cloud gratis dari [Aiven.io](https://aiven.io) atau [TiDB Cloud](https://tidbcloud.com).
   - Buat database `zayn_zulfikar_store`, lalu import skema dari `backend/database/schema.sql`.
3. **Deploy di Render:**
   - Buat akun di [Render.com](https://render.com).
   - Klik **New +** → Pilih **Web Service**.
   - Hubungkan ke repositori GitHub `ZaynZulfikarStore`.
   - Isi konfigurasi:
     - **Name**: `zaynzulfikarstore` *(sehingga URL menjadi `https://zaynzulfikarstore.onrender.com`)*
     - **Environment**: `Node`
     - **Build Command**: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
     - **Start Command**: `node backend/src/server.js`
   - Di tab **Environment Variables**, tambahkan:
     - `PORT`: `5000`
     - `DB_HOST`: *(Host MySQL cloud Anda)*
     - `DB_USER`: *(User MySQL cloud Anda)*
     - `DB_PASSWORD`: *(Password MySQL cloud Anda)*
     - `DB_NAME`: `zayn_zulfikar_store`
     - `JWT_SECRET`: `zaynzulfikar_super_secret_jwt_key_2026_luxury_pos`
   - Klik **Create Web Service**. Website Anda akan langsung online dan siap digunakan di seluruh HP!

---

## 🏢 Pilihan 2: Deploy di cPanel / Shared Hosting (Node.js App)

Jika Anda memiliki hosting cPanel dengan fitur **Setup Node.js App**:
1. Masuk ke cPanel → Buka menu **Setup Node.js App**.
2. Klik **Create Application**:
   - **Node.js version**: Pilih versi `18.x` atau `20.x`.
   - **Application root**: `ZaynZulfikarStore`
   - **Application startup file**: `backend/src/server.js`
3. Upload file project (termasuk folder `frontend/dist` dan `backend`).
4. Buat database MySQL di cPanel via **MySQL Databases**, buat user dan password, lalu import `backend/database/schema.sql`.
5. Sesuaikan file `.env` di folder backend dengan detail database cPanel Anda.
6. Klik **Run NPM Install**, lalu klik **Restart Application**.
7. Website langsung aktif di domain toko Anda!

---

## 💻 Pilihan 3: Menjalankan di Toko Sendiri (Server Lokal Laptop / PC)

Ini adalah cara paling umum untuk toko fisik (Moka POS style), bebas biaya sewa server:
1. Pastikan **MySQL di XAMPP** aktif.
2. Klik ganda file:
   👉 **`jalankan_sistem.bat`**
3. Buka di Laptop:
   👉 **`http://localhost:5173`** atau **`http://localhost:5000`**
4. Buka di seluruh HP toko yang terhubung ke WiFi:
   👉 **`http://192.168.1.15:5000`**

---

## 🔑 Kredensial Administrator Toko
- **Username**: `ZaynZulfi23`
- **Password**: `#Arafat23`
*(Formulir login sekarang sudah bersih dan kosong, tidak menampilkan kredensial secara terbuka).*

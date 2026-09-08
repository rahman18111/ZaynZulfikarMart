<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ZaynZulfikarMart - Kasir & Stok Warung</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfdf5',
              100: '#d1fae5',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
              800: '#065f46',
              900: '#064e3b',
            }
          }
        }
      }
    }
  </script>
  
  <style>
    /* Mobile-first touch enhancements */
    body {
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    input, textarea, select {
      user-select: auto;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .pb-safe {
      padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen flex flex-col antialiased">

  <!-- ============================================================== -->
  <!-- TOP APP BAR                                                    -->
  <!-- ============================================================== -->
  <header class="bg-brand-700 text-white sticky top-0 z-30 shadow-md">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-600 border border-brand-500 flex items-center justify-center shadow-inner">
          <i class="fa-solid fa-shop text-lg text-emerald-200"></i>
        </div>
        <div>
          <h1 class="font-bold text-lg leading-tight tracking-wide flex items-center gap-1.5">
            ZaynZulfikarMart
          </h1>
          <p class="text-xs text-brand-200 font-medium">Kasir & Catatan Stok Warung</p>
        </div>
      </div>
      
      <!-- Date & Refresh -->
      <div class="flex items-center gap-2">
        <button onclick="refreshData()" title="Muat Ulang" class="w-8 h-8 rounded-full bg-brand-800 hover:bg-brand-900 active:scale-95 flex items-center justify-center text-brand-200 transition">
          <i class="fa-solid fa-rotate text-sm" id="refresh-icon"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- ============================================================== -->
  <!-- TOAST NOTIFICATION CONTAINER                                   -->
  <!-- ============================================================== -->
  <div id="toast-container" class="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md pointer-events-none flex flex-col gap-2"></div>

  <!-- ============================================================== -->
  <!-- MAIN CONTENT VIEWS CONTAINER                                   -->
  <!-- ============================================================== -->
  <main class="flex-1 max-w-2xl w-full mx-auto p-3.5 pb-safe">

    <!-- ============================================================ -->
    <!-- TAB 1: KASIR (BARANG KELUAR)                                  -->
    <!-- ============================================================ -->
    <section id="tab-kasir" class="tab-view space-y-4">
      
      <!-- Input Pencarian Cepat / Tambah Barang ke Bon -->
      <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          <i class="fa-solid fa-cart-plus text-brand-600 mr-1"></i> Masukkan Barang Belanjaan
        </label>
        
        <div class="relative">
          <input 
            type="text" 
            id="kasir-input-nama" 
            placeholder="Ketik nama barang (cth: Beras Ramos, Telur 1kg)..."
            autocomplete="off"
            class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            oninput="handleKasirSearch(this.value)"
            onkeydown="if(event.key === 'Enter') tambahBarangManualKeBon()"
          />
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
          <button 
            type="button" 
            onclick="document.getElementById('kasir-input-nama').value=''; hideKasirSuggestions();"
            class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm p-1"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Autocomplete Suggestions Dropdown -->
          <div id="kasir-suggestions" class="hidden absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-100"></div>
        </div>

        <!-- Tombol Tambah Cepat jika Barang Belum Ada di Database -->
        <div class="mt-2.5 flex items-center justify-between gap-2">
          <span class="text-xs text-slate-500 italic">Bisa ketik nama apa saja walau belum ada di stok</span>
          <button 
            type="button" 
            onclick="tambahBarangManualKeBon()"
            class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 text-brand-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-brand-200"
          >
            <i class="fa-solid fa-plus"></i> Tambah ke Bon
          </button>
        </div>
      </div>

      <!-- Daftar Keranjang Belanja (Items in Cart) -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center" id="cart-count">0</span>
            <h2 class="font-bold text-sm text-slate-700">Daftar Belanjaan (Barang Keluar)</h2>
          </div>
          <button 
            type="button" 
            onclick="kosongkanKeranjang()" 
            class="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 active:scale-95"
          >
            <i class="fa-regular fa-trash-can"></i> Kosongkan
          </button>
        </div>

        <!-- List Items -->
        <div id="cart-list" class="divide-y divide-slate-100 min-h-[140px] max-h-[340px] overflow-y-auto">
          <!-- Empty State -->
          <div id="cart-empty" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-basket-shopping text-4xl mb-2 text-slate-300"></i>
            <p class="text-xs font-medium">Belum ada barang di bon penjualan.</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Ketik nama barang di atas untuk menambahkan.</p>
          </div>
        </div>

        <!-- Ringkasan Total Belanja -->
        <div class="p-4 bg-emerald-50/70 border-t border-emerald-100">
          <div class="flex justify-between items-baseline mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Tagihan:</span>
            <span class="text-2xl font-black text-brand-700 tracking-tight" id="cart-grand-total">Rp 0</span>
          </div>

          <!-- Opsi Metode Bayar: Tunai / Kasbon -->
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button 
              type="button" 
              id="btn-metode-tunai" 
              onclick="setMetodeBayar('Tunai')"
              class="py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-brand-600 text-white border-brand-600 shadow-sm"
            >
              <i class="fa-solid fa-money-bill-wave"></i> Tunai (Lunas)
            </button>
            <button 
              type="button" 
              id="btn-metode-kasbon" 
              onclick="setMetodeBayar('Kasbon')"
              class="py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <i class="fa-solid fa-book-open"></i> Kasbon (Utang)
            </button>
          </div>

          <!-- Section Kasbon Fields (Hidden by default) -->
          <div id="kasbon-form-fields" class="hidden mb-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div>
              <label class="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Nama Pelanggan (Wajib):</label>
              <input 
                type="text" 
                id="kasir-nama-pelanggan" 
                placeholder="Contoh: Bu RT, Mas Doni, Pak Slamet..."
                class="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Catatan Tambahan (Opsional):</label>
              <input 
                type="text" 
                id="kasir-catatan-kasbon" 
                placeholder="Janji bayar hari Sabtu / titip anak..."
                class="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Section Pembayaran Tunai & Kembalian -->
          <div id="tunai-form-fields" class="space-y-2 mb-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Uang Diterima dari Pembeli:</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-sm text-slate-400 font-semibold">Rp</span>
                <input 
                  type="number" 
                  id="kasir-uang-bayar" 
                  inputmode="numeric" 
                  placeholder="0"
                  oninput="hitungKembalian()"
                  class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-base focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- Tombol Pecahan Cepat -->
            <div class="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 text-xs">
              <button type="button" onclick="setUangPas()" class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-semibold text-slate-700 whitespace-nowrap">Uang Pas</button>
              <button type="button" onclick="quickUang(10000)" class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-semibold text-slate-700 whitespace-nowrap">10k</button>
              <button type="button" onclick="quickUang(20000)" class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-semibold text-slate-700 whitespace-nowrap">20k</button>
              <button type="button" onclick="quickUang(50000)" class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-semibold text-slate-700 whitespace-nowrap">50k</button>
              <button type="button" onclick="quickUang(100000)" class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-semibold text-slate-700 whitespace-nowrap">100k</button>
            </div>

            <!-- Display Kembalian -->
            <div class="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
              <span class="text-xs font-semibold text-slate-500">Uang Kembalian:</span>
              <span class="text-lg font-bold text-slate-800" id="kasir-kembalian-display">Rp 0</span>
            </div>
          </div>

          <!-- Tombol Eksekusi Penjualan -->
          <button 
            type="button" 
            onclick="prosesTransaksiKeluar()"
            id="btn-simpan-transaksi"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm tracking-wide shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition"
          >
            <i class="fa-solid fa-check-circle text-base"></i> SIMPAN BARANG KELUAR
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB 2: SISA STOK (INVENTORY)                                  -->
    <!-- ============================================================ -->
    <section id="tab-stok" class="tab-view hidden space-y-4">
      <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <!-- Search & Filter -->
        <div class="relative">
          <input 
            type="text" 
            id="stok-search-input" 
            placeholder="Cari sisa stok barang..."
            oninput="filterDaftarStok(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
          />
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        </div>

        <div class="flex items-center justify-between text-xs">
          <div class="flex gap-1.5">
            <button 
              id="filter-stok-semua" 
              onclick="setFilterStokMode('semua')" 
              class="px-2.5 py-1 rounded-lg font-semibold bg-brand-600 text-white"
            >Semua (<span id="total-semua-barang">0</span>)</button>
            <button 
              id="filter-stok-menipis" 
              onclick="setFilterStokMode('menipis')" 
              class="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
            >⚠️ Menipis (<span id="total-stok-menipis">0</span>)</button>
          </div>
          
          <button 
            type="button" 
            onclick="switchTab('masuk')" 
            class="text-xs text-brand-600 font-bold flex items-center gap-1 active:scale-95"
          >
            <i class="fa-solid fa-plus-circle"></i> Kulakan
          </button>
        </div>
      </div>

      <!-- List Kartu Stok Barang -->
      <div id="stok-container" class="space-y-2">
        <div class="p-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
          <p class="text-xs">Memuat data stok barang...</p>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB 3: BARANG MASUK (KULAKAN / RESTOCK)                       -->
    <!-- ============================================================ -->
    <section id="tab-masuk" class="tab-view hidden space-y-4">
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-brand-700 flex items-center justify-center font-bold">
            <i class="fa-solid fa-boxes-stacked text-sm"></i>
          </div>
          <div>
            <h2 class="font-bold text-sm text-slate-800 leading-tight">Catat Barang Masuk (Kulakan)</h2>
            <p class="text-[11px] text-slate-400">Menambah stok barang baru atau yang sudah ada</p>
          </div>
        </div>

        <form id="form-barang-masuk" onsubmit="handleFormBarangMasuk(event)" class="space-y-3">
          <!-- Nama Barang -->
          <div class="relative">
            <label class="block text-xs font-bold text-slate-600 mb-1">Nama Barang <span class="text-rose-500">*</span></label>
            <input 
              type="text" 
              id="masuk-nama-barang" 
              required
              placeholder="Ketik nama barang yang baru dibeli..."
              autocomplete="off"
              oninput="handleMasukSuggestions(this.value)"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
            />
            <div id="masuk-suggestions" class="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100"></div>
          </div>

          <!-- Grid Jumlah & Satuan -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Jumlah Masuk <span class="text-rose-500">*</span></label>
              <input 
                type="number" 
                id="masuk-qty" 
                required 
                min="0.1" 
                step="any"
                inputmode="decimal" 
                placeholder="10"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Satuan</label>
              <select 
                id="masuk-satuan" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              >
                <option value="pcs">pcs (biji/satuan)</option>
                <option value="bungkus">bungkus</option>
                <option value="renceng">renceng</option>
                <option value="kg">kg (kiloan)</option>
                <option value="liter">liter</option>
                <option value="botol">botol</option>
                <option value="kaleng">kaleng</option>
                <option value="dus">dus / kardus</option>
                <option value="ikat">ikat</option>
              </select>
            </div>
          </div>

          <!-- Grid Harga Modal & Harga Jual -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Harga Beli/Modal (per satuan)</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-xs text-slate-400 font-bold">Rp</span>
                <input 
                  type="number" 
                  id="masuk-harga-modal" 
                  inputmode="numeric" 
                  placeholder="0"
                  class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Harga Jual (ke pembeli)</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-xs text-slate-400 font-bold">Rp</span>
                <input 
                  type="number" 
                  id="masuk-harga-jual" 
                  inputmode="numeric" 
                  placeholder="0"
                  class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Kategori & Keterangan -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
              <select 
                id="masuk-kategori" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              >
                <option value="Sembako">Sembako</option>
                <option value="Minuman">Minuman</option>
                <option value="Makanan">Makanan Ringan</option>
                <option value="Sabun/Pembersih">Sabun/Pembersih</option>
                <option value="Rokok">Rokok</option>
                <option value="Bumbu Dapur">Bumbu Dapur</option>
                <option value="Umum" selected>Lain-lain / Umum</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Catatan / Kulakan Dari</label>
              <input 
                type="text" 
                id="masuk-keterangan" 
                placeholder="cth: Pasar / Agen Bintang"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="btn-submit-masuk"
            class="w-full py-3 mt-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <i class="fa-solid fa-arrow-down-to-bracket"></i> SIMPAN BARANG MASUK
          </button>
        </form>
      </div>

      <!-- Riwayat Terakhir Barang Masuk -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Riwayat Barang Masuk Terkini</span>
          <button onclick="loadRiwayatStokMasuk()" class="text-[11px] text-brand-600 font-semibold hover:underline">Refresh</button>
        </h3>
        <div id="riwayat-masuk-list" class="divide-y divide-slate-100 text-xs text-slate-600">
          <p class="text-slate-400 py-3 text-center italic">Memuat riwayat...</p>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB 4: BUKU KASBON (UTANG PELANGGAN)                           -->
    <!-- ============================================================ -->
    <section id="tab-kasbon" class="tab-view hidden space-y-4">
      <!-- Card Summary Kasbon -->
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-amber-100 font-medium">Total Utang Pelanggan Menggantung:</p>
            <h2 class="text-2xl font-black tracking-tight" id="kasbon-total-menggantung">Rp 0</h2>
          </div>
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-white/20 text-xs text-amber-100 flex items-center justify-between">
          <span>Total Faktur Belum Lunas:</span>
          <span class="font-bold text-white" id="kasbon-total-faktur">0 Faktur</span>
        </div>
      </div>

      <!-- Toggle Pelanggan vs Riwayat Faktur -->
      <div class="flex gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
        <button 
          id="btn-kasbon-sub-pelanggan"
          onclick="switchKasbonSub('pelanggan')" 
          class="flex-1 py-1.5 rounded-lg bg-white shadow-xs text-slate-800 transition"
        >Per Orang / Pelanggan</button>
        <button 
          id="btn-kasbon-sub-faktur"
          onclick="switchKasbonSub('faktur')" 
          class="flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition"
        >Daftar Bon Lengkap</button>
      </div>

      <!-- Container Per Pelanggan -->
      <div id="kasbon-pelanggan-container" class="space-y-2.5">
        <!-- Rendered by JS -->
      </div>

      <!-- Container Per Faktur -->
      <div id="kasbon-faktur-container" class="hidden space-y-2.5">
        <!-- Rendered by JS -->
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB 5: LAPORAN & TUTUP BUKU HARIAN                           -->
    <!-- ============================================================ -->
    <section id="tab-laporan" class="tab-view hidden space-y-4">
      <!-- Date Filter -->
      <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <i class="fa-regular fa-calendar-days text-brand-600"></i> Tanggal:
        </label>
        <input 
          type="date" 
          id="laporan-tanggal-picker"
          onchange="loadLaporanHarian(this.value)"
          class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <!-- 4 Ringkasan Metrik Keuangan -->
      <div class="grid grid-cols-2 gap-2.5">
        <!-- Omset -->
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Penjualan</p>
          <h3 class="text-lg font-extrabold text-brand-700 mt-1" id="lap-omset">Rp 0</h3>
          <p class="text-[10px] text-slate-400 mt-0.5"><span id="lap-trx-count">0</span> Transaksi</p>
        </div>

        <!-- Uang Kas Tunai -->
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uang Fisik Kasir</p>
          <h3 class="text-lg font-extrabold text-emerald-600 mt-1" id="lap-tunai">Rp 0</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">Uang tunai di laci</p>
        </div>

        <!-- Estimasi Laba Kotor -->
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Keuntungan Bersih</p>
          <h3 class="text-lg font-extrabold text-indigo-600 mt-1" id="lap-laba">Rp 0</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">Penjualan - Modal</p>
        </div>

        <!-- Kasbon Baru -->
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utang Baru Hari Ini</p>
          <h3 class="text-lg font-extrabold text-amber-600 mt-1" id="lap-kasbon-baru">Rp 0</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">Belum lunas</p>
        </div>
      </div>

      <!-- Barang Terlaris Hari Ini -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <i class="fa-solid fa-fire text-amber-500"></i> Barang Paling Laris Hari Ini
        </h4>
        <div id="lap-top-produk" class="divide-y divide-slate-100 text-xs">
          <p class="text-slate-400 py-2 italic text-center">Belum ada data penjualan hari ini.</p>
        </div>
      </div>

      <!-- Daftar Riwayat Penjualan Lengkap Hari Ini -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <i class="fa-solid fa-receipt text-slate-400"></i> Riwayat Transaksi Hari Ini
        </h4>
        <div id="lap-riwayat-transaksi" class="divide-y divide-slate-100 text-xs space-y-2">
          <p class="text-slate-400 py-3 text-center italic">Memuat riwayat...</p>
        </div>
      </div>
    </section>

  </main>

  <!-- ============================================================== -->
  <!-- MODAL: DETAIL STRUK TRANSAKSI                                  -->
  <!-- ============================================================== -->
  <div id="modal-struk" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
      <!-- Struk Header -->
      <div class="p-4 bg-brand-700 text-white flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base leading-tight">Struk Penjualan</h3>
          <p class="text-[11px] text-brand-200" id="struk-kode">ZJM-2026-...</p>
        </div>
        <button onclick="closeModalStruk()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Struk Body (Paper Style) -->
      <div class="p-4 overflow-y-auto font-mono text-xs text-slate-700 space-y-3">
        <div class="text-center border-b pb-2 border-slate-200">
          <h4 class="font-bold text-sm text-slate-900">ZaynZulfikarMart</h4>
          <p class="text-[11px] text-slate-500">Warung & Toko Kelontong</p>
          <p class="text-[10px] text-slate-400" id="struk-tanggal"></p>
        </div>

        <div class="border-b pb-2 border-slate-200 space-y-1.5" id="struk-items">
          <!-- Rendered Items -->
        </div>

        <div class="space-y-1 text-xs">
          <div class="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL:</span>
            <span id="struk-total">Rp 0</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Uang Bayar:</span>
            <span id="struk-bayar">Rp 0</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Kembalian:</span>
            <span id="struk-kembalian">Rp 0</span>
          </div>
          <div class="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
            <span>Metode:</span>
            <span class="font-semibold" id="struk-metode">Tunai</span>
          </div>
        </div>

        <div class="text-center pt-2 text-[10px] text-slate-400">
          *** Terima Kasih Telah Berbelanja ***
        </div>
      </div>

      <!-- Struk Footer Buttons -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
        <button 
          onclick="shareStrukWhatsApp()" 
          class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <i class="fa-brands fa-whatsapp text-sm"></i> Kirim WhatsApp
        </button>
        <button 
          onclick="window.print()" 
          class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center"
        >
          <i class="fa-solid fa-print"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- MODAL: EDIT & PENYESUAIAN STOK                                 -->
  <!-- ============================================================== -->
  <div id="modal-edit-stok" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-4 space-y-3">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-bold text-sm text-slate-800" id="edit-modal-title">Edit Barang / Stok</h3>
        <button onclick="closeModalEdit()" class="text-slate-400 hover:text-slate-600 p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <input type="hidden" id="edit-barang-id" />

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Nama Barang</label>
        <input type="text" id="edit-nama-barang" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Harga Modal</label>
          <input type="number" id="edit-harga-modal" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Harga Jual</label>
          <input type="number" id="edit-harga-jual" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none" />
        </div>
      </div>

      <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
        <label class="block text-[11px] font-bold text-amber-900 uppercase">Koreksi Jumlah Stok Fisik:</label>
        <div class="flex items-center gap-2">
          <input type="number" id="edit-stok-fisik" class="w-24 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold" />
          <span class="text-xs text-slate-500" id="edit-satuan-label">pcs</span>
        </div>
        <input type="text" id="edit-alasan-stok" placeholder="Alasan (cth: Barang rusak/kedaluwarsa/selisih)" class="w-full px-2.5 py-1 text-[11px] bg-white border border-amber-200 rounded-lg" />
      </div>

      <div class="flex gap-2 pt-2">
        <button onclick="hapusBarangDariDatabase()" class="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
        <button onclick="simpanPerubahanBarang()" class="flex-1 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
          Simpan Perubahan
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- BOTTOM FIXED NAVIGATION BAR (MOBILE FIRST)                     -->
  <!-- ============================================================== -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
    <div class="max-w-2xl mx-auto flex items-center justify-around px-1 py-1.5">
      
      <!-- Nav 1: Kasir -->
      <button 
        onclick="switchTab('kasir')" 
        id="nav-btn-kasir" 
        class="nav-tab-btn flex-1 flex flex-col items-center justify-center py-1 text-brand-600 font-bold transition active:scale-95"
      >
        <i class="fa-solid fa-cash-register text-lg mb-0.5"></i>
        <span class="text-[10px] tracking-tight">Kasir</span>
      </button>

      <!-- Nav 2: Sisa Stok -->
      <button 
        onclick="switchTab('stok')" 
        id="nav-btn-stok" 
        class="nav-tab-btn flex-1 flex flex-col items-center justify-center py-1 text-slate-400 font-medium hover:text-slate-600 transition active:scale-95"
      >
        <i class="fa-solid fa-warehouse text-lg mb-0.5"></i>
        <span class="text-[10px] tracking-tight">Stok</span>
      </button>

      <!-- Nav 3: Barang Masuk (Restock) -->
      <button 
        onclick="switchTab('masuk')" 
        id="nav-btn-masuk" 
        class="nav-tab-btn flex-1 flex flex-col items-center justify-center py-1 text-slate-400 font-medium hover:text-slate-600 transition active:scale-95"
      >
        <div class="w-8 h-8 -mt-3 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/40">
          <i class="fa-solid fa-plus text-sm"></i>
        </div>
        <span class="text-[10px] tracking-tight text-brand-700 font-bold">Masuk</span>
      </button>

      <!-- Nav 4: Kasbon -->
      <button 
        onclick="switchTab('kasbon')" 
        id="nav-btn-kasbon" 
        class="nav-tab-btn flex-1 flex flex-col items-center justify-center py-1 text-slate-400 font-medium hover:text-slate-600 transition active:scale-95 relative"
      >
        <i class="fa-solid fa-hand-holding-dollar text-lg mb-0.5"></i>
        <span class="text-[10px] tracking-tight">Kasbon</span>
        <span id="nav-kasbon-badge" class="hidden absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500"></span>
      </button>

      <!-- Nav 5: Laporan -->
      <button 
        onclick="switchTab('laporan')" 
        id="nav-btn-laporan" 
        class="nav-tab-btn flex-1 flex flex-col items-center justify-center py-1 text-slate-400 font-medium hover:text-slate-600 transition active:scale-95"
      >
        <i class="fa-solid fa-chart-pie text-lg mb-0.5"></i>
        <span class="text-[10px] tracking-tight">Laporan</span>
      </button>

    </div>
  </nav>

  <!-- ============================================================== -->
  <!-- JAVASCRIPT LOGIC (ROBUST, ZERO EXTERNAL DEPENDENCY)            -->
  <!-- ============================================================== -->
  <script>
    // Global State
    let cart = [];
    let allBarang = [];
    let activeMetodeBayar = 'Tunai';
    let currentTab = 'kasir';
    let lastGeneratedTrx = null;

    // Set today's date in picker
    document.addEventListener('DOMContentLoaded', () => {
      const today = new Date().toISOString().split('T')[0];
      const picker = document.getElementById('laporan-tanggal-picker');
      if (picker) picker.value = today;

      loadSemuaBarang();
      loadKasbon();
    });

    // ============================================================
    // TAB SWITCHING
    // ============================================================
    function switchTab(tabName) {
      currentTab = tabName;
      document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
      const activeEl = document.getElementById(`tab-${tabName}`);
      if (activeEl) activeEl.classList.remove('hidden');

      // Update Nav Buttons
      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('text-brand-600', 'font-bold');
        btn.classList.add('text-slate-400', 'font-medium');
      });
      const activeBtn = document.getElementById(`nav-btn-${tabName}`);
      if (activeBtn) {
        activeBtn.classList.add('text-brand-600', 'font-bold');
        activeBtn.classList.remove('text-slate-400', 'font-medium');
      }

      // Trigger loads per tab
      if (tabName === 'stok') renderDaftarStok();
      if (tabName === 'masuk') loadRiwayatStokMasuk();
      if (tabName === 'kasbon') loadKasbon();
      if (tabName === 'laporan') {
        const tgl = document.getElementById('laporan-tanggal-picker').value || new Date().toISOString().split('T')[0];
        loadLaporanHarian(tgl);
      }
    }

    function refreshData() {
      const icon = document.getElementById('refresh-icon');
      icon.classList.add('fa-spin');
      loadSemuaBarang(() => {
        loadKasbon();
        if (currentTab === 'laporan') {
          const tgl = document.getElementById('laporan-tanggal-picker').value;
          loadLaporanHarian(tgl);
        }
        setTimeout(() => icon.classList.remove('fa-spin'), 600);
        showToast('Data berhasil diperbarui', 'info');
      });
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const bgColors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-slate-800 text-white'
      };

      const icons = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
      };

      toast.className = `${bgColors[type] || bgColors.success} px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0`;
      toast.innerHTML = `<i class="fa-solid ${icons[type]} text-sm"></i> <span>${message}</span>`;
      container.appendChild(toast);

      // Animate In
      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      // Auto Dismiss
      setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // ============================================================
    // API CALLS: BARANG & STOK
    // ============================================================
    async function loadSemuaBarang(callback) {
      try {
        const res = await fetch('api/barang.php?action=list');
        const json = await res.json();
        if (json.success) {
          allBarang = json.data || [];
          document.getElementById('total-semua-barang').textContent = allBarang.length;
          
          const menipis = allBarang.filter(b => Number(b.stok) <= Number(b.stok_minimum)).length;
          document.getElementById('total-stok-menipis').textContent = menipis;

          if (currentTab === 'stok') renderDaftarStok();
        }
      } catch (err) {
        console.error('Error load barang:', err);
      } finally {
        if (callback) callback();
      }
    }

    // ============================================================
    // KASIR: SEARCH & AUTOCOMPLETE
    // ============================================================
    function handleKasirSearch(val) {
      const q = val.trim().toLowerCase();
      const box = document.getElementById('kasir-suggestions');
      if (q.length === 0) {
        box.classList.add('hidden');
        return;
      }

      const matches = allBarang.filter(b => b.nama_barang.toLowerCase().includes(q)).slice(0, 8);
      if (matches.length === 0) {
        box.innerHTML = `
          <div class="p-3 text-xs text-slate-400 text-center italic">
            Barang belum terdaftar. Tekan <b>"Tambah ke Bon"</b> untuk langsung mencatat.
          </div>
        `;
        box.classList.remove('hidden');
        return;
      }

      box.innerHTML = matches.map(m => `
        <div 
          onclick="tambahBarangDariPilihan(${m.id})"
          class="p-2.5 hover:bg-emerald-50 active:bg-emerald-100 cursor-pointer flex items-center justify-between transition"
        >
          <div>
            <div class="font-bold text-xs text-slate-800">${m.nama_barang}</div>
            <div class="text-[10px] text-slate-400">Stok sisa: <span class="font-bold ${Number(m.stok) <= Number(m.stok_minimum) ? 'text-rose-500' : 'text-emerald-600'}">${m.stok} ${m.satuan}</span></div>
          </div>
          <div class="text-right">
            <div class="font-bold text-xs text-brand-700">${formatRupiah(m.harga_jual)}</div>
            <div class="text-[9px] text-slate-400">Modal: ${formatRupiah(m.harga_modal)}</div>
          </div>
        </div>
      `).join('');
      box.classList.remove('hidden');
    }

    function hideKasirSuggestions() {
      setTimeout(() => {
        document.getElementById('kasir-suggestions').classList.add('hidden');
      }, 200);
    }

    function tambahBarangDariPilihan(id) {
      const b = allBarang.find(x => x.id == id);
      if (!b) return;

      const existingIndex = cart.findIndex(c => c.barang_id == id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({
          barang_id: b.id,
          nama_barang: b.nama_barang,
          satuan: b.satuan,
          qty: 1,
          harga_modal: Number(b.harga_modal) || 0,
          harga_jual: Number(b.harga_jual) || 0,
          stok_tersedia: Number(b.stok)
        });
      }

      document.getElementById('kasir-input-nama').value = '';
      hideKasirSuggestions();
      renderCart();
      showToast(`+1 ${b.nama_barang}`);
    }

    function tambahBarangManualKeBon() {
      const input = document.getElementById('kasir-input-nama');
      const nama = input.value.trim();
      if (!nama) {
        showToast('Ketik nama barang terlebih dahulu', 'warning');
        return;
      }

      // Check if matches existing in DB
      const existing = allBarang.find(b => b.nama_barang.toLowerCase() === nama.toLowerCase());
      if (existing) {
        tambahBarangDariPilihan(existing.id);
        return;
      }

      // Insert as free manual item
      cart.push({
        barang_id: null,
        nama_barang: nama,
        satuan: 'pcs',
        qty: 1,
        harga_modal: 0,
        harga_jual: 0,
        stok_tersedia: null
      });

      input.value = '';
      hideKasirSuggestions();
      renderCart();
      showToast(`Ditambahkan: ${nama}`);
    }

    // ============================================================
    // KASIR: CART MANAGEMENT & CALCULATION
    // ============================================================
    function renderCart() {
      const list = document.getElementById('cart-list');
      const emptyState = document.getElementById('cart-empty');
      const countEl = document.getElementById('cart-count');
      const totalEl = document.getElementById('cart-grand-total');

      countEl.textContent = cart.length;

      if (cart.length === 0) {
        list.innerHTML = '';
        list.appendChild(emptyState);
        totalEl.textContent = 'Rp 0';
        hitungKembalian();
        return;
      }

      let grandTotal = 0;

      list.innerHTML = cart.map((item, idx) => {
        const subtotal = item.qty * item.harga_jual;
        grandTotal += subtotal;

        return `
          <div class="p-3 flex items-center justify-between gap-2">
            <!-- Left: Info -->
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-800 truncate">${item.nama_barang}</h4>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] text-slate-400">Harga:</span>
                <div class="relative w-24">
                  <input 
                    type="number" 
                    value="${item.harga_jual}" 
                    inputmode="numeric"
                    onchange="updateCartItemHarga(${idx}, this.value)"
                    class="w-full px-1.5 py-0.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded text-slate-700"
                  />
                </div>
                <span class="text-[10px] text-slate-400">/${item.satuan}</span>
              </div>
            </div>

            <!-- Middle: Qty Controller -->
            <div class="flex items-center gap-1">
              <button 
                type="button" 
                onclick="updateCartItemQty(${idx}, -1)" 
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs"
              >-</button>
              <input 
                type="number" 
                value="${item.qty}" 
                min="0.1" 
                step="any"
                inputmode="decimal"
                onchange="setCartItemQty(${idx}, this.value)"
                class="w-10 text-center text-xs font-bold bg-transparent border-b border-slate-300 py-0.5"
              />
              <button 
                type="button" 
                onclick="updateCartItemQty(${idx}, 1)" 
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs"
              >+</button>
            </div>

            <!-- Right: Subtotal & Delete -->
            <div class="text-right min-w-[70px]">
              <div class="font-black text-xs text-brand-700">${formatRupiah(subtotal)}</div>
              <button 
                type="button" 
                onclick="hapusCartItem(${idx})"
                class="text-[11px] text-rose-400 hover:text-rose-600 mt-1 p-0.5"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      totalEl.textContent = formatRupiah(grandTotal);
      hitungKembalian();
    }

    function updateCartItemQty(idx, delta) {
      if (!cart[idx]) return;
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      renderCart();
    }

    function setCartItemQty(idx, val) {
      if (!cart[idx]) return;
      const q = parseFloat(val);
      if (isNaN(q) || q <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = q;
      }
      renderCart();
    }

    function updateCartItemHarga(idx, val) {
      if (!cart[idx]) return;
      const h = parseFloat(val) || 0;
      cart[idx].harga_jual = h;
      renderCart();
    }

    function hapusCartItem(idx) {
      cart.splice(idx, 1);
      renderCart();
    }

    function kosongkanKeranjang() {
      if (cart.length === 0) return;
      if (confirm('Yakin ingin mengosongkan daftar belanjaan?')) {
        cart = [];
        renderCart();
      }
    }

    // ============================================================
    // KASIR: PEMBAYARAN & KEMBALIAN
    // ============================================================
    function setMetodeBayar(metode) {
      activeMetodeBayar = metode;
      const btnTunai = document.getElementById('btn-metode-tunai');
      const btnKasbon = document.getElementById('btn-metode-kasbon');
      const tunaiFields = document.getElementById('tunai-form-fields');
      const kasbonFields = document.getElementById('kasbon-form-fields');

      if (metode === 'Tunai') {
        btnTunai.className = "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-brand-600 text-white border-brand-600 shadow-sm";
        btnKasbon.className = "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-white text-amber-600 border-amber-300 hover:bg-amber-50";
        tunaiFields.classList.remove('hidden');
        kasbonFields.classList.add('hidden');
      } else {
        btnKasbon.className = "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-amber-600 text-white border-amber-600 shadow-sm";
        btnTunai.className = "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition bg-white text-brand-600 border-brand-300 hover:bg-brand-50";
        tunaiFields.classList.add('hidden');
        kasbonFields.classList.remove('hidden');
      }
    }

    function getCartTotal() {
      return cart.reduce((sum, item) => sum + (item.qty * item.harga_jual), 0);
    }

    function hitungKembalian() {
      const total = getCartTotal();
      const uangInput = document.getElementById('kasir-uang-bayar');
      const uangVal = parseFloat(uangInput.value) || 0;
      const display = document.getElementById('kasir-kembalian-display');

      if (uangVal === 0) {
        display.textContent = 'Rp 0';
        display.className = "text-lg font-bold text-slate-800";
        return;
      }

      const kembalian = uangVal - total;
      if (kembalian >= 0) {
        display.textContent = formatRupiah(kembalian);
        display.className = "text-lg font-bold text-emerald-600";
      } else {
        display.textContent = `Kurang ${formatRupiah(Math.abs(kembalian))}`;
        display.className = "text-lg font-bold text-rose-500";
      }
    }

    function setUangPas() {
      const total = getCartTotal();
      document.getElementById('kasir-uang-bayar').value = total;
      hitungKembalian();
    }

    function quickUang(nominal) {
      document.getElementById('kasir-uang-bayar').value = nominal;
      hitungKembalian();
    }

    // ============================================================
    // KASIR: PROSES SIMPAN TRANSAKSI (BARANG KELUAR)
    // ============================================================
    async function prosesTransaksiKeluar() {
      if (cart.length === 0) {
        showToast('Keranjang masih kosong!', 'warning');
        return;
      }

      const total = getCartTotal();
      let uangBayar = parseFloat(document.getElementById('kasir-uang-bayar').value) || 0;
      const namaPelanggan = document.getElementById('kasir-nama-pelanggan').value.trim();
      const catatanKasbon = document.getElementById('kasir-catatan-kasbon').value.trim();

      if (activeMetodeBayar === 'Kasbon' && !namaPelanggan) {
        showToast('Wajib isi Nama Pelanggan untuk kasbon!', 'warning');
        document.getElementById('kasir-nama-pelanggan').focus();
        return;
      }

      if (activeMetodeBayar === 'Tunai' && uangBayar > 0 && uangBayar < total) {
        if (!confirm(`Uang bayar (Rp ${uangBayar}) kurang dari total tagihan (Rp ${total}). Mau jadikan kasbon?`)) {
          return;
        }
      }

      if (activeMetodeBayar === 'Tunai' && uangBayar === 0) {
        uangBayar = total; // default uang pas
      }

      const btn = document.getElementById('btn-simpan-transaksi');
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

      try {
        const payload = {
          items: cart,
          metode_bayar: activeMetodeBayar,
          nama_pelanggan: namaPelanggan,
          catatan: catatanKasbon,
          uang_bayar: uangBayar
        };

        const res = await fetch('api/transaksi.php?action=keluar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          showToast('Penjualan tersimpan & stok terpotong!', 'success');
          
          // Show Struk Modal
          lastGeneratedTrx = {
            kode: json.data.kode_transaksi,
            tanggal: new Date().toLocaleString('id-ID'),
            items: [...cart],
            total: json.data.total_belanja,
            bayar: json.data.uang_bayar,
            kembalian: json.data.kembalian,
            metode: json.data.metode_bayar,
            pelanggan: namaPelanggan
          };

          bukaModalStruk(lastGeneratedTrx);

          // Reset Form
          cart = [];
          document.getElementById('kasir-uang-bayar').value = '';
          document.getElementById('kasir-nama-pelanggan').value = '';
          document.getElementById('kasir-catatan-kasbon').value = '';
          setMetodeBayar('Tunai');
          renderCart();

          // Refresh DB
          loadSemuaBarang();
          loadKasbon();
        } else {
          showToast(json.message || 'Gagal menyimpan transaksi', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan koneksi server', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check-circle text-base"></i> SIMPAN BARANG KELUAR`;
      }
    }

    // ============================================================
    // MODAL STRUK & WHATSAPP SHARE
    // ============================================================
    function bukaModalStruk(trx) {
      document.getElementById('struk-kode').textContent = trx.kode;
      document.getElementById('struk-tanggal').textContent = trx.tanggal;
      document.getElementById('struk-total').textContent = formatRupiah(trx.total);
      document.getElementById('struk-bayar').textContent = formatRupiah(trx.bayar);
      document.getElementById('struk-kembalian').textContent = formatRupiah(trx.kembalian);
      document.getElementById('struk-metode').textContent = trx.metode + (trx.pelanggan ? ` (${trx.pelanggan})` : '');

      const itemsContainer = document.getElementById('struk-items');
      itemsContainer.innerHTML = trx.items.map(it => `
        <div class="flex justify-between">
          <span>${it.nama_barang} x${it.qty}</span>
          <span>${formatRupiah(it.qty * it.harga_jual)}</span>
        </div>
      `).join('');

      const modal = document.getElementById('modal-struk');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeModalStruk() {
      const modal = document.getElementById('modal-struk');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function shareStrukWhatsApp() {
      if (!lastGeneratedTrx) return;
      const t = lastGeneratedTrx;
      let text = `*NOTA PEMBELIAN - ZAYNZULFIKAR MART*\n`;
      text += `No: ${t.kode}\n`;
      text += `Tgl: ${t.tanggal}\n`;
      if (t.pelanggan) text += `Pelanggan: ${t.pelanggan}\n`;
      text += `--------------------------------\n`;
      t.items.forEach(it => {
        text += `${it.nama_barang}\n  ${it.qty} x ${formatRupiah(it.harga_jual)} = ${formatRupiah(it.qty * it.harga_jual)}\n`;
      });
      text += `--------------------------------\n`;
      text += `*TOTAL: ${formatRupiah(t.total)}*\n`;
      text += `Bayar: ${formatRupiah(t.bayar)}\n`;
      text += `Kembalian: ${formatRupiah(t.kembalian)}\n`;
      text += `Status: ${t.metode}\n\n`;
      text += `Terima kasih telah berbelanja di ZaynZulfikarMart!`;

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }

    // ============================================================
    // TAB SISA STOK
    // ============================================================
    let filterStokMode = 'semua';

    function setFilterStokMode(mode) {
      filterStokMode = mode;
      const btnSemua = document.getElementById('filter-stok-semua');
      const btnMenipis = document.getElementById('filter-stok-menipis');

      if (mode === 'semua') {
        btnSemua.className = "px-2.5 py-1 rounded-lg font-semibold bg-brand-600 text-white";
        btnMenipis.className = "px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200";
      } else {
        btnMenipis.className = "px-2.5 py-1 rounded-lg font-semibold bg-amber-500 text-white";
        btnSemua.className = "px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200";
      }
      renderDaftarStok();
    }

    function filterDaftarStok() {
      renderDaftarStok();
    }

    function renderDaftarStok() {
      const container = document.getElementById('stok-container');
      const searchVal = (document.getElementById('stok-search-input').value || '').trim().toLowerCase();

      let items = allBarang;
      if (filterStokMode === 'menipis') {
        items = items.filter(b => Number(b.stok) <= Number(b.stok_minimum));
      }

      if (searchVal) {
        items = items.filter(b => b.nama_barang.toLowerCase().includes(searchVal));
      }

      if (items.length === 0) {
        container.innerHTML = `
          <div class="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
            <i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i>
            <p class="text-xs font-semibold">Tidak ada barang yang cocok.</p>
            <p class="text-[11px] text-slate-400 mt-1">Buka menu "Barang Masuk" untuk menambah stok baru.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(b => {
        const sisa = Number(b.stok);
        const min = Number(b.stok_minimum);
        let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
        let statusText = "Aman";

        if (sisa <= 0) {
          badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
          statusText = "Habis";
        } else if (sisa <= min) {
          badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
          statusText = "Menipis";
        }

        return `
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeClass}">${statusText}</span>
                <span class="text-[10px] text-slate-400">${b.kategori || 'Umum'}</span>
              </div>
              <h4 class="font-bold text-xs text-slate-800 truncate">${b.nama_barang}</h4>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-xs font-extrabold text-brand-700">${formatRupiah(b.harga_jual)}</span>
                <span class="text-[10px] text-slate-400">Modal: ${formatRupiah(b.harga_modal)}</span>
              </div>
            </div>

            <!-- Stok & Edit Action -->
            <div class="text-right flex items-center gap-2">
              <div class="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                <div class="text-sm font-black text-slate-800">${sisa}</div>
                <div class="text-[9px] text-slate-400 uppercase font-semibold">${b.satuan}</div>
              </div>
              <button 
                onclick="bukaModalEdit(${b.id})" 
                class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 text-xs transition"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // ============================================================
    // TAB BARANG MASUK (KULAKAN)
    // ============================================================
    function handleMasukSuggestions(val) {
      const q = val.trim().toLowerCase();
      const box = document.getElementById('masuk-suggestions');
      if (!q) {
        box.classList.add('hidden');
        return;
      }

      const matches = allBarang.filter(b => b.nama_barang.toLowerCase().includes(q)).slice(0, 6);
      if (matches.length === 0) {
        box.classList.add('hidden');
        return;
      }

      box.innerHTML = matches.map(m => `
        <div 
          onclick="pilihBarangUntukRestock(${m.id})"
          class="p-2.5 hover:bg-emerald-50 active:bg-emerald-100 cursor-pointer text-xs transition flex justify-between"
        >
          <div>
            <span class="font-bold text-slate-800">${m.nama_barang}</span>
            <span class="text-[10px] text-slate-400 ml-1">(${m.satuan})</span>
          </div>
          <span class="text-slate-500 font-semibold">${formatRupiah(m.harga_modal)}</span>
        </div>
      `).join('');
      box.classList.remove('hidden');
    }

    function pilihBarangUntukRestock(id) {
      const b = allBarang.find(x => x.id == id);
      if (!b) return;

      document.getElementById('masuk-nama-barang').value = b.nama_barang;
      document.getElementById('masuk-satuan').value = b.satuan || 'pcs';
      document.getElementById('masuk-harga-modal').value = b.harga_modal || '';
      document.getElementById('masuk-harga-jual').value = b.harga_jual || '';
      document.getElementById('masuk-kategori').value = b.kategori || 'Umum';
      document.getElementById('masuk-suggestions').classList.add('hidden');
      document.getElementById('masuk-qty').focus();
    }

    async function handleFormBarangMasuk(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-masuk');
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

      const payload = {
        nama_barang: document.getElementById('masuk-nama-barang').value.trim(),
        qty_masuk: parseFloat(document.getElementById('masuk-qty').value),
        satuan: document.getElementById('masuk-satuan').value,
        harga_modal: parseFloat(document.getElementById('masuk-harga-modal').value) || 0,
        harga_jual: parseFloat(document.getElementById('masuk-harga-jual').value) || 0,
        kategori: document.getElementById('masuk-kategori').value,
        keterangan: document.getElementById('masuk-keterangan').value.trim()
      };

      try {
        const res = await fetch('api/barang.php?action=masuk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          showToast(json.message, 'success');
          document.getElementById('form-barang-masuk').reset();
          loadSemuaBarang();
          loadRiwayatStokMasuk();
        } else {
          showToast(json.message || 'Gagal menyimpan barang masuk', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal terhubung ke database', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-arrow-down-to-bracket"></i> SIMPAN BARANG MASUK`;
      }
    }

    async function loadRiwayatStokMasuk() {
      const container = document.getElementById('riwayat-masuk-list');
      try {
        const res = await fetch('api/barang.php?action=riwayat_stok');
        const json = await res.json();
        if (json.success && json.data) {
          const masukLogs = json.data.filter(l => l.jenis === 'MASUK').slice(0, 6);
          if (masukLogs.length === 0) {
            container.innerHTML = `<p class="text-slate-400 py-3 text-center italic">Belum ada riwayat kulakan.</p>`;
            return;
          }

          container.innerHTML = masukLogs.map(l => `
            <div class="py-2 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800">${l.nama_barang}</span>
                <span class="text-[10px] text-slate-400 block">${l.tanggal} • ${l.keterangan || ''}</span>
              </div>
              <span class="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs">+${l.jumlah}</span>
            </div>
          `).join('');
        }
      } catch (err) {
        console.error(err);
      }
    }

    // ============================================================
    // TAB BUKU KASBON (UTANG PELANGGAN)
    // ============================================================
    let kasbonData = { daftar: [], per_pelanggan: [], summary: {} };

    async function loadKasbon() {
      try {
        const res = await fetch('api/kasbon.php?action=list');
        const json = await res.json();
        if (json.success && json.data) {
          kasbonData = json.data;

          const summary = kasbonData.summary || {};
          const totalUtang = Number(summary.total_utang_menggantung || 0);
          const totalFaktur = Number(summary.total_faktur_belum_lunas || 0);

          document.getElementById('kasbon-total-menggantung').textContent = formatRupiah(totalUtang);
          document.getElementById('kasbon-total-faktur').textContent = `${totalFaktur} Bon Belum Lunas`;

          const badge = document.getElementById('nav-kasbon-badge');
          if (totalFaktur > 0) badge.classList.remove('hidden');
          else badge.classList.add('hidden');

          renderKasbonPerPelanggan();
          renderKasbonPerFaktur();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function switchKasbonSub(sub) {
      const btnPelanggan = document.getElementById('btn-kasbon-sub-pelanggan');
      const btnFaktur = document.getElementById('btn-kasbon-sub-faktur');
      const boxPelanggan = document.getElementById('kasbon-pelanggan-container');
      const boxFaktur = document.getElementById('kasbon-faktur-container');

      if (sub === 'pelanggan') {
        btnPelanggan.className = "flex-1 py-1.5 rounded-lg bg-white shadow-xs text-slate-800 font-bold transition";
        btnFaktur.className = "flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition";
        boxPelanggan.classList.remove('hidden');
        boxFaktur.classList.add('hidden');
      } else {
        btnFaktur.className = "flex-1 py-1.5 rounded-lg bg-white shadow-xs text-slate-800 font-bold transition";
        btnPelanggan.className = "flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition";
        boxFaktur.classList.remove('hidden');
        boxPelanggan.classList.add('hidden');
      }
    }

    function renderKasbonPerPelanggan() {
      const container = document.getElementById('kasbon-pelanggan-container');
      const list = kasbonData.per_pelanggan || [];

      if (list.length === 0) {
        container.innerHTML = `
          <div class="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
            <i class="fa-solid fa-face-smile text-4xl mb-2 text-emerald-400"></i>
            <p class="text-xs font-bold text-slate-700">Semua Utang Pelanggan Lunas!</p>
            <p class="text-[11px] text-slate-400 mt-1">Tidak ada kasbon yang belum diselesaikan.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(p => `
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <h4 class="font-bold text-xs text-slate-800">${p.nama_pelanggan}</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">${p.jumlah_transaksi} bon belum lunas</p>
          </div>
          <div class="text-right">
            <div class="font-black text-sm text-amber-600">${formatRupiah(p.sisa_utang)}</div>
            <span class="text-[10px] text-slate-400">Terakhir: ${p.tanggal_terakhir.split(' ')[0]}</span>
          </div>
        </div>
      `).join('');
    }

    function renderKasbonPerFaktur() {
      const container = document.getElementById('kasbon-faktur-container');
      const list = kasbonData.daftar || [];

      if (list.length === 0) {
        container.innerHTML = `<p class="text-slate-400 text-center py-6 text-xs italic">Tidak ada bon kasbon.</p>`;
        return;
      }

      container.innerHTML = list.map(f => {
        const sisa = Number(f.total_belanja) - Number(f.uang_bayar);
        const isLunas = f.status_bayar === 'Lunas';

        return `
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-xs text-slate-800">${f.nama_pelanggan || 'Pelanggan'}</span>
                <span class="text-[10px] text-slate-400 block">${f.kode_transaksi} • ${f.tanggal}</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${f.status_bayar}
              </span>
            </div>

            <div class="flex justify-between items-baseline pt-1 border-t border-slate-100 text-xs">
              <span class="text-slate-500">Sisa Tagihan:</span>
              <span class="font-black text-sm text-amber-600">${formatRupiah(sisa)}</span>
            </div>

            ${!isLunas ? `
              <div class="flex gap-2 pt-1">
                <button 
                  onclick="lunaskanKasbon(${f.id}, '${f.nama_pelanggan}', ${f.total_belanja})"
                  class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <i class="fa-solid fa-check"></i> Lunaskan
                </button>
                <button 
                  onclick="cicilKasbonPrompt(${f.id}, ${sisa})"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Cicil
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    async function lunaskanKasbon(id, nama, total) {
      if (!confirm(`Tandai kasbon ${nama} sebesar ${formatRupiah(total)} LUNAS?`)) return;

      try {
        const res = await fetch('api/kasbon.php?action=lunaskan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaksi_id: id })
        });
        const json = await res.json();
        if (json.success) {
          showToast(json.message, 'success');
          loadKasbon();
        } else {
          showToast(json.message, 'error');
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function cicilKasbonPrompt(id, sisa) {
      const nominalStr = prompt(`Masukkan nominal cicilan (Sisa: ${formatRupiah(sisa)}):`, '');
      if (!nominalStr) return;
      const nominal = parseFloat(nominalStr);
      if (isNaN(nominal) || nominal <= 0) {
        showToast('Nominal tidak valid', 'warning');
        return;
      }

      try {
        const res = await fetch('api/kasbon.php?action=cicil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaksi_id: id, jumlah_bayar: nominal })
        });
        const json = await res.json();
        if (json.success) {
          showToast(json.message, 'success');
          loadKasbon();
        } else {
          showToast(json.message, 'error');
        }
      } catch (err) {
        console.error(err);
      }
    }

    // ============================================================
    // TAB LAPORAN & TUTUP BUKU HARIAN
    // ============================================================
    async function loadLaporanHarian(tanggal) {
      try {
        const res = await fetch(`api/laporan.php?action=hari_ini&tanggal=${tanggal}`);
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;

          document.getElementById('lap-omset').textContent = formatRupiah(d.omset);
          document.getElementById('lap-tunai').textContent = formatRupiah(d.uang_tunai_masuk);
          document.getElementById('lap-laba').textContent = formatRupiah(d.laba_kotor);
          document.getElementById('lap-kasbon-baru').textContent = formatRupiah(d.kasbon_baru);
          document.getElementById('lap-trx-count').textContent = d.total_transaksi;

          // Top Products
          const topContainer = document.getElementById('lap-top-produk');
          if (d.top_produk && d.top_produk.length > 0) {
            topContainer.innerHTML = d.top_produk.map((p, i) => `
              <div class="py-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">${i + 1}</span>
                  <span class="font-bold text-slate-800">${p.nama_barang}</span>
                </div>
                <div class="text-right">
                  <span class="font-black text-brand-700">${p.total_qty} ${p.satuan || ''}</span>
                  <span class="text-[10px] text-slate-400 block">${formatRupiah(p.total_omset)}</span>
                </div>
              </div>
            `).join('');
          } else {
            topContainer.innerHTML = `<p class="text-slate-400 py-2 italic text-center">Belum ada barang terjual pada tanggal ini.</p>`;
          }

          // Riwayat Transaksi Hari Ini
          loadRiwayatTransaksiHariIni(tanggal);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function loadRiwayatTransaksiHariIni(tanggal) {
      const container = document.getElementById('lap-riwayat-transaksi');
      try {
        const res = await fetch(`api/transaksi.php?action=list&tanggal=${tanggal}`);
        const json = await res.json();
        if (json.success && json.data) {
          const trxs = json.data;
          if (trxs.length === 0) {
            container.innerHTML = `<p class="text-slate-400 py-3 text-center italic">Belum ada transaksi di tanggal ini.</p>`;
            return;
          }

          container.innerHTML = trxs.map(t => `
            <div class="py-2.5 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800">${t.kode_transaksi}</span>
                <span class="text-[10px] text-slate-400 block">${t.tanggal.split(' ')[1] || ''} • ${t.metode_bayar} ${t.nama_pelanggan ? '(' + t.nama_pelanggan + ')' : ''}</span>
              </div>
              <div class="text-right">
                <span class="font-black text-xs text-brand-700">${formatRupiah(t.total_belanja)}</span>
                <span class="text-[10px] ${t.status_bayar === 'Lunas' ? 'text-emerald-600' : 'text-amber-600'} font-semibold block">${t.status_bayar}</span>
              </div>
            </div>
          `).join('');
        }
      } catch (err) {
        console.error(err);
      }
    }

    // ============================================================
    // MODAL EDIT BARANG & PENYESUAIAN STOK
    // ============================================================
    function bukaModalEdit(id) {
      const b = allBarang.find(x => x.id == id);
      if (!b) return;

      document.getElementById('edit-barang-id').value = b.id;
      document.getElementById('edit-nama-barang').value = b.nama_barang;
      document.getElementById('edit-harga-modal').value = b.harga_modal;
      document.getElementById('edit-harga-jual').value = b.harga_jual;
      document.getElementById('edit-stok-fisik').value = b.stok;
      document.getElementById('edit-satuan-label').textContent = b.satuan || 'pcs';
      document.getElementById('edit-alasan-stok').value = '';

      const modal = document.getElementById('modal-edit-stok');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeModalEdit() {
      const modal = document.getElementById('modal-edit-stok');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    async function simpanPerubahanBarang() {
      const id = document.getElementById('edit-barang-id').value;
      const nama = document.getElementById('edit-nama-barang').value.trim();
      const modal = parseFloat(document.getElementById('edit-harga-modal').value) || 0;
      const jual = parseFloat(document.getElementById('edit-harga-jual').value) || 0;
      const stokFisik = parseFloat(document.getElementById('edit-stok-fisik').value);
      const alasan = document.getElementById('edit-alasan-stok').value.trim();

      if (!nama) {
        showToast('Nama barang tidak boleh kosong', 'warning');
        return;
      }

      try {
        // 1. Update Info Dasar
        await fetch('api/barang.php?action=edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, nama_barang: nama, harga_modal: modal, harga_jual: jual })
        });

        // 2. Update Stok Fisik jika berubah
        const b = allBarang.find(x => x.id == id);
        if (b && Number(b.stok) !== stokFisik && !isNaN(stokFisik)) {
          await fetch('api/barang.php?action=penyesuaian', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, stok_baru: stokFisik, alasan: alasan || 'Koreksi stok' })
          });
        }

        showToast('Perubahan berhasil disimpan!', 'success');
        closeModalEdit();
        loadSemuaBarang();
      } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan perubahan', 'error');
      }
    }

    async function hapusBarangDariDatabase() {
      const id = document.getElementById('edit-barang-id').value;
      if (!confirm('Yakin ingin menghapus barang ini dari database?')) return;

      try {
        const res = await fetch('api/barang.php?action=hapus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (json.success) {
          showToast('Barang dihapus', 'success');
          closeModalEdit();
          loadSemuaBarang();
        } else {
          showToast(json.message, 'error');
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Helper Rupiah Formatter
    function formatRupiah(num) {
      const n = Number(num) || 0;
      return 'Rp ' + n.toLocaleString('id-ID');
    }
  </script>
</body>
</html>

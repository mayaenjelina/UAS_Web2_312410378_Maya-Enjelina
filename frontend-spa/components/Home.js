// =======================================================
// FILE: frontend-spa/components/Home.js
// FUNGSI: Halaman Beranda publik (tanpa login)
// Menampilkan statistik ringkasan inventaris secara real-time
// =======================================================

export default {
  name: 'Home',

  // -------------------------------------------------------
  // data() = State / variabel reaktif komponen ini
  // Semua perubahan pada data ini akan langsung update UI
  // Catatan: low_stock_products & recent_history TIDAK ada di sini
  // karena itu data detail khusus Admin (lihat Dashboard.js)
  // -------------------------------------------------------
  data() {
    return {
      stats: {
        total_products: 0,
        total_categories: 0,
        total_stock: 0,
        inventory_value: 0,
      },
      loading: true,
      error: null,
    };
  },

  // -------------------------------------------------------
  // mounted() = Lifecycle hook, berjalan saat komponen ditampilkan
  // Di sini kita langsung fetch data ke API
  // -------------------------------------------------------
  mounted() {
    this.fetchSummary();
  },

  methods: {
    async fetchSummary() {
      try {
        // Akses endpoint PUBLIC (tidak butuh token) - hanya ringkasan total
        const res = await axios.get(`${API_BASE_URL}/public/summary`);
        this.stats = res.data.data;
      } catch (e) {
        this.error = 'Gagal memuat data. Pastikan backend berjalan.';
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(val) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    },

    formatDate(dt) {
      return new Date(dt).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    }
  },

  // -------------------------------------------------------
  // template = HTML komponen ini (Vue akan me-render ini)
  // Perhatikan penggunaan class TailwindCSS di setiap elemen
  // -------------------------------------------------------
  template: `
    <div class="min-h-screen bg-stone-100">

      <!-- ===== HERO SECTION ===== -->
      <section class="relative overflow-hidden">
        <!-- Background gradient dekoratif -->
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950"></div>
        <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-700/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

        <div class="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <!-- Badge -->
          <span class="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <span class="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
            Sistem Manajemen Inventaris Real-Time
          </span>

          <!-- Judul besar -->
          <h1 class="text-5xl md:text-7xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
            E<span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Inventory</span>
          </h1>
          <p class="text-stone-500 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light">
            Kelola barang, pantau stok, dan lacak pergerakan inventaris perusahaan Anda dalam satu platform terpadu.
          </p>

          <!-- CTA Button -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/login"
              class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-stone-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              Masuk ke Dashboard
            </router-link>
            <a href="#stats" class="inline-flex items-center gap-2 border border-emerald-200 hover:border-slate-500 text-stone-600 hover:text-stone-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200">
              Lihat Statistik
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </a>
          </div>
        </div>
      </section>

      <!-- ===== STATS SECTION ===== -->
      <section id="stats" class="max-w-6xl mx-auto px-6 py-16">

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-6 text-center">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ error }}
        </div>

        <div v-else>
          <!-- Label section -->
          <div class="text-center mb-12">
            <p class="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-2">Ringkasan Data</p>
            <h2 class="text-3xl font-bold text-stone-900">Statistik Inventaris Terkini</h2>
          </div>

          <!-- 4 Stat Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div class="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div class="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
              </div>
              <p class="text-stone-400 text-sm mb-1">Total Produk</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_products }}</p>
            </div>

            <div class="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div class="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              </div>
              <p class="text-stone-400 text-sm mb-1">Kategori</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_categories }}</p>
            </div>

            <div class="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <p class="text-stone-400 text-sm mb-1">Total Stok</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_stock.toLocaleString('id-ID') }}</p>
            </div>

            <div class="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
              <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
              </div>
              <p class="text-stone-400 text-sm mb-1">Nilai Inventaris</p>
              <p class="text-xl font-black text-stone-900">{{ formatCurrency(stats.inventory_value) }}</p>
            </div>
          </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-emerald-100 mt-8 py-8 text-center text-slate-600 text-sm">
        E-Inventory System · UAS Pemrograman Web 2 · Built with CodeIgniter 4 + Vue 3 + TailwindCSS
      </footer>

    </div>
  `
};
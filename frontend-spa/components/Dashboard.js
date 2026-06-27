// =======================================================
// FILE: frontend-spa/components/Dashboard.js
// FUNGSI: Halaman Dashboard Admin - Statistik + Navigasi
// AKSES: Hanya admin yang sudah login (dijaga Navigation Guard)
// =======================================================

export default {
  name: 'Dashboard',

  data() {
    return {
      stats: { total_products: 0, total_categories: 0, total_stock: 0, inventory_value: 0, low_stock_products: [], recent_history: [] },
      userName: localStorage.getItem('name') || 'Admin',
      loading: true,
    };
  },

  mounted() {
    this.fetchStats();
  },

  methods: {
    async fetchStats() {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`);
        this.stats = res.data.data;
      } catch(e) {
        console.error('Gagal ambil statistik', e);
      } finally {
        this.loading = false;
      }
    },

    async handleLogout() {
      try {
        // Kirim request logout ke server (hapus token dari DB)
        await axios.post(`${API_BASE_URL}/logout`);
      } catch(e) { /* Tetap lanjut logout meski server error */ }

      // Hapus semua data sesi dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');

      // Redirect ke halaman login
      this.$router.push('/login');
    },

    formatCurrency(val) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    },

    formatDate(dt) {
      return new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  },

  template: `
    <div class="min-h-screen bg-stone-50">
      <!-- TOP NAV BAR -->
      <nav class="bg-emerald-900 border-b border-emerald-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
            </div>
            <span class="text-white font-bold text-lg">EInventory</span>
            <span class="bg-white/20 text-white text-xs px-2 py-0.5 rounded-md font-medium ml-1">Admin</span>
          </div>

          <!-- Nav Menu -->
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/dashboard" class="text-emerald-100 hover:text-white hover:bg-emerald-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors">Dashboard</router-link>
            <router-link to="/products" class="text-emerald-100 hover:text-white hover:bg-emerald-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors">Produk</router-link>
            <router-link to="/categories" class="text-emerald-100 hover:text-white hover:bg-emerald-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors">Kategori</router-link>
            <router-link to="/stock-history" class="text-emerald-100 hover:text-white hover:bg-emerald-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors">Histori Stok</router-link>
          </div>

          <!-- User + Logout -->
          <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-2 text-sm">
              <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ userName.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="text-emerald-100">{{ userName }}</span>
            </div>
            <button @click="handleLogout"
              class="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-emerald-200 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg text-sm transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <!-- CONTENT -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-black text-stone-800 mb-1">Dashboard</h1>
          <p class="text-stone-400 text-sm">Ringkasan inventaris Anda hari ini</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
          <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else>
          <!-- Stat Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white border border-emerald-100 rounded-2xl p-5 group hover:border-emerald-500/30 transition-colors">
              <div class="flex items-start justify-between mb-4">
                <div class="w-9 h-9 bg-emerald-600/10 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
                </div>
                <router-link to="/products" class="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Lihat →</router-link>
              </div>
              <p class="text-stone-400 text-xs mb-1">Total Produk</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_products }}</p>
            </div>
            <div class="bg-white border border-emerald-100 rounded-2xl p-5 group hover:border-teal-500/30 transition-colors">
              <div class="flex items-start justify-between mb-4">
                <div class="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                </div>
                <router-link to="/categories" class="text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Lihat →</router-link>
              </div>
              <p class="text-stone-400 text-xs mb-1">Kategori</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_categories }}</p>
            </div>
            <div class="bg-white border border-emerald-100 rounded-2xl p-5">
              <div class="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <p class="text-stone-400 text-xs mb-1">Total Stok</p>
              <p class="text-3xl font-black text-stone-800">{{ stats.total_stock?.toLocaleString('id-ID') }}</p>
            </div>
            <div class="bg-white border border-emerald-100 rounded-2xl p-5">
              <div class="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
              </div>
              <p class="text-stone-400 text-xs mb-1">Nilai Inventaris</p>
              <p class="text-lg font-black text-stone-900">{{ formatCurrency(stats.inventory_value) }}</p>
            </div>
          </div>

          <!-- Quick Nav -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <router-link to="/products" class="group bg-white border border-emerald-100 hover:border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-emerald-50">
              <div class="w-12 h-12 bg-emerald-600/10 group-hover:bg-emerald-600/20 rounded-xl flex items-center justify-center transition-colors shrink-0">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
              </div>
              <div>
                <p class="text-stone-900 font-semibold text-sm">Kelola Produk</p>
                <p class="text-stone-400 text-xs">Tambah, edit, hapus produk</p>
              </div>
            </router-link>
            <router-link to="/categories" class="group bg-white border border-emerald-100 hover:border-teal-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-teal-50">
              <div class="w-12 h-12 bg-teal-500/10 group-hover:bg-teal-500/20 rounded-xl flex items-center justify-center transition-colors shrink-0">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              </div>
              <div>
                <p class="text-stone-900 font-semibold text-sm">Kelola Kategori</p>
                <p class="text-stone-400 text-xs">Atur kategori produk</p>
              </div>
            </router-link>
            <router-link to="/stock-history" class="group bg-white border border-emerald-100 hover:border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-green-50">
              <div class="w-12 h-12 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-xl flex items-center justify-center transition-colors shrink-0">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p class="text-stone-900 font-semibold text-sm">Histori Stok</p>
                <p class="text-stone-400 text-xs">Catat & pantau pergerakan</p>
              </div>
            </router-link>
          </div>

          <!-- Recent History Table -->
          <div class="bg-white border border-emerald-100 rounded-2xl">
            <div class="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
              <h3 class="text-stone-800 font-semibold">Aktivitas Stok Terbaru</h3>
              <router-link to="/stock-history" class="text-emerald-600 text-xs hover:text-emerald-500">Lihat semua →</router-link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-emerald-100">
                    <th class="text-left text-stone-400 text-xs font-medium px-6 py-3 uppercase tracking-wider">Produk</th>
                    <th class="text-left text-stone-400 text-xs font-medium px-6 py-3 uppercase tracking-wider">Tipe</th>
                    <th class="text-left text-stone-400 text-xs font-medium px-6 py-3 uppercase tracking-wider">Jumlah</th>
                    <th class="text-left text-stone-400 text-xs font-medium px-6 py-3 uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in stats.recent_history" :key="h.id" class="border-b border-emerald-100/50 hover:bg-emerald-50/30 transition-colors">
                    <td class="px-6 py-3.5">
                      <p class="text-stone-800 text-sm font-medium">{{ h.product_name }}</p>
                      <p class="text-stone-400 text-xs">{{ h.notes || '-' }}</p>
                    </td>
                    <td class="px-6 py-3.5">
                      <span :class="h.type === 'in' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'"
                        class="inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-lg">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="h.type==='in'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                        </svg>
                        {{ h.type === 'in' ? 'Masuk' : 'Keluar' }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 text-stone-900 text-sm font-semibold">{{ h.quantity }} unit</td>
                    <td class="px-6 py-3.5 text-stone-500 text-xs">{{ formatDate(h.created_at) }}</td>
                  </tr>
                  <tr v-if="!stats.recent_history.length">
                    <td colspan="4" class="px-6 py-8 text-center text-stone-400 text-sm">Belum ada aktivitas stok</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
};
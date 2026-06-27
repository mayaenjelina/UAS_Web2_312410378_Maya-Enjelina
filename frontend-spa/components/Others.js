// =======================================================
// FILE: frontend-spa/components/Categories.js
// FUNGSI: Halaman CRUD Kategori
// =======================================================

export const Categories = {
  name: 'Categories',
  data() {
    return {
      categories: [], loading: true, searchQuery: '',
      showModal: false, modalMode: 'create',
      form: { category_name: '' }, editId: null,
      formLoading: false, formError: null,
    };
  },
  computed: {
    filteredCategories() {
      if (!this.searchQuery) return this.categories;
      return this.categories.filter(c => c.category_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  },
  mounted() { this.fetchCategories(); },
  methods: {
    async fetchCategories() {
      this.loading = true;
      try { const res = await axios.get(`${API_BASE_URL}/categories`); this.categories = res.data.data; }
      catch(e) {} finally { this.loading = false; }
    },
    openCreateModal() { this.modalMode='create'; this.editId=null; this.form={category_name:''}; this.formError=null; this.showModal=true; },
    openEditModal(c) { this.modalMode='edit'; this.editId=c.id; this.form.category_name=c.category_name; this.formError=null; this.showModal=true; },
    closeModal() { this.showModal=false; },
    async handleSubmit() {
      this.formError=null; this.formLoading=true;
      try {
        if (this.modalMode==='create') { await axios.post(`${API_BASE_URL}/categories`, this.form); alert('✅ Kategori berhasil ditambahkan!'); }
        else { await axios.put(`${API_BASE_URL}/categories/${this.editId}`, this.form); alert('✅ Kategori berhasil diperbarui!'); }
        this.closeModal(); this.fetchCategories();
      } catch(err) { this.formError = err.response?.data?.message || 'Terjadi kesalahan!'; }
      finally { this.formLoading=false; }
    },
    async handleDelete(c) {
      if (!confirm(`Hapus kategori "${c.category_name}"?`)) return;
      try { await axios.delete(`${API_BASE_URL}/categories/${c.id}`); alert('✅ Kategori berhasil dihapus!'); this.fetchCategories(); }
      catch(err) { alert('❌ ' + (err.response?.data?.message || 'Gagal menghapus!')); }
    },
    async handleLogout() { try { await axios.post(`${API_BASE_URL}/logout`); } catch(e) {} localStorage.clear(); this.$router.push('/login'); }
  },
  template: `
    <div class="min-h-screen bg-stone-50">
      <nav class="bg-emerald-900 border-b border-emerald-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg></div>
            <span class="text-white font-bold text-lg">EInventory</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/dashboard" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Dashboard</router-link>
            <router-link to="/products" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Produk</router-link>
            <router-link to="/categories" class="text-stone-900 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium">Kategori</router-link>
            <router-link to="/stock-history" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Histori Stok</router-link>
          </div>
          <button @click="handleLogout" class="flex items-center gap-2 bg-emerald-50 hover:bg-red-50 hover:text-red-500 text-stone-500 border border-emerald-200 hover:border-red-400/30 px-3 py-1.5 rounded-lg text-sm transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>Logout
          </button>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-8">
          <div><h1 class="text-2xl font-black text-stone-800 mb-1">Manajemen Kategori</h1><p class="text-stone-400 text-sm">{{ filteredCategories.length }} kategori terdaftar</p></div>
          <button @click="openCreateModal" class="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-stone-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>Tambah Kategori
          </button>
        </div>
        <div class="relative mb-6">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Cari kategori..." class="w-full bg-white border border-emerald-100 text-stone-900 placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-if="loading" class="col-span-3 flex justify-center py-16"><div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
          <div v-for="c in filteredCategories" :key="c.id" class="bg-white border border-emerald-100 hover:border-teal-500/30 rounded-2xl p-5 transition-all group">
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              </div>
              <span class="text-slate-600 text-xs">#{{ c.id }}</span>
            </div>
            <h3 class="text-stone-900 font-semibold mb-1">{{ c.category_name }}</h3>
            <p class="text-stone-400 text-xs mb-4">{{ c.product_count || 0 }} produk</p>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEditModal(c)" class="flex-1 text-center text-emerald-600 hover:bg-emerald-600/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Edit</button>
              <button @click="handleDelete(c)" class="flex-1 text-center text-red-400 hover:bg-red-50 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Hapus</button>
            </div>
          </div>
          <div v-if="!loading && !filteredCategories.length" class="col-span-3 text-center py-12 text-stone-400 text-sm">Belum ada kategori</div>
        </div>
      </main>
      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white border border-emerald-200 rounded-2xl w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between px-6 py-5 border-b border-emerald-100">
            <h3 class="text-stone-900 font-bold">{{ modalMode==='create'?'Tambah Kategori':'Edit Kategori' }}</h3>
            <button @click="closeModal" class="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div class="px-6 py-5">
            <div v-if="formError" class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{{ formError }}</div>
            <label class="block text-stone-500 text-xs font-medium mb-2">Nama Kategori <span class="text-red-400">*</span></label>
            <input v-model="form.category_name" type="text" placeholder="Contoh: Elektronik, Furnitur..." @keyup.enter="handleSubmit"
              class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors" />
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-emerald-100">
            <button @click="closeModal" class="px-4 py-2 text-stone-500 hover:text-stone-900 text-sm transition-colors">Batal</button>
            <button @click="handleSubmit" :disabled="formLoading" class="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-stone-900 font-semibold px-5 py-2 rounded-xl text-sm transition-all">
              <svg v-if="formLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ formLoading ? 'Menyimpan...' : (modalMode==='create'?'Tambah':'Simpan') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
};

// =======================================================
// FILE: StockHistory Component (digabung agar lebih ringkas)
// FUNGSI: Halaman Histori Stok - Lihat & Tambah pergerakan stok
// =======================================================

export const StockHistory = {
  name: 'StockHistory',
  data() {
    return {
      history: [], products: [], loading: true,
      showModal: false,
      form: { product_id: '', type: 'in', quantity: 1, notes: '' },
      formLoading: false, formError: null,
      filterType: '',
    };
  },
  computed: {
    filteredHistory() {
      if (!this.filterType) return this.history;
      return this.history.filter(h => h.type === this.filterType);
    }
  },
  mounted() { this.fetchHistory(); this.fetchProducts(); },
  methods: {
    async fetchHistory() {
      this.loading=true;
      try { const res = await axios.get(`${API_BASE_URL}/stock-history`); this.history = res.data.data; }
      catch(e){} finally { this.loading=false; }
    },
    async fetchProducts() {
      try { const res = await axios.get(`${API_BASE_URL}/products`); this.products = res.data.data; }
      catch(e){}
    },
    openModal() { this.form={product_id:'',type:'in',quantity:1,notes:''}; this.formError=null; this.showModal=true; },
    closeModal() { this.showModal=false; },
    async handleSubmit() {
      this.formError=null; this.formLoading=true;
      try {
        await axios.post(`${API_BASE_URL}/stock-history`, this.form);
        alert('✅ Stok berhasil dicatat!');
        this.closeModal(); this.fetchHistory(); this.fetchProducts();
      } catch(err) { this.formError = err.response?.data?.message || 'Terjadi kesalahan!'; }
      finally { this.formLoading=false; }
    },
    async handleDelete(h) {
      if (!confirm(`Hapus histori stok ini?`)) return;
      try { await axios.delete(`${API_BASE_URL}/stock-history/${h.id}`); alert('✅ Berhasil dihapus!'); this.fetchHistory(); }
      catch(err) { alert('❌ ' + (err.response?.data?.message || 'Gagal menghapus!')); }
    },
    formatDate(dt) { return new Date(dt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); },
    async handleLogout() { try { await axios.post(`${API_BASE_URL}/logout`); } catch(e) {} localStorage.clear(); this.$router.push('/login'); }
  },
  template: `
    <div class="min-h-screen bg-stone-50">
      <nav class="bg-emerald-900 border-b border-emerald-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg></div>
            <span class="text-white font-bold text-lg">EInventory</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/dashboard" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Dashboard</router-link>
            <router-link to="/products" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Produk</router-link>
            <router-link to="/categories" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Kategori</router-link>
            <router-link to="/stock-history" class="text-stone-900 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium">Histori Stok</router-link>
          </div>
          <button @click="handleLogout" class="flex items-center gap-2 bg-emerald-50 hover:bg-red-50 hover:text-red-500 text-stone-500 border border-emerald-200 hover:border-red-400/30 px-3 py-1.5 rounded-lg text-sm transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>Logout
          </button>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-8">
          <div><h1 class="text-2xl font-black text-stone-800 mb-1">Histori Pergerakan Stok</h1><p class="text-stone-400 text-sm">{{ filteredHistory.length }} transaksi stok</p></div>
          <button @click="openModal" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-stone-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>Catat Stok
          </button>
        </div>
        <!-- Filter -->
        <div class="flex gap-2 mb-6">
          <button @click="filterType=''" :class="!filterType?'bg-slate-700 text-stone-900':'bg-white text-stone-500 hover:text-stone-900'" class="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-100 transition-colors">Semua</button>
          <button @click="filterType='in'" :class="filterType==='in'?'bg-emerald-600 text-stone-900 border-emerald-600':'bg-white text-stone-500 hover:text-stone-900'" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>Masuk
          </button>
          <button @click="filterType='out'" :class="filterType==='out'?'bg-red-600 text-stone-900 border-red-600':'bg-white text-stone-500 hover:text-stone-900'" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>Keluar
          </button>
        </div>
        <div class="bg-white border border-emerald-100 rounded-2xl overflow-hidden">
          <div v-if="loading" class="flex justify-center py-16"><div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="border-b border-emerald-100">
                <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Produk</th>
                <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Tipe</th>
                <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Jumlah</th>
                <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Catatan</th>
                <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Waktu</th>
                <th class="text-right text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody>
                <tr v-for="h in filteredHistory" :key="h.id" class="border-b border-emerald-100/50 hover:bg-emerald-50/30 transition-colors">
                  <td class="px-6 py-4"><p class="text-stone-800 text-sm font-medium">{{ h.product_name }}</p><p class="text-stone-400 text-xs font-mono">{{ h.sku }}</p></td>
                  <td class="px-6 py-4">
                    <span :class="h.type==='in'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-red-500/10 text-red-400 border-red-500/20'"
                      class="inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-lg">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="h.type==='in'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                      </svg>
                      {{ h.type==='in'?'Masuk':'Keluar' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-stone-900 font-bold">{{ h.quantity }} <span class="text-stone-400 font-normal text-xs">unit</span></td>
                  <td class="px-6 py-4 text-stone-500 text-sm max-w-xs truncate">{{ h.notes || '-' }}</td>
                  <td class="px-6 py-4 text-stone-500 text-xs">{{ formatDate(h.created_at) }}</td>
                  <td class="px-6 py-4 text-right">
                    <button @click="handleDelete(h)" class="text-red-400 hover:bg-red-50 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1.5 rounded-lg text-xs transition-all">Hapus</button>
                  </td>
                </tr>
                <tr v-if="!filteredHistory.length"><td colspan="6" class="px-6 py-12 text-center text-stone-400 text-sm">Belum ada histori stok</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <!-- Modal Tambah Histori Stok -->
      <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white border border-emerald-200 rounded-2xl w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between px-6 py-5 border-b border-emerald-100">
            <div><h3 class="text-stone-900 font-bold">Catat Pergerakan Stok</h3><p class="text-stone-400 text-sm mt-0.5">Stok produk akan otomatis diperbarui</p></div>
            <button @click="closeModal" class="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div v-if="formError" class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">{{ formError }}</div>
            <div>
              <label class="block text-stone-500 text-xs font-medium mb-1.5">Produk <span class="text-red-400">*</span></label>
              <select v-model="form.product_id" class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                <option value="" disabled>Pilih produk</option>
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.product_name }} (Stok: {{ p.stock }})</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">Tipe <span class="text-red-400">*</span></label>
                <div class="flex rounded-xl overflow-hidden border border-emerald-200">
                  <button @click="form.type='in'" :class="form.type==='in'?'bg-emerald-600 text-stone-900':'bg-emerald-50 text-stone-500 hover:text-stone-900'" class="flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>Masuk
                  </button>
                  <button @click="form.type='out'" :class="form.type==='out'?'bg-red-600 text-stone-900':'bg-emerald-50 text-stone-500 hover:text-stone-900'" class="flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>Keluar
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">Jumlah <span class="text-red-400">*</span></label>
                <input v-model.number="form.quantity" type="number" min="1" class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label class="block text-stone-500 text-xs font-medium mb-1.5">Catatan</label>
              <textarea v-model="form.notes" placeholder="Keterangan (opsional)" rows="3" class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-emerald-100">
            <button @click="closeModal" class="px-4 py-2 text-stone-500 hover:text-stone-900 text-sm transition-colors">Batal</button>
            <button @click="handleSubmit" :disabled="formLoading" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-900 font-semibold px-5 py-2 rounded-xl text-sm transition-all">
              <svg v-if="formLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ formLoading ? 'Menyimpan...' : 'Catat Stok' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
};
// =======================================================
// FILE: frontend-spa/components/Products.js
// FUNGSI: Halaman CRUD Produk dengan Modal Form
//
// Fitur:
// - Tabel daftar produk (dengan search)
// - Modal tambah produk baru
// - Modal edit produk
// - Tombol hapus dengan konfirmasi
// =======================================================

export default {
  name: 'Products',

  data() {
    return {
      products: [],
      categories: [],
      loading: true,
      searchQuery: '',

      // State modal
      showModal: false,
      modalMode: 'create', // 'create' atau 'edit'
      form: { category_id: '', product_name: '', sku: '', stock: 0, price: 0, supplier: '' },
      editId: null,
      formLoading: false,
      formError: null,

      userName: localStorage.getItem('name') || 'Admin',
    };
  },

  computed: {
    // Filter produk berdasarkan search query secara reaktif
    filteredProducts() {
      if (!this.searchQuery) return this.products;
      const q = this.searchQuery.toLowerCase();
      return this.products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q)
      );
    }
  },

  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  },

  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get(`${API_BASE_URL}/products`);
        this.products = res.data.data;
      } catch(e) { console.error(e); }
      finally { this.loading = false; }
    },

    async fetchCategories() {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        this.categories = res.data.data;
      } catch(e) { console.error(e); }
    },

    openCreateModal() {
      this.modalMode = 'create';
      this.editId    = null;
      this.form      = { category_id: '', product_name: '', sku: '', stock: 0, price: 0, supplier: '' };
      this.formError = null;
      this.showModal = true;
    },

    openEditModal(product) {
      this.modalMode          = 'edit';
      this.editId             = product.id;
      this.form.category_id   = product.category_id;
      this.form.product_name  = product.product_name;
      this.form.sku           = product.sku;
      this.form.stock         = product.stock;
      this.form.price         = product.price;
      this.form.supplier      = product.supplier;
      this.formError          = null;
      this.showModal          = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async handleSubmit() {
      this.formError   = null;
      this.formLoading = true;

      try {
        if (this.modalMode === 'create') {
          // POST - Tambah produk baru
          // Token otomatis disuntikkan oleh Axios Interceptor
          await axios.post(`${API_BASE_URL}/products`, this.form);
          alert('✅ Produk berhasil ditambahkan!');
        } else {
          // PUT - Edit produk
          await axios.put(`${API_BASE_URL}/products/${this.editId}`, this.form);
          alert('✅ Produk berhasil diperbarui!');
        }
        this.closeModal();
        this.fetchProducts(); // Refresh tabel
      } catch(err) {
        this.formError = err.response?.data?.message || 'Terjadi kesalahan!';
      } finally {
        this.formLoading = false;
      }
    },

    async handleDelete(product) {
      if (!confirm(`Hapus produk "${product.product_name}"?\n\nSemua histori stok terkait juga akan terhapus.`)) return;
      try {
        await axios.delete(`${API_BASE_URL}/products/${product.id}`);
        alert('✅ Produk berhasil dihapus!');
        this.fetchProducts();
      } catch(err) {
        alert('❌ ' + (err.response?.data?.message || 'Gagal menghapus produk!'));
      }
    },

    formatCurrency(val) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    },

    async handleLogout() {
      try { await axios.post(`${API_BASE_URL}/logout`); } catch(e) {}
      localStorage.clear();
      this.$router.push('/login');
    }
  },

  template: `
    <div class="min-h-screen bg-stone-50">
      <!-- NAV - sama dengan Dashboard -->
      <nav class="bg-emerald-900 border-b border-emerald-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
            </div>
            <span class="text-white font-bold text-lg">EInventory</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/dashboard" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Dashboard</router-link>
            <router-link to="/products" class="text-stone-900 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium">Produk</router-link>
            <router-link to="/categories" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Kategori</router-link>
            <router-link to="/stock-history" class="text-stone-600 hover:text-stone-900 hover:bg-emerald-50 px-3 py-2 rounded-lg text-sm transition-colors">Histori Stok</router-link>
          </div>
          <button @click="handleLogout" class="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-emerald-200 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg text-sm transition-all duration-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Header + Tombol Tambah -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-black text-stone-800 mb-1">Manajemen Produk</h1>
            <p class="text-stone-400 text-sm">{{ filteredProducts.length }} dari {{ products.length }} produk</p>
          </div>
          <button @click="openCreateModal"
            class="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-stone-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Tambah Produk
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-6">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Cari produk, SKU, kategori, atau supplier..."
            class="w-full bg-white border border-emerald-100 text-stone-900 placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
        </div>

        <!-- Tabel Produk -->
        <div class="bg-white border border-emerald-100 rounded-2xl overflow-hidden">
          <div v-if="loading" class="flex justify-center py-16">
            <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-emerald-100 bg-white/80">
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Produk</th>
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">SKU</th>
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Kategori</th>
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Stok</th>
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Harga</th>
                  <th class="text-left text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Supplier</th>
                  <th class="text-right text-stone-400 text-xs font-semibold px-6 py-3.5 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredProducts" :key="p.id" class="border-b border-emerald-100/50 hover:bg-emerald-50/30 transition-colors">
                  <td class="px-6 py-4">
                    <p class="text-stone-900 font-medium text-sm">{{ p.product_name }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-mono text-emerald-500 text-xs bg-emerald-600/10 px-2 py-0.5 rounded">{{ p.sku }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-stone-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">{{ p.category_name }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="p.stock <= 5 ? 'text-red-400' : p.stock <= 15 ? 'text-amber-400' : 'text-emerald-400'"
                      class="font-bold text-sm">{{ p.stock }}</span>
                    <span class="text-slate-600 text-xs ml-1">unit</span>
                  </td>
                  <td class="px-6 py-4 text-stone-600 text-sm">{{ formatCurrency(p.price) }}</td>
                  <td class="px-6 py-4 text-stone-500 text-sm">{{ p.supplier || '-' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openEditModal(p)"
                        class="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Edit
                      </button>
                      <button @click="handleDelete(p)"
                        class="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-50 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredProducts.length">
                  <td colspan="7" class="px-6 py-12 text-center">
                    <svg class="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
                    <p class="text-stone-400 text-sm">{{ searchQuery ? 'Tidak ada produk yang cocok' : 'Belum ada produk' }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- ===== MODAL FORM ===== -->
      <!-- Backdrop gelap di belakang modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white border border-emerald-200 rounded-2xl w-full max-w-lg shadow-2xl">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-emerald-100">
            <div>
              <h3 class="text-stone-900 font-bold text-lg">{{ modalMode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk' }}</h3>
              <p class="text-stone-400 text-sm mt-0.5">{{ modalMode === 'create' ? 'Isi form di bawah untuk menambahkan produk' : 'Perbarui informasi produk' }}</p>
            </div>
            <button @click="closeModal" class="text-stone-400 hover:text-stone-600 hover:bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Form Error -->
          <div v-if="formError" class="mx-6 mt-5 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 text-sm">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ formError }}
          </div>

          <!-- Form Fields -->
          <div class="px-6 py-5 space-y-4">
            <!-- Nama Produk -->
            <div>
              <label class="block text-stone-500 text-xs font-medium mb-1.5">Nama Produk <span class="text-red-400">*</span></label>
              <input v-model="form.product_name" type="text" placeholder="Contoh: Laptop ASUS VivoBook"
                class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
            </div>

            <!-- 2 kolom: SKU + Kategori -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">SKU <span class="text-red-400">*</span></label>
                <input v-model="form.sku" type="text" placeholder="SKU-XXX-001"
                  class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">Kategori <span class="text-red-400">*</span></label>
                <select v-model="form.category_id"
                  class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                  <option value="" disabled>Pilih kategori</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.category_name }}</option>
                </select>
              </div>
            </div>

            <!-- 2 kolom: Stok + Harga -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">Stok Awal</label>
                <input v-model.number="form.stock" type="number" min="0"
                  class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              </div>
              <div>
                <label class="block text-stone-500 text-xs font-medium mb-1.5">Harga (Rp) <span class="text-red-400">*</span></label>
                <input v-model.number="form.price" type="number" min="0" placeholder="0"
                  class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
              </div>
            </div>

            <!-- Supplier -->
            <div>
              <label class="block text-stone-500 text-xs font-medium mb-1.5">Supplier</label>
              <input v-model="form.supplier" type="text" placeholder="Nama supplier/distributor"
                class="w-full bg-emerald-50 border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-emerald-100">
            <button @click="closeModal" class="px-4 py-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors">Batal</button>
            <button @click="handleSubmit" :disabled="formLoading"
              class="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-stone-900 font-semibold px-5 py-2 rounded-xl text-sm transition-all">
              <svg v-if="formLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ formLoading ? 'Menyimpan...' : (modalMode === 'create' ? 'Tambah Produk' : 'Simpan Perubahan') }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `
};
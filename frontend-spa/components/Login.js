// =======================================================
// FILE: frontend-spa/components/Login.js
// FUNGSI: Halaman Login Admin
//
// Alur:
// 1. User isi form username + password
// 2. Klik Login → axios POST ke /api/login
// 3. Jika sukses → simpan token + nama ke localStorage
// 4. Router redirect ke /dashboard
// =======================================================

export default {
  name: 'Login',

  data() {
    return {
      form: { username: '', password: '' },
      loading: false,
      error: null,
      showPassword: false,
    };
  },

  // Jika sudah login, langsung redirect ke dashboard
  created() {
    if (localStorage.getItem('token')) {
      this.$router.push('/dashboard');
    }
  },

  methods: {
    async handleLogin() {
      this.error   = null;
      this.loading = true;

      try {
        // POST ke backend API
        const res = await axios.post(`${API_BASE_URL}/login`, {
          username: this.form.username,
          password: this.form.password,
        });

        const { token, name, username } = res.data.data;

        // ★ Simpan data sesi ke localStorage browser
        // Ini yang akan dicek oleh Navigation Guard (router.beforeEach)
        localStorage.setItem('token',    token);    // Bearer token untuk API
        localStorage.setItem('name',     name);     // Nama untuk ditampilkan
        localStorage.setItem('username', username); // Username
        localStorage.setItem('isLoggedIn', 'true'); // Flag login status

        // PERBAIKAN: Set token di axios defaults SEBELUM redirect
        // agar request pertama di halaman dashboard sudah membawa token
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

        // Redirect ke dashboard setelah login berhasil
        this.$router.push('/dashboard');

      } catch (err) {
        // Tangkap error dari server (401, 500, dll)
        this.error = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
      } finally {
        this.loading = false;
      }
    }
  },

  template: `
    <div class="min-h-screen bg-amber-50 flex">

      <!-- Panel Kiri: Dekorasi -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-900">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex flex-col justify-center px-16 text-white">
          <div class="mb-8">
            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
            </div>
            <h2 class="text-4xl font-black mb-4 text-white">EInventory</h2>
            <p class="text-emerald-100 text-lg leading-relaxed">
              Platform manajemen inventaris modern untuk bisnis Anda. Pantau stok, kelola produk, dan lacak pergerakan barang secara real-time.
            </p>
          </div>

          <!-- Feature list -->
          <div class="space-y-4">
            <div v-for="feat in ['Dashboard analitik real-time', 'Manajemen produk & kategori', 'Histori stok masuk & keluar', 'API terproteksi dengan Bearer Token']"
              :key="feat" class="flex items-center gap-3 text-emerald-100">
              <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
              {{ feat }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Kanan: Form Login -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-stone-50">
        <div class="w-full max-w-md">

          <!-- Logo mobile -->
          <div class="lg:hidden mb-10 text-center">
            <div class="w-14 h-14 bg-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
            </div>
            <h1 class="text-2xl font-black text-stone-800">EInventory</h1>
          </div>

          <h2 class="text-3xl font-black text-stone-800 mb-2">Selamat Datang</h2>
          <p class="text-stone-500 mb-10">Masuk ke panel administrator untuk mengelola inventaris.</p>

          <!-- Error alert -->
          <div v-if="error" class="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-sm">{{ error }}</span>
          </div>

          <!-- Form -->
          <div class="space-y-5">
            <!-- Username -->
            <div>
              <label class="block text-stone-500 text-sm font-medium mb-2">Username</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="Masukkan username"
                  @keyup.enter="handleLogin"
                  class="w-full bg-white border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-stone-500 text-sm font-medium mb-2">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  @keyup.enter="handleLogin"
                  class="w-full bg-white border border-emerald-200 text-stone-900 placeholder-slate-500 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-400 hover:text-stone-600 transition-colors">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleLogin"
              :disabled="loading"
              class="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2">
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span>{{ loading ? 'Memproses...' : 'Masuk ke Dashboard' }}</span>
            </button>
          </div>

          <div class="mt-6 text-center">
            <router-link to="/" class="text-stone-500 hover:text-stone-700 text-sm transition-colors">← Kembali ke Beranda</router-link>
          </div>
        </div>
      </div>
    </div>
  `
};
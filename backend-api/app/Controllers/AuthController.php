<?php
// =======================================================
// FILE: app/Controllers/AuthController.php
// FUNGSI: Menangani proses Login dan Logout
//
// Alur Login:
// 1. Frontend kirim POST dengan username & password
// 2. Controller cek ke tabel users
// 3. Jika cocok → generate token unik → simpan ke DB → kembalikan ke frontend
// 4. Frontend simpan token di localStorage
// =======================================================

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class AuthController extends ResourceController
{
    protected $format = 'json'; // Semua response dalam format JSON

    // -------------------------------------------------------
    // POST /api/login
    // Body: { "username": "admin", "password": "admin123" }
    // -------------------------------------------------------
    public function login()
    {
        $db = \Config\Database::connect();

        $username = $this->request->getJSON()->username ?? '';
        $password = $this->request->getJSON()->password ?? '';

        // Cari user berdasarkan username
        $user = $db->table('users')->where('username', $username)->get()->getRow();

        // Validasi: user tidak ada atau password salah
        // Catatan: Untuk produksi, gunakan password_hash() & password_verify()
        if (!$user || $user->password !== $password) {
            return $this->respond([
                'status'  => 401,
                'message' => 'Username atau password salah!'
            ], 401);
        }

        // Generate token unik menggunakan bin2hex(random_bytes)
        // Token ini dijamin tidak bisa ditebak
        $token = bin2hex(random_bytes(32)); // 64 karakter hex

        // Simpan token ke database (tabel users, kolom token)
        $db->table('users')->where('id', $user->id)->update(['token' => $token]);

        // Kembalikan token + info user ke frontend
        return $this->respond([
            'status'  => 200,
            'message' => 'Login berhasil!',
            'data'    => [
                'token' => $token,
                'name'  => $user->name,
                'username' => $user->username,
            ]
        ]);
    }

    // -------------------------------------------------------
    // POST /api/logout  (butuh Bearer Token di header)
    // Fungsi: hapus token dari DB agar tidak bisa dipakai lagi
    // -------------------------------------------------------
    public function logout()
    {
        $db = \Config\Database::connect();

        $authHeader = $this->request->getHeaderLine('Authorization');
        $token = substr($authHeader, 7); // Hapus "Bearer " prefix

        // Kosongkan kolom token di database
        $db->table('users')->where('token', $token)->update(['token' => null]);

        return $this->respond([
            'status'  => 200,
            'message' => 'Logout berhasil. Sesi telah dihapus.'
        ]);
    }
}

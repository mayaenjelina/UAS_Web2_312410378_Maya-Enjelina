<?php
// =======================================================
// FILE: app/Filters/AuthFilter.php
// FUNGSI: Memproteksi endpoint API dengan Bearer Token
//
// Filter ini akan berjalan SEBELUM request masuk ke controller.
// Jika token tidak valid/tidak ada → langsung tolak dengan 401.
// =======================================================

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Ambil header Authorization dari request
        // Format yang diterima: "Bearer <token_string>"
        $authHeader = $request->getHeaderLine('Authorization');

        // Cek apakah header ada dan diawali "Bearer "
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()
                ->setJSON(['status' => 401, 'message' => 'Token tidak ditemukan. Akses ditolak.'])
                ->setStatusCode(401);
        }

        // Ekstrak token-nya saja (hapus prefix "Bearer ")
        $token = substr($authHeader, 7);

        // Cari token di database tabel users
        $db = \Config\Database::connect();
        $user = $db->table('users')->where('token', $token)->get()->getRow();

        // Jika token tidak cocok dengan siapapun di DB → tolak
        if (!$user) {
            return response()
                ->setJSON(['status' => 401, 'message' => 'Token tidak valid atau sesi telah berakhir.'])
                ->setStatusCode(401);
        }

        // Jika lolos, request diteruskan ke controller
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tidak ada aksi setelah response
    }
    
}

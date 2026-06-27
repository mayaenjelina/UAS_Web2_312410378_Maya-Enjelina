<?php
// =======================================================
// FILE: app/Controllers/CategoryController.php
// FUNGSI: CRUD untuk tabel categories
// ROUTE: /api/categories (Resource Controller CI4)
//
// ResourceController CI4 secara otomatis memetakan:
//   GET    /api/categories      → index()
//   POST   /api/categories      → create()   ← butuh token
//   GET    /api/categories/{id} → show()
//   PUT    /api/categories/{id} → update()   ← butuh token
//   DELETE /api/categories/{id} → delete()   ← butuh token
// =======================================================

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $format = 'json';

    // -------------------------------------------------------
    // GET /api/categories
    // Mengambil semua data kategori (public, no token needed)
    // -------------------------------------------------------
    public function index()
    {
        $db = \Config\Database::connect();

        // Ambil semua kategori beserta jumlah produk di setiap kategori
        $categories = $db->query("
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.id DESC
        ")->getResultArray();

        return $this->respond([
            'status' => 200,
            'data'   => $categories
        ]);
    }

    // -------------------------------------------------------
    // POST /api/categories   ← DIPROTEKSI TOKEN
    // Body: { "category_name": "Nama Kategori" }
    // -------------------------------------------------------
    public function create()
    {
        $db   = \Config\Database::connect();
        $data = $this->request->getJSON(true); // true = return as array

        // Validasi input tidak boleh kosong
        if (empty($data['category_name'])) {
            return $this->respond(['status' => 400, 'message' => 'Nama kategori wajib diisi!'], 400);
        }

        $db->table('categories')->insert([
            'category_name' => $data['category_name'],
        ]);

        return $this->respondCreated([
            'status'  => 201,
            'message' => 'Kategori berhasil ditambahkan!',
            'data'    => ['id' => $db->insertID()]
        ]);
    }

    // -------------------------------------------------------
    // GET /api/categories/{id}
    // Mengambil detail 1 kategori berdasarkan ID
    // -------------------------------------------------------
    public function show($id = null)
    {
        $db       = \Config\Database::connect();
        $category = $db->table('categories')->find($id);

        if (!$category) {
            return $this->failNotFound('Kategori tidak ditemukan!');
        }

        return $this->respond(['status' => 200, 'data' => $category]);
    }

    // -------------------------------------------------------
    // PUT /api/categories/{id}   ← DIPROTEKSI TOKEN
    // Body: { "category_name": "Nama Baru" }
    // -------------------------------------------------------
    public function update($id = null)
    {
        $db       = \Config\Database::connect();
        $data     = $this->request->getJSON(true);
        $category = $db->table('categories')->find($id);

        if (!$category) {
            return $this->failNotFound('Kategori tidak ditemukan!');
        }

        if (empty($data['category_name'])) {
            return $this->respond(['status' => 400, 'message' => 'Nama kategori wajib diisi!'], 400);
        }

        $db->table('categories')->where('id', $id)->update([
            'category_name' => $data['category_name'],
        ]);

        return $this->respond(['status' => 200, 'message' => 'Kategori berhasil diperbarui!']);
    }

    // -------------------------------------------------------
    // DELETE /api/categories/{id}   ← DIPROTEKSI TOKEN
    // -------------------------------------------------------
    public function delete($id = null)
    {
        $db       = \Config\Database::connect();
        $category = $db->table('categories')->find($id);

        if (!$category) {
            return $this->failNotFound('Kategori tidak ditemukan!');
        }

        // Cek apakah ada produk yang memakai kategori ini
        $productCount = $db->table('products')->where('category_id', $id)->countAllResults();
        if ($productCount > 0) {
            return $this->respond([
                'status'  => 409,
                'message' => "Tidak bisa hapus! Ada {$productCount} produk yang menggunakan kategori ini."
            ], 409);
        }

        $db->table('categories')->delete(['id' => $id]);
        return $this->respondDeleted(['status' => 200, 'message' => 'Kategori berhasil dihapus!']);
    }
}

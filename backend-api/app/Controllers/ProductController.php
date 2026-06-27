<?php
// =======================================================
// FILE: app/Controllers/ProductController.php
// FUNGSI: CRUD untuk tabel products (data barang inventaris)
// ROUTE: /api/products
// =======================================================

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class ProductController extends ResourceController
{
    protected $format = 'json';

    // GET /api/products - List semua produk + nama kategorinya (JOIN)
    public function index()
    {
        $db = \Config\Database::connect();

        $products = $db->table('products p')
            ->select('p.*, c.category_name')           // Ambil semua kolom produk + nama kategori
            ->join('categories c', 'c.id = p.category_id') // JOIN ke tabel categories
            ->orderBy('p.id', 'DESC')
            ->get()->getResultArray();

        return $this->respond(['status' => 200, 'data' => $products]);
    }

    // POST /api/products ← DIPROTEKSI TOKEN
    public function create()
    {
        $db   = \Config\Database::connect();
        $data = $this->request->getJSON(true);

        // Validasi field wajib
        $required = ['category_id', 'product_name', 'sku', 'price'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->respond(['status' => 400, 'message' => "Field '{$field}' wajib diisi!"], 400);
            }
        }

        // Cek SKU tidak boleh duplikat
        $existSku = $db->table('products')->where('sku', $data['sku'])->countAllResults();
        if ($existSku > 0) {
            return $this->respond(['status' => 409, 'message' => 'SKU sudah digunakan produk lain!'], 409);
        }

        $db->table('products')->insert([
            'category_id'  => $data['category_id'],
            'product_name' => $data['product_name'],
            'sku'          => strtoupper($data['sku']), // SKU selalu uppercase
            'stock'        => $data['stock'] ?? 0,
            'price'        => $data['price'],
            'supplier'     => $data['supplier'] ?? '',
        ]);

        return $this->respondCreated([
            'status'  => 201,
            'message' => 'Produk berhasil ditambahkan!',
            'data'    => ['id' => $db->insertID()]
        ]);
    }

    // GET /api/products/{id}
    public function show($id = null)
    {
        $db = \Config\Database::connect();

        $product = $db->table('products p')
            ->select('p.*, c.category_name')
            ->join('categories c', 'c.id = p.category_id')
            ->where('p.id', $id)
            ->get()->getRowArray();

        if (!$product) {
            return $this->failNotFound('Produk tidak ditemukan!');
        }

        return $this->respond(['status' => 200, 'data' => $product]);
    }

    // PUT /api/products/{id} ← DIPROTEKSI TOKEN
    public function update($id = null)
    {
        $db      = \Config\Database::connect();
        $data    = $this->request->getJSON(true);

        // PERBAIKAN: find() bukan method Query Builder, gunakan where()->get()->getRowArray()
        $product = $db->table('products')->where('id', $id)->get()->getRowArray();

        if (!$product) {
            return $this->failNotFound('Produk tidak ditemukan!');
        }

        // Jika SKU diubah, pastikan tidak bentrok dengan produk lain
        if (!empty($data['sku'])) {
            $existSku = $db->table('products')
                ->where('sku', $data['sku'])
                ->where('id !=', $id)
                ->countAllResults();
            if ($existSku > 0) {
                return $this->respond(['status' => 409, 'message' => 'SKU sudah digunakan produk lain!'], 409);
            }
        }

        $updateData = [];
        // Hanya update field yang dikirim
        if (isset($data['category_id']))  $updateData['category_id']  = $data['category_id'];
        if (isset($data['product_name'])) $updateData['product_name'] = $data['product_name'];
        if (isset($data['sku']))          $updateData['sku']          = strtoupper($data['sku']);
        if (isset($data['stock']))        $updateData['stock']        = $data['stock'];
        if (isset($data['price']))        $updateData['price']        = $data['price'];
        if (isset($data['supplier']))     $updateData['supplier']     = $data['supplier'];

        $db->table('products')->where('id', $id)->update($updateData);

        return $this->respond(['status' => 200, 'message' => 'Produk berhasil diperbarui!']);
    }

    // DELETE /api/products/{id} ← DIPROTEKSI TOKEN
    public function delete($id = null)
    {
        $db = \Config\Database::connect();

        // PERBAIKAN: find() bukan method Query Builder, gunakan where()->get()->getRowArray()
        $product = $db->table('products')->where('id', $id)->get()->getRowArray();

        if (!$product) {
            return $this->failNotFound('Produk tidak ditemukan!');
        }

        // Stock history akan otomatis terhapus karena ON DELETE CASCADE di database
        $db->table('products')->delete(['id' => $id]);

        return $this->respondDeleted(['status' => 200, 'message' => 'Produk berhasil dihapus!']);
    }
}
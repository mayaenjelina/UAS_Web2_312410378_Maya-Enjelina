<?php
// =======================================================
// FILE: app/Controllers/StockHistoryController.php
// FUNGSI: CRUD untuk tabel stock_history (histori barang masuk/keluar)
//         Setiap kali stok berubah (in/out), otomatis update kolom stock di tabel products
// ROUTE: /api/stock-history
// =======================================================

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class StockHistoryController extends ResourceController
{
    protected $format = 'json';

    // GET /api/stock-history - Semua histori stok dengan nama produk (JOIN)
    public function index()
    {
        $db = \Config\Database::connect();

        $history = $db->table('stock_history sh')
            ->select('sh.*, p.product_name, p.sku')
            ->join('products p', 'p.id = sh.product_id')
            ->orderBy('sh.created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respond(['status' => 200, 'data' => $history]);
    }

    // POST /api/stock-history ← DIPROTEKSI TOKEN
    // Body: { "product_id": 1, "type": "in", "quantity": 10, "notes": "..." }
    public function create()
    {
        $db   = \Config\Database::connect();
        $data = $this->request->getJSON(true);

        // Validasi field wajib
        if (empty($data['product_id']) || empty($data['type']) || empty($data['quantity'])) {
            return $this->respond(['status' => 400, 'message' => 'product_id, type, dan quantity wajib diisi!'], 400);
        }

        // Validasi nilai type hanya boleh 'in' atau 'out'
        if (!in_array($data['type'], ['in', 'out'])) {
            return $this->respond(['status' => 400, 'message' => "Type harus 'in' atau 'out'!"], 400);
        }

        // Validasi quantity harus positif
        if ($data['quantity'] <= 0) {
            return $this->respond(['status' => 400, 'message' => 'Jumlah harus lebih dari 0!'], 400);
        }

        // PERBAIKAN: find() bukan method Query Builder, gunakan where()->get()->getRowArray()
        $product = $db->table('products')->where('id', $data['product_id'])->get()->getRowArray();
        if (!$product) {
            return $this->failNotFound('Produk tidak ditemukan!');
        }

        // Jika stok keluar, pastikan stok mencukupi
        if ($data['type'] === 'out' && $product['stock'] < $data['quantity']) {
            return $this->respond([
                'status'  => 400,
                'message' => "Stok tidak mencukupi! Stok saat ini: {$product['stock']}"
            ], 400);
        }

        // Insert ke tabel stock_history
        $db->table('stock_history')->insert([
            'product_id' => $data['product_id'],
            'type'       => $data['type'],
            'quantity'   => $data['quantity'],
            'notes'      => $data['notes'] ?? '',
        ]);

        // ★ Update stok di tabel products
        // Jika type 'in' → stok bertambah; jika 'out' → stok berkurang
        if ($data['type'] === 'in') {
            $db->query("UPDATE products SET stock = stock + ? WHERE id = ?", [$data['quantity'], $data['product_id']]);
        } else {
            $db->query("UPDATE products SET stock = stock - ? WHERE id = ?", [$data['quantity'], $data['product_id']]);
        }

        return $this->respondCreated([
            'status'  => 201,
            'message' => 'Histori stok berhasil dicatat dan stok produk telah diperbarui!'
        ]);
    }

    // GET /api/stock-history/{id}
    public function show($id = null)
    {
        $db = \Config\Database::connect();

        $history = $db->table('stock_history sh')
            ->select('sh.*, p.product_name, p.sku')
            ->join('products p', 'p.id = sh.product_id')
            ->where('sh.id', $id)
            ->get()->getRowArray();

        if (!$history) {
            return $this->failNotFound('Data histori tidak ditemukan!');
        }

        return $this->respond(['status' => 200, 'data' => $history]);
    }

    // DELETE /api/stock-history/{id} ← DIPROTEKSI TOKEN
    public function delete($id = null)
    {
        $db = \Config\Database::connect();

        // PERBAIKAN: find() bukan method Query Builder, gunakan where()->get()->getRowArray()
        $history = $db->table('stock_history')->where('id', $id)->get()->getRowArray();

        if (!$history) {
            return $this->failNotFound('Data histori tidak ditemukan!');
        }

        $db->table('stock_history')->delete(['id' => $id]);

        return $this->respondDeleted(['status' => 200, 'message' => 'Histori stok berhasil dihapus!']);
    }

    // update() - histori stok tidak diubah (immutable), kembalikan error
    public function update($id = null)
    {
        return $this->respond(['status' => 405, 'message' => 'Histori stok tidak dapat diubah!'], 405);
    }
}
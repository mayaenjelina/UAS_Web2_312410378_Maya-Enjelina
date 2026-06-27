<?php
// =======================================================
// FILE: app/Controllers/DashboardController.php
// FUNGSI: Menyediakan statistik untuk Beranda (publik) & Dashboard (admin)
//
// - publicSummary() -> AKSES: Bebas, hanya ringkasan total (sesuai User Matrix)
// - index()         -> AKSES: Wajib login (Bearer Token), data lengkap untuk Admin
// =======================================================

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class DashboardController extends ResourceController
{
    protected $format = 'json';

    // -------------------------------------------------------
    // GET /api/public/summary
    // AKSES: Publik (tanpa token) - untuk halaman Beranda/Landing Page
    // Hanya berisi total ringkasan, TANPA detail produk/histori
    // -------------------------------------------------------
    public function publicSummary()
    {
        $db = \Config\Database::connect();

        $totalProducts   = $db->table('products')->countAllResults();
        $totalCategories = $db->table('categories')->countAllResults();
        $totalStock      = $db->table('products')->selectSum('stock')->get()->getRow()->stock ?? 0;
        $inventoryValue  = $db->query('SELECT SUM(stock * price) as total_value FROM products')->getRow()->total_value ?? 0;

        return $this->respond([
            'status' => 200,
            'data'   => [
                'total_products'   => (int) $totalProducts,
                'total_categories' => (int) $totalCategories,
                'total_stock'      => (int) $totalStock,
                'inventory_value'  => (float) $inventoryValue,
            ]
        ]);
    }

    // -------------------------------------------------------
    // GET /api/dashboard
    // AKSES: WAJIB LOGIN (Bearer Token) - Dashboard utama Admin
    // Berisi data lengkap termasuk low stock & histori terbaru
    // -------------------------------------------------------
    public function index()
    {
        $db = \Config\Database::connect();

        // Hitung total produk
        $totalProducts = $db->table('products')->countAllResults();

        // Hitung total kategori
        $totalCategories = $db->table('categories')->countAllResults();

        // Hitung total stok (sum semua kolom stock)
        $totalStock = $db->table('products')->selectSum('stock')->get()->getRow()->stock ?? 0;

        // Hitung nilai inventaris (stock × price untuk setiap produk)
        $inventoryValue = $db->query('SELECT SUM(stock * price) as total_value FROM products')->getRow()->total_value ?? 0;

        // Ambil 5 produk dengan stok terbawah (potensi kehabisan)
        $lowStockProducts = $db->table('products p')
            ->select('p.product_name, p.sku, p.stock, c.category_name')
            ->join('categories c', 'c.id = p.category_id')
            ->orderBy('p.stock', 'ASC')
            ->limit(5)
            ->get()->getResultArray();

        // Ambil 5 histori stok terbaru
        $recentHistory = $db->table('stock_history sh')
            ->select('sh.*, p.product_name')
            ->join('products p', 'p.id = sh.product_id')
            ->orderBy('sh.created_at', 'DESC')
            ->limit(5)
            ->get()->getResultArray();

        return $this->respond([
            'status' => 200,
            'data'   => [
                'total_products'    => (int) $totalProducts,
                'total_categories'  => (int) $totalCategories,
                'total_stock'       => (int) $totalStock,
                'inventory_value'   => (float) $inventoryValue,
                'low_stock_products'=> $lowStockProducts,
                'recent_history'    => $recentHistory,
            ]
        ]);
    }
}

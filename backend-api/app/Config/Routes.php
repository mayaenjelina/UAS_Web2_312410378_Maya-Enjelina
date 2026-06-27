<?php
use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

// ===== PUBLIC (tanpa login) =====
$routes->post('api/login', 'AuthController::login');
$routes->get('api/public/summary', 'DashboardController::publicSummary');

// ===== ADMIN (wajib login - dilindungi filter 'auth' di Filters.php) =====
$routes->post('api/logout', 'AuthController::logout');
$routes->get('api/dashboard', 'DashboardController::index');
$routes->resource('api/categories', ['controller' => 'CategoryController']);
$routes->resource('api/products',   ['controller' => 'ProductController']);
$routes->resource('api/stock-history', ['controller' => 'StockHistoryController']);
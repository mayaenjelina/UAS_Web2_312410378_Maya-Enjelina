<?php
// =======================================================
// FILE: app/Filters/CorsFilter.php
// FUNGSI: Mengizinkan request lintas-origin (dari frontend Vue)
//
// Tanpa filter ini, browser akan BLOKIR semua request dari
// frontend (port 5500 misalnya) ke backend (port 8080).
// Filter ini menambahkan header izin ke setiap response.
// =======================================================

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Tangani preflight request (method OPTIONS dari browser)
        // Browser mengirim OPTIONS dulu sebelum POST/PUT/DELETE
        if ($request->getMethod() === 'options') {
            $response = service('response');
            $response->setHeader('Access-Control-Allow-Origin', '*')
                     ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                     ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                     ->setStatusCode(200);
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tambahkan header CORS ke semua response normal
        $response->setHeader('Access-Control-Allow-Origin', '*')
                 ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                 ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
}

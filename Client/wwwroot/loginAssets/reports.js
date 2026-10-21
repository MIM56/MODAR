// ============================================
// REPORTS MAIN FILE
// File: wwwroot/js/reports/reports.js
// ============================================

// Catatan: Variabel allReports, currentPage, itemsPerPage, dan filteredReports 
// seharusnya sudah dideklarasikan di file reports-table.js. 
// Jika belum, pastikan file reports-table.js di-load sebelum file ini.

/**
 * Fungsi utama untuk memuat data reports dari API
 */
async function loadReports() {
    try {
        // 1. Validasi Token
        if (!isTokenValid()) {
            redirectToLogin();
            return;
        }

        const token = getToken();
        console.log("📡 Memuat reports dari:", `${API_BASE_URL}/api/Reports`);
        console.log("🔑 Token:", token ? token.substring(0, 30) + "..." : "Tidak ada");
        
        // 2. Request ke API
        const response = await fetch(`${API_BASE_URL}/api/Reports`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        console.log("📥 Response status:", response.status);

        // 3. Handle HTTP Error
        if (!response.ok) {
            if (response.status === 401) {
                console.error("🔑 Token tidak valid atau expired");
                redirectToLogin();
                return;
            }
            throw new Error(`Failed to load reports: HTTP ${response.status}`);
        }

        // 4. Parse JSON dengan aman (menggunakan built-in response.json())
        const result = await response.json();
        console.log("✅ Parsed result:", result);

        // 5. Ekstrak Data Array (menangani berbagai format response backend)
        allReports = [];
        if (result && result.statusCode === 200 && result.data) {
            allReports = result.data;
        } else if (result && result.statusCode === 201 && result.data) {
            allReports = result.data;
        } else if (Array.isArray(result)) {
            allReports = result;
        } else if (result && result.data && Array.isArray(result.data)) {
            allReports = result.data; // Fallback untuk format wrapper lainnya
        }

        console.log("📊 Total reports loaded:", allReports.length);

        // 6. Reset Pagination & Render
        filteredReports = [...allReports];
        currentPage = 1;

        // Safety check: Pastikan fungsi render ada (dari reports-table.js)
        if (typeof renderTable === 'function' && typeof renderPagination === 'function') {
            renderTable();
            renderPagination();
        } else {
            console.error("❌ Fungsi renderTable atau renderPagination tidak ditemukan. Cek urutan load script.");
        }

    } catch (error) {
        console.error('❌ Error loading reports:', error);
        showErrorState(error.message);
    }
}

/**
 * Fungsi helper untuk menampilkan UI Error di dalam tabel
 */
function showErrorState(errorMessage) {
    const tbody = document.getElementById('report');
    const noDataDiv = document.getElementById('noData');
    const table = document.getElementById('tableReports');
    const token = getToken();

    // Safety check untuk elemen DOM
    if (table && tbody) {
        table.style.display = 'table';
        if (noDataDiv) noDataDiv.style.display = 'none';

        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-5">
                    <div class="alert alert-warning" role="alert">
                        <h5 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Error Loading Reports</h5>
                        <p class="mb-2"><strong>Error:</strong> ${errorMessage}</p>
                        <p class="mb-2"><strong>API URL:</strong> ${API_BASE_URL}/api/Reports</p>
                        <p class="mb-2"><strong>Token:</strong> ${token ? '✅ Ada' : '❌ Tidak ada'}</p>
                        <hr>
                        <p class="mb-0">
                            <button class="btn btn-sm btn-primary me-2" onclick="loadReports()">
                                <i class="fas fa-redo me-1"></i>Retry
                            </button>
                            <button class="btn btn-sm btn-info" onclick="checkAPIStatus()">
                                <i class="fas fa-stethoscope me-1"></i>Check API
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="doLogout()">
                                <i class="fas fa-sign-out-alt me-1"></i>Login Ulang
                            </button>
                        </p>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Fungsi untuk mengecek status API secara manual (untuk debugging)
 */
async function checkAPIStatus() {
    const token = getToken();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/Reports`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const responseText = await response.text();

        Swal.fire({
            title: 'API Status Check',
            html: `
                <div class="text-start">
                    <p><strong>API Base URL:</strong> ${API_BASE_URL}</p>
                    <p><strong>Endpoint:</strong> /api/Reports</p>
                    <p><strong>Status Code:</strong> ${response.status}</p>
                    <p><strong>Token:</strong> ${token ? '✅ Ada (' + token.substring(0, 30) + '...)' : '❌ Tidak ada'}</p>
                    <hr>
                    <p><strong>Response:</strong></p>
                    <pre style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">${responseText}</pre>
                </div>
            `,
            icon: response.ok ? 'success' : 'warning',
            width: 600,
            confirmButtonColor: '#667eea'
        });
    } catch (error) {
        Swal.fire({
            title: 'API Unreachable',
            html: `
                <div class="text-start">
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>API Base URL:</strong> ${API_BASE_URL}</p>
                    <p><strong>Pastikan:</strong></p>
                    <ul class="text-start">
                        <li>Backend API berjalan di port 7261</li>
                        <li>CORS sudah dikonfigurasi di Program.cs</li>
                        <li>SSL certificate valid (https)</li>
                    </ul>
                </div>
            `,
            icon: 'error',
            width: 600,
            confirmButtonColor: '#e74c3c'
        });
    }
}

/**
 * Inisialisasi saat halaman selesai dimuat
 */
$(document).ready(function() {
    console.log("📄 Document ready");
    console.log("📍 Current URL:", window.location.href);
    console.log("📦 localStorage keys:", Object.keys(localStorage));
    
    const token = getToken();
    
    if (!token) {
        console.error("❌ Token tidak ditemukan!");
        console.log("🔄 Redirecting to login page...");
        // Gunakan window.location.replace agar tidak bisa di-back oleh browser
        window.location.replace('/Login/Index');
    } else {
        console.log("✅ Token ditemukan, memulai load reports...");
        loadReports();
    }
});






// ============================================
// REPORTS MAIN FILE
// ============================================

// Fungsi untuk load reports dari API
// async function loadReports() {
//     try {
//         if (!isTokenValid()) {
//             redirectToLogin();
//             return;
//         }

//         const token = getToken();
//         if (!token) {
//             redirectToLogin();
//             return;
//         }

//         console.log("📡 Memuat reports dari:", `${API_BASE_URL}/api/Reports`);
//         console.log("🔑 Token:", token.substring(0, 30) + "...");
        
//         const response = await fetch(`${API_BASE_URL}/api/Reports`, {
//             method: 'GET',
//             headers: getAuthHeaders()
//         });

//         console.log("📥 Response status:", response.status);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 console.error(" Token tidak valid atau expired");
//                 redirectToLogin();
//                 return;
//             }
//             throw new Error(`Failed to load reports: ${response.status}`);
//         }

//         const responseText = await response.text();
//         let result;
//         try {
//             result = JSON.parse(responseText);
//         } catch (e) {
//             throw new Error('Invalid JSON response from server');
//         }

//         console.log("✅ Parsed result:", result);

//         allReports = [];
//         if (result.statusCode === 200 && result.data) {
//             allReports = result.data;
//         } else if (result.statusCode === 201 && result.data) {
//             allReports = result.data;
//         } else if (Array.isArray(result)) {
//             allReports = result;
//         }

//         console.log("📊 Total reports loaded:", allReports.length);

//         filteredReports = [...allReports];
//         currentPage = 1;

//         renderTable();
//         renderPagination();

//     } catch (error) {
//         console.error('❌ Error loading reports:', error);

//         const tbody = document.getElementById('report');
//         const noDataDiv = document.getElementById('noData');
//         const table = document.getElementById('tableReports');
//         const token = getToken();

//         table.style.display = 'table';
//         noDataDiv.style.display = 'none';

//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="10" class="text-center py-5">
//                     <div class="alert alert-warning" role="alert">
//                         <h5 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Error Loading Reports</h5>
//                         <p class="mb-2"><strong>Error:</strong> ${error.message}</p>
//                         <p class="mb-2"><strong>API URL:</strong> ${API_BASE_URL}/api/Reports</p>
//                         <p class="mb-2"><strong>Token:</strong> ${token ? '✅ Ada' : '❌ Tidak ada'}</p>
//                         <hr>
//                         <p class="mb-0">
//                             <button class="btn btn-sm btn-primary me-2" onclick="loadReports()">
//                                 <i class="fas fa-redo me-1"></i>Retry
//                             </button>
//                             <button class="btn btn-sm btn-info" onclick="checkAPIStatus()">
//                                 <i class="fas fa-stethoscope me-1"></i>Check API
//                             </button>
//                             <button class="btn btn-sm btn-danger" onclick="doLogout()">
//                                 <i class="fas fa-sign-out-alt me-1"></i>Login Ulang
//                             </button>
//                         </p>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     }
// }

// Fungsi untuk check API status
// async function checkAPIStatus() {
//     const token = getToken();
    
//     try {
//         const response = await fetch(`${API_BASE_URL}/api/Reports`, {
//             method: 'GET',
//             headers: getAuthHeaders()
//         });

//         const responseText = await response.text();

//         Swal.fire({
//             title: 'API Status Check',
//             html: `
//                 <div class="text-start">
//                     <p><strong>API Base URL:</strong> ${API_BASE_URL}</p>
//                     <p><strong>Endpoint:</strong> /api/Reports</p>
//                     <p><strong>Status Code:</strong> ${response.status}</p>
//                     <p><strong>Token:</strong> ${token ? '✅ Ada (' + token.substring(0, 30) + '...)' : '❌ Tidak ada'}</p>
//                     <hr>
//                     <p><strong>Response:</strong></p>
//                     <pre style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">${responseText}</pre>
//                 </div>
//             `,
//             icon: response.ok ? 'success' : 'warning',
//             width: 600,
//             confirmButtonColor: '#667eea'
//         });
//     } catch (error) {
//         Swal.fire({
//             title: 'API Unreachable',
//             html: `
//                 <div class="text-start">
//                     <p><strong>Error:</strong> ${error.message}</p>
//                     <p><strong>API Base URL:</strong> ${API_BASE_URL}</p>
//                     <p><strong>Pastikan:</strong></p>
//                     <ul class="text-start">
//                         <li>API berjalan di port 7261</li>
//                         <li>CORS sudah dikonfigurasi</li>
//                         <li>SSL certificate valid</li>
//                     </ul>
//                 </div>
//             `,
//             icon: 'error',
//             width: 600,
//             confirmButtonColor: '#e74c3c'
//         });
//     }
// }

// Document ready - inisialisasi halaman
// $(document).ready(function() {
//     console.log("📄 Document ready");
//     console.log(" Current URL:", window.location.href);
//     console.log("📦 localStorage keys:", Object.keys(localStorage));
    
//     const token = getToken();
    
//     if (!token) {
//         console.error("❌ Token tidak ditemukan!");
//         console.log("🔄 Redirecting to login page...");
//         window.location.href = '/Login/Index';
//     } else {
//         console.log("✅ Token ditemukan, loading reports...");
//         loadReports();
//     }
// });
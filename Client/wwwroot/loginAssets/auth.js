const API_BASE_URL = 'https://localhost:7261';

// 1. Fungsi untuk mendapatkan token dari localStorage
function getToken() {
    const token = localStorage.getItem('token');
    const jwtToken = localStorage.getItem('JWToken');
    const authToken = localStorage.getItem('authToken');
    
    console.log("🔍 Checking localStorage for token:");
    console.log("   - token:", token ? "✅ FOUND" : "❌ NOT FOUND");
    console.log("   - JWToken:", jwtToken ? "✅ FOUND" : "❌ NOT FOUND");
    console.log("   - authToken:", authToken ? "✅ FOUND" : "❌ NOT FOUND");
    
    return token || jwtToken || authToken;
}

// 2. Fungsi untuk mengecek validitas token (termasuk expiration)
function isTokenValid() {
    const token = getToken();
    if (!token) {
        console.error("❌ Token tidak ditemukan di localStorage");
        return false;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error("❌ Token format invalid");
            return false;
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const payload = JSON.parse(jsonPayload);
        const exp = payload.exp;

        if (exp) {
            const expiryDate = new Date(exp * 1000);
            const now = new Date();
            
            if (now > expiryDate) {
                console.error("❌ Token sudah expired pada:", expiryDate.toLocaleString());
                return false;
            }
            
            console.log("✅ Token valid. Expires:", expiryDate.toLocaleString());
            return true;
        }

        return true;
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return false;
    }
}

// 3. Fungsi untuk mendapatkan email dari JWT (dengan fallback yang kuat)
function getEmailFromJWT() {
    // A. Coba ambil dari localStorage dulu (lebih cepat dan aman)
    const storedEmail = localStorage.getItem('userEmail');
    console.log("📧 Stored email from localStorage:", storedEmail);
    
    if (storedEmail && storedEmail !== 'Unknown' && storedEmail !== '') {
        return storedEmail;
    }

    // B. Jika tidak ada, decode dari token
    const token = getToken();
    if (!token) {
        console.warn("⚠️ Token tidak ditemukan, menggunakan email default");
        return 'employee@modar.com'; // Fallback email agar field tidak kosong
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error("❌ Token format invalid");
            return 'employee@modar.com';
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const payload = JSON.parse(jsonPayload);
        console.log("📄 Decoded JWT Payload:", payload);
        
        // C. Coba berbagai kemungkinan claim email dari backend
        const email = payload.email || 
                     payload.Email || 
                     payload.unique_name || 
                     payload.sub || 
                     'employee@modar.com';
        
        console.log("✅ Email extracted from JWT:", email);
        
        // Simpan ke localStorage untuk penggunaan selanjutnya (agar tidak perlu decode ulang)
        localStorage.setItem('userEmail', email);
        return email;
    } catch (error) {
        console.error('❌ Error decoding JWT:', error);
        return 'employee@modar.com'; // Fallback terakhir
    }
}

// 4. Fungsi untuk mendapatkan headers dengan authorization
function getAuthHeaders() {
    const token = getToken();
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("🔑 Authorization header set: Bearer " + token.substring(0, 30) + "...");
    } else {
        console.error("❌ Token tidak ditemukan saat membuat headers!");
    }
    
    return headers;
}

// 5. Fungsi untuk logout (global)
function doLogout() {
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, Logout',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("🚪 Logging out...");
            localStorage.clear();
            sessionStorage.clear();
            
            // Hapus cookie
            document.cookie = 'JWToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
            
            console.log("✅ Logout successful. Redirecting to login...");
            window.location.href = '/Login/Index';
        }
    });
}

// 6. Fungsi untuk redirect ke login
function redirectToLogin() {
    console.log("⚠️ Session expired or invalid, redirecting to login...");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/Login/Index';
}

// 7. Fungsi untuk decode JWT (Helper)
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("❌ Failed to decode JWT:", e);
        return {};
    }
}





// ============================================
// SHARED AUTHENTICATION FUNCTIONS
// Untuk semua halaman yang butuh auth
// ============================================

// const API_BASE_URL = 'https:localhost:7261';

// Fungsi untuk mendapatkan token dari localStorage
// function getToken() {
//     const token = localStorage.getItem('token');
//     const jwtToken = localStorage.getItem('JWToken');
//     const authToken = localStorage.getItem('authToken');
    
//     console.log("🔍 Checking localStorage for token:");
//     console.log("   - token:", token ? "✅ FOUND" : "❌ NOT FOUND");
//     console.log("   - JWToken:", jwtToken ? "✅ FOUND" : "❌ NOT FOUND");
//     console.log("   - authToken:", authToken ? "✅ FOUND" : "❌ NOT FOUND");
    
//     return token || jwtToken || authToken;
// }

// Fungsi untuk mengecek validitas token
// function isTokenValid() {
//     const token = getToken();
//     if (!token) {
//         console.error(" Token tidak ditemukan di localStorage");
//         return false;
//     }

//     try {
//         const parts = token.split('.');
//         if (parts.length !== 3) {
//             console.error("❌ Token format invalid");
//             return false;
//         }

//         const base64Url = parts[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
//             '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//         ).join(''));

//         const payload = JSON.parse(jsonPayload);
//         const exp = payload.exp;

//         if (exp) {
//             const expiryDate = new Date(exp * 1000);
//             const now = new Date();
            
//             if (now > expiryDate) {
//                 console.error("❌ Token sudah expired pada:", expiryDate.toLocaleString());
//                 return false;
//             }
            
//             console.log("✅ Token valid. Expires:", expiryDate.toLocaleString());
//             return true;
//         }

//         return true;
//     } catch (error) {
//         console.error("❌ Error decoding token:", error);
//         return false;
//     }
// }

// Fungsi untuk mendapatkan email dari JWT
// function getEmailFromJWT() {
//     const storedEmail = localStorage.getItem('userEmail');
//     if (storedEmail && storedEmail !== 'Unknown') {
//         return storedEmail;
//     }

//     const token = getToken();
//     if (!token) return 'Unknown';

//     try {
//         const parts = token.split('.');
//         if (parts.length !== 3) return 'Unknown';

//         const base64Url = parts[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
//             '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//         ).join(''));

//         const payload = JSON.parse(jsonPayload);
//         const email = payload.email || payload.Email || payload.sub || 'Unknown';
//         localStorage.setItem('userEmail', email);
//         return email;
//     } catch (error) {
//         console.error('Error decoding JWT:', error);
//         return 'Unknown';
//     }
// }

// Fungsi untuk mendapatkan headers dengan authorization
// function getAuthHeaders() {
//     const token = getToken();
//     const headers = { 
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//     };
    
//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//         console.log("🔑 Authorization header:", `Bearer ${token.substring(0, 30)}...`);
//     } else {
//         console.error(" Token tidak ditemukan!");
//     }
    
//     return headers;
// }

// Fungsi untuk logout (global)
// function doLogout() {
//     Swal.fire({
//         title: 'Logout',
//         text: 'Are you sure you want to logout?',
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: '#e74c3c',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Yes, Logout',
//         cancelButtonText: 'Cancel'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             localStorage.clear();
//             sessionStorage.clear();
            
//             Hapus cookie
//             document.cookie = 'JWToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
//             document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
            
//             window.location.href = '/Login/Index';
//         }
//     });
// }

// Fungsi untuk redirect ke login
// function redirectToLogin() {
//     console.log("⚠️ Session expired, redirecting to login...");
//     localStorage.clear();
//     window.location.href = '/Login/Index';
// }

// Fungsi untuk decode JWT
// function parseJwt(token) {
//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
//             '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//         ).join(''));
//         return JSON.parse(jsonPayload);
//     } catch (e) {
//         console.error("❌ Failed to decode JWT:", e);
//         return {};
//     }
// }
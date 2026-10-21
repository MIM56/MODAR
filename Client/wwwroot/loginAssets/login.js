// ==========================================
// LOGIN FUNCTION
// ==========================================
function Login() {
    const email = $("#email").val();
    const password = $("#password").val();

    console.log(" Login attempt:");
    console.log("   Email:", email);
    console.log("   Password:", password ? "***" : "kosong");

    if (!email || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Kosong',
            text: 'Email dan Password wajib diisi!',
            confirmButtonText: 'OK'
        });
        return;
    }

    const loginData = {
        email: email,
        password: password
    };

    console.log("📤 Sending login request to: https://localhost:7261/api/Accounts/Login");
    console.log("Payload:", loginData);

    $.ajax({
        url: "https://localhost:7261/api/Accounts/Login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginData)
    })
    .done((result) => {
        console.log("✅ Login success:", result);
        
        if (result.statusCode === 200 && result.data) {
            const token = result.data;
            
            // ✅ SIMPAN TOKEN
            localStorage.setItem('JWToken', token);
            localStorage.setItem('token', token);
            
            console.log("✅ Token saved to localStorage");
            console.log("   Token:", token.substring(0, 50) + "...");
            
            // Decode JWT
            const decodedToken = parseJwt(token);
            const userEmail = decodedToken?.email || decodedToken?.sub || 'Unknown';
            const role = decodedToken?.role || 'Unknown';
            
            console.log(" User Info:");
            console.log("   Email:", userEmail);
            console.log("   Role:", role);
            
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userRole', role);
            
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: 'Mengalihkan ke dashboard...',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Redirect berdasarkan role
                const roleLower = role.toLowerCase();
                if (roleLower.includes('admin')) {
                    window.location.href = '/Admin/Index';
                } else if (roleLower.includes('manager')) {
                    window.location.href = '/Manager/Index';
                } else {
                    window.location.href = '/Employees/Reports';
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: result.message || 'Email atau Password salah!',
                confirmButtonText: 'OK'
            });
        }
    })
    .fail((error) => {
        console.error("❌ Login error:", error);
        console.error("   Status:", error.status);
        console.error("   Response:", error.responseText);
        
        let errorMessage = 'Login failed!';
        
        if (error.status === 401) {
            errorMessage = 'Email atau Password salah!';
        } else if (error.status === 0) {
            errorMessage = 'API tidak berjalan di port 7261. Pastikan backend sudah dijalankan!';
        } else if (error.responseJSON?.message) {
            errorMessage = error.responseJSON.message;
        } else if (error.statusText) {
            errorMessage = error.statusText;
        }
        
        Swal.fire({
            icon: 'error',
            title: 'Login Error',
            text: errorMessage,
            confirmButtonText: 'OK'
        });
    });
}

// ==========================================
// HELPER: Parse JWT Token
// ==========================================
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}
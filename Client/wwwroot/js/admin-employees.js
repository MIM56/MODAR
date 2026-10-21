// ========================================
// ADMIN EMPLOYEES - JAVASCRIPT
// ========================================

const API_BASE = "https://localhost:7261/api";
let employeesData = [];

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Admin Employees page initialized");
    loadEmployees();
});

// Load Employees
async function loadEmployees() {
    const tbody = document.getElementById('employeesTableBody');

    try {
        console.log("📡 Fetching employees from API...");
        const response = await fetch(`${API_BASE}/Employees`);

        if (!response.ok) {
            throw new Error(`Failed to load employees: ${response.status}`);
        }

        employeesData = await response.json();
        console.log("✅ Employees loaded:", employeesData.length);

        updateStats();
        renderTable(employeesData);

    } catch (error) {
        console.error("❌ Error loading employees:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="loading-state">
                        <p>Failed to load employees: ${error.message}</p>
                        <button onclick="loadEmployees()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Update Stats
function updateStats() {
    const total = employeesData.length;
    const managers = employeesData.filter(e => e.role && e.role.toString().toLowerCase() === 'manager').length;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setVal('totalEmployees', total);
    setVal('totalManagers', managers);
}

// Render Table
function renderTable(employees) {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    if (employees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="loading-state"><p>No employees found</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = employees.map((emp, index) => {
        const email = emp.email || emp.userEmail || 'N/A';
        const role = emp.role || 'Employee';
        const status = emp.status || 'active';
        const statusClass = status.toString().toLowerCase() === 'active' ? 'status-active' : 'status-inactive';

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${email}</strong></td>
                <td>${role}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view"><i class="fas fa-eye"></i> View</button>
                        <button class="btn-action btn-edit"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-action btn-delete"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
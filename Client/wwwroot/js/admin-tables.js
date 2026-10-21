// ========================================
// ADMIN TABLES - FULLY FIXED & OPTIMIZED
// ========================================

const API_BASE = "https://localhost:7261/api";
let employeesData = [];
let projectsData = [];
let reportsData = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log(" Admin Tables initialized");
    initTabs();
    initCreateButtons();
    loadData();
});

// ========================================
// 1. TAB NAVIGATION
// ========================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            this.classList.add('active');
            const targetTab = document.getElementById(`${tabName}Tab`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
            }
        });
    });
}

// ========================================
// 2. INIT CREATE BUTTONS (FIXED)
// ========================================
function initCreateButtons() {
    // --- Create Employee ---
    const createEmployeeBtn = document.getElementById('createEmployeeBtn');
    if (createEmployeeBtn) {
        createEmployeeBtn.addEventListener('click', function () {
            const form = document.getElementById('createEmployeeForm');
            if (form) form.reset();
            const modalEl = document.getElementById('createEmployeeModal');
            if (modalEl) new bootstrap.Modal(modalEl).show();
        });
    }

    // --- Create Report ---
    const createReportBtn = document.getElementById('createReportBtn');
    if (createReportBtn) {
        createReportBtn.addEventListener('click', async function () {
            console.log("➕ Create Report button clicked!");
            const form = document.getElementById('createReportForm');
            if (form) form.reset();

            // Pastikan data project sudah di-load
            if (!projectsData || projectsData.length === 0) {
                console.log("⏳ Loading projects data first...");
                await loadProjects();
            }

            // Isi dropdown project
            populateReportProjectDropdown('createReportProjectId');

            // Reset nilai default
            const progressSelect = document.getElementById('createReportProgressReport');
            if (progressSelect) progressSelect.value = "";

            const statusSelect = document.getElementById('createReportStatus');
            if (statusSelect) statusSelect.value = "0";

            const modalEl = document.getElementById('createReportModal');
            if (modalEl) new bootstrap.Modal(modalEl).show();
        });
    }
}

// ========================================
// 3. DATA LOADING
// ========================================
async function loadData() {
    await loadEmployees();
    await loadProjects();
    await loadReports();
    updateStats();
}

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/Employees`);
        if (response.ok) {
            employeesData = await response.json();
            renderEmployeesTable();
        }
    } catch (error) { console.error("❌ Error loading employees:", error); }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/ProjectLists`);
        if (response.ok) {
            projectsData = await response.json();
            console.log("✅ Projects loaded:", projectsData.length, projectsData);
            renderProjectsTable();
        }
    } catch (error) { console.error("❌ Error loading projects:", error); }
}

async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/Reports`);
        if (response.ok) {
            reportsData = await response.json();
            renderReportsTable();
        }
    } catch (error) { console.error(" Error loading reports:", error); }
}

function updateStats() {
    const el1 = document.getElementById('totalEmployees');
    const el2 = document.getElementById('totalProjects');
    if (el1) el1.textContent = employeesData.length;
    if (el2) el2.textContent = projectsData.length;
}

// ========================================
// 4. HELPER FUNCTIONS
// ========================================
function getEmployeeId(emp) {
    if (emp.id !== undefined && emp.id !== null) return emp.id;
    if (emp.Id !== undefined && emp.Id !== null) return emp.Id;
    return null;
}
function getEmployeeEmail(emp) { return emp.email || emp.Email || ''; }
function getEmployeeRole(emp) { return emp.roleName || emp.role || emp.RoleName || 'Employee'; }
function getEmployeeFirstName(emp) { return emp.firstName || emp.FirstName || ''; }
function getEmployeeLastName(emp) { return emp.lastName || emp.LastName || ''; }
function getEmployeePhone(emp) { return emp.phone || emp.Phone || ''; }
function getEmployeeStatus(emp) { return emp.status || 'Active'; }

// ========================================
// 5. RENDER TABLES
// ========================================
function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    if (employeesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 60px 20px;"><div style="color: #64748b;"><i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i><p style="font-size: 18px; font-weight: 600; margin: 0;">No employees found</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = employeesData.map((emp, index) => {
        const empId = getEmployeeId(emp);
        const statusClass = getEmployeeStatus(emp).toLowerCase() === 'active' ? 'active' : 'inactive';
        return `<tr>
            <td>${index + 1}</td>
            <td><strong>${getEmployeeEmail(emp)}</strong></td>
            <td>${getEmployeeRole(emp)}</td>
            <td><span class="status-badge ${statusClass}">${getEmployeeStatus(emp)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewEmployee(${empId})" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn-action btn-edit" onclick="editEmployee(${empId})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteEmployee(${empId})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function renderProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;
    if (projectsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 60px 20px;"><div style="color: #64748b;"><i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i><p style="font-size: 18px; font-weight: 600; margin: 0;">No projects found</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = projectsData.map((proj, index) => {
        const statusClass = proj.status === 1 ? 'on-progress' : (proj.status === 2 ? 'done' : 'pending');
        const statusText = proj.status === 1 ? 'On Progress' : (proj.status === 2 ? 'Done' : 'Pending');
        const projId = proj.id || proj.Id || index;
        const startDate = proj.startDate ? new Date(proj.startDate).toLocaleDateString('en-GB') : '-';
        const endDate = proj.endDate ? new Date(proj.endDate).toLocaleDateString('en-GB') : '-';
        const managerName = proj.managerName || proj.manager || 'N/A';
        return `<tr>
            <td>${index + 1}</td>
            <td><strong>${proj.name || proj.title || 'Untitled'}</strong></td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${managerName}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewProject('${projId}')" title="View"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function renderReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    if (reportsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 60px 20px;"><div style="color: #64748b;"><i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i><p style="font-size: 18px; font-weight: 600; margin: 0;">No reports found</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = reportsData.map((rep, index) => {
        const statusClass = rep.status === 1 ? 'on-progress' : (rep.status === 2 ? 'done' : 'pending');
        const statusText = rep.status === 1 ? 'On Progress' : (rep.status === 2 ? 'Done' : 'Pending');
        const repId = rep.id || rep.Id || index;
        const dateStr = rep.date ? new Date(rep.date).toLocaleDateString('en-GB') : '-';
        const doneByName = rep.doneByName || rep.doneBy || 'N/A';
        const progressDisplay = rep.progressReport ? `${rep.progressReport}%` : '-';
        return `<tr>
            <td>${index + 1}</td>
            <td><strong>${rep.title || 'Untitled'}</strong></td>
            <td>${dateStr}</td>
            <td><strong>${progressDisplay}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${doneByName}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewReport('${repId}')" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn-action btn-edit" onclick="editReport('${repId}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteReport('${repId}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ========================================
// 6. EMPLOYEE CRUD
// ========================================
async function submitCreateEmployee() {
    const email = document.getElementById('createEmail').value.trim();
    const password = document.getElementById('createPassword').value.trim();
    const role = document.getElementById('createRole').value;
    const firstName = document.getElementById('createFirstName').value.trim();
    const lastName = document.getElementById('createLastName').value.trim();
    const phone = document.getElementById('createPhone') ? document.getElementById('createPhone').value.trim() : '';

    if (!email || !password || !role) {
        swal("Validation Error", "Please fill in Email, Password, and Role", "warning");
        return;
    }

    const employeeData = { email, password, role, firstName, lastName, phone: phone || '00000000000' };

    try {
        const response = await fetch(`${API_BASE}/Employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });

        if (response.ok) {
            swal("Success!", `Employee "${email}" created successfully!`, "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById('createEmployeeModal'));
            if (modal) modal.hide();
            await loadEmployees();
            updateStats();
        } else {
            swal("Error", `Failed: ${await response.text()}`, "error");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

function editEmployee(id) {
    const emp = employeesData.find(e => getEmployeeId(e) == id || getEmployeeId(e).toString() === id.toString());
    if (!emp) { swal("Error", "Employee not found", "error"); return; }

    const safeSet = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val !== undefined && val !== null ? val : ''; };

    safeSet('editEmployeeId', getEmployeeId(emp));
    safeSet('editEmail', getEmployeeEmail(emp));
    safeSet('editPhone', getEmployeePhone(emp));
    safeSet('editRole', getEmployeeRole(emp));
    safeSet('editFirstName', getEmployeeFirstName(emp));
    safeSet('editLastName', getEmployeeLastName(emp));
    safeSet('editStatus', getEmployeeStatus(emp));

    new bootstrap.Modal(document.getElementById('editEmployeeModal')).show();
}

async function submitEditEmployee() {
    const id = document.getElementById('editEmployeeId').value;
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const role = document.getElementById('editRole').value;
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const status = document.getElementById('editStatus').value;

    if (!email || !role) { swal("Validation Error", "Please fill in Email and Role", "warning"); return; }

    const employeeData = { email, phone, role, firstName, lastName, status };

    try {
        const response = await fetch(`${API_BASE}/Employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });

        if (response.ok) {
            swal("Success!", "Employee updated successfully!", "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
            if (modal) modal.hide();
            await loadEmployees();
        } else {
            swal("Error", `Failed: ${await response.text()}`, "error");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

async function deleteEmployee(id) {
    const emp = employeesData.find(e => getEmployeeId(e) == id || getEmployeeId(e).toString() === id.toString());
    if (!emp) return;

    swal({
        title: "Are you sure?",
        text: `Delete employee "${getEmployeeEmail(emp)}"?`,
        icon: "warning",
        buttons: { cancel: { text: "Cancel", value: null, visible: true, className: "swal-cancel-btn", closeModal: true }, confirm: { text: "Yes, delete!", value: true, visible: true, className: "swal-danger-btn", closeModal: true } },
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
                const response = await fetch(`${API_BASE}/Employees/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    swal("Deleted!", "Employee has been deleted.", "success");
                    await loadEmployees();
                    updateStats();
                } else {
                    swal("Error", `Failed: ${await response.text()}`, "error");
                }
            } catch (error) {
                swal("Error", "Failed to delete employee.", "error");
            }
        }
    });
}

function viewEmployee(id) {
    const emp = employeesData.find(e => getEmployeeId(e) == id || getEmployeeId(e).toString() === id.toString());
    if (!emp) return;

    swal({
        title: "Employee Details",
        text: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: `
                    <div style="text-align: left; padding: 10px; color: #0f172a !important;">
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Email:</strong><span>${getEmployeeEmail(emp)}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Name:</strong><span>${getEmployeeFirstName(emp)} ${getEmployeeLastName(emp)}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Role:</strong><span>${getEmployeeRole(emp)}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Phone:</strong><span>${getEmployeePhone(emp) || 'N/A'}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Status:</strong><span class="status-badge ${getEmployeeStatus(emp).toLowerCase() === 'active' ? 'active' : 'inactive'}" style="margin-left: 10px;">${getEmployeeStatus(emp)}</span></div>
                    </div>`,
                style: "font-size: 14px; line-height: 1.8;"
            }
        },
        icon: "info",
        buttons: { confirm: { text: "OK", value: true, visible: true, className: "btn btn-primary", closeModal: true } }
    });
}

// ========================================
// 7. REPORT CRUD (FIXED - PROJECT ID AS STRING)
// ========================================

// ✅ HELPER: Populate Project Dropdown
function populateReportProjectDropdown(elementId, selectedValue = '') {
    const select = document.getElementById(elementId);
    if (!select) return false;

    select.innerHTML = '<option value="">Select Project</option>';

    if (!projectsData || projectsData.length === 0) {
        select.innerHTML = '<option value="">No projects available</option>';
        return false;
    }

    console.log("📋 Populating projects dropdown:", projectsData);

    projectsData.forEach(proj => {
        const option = document.createElement('option');
        // ✅ PENTING: Gunakan proj.id sebagai string, jangan di-parseInt
        option.value = proj.id || proj.Id || '';
        option.textContent = proj.name || proj.title || 'Untitled Project';

        if (proj.id == selectedValue || proj.Id == selectedValue || proj.id === selectedValue) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    console.log(`✅ Populated ${elementId} with ${projectsData.length} projects`);
    return true;
}

function viewReport(id) {
    const rep = reportsData.find(r => (r.id || r.Id) == id || (r.id || r.Id).toString() === id.toString());
    if (!rep) return;

    const statusText = rep.status === 1 ? 'On Progress' : (rep.status === 2 ? 'Done' : 'Pending');
    const dateStr = rep.date ? new Date(rep.date).toLocaleDateString('en-GB') : '-';
    const projectName = rep.projectName || (rep.projectId ? `Project ${rep.projectId}` : 'N/A');
    const doneByName = rep.doneByName || 'N/A';
    const progressDisplay = rep.progressReport ? `${rep.progressReport}%` : 'N/A';

    swal({
        title: "Report Details",
        text: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: `
                    <div style="text-align: left; padding: 10px; color: #0f172a !important;">
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Title:</strong><span>${rep.title || 'N/A'}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Project:</strong><span>${projectName}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Date:</strong><span>${dateStr}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Status:</strong><span>${statusText}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Progress:</strong><span>${progressDisplay}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Done By:</strong><span>${doneByName}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Desc:</strong><span>${rep.description || 'N/A'}</span></div>
                    </div>`,
                style: "font-size: 14px; line-height: 1.8;"
            }
        },
        icon: "info",
        buttons: { confirm: { text: "OK", value: true, visible: true, className: "btn btn-primary", closeModal: true } }
    });
}

function editReport(id) {
    const rep = reportsData.find(r => (r.id || r.Id) == id || (r.id || r.Id).toString() === id.toString());
    if (!rep) { swal("Error", "Report not found", "error"); return; }

    populateReportProjectDropdown('editReportProjectId', rep.projectId);

    const safeSet = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val !== undefined && val !== null ? val.toString() : ''; };

    safeSet('editReportId', rep.id);
    safeSet('editReportTitle', rep.title || '');
    safeSet('editReportDescription', rep.description || '');
    safeSet('editReportDate', rep.date ? new Date(rep.date).toISOString().split('T')[0] : '');
    safeSet('editReportProgressReport', rep.progressReport !== undefined ? rep.progressReport.toString() : '');
    safeSet('editReportStatus', rep.status !== undefined ? rep.status.toString() : '0');

    new bootstrap.Modal(document.getElementById('editReportModal')).show();
}

// ✅ FIXED: Submit Create Report - PROJECT ID AS STRING
async function submitCreateReport() {
    const title = document.getElementById('createReportTitle').value.trim();
    const description = document.getElementById('createReportDescription').value.trim();
    const date = document.getElementById('createReportDate').value;
    const progressReport = document.getElementById('createReportProgressReport').value;
    const projectId = document.getElementById('createReportProjectId').value;
    const status = document.getElementById('createReportStatus').value;
    const doneBy = 1;

    console.log(" Form values:", {
        title,
        description,
        date,
        progressReport,
        projectId,
        status
    });

    // 1. Validasi ProjectId - PENTING!
    if (!projectId || projectId === "" || projectId === "null" || projectId === "undefined") {
        swal("Validation Error", "Please select a project from the dropdown", "warning");
        const projectSelect = document.getElementById('createReportProjectId');
        if (projectSelect) {
            projectSelect.classList.add('is-invalid');
            projectSelect.focus();
        }
        return;
    }

    // 2. Validasi lainnya
    if (!title || title.length < 3 || title.length > 100) {
        swal("Validation Error", "Report title must be between 3-100 characters", "warning"); return;
    }
    if (!description || description.length < 10 || description.length > 1000) {
        swal("Validation Error", "Description must be between 10-1000 characters", "warning"); return;
    }
    if (!date) { swal("Validation Error", "Please select a date", "warning"); return; }
    if (!progressReport) { swal("Validation Error", "Please select progress percentage", "warning"); return; }
    if (!status) { swal("Validation Error", "Please select status", "warning"); return; }

    const reportData = {
        title,
        description,
        date,
        progressReport: parseInt(progressReport),
        projectId: projectId, // ✅ KIRIM SEBAGAI STRING, JANGAN parseInt
        status: parseInt(status),
        doneBy
    };

    console.log(" Sending report data:", reportData);

    try {
        const response = await fetch(`${API_BASE}/Reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            swal("Success!", "Report created successfully!", "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById('createReportModal'));
            if (modal) modal.hide();
            await loadReports();
        } else {
            const errorText = await response.text();
            console.error("❌ Server error:", errorText);

            let errorMsg = `Failed to create report: ${response.status}`;

            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.errors) {
                    errorMsg = Object.values(errorJson.errors).flat().join('\n');
                } else if (errorJson.message) {
                    errorMsg = errorJson.message;
                }
            } catch (e) {
                // Ignore parse error
            }

            swal("Error", errorMsg, "error");
        }
    } catch (error) {
        console.error("❌ Error creating report:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

// ✅ FIXED: Submit Edit Report
async function submitEditReport() {
    const id = document.getElementById('editReportId').value;
    const title = document.getElementById('editReportTitle').value.trim();
    const description = document.getElementById('editReportDescription').value.trim();
    const date = document.getElementById('editReportDate').value;
    const progressReport = document.getElementById('editReportProgressReport').value;
    const projectId = document.getElementById('editReportProjectId').value;
    const status = document.getElementById('editReportStatus').value;
    const doneBy = 1;

    if (!projectId || projectId === "" || projectId === "null") {
        swal("Validation Error", "Please select a project from the dropdown", "warning");
        return;
    }

    if (!title || title.length < 3 || title.length > 100) {
        swal("Validation Error", "Report title must be between 3-100 characters", "warning"); return;
    }
    if (!description || description.length < 10 || description.length > 1000) {
        swal("Validation Error", "Description must be between 10-1000 characters", "warning"); return;
    }

    const reportData = {
        title,
        description,
        date,
        progressReport: parseInt(progressReport),
        projectId: projectId, // ✅ KIRIM SEBAGAI STRING
        status: parseInt(status),
        doneBy
    };

    console.log("✏️ Updating report:", reportData);

    try {
        const response = await fetch(`${API_BASE}/Reports/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            swal("Success!", "Report updated successfully!", "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById('editReportModal'));
            if (modal) modal.hide();
            await loadReports();
        } else {
            const errorData = await response.json().catch(() => ({}));
            let errorMsg = "Failed to update report.";
            if (errorData.errors) errorMsg = Object.values(errorData.errors).flat().join('\n');
            else if (errorData.message) errorMsg = errorData.message;
            swal("Error", errorMsg, "error");
        }
    } catch (error) {
        console.error(" Error updating report:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

async function deleteReport(id) {
    const rep = reportsData.find(r => (r.id || r.Id) == id || (r.id || r.Id).toString() === id.toString());
    if (!rep) return;

    swal({
        title: "Are you sure?",
        text: `Delete report "${rep.title}"?`,
        icon: "warning",
        buttons: { cancel: { text: "Cancel", value: null, visible: true, className: "swal-cancel-btn", closeModal: true }, confirm: { text: "Yes, delete!", value: true, visible: true, className: "swal-danger-btn", closeModal: true } },
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
                const response = await fetch(`${API_BASE}/Reports/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    swal("Deleted!", "Report has been deleted.", "success");
                    await loadReports();
                } else {
                    swal("Error", `Failed: ${await response.text()}`, "error");
                }
            } catch (error) {
                swal("Error", "Failed to delete report.", "error");
            }
        }
    });
}

// ========================================
// 8. PROJECT PLACEHOLDERS
// ========================================
function viewProject(id) {
    const proj = projectsData.find(p => (p.id || p.Id) == id || (p.id || p.Id).toString() === id.toString());
    if (!proj) return;
    swal("Project Details", `Title: ${proj.name || proj.title}\nStatus: ${proj.status === 1 ? 'On Progress' : proj.status === 2 ? 'Done' : 'Pending'}`, "info");
}
function editProject(id) { swal("Info", "Project edit will redirect to Manager Projects page", "info"); }
function deleteProject(id) { swal("Info", "Project delete functionality will be implemented", "info"); }
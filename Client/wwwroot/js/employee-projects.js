// ========================================
// EMPLOYEE PROJECTS - FULLY FIXED & OPTIMIZED
// ========================================

const API_BASE = "https://localhost:7261/api";
let projectsData = [];
let employeesData = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Employee Projects initialized");
    loadData();
    initCreateButton();
    initSearchFilter();
    initActionButtons();
    initExportButtons();
    initSignOutConfirmation();
});

function initCreateButton() {
    const createBtn = document.getElementById('createProjectBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function () {
            document.getElementById('createProjectForm').reset();
            populateManagerDropdown('createManager');

            // Reset counters
            updateCounter('createTitleCounter', 0, 50);
            updateCounter('createDescriptionCounter', 0, 255);

            const modal = new bootstrap.Modal(document.getElementById('createProjectModal'));
            modal.show();

            // Setup counters after modal is shown
            setTimeout(() => {
                setupCounter('createTitle', 'createTitleCounter', 50);
                setupCounter('createDescription', 'createDescriptionCounter', 255);
            }, 100);
        });
    }
}

function initSearchFilter() {
    const searchInput = document.getElementById('searchProjects');
    const filterSelect = document.getElementById('filterStatus');

    if (searchInput) {
        searchInput.addEventListener('input', renderProjectsTable);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', renderProjectsTable);
    }
}

// ===== INIT ACTION BUTTONS (VIEW, EDIT, DELETE) =====
function initActionButtons() {
    // Use event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.btn-action');
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();

        const projectId = target.getAttribute('data-id');
        
        if (!projectId) {
            console.error("❌ Project ID not found!");
            swal("Error", "Project ID is missing!", "error");
            return;
        }

        if (target.classList.contains('btn-view')) {
            viewProject(projectId);
        } else if (target.classList.contains('btn-edit')) {
            editProject(projectId);
        } else if (target.classList.contains('btn-delete')) {
            deleteProject(projectId);
        }
    });
}

// ===== INIT EXPORT BUTTONS =====
function initExportButtons() {
    const btnExcel = document.querySelector('.btn-export[data-export="excel"]');
    const btnPDF = document.querySelector('.btn-export[data-export="pdf"]');
    const btnCSV = document.querySelector('.btn-export[data-export="csv"]');

    if (btnExcel) {
        btnExcel.addEventListener('click', function(e) {
            e.preventDefault();
            exportToExcel();
        });
    }

    if (btnPDF) {
        btnPDF.addEventListener('click', function(e) {
            e.preventDefault();
            exportToPDF();
        });
    }

    if (btnCSV) {
        btnCSV.addEventListener('click', function(e) {
            e.preventDefault();
            exportToCSV();
        });
    }
}

// ===== SIGN OUT CONFIRMATION =====
function initSignOutConfirmation() {
    const signOutButtons = document.querySelectorAll('.btn-sign-out-mobile, .btn-sign-out');
    
    signOutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const logoutUrl = this.getAttribute('href');
            
            swal({
                title: "Are you sure?",
                text: "You will be logged out of the system!",
                icon: "warning",
                buttons: {
                    cancel: {
                        text: "Cancel",
                        value: null,
                        visible: true,
                        className: "swal-cancel-btn",
                        closeModal: true
                    },
                    confirm: {
                        text: "Yes, sign out!",
                        value: true,
                        visible: true,
                        className: "swal-danger-btn",
                        closeModal: true
                    }
                },
                dangerMode: true,
            }).then((willLogout) => {
                if (willLogout) {
                    window.location.href = logoutUrl;
                }
            });
        });
    });
}

async function loadData() {
    await loadEmployees();
    await loadProjects();
}

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/Employees`);
        if (response.ok) {
            employeesData = await response.json();
            console.log("✅ Employees loaded:", employeesData.length);
        }
    } catch (error) {
        console.error("❌ Error loading employees:", error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/ProjectLists`);
        if (response.ok) {
            projectsData = await response.json();
            console.log("✅ Projects loaded:", projectsData.length);
            renderProjectsTable();
            updateStats();
        }
    } catch (error) {
        console.error("❌ Error loading projects:", error);
    }
}

function updateStats() {
    const totalEl = document.getElementById('totalProjects');
    const activeEl = document.getElementById('activeProjects');
    if (totalEl) totalEl.textContent = projectsData.length;
    if (activeEl) {
        const active = projectsData.filter(p => p.status === 1).length;
        activeEl.textContent = active;
    }
}

// ========================================
// CHARACTER COUNTERS
// ========================================
function setupCounter(inputId, counterId, max) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);

    if (!input || !counter) return;

    const updateCounter = () => {
        const length = input.value.length;
        counter.textContent = `${length}/${max} characters`;

        if (length > max) counter.className = 'char-counter text-danger';
        else if (length > max * 0.9) counter.className = 'char-counter text-warning';
        else counter.className = 'char-counter text-muted';
    };

    updateCounter();
    input.addEventListener('input', updateCounter);
}

function updateCounter(counterId, length, max) {
    const counter = document.getElementById(counterId);
    if (counter) {
        counter.textContent = `${length}/${max} characters`;
        counter.className = 'char-counter text-muted';
    }
}

function populateManagerDropdown(elementId, selectedValue = '') {
    const select = document.getElementById(elementId);
    if (!select) return;

    if (!employeesData || !Array.isArray(employeesData)) return;

    select.innerHTML = '<option value="">Select Manager</option>';

    employeesData.forEach(emp => {
        if (!emp) return;
        const role = emp.roleName || emp.role || 'Employee';

        if (role === 'Manager' || role === 'Admin') {
            const option = document.createElement('option');
            option.value = emp.id;
            const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || 'Unknown';
            option.textContent = `${fullName} (${role})`;

            if (emp.id && String(emp.id) === String(selectedValue)) {
                option.selected = true;
            }
            select.appendChild(option);
        }
    });
}

function getManagerName(managerId) {
    if (!managerId) return 'N/A';
    const emp = employeesData.find(e => String(e.id) === String(managerId));
    if (emp) return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;
    return `Manager ${managerId}`;
}

function getFilteredProjects() {
    const searchTerm = document.getElementById('searchProjects')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    return projectsData.filter(project => {
        const managerName = getManagerName(project.managerId).toLowerCase();
        const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm) ||
            (project.title || '').toLowerCase().includes(searchTerm) ||
            (project.description || '').toLowerCase().includes(searchTerm) ||
            managerName.includes(searchTerm);
        const matchesStatus = statusFilter === '' || String(project.status) === statusFilter;
        return matchesSearch && matchesStatus;
    });
}

function renderProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) {
        console.error("❌ projectsTableBody not found!");
        return;
    }

    const filteredProjects = getFilteredProjects();

    if (filteredProjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 60px 20px;"><div style="color: #64748b;"><i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i><p style="font-size: 18px; font-weight: 600; margin: 0;">No projects found</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = filteredProjects.map((project, index) => {
        const statusClass = project.status === 1 ? 'on-progress' : (project.status === 2 ? 'done' : 'pending');
        const statusText = project.status === 1 ? 'On Progress' : (project.status === 2 ? 'Done' : 'Pending');
        const projectId = project.id;
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '-';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '-';
        const managerName = getManagerName(project.managerId);
        const description = project.description ? (project.description.length > 50 ? project.description.substring(0, 50) + '...' : project.description) : '-';

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${project.name || project.title || 'Untitled'}</strong></td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${managerName}</td>
                <td>${description}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-action btn-view" data-id="${projectId}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn-action btn-edit" data-id="${projectId}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn-action btn-delete" data-id="${projectId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportToExcel() {
    if (projectsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }

    let csv = 'No,Title,Start Date,End Date,Status,Manager,Description\n';
    projectsData.forEach((project, index) => {
        const statusText = project.status === 1 ? 'On Progress' : (project.status === 2 ? 'Done' : 'Pending');
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '-';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '-';
        const managerName = getManagerName(project.managerId);
        csv += `${index + 1},"${project.name || project.title}","${startDate}","${endDate}","${statusText}","${managerName}","${project.description || ''}"\n`;
    });

    downloadFile(csv, 'projects.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    swal("Success", "Data exported to Excel!", "success");
}

function exportToPDF() {
    if (projectsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Projects Report</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#4f46e5;color:white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1 style="color:#4f46e5;">Projects Report</h1>');
    printWindow.document.write('<table><tr><th>No</th><th>Title</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Manager</th></tr>');
    
    projectsData.forEach((project, index) => {
        const statusText = project.status === 1 ? 'On Progress' : (project.status === 2 ? 'Done' : 'Pending');
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '-';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '-';
        const managerName = getManagerName(project.managerId);
        
        printWindow.document.write(`<tr>
            <td>${index + 1}</td>
            <td>${project.name || project.title}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${statusText}</td>
            <td>${managerName}</td>
        </tr>`);
    });
    
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
    
    swal("Success", "PDF export initiated!", "success");
}

function exportToCSV() {
    if (projectsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }

    let csv = 'No,Title,Start Date,End Date,Status,Manager,Description\n';
    projectsData.forEach((project, index) => {
        const statusText = project.status === 1 ? 'On Progress' : (project.status === 2 ? 'Done' : 'Pending');
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '-';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '-';
        const managerName = getManagerName(project.managerId);
        csv += `${index + 1},"${project.name || project.title}","${startDate}","${endDate}","${statusText}","${managerName}","${project.description || ''}"\n`;
    });

    downloadFile(csv, 'projects.csv', 'text/csv');
    swal("Success", "Data exported to CSV!", "success");
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// ========================================
// CREATE PROJECT (WITH VALIDATION)
// ========================================
async function submitCreateProject() {
    const title = document.getElementById('createTitle').value.trim();
    const description = document.getElementById('createDescription').value.trim();
    const startDate = document.getElementById('createStartDate').value;
    const endDate = document.getElementById('createEndDate').value;
    const managerId = document.getElementById('createManager').value;
    const status = document.getElementById('createStatus').value;

    console.log("📝 Creating project:", { title, startDate, endDate, managerId, status });

    if (!title || !description || !startDate || !endDate || !managerId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }

    if (title.length < 3 || title.length > 50) {
        swal("Validation Error", `Project title must be between 3 and 50 characters. (Current: ${title.length})`, "warning");
        return;
    }

    if (description.length < 10 || description.length > 255) {
        swal("Validation Error", `Description must be between 10 and 255 characters. (Current: ${description.length})`, "warning");
        return;
    }

    if (new Date(endDate) < new Date(startDate)) {
        swal("Validation Error", "End date cannot be before start date", "warning");
        return;
    }

    const projectData = {
        name: title,
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        managerId: parseInt(managerId),
        status: parseInt(status)
    };

    try {
        const response = await fetch(`${API_BASE}/ProjectLists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            swal("Success!", "Project created successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('createProjectModal')).hide();
            document.getElementById('createProjectForm').reset();
            await loadProjects();
        } else {
            const errorData = await response.json();
            swal("Error", errorData.message || "Failed to create project", "error");
        }
    } catch (error) {
        console.error("❌ Error creating project:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

// ========================================
// EDIT PROJECT
// ========================================
function editProject(id) {
    console.log("✏️ Editing project with ID:", id);

    if (!id) {
        swal("Error", "Project ID is missing!", "error");
        return;
    }

    const project = projectsData.find(p => String(p.id) === String(id));
    if (!project) {
        swal("Error", "Project not found", "error");
        return;
    }

    populateManagerDropdown('editManager', project.managerId);

    document.getElementById('editProjectId').value = project.id;
    document.getElementById('editTitle').value = project.name || project.title || '';
    document.getElementById('editDescription').value = project.description || '';
    document.getElementById('editStartDate').value = project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '';
    document.getElementById('editEndDate').value = project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '';
    document.getElementById('editManager').value = project.managerId || '';
    document.getElementById('editStatus').value = project.status !== undefined ? String(project.status) : '0';

    setTimeout(() => {
        setupCounter('editTitle', 'editTitleCounter', 50);
        setupCounter('editDescription', 'editDescriptionCounter', 255);
    }, 100);

    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();
}

// ========================================
// SUBMIT EDIT PROJECT (WITH VALIDATION)
// ========================================
async function submitEditProject() {
    const id = document.getElementById('editProjectId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const startDate = document.getElementById('editStartDate').value;
    const endDate = document.getElementById('editEndDate').value;
    const managerSelect = document.getElementById('editManager');
    const managerId = managerSelect ? managerSelect.value : '';
    const status = document.getElementById('editStatus').value;

    console.log("️ Updating project:", { id, title, startDate, endDate, managerId, status });

    if (!title || !description || !startDate || !endDate || !managerId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }

    if (title.length < 3 || title.length > 50) {
        swal("Validation Error", `Project title must be between 3 and 50 characters. (Current: ${title.length})`, "warning");
        return;
    }

    if (description.length < 10 || description.length > 255) {
        swal("Validation Error", `Description must be between 10 and 255 characters. (Current: ${description.length})`, "warning");
        return;
    }

    if (new Date(endDate) < new Date(startDate)) {
        swal("Validation Error", "End date cannot be before start date", "warning");
        return;
    }

    const projectData = {
        id: id,
        name: title,
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        managerId: parseInt(managerId),
        status: parseInt(status)
    };

    try {
        const response = await fetch(`${API_BASE}/ProjectLists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            swal("Success!", "Project updated successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('editProjectModal')).hide();
            await loadProjects();
        } else {
            let errorMessage = "Failed to update project";
            try {
                const errorData = await response.json();
                if (errorData.errors) errorMessage = Object.values(errorData.errors).flat().join('\n');
                else if (errorData.message) errorMessage = errorData.message;
            } catch (e) { errorMessage = `Server error ${response.status}`; }
            swal("Error", errorMessage, "error");
        }
    } catch (error) {
        console.error("❌ Network error:", error);
        swal("Error", "Network error: " + error.message, "error");
    }
}

// ========================================
// DELETE PROJECT
// ========================================
async function deleteProject(id) {
    if (!id) {
        swal("Error", "Project ID is missing!", "error");
        return;
    }

    const project = projectsData.find(p => String(p.id) === String(id));
    if (!project) {
        swal("Error", "Project not found", "error");
        return;
    }

    swal({
        title: "Are you sure?",
        text: `Do you really want to delete "${project.name || project.title}"?`,
        icon: "warning",
        buttons: {
            cancel: { text: "Cancel", value: null, visible: true, className: "swal-cancel-btn", closeModal: true },
            confirm: { text: "Yes, delete it!", value: true, visible: true, className: "swal-danger-btn", closeModal: true }
        },
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
                const response = await fetch(`${API_BASE}/ProjectLists/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    swal("Deleted!", "Project has been deleted.", "success");
                    await loadProjects();
                } else {
                    const errorText = await response.text();
                    swal("Error", `Failed to delete: ${errorText}`, "error");
                }
            } catch (error) {
                console.error("❌ Error deleting project:", error);
                swal("Error", "Failed to delete project.", "error");
            }
        }
    });
}

// ========================================
// VIEW PROJECT
// ========================================
function viewProject(id) {
    if (!id) {
        swal("Error", "Project ID is missing!", "error");
        return;
    }

    const project = projectsData.find(p => String(p.id) === String(id));
    if (!project) {
        swal("Error", "Project not found", "error");
        return;
    }

    const statusText = project.status === 1 ? 'On Progress' : (project.status === 2 ? 'Done' : 'Pending');
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : '-';
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : '-';
    const managerName = getManagerName(project.managerId);

    swal({
        title: "Project Details",
        text: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: `
                    <div style="text-align: left; padding: 10px; color: #0f172a !important;">
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Title:</strong><span>${project.name || project.title || 'N/A'}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Manager:</strong><span>${managerName}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Start:</strong><span>${startDate}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">End:</strong><span>${endDate}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Status:</strong><span>${statusText}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Desc:</strong><span>${project.description || 'N/A'}</span></div>
                    </div>
                `,
                style: "font-size: 14px; line-height: 1.8;"
            }
        },
        icon: "info",
        buttons: { confirm: { text: "OK", value: true, visible: true, className: "btn btn-primary", closeModal: true } }
    });
}
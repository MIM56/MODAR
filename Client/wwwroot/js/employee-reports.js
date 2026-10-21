// ========================================
// EMPLOYEE REPORTS - FULLY OPTIMIZED (MATCH MANAGER)
// ========================================

const API_BASE = "https://localhost:7261/api";
let reportsData = [];
let projectsData = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Employee Reports initialized");
    loadData();
    initCreateButton();
    initSearchFilter();
});

function initCreateButton() {
    const createBtn = document.getElementById('createReportBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function () {
            document.getElementById('createReportForm').reset();
            populateProjectDropdown('createProjectId');

            // Reset counters
            updateCounter('createTitleCounter', 0, 100);
            updateCounter('createDescriptionCounter', 0, 500);

            const modal = new bootstrap.Modal(document.getElementById('createReportModal'));
            modal.show();

            // Setup counters after modal is shown
            setTimeout(() => {
                setupCounter('createTitle', 'createTitleCounter', 100);
                setupCounter('createDescription', 'createDescriptionCounter', 500);
            }, 100);
        });
    }
}

function initSearchFilter() {
    const searchInput = document.getElementById('searchReports');
    const filterSelect = document.getElementById('filterStatus');

    if (searchInput) {
        searchInput.addEventListener('input', renderReportsTable);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', renderReportsTable);
    }
}

async function loadData() {
    await loadProjects();
    await loadReports();
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/ProjectLists`);
        if (response.ok) {
            projectsData = await response.json();
            console.log("✅ Projects loaded:", projectsData.length);
        }
    } catch (error) {
        console.error("❌ Error loading projects:", error);
    }
}

async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/Reports`);
        if (response.ok) {
            reportsData = await response.json();
            console.log("✅ Reports loaded:", reportsData.length);
            renderReportsTable();
            updateStats();
        }
    } catch (error) {
        console.error("❌ Error loading reports:", error);
    }
}

function updateStats() {
    const totalEl = document.getElementById('totalReports');
    const pendingEl = document.getElementById('pendingReports');
    if (totalEl) totalEl.textContent = reportsData.length;
    if (pendingEl) {
        const pending = reportsData.filter(r => r.status === 0).length;
        pendingEl.textContent = pending;
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

function populateProjectDropdown(elementId, selectedValue = '') {
    const select = document.getElementById(elementId);
    if (!select) return;

    select.innerHTML = '<option value="">Select Project</option>';
    projectsData.forEach(proj => {
        const option = document.createElement('option');
        option.value = proj.id;
        option.textContent = proj.name || proj.title || 'Untitled Project';
        if (proj.id == selectedValue || proj.id === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function getFilteredReports() {
    const searchTerm = document.getElementById('searchReports')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    return reportsData.filter(report => {
        const matchesSearch = (report.title || '').toLowerCase().includes(searchTerm) ||
            (report.projectName || '').toLowerCase().includes(searchTerm) ||
            (report.doneByName || '').toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === '' || report.status.toString() === statusFilter;

        return matchesSearch && matchesStatus;
    });
}

function renderReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) {
        console.error("❌ reportsTableBody not found!");
        return;
    }

    const filteredReports = getFilteredReports();

    if (filteredReports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 60px 20px;">
                    <div style="color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                        <p style="font-size: 18px; font-weight: 600; margin: 0;">No reports found</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filteredReports.map((report, index) => {
        const statusClass = report.status === 1 ? 'on-progress' : (report.status === 2 ? 'done' : 'pending');
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const reportId = report.id;
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        const doneByName = report.doneByName || 'N/A';

        // ✅ Tampilkan progress dengan tanda %
        const progressDisplay = report.progressReport ? `${report.progressReport}%` : '-';

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${report.title || 'Untitled'}</strong></td>
                <td>${projectName}</td>
                <td>${dateStr}</td>
                <td><strong>${progressDisplay}</strong></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${doneByName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewReport(${reportId})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editReport(${reportId})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteReport(${reportId})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// ========================================
// CREATE REPORT (WITH VALIDATION)
// ========================================
async function submitCreateReport() {
    const title = document.getElementById('createTitle').value.trim();
    const description = document.getElementById('createDescription').value.trim();
    const date = document.getElementById('createDate').value;
    const progressReportStr = document.getElementById('createProgressReport').value; // ✅ Dari dropdown
    const projectId = document.getElementById('createProjectId').value;
    const status = document.getElementById('createStatus').value;
    const doneBy = 1; // TODO: Get from logged-in user

    // ✅ VALIDASI 1: Field wajib
    if (!title || !description || !date || !progressReportStr || !projectId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }

    // ✅ VALIDASI 2: Panjang Title (3 - 100 karakter)
    if (title.length < 3 || title.length > 100) {
        swal("Validation Error", `Report title must be between 3 and 100 characters. (Current: ${title.length})`, "warning");
        return;
    }

    // ✅ VALIDASI 3: Panjang Description (10 - 500 karakter)
    if (description.length < 10 || description.length > 500) {
        swal("Validation Error", `Description must be between 10 and 500 characters. (Current: ${description.length})`, "warning");
        return;
    }

    const reportData = {
        title: title,
        description: description,
        date: date,
        progressReport: parseInt(progressReportStr), // ✅ Kirim sebagai int
        projectId: projectId,
        status: parseInt(status),
        doneBy: doneBy
    };

    try {
        const response = await fetch(`${API_BASE}/Reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            swal("Success!", "Report created successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('createReportModal')).hide();
            document.getElementById('createReportForm').reset();
            await loadReports();
        } else {
            const errorData = await response.json();
            swal("Error", errorData.message || "Failed to create report", "error");
        }
    } catch (error) {
        console.error("❌ Error creating report:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

// ========================================
// EDIT REPORT
// ========================================
function editReport(id) {
    console.log("✏️ Editing report:", id);

    const report = reportsData.find(r => String(r.id) === String(id));
    if (!report) {
        swal("Error", "Report not found", "error");
        return;
    }

    populateProjectDropdown('editProjectId', report.projectId);

    document.getElementById('editReportId').value = report.id;
    document.getElementById('editTitle').value = report.title || '';
    document.getElementById('editDescription').value = report.description || '';
    document.getElementById('editDate').value = report.date ? new Date(report.date).toISOString().split('T')[0] : '';

    // ✅ Auto-select dropdown progress (nilai dari database adalah int)
    document.getElementById('editProgressReport').value = report.progressReport !== null && report.progressReport !== undefined ? String(report.progressReport) : '';

    document.getElementById('editProjectId').value = report.projectId || '';
    document.getElementById('editStatus').value = report.status !== undefined ? String(report.status) : '0';

    // Setup counters for edit modal
    setTimeout(() => {
        setupCounter('editTitle', 'editTitleCounter', 100);
        setupCounter('editDescription', 'editDescriptionCounter', 500);
    }, 100);

    const modal = new bootstrap.Modal(document.getElementById('editReportModal'));
    modal.show();
}

async function submitEditReport() {
    const id = document.getElementById('editReportId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const date = document.getElementById('editDate').value;
    const progressReportStr = document.getElementById('editProgressReport').value; // ✅ Dari dropdown
    const projectId = document.getElementById('editProjectId').value;
    const status = document.getElementById('editStatus').value;
    const doneBy = 1;

    // ✅ VALIDASI 1: Field wajib
    if (!title || !description || !date || !progressReportStr || !projectId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }

    // ✅ VALIDASI 2: Panjang Title
    if (title.length < 3 || title.length > 100) {
        swal("Validation Error", `Report title must be between 3 and 100 characters. (Current: ${title.length})`, "warning");
        return;
    }

    // ✅ VALIDASI 3: Panjang Description
    if (description.length < 10 || description.length > 500) {
        swal("Validation Error", `Description must be between 10 and 500 characters. (Current: ${description.length})`, "warning");
        return;
    }

    const reportData = {
        title: title,
        description: description,
        date: date,
        progressReport: parseInt(progressReportStr), // ✅ Kirim sebagai int
        projectId: projectId,
        status: parseInt(status),
        doneBy: doneBy
    };

    try {
        const response = await fetch(`${API_BASE}/Reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            swal("Success!", "Report updated successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('editReportModal')).hide();
            await loadReports();
        } else {
            const errorData = await response.json();
            let errorMsg = "Failed to update report.";
            if (errorData.errors) {
                errorMsg = Object.values(errorData.errors).flat().join('\n');
            } else if (errorData.message) {
                errorMsg = errorData.message;
            }
            swal("Error", errorMsg, "error");
        }
    } catch (error) {
        console.error("❌ Error updating report:", error);
        swal("Error", "Network error occurred.", "error");
    }
}

// ========================================
// DELETE REPORT
// ========================================
async function deleteReport(id) {
    const report = reportsData.find(r => String(r.id) === String(id));
    if (!report) return;

    swal({
        title: "Are you sure?",
        text: `Do you really want to delete "${report.title}"?`,
        icon: "warning",
        buttons: {
            cancel: {
                text: "Cancel",
                value: null,
                visible: true,
                className: "swal-cancel-btn",
                closeModal: true,
            },
            confirm: {
                text: "Yes, delete it!",
                value: true,
                visible: true,
                className: "swal-danger-btn",
                closeModal: true
            }
        },
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
                const response = await fetch(`${API_BASE}/Reports/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    swal("Deleted!", "Report has been deleted.", "success");
                    await loadReports();
                } else {
                    const errorText = await response.text();
                    swal("Error", `Failed to delete: ${errorText}`, "error");
                }
            } catch (error) {
                console.error("❌ Error deleting report:", error);
                swal("Error", "Failed to delete report.", "error");
            }
        }
    });
}

// ========================================
// VIEW REPORT
// ========================================
function viewReport(id) {
    const report = reportsData.find(r => String(r.id) === String(id));
    if (!report) {
        swal("Error", "Report not found", "error");
        return;
    }

    const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
    const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
    const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
    const doneByName = report.doneByName || 'N/A';
    const progressDisplay = report.progressReport ? `${report.progressReport}%` : 'N/A';

    swal({
        title: "Report Details",
        text: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: `
                    <div style="text-align: left; padding: 10px; color: #0f172a !important;">
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Title:</strong>
                            <span style="color: #334155 !important;">${report.title || 'N/A'}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Project:</strong>
                            <span style="color: #334155 !important;">${projectName}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Date:</strong>
                            <span style="color: #334155 !important;">${dateStr}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Status:</strong>
                            <span style="color: #334155 !important;">${statusText}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Progress:</strong>
                            <span style="color: #334155 !important;">${progressDisplay}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Done By:</strong>
                            <span style="color: #334155 !important;">${doneByName}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #0f172a !important; display: inline-block; width: 100px;">Desc:</strong>
                            <span style="color: #334155 !important;">${report.description || 'N/A'}</span>
                        </div>
                    </div>
                `,
                style: "font-size: 14px; line-height: 1.8; color: #0f172a !important;"
            }
        },
        icon: "info",
        buttons: {
            confirm: {
                text: "OK",
                value: true,
                visible: true,
                className: "btn btn-primary",
                closeModal: true
            }
        }
    });
}
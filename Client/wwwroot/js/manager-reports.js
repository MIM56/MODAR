// ========================================
// MANAGER REPORTS - FULLY FIXED & OPTIMIZED
// ========================================

const API_BASE = "https://localhost:7261/api";
let reportsData = [];
let projectsData = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Manager Reports initialized");
    loadData();
    initCreateButton();
    initSearchFilter();
    initActionButtons();
    initExportButtons();
    initSignOutConfirmation();
});

function initCreateButton() {
    const createBtn = document.getElementById('createReportBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function () {
            document.getElementById('createReportForm').reset();
            populateProjectDropdown('createProjectId');

            updateCounter('createTitleCounter', 0, 100);
            updateCounter('createDescriptionCounter', 0, 500);

            const modal = new bootstrap.Modal(document.getElementById('createReportModal'));
            modal.show();

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
    if (searchInput) searchInput.addEventListener('input', renderReportsTable);
    if (filterSelect) filterSelect.addEventListener('change', renderReportsTable);
}

// ===== INIT ACTION BUTTONS (VIEW, EDIT, DELETE) =====
function initActionButtons() {
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.btn-action');
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();

        const reportId = target.getAttribute('data-id');
        
        if (!reportId) {
            console.error("❌ Report ID not found!");
            swal("Error", "Report ID is missing!", "error");
            return;
        }

        if (target.classList.contains('btn-view')) {
            viewReport(reportId);
        } else if (target.classList.contains('btn-edit')) {
            editReport(reportId);
        } else if (target.classList.contains('btn-delete')) {
            deleteReport(reportId);
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
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const logoutUrl = this.getAttribute('href');
            
            swal({
                title: "Are you sure?",
                text: "You will be logged out of the system!",
                icon: "warning",
                buttons: {
                    cancel: { text: "Cancel", value: null, visible: true, className: "swal-cancel-btn", closeModal: true },
                    confirm: { text: "Yes, sign out!", value: true, visible: true, className: "swal-danger-btn", closeModal: true }
                },
                dangerMode: true,
            }).then((willLogout) => {
                if (willLogout) {
                    window.location.href = logoutUrl;
                }
            });
        });
    });
    console.log("✅ Sign out confirmation initialized");
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
    } catch (error) { console.error("❌ Error loading projects:", error); }
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
    } catch (error) { console.error("❌ Error loading reports:", error); }
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
        if (String(proj.id) === String(selectedValue)) option.selected = true;
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
        const matchesStatus = statusFilter === '' || String(report.status) === statusFilter;
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
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 60px 20px;"><div style="color: #64748b;"><i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 16px; display: block; opacity: 0.5;"></i><p style="font-size: 18px; font-weight: 600; margin: 0;">No reports found</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = filteredReports.map((report, index) => {
        const statusClass = report.status === 1 ? 'on-progress' : (report.status === 2 ? 'done' : 'pending');
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const reportId = report.id;
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        const doneByName = report.doneByName || 'N/A';
        const progressDisplay = report.progressReport !== null && report.progressReport !== undefined ? `${report.progressReport}%` : '-';

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
                        <button type="button" class="btn-action btn-view" data-id="${reportId}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn-action btn-edit" data-id="${reportId}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn-action btn-delete" data-id="${reportId}" title="Delete">
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
    if (reportsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }
    let csv = 'No,Title,Project,Date,Progress,Status,Done By,Description\n';
    reportsData.forEach((report, index) => {
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        const doneByName = report.doneByName || 'N/A';
        const progressDisplay = report.progressReport !== null && report.progressReport !== undefined ? `${report.progressReport}%` : '-';
        csv += `${index + 1},"${report.title}","${projectName}","${dateStr}","${progressDisplay}","${statusText}","${doneByName}","${report.description || ''}"\n`;
    });
    downloadFile(csv, 'reports.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    swal("Success", "Data exported to Excel!", "success");
}

function exportToPDF() {
    if (reportsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Reports Report</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#4f46e5;color:white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1 style="color:#4f46e5;">Reports Report</h1>');
    printWindow.document.write('<table><tr><th>No</th><th>Title</th><th>Project</th><th>Date</th><th>Progress</th><th>Status</th><th>Done By</th></tr>');
    
    reportsData.forEach((report, index) => {
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        const doneByName = report.doneByName || 'N/A';
        const progressDisplay = report.progressReport !== null && report.progressReport !== undefined ? `${report.progressReport}%` : '-';
        printWindow.document.write(`<tr>
            <td>${index + 1}</td>
            <td>${report.title}</td>
            <td>${projectName}</td>
            <td>${dateStr}</td>
            <td>${progressDisplay}</td>
            <td>${statusText}</td>
            <td>${doneByName}</td>
        </tr>`);
    });
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
    swal("Success", "PDF export initiated!", "success");
}

function exportToCSV() {
    if (reportsData.length === 0) {
        swal("Error", "No data to export!", "error");
        return;
    }
    let csv = 'No,Title,Project,Date,Progress,Status,Done By,Description\n';
    reportsData.forEach((report, index) => {
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        const doneByName = report.doneByName || 'N/A';
        const progressDisplay = report.progressReport !== null && report.progressReport !== undefined ? `${report.progressReport}%` : '-';
        csv += `${index + 1},"${report.title}","${projectName}","${dateStr}","${progressDisplay}","${statusText}","${doneByName}","${report.description || ''}"\n`;
    });
    downloadFile(csv, 'reports.csv', 'text/csv');
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
// CRUD FUNCTIONS
// ========================================
async function submitCreateReport() {
    const title = document.getElementById('createTitle').value.trim();
    const description = document.getElementById('createDescription').value.trim();
    const date = document.getElementById('createDate').value;
    const progressReportStr = document.getElementById('createProgressReport').value;
    const projectId = document.getElementById('createProjectId').value;
    const status = document.getElementById('createStatus').value;
    const doneBy = 1;

    if (!title || !description || !date || !progressReportStr || !projectId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }
    if (title.length < 3 || title.length > 100) {
        swal("Validation Error", `Report title must be between 3 and 100 characters.`, "warning");
        return;
    }
    if (description.length < 10 || description.length > 500) {
        swal("Validation Error", `Description must be between 10 and 500 characters.`, "warning");
        return;
    }

    const reportData = {
        title: title,
        description: description,
        date: date,
        progressReport: parseInt(progressReportStr),
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

function editReport(id) {
    if (!id) {
        swal("Error", "Report ID is missing!", "error");
        return;
    }

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
    document.getElementById('editProgressReport').value = report.progressReport !== null && report.progressReport !== undefined ? String(report.progressReport) : '';
    document.getElementById('editProjectId').value = report.projectId || '';
    document.getElementById('editStatus').value = report.status !== undefined ? String(report.status) : '0';

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
    const progressReportStr = document.getElementById('editProgressReport').value;
    const projectId = document.getElementById('editProjectId').value;
    const status = document.getElementById('editStatus').value;
    const doneBy = 1;

    if (!title || !description || !date || !progressReportStr || !projectId || !status) {
        swal("Validation Error", "Please fill in all required fields", "warning");
        return;
    }
    if (title.length < 3 || title.length > 100) {
        swal("Validation Error", `Report title must be between 3 and 100 characters.`, "warning");
        return;
    }
    if (description.length < 10 || description.length > 500) {
        swal("Validation Error", `Description must be between 10 and 500 characters.`, "warning");
        return;
    }

    const reportData = {
        title: title,
        description: description,
        date: date,
        progressReport: parseInt(progressReportStr),
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
            let errorMessage = "Failed to update report";
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

async function deleteReport(id) {
    if (!id) {
        swal("Error", "Report ID is missing!", "error");
        return;
    }

    const report = reportsData.find(r => String(r.id) === String(id));
    if (!report) {
        swal("Error", "Report not found", "error");
        return;
    }

    swal({
        title: "Are you sure?",
        text: `Do you really want to delete "${report.title}"?`,
        icon: "warning",
        buttons: {
            cancel: { text: "Cancel", value: null, visible: true, className: "swal-cancel-btn", closeModal: true },
            confirm: { text: "Yes, delete it!", value: true, visible: true, className: "swal-danger-btn", closeModal: true }
        },
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
                const response = await fetch(`${API_BASE}/Reports/${id}`, { method: 'DELETE' });
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

function viewReport(id) {
    if (!id) {
        swal("Error", "Report ID is missing!", "error");
        return;
    }

    const report = reportsData.find(r => String(r.id) === String(id));
    if (!report) {
        swal("Error", "Report not found", "error");
        return;
    }

    const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
    const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
    const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
    const doneByName = report.doneByName || 'N/A';
    const progressDisplay = report.progressReport !== null && report.progressReport !== undefined ? `${report.progressReport}%` : 'N/A';

    swal({
        title: "Report Details",
        text: "",
        content: {
            element: "div",
            attributes: {
                innerHTML: `
                    <div style="text-align: left; padding: 10px; color: #0f172a !important;">
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Title:</strong><span>${report.title || 'N/A'}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Project:</strong><span>${projectName}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Date:</strong><span>${dateStr}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Status:</strong><span>${statusText}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Progress:</strong><span>${progressDisplay}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Done By:</strong><span>${doneByName}</span></div>
                        <div style="margin-bottom: 12px;"><strong style="display: inline-block; width: 100px;">Desc:</strong><span>${report.description || 'N/A'}</span></div>
                    </div>
                `,
                style: "font-size: 14px; line-height: 1.8;"
            }
        },
        icon: "info",
        buttons: { confirm: { text: "OK", value: true, visible: true, className: "btn btn-primary", closeModal: true } }
    });
}
// ========================================
// EMPLOYEE DASHBOARD - FULLY OPTIMIZED
// ========================================

const API_BASE = "https://localhost:7261/api";
let reportsData = [];
let projectsData = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Employee Dashboard initialized");
    loadData();
});

async function loadData() {
    await loadProjects();
    await loadReports();
    updateStats();
    renderCharts();
    renderRecentReports();
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
        }
    } catch (error) {
        console.error("❌ Error loading reports:", error);
    }
}

function updateStats() {
    const totalProjects = projectsData.length;
    const totalReports = reportsData.length;
    const completedProjects = projectsData.filter(p => p.status === 2).length;
    const pendingReports = reportsData.filter(r => r.status === 0).length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('numProjects').textContent = totalProjects;
    document.getElementById('numReports').textContent = totalReports;
    document.getElementById('completedProjects').textContent = completedProjects;
    document.getElementById('pendingReports').textContent = pendingReports;
    
    const projectTrend = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const reportTrend = totalReports > 0 ? Math.round(((totalReports - pendingReports) / totalReports) * 100) : 0;
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    document.getElementById('projectTrend').textContent = projectTrend + '%';
    document.getElementById('reportTrend').textContent = reportTrend + '%';
    document.getElementById('successRate').textContent = successRate + '%';
}

function renderCharts() {
    renderReportStatusChart();
    renderProjectProgressChart();
    renderMonthlyActivityChart();
}

function renderReportStatusChart() {
    const ctx = document.getElementById('reportStatusChart');
    if (!ctx) return;
    
    const pending = reportsData.filter(r => r.status === 0).length;
    const onProgress = reportsData.filter(r => r.status === 1).length;
    const done = reportsData.filter(r => r.status === 2).length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'On Progress', 'Done'],
            datasets: [{
                data: [pending, onProgress, done],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12, weight: '600' },
                        color: document.body.classList.contains('dark-mode') ? '#f1f5f9' : '#0f172a'
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function renderProjectProgressChart() {
    const ctx = document.getElementById('projectProgressChart');
    if (!ctx) return;
    
    const notStarted = projectsData.filter(p => p.status === 0).length;
    const onProgress = projectsData.filter(p => p.status === 1).length;
    const done = projectsData.filter(p => p.status === 2).length;
    
    const isDark = document.body.classList.contains('dark-mode');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Not Started', 'On Progress', 'Done'],
            datasets: [{
                label: 'Projects',
                data: [notStarted, onProgress, done],
                backgroundColor: ['#94a3b8', '#3b82f6', '#10b981'],
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 12 }, color: isDark ? '#94a3b8' : '#64748b' },
                    grid: { color: isDark ? '#334155' : '#e2e8f0' }
                },
                x: {
                    ticks: { font: { size: 12, weight: '600' }, color: isDark ? '#94a3b8' : '#64748b' },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderMonthlyActivityChart() {
    const ctx = document.getElementById('monthlyActivityChart');
    if (!ctx) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const projectsData_arr = [2, 3, 4, 3, 5, 4];
    const reportsData_arr = [3, 5, 4, 6, 8, 7];
    
    const isDark = document.body.classList.contains('dark-mode');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Projects',
                    data: projectsData_arr,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Reports',
                    data: reportsData_arr,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: '600' },
                        color: isDark ? '#f1f5f9' : '#0f172a'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 }, color: isDark ? '#94a3b8' : '#64748b' },
                    grid: { color: isDark ? '#334155' : '#e2e8f0' }
                },
                x: {
                    ticks: { font: { size: 12, weight: '600' }, color: isDark ? '#94a3b8' : '#64748b' },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderRecentReports() {
    const tbody = document.getElementById('recentReportsTable');
    if (!tbody) return;
    
    if (reportsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
                    <p>No reports found</p>
                </td>
            </tr>`;
        return;
    }
    
    const recentReports = reportsData.slice(0, 5);
    
    tbody.innerHTML = recentReports.map((report, index) => {
        const statusClass = report.status === 1 ? 'on-progress' : (report.status === 2 ? 'done' : 'pending');
        const statusText = report.status === 1 ? 'On Progress' : (report.status === 2 ? 'Done' : 'Pending');
        const dateStr = report.date ? new Date(report.date).toLocaleDateString('en-GB') : '-';
        const projectName = report.projectName || (report.projectId ? `Project ${report.projectId}` : 'N/A');
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${report.title || 'Untitled'}</strong></td>
                <td>${projectName}</td>
                <td>${dateStr}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${report.progressReport || '-'}</td>
            </tr>`;
    }).join('');
}

function viewAllReports() {
    window.location.href = '/Employees/Reports';
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        window.location.href = '/Login';
    }
}
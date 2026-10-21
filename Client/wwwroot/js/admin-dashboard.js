// ========================================
// ADMIN DASHBOARD - FULL FIXED
// ========================================

const API_BASE = "https://localhost:7261/api";
let employeesData = [];
let projectsData = [];
let reportsData = [];
let chartsInitialized = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Admin Dashboard initialized");
    
    if (typeof ApexCharts === 'undefined') {
        console.error("❌ ApexCharts not loaded!");
        return;
    }
    
    console.log("✅ ApexCharts loaded, initializing...");
    initDashboard();
});

async function initDashboard() {
    try {
        await loadDashboardData();
        updateStats();
        
        if (!chartsInitialized) {
            renderCharts();
            chartsInitialized = true;
        }
        
        // ✅ Render Recent Activity
        renderRecentActivity();
    } catch (error) {
        console.error("❌ Error initializing dashboard:", error);
    }
}

async function loadDashboardData() {
    try {
        const employeesRes = await fetch(`${API_BASE}/Employees`);
        if (employeesRes.ok) {
            employeesData = await employeesRes.json();
            console.log("✅ Employees loaded:", employeesData.length);
        }

        const projectsRes = await fetch(`${API_BASE}/ProjectLists`);
        if (projectsRes.ok) {
            projectsData = await projectsRes.json();
            console.log("✅ Projects loaded:", projectsData.length);
        }

        const reportsRes = await fetch(`${API_BASE}/Reports`);
        if (reportsRes.ok) {
            reportsData = await reportsRes.json();
            console.log("✅ Reports loaded:", reportsData.length);
        }
    } catch (error) {
        console.error("❌ Error loading data:", error);
    }
}

function updateStats() {
    const totalEmployees = employeesData.length;
    const totalManagers = employeesData.filter(e => e.role === 'Manager').length;
    const totalProjects = projectsData.length;
    const totalReports = reportsData.length;

    safeSetText('totalEmployees', totalEmployees);
    safeSetText('totalManagers', totalManagers);
    safeSetText('statEmployees', totalEmployees);
    safeSetText('statManagers', totalManagers);
    safeSetText('statProjects', totalProjects);
    safeSetText('statReports', totalReports);

    safeSetText('employeeGrowth', '0%');
    safeSetText('projectGrowth', '0%');
    safeSetText('reportGrowth', '0%');
}

function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return {
        text: isDark ? '#f1f5f9' : '#0f172a',
        label: isDark ? '#94a3b8' : '#64748b',
        grid: isDark ? '#334155' : '#e2e8f0',
        tooltip: isDark ? 'dark' : 'light'
    };
}

function renderCharts() {
    console.log("📊 Rendering charts...");
    
    clearChart('userDistributionChart');
    clearChart('projectOverviewChart');
    
    renderUserDistributionChart();
    renderProjectOverviewChart();
    
    console.log("✅ All charts rendered");
}

function clearChart(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = '';
    }
}

function renderUserDistributionChart() {
    const managers = employeesData.filter(e => e.role === 'Manager').length;
    const employees = employeesData.filter(e => e.role === 'Employee').length;
    const colors = getChartColors();

    const options = {
        series: [managers, employees],
        chart: {
            type: 'donut',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        labels: ['Managers', 'Employees'],
        colors: ['#ef4444', '#06b6d4'],
        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            labels: { colors: colors.label },
            markers: { width: 12, height: 12, radius: 3 }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.label
                        },
                        value: {
                            fontSize: '28px',
                            fontWeight: 800,
                            color: colors.text
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: colors.label,
                            formatter: () => managers + employees
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '13px',
                fontWeight: 700,
                colors: ['#ffffff']
            }
        },
        stroke: { width: 2, colors: ['#ffffff'] },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#userDistributionChart"), options);
    chart.render().then(() => {
        console.log("✅ User Distribution chart rendered");
    });
}

function renderProjectOverviewChart() {
    const notStarted = projectsData.filter(p => p.status === 0).length;
    const onProgress = projectsData.filter(p => p.status === 1).length;
    const completed = projectsData.filter(p => p.status === 2).length;
    const colors = getChartColors();

    const options = {
        series: [{
            name: 'Projects',
            data: [notStarted, onProgress, completed]
        }],
        chart: {
            type: 'bar',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 12,
                columnWidth: '50%',
                distributed: false,
                horizontal: true,
                dataLabels: { position: 'center' }
            }
        },
        colors: ['#94a3b8'],
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '14px',
                fontWeight: 800,
                colors: ['#ffffff']
            }
        },
        xaxis: {
            categories: ['Not Started', 'On Progress', 'Completed'],
            labels: {
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    colors: colors.label
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    colors: colors.label
                }
            }
        },
        grid: {
            borderColor: colors.grid,
            strokeDashArray: 4
        },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#projectOverviewChart"), options);
    chart.render().then(() => {
        console.log("✅ Project Overview chart rendered");
    });
}

// ✅ FIX: RENDER RECENT ACTIVITY DENGAN DATA DUMMY
function renderRecentActivity() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) {
        console.error("❌ activityTableBody not found!");
        return;
    }

    console.log(" Rendering recent activity...");

    // Generate activity dari data yang ada
    const activities = [];

    // Add employee activities
    employeesData.forEach((emp, index) => {
        activities.push({
            no: index + 1,
            user: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : (emp.email || 'Unknown'),
            role: emp.role || 'Employee',
            activity: 'System login',
            date: new Date().toLocaleDateString('en-GB'),
            status: 'Active'
        });
    });

    // Add project activities
    projectsData.slice(0, 3).forEach((proj, index) => {
        activities.push({
            no: activities.length + 1,
            user: 'Manager',
            role: 'Manager',
            activity: `Created project: ${proj.name || proj.title || 'Untitled'}`,
            date: proj.startDate ? new Date(proj.startDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            status: 'Active'
        });
    });

    // Add report activities
    reportsData.slice(0, 2).forEach((rep, index) => {
        activities.push({
            no: activities.length + 1,
            user: 'Employee',
            role: 'Employee',
            activity: `Submitted report: ${rep.title || 'Untitled'}`,
            date: rep.date ? new Date(rep.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            status: 'Active'
        });
    });

    // Jika tidak ada data, tampilkan pesan
    if (activities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 14px; font-weight: 600;">No recent activity</p>
                </td>
            </tr>
        `;
        return;
    }

    // Render table
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.no}</td>
            <td><strong>${activity.user}</strong></td>
            <td>${activity.role}</td>
            <td>${activity.activity}</td>
            <td>${activity.date}</td>
            <td><span class="status-badge active">${activity.status}</span></td>
        </tr>
    `).join('');

    console.log("✅ Recent activity rendered:", activities.length, "items");
}
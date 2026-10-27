// ========================================
// ADMIN DASHBOARD - FULL FIXED
// ========================================

// Check if already initialized to prevent duplicate declaration
if (typeof window.MODAR_INITIALIZED === 'undefined') {
    window.MODAR_INITIALIZED = true;

    const API_BASE = "https://localhost:7261/api";
    let employeesData = [];
    let projectsData = [];
    let reportsData = [];
    let chartsInitialized = false;

    // ===== DARK MODE FUNCTIONS =====
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        const body = document.body;

        if (!darkModeToggle || !darkModeIcon) {
            return;
        }

        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            body.classList.add('dark-mode');
            updateDarkModeIcon(darkModeIcon, true);
        }

        darkModeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isDark = body.classList.toggle('dark-mode');
            updateDarkModeIcon(darkModeIcon, isDark);
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');

            if (chartsInitialized && typeof renderCharts === 'function') {
                renderCharts();
            }
        });
    }

    function updateDarkModeIcon(icon, isDark) {
        if (!icon) return;

        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // ===== MOBILE SIDEBAR =====
    function initMobileSidebar() {
        const mobileMenuToggle = document.querySelector('.navbar-toggler.d-lg-none');
        const sidenav = document.getElementById('sidenav-main');

        if (!mobileMenuToggle || !sidenav) {
            return;
        }

        let overlay = document.querySelector('.sidenav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidenav-overlay';
            document.body.appendChild(overlay);
        }

        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidenav.classList.toggle('show');
            overlay.classList.toggle('show');
        });

        overlay.addEventListener('click', function() {
            sidenav.classList.remove('show');
            overlay.classList.remove('show');
        });

        const navLinks = document.querySelectorAll('.sidenav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992) {
                    sidenav.classList.remove('show');
                    overlay.classList.remove('show');
                }
            });
        });
    }

    // ===== DASHBOARD SPECIFIC FUNCTIONS =====
    function initDashboard() {
        // Check if we're on dashboard page
        const dashboardElement = document.querySelector('.hero-section, .stats-grid, .charts-grid');
        if (!dashboardElement) {
            console.log("Not a dashboard page, skipping dashboard initialization");
            return;
        }

        console.log("🚀 Admin Dashboard initialized");

        if (typeof ApexCharts === 'undefined') {
            console.error("❌ ApexCharts not loaded!");
            return;
        }

        console.log("✅ ApexCharts loaded");

        loadDashboardData().then(() => {
            updateStats();

            if (!chartsInitialized) {
                renderCharts();
                chartsInitialized = true;
            }

            renderRecentActivity();
        });
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
        const totalManagers = employeesData.filter(e => e.role === 'Manager' || e.roleName === 'Manager').length;
        const totalProjects = projectsData.length;
        const totalReports = reportsData.length;

        safeSetText('totalEmployees', totalEmployees);
        safeSetText('totalManagers', totalManagers);
        safeSetText('statEmployees', totalEmployees);
        safeSetText('statManagers', totalManagers);
        safeSetText('statProjects', totalProjects);
        safeSetText('statReports', totalReports);
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
        // Check if chart elements exist
        const userChart = document.getElementById('userDistributionChart');
        const projectChart = document.getElementById('projectOverviewChart');

        if (!userChart && !projectChart) {
            return;
        }

        if (userChart) renderUserDistributionChart();
        if (projectChart) renderProjectOverviewChart();
    }

    function renderUserDistributionChart() {
        const managers = employeesData.filter(e => e.role === 'Manager' || e.roleName === 'Manager').length;
        const employees = employeesData.filter(e => e.role === 'Employee' || e.roleName === 'Employee').length;
        const colors = getChartColors();

        const options = {
            series: [managers, employees],
            chart: {
                type: 'donut',
                height: 320,
                fontFamily: 'Inter, sans-serif',
            },
            labels: ['Managers', 'Employees'],
            colors: ['#ef4444', '#06b6d4'],
            legend: {
                position: 'bottom',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                labels: { colors: colors.label },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
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
            dataLabels: { enabled: false },
            stroke: { width: 2, colors: ['#ffffff'] },
        };

        const chart = new ApexCharts(document.querySelector("#userDistributionChart"), options);
        chart.render();
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
            },
            plotOptions: {
                bar: {
                    borderRadius: 12,
                    columnWidth: '50%',
                    distributed: true,
                    horizontal: false,
                }
            },
            colors: ['#94a3b8', '#3b82f6', '#10b981'],
            dataLabels: { enabled: false },
            xaxis: {
                categories: ['Not Started', 'On Progress', 'Completed'],
            },
            grid: {
                borderColor: colors.grid,
                strokeDashArray: 4
            },
        };

        const chart = new ApexCharts(document.querySelector("#projectOverviewChart"), options);
        chart.render();
    }

    function renderRecentActivity() {
        const tbody = document.getElementById('activityTableBody');
        if (!tbody) {
            return;
        }

        const activities = [];

        employeesData.slice(0, 5).forEach((emp, index) => {
            activities.push({
                no: index + 1,
                user: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : (emp.email || 'Unknown'),
                role: emp.role || emp.roleName || 'Employee',
                activity: 'System login',
                date: new Date().toLocaleDateString('en-GB'),
                status: 'Active'
            });
        });

        if (activities.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px 20px;">No recent activity</td></tr>`;
            return;
        }

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
    }

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', function() {
        initDarkMode();
        initMobileSidebar();
        initDashboard();
    });
}
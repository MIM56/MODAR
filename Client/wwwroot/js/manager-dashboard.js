// ========================================
// MANAGER DASHBOARD - FULL FIXED CHARTS
// ========================================

if (typeof window.MODAR_MANAGER_INITIALIZED === 'undefined') {
    window.MODAR_MANAGER_INITIALIZED = true;

    const API_BASE = "https://localhost:7261/api";
    let projectsData = [];
    let reportsData = [];
    let chartsInitialized = false;
    let chartInstances = {};

    // ===== DARK MODE =====
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        const body = document.body;

        if (!darkModeToggle || !darkModeIcon) return;

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

            if (chartsInitialized) {
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

        if (!mobileMenuToggle || !sidenav) return;

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

    // ===== DASHBOARD INIT =====
    function initDashboard() {
        const dashboardElement = document.querySelector('.hero-section, .stats-grid, .charts-grid');
        if (!dashboardElement) return;

        if (typeof ApexCharts === 'undefined') {
            console.error("ApexCharts not loaded!");
            return;
        }

        loadDashboardData().then(() => {
            updateStats();

            if (!chartsInitialized) {
                renderCharts();
                chartsInitialized = true;
            }
        });
    }

    async function loadDashboardData() {
        try {
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
        const totalProjects = projectsData.length;
        const totalReports = reportsData.length;
        const completedProjects = projectsData.filter(p => p.status === 2).length;
        const pendingReports = reportsData.filter(r => r.status === 0).length;

        safeSetText('totalProjects', totalProjects);
        safeSetText('totalReports', totalReports);
        safeSetText('statProjects', totalProjects);
        safeSetText('statReports', totalReports);
        safeSetText('statCompleted', completedProjects);
        safeSetText('statPending', pendingReports);

        const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
        safeSetText('successRate', `${successRate}%`);

        console.log("✅ Stats updated");
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
            tooltip: isDark ? 'dark' : 'light',
            cardBg: isDark ? '#1e293b' : '#ffffff'
        };
    }

    // ===== RENDER ALL CHARTS =====
    function renderCharts() {
        console.log("📊 Rendering charts...");

        // Destroy existing charts
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        chartInstances = {};

        const reportChart = document.getElementById('reportStatusChart');
        const projectChart = document.getElementById('projectProgressChart');
        const monthlyChart = document.getElementById('monthlyActivityChart');
        const taskChart = document.getElementById('taskOverviewChart');

        if (reportChart) renderReportStatusChart();
        if (projectChart) renderProjectProgressChart();
        if (monthlyChart) renderMonthlyActivityChart();
        if (taskChart) renderTaskOverviewChart();

        console.log("✅ All charts rendered");
    }

    // ===== CHART 1: REPORT STATUS (DONUT) =====
    function renderReportStatusChart() {
        const pending = reportsData.filter(r => r.status === 0).length;
        const onProgress = reportsData.filter(r => r.status === 1).length;
        const done = reportsData.filter(r => r.status === 2).length;
        const colors = getChartColors();

        const options = {
            series: [pending, onProgress, done],
            chart: {
                type: 'donut',
                height: 320,
                fontFamily: 'Inter, sans-serif',
                background: 'transparent'
            },
            labels: ['Pending', 'On Progress', 'Done'],
            colors: ['#ef4444', '#f59e0b', '#10b981'],
            legend: {
                position: 'bottom',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                labels: { colors: colors.label }
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
                                formatter: () => pending + onProgress + done
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            stroke: { width: 2, colors: ['#ffffff'] },
            tooltip: { theme: colors.tooltip }
        };

        const chart = new ApexCharts(document.querySelector("#reportStatusChart"), options);
        chart.render();
        chartInstances.reportStatus = chart;
    }

    // ===== CHART 2: PROJECT PROGRESS (BAR) =====
    function renderProjectProgressChart() {
        const pending = projectsData.filter(p => p.status === 0).length;
        const onProgress = projectsData.filter(p => p.status === 1).length;
        const done = projectsData.filter(p => p.status === 2).length;
        const colors = getChartColors();

        const options = {
            series: [{
                name: 'Projects',
                data: [pending, onProgress, done]
            }],
            chart: {
                type: 'bar',
                height: 320,
                fontFamily: 'Inter, sans-serif',
                toolbar: { show: false },
                background: 'transparent'
            },
            plotOptions: {
                bar: {
                    borderRadius: 12,
                    columnWidth: '50%',
                    distributed: true
                }
            },
            colors: ['#ef4444', '#f59e0b', '#10b981'],
            xaxis: {
                categories: ['Pending', 'On Progress', 'Done'],
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
            dataLabels: { enabled: false },
            grid: { borderColor: colors.grid, strokeDashArray: 4 },
            tooltip: { theme: colors.tooltip }
        };

        const chart = new ApexCharts(document.querySelector("#projectProgressChart"), options);
        chart.render();
        chartInstances.projectProgress = chart;
    }

    // ===== CHART 3: MONTHLY ACTIVITY (AREA) =====
    function renderMonthlyActivityChart() {
        const colors = getChartColors();

        // Generate data dari projects dan reports
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const projectData = months.map((_, index) => {
            // Count projects created in each month (dummy data jika tidak ada date)
            return projectsData.filter(p => {
                if (!p.createdDate) return index < 3;
                const month = new Date(p.createdDate).getMonth();
                return month === index;
            }).length || Math.floor(Math.random() * 10) + 5;
        });

        const reportData = months.map((_, index) => {
            // Count reports submitted in each month
            return reportsData.filter(r => {
                if (!r.date) return index < 3;
                const month = new Date(r.date).getMonth();
                return month === index;
            }).length || Math.floor(Math.random() * 8) + 3;
        });

        const options = {
            series: [
                { name: 'Projects', data: projectData },
                { name: 'Reports', data: reportData }
            ],
            chart: {
                type: 'area',
                height: 320,
                fontFamily: 'Inter, sans-serif',
                toolbar: { show: false },
                background: 'transparent'
            },
            colors: ['#4f46e5', '#f59e0b'],
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.4,
                    opacityTo: 0.1
                }
            },
            xaxis: {
                categories: months,
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600,
                        colors: colors.label
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600,
                        colors: colors.label
                    }
                }
            },
            grid: { borderColor: colors.grid, strokeDashArray: 4 },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: colors.label }
            },
            tooltip: { theme: colors.tooltip }
        };

        const chart = new ApexCharts(document.querySelector("#monthlyActivityChart"), options);
        chart.render();
        chartInstances.monthlyActivity = chart;
    }

    // ===== CHART 4: TASK OVERVIEW (RADIAL BAR) =====
    function renderTaskOverviewChart() {
        const colors = getChartColors();

        // Hitung data dari projects dan reports
        const totalProjects = projectsData.length;
        const totalReports = reportsData.length;
        const completedProjects = projectsData.filter(p => p.status === 2).length;
        const pendingReports = reportsData.filter(r => r.status === 0).length;

        // Hitung persentase
        const projectCompletion = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
        const reportPending = totalReports > 0 ? Math.round((pendingReports / totalReports) * 100) : 0;
        const overallProgress = totalProjects + totalReports > 0
            ? Math.round(((completedProjects + (totalReports - pendingReports)) / (totalProjects + totalReports)) * 100)
            : 0;

        const options = {
            series: [projectCompletion, 100 - projectCompletion, reportPending, 100 - reportPending],
            chart: {
                type: 'radialBar',
                height: 320,
                fontFamily: 'Inter, sans-serif',
                background: 'transparent'
            },
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        name: {
                            fontSize: '13px',
                            fontWeight: 600,
                            color: colors.label
                        },
                        value: {
                            fontSize: '16px',
                            fontWeight: 800,
                            color: colors.text
                        },
                        total: {
                            show: true,
                            label: 'Overall',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: colors.label,
                            formatter: () => `${overallProgress}%`
                        }
                    },
                    track: {
                        background: colors.grid,
                        strokeWidth: '97%',
                        margin: 5
                    }
                }
            },
            labels: ['Projects Done', 'Projects Pending', 'Reports Done', 'Reports Pending'],
            colors: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
            stroke: { lineCap: 'round' },
            tooltip: { theme: colors.tooltip }
        };

        const chart = new ApexCharts(document.querySelector("#taskOverviewChart"), options);
        chart.render();
        chartInstances.taskOverview = chart;
    }

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', function() {
        initDarkMode();
        initMobileSidebar();
        initDashboard();
    });
}
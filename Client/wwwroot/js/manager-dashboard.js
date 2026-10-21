// ========================================
// MANAGER DASHBOARD - FIXED CHART RENDERING
// No duplication, proper initialization
// ========================================

const API_BASE = "https://localhost:7261/api";
let projectsData = [];
let reportsData = [];
let chartsInitialized = false; // ✅ Prevent double rendering

// Wait for DOM and ApexCharts to be ready
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Manager Dashboard initialized");
    
    // Check if ApexCharts is loaded
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
        
        // ✅ Render charts only once
        if (!chartsInitialized) {
            renderCharts();
            chartsInitialized = true;
        }
    } catch (error) {
        console.error("❌ Error initializing dashboard:", error);
    }
}

async function loadDashboardData() {
    try {
        // Load Projects
        const projectsRes = await fetch(`${API_BASE}/ProjectLists`);
        if (projectsRes.ok) {
            projectsData = await projectsRes.json();
            console.log("✅ Projects loaded:", projectsData.length);
        } else {
            console.warn("⚠️ Failed to load projects:", projectsRes.status);
            projectsData = [];
        }

        // Load Reports
        const reportsRes = await fetch(`${API_BASE}/Reports`);
        if (reportsRes.ok) {
            reportsData = await reportsRes.json();
            console.log("✅ Reports loaded:", reportsData.length);
        } else {
            console.warn("⚠️ Failed to load reports:", reportsRes.status);
            reportsData = [];
        }
    } catch (error) {
        console.error("❌ Error loading data:", error);
        projectsData = [];
        reportsData = [];
    }
}

function updateStats() {
    const totalProjects = projectsData.length;
    const totalReports = reportsData.length;
    const completedProjects = projectsData.filter(p => p.status === 2).length;
    const pendingReports = reportsData.filter(r => r.status === 0).length;

    // Update hero stats
    safeSetText('totalProjects', totalProjects);
    safeSetText('totalReports', totalReports);

    // Update stat cards
    safeSetText('statProjects', totalProjects);
    safeSetText('statReports', totalReports);
    safeSetText('statCompleted', completedProjects);
    safeSetText('statPending', pendingReports);

    // Calculate rates
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    safeSetText('successRate', `${successRate}%`);
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
    
    // Clear existing charts if any
    clearChart('reportStatusChart');
    clearChart('projectProgressChart');
    clearChart('monthlyActivityChart');
    clearChart('taskOverviewChart');
    
    renderReportStatusChart();
    renderProjectProgressChart();
    renderMonthlyActivityChart();
    renderTaskOverviewChart();
    
    console.log("✅ All charts rendered");
}

function clearChart(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = ''; // Clear loading state
    }
}

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
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        labels: ['Pending', 'On Progress', 'Done'],
        colors: ['#ef4444', '#f59e0b', '#10b981'],
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
                            color: colors.text,
                            formatter: (val) => Math.round(val)
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
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '13px',
                fontWeight: 700,
                colors: ['#ffffff']
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 2,
                opacity: 0.5
            }
        },
        stroke: { width: 2, colors: ['#ffffff'] },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#reportStatusChart"), options);
    chart.render().then(() => {
        console.log("✅ Report Status chart rendered");
    });
}

function renderProjectProgressChart() {
    const pending = projectsData.filter(p => p.status === 0).length;
    const onProgress = projectsData.filter(p => p.status === 1).length;
    const done = projectsData.filter(p => p.status === 2).length;
    const colors = getChartColors();

    const options = {
        series: [{ name: 'Projects', data: [pending, onProgress, done] }],
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
                distributed: true,
                dataLabels: { position: 'top' }
            }
        },
        colors: ['#ef4444', '#f59e0b', '#10b981'],
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '14px',
                fontWeight: 800,
                colors: [colors.text]
            },
            offsetY: -20
        },
        xaxis: {
            categories: ['Pending', 'On Progress', 'Done'],
            labels: {
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    colors: colors.label
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    colors: colors.label
                }
            },
            min: 0,
            tickAmount: 4
        },
        grid: {
            borderColor: colors.grid,
            strokeDashArray: 4,
            padding: { top: 20, right: 20, bottom: 10, left: 10 }
        },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#projectProgressChart"), options);
    chart.render().then(() => {
        console.log("✅ Project Progress chart rendered");
    });
}

function renderMonthlyActivityChart() {
    const colors = getChartColors();

    const options = {
        series: [{
            name: 'Projects',
            data: [12, 8, 15, 10, 14, 12]
        }, {
            name: 'Reports',
            data: [8, 12, 10, 15, 8, 14]
        }],
        chart: {
            type: 'area',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        colors: ['#4f46e5', '#f59e0b'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    colors: colors.label
                }
            },
            axisBorder: { show: true, color: colors.grid },
            axisTicks: { show: false }
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
        grid: {
            borderColor: colors.grid,
            strokeDashArray: 4
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '13px',
            fontWeight: 600,
            labels: { colors: colors.label },
            markers: { width: 12, height: 12, radius: 3 }
        },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#monthlyActivityChart"), options);
    chart.render().then(() => {
        console.log("✅ Monthly Activity chart rendered");
    });
}

function renderTaskOverviewChart() {
    const colors = getChartColors();

    const options = {
        series: [75, 60, 85, 45],
        chart: {
            type: 'radialBar',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
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
                        formatter: () => '67%'
                    }
                },
                track: {
                    background: colors.grid,
                    strokeWidth: '97%',
                    margin: 5
                }
            }
        },
        labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        stroke: { lineCap: 'round' },
        tooltip: {
            theme: colors.tooltip,
            style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#taskOverviewChart"), options);
    chart.render().then(() => {
        console.log("✅ Task Overview chart rendered");
    });
}
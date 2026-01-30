import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faBullhorn,
    faChartLine,
    faChartBar,
    faStore,
    faCalendarAlt,
    faSync,
    faPercentage,
    faBullseye,
    faUsers,
    faUtensils,
    faFileAlt,
    faChartPie,
    faChartArea,
    faUserFriends,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

const DashboardContentUser = () => {
    const [filter, setFilter] = useState({
        startDate: "",
        endDate: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        lob: "ALL",
    });

    const [currentUser, setCurrentUser] = useState(null);
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryStats, setSummaryStats] = useState({
        totalFnb: 0,
        totalCinema: 0,
        avgDS: 0,
        avgAchievement: 0,
        totalAudience: 0,
        totalTargetHead: 0,
        reportCount: 0,
    });

    // State untuk chart
    const [chartType, setChartType] = useState("bar");
    const [chartData, setChartData] = useState([]);
    const [selectedChartData, setSelectedChartData] = useState({
        type: "total_sales",
        metric: "Total Sales",
    });
    const [showChart, setShowChart] = useState(true);
    const [perHeadData, setPerHeadData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [availableLobs, setAvailableLobs] = useState([]);

    // State tambahan untuk mendukung multiple outlet
    const [userOutletName, setUserOutletName] = useState("");

    // Bulan untuk filter
    const months = [
        { value: 1, label: "Januari" },
        { value: 2, label: "Februari" },
        { value: 3, label: "Maret" },
        { value: 4, label: "April" },
        { value: 5, label: "Mei" },
        { value: 6, label: "Juni" },
        { value: 7, label: "Juli" },
        { value: 8, label: "Agustus" },
        { value: 9, label: "September" },
        { value: 10, label: "Oktober" },
        { value: 11, label: "November" },
        { value: 12, label: "Desember" },
    ];

    // Tahun untuk filter
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        // Ambil data user dari localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log("User data from localStorage:", userData);
        setCurrentUser(userData);

        if (userData) {
            // Simpan nama outlet user
            setUserOutletName(userData.outlet_name || "SUMMARECON SERPONG XXI");
            fetchPerformanceData(userData);
        } else {
            setError("User data tidak ditemukan. Silakan login kembali.");
            setLoading(false);
        }
    }, [filter.month, filter.year, filter.lob]);

    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    // Perhitungan DS yang benar
    const calculateDSFromDatabase = (report) => {
        const fnbSales = report.omzet_fnb || 0;
        const targetHead = report.target_head || 0;

        if (!targetHead || targetHead === 0) return 0;

        const averageSpendPerVisitor = 50000;
        const expectedFnbSales = targetHead * averageSpendPerVisitor;

        const ds = (fnbSales / expectedFnbSales) * 100;
        return Math.min(200, Math.max(0, parseFloat(ds.toFixed(1))));
    };

    // Perhitungan achievement yang benar
    const calculateAchievementFromDatabase = (report) => {
        const fnbSales = report.omzet_fnb || 0;
        const targetPercentage = report.target_percentage || 100;

        const baseTarget = 10000000;
        const targetValue = (targetPercentage / 100) * baseTarget;

        if (!targetValue || targetValue === 0) return 0;

        const achievement = (fnbSales / targetValue) * 100;
        return Math.min(200, Math.max(0, parseFloat(achievement.toFixed(1))));
    };

    // Helper functions untuk formatting
    const formatPercentage = (value) => {
        try {
            if (value === null || value === undefined || value === "") {
                return "0%";
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                return "0%";
            }
            return `${numValue.toFixed(1)}%`;
        } catch (error) {
            return "0%";
        }
    };

    // Format angka dengan titik sebagai pemisah ribu
    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) {
            return "0";
        }
        const number = typeof num === "string" ? parseFloat(num) : num;
        if (isNaN(number)) {
            return "0";
        }

        return Math.floor(number)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const safeFormatNumber = (num) => {
        try {
            if (num === null || num === undefined || num === "" || isNaN(num)) {
                return "0";
            }
            const number = typeof num === "string" ? parseFloat(num) : num;
            if (isNaN(number)) {
                return "0";
            }
            return Math.floor(number)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } catch (error) {
            return "0";
        }
    };

    const getAchievementColor = (percentage) => {
        const num = parseFloat(percentage);
        if (num >= 100) return "#10b981";
        if (num >= 80) return "#f59e0b";
        return "#ef4444";
    };

    const getDSColor = (percentage) => {
        const num = parseFloat(percentage);
        if (num >= 100) return "#10b981";
        if (num >= 90) return "#22c55e";
        if (num >= 80) return "#f59e0b";
        if (num >= 70) return "#f97316";
        return "#ef4444";
    };

    const getLobColor = (lob) => {
        const colors = {
            Cafe: "#10b981",
            Premiere: "#3b82f6",
            "Hello Sunday": "#8b5cf6",
            Cinema: "#f59e0b",
            "Food Court": "#ef4444",
            Retail: "#6366f1",
            Entertainment: "#ec4899",
            Other: "#6b7280",
        };
        return colors[lob] || "#6b7280";
    };

    const fetchPerformanceData = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("Token tidak ditemukan. Silakan login kembali.");
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                params: {
                    month: filter.month,
                    year: filter.year,
                },
            };

            console.log("Fetching reports for outlet:", userOutletName);

            const response = await axios.get(`${API_BASE_URL}/reports`, config);
            console.log("API Response raw:", response.data);

            let reportsData = [];

            if (response.data.success && response.data.data) {
                // FILTER PENTING: Ambil SEMUA data untuk outlet "SUMMARECON SERPONG XXI"
                reportsData = response.data.data
                    .filter((report) => {
                        const reportOutletName =
                            report.outlet?.nama_outlet || "";
                        // Cocokkan dengan nama outlet user (case insensitive, partial match)
                        return reportOutletName
                            .toLowerCase()
                            .includes("summarecon serpong");
                    })
                    .map((report) => ({
                        ...report,
                        omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                        omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                        total_bills: parseInt(report.total_bills) || 0,
                        total_audience: parseInt(report.total_audience) || 0,
                        target_percentage:
                            parseFloat(report.target_percentage) || 0,
                        target_head: parseInt(report.target_head) || 0,
                        lob: report.outlet?.lob || report.lob || "Cafe",
                        outlet_name: report.outlet?.nama_outlet || "Unknown",
                        outlet_id:
                            report.outlet_id ||
                            (report.outlet ? report.outlet.id : null),
                        date: report.report_date,
                        class: report.class || "Regular",
                    }));
            } else if (Array.isArray(response.data)) {
                // Jika response langsung array
                reportsData = response.data
                    .filter((report) => {
                        const reportOutletName =
                            report.outlet?.nama_outlet ||
                            report.outlet_name ||
                            "";
                        return reportOutletName
                            .toLowerCase()
                            .includes("summarecon serpong");
                    })
                    .map((report) => ({
                        ...report,
                        omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                        omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                        total_bills: parseInt(report.total_bills) || 0,
                        total_audience: parseInt(report.total_audience) || 0,
                        target_percentage:
                            parseFloat(report.target_percentage) || 0,
                        target_head: parseInt(report.target_head) || 0,
                        lob: report.outlet?.lob || report.lob || "Cafe",
                        outlet_name:
                            report.outlet?.nama_outlet ||
                            report.outlet_name ||
                            "Unknown",
                        outlet_id:
                            report.outlet_id ||
                            (report.outlet ? report.outlet.id : null),
                        date: report.report_date || report.date,
                        class: report.class || "Regular",
                    }));
            }

            console.log(
                "Total reports setelah filter Summarecon Serpong:",
                reportsData.length
            );
            console.log(
                "Detail reports:",
                reportsData.map((r) => ({
                    id: r.id,
                    outlet_id: r.outlet_id,
                    outlet_name: r.outlet_name,
                    lob: r.lob,
                    date: r.date,
                }))
            );

            // Filter berdasarkan tanggal jika ada
            if (filter.startDate && filter.endDate) {
                reportsData = reportsData.filter((report) => {
                    const reportDate = new Date(
                        report.date || report.report_date
                    );
                    const startDate = new Date(filter.startDate);
                    const endDate = new Date(filter.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    return reportDate >= startDate && reportDate <= endDate;
                });
            }

            // Filter berdasarkan LOB
            if (filter.lob !== "ALL") {
                reportsData = reportsData.filter(
                    (report) => report.lob === filter.lob
                );
            }

            // Extract unique LOBs dari data yang sudah difilter
            const uniqueLobs = [...new Set(reportsData.map((r) => r.lob))];
            console.log("Unique LOBs found:", uniqueLobs);
            setAvailableLobs(["ALL", ...uniqueLobs]);

            // Transform data untuk dashboard
            const transformedData = reportsData.map((report) => {
                const ds = calculateDSFromDatabase(report);
                const achievement = calculateAchievementFromDatabase(report);
                const totalSales =
                    (report.omzet_fnb || 0) + (report.omzet_cinema || 0);
                const perHeadFnb =
                    report.total_audience > 0
                        ? Math.round(
                              (report.omzet_fnb || 0) / report.total_audience
                          )
                        : 0;

                return {
                    ...report,
                    id: report.id,
                    outlet_name: report.outlet_name,
                    lob: report.lob,
                    class: report.class,
                    date: report.date || report.report_date,
                    target_percentage: report.target_percentage,
                    target_head: report.target_head,
                    omzet_fnb: report.omzet_fnb || 0,
                    omzet_cinema: report.omzet_cinema || 0,
                    total_sales: totalSales,
                    total_audience: report.total_audience,
                    ds_percentage: ds,
                    achievement_percentage: achievement,
                    per_head_fnb: perHeadFnb,
                };
            });

            setPerformanceData(transformedData);

            // Prepare data untuk chart
            prepareDailyData(transformedData);
            preparePerHeadData(transformedData);

            // Calculate summary statistics
            if (transformedData.length > 0) {
                const totalFnb = transformedData.reduce(
                    (sum, item) => sum + (item.omzet_fnb || 0),
                    0
                );

                const totalCinema = transformedData.reduce(
                    (sum, item) => sum + (item.omzet_cinema || 0),
                    0
                );

                const totalAudience = transformedData.reduce(
                    (sum, item) => sum + (item.total_audience || 0),
                    0
                );

                const totalTargetHead = transformedData.reduce(
                    (sum, item) => sum + (item.target_head || 0),
                    0
                );

                const avgDS =
                    transformedData.length > 0
                        ? transformedData.reduce(
                              (sum, item) => sum + (item.ds_percentage || 0),
                              0
                          ) / transformedData.length
                        : 0;

                const avgAchievement =
                    transformedData.length > 0
                        ? transformedData.reduce(
                              (sum, item) =>
                                  sum + (item.achievement_percentage || 0),
                              0
                          ) / transformedData.length
                        : 0;

                setSummaryStats({
                    totalFnb,
                    totalCinema,
                    avgDS,
                    avgAchievement,
                    totalAudience,
                    totalTargetHead,
                    reportCount: transformedData.length,
                });

                console.log("Summary stats:", {
                    totalFnb,
                    totalCinema,
                    avgDS,
                    avgAchievement,
                    totalAudience,
                    totalTargetHead,
                    reportCount: transformedData.length,
                    lobs: uniqueLobs,
                });
            } else {
                setSummaryStats({
                    totalFnb: 0,
                    totalCinema: 0,
                    avgDS: 0,
                    avgAchievement: 0,
                    totalAudience: 0,
                    totalTargetHead: 0,
                    reportCount: 0,
                });
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
            setError(`Gagal mengambil data performa: ${error.message}`);
            setPerformanceData([]);
            setChartData([]);
            setPerHeadData([]);
            setDailyData([]);
            setAvailableLobs(["ALL"]);
        } finally {
            setLoading(false);
        }
    };

    // Function untuk menyiapkan data harian 1 bulan penuh
    const prepareDailyData = (data) => {
        // Dapatkan jumlah hari dalam bulan yang dipilih
        const daysInMonth = new Date(filter.year, filter.month, 0).getDate();

        // Buat array untuk semua hari dalam bulan
        const dailyChartData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(filter.year, filter.month - 1, day);
            const dateStr = currentDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            });

            // Format tanggal untuk filter
            const dateFilter = `${filter.year}-${filter.month
                .toString()
                .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

            // Filter data untuk tanggal ini
            const dayData = data.filter((item) => {
                if (!item.date) return false;
                const itemDate = new Date(item.date);
                return (
                    itemDate.getDate() === day &&
                    itemDate.getMonth() + 1 === filter.month &&
                    itemDate.getFullYear() === filter.year
                );
            });

            // Hitung agregat untuk hari ini
            if (dayData.length > 0) {
                const totalFnb = dayData.reduce(
                    (sum, item) => sum + (item.omzet_fnb || 0),
                    0
                );
                const totalCinema = dayData.reduce(
                    (sum, item) => sum + (item.omzet_cinema || 0),
                    0
                );
                const totalAudience = dayData.reduce(
                    (sum, item) => sum + (item.total_audience || 0),
                    0
                );
                const totalTargetHead = dayData.reduce(
                    (sum, item) => sum + (item.target_head || 0),
                    0
                );
                const avgDS =
                    dayData.length > 0
                        ? dayData.reduce(
                              (sum, item) => sum + (item.ds_percentage || 0),
                              0
                          ) / dayData.length
                        : 0;
                const avgAchievement =
                    dayData.length > 0
                        ? dayData.reduce(
                              (sum, item) =>
                                  sum + (item.achievement_percentage || 0),
                              0
                          ) / dayData.length
                        : 0;
                const outletCount = [
                    ...new Set(dayData.map((item) => item.outlet_name)),
                ].length;
                const lobCount = [...new Set(dayData.map((item) => item.lob))]
                    .length;
                const perHeadFnb =
                    totalAudience > 0
                        ? Math.round(totalFnb / totalAudience)
                        : 0;

                dailyChartData.push({
                    name: day.toString(),
                    date: dateStr,
                    fullDate: dateFilter,
                    day: day,
                    total_sales: totalFnb + totalCinema,
                    fnb: totalFnb,
                    cinema: totalCinema,
                    audience: totalAudience,
                    target_head: totalTargetHead,
                    ds: parseFloat(avgDS.toFixed(1)),
                    achievement: parseFloat(avgAchievement.toFixed(1)),
                    per_head_fnb: perHeadFnb,
                    outlet_count: outletCount,
                    lob_count: lobCount,
                    has_data: true,
                });
            } else {
                // Jika tidak ada data untuk hari ini, tetap tampilkan dengan nilai 0
                dailyChartData.push({
                    name: day.toString(),
                    date: dateStr,
                    fullDate: dateFilter,
                    day: day,
                    total_sales: 0,
                    fnb: 0,
                    cinema: 0,
                    audience: 0,
                    target_head: 0,
                    ds: 0,
                    achievement: 0,
                    per_head_fnb: 0,
                    outlet_count: 0,
                    lob_count: 0,
                    has_data: false,
                });
            }
        }

        setDailyData(dailyChartData);

        // Set chart data berdasarkan tipe
        if (chartType === "daily") {
            setChartData(dailyChartData);
        }
    };

    // Function untuk menyiapkan data Per Head (disesuaikan untuk multiple outlet)
    const preparePerHeadData = (data) => {
        if (!data || data.length === 0) {
            setPerHeadData([]);
            return;
        }

        // Kelompokkan data berdasarkan tanggal dan LOB
        const perHeadByDateAndLob = {};

        data.forEach((item) => {
            const date = item.date;
            if (!date) return;

            const dateKey = new Date(date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            });

            const lobKey = item.lob || "Unknown";
            const compositeKey = `${dateKey}_${lobKey}`;

            if (!perHeadByDateAndLob[compositeKey]) {
                perHeadByDateAndLob[compositeKey] = {
                    date: dateKey,
                    fullDate: date,
                    lob: lobKey,
                    total_fnb: 0,
                    total_audience: 0,
                    count: 0,
                };
            }

            perHeadByDateAndLob[compositeKey].total_fnb += item.omzet_fnb || 0;
            perHeadByDateAndLob[compositeKey].total_audience +=
                item.total_audience || 0;
            perHeadByDateAndLob[compositeKey].count += 1;
        });

        // Calculate per head values per date per LOB
        const perHeadChartData = Object.values(perHeadByDateAndLob).map(
            (dayData) => {
                const perHeadFnb =
                    dayData.total_audience > 0
                        ? Math.round(dayData.total_fnb / dayData.total_audience)
                        : 0;

                return {
                    name: `${dayData.date} (${dayData.lob})`,
                    fullName: `Tanggal: ${dayData.date}, LOB: ${dayData.lob}`,
                    date: dayData.date,
                    lob: dayData.lob,
                    per_head_fnb: perHeadFnb,
                    avg_fnb: Math.round(dayData.total_fnb / dayData.count),
                    avg_audience: Math.round(
                        dayData.total_audience / dayData.count
                    ),
                    fill: getLobColor(dayData.lob),
                };
            }
        );

        // Sort by date
        perHeadChartData.sort((a, b) => {
            const dateA = new Date(a.fullDate);
            const dateB = new Date(b.fullDate);
            return dateA - dateB;
        });

        setPerHeadData(perHeadChartData);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilter = () => {
        if (currentUser) {
            fetchPerformanceData(currentUser);
        }
    };

    const handleResetFilter = () => {
        setFilter({
            startDate: "",
            endDate: "",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            lob: "ALL",
        });
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);

        // Update chart data berdasarkan tipe
        if (type === "daily") {
            setChartData(dailyData);
        } else if (type === "perHead") {
            setChartData(perHeadData);
        } else {
            setChartData(dailyData);
        }
    };

    const handleChartDataChange = (type, metric) => {
        setSelectedChartData({
            type: type,
            metric: metric,
        });
    };

    // Render Daily Chart dengan sumbu X 1 bulan penuh
    const renderDailyChart = () => {
        if (dailyData.length === 0) {
            return (
                <div style={styles.noDataChart}>
                    <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
                    <p>Tidak ada data harian untuk ditampilkan</p>
                </div>
            );
        }

        const dataKey = selectedChartData.type;
        const metricName = selectedChartData.metric;

        // Custom tooltip untuk Daily chart
        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const data = dailyData.find((d) => d.name === label);
                return (
                    <div style={styles.customTooltip}>
                        <p style={styles.tooltipLabel}>
                            <strong>Tanggal: {data?.date}</strong>
                        </p>
                        <p style={{ margin: "2px 0", color: "#6b7280" }}>
                            Hari ke-{label}
                        </p>
                        {data?.outlet_count > 0 && (
                            <p style={{ margin: "2px 0", color: "#6b7280" }}>
                                Jumlah Outlet: {data?.outlet_count}
                            </p>
                        )}
                        {data?.lob_count > 0 && (
                            <p style={{ margin: "2px 0", color: "#6b7280" }}>
                                Jumlah LOB: {data?.lob_count}
                            </p>
                        )}
                        {payload.map((entry, index) => (
                            <p
                                key={index}
                                style={{
                                    color:
                                        entry.color ||
                                        entry.stroke ||
                                        entry.fill,
                                    margin: "3px 0",
                                    fontWeight: 500,
                                }}
                            >
                                {entry.dataKey === "ds" ||
                                entry.dataKey === "achievement"
                                    ? `${
                                          entry.name || metricName
                                      }: ${formatPercentage(entry.value)}`
                                    : `${
                                          entry.name || metricName
                                      }: ${formatNumber(entry.value)}`}
                            </p>
                        ))}
                    </div>
                );
            }
            return null;
        };

        // Data options untuk chart harian
        const chartOptions = {
            total_sales: { label: "Total Sales", color: "#3b82f6" },
            fnb: { label: "F&B Sales", color: "#10b981" },
            cinema: { label: "Cinema Sales", color: "#f59e0b" },
            ds: { label: "DS Percentage", color: "#8b5cf6" },
            achievement: { label: "Achievement Percentage", color: "#ec4899" },
            audience: { label: "Audience", color: "#22c55e" },
            target_head: { label: "Target Head", color: "#f97316" },
            per_head_fnb: { label: "Per Head F&B", color: "#6366f1" },
        };

        const selectedOption =
            chartOptions[dataKey] || chartOptions.total_sales;

        if (chartType === "bar") {
            return (
                <div style={{ height: "450px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={dailyData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 50,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                            />
                            <XAxis
                                dataKey="name"
                                label={{
                                    value: "Hari",
                                    position: "insideBottom",
                                    offset: 0,
                                    style: { fontSize: 12 },
                                }}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (
                                        dataKey === "ds" ||
                                        dataKey === "achievement"
                                    ) {
                                        return `${value}%`;
                                    }
                                    return formatNumber(value);
                                }}
                                width={80}
                                label={{
                                    value:
                                        dataKey === "ds" ||
                                        dataKey === "achievement"
                                            ? "Persentase (%)"
                                            : "Nilai",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                        textAnchor: "middle",
                                        fontSize: 12,
                                    },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey={dataKey}
                                name={selectedOption.label}
                                fill={selectedOption.color}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        } else if (chartType === "line") {
            return (
                <div style={{ height: "450px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={dailyData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 50,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                            />
                            <XAxis
                                dataKey="name"
                                label={{
                                    value: "Hari",
                                    position: "insideBottom",
                                    offset: 0,
                                    style: { fontSize: 12 },
                                }}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (
                                        dataKey === "ds" ||
                                        dataKey === "achievement"
                                    ) {
                                        return `${value}%`;
                                    }
                                    return formatNumber(value);
                                }}
                                width={80}
                                label={{
                                    value:
                                        dataKey === "ds" ||
                                        dataKey === "achievement"
                                            ? "Persentase (%)"
                                            : "Nilai",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                        textAnchor: "middle",
                                        fontSize: 12,
                                    },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                name={selectedOption.label}
                                stroke={selectedOption.color}
                                strokeWidth={2}
                                dot={{ strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        }
    };

    // Render Per Head Chart
    const renderPerHeadChart = () => {
        if (perHeadData.length === 0) {
            return (
                <div style={styles.noDataChart}>
                    <FontAwesomeIcon icon={faUserFriends} size="2x" />
                    <p>Tidak ada data Per Head untuk ditampilkan</p>
                </div>
            );
        }

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const data = perHeadData.find((d) => d.name === label);
                return (
                    <div style={styles.customTooltip}>
                        <p style={styles.tooltipLabel}>
                            <strong>{data?.fullName}</strong>
                        </p>
                        <p style={{ margin: "2px 0", color: "#6b7280" }}>
                            LOB: {data?.lob}
                        </p>
                        {payload.map((entry, index) => (
                            <p
                                key={index}
                                style={{
                                    color:
                                        entry.color ||
                                        entry.stroke ||
                                        entry.fill,
                                    margin: "3px 0",
                                    fontWeight: 500,
                                }}
                            >
                                {entry.name}: {formatNumber(entry.value)}
                            </p>
                        ))}
                    </div>
                );
            }
            return null;
        };

        return (
            <div style={styles.perHeadChartContainer}>
                <div style={styles.perHeadChartHeader}>
                    <div style={styles.perHeadTitle}>
                        <FontAwesomeIcon
                            icon={faUserFriends}
                            style={{ marginRight: "10px", color: "#3b82f6" }}
                        />
                        <h3 style={styles.perHeadChartTitle}>
                            Per Head F&B per LOB
                        </h3>
                    </div>
                    <div style={styles.perHeadSubtitle}>
                        <span>
                            Per Head F&B berdasarkan LOB di {userOutletName}
                        </span>
                    </div>
                </div>

                <div style={{ height: "400px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={perHeadData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 100,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                            />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickFormatter={(value) => formatNumber(value)}
                                label={{
                                    value: "Per Head F&B",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                        textAnchor: "middle",
                                        fontSize: 12,
                                    },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="per_head_fnb"
                                name="Per Head F&B"
                                radius={[4, 4, 0, 0]}
                            >
                                {perHeadData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // Render chart utama berdasarkan tipe yang dipilih
    const renderMainChart = () => {
        if (chartType === "daily") {
            return renderDailyChart();
        } else if (chartType === "perHead") {
            return renderPerHeadChart();
        } else {
            return renderDailyChart();
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat data dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.pageContent}>
            <div style={styles.contentWrapper}>
                {/* User Info Banner */}
                {/* {currentUser && (
                    <div style={styles.userInfoBanner}>
                        <div style={styles.userInfoContent}>
                            <FontAwesomeIcon
                                icon={faUserCircle}
                                style={styles.userInfoIcon}
                            />
                            <div>
                                <h3 style={styles.userInfoTitle}>
                                    Dashboard Outlet: {userOutletName}
                                </h3>
                                <p style={styles.userInfoSubtitle}>
                                    User: {currentUser.name} • Outlet ID:{" "}
                                    {currentUser.outlet_id} •
                                    {currentUser.role
                                        ? ` Role: ${currentUser.role}`
                                        : ""}
                                </p>
                                <p style={styles.userInfoSubtitle}>
                                    Menampilkan data untuk semua LOB di outlet
                                    ini
                                </p>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Filter Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faFilter}
                                style={{ marginRight: "10px" }}
                            />
                            Filter Data Performa
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Filter berdasarkan periode waktu dan LOB untuk data
                            laporan Anda
                        </p>
                    </div>

                    <div style={styles.filterGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Bulan</label>
                            <select
                                name="month"
                                value={filter.month}
                                onChange={handleFilterChange}
                                style={styles.filterSelect}
                            >
                                {months.map((month) => (
                                    <option
                                        key={month.value}
                                        value={month.value}
                                    >
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Tahun</label>
                            <select
                                name="year"
                                value={filter.year}
                                onChange={handleFilterChange}
                                style={styles.filterSelect}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>LOB</label>
                            <select
                                name="lob"
                                value={filter.lob}
                                onChange={handleFilterChange}
                                style={styles.filterSelect}
                            >
                                {availableLobs.map((lob) => (
                                    <option key={lob} value={lob}>
                                        {lob === "ALL" ? "Semua LOB" : lob}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>
                                Tanggal Mulai
                            </label>
                            <div style={styles.dateContainer}>
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    style={styles.dateIcon}
                                />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filter.startDate}
                                    onChange={handleFilterChange}
                                    style={styles.dateInput}
                                />
                            </div>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>
                                Tanggal Akhir
                            </label>
                            <div style={styles.dateContainer}>
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    style={styles.dateIcon}
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filter.endDate}
                                    onChange={handleFilterChange}
                                    style={styles.dateInput}
                                />
                            </div>
                        </div>

                        <div style={styles.filterActions}>
                            <button
                                onClick={handleApplyFilter}
                                style={styles.applyButton}
                            >
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    style={{ marginRight: "8px" }}
                                />
                                Terapkan Filter
                            </button>
                            <button
                                onClick={handleResetFilter}
                                style={styles.resetButton}
                            >
                                <FontAwesomeIcon
                                    icon={faSync}
                                    style={{ marginRight: "8px" }}
                                />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorContainer}>
                        <p style={styles.errorText}>{error}</p>
                    </div>
                )}

                {/* Summary Statistics */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faChartLine}
                                style={{ marginRight: "10px" }}
                            />
                            Ringkasan Statistik - {userOutletName}
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Overview performa laporan untuk semua LOB
                        </p>
                    </div>

                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#3b82f6",
                                }}
                            >
                                <FontAwesomeIcon icon={faUtensils} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>Total F&B</h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(summaryStats.totalFnb || 0)}
                                </p>
                                <p style={styles.summarySubtitle}>
                                    {summaryStats.reportCount} laporan
                                </p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#f59e0b",
                                }}
                            >
                                <FontAwesomeIcon icon={faFileAlt} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Total Cinema
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(
                                        summaryStats.totalCinema || 0
                                    )}
                                </p>
                                <p style={styles.summarySubtitle}>Semua LOB</p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#10b981",
                                }}
                            >
                                <FontAwesomeIcon icon={faPercentage} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Rata-rata DS
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatPercentage(summaryStats.avgDS || 0)}
                                </p>
                                <p style={styles.summarySubtitle}>
                                    {availableLobs.length - 1} LOB
                                </p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#ec4899",
                                }}
                            >
                                <FontAwesomeIcon icon={faBullseye} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Rata-rata Achievement
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatPercentage(
                                        summaryStats.avgAchievement || 0
                                    )}
                                </p>
                                <p style={styles.summarySubtitle}>
                                    Target tercapai
                                </p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#22c55e",
                                }}
                            >
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Total Audience
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(
                                        summaryStats.totalAudience || 0
                                    )}
                                </p>
                                <p style={styles.summarySubtitle}>Pengunjung</p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#f97316",
                                }}
                            >
                                <FontAwesomeIcon icon={faBullhorn} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Total Target Head
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(
                                        summaryStats.totalTargetHead || 0
                                    )}
                                </p>
                                <p style={styles.summarySubtitle}>
                                    Target audience
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Visualization Section */}
                <div style={styles.section}>
                    <div style={styles.chartSectionHeader}>
                        <div style={styles.chartTitleSection}>
                            <h2 style={styles.sectionTitle}>
                                <FontAwesomeIcon
                                    icon={faChartArea}
                                    style={{
                                        marginRight: "10px",
                                        color: "#3b82f6",
                                    }}
                                />
                                Visualisasi Data Performa - {userOutletName}
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                Analisis visual data performa harian 1 bulan
                                penuh untuk semua LOB
                            </p>
                        </div>

                        <div style={styles.chartControlsContainer}>
                            <div style={styles.chartTypeContainer}>
                                <label style={styles.controlLabel}>
                                    Tipe Chart:
                                </label>
                                <div style={styles.chartTypeButtons}>
                                    <button
                                        onClick={() =>
                                            handleChartTypeChange("bar")
                                        }
                                        style={{
                                            ...styles.chartTypeBtn,
                                            ...(chartType === "bar" &&
                                                styles.activeChartTypeBtn),
                                        }}
                                        title="Bar Chart"
                                    >
                                        <FontAwesomeIcon icon={faChartBar} />
                                        <span style={styles.chartTypeLabel}>
                                            Bar
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleChartTypeChange("line")
                                        }
                                        style={{
                                            ...styles.chartTypeBtn,
                                            ...(chartType === "line" &&
                                                styles.activeChartTypeBtn),
                                        }}
                                        title="Line Chart"
                                    >
                                        <FontAwesomeIcon icon={faChartLine} />
                                        <span style={styles.chartTypeLabel}>
                                            Line
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div style={styles.chartDataContainer}>
                                <label style={styles.controlLabel}>Data:</label>
                                <select
                                    value={selectedChartData.type}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        const metricMap = {
                                            total_sales: "Total Sales",
                                            fnb: "F&B Sales",
                                            cinema: "Cinema Sales",
                                            ds: "DS Percentage",
                                            achievement:
                                                "Achievement Percentage",
                                            audience: "Audience",
                                            target_head: "Target Head",
                                            per_head_fnb: "Per Head F&B",
                                        };
                                        handleChartDataChange(
                                            type,
                                            metricMap[type]
                                        );
                                    }}
                                    style={styles.chartDataSelect}
                                >
                                    <option value="total_sales">
                                        Total Sales
                                    </option>
                                    <option value="fnb">F&B Sales</option>
                                    <option value="cinema">Cinema Sales</option>
                                    <option value="per_head_fnb">
                                        Per Head F&B
                                    </option>
                                    <option value="ds">DS Percentage</option>
                                    <option value="achievement">
                                        Achievement Percentage
                                    </option>
                                    <option value="audience">Audience</option>
                                    <option value="target_head">
                                        Target Head
                                    </option>
                                </select>
                            </div>

                            <div style={styles.chartToggleContainer}>
                                <button
                                    onClick={() => setShowChart(!showChart)}
                                    style={styles.toggleChartBtn}
                                >
                                    {showChart ? (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faChartBar}
                                            />
                                            <span>Sembunyikan</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                            />
                                            <span>Tampilkan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {showChart && (
                        <div style={styles.chartContainer}>
                            <div style={styles.chartInfo}>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Outlet:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {userOutletName}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Periode:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {
                                            months.find(
                                                (m) => m.value === filter.month
                                            )?.label
                                        }{" "}
                                        {filter.year}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        LOB:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {filter.lob === "ALL"
                                            ? `Semua (${
                                                  availableLobs.length - 1
                                              })`
                                            : filter.lob}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Total Data:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {performanceData.length} laporan
                                    </span>
                                </div>
                            </div>

                            {renderMainChart()}
                        </div>
                    )}
                </div>

                {/* Performance Table */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faChartLine}
                                style={{ marginRight: "10px" }}
                            />
                            Detail Laporan - {userOutletName}
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Data lengkap laporan untuk semua LOB
                        </p>
                    </div>

                    {performanceData.length > 0 ? (
                        <div style={styles.performanceContainer}>
                            <div style={styles.tableContainer}>
                                <table style={styles.performanceTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>
                                                Outlet
                                            </th>
                                            <th style={styles.tableHeader}>
                                                LOB
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Class
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Tanggal
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Target (%)
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Target Head
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Audience
                                            </th>
                                            <th style={styles.tableHeader}>
                                                F&B Sales
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Cinema Sales
                                            </th>
                                            <th style={styles.tableHeader}>
                                                DS (%)
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Achievement (%)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceData.map((item) => {
                                            const dsNum =
                                                parseFloat(
                                                    item.ds_percentage
                                                ) || 0;
                                            const achievementNum =
                                                parseFloat(
                                                    item.achievement_percentage
                                                ) || 0;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    style={styles.tableRow}
                                                >
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={
                                                                styles.outletCell
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faStore}
                                                                style={{
                                                                    marginRight:
                                                                        "8px",
                                                                    color: "#3b82f6",
                                                                }}
                                                            />
                                                            {item.outlet_name ||
                                                                "Unknown"}
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={
                                                                styles.lobBadge
                                                            }
                                                        >
                                                            {item.lob ||
                                                                "Unknown"}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={
                                                                styles.classBadge
                                                            }
                                                        >
                                                            {item.class || "-"}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        {item.date
                                                            ? new Date(
                                                                  item.date
                                                              ).toLocaleDateString(
                                                                  "id-ID",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric",
                                                                  }
                                                              )
                                                            : "-"}
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={
                                                                styles.percentageValue
                                                            }
                                                        >
                                                            {formatPercentage(
                                                                item.target_percentage
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={
                                                                styles.targetHeadValue
                                                            }
                                                        >
                                                            {safeFormatNumber(
                                                                item.target_head
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={
                                                                styles.visitorValue
                                                            }
                                                        >
                                                            {safeFormatNumber(
                                                                item.total_audience
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <strong
                                                            style={{
                                                                color: "#10b981",
                                                            }}
                                                        >
                                                            {safeFormatNumber(
                                                                item.omzet_fnb
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <strong
                                                            style={{
                                                                color: "#f59e0b",
                                                            }}
                                                        >
                                                            {safeFormatNumber(
                                                                item.omzet_cinema
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={
                                                                styles.dsIndicator
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    ...styles.dsBar,
                                                                    width: `${Math.min(
                                                                        100,
                                                                        dsNum
                                                                    )}%`,
                                                                    backgroundColor:
                                                                        getDSColor(
                                                                            dsNum
                                                                        ),
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    ...styles.dsValue,
                                                                    color: getDSColor(
                                                                        dsNum
                                                                    ),
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    item.ds_percentage
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <span
                                                            style={{
                                                                ...styles.achievementBadge,
                                                                backgroundColor:
                                                                    getAchievementColor(
                                                                        achievementNum
                                                                    ),
                                                            }}
                                                        >
                                                            {formatPercentage(
                                                                item.achievement_percentage
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <FontAwesomeIcon icon={faChartBar} size="2x" />
                            </div>
                            <p style={styles.emptyText}>
                                Tidak ada data performa yang ditemukan untuk{" "}
                                {userOutletName}
                            </p>
                            <p style={styles.emptySubtext}>
                                Coba gunakan filter yang berbeda atau periksa
                                data laporan Anda
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Styles tetap sama seperti sebelumnya
const styles = {
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "300px",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem",
    },
    pageContent: {
        width: "100%",
        padding: "0.5rem 1rem",
        margin: 0,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
    },
    contentWrapper: {
        width: "100%",
        maxWidth: "100%",
        paddingBottom: "2rem",
        margin: "0 auto",
    },
    section: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        marginBottom: "1.5rem",
        border: "1px solid #e2e8f0",
        width: "100%",
        boxSizing: "border-box",
    },
    sectionHeader: {
        marginBottom: "1.5rem",
        width: "100%",
    },
    sectionTitle: {
        fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
        fontWeight: "600",
        color: "#1e293b",
        margin: "0 0 0.5rem 0",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
    },
    sectionSubtitle: {
        fontSize: "0.95rem",
        color: "#64748b",
        margin: 0,
    },
    // User Info Banner
    userInfoBanner: {
        backgroundColor: "#3b82f6",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        color: "white",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    },
    userInfoContent: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    userInfoIcon: {
        fontSize: "2.5rem",
        color: "white",
    },
    userInfoTitle: {
        fontSize: "1.25rem",
        fontWeight: "600",
        margin: "0 0 0.5rem 0",
        color: "white",
    },
    userInfoSubtitle: {
        fontSize: "0.9rem",
        opacity: 0.9,
        margin: "0 0 0.25rem 0",
        color: "white",
    },
    // Filter Section
    filterGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem",
        alignItems: "end",
        width: "100%",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
    },
    filterLabel: {
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#4b5563",
        marginBottom: "0.5rem",
    },
    filterSelect: {
        width: "100%",
        padding: "0.625rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "white",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
    },
    dateContainer: {
        position: "relative",
    },
    dateIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#6b7280",
        fontSize: "0.9rem",
    },
    dateInput: {
        width: "100%",
        padding: "0.625rem 1rem 0.625rem 2.5rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.9rem",
        transition: "border-color 0.2s ease",
    },
    filterActions: {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
    },
    applyButton: {
        padding: "0.625rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease",
    },
    resetButton: {
        padding: "0.625rem 1.5rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease",
    },
    // Error
    errorContainer: {
        backgroundColor: "#fee2e2",
        borderLeft: "4px solid #ef4444",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
    },
    errorText: {
        color: "#dc2626",
        margin: 0,
        fontSize: "0.9rem",
    },
    // Summary Statistics
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
    },
    summaryCard: {
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        border: "1px solid #e2e8f0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    summaryIcon: {
        width: "50px",
        height: "50px",
        borderRadius: "10px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
    },
    summaryContent: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: "0.875rem",
        color: "#64748b",
        margin: "0 0 0.25rem 0",
    },
    summaryValue: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1e293b",
        margin: "0 0 0.25rem 0",
    },
    summarySubtitle: {
        fontSize: "0.75rem",
        color: "#94a3b8",
        margin: 0,
    },
    // Chart Section
    chartSectionHeader: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "1.5rem",
    },
    chartTitleSection: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    chartControlsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    chartTypeContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flex: 1,
    },
    controlLabel: {
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#4b5563",
        marginBottom: "0.25rem",
    },
    chartTypeButtons: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
    },
    chartTypeBtn: {
        padding: "0.5rem 1rem",
        backgroundColor: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#374151",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.2s ease",
    },
    activeChartTypeBtn: {
        backgroundColor: "#3b82f6",
        color: "white",
        borderColor: "#3b82f6",
    },
    chartTypeLabel: {
        fontSize: "0.85rem",
    },
    chartDataContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        minWidth: "150px",
    },
    chartDataSelect: {
        padding: "0.5rem",
        border: "2px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "white",
        cursor: "pointer",
        fontSize: "0.85rem",
        width: "100%",
        transition: "border-color 0.2s ease",
    },
    chartToggleContainer: {
        display: "flex",
        alignItems: "flex-end",
    },
    toggleChartBtn: {
        padding: "0.5rem 1rem",
        backgroundColor: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#374151",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.2s ease",
    },
    chartContainer: {
        width: "100%",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
        marginTop: "1rem",
        overflowX: "auto",
    },
    chartInfo: {
        display: "flex",
        gap: "2rem",
        marginBottom: "1.5rem",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        flexWrap: "wrap",
    },
    chartInfoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
    chartInfoLabel: {
        fontSize: "0.8rem",
        color: "#64748b",
    },
    chartInfoValue: {
        fontSize: "0.9rem",
        fontWeight: "500",
        color: "#1e293b",
    },
    // Per Head Chart
    perHeadChartContainer: {
        width: "100%",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
        overflowX: "auto",
    },
    perHeadChartHeader: {
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    perHeadTitle: {
        display: "flex",
        alignItems: "center",
    },
    perHeadChartTitle: {
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    perHeadSubtitle: {
        color: "#64748b",
        fontSize: "0.9rem",
    },
    // Chart Components
    customTooltip: {
        backgroundColor: "white",
        padding: "1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "300px",
    },
    tooltipLabel: {
        fontWeight: "bold",
        margin: "0 0 0.5rem 0",
        color: "#1e293b",
    },
    noDataChart: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "300px",
        color: "#9ca3af",
    },
    // Performance Table
    performanceContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    tableContainer: {
        width: "100%",
        overflowX: "auto",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    performanceTable: {
        width: "100%",
        minWidth: "1400px",
        borderCollapse: "collapse",
    },
    tableHeader: {
        padding: "1rem",
        textAlign: "left",
        backgroundColor: "#f8fafc",
        color: "#4b5563",
        fontWeight: "600",
        fontSize: "0.875rem",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
        position: "sticky",
        top: 0,
        zIndex: 10,
    },
    tableRow: {
        backgroundColor: "white",
        transition: "all 0.2s ease",
    },
    tableCell: {
        padding: "1rem",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "0.9rem",
    },
    outletCell: {
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
    },
    lobBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        backgroundColor: "#e0e7ff",
        color: "#3730a3",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "500",
        minWidth: "70px",
        textAlign: "center",
    },
    classBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        backgroundColor: "#dcfce7",
        color: "#166534",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "500",
        minWidth: "70px",
        textAlign: "center",
    },
    percentageValue: {
        fontWeight: "600",
        color: "#1e293b",
    },
    targetHeadValue: {
        fontWeight: "500",
        color: "#4b5563",
    },
    visitorValue: {
        fontWeight: "500",
        color: "#3b82f6",
    },
    dsIndicator: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    dsBar: {
        height: "8px",
        borderRadius: "4px",
        minWidth: "40px",
        transition: "width 0.3s ease",
    },
    dsValue: {
        fontSize: "0.875rem",
        fontWeight: "600",
        minWidth: "45px",
        textAlign: "right",
    },
    achievementBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        color: "white",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "600",
        minWidth: "60px",
        textAlign: "center",
    },
    // Empty State
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        textAlign: "center",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
    },
    emptyIcon: {
        fontSize: "3rem",
        color: "#d1d5db",
        marginBottom: "1rem",
    },
    emptyText: {
        fontSize: "1rem",
        fontWeight: "500",
        color: "#6b7280",
        marginBottom: "0.5rem",
    },
    emptySubtext: {
        fontSize: "0.875rem",
        color: "#9ca3af",
    },
};

// Add CSS animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .chart-controls-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .chart-controls-container {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  .chart-type-btn:hover {
    background-color: #e5e7eb;
  }

  .active-chart-type-btn {
    background-color: #3b82f6 !important;
    color: white !important;
    border-color: #3b82f6 !important;
  }
`;
document.head.appendChild(styleElement);

export default DashboardContentUser;

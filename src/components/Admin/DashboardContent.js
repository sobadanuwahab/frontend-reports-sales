import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TargetHeadVsPerHeadAnalysis from "./TargetHeadVsPerHeadAnalysis";
import {
    faFilter,
    faSearch,
    faChartLine,
    faChartBar,
    faStore,
    faCalendarAlt,
    faSync,
    faPercentage,
    faBullseye,
    faUsers,
    faFileAlt,
    faChartArea,
    faUserFriends,
    faUtensils,
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

const DashboardContent = () => {
    const [filter, setFilter] = useState({
        outlet: "all",
        startDate: "",
        endDate: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [outlets, setOutlets] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOutlets, setLoadingOutlets] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [summaryStats, setSummaryStats] = useState({
        totalOutlets: 0,
        totalFnb: 0,
        totalCinema: 0,
        avgDS: 0,
        avgAchievement: 0,
        totalAudience: 0,
        totalTargetHead: 0,
    });

    // State untuk chart
    const [chartType, setChartType] = useState("bar");
    const [selectedChartData, setSelectedChartData] = useState({
        type: "total_sales",
        metric: "Total Sales",
    });
    const [showChart, setShowChart] = useState(true);
    const [perHeadData, setPerHeadData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [availableLobs, setAvailableLobs] = useState([]);

    // Gunakan useMemo untuk menghitung dailyData
    const calculatedDailyData = useMemo(() => {
        if (!performanceData || performanceData.length === 0) {
            return [];
        }

        // Dapatkan jumlah hari dalam bulan yang dipilih
        const daysInMonth = new Date(filter.year, filter.month, 0).getDate();
        const dailyChartData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(filter.year, filter.month - 1, day);
            const dateStr = currentDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            });

            // Format tanggal untuk matching
            const formattedDate = `${filter.year}-${filter.month
                .toString()
                .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

            // Filter data untuk tanggal ini
            const dayData = performanceData.filter((item) => {
                if (!item.date) return false;

                // Coba beberapa format tanggal
                const itemDate = new Date(item.date);
                const itemDateStr = itemDate.toISOString().split("T")[0];
                const itemDay = itemDate.getDate();
                const itemMonth = itemDate.getMonth() + 1;
                const itemYear = itemDate.getFullYear();

                return (
                    itemDateStr === formattedDate ||
                    (itemDay === day &&
                        itemMonth === filter.month &&
                        itemYear === filter.year)
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
                const perHeadFnb =
                    totalAudience > 0
                        ? Math.round(totalFnb / totalAudience)
                        : 0;

                dailyChartData.push({
                    name: day.toString(),
                    date: dateStr,
                    fullDate: formattedDate,
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
                    has_data: true,
                });
            } else {
                // Jika tidak ada data untuk hari ini, tetap tampilkan dengan nilai 0
                dailyChartData.push({
                    name: day.toString(),
                    date: dateStr,
                    fullDate: formattedDate,
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
                    has_data: false,
                });
            }
        }

        console.log("📊 Calculated daily data:", dailyChartData);
        console.log("📊 First few items:", dailyChartData.slice(0, 5));

        return dailyChartData;
    }, [performanceData, filter.month, filter.year]);

    useEffect(() => {
        setDailyData(calculatedDailyData);
    }, [calculatedDailyData]);

    useEffect(() => {
        fetchOutlets();
        fetchPerformanceData();
    }, [filter.month, filter.year]);

    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    const fetchOutlets = async () => {
        try {
            setLoadingOutlets(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Token tidak ditemukan");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.get(`${API_BASE_URL}/outlets`, config);

            let outletsData = [];
            if (response.data.success && response.data.data) {
                outletsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                outletsData = response.data;
            }

            const allOutlets = outletsData.map((outlet) => ({
                id: outlet.id,
                nama_outlet: outlet.nama_outlet,
                lob: outlet.lob || "Cafe",
                alamat: outlet.alamat || "",
                kota: outlet.kota || "",
                telepon: outlet.telepon || "",
            }));

            allOutlets.sort((a, b) =>
                a.nama_outlet.localeCompare(b.nama_outlet)
            );

            setOutlets(allOutlets);
            const uniqueLobs = [
                ...new Set(allOutlets.map((o) => o.lob)),
            ].sort();
            setAvailableLobs(uniqueLobs);
        } catch (error) {
            console.error("Error fetching outlets:", error);
            setError("Gagal mengambil data outlet");
        } finally {
            setLoadingOutlets(false);
        }
    };

    const fetchPerformanceData = async () => {
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

            if (filter.outlet !== "all") {
                config.params.outlet_id = filter.outlet;
            }

            console.log("🔍 Fetching reports dengan params:", config.params);

            const response = await axios.get(`${API_BASE_URL}/reports`, config);

            console.log("📦 Response dari API:", response.data);

            let reportsData = [];

            if (response.data.success && response.data.data) {
                reportsData = response.data.data.map((report) => ({
                    ...report,
                    outlet_id: report.outlet_id,
                    outlet_name: report.outlet?.nama_outlet || "Unknown",
                    lob: report.lob || report.outlet?.lob || "Cafe",
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    date: report.report_date,
                    class: report.class || "Regular",
                }));
            } else if (Array.isArray(response.data)) {
                reportsData = response.data.map((report) => ({
                    ...report,
                    outlet_id: report.outlet_id,
                    outlet_name:
                        report.outlet?.nama_outlet ||
                        report.outlet_name ||
                        "Unknown",
                    lob: report.lob || report.outlet?.lob || "Cafe",
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    date: report.report_date || report.date,
                    class: report.class || "Regular",
                }));
            }

            // Filter berdasarkan tanggal jika ada
            if (filter.startDate && filter.endDate) {
                reportsData = reportsData.filter((report) => {
                    const reportDate = new Date(report.date);
                    const startDate = new Date(filter.startDate);
                    const endDate = new Date(filter.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    return reportDate >= startDate && reportDate <= endDate;
                });
            }

            // Transform data untuk dashboard
            const transformedData = reportsData.map((report) => {
                // Hitung per head actual untuk DS calculation
                const perHeadActual =
                    report.total_audience > 0
                        ? Math.round(
                              (report.omzet_fnb || 0) / report.total_audience
                          )
                        : 0;

                const ds = calculateDSFromDatabase({
                    ...report,
                    per_head_fnb: perHeadActual,
                });

                const achievement = calculateAchievementFromDatabase(report);
                const totalSales =
                    (report.omzet_fnb || 0) + (report.omzet_cinema || 0);

                return {
                    ...report,
                    id: report.id,
                    outlet_name: report.outlet_name,
                    lob: report.lob,
                    class: report.class,
                    date: report.date,
                    target_percentage: report.target_percentage,
                    target_head: report.target_head,
                    omzet_fnb: report.omzet_fnb || 0,
                    omzet_cinema: report.omzet_cinema || 0,
                    total_sales: totalSales,
                    total_audience: report.total_audience,
                    per_head_fnb: perHeadActual, // Simpan untuk DS calculation
                    ds_percentage: ds,
                    achievement_percentage: achievement,
                };
            });

            console.log("📊 Transformed data:", transformedData);
            setPerformanceData(transformedData);

            // Prepare per head data
            preparePerHeadData(transformedData);

            // Calculate summary statistics
            if (transformedData.length > 0) {
                const totalOutlets = [
                    ...new Set(transformedData.map((item) => item.outlet_name)),
                ].length;

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
                    totalOutlets,
                    totalFnb,
                    totalCinema,
                    avgDS,
                    avgAchievement,
                    totalAudience,
                    totalTargetHead,
                });
            } else {
                setSummaryStats({
                    totalOutlets: 0,
                    totalFnb: 0,
                    totalCinema: 0,
                    avgDS: 0,
                    avgAchievement: 0,
                    totalAudience: 0,
                    totalTargetHead: 0,
                });
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
            setError("Gagal mengambil data performa");
            setPerformanceData([]);
            setPerHeadData([]);
            setDailyData([]);
        } finally {
            setLoading(false);
        }
    };

    // Function untuk menyiapkan data Per Head
    const preparePerHeadData = (data) => {
        if (!data || data.length === 0) {
            setPerHeadData([]);
            return;
        }

        // Group by outlet
        const outletGroups = {};

        data.forEach((item) => {
            const outletName = item.outlet_name;
            if (!outletGroups[outletName]) {
                outletGroups[outletName] = {
                    outlet: outletName,
                    lob: item.lob,
                    total_fnb: 0,
                    total_audience: 0,
                    count: 0,
                };
            }

            outletGroups[outletName].total_fnb += item.omzet_fnb || 0;
            outletGroups[outletName].total_audience += item.total_audience || 0;
            outletGroups[outletName].count += 1;
        });

        // Calculate per head values
        const perHeadChartData = Object.values(outletGroups).map((group) => {
            const perHeadFnb =
                group.total_audience > 0
                    ? Math.round(group.total_fnb / group.total_audience)
                    : 0;

            const avgFnb = Math.round(group.total_fnb / group.count);
            const avgAudience = Math.round(group.total_audience / group.count);

            return {
                name:
                    group.outlet.length > 20
                        ? group.outlet.substring(0, 20) + "..."
                        : group.outlet,
                fullName: group.outlet,
                lob: group.lob,
                per_head_fnb: perHeadFnb,
                avg_fnb: avgFnb,
                avg_audience: avgAudience,
                fill: getLobColor(group.lob),
            };
        });

        // Sort by per head descending
        perHeadChartData.sort((a, b) => b.per_head_fnb - a.per_head_fnb);
        setPerHeadData(perHeadChartData);
    };

    // Perhitungan DS yang benar
    const calculateDSFromDatabase = (report) => {
        const targetHead = report.target_head || 0;
        const actualHead = report.total_audience || 0;
        const perHeadActual = report.per_head_fnb || 0; // Per Head F&B actual

        // Validasi input
        if (targetHead === 0 || actualHead === 0 || perHeadActual === 0) {
            return 0;
        }

        // Rumus DS = (Per Head Aktual / Target Head) × Faktor konversi × 100%
        // Faktor konversi biasanya 33% - 34% (kita gunakan 33.5% sebagai default)
        const CONVERSION_FACTOR = 0.335; // 33.5%

        // Hitung Per Head Aktual (sudah tersedia dari data)
        const actualPerHead = perHeadActual;

        // Hitung DS
        const ds = (actualPerHead / targetHead) * CONVERSION_FACTOR * 100;

        // Batasi nilai DS antara 0% - 200%
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilter = () => {
        fetchPerformanceData();
    };

    const handleResetFilter = () => {
        setFilter({
            outlet: "all",
            startDate: "",
            endDate: "",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        });
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);
    };

    const handleChartDataChange = (type, metric) => {
        setSelectedChartData({
            type: type,
            metric: metric,
        });
    };

    const handleOutletClick = (outletData) => {
        setSelectedOutlet(outletData);
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

    const renderTargetVsPerHeadChart = () => {
        return (
            <TargetHeadVsPerHeadAnalysis performanceData={performanceData} />
        );
    };

    // Render Daily Chart dengan perbaikan
    const renderDailyChart = () => {
        if (!dailyData || dailyData.length === 0) {
            return (
                <div style={styles.noDataChart}>
                    <FontAwesomeIcon icon={faCalendarAlt} size="3x" />
                    <p style={{ fontSize: "1rem", fontWeight: "500" }}>
                        Tidak ada data harian untuk ditampilkan
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Pilih periode atau filter yang berbeda
                    </p>
                </div>
            );
        }

        const dataKey = selectedChartData.type;
        const metricName = selectedChartData.metric;

        const chartOptions = {
            total_sales: { label: "Total Sales", color: "#3b82f6", unit: "" },
            fnb: { label: "F&B Sales", color: "#10b981", unit: "" },
            cinema: { label: "Cinema Sales", color: "#f59e0b", unit: "" },
            ds: { label: "DS Percentage", color: "#8b5cf6", unit: "%" },
            achievement: {
                label: "Achievement Percentage",
                color: "#ec4899",
                unit: "%",
            },
            audience: { label: "Audience", color: "#22c55e", unit: "" },
            target_head: { label: "Target Head", color: "#f97316", unit: "" },
            per_head_fnb: { label: "Per Head F&B", color: "#6366f1", unit: "" },
        };

        const selectedOption =
            chartOptions[dataKey] || chartOptions.total_sales;

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const data = dailyData.find((d) => d.name === label);
                if (!data) return null;

                return (
                    <div style={styles.customTooltip}>
                        <p style={styles.tooltipLabel}>
                            <strong>Tanggal: {data?.date}</strong>
                        </p>
                        <p
                            style={{
                                margin: "4px 0",
                                color: "#64748b",
                                fontSize: "0.8rem",
                            }}
                        >
                            Hari ke-{label}
                        </p>
                        {data?.outlet_count > 0 && (
                            <p
                                style={{
                                    margin: "4px 0",
                                    color: "#64748b",
                                    fontSize: "0.8rem",
                                }}
                            >
                                Outlet Aktif: {data?.outlet_count}
                            </p>
                        )}
                        {payload.map((entry, index) => {
                            let displayValue;
                            if (dataKey === "ds" || dataKey === "achievement") {
                                displayValue = formatPercentage(entry.value);
                            } else {
                                displayValue = `${formatNumber(entry.value)}${
                                    selectedOption.unit
                                        ? ` ${selectedOption.unit}`
                                        : ""
                                }`;
                            }

                            return (
                                <p
                                    key={index}
                                    style={{
                                        color:
                                            entry.color ||
                                            entry.stroke ||
                                            entry.fill,
                                        margin: "6px 0",
                                        fontWeight: "600",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {entry.name || metricName}: {displayValue}
                                </p>
                            );
                        })}
                    </div>
                );
            }
            return null;
        };

        // Filter out invalid data
        const validData = dailyData.filter(
            (item) => item !== null && item !== undefined
        );

        if (chartType === "bar") {
            return (
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight="400px"
                >
                    <BarChart
                        data={validData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            label={{
                                value: "Hari dalam Bulan",
                                position: "insideBottom",
                                offset: -50,
                                style: { fontSize: 12 },
                            }}
                            tick={{ fontSize: 11 }}
                            interval={Math.floor(validData.length / 15)} // Show every nth label
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
                            label={{
                                value:
                                    dataKey === "ds" ||
                                    dataKey === "achievement"
                                        ? "Persentase (%)"
                                        : "Nilai",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: { textAnchor: "middle", fontSize: 12 },
                            }}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar
                            dataKey={dataKey}
                            name={selectedOption.label}
                            fill={selectedOption.color}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                        />
                    </BarChart>
                </ResponsiveContainer>
            );
        } else if (chartType === "line") {
            return (
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight="400px"
                >
                    <LineChart
                        data={validData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            label={{
                                value: "Hari dalam Bulan",
                                position: "insideBottom",
                                offset: -50,
                                style: { fontSize: 12 },
                            }}
                            tick={{ fontSize: 11 }}
                            interval={Math.floor(validData.length / 15)}
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
                            label={{
                                value:
                                    dataKey === "ds" ||
                                    dataKey === "achievement"
                                        ? "Persentase (%)"
                                        : "Nilai",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: { textAnchor: "middle", fontSize: 12 },
                            }}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            name={selectedOption.label}
                            stroke={selectedOption.color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        return null;
    };

    // Render Per Head Chart dengan perbaikan
    const renderPerHeadChart = () => {
        if (!perHeadData || perHeadData.length === 0) {
            return (
                <div style={styles.noDataChart}>
                    <FontAwesomeIcon icon={faUserFriends} size="2x" />
                    <p>Tidak ada data Per Head untuk ditampilkan</p>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Data audience dan F&B sales diperlukan untuk perhitungan
                    </p>
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
            <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                <BarChart
                    data={perHeadData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                            offset: 10,
                            style: { textAnchor: "middle", fontSize: 12 },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                        dataKey="per_head_fnb"
                        name="Per Head F&B"
                        radius={[4, 4, 0, 0]}
                    >
                        {perHeadData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

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
                {/* Filter Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faFilter}
                                style={{ marginRight: "10px" }}
                            />
                            Filter Data Performa Outlet
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Filter berdasarkan outlet dan periode waktu
                        </p>
                    </div>

                    <div style={styles.filterGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Bulan</label>
                            <div style={styles.searchContainer}>
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    style={styles.searchIcon}
                                />
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
                            <label style={styles.filterLabel}>Outlet</label>
                            <div style={styles.searchContainer}>
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    style={styles.searchIcon}
                                />
                                <select
                                    name="outlet"
                                    value={filter.outlet}
                                    onChange={handleFilterChange}
                                    style={styles.filterSelect}
                                >
                                    <option value="all">Semua Outlet</option>
                                    {outlets.map((outlet) => (
                                        <option
                                            key={outlet.id}
                                            value={outlet.id}
                                        >
                                            {outlet.nama_outlet} - {outlet.lob}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                            Ringkasan Statistik
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Overview performa outlet dengan fokus pada Food &
                            Beverage
                        </p>
                    </div>

                    <div style={styles.summaryGrid}>
                        {/* <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#3b82f6",
                                }}
                            >
                                <FontAwesomeIcon icon={faStore} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Total Outlet
                                </h3>
                                <p style={styles.summaryValue}>
                                    {summaryStats.totalOutlets || 0}
                                </p>
                            </div>
                        </div> */}

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#10b981",
                                }}
                            >
                                <FontAwesomeIcon icon={faUtensils} />
                            </div>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>
                                    Total Omzet F&B
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(summaryStats.totalFnb || 0)}
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
                                    Total Omzet Cinema
                                </h3>
                                <p style={styles.summaryValue}>
                                    {formatNumber(
                                        summaryStats.totalCinema || 0
                                    )}
                                </p>
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    backgroundColor: "#8b5cf6",
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
                                Visualisasi Data Performa
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                Analisis visual data performa harian 1 bulan
                                penuh
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
                                            handleChartTypeChange(
                                                "targetVsPerHead"
                                            )
                                        }
                                        style={{
                                            ...styles.chartTypeBtn,
                                            ...(chartType ===
                                                "targetVsPerHead" &&
                                                styles.activeChartTypeBtn),
                                        }}
                                        title="Target vs Per Head Analysis"
                                    >
                                        <FontAwesomeIcon icon={faBullseye} />
                                        <span style={styles.chartTypeLabel}>
                                            Target vs PerHead
                                        </span>
                                    </button>
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
                                    {/* <button
                                        onClick={() =>
                                            handleChartTypeChange("perHead")
                                        }
                                        style={{
                                            ...styles.chartTypeBtn,
                                            ...(chartType === "perHead" &&
                                                styles.activeChartTypeBtn),
                                        }}
                                        title="Per Head Chart"
                                    >
                                        <FontAwesomeIcon icon={faUserFriends} />
                                        <span style={styles.chartTypeLabel}>
                                            Per Head
                                        </span>
                                    </button> */}
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

                            {/* <div style={styles.chartToggleContainer}>
                                <button
                                    onClick={() => setShowChart(!showChart)}
                                    style={styles.toggleChartBtn}
                                >
                                    {showChart ? (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faEyeSlash}
                                            />
                                            <span>Sembunyikan Chart</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>Tampilkan Chart</span>
                                        </>
                                    )}
                                </button>
                            </div> */}
                        </div>
                    </div>

                    {showChart && (
                        <div style={styles.chartContainer}>
                            <div style={styles.chartInfo}>
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
                                        Outlet:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {filter.outlet === "all"
                                            ? "Semua Outlet"
                                            : outlets.find(
                                                  (o) =>
                                                      o.id.toString() ===
                                                      filter.outlet
                                              )?.nama_outlet ||
                                              "Outlet Dipilih"}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Jumlah Data:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {chartType === "perHead"
                                            ? perHeadData.length
                                            : dailyData.length}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Tipe Chart:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {chartType === "perHead"
                                            ? "Per Head"
                                            : chartType === "bar"
                                            ? "Bar Chart"
                                            : "Line Chart"}
                                    </span>
                                </div>
                                <div style={styles.chartInfoItem}>
                                    <span style={styles.chartInfoLabel}>
                                        Data:
                                    </span>
                                    <span style={styles.chartInfoValue}>
                                        {selectedChartData.metric}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.chartWrapper}>
                                {chartType === "perHead" ? (
                                    renderPerHeadChart()
                                ) : chartType === "targetVsPerHead" ? (
                                    <TargetHeadVsPerHeadAnalysis
                                        performanceData={performanceData}
                                        filterOutlet={filter.outlet}
                                    />
                                ) : (
                                    renderDailyChart()
                                )}
                            </div>
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
                            Detail Performa Outlet
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Data lengkap performa outlet per laporan
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
                                                Target Head
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Per Head
                                            </th>
                                            <th style={styles.tableHeader}>
                                                F&B Sales
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Cinema Sales
                                            </th>
                                            <th style={styles.tableHeader}>
                                                Total Sales
                                            </th>
                                            <th style={styles.tableHeader}>
                                                DS (%)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceData.map((item) => {
                                            const dsNum =
                                                parseFloat(
                                                    item.ds_percentage
                                                ) || 0;
                                            const totalSales =
                                                (item.omzet_fnb || 0) +
                                                (item.omzet_cinema || 0);

                                            // Hitung per head actual
                                            const perHeadActual =
                                                item.total_audience > 0
                                                    ? Math.round(
                                                          item.omzet_fnb /
                                                              item.total_audience
                                                      )
                                                    : 0;

                                            // Target head dari data
                                            const targetHead =
                                                item.target_head || 0;

                                            // Tentukan warna berdasarkan perbandingan per head dengan target head
                                            const isPerHeadAboveTarget =
                                                targetHead > 0 &&
                                                perHeadActual >= targetHead;
                                            const perHeadColor =
                                                isPerHeadAboveTarget
                                                    ? "#10b981"
                                                    : "#ef4444";

                                            // Tentukan warna untuk DS berdasarkan threshold 33.5%
                                            const DS_THRESHOLD = 33.5; // Rata-rata dari 33-34%
                                            const isDSAboveThreshold =
                                                dsNum >= DS_THRESHOLD;
                                            const dsColor = isDSAboveThreshold
                                                ? "#10b981"
                                                : "#ef4444";

                                            return (
                                                <tr
                                                    key={item.id}
                                                    style={styles.tableRow}
                                                    onClick={() =>
                                                        handleOutletClick(item)
                                                    }
                                                    className="clickable-row"
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
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    {item.outlet_name ||
                                                                        "Unknown"}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        color: "#6b7280",
                                                                    }}
                                                                >
                                                                    LOB:{" "}
                                                                    {item.lob ||
                                                                        "Unknown"}
                                                                </div>
                                                            </div>
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
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "flex-start",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontWeight:
                                                                        "600",
                                                                    color: "#1e293b",
                                                                    fontSize:
                                                                        "0.95rem",
                                                                }}
                                                            >
                                                                {safeFormatNumber(
                                                                    targetHead
                                                                )}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#94a3b8",
                                                                    marginTop:
                                                                        "2px",
                                                                }}
                                                            >
                                                                Target
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "flex-end",
                                                            }}
                                                        >
                                                            <strong
                                                                style={{
                                                                    color: perHeadColor,
                                                                    fontSize:
                                                                        "1rem",
                                                                    fontWeight:
                                                                        "700",
                                                                }}
                                                            >
                                                                {" "}
                                                                {safeFormatNumber(
                                                                    perHeadActual
                                                                )}
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: perHeadColor,
                                                                    marginTop:
                                                                        "2px",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                {targetHead ===
                                                                0
                                                                    ? "No Target"
                                                                    : isPerHeadAboveTarget
                                                                    ? "✓ Above Target"
                                                                    : "✗ Below Target"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            <strong
                                                                style={{
                                                                    color: "#10b981",
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {" "}
                                                                {safeFormatNumber(
                                                                    item.omzet_fnb
                                                                )}
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#94a3b8",
                                                                    marginTop:
                                                                        "2px",
                                                                }}
                                                            >
                                                                F&B
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            <strong
                                                                style={{
                                                                    color: "#f59e0b",
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {" "}
                                                                {safeFormatNumber(
                                                                    item.omzet_cinema
                                                                )}
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#94a3b8",
                                                                    marginTop:
                                                                        "2px",
                                                                }}
                                                            >
                                                                Cinema
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={styles.tableCell}
                                                    >
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            <strong
                                                                style={{
                                                                    color: "#3b82f6",
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {" "}
                                                                {safeFormatNumber(
                                                                    totalSales
                                                                )}
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#94a3b8",
                                                                    marginTop:
                                                                        "2px",
                                                                }}
                                                            >
                                                                Total
                                                            </div>
                                                        </div>
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
                                                                        dsColor,
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    ...styles.dsValue,
                                                                    color: dsColor,
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    item.ds_percentage
                                                                )}
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: dsColor,
                                                                    marginTop:
                                                                        "2px",
                                                                    fontWeight:
                                                                        "500",
                                                                    textAlign:
                                                                        "right",
                                                                }}
                                                            >
                                                                {isDSAboveThreshold
                                                                    ? "✓ Good"
                                                                    : "✗ Low"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Legend untuk warna Per Head dan DS */}
                            <div style={styles.legendContainer}>
                                <div style={styles.legendTitle}>
                                    Keterangan Warna:
                                </div>
                                <div style={styles.legendGrid}>
                                    <div style={styles.legendSection}>
                                        <div style={styles.legendSubtitle}>
                                            Per Head:
                                        </div>
                                        <div style={styles.legendItems}>
                                            <div style={styles.legendItem}>
                                                <div
                                                    style={{
                                                        ...styles.legendColor,
                                                        backgroundColor:
                                                            "#10b981",
                                                    }}
                                                ></div>
                                                <span style={styles.legendText}>
                                                    Per Head ≥ Target Head
                                                    (Tercapai)
                                                </span>
                                            </div>
                                            <div style={styles.legendItem}>
                                                <div
                                                    style={{
                                                        ...styles.legendColor,
                                                        backgroundColor:
                                                            "#ef4444",
                                                    }}
                                                ></div>
                                                <span style={styles.legendText}>
                                                    Per Head &lt; Target Head
                                                    (Belum Tercapai)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.legendSection}>
                                        <div style={styles.legendSubtitle}>
                                            DS (Daily Sales):
                                        </div>
                                        <div style={styles.legendItems}>
                                            <div style={styles.legendItem}>
                                                <div
                                                    style={{
                                                        ...styles.legendColor,
                                                        backgroundColor:
                                                            "#10b981",
                                                    }}
                                                ></div>
                                                <span style={styles.legendText}>
                                                    DS ≥ 33.5% (Tercapai
                                                    Standar)
                                                </span>
                                            </div>
                                            <div style={styles.legendItem}>
                                                <div
                                                    style={{
                                                        ...styles.legendColor,
                                                        backgroundColor:
                                                            "#ef4444",
                                                    }}
                                                ></div>
                                                <span style={styles.legendText}>
                                                    DS &lt; 33.5% (Di Bawah
                                                    Standar)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <FontAwesomeIcon icon={faChartBar} size="2x" />
                            </div>
                            <p style={styles.emptyText}>
                                Tidak ada data performa yang ditemukan untuk
                                periode yang dipilih
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

// Styles
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
    searchContainer: {
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#6b7280",
        fontSize: "0.9rem",
    },
    filterSelect: {
        width: "100%",
        padding: "0.625rem 1rem 0.625rem 2.5rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "white",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
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
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
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
        "&:hover": {
            backgroundColor: "#2563eb",
        },
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
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
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
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
        },
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
        margin: 0,
    },
    // Chart Section
    chartSectionHeader: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "1.5rem",
        width: "100%",
    },
    chartTitleSection: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
    },
    chartControlsContainer: {
        display: "flex",
        flexDirection: "row",
        gap: "1.5rem",
        backgroundColor: "#f8fafc",
        padding: "1.2rem",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        marginBottom: "1rem",
        width: "100%",
        flexWrap: "wrap",
        alignItems: "center",
    },
    chartTypeContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flex: 1,
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
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    activeChartTypeBtn: {
        backgroundColor: "#3b82f6",
        color: "white",
        borderColor: "#3b82f6",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
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
    controlLabel: {
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#4b5563",
        marginBottom: "0.25rem",
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
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
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
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    chartContainer: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
        marginTop: "1rem",
        overflow: "hidden",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
    },
    chartWrapper: {
        flex: 1,
        width: "100%",
        minHeight: "500px",
        position: "relative",
    },
    chartInfo: {
        display: "flex",
        gap: "2rem",
        marginBottom: "1.5rem",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        flexWrap: "wrap",
        fontSize: "0.9rem",
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
    // Chart Components
    customTooltip: {
        backgroundColor: "white",
        padding: "0.75rem 1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        maxWidth: "280px",
        fontSize: "0.85rem",
    },
    tooltipLabel: {
        fontWeight: "600",
        margin: "0 0 0.5rem 0",
        color: "#1e293b",
        fontSize: "0.9rem",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "0.25rem",
    },
    noDataChart: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "400px",
        color: "#94a3b8",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem",
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
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#f8fafc",
        },
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
    // Detail Section (dihapus untuk singkatnya)
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

    legendContainer: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1rem",
        marginTop: "1rem",
        fontSize: "0.85rem",
    },
    legendTitle: {
        fontWeight: "600",
        color: "#4b5563",
        marginBottom: "0.5rem",
        fontSize: "0.9rem",
    },
    legendItems: {
        display: "flex",
        gap: "1.5rem",
        flexWrap: "wrap",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    legendColor: {
        width: "12px",
        height: "12px",
        borderRadius: "3px",
    },
    legendText: {
        fontSize: "0.8rem",
        color: "#6b7280",
    },
};

export default DashboardContent;

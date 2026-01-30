import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faSearch,
    faSync,
    faCalendarAlt,
    faEye,
    faMoneyBillWave,
    faUsers,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const ReportsView = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchReports();
    }, [filterMonth, filterYear]);

    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    const fetchReports = async () => {
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
                    month: filterMonth,
                    year: filterYear,
                },
            };

            const response = await axios.get(`${API_BASE_URL}/reports`, config);

            let reportsData = [];

            if (response.data.success && response.data.data) {
                reportsData = response.data.data.map((report) => ({
                    ...report,
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    lob: report.lob || report.outlet?.lob || "Cafe",
                    outlet_name: report.outlet?.nama_outlet || "Unknown",
                    date: report.report_date,
                    actual_sales:
                        (parseFloat(report.omzet_fnb) || 0) +
                        (parseFloat(report.omzet_cinema) || 0),
                }));
            } else if (Array.isArray(response.data)) {
                reportsData = response.data.map((report) => ({
                    ...report,
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    lob: report.lob || report.outlet?.lob || "Cafe",
                    outlet_name:
                        report.outlet?.nama_outlet ||
                        report.outlet_name ||
                        "Unknown",
                    date: report.report_date || report.date,
                    actual_sales:
                        (parseFloat(report.omzet_fnb) || 0) +
                        (parseFloat(report.omzet_cinema) || 0),
                }));
            }

            setReports(reportsData);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("Gagal mengambil data laporan");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter reports berdasarkan search
    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            searchTerm === "" ||
            report.outlet_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            report.lob?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = filteredReports.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format number
    const formatNumber = (number) => {
        return new Intl.NumberFormat("id-ID").format(number);
    };

    // Format percentage
    const formatPercentage = (value) => {
        if (!value && value !== 0) return "0%";
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return "0%";
        return `${numValue.toFixed(1)}%`;
    };

    // Get achievement color
    const getAchievementColor = (percentage) => {
        const num = parseFloat(percentage);
        if (num >= 100) return "#10b981";
        if (num >= 80) return "#f59e0b";
        return "#ef4444";
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
                <p>Memuat data laporan...</p>
            </div>
        );
    }

    return (
        <div style={styles.pageContent}>
            <div style={styles.contentWrapper}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div style={styles.headerContent}>
                            <h1 style={styles.title}>Data Laporan</h1>
                            <p style={styles.subtitle}>
                                Lihat dan analisis data laporan outlet
                            </p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button
                            onClick={fetchReports}
                            style={styles.refreshButton}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faSync} spin={loading} />
                            {loading ? " Memuat..." : " Refresh"}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorAlert}>
                        <FontAwesomeIcon icon={faFileAlt} />
                        <span style={{ marginLeft: "0.5rem" }}>{error}</span>
                    </div>
                )}

                {/* Search dan Filter */}
                <div style={styles.toolbar}>
                    <div style={styles.searchContainer}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            style={styles.searchIcon}
                        />
                        <input
                            type="text"
                            placeholder="Cari laporan (outlet, LOB, catatan)..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.filterContainer}>
                        <div style={styles.filterGroup}>
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                style={styles.filterIcon}
                            />
                            <select
                                value={filterMonth}
                                onChange={(e) =>
                                    setFilterMonth(parseInt(e.target.value))
                                }
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
                            <select
                                value={filterYear}
                                onChange={(e) =>
                                    setFilterYear(parseInt(e.target.value))
                                }
                                style={styles.filterSelect}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Statistics */}
                <div style={styles.statsContainer}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>{reports.length}</div>
                            <div style={styles.statLabel}>Total Laporan</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatCurrency(
                                    reports.reduce(
                                        (sum, report) =>
                                            sum + (report.actual_sales || 0),
                                        0
                                    )
                                )}
                            </div>
                            <div style={styles.statLabel}>Total Omzet</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatNumber(
                                    reports.reduce(
                                        (sum, report) =>
                                            sum + (report.total_audience || 0),
                                        0
                                    )
                                )}
                            </div>
                            <div style={styles.statLabel}>Total Penonton</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {reports.length > 0
                                    ? formatPercentage(
                                          reports.reduce(
                                              (sum, report) =>
                                                  sum +
                                                  (report.target_percentage ||
                                                      0),
                                              0
                                          ) / reports.length
                                      )
                                    : "0%"}
                            </div>
                            <div style={styles.statLabel}>Rata-rata Target</div>
                        </div>
                    </div>
                </div>

                {/* Tabel Data */}
                <div style={styles.tableContainer}>
                    {filteredReports.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                style={styles.emptyIcon}
                            />
                            <h3 style={styles.emptyTitle}>
                                {searchTerm
                                    ? "Tidak ada laporan ditemukan"
                                    : "Belum ada laporan"}
                            </h3>
                            <p style={styles.emptyText}>
                                {searchTerm
                                    ? "Tidak ada laporan yang sesuai dengan pencarian."
                                    : "Tidak ada data laporan untuk periode yang dipilih."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.tableInfo}>
                                <span>
                                    Menampilkan{" "}
                                    <strong>{currentReports.length}</strong>{" "}
                                    dari{" "}
                                    <strong>{filteredReports.length}</strong>{" "}
                                    laporan
                                </span>
                                <span>
                                    Halaman <strong>{currentPage}</strong> dari{" "}
                                    <strong>{totalPages}</strong>
                                </span>
                            </div>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>
                                            Tanggal
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Outlet
                                        </th>
                                        <th style={styles.tableHeader}>LOB</th>
                                        <th style={styles.tableHeader}>
                                            Omzet F&B
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Omzet Cinema
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Total Bills
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Penonton
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Target %
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Target Head
                                        </th>
                                        <th style={styles.tableHeader}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            style={styles.tableRow}
                                        >
                                            <td style={styles.tableCell}>
                                                <div style={styles.dateCell}>
                                                    <div
                                                        style={styles.dateBadge}
                                                    >
                                                        {formatDate(
                                                            report.date
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.outletCell}>
                                                    <div
                                                        style={
                                                            styles.outletText
                                                        }
                                                    >
                                                        {report.outlet_name ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.lobCell}>
                                                    <span
                                                        style={styles.lobBadge}
                                                    >
                                                        {report.lob ||
                                                            "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div
                                                    style={styles.currencyCell}
                                                >
                                                    <div
                                                        style={
                                                            styles.currencyValue
                                                        }
                                                    >
                                                        {formatCurrency(
                                                            report.omzet_fnb ||
                                                                0
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div
                                                    style={styles.currencyCell}
                                                >
                                                    <div
                                                        style={
                                                            styles.currencyValue
                                                        }
                                                    >
                                                        {formatCurrency(
                                                            report.omzet_cinema ||
                                                                0
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.numberCell}>
                                                    {formatNumber(
                                                        report.total_bills || 0
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.numberCell}>
                                                    {formatNumber(
                                                        report.total_audience ||
                                                            0
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span
                                                    style={{
                                                        ...styles.targetBadge,
                                                        backgroundColor:
                                                            getAchievementColor(
                                                                report.target_percentage ||
                                                                    0
                                                            ),
                                                    }}
                                                >
                                                    {formatPercentage(
                                                        report.target_percentage ||
                                                            0
                                                    )}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.numberCell}>
                                                    {formatNumber(
                                                        report.target_head || 0
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div
                                                    style={styles.actionButtons}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/user/reports/${report.id}`
                                                            )
                                                        }
                                                        style={
                                                            styles.viewButton
                                                        }
                                                        title="Lihat Detail"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        style={styles.paginationButton}
                                    >
                                        Sebelumnya
                                    </button>

                                    <div style={styles.pageNumbers}>
                                        {Array.from(
                                            { length: Math.min(5, totalPages) },
                                            (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    currentPage >=
                                                    totalPages - 2
                                                ) {
                                                    pageNum =
                                                        totalPages - 4 + i;
                                                } else {
                                                    pageNum =
                                                        currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                pageNum
                                                            )
                                                        }
                                                        style={{
                                                            ...styles.pageButton,
                                                            ...(currentPage ===
                                                                pageNum &&
                                                                styles.activePageButton),
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        style={styles.paginationButton}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
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
        padding: "20px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
    },
    contentWrapper: {
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
    },
    header: {
        padding: "1.5rem 2rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    headerIcon: {
        width: "50px",
        height: "50px",
        borderRadius: "10px",
        backgroundColor: "#10b981",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        margin: "0 0 0.25rem 0",
        color: "#1e293b",
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: 0,
        color: "#64748b",
        fontSize: "0.9rem",
    },
    headerRight: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
    },
    refreshButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.875rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed",
        },
    },
    errorAlert: {
        margin: "0 2rem 1rem 2rem",
        padding: "1rem",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        borderRadius: "8px",
        borderLeft: "4px solid #dc2626",
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
        fontSize: "0.9rem",
    },
    toolbar: {
        padding: "1.25rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        borderBottom: "1px solid #e2e8f0",
    },
    searchContainer: {
        flex: 1,
        maxWidth: "400px",
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#6b7280",
        fontSize: "0.9rem",
    },
    searchInput: {
        width: "100%",
        padding: "0.625rem 1rem 0.625rem 2.5rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.9rem",
        transition: "all 0.2s",
        "&:focus": {
            outline: "none",
            borderColor: "#10b981",
            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        },
    },
    filterContainer: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        flexWrap: "wrap",
    },
    filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    filterIcon: {
        color: "#6b7280",
        fontSize: "0.9rem",
    },
    filterSelect: {
        padding: "0.625rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.875rem",
        backgroundColor: "white",
        cursor: "pointer",
        minWidth: "150px",
        "&:focus": {
            outline: "none",
            borderColor: "#10b981",
        },
    },
    statsContainer: {
        padding: "1.25rem 2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
    },
    statCard: {
        backgroundColor: "white",
        padding: "1.25rem",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
    },
    statIcon: {
        width: "50px",
        height: "50px",
        borderRadius: "10px",
        backgroundColor: "#f0f9ff",
        color: "#0ea5e9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: "0.25rem",
    },
    statLabel: {
        fontSize: "0.85rem",
        color: "#64748b",
        fontWeight: "500",
    },
    tableContainer: {
        padding: "1.5rem 2rem",
    },
    tableInfo: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        color: "#64748b",
        fontSize: "0.9rem",
    },
    table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 0.5rem",
    },
    tableHeader: {
        padding: "0.875rem 1rem",
        textAlign: "left",
        color: "#64748b",
        fontWeight: "600",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        backgroundColor: "transparent",
        borderBottom: "2px solid #e2e8f0",
    },
    tableRow: {
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        "&:hover": {
            backgroundColor: "#f8fafc",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
    },
    tableCell: {
        padding: "1rem",
        verticalAlign: "middle",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
    },
    dateCell: {
        display: "flex",
        alignItems: "center",
    },
    dateBadge: {
        backgroundColor: "#f0f9ff",
        color: "#0c4a6e",
        padding: "0.375rem 0.75rem",
        borderRadius: "6px",
        fontWeight: "600",
        fontSize: "0.8rem",
    },
    outletCell: {
        display: "flex",
        flexDirection: "column",
    },
    outletText: {
        fontWeight: "500",
        color: "#1e293b",
        fontSize: "0.9rem",
    },
    lobCell: {
        display: "flex",
        alignItems: "center",
    },
    lobBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        color: "white",
        fontWeight: "600",
        fontSize: "0.75rem",
        backgroundColor: "#3b82f6",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
    },
    currencyCell: {
        display: "flex",
        alignItems: "center",
    },
    currencyValue: {
        fontWeight: "600",
        color: "#1e293b",
        fontSize: "0.9rem",
    },
    numberCell: {
        fontWeight: "500",
        color: "#374151",
        fontSize: "0.9rem",
        textAlign: "right",
    },
    targetBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        color: "white",
        fontWeight: "600",
        fontSize: "0.75rem",
        textAlign: "center",
        minWidth: "60px",
    },
    actionButtons: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        justifyContent: "center",
    },
    viewButton: {
        padding: "0.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        fontSize: "0.75rem",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        textAlign: "center",
    },
    emptyIcon: {
        fontSize: "3rem",
        color: "#d1d5db",
        marginBottom: "1rem",
    },
    emptyTitle: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: "0.5rem",
    },
    emptyText: {
        fontSize: "0.9rem",
        color: "#64748b",
        marginBottom: "1.5rem",
        maxWidth: "400px",
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "1.5rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid #e2e8f0",
    },
    paginationButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: "500",
        transition: "all 0.3s ease",
        "&:hover:not(:disabled)": {
            backgroundColor: "#e5e7eb",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    pageNumbers: {
        display: "flex",
        gap: "0.5rem",
    },
    pageButton: {
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#f3f4f6",
        },
    },
    activePageButton: {
        backgroundColor: "#10b981",
        color: "white",
        borderColor: "#10b981",
    },
};

// Add CSS animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleElement);

export default ReportsView;

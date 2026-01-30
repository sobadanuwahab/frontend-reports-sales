import React, { useState, useEffect } from "react";
import {
    FiCalendar,
    FiFilter,
    FiSearch,
    FiDownload,
    FiEye,
    FiEdit,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import {
    MdOutlineStore,
    MdAttachMoney,
    MdTrendingUp,
    MdTrendingDown,
} from "react-icons/md";

const DailyReport = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        outlet: "",
        lob: "",
        startDate: "",
        endDate: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dummy data untuk contoh
    useEffect(() => {
        const dummyReports = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            reportDate: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
            outlet: `OUT00${(i % 5) + 1}`,
            outletName: [
                "Plaza Indonesia",
                "Grand Indonesia",
                "Pacific Place",
                "Central Park",
                "Pondok Indah Mall",
            ][i % 5],
            lob: i % 2 === 0 ? "Cinema" : "FnB",
            totalVisitors: Math.floor(Math.random() * 1000) + 500,
            totalBills: Math.floor(Math.random() * 500) + 200,
            totalOmzet: Math.floor(Math.random() * 50000000) + 10000000,
            averageBill: Math.floor(Math.random() * 50000) + 25000,
            status: ["Pending", "Approved", "Rejected"][i % 3],
            submittedBy: "Admin Sales",
            submittedAt: `2024-01-${String((i % 28) + 1).padStart(
                2,
                "0"
            )} 08:${String(i % 60).padStart(2, "0")}:00`,
        }));

        setReports(dummyReports);
        setFilteredReports(dummyReports);
        setLoading(false);
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...reports];

        if (filters.outlet) {
            filtered = filtered.filter(
                (report) => report.outlet === filters.outlet
            );
        }

        if (filters.lob) {
            filtered = filtered.filter((report) => report.lob === filters.lob);
        }

        if (filters.startDate) {
            filtered = filtered.filter(
                (report) => report.reportDate >= filters.startDate
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(
                (report) => report.reportDate <= filters.endDate
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (report) =>
                    report.outletName.toLowerCase().includes(term) ||
                    report.outlet.toLowerCase().includes(term) ||
                    report.status.toLowerCase().includes(term)
            );
        }

        setFilteredReports(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters, searchTerm, reports]);

    // Pagination
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReports = filteredReports.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewReport = (reportId) => {
        alert(`View report ${reportId}`);
    };

    const handleEditReport = (reportId) => {
        alert(`Edit report ${reportId}`);
    };

    const handleDeleteReport = (reportId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
            setReports(reports.filter((report) => report.id !== reportId));
            alert(`Report ${reportId} deleted`);
        }
    };

    const handleExportData = () => {
        alert("Exporting data...");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "#10b981";
            case "Pending":
                return "#f59e0b";
            case "Rejected":
                return "#ef4444";
            default:
                return "#64748b";
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case "Approved":
                return "rgba(16, 185, 129, 0.1)";
            case "Pending":
                return "rgba(245, 158, 11, 0.1)";
            case "Rejected":
                return "rgba(239, 68, 68, 0.1)";
            default:
                return "rgba(100, 116, 139, 0.1)";
        }
    };

    // Calculate summary statistics
    const calculateSummary = () => {
        if (filteredReports.length === 0) return {};

        const totalOmzet = filteredReports.reduce(
            (sum, report) => sum + report.totalOmzet,
            0
        );
        const totalVisitors = filteredReports.reduce(
            (sum, report) => sum + report.totalVisitors,
            0
        );
        const totalBills = filteredReports.reduce(
            (sum, report) => sum + report.totalBills,
            0
        );
        const avgBill = totalBills > 0 ? totalOmzet / totalBills : 0;

        return {
            totalReports: filteredReports.length,
            totalOmzet,
            totalVisitors,
            totalBills,
            avgBill,
            avgVisitorsPerDay: totalVisitors / filteredReports.length,
        };
    };

    const summary = calculateSummary();

    // Styles
    const styles = {
        container: {
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem",
        },
        header: {
            marginBottom: "2rem",
        },
        title: {
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
        },
        subtitle: {
            color: "#64748b",
            fontSize: "1rem",
        },
        filterSection: {
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
        },
        filterGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
        },
        filterGroup: {
            display: "flex",
            flexDirection: "column",
        },
        filterLabel: {
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
            color: "#475569",
        },
        filterInput: {
            padding: "0.5rem 0.75rem",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "0.9rem",
        },
        searchContainer: {
            display: "flex",
            gap: "1rem",
            alignItems: "center",
        },
        searchInput: {
            flex: 1,
            padding: "0.75rem 1rem",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
        },
        searchButton: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        summarySection: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
        },
        summaryCard: {
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
        },
        summaryTitle: {
            fontSize: "0.9rem",
            color: "#64748b",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        summaryValue: {
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#1e293b",
        },
        summaryTrend: {
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginTop: "0.5rem",
        },
        trendUp: {
            color: "#10b981",
        },
        trendDown: {
            color: "#ef4444",
        },
        tableContainer: {
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        tableHeader: {
            background: "#f8fafc",
            borderBottom: "2px solid #e2e8f0",
        },
        tableHeaderCell: {
            padding: "1rem",
            textAlign: "left",
            fontWeight: "600",
            color: "#475569",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        tableCell: {
            padding: "1rem",
            borderBottom: "1px solid #f1f5f9",
            color: "#334155",
            fontSize: "0.9rem",
        },
        statusBadge: {
            padding: "0.25rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "600",
            display: "inline-block",
        },
        actionButtons: {
            display: "flex",
            gap: "0.5rem",
        },
        actionButton: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        viewButton: {
            color: "#3b82f6",
            background: "rgba(59, 130, 246, 0.1)",
        },
        editButton: {
            color: "#10b981",
            background: "rgba(16, 185, 129, 0.1)",
        },
        deleteButton: {
            color: "#ef4444",
            background: "rgba(239, 68, 68, 0.1)",
        },
        pagination: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            borderTop: "1px solid #e2e8f0",
        },
        pageInfo: {
            color: "#64748b",
            fontSize: "0.9rem",
        },
        pageButtons: {
            display: "flex",
            gap: "0.5rem",
        },
        pageButton: {
            padding: "0.5rem 1rem",
            border: "1px solid #e2e8f0",
            background: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            color: "#334155",
        },
        activePageButton: {
            background: "#667eea",
            color: "white",
            borderColor: "#667eea",
        },
        loading: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            color: "#64748b",
        },
        noData: {
            textAlign: "center",
            padding: "3rem",
            color: "#64748b",
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Memuat data laporan...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FiCalendar /> Laporan Harian
                </h1>
                <p style={styles.subtitle}>
                    Kelola dan monitor laporan penjualan harian dari semua
                    outlet
                </p>
            </div>

            {/* Filter Section */}
            <div style={styles.filterSection}>
                <div style={styles.filterGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Outlet</label>
                        <select
                            value={filters.outlet}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    outlet: e.target.value,
                                })
                            }
                            style={styles.filterInput}
                        >
                            <option value="">Semua Outlet</option>
                            {Array.from(
                                new Set(reports.map((r) => r.outlet))
                            ).map((outlet) => (
                                <option key={outlet} value={outlet}>
                                    {outlet}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>LOB</label>
                        <select
                            value={filters.lob}
                            onChange={(e) =>
                                setFilters({ ...filters, lob: e.target.value })
                            }
                            style={styles.filterInput}
                        >
                            <option value="">Semua LOB</option>
                            <option value="Cinema">Cinema</option>
                            <option value="FnB">FnB</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Dari Tanggal</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    startDate: e.target.value,
                                })
                            }
                            style={styles.filterInput}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Sampai Tanggal</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    endDate: e.target.value,
                                })
                            }
                            style={styles.filterInput}
                        />
                    </div>
                </div>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama outlet atau kode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <button style={styles.searchButton} onClick={() => {}}>
                        <FiSearch /> Cari
                    </button>
                    <button
                        style={{
                            ...styles.searchButton,
                            background: "#f1f5f9",
                            color: "#334155",
                        }}
                        onClick={handleExportData}
                    >
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* Summary Section */}
            <div style={styles.summarySection}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryTitle}>
                        <MdOutlineStore /> Total Laporan
                    </div>
                    <div style={styles.summaryValue}>
                        {summary.totalReports || 0}
                    </div>
                    <div style={{ ...styles.summaryTrend, ...styles.trendUp }}>
                        <MdTrendingUp /> +12.5% dari bulan lalu
                    </div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryTitle}>
                        <MdAttachMoney /> Total Omzet
                    </div>
                    <div style={styles.summaryValue}>
                        Rp{" "}
                        {summary.totalOmzet
                            ? summary.totalOmzet.toLocaleString()
                            : "0"}
                    </div>
                    <div style={{ ...styles.summaryTrend, ...styles.trendUp }}>
                        <MdTrendingUp /> +8.3% dari bulan lalu
                    </div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryTitle}>Total Pengunjung</div>
                    <div style={styles.summaryValue}>
                        {summary.totalVisitors || 0}
                    </div>
                    <div style={{ ...styles.summaryTrend, ...styles.trendUp }}>
                        <MdTrendingUp /> +5.2% dari bulan lalu
                    </div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryTitle}>Average Bill</div>
                    <div style={styles.summaryValue}>
                        Rp{" "}
                        {summary.avgBill
                            ? summary.avgBill.toLocaleString()
                            : "0"}
                    </div>
                    <div
                        style={{ ...styles.summaryTrend, ...styles.trendDown }}
                    >
                        <MdTrendingDown /> -2.1% dari bulan lalu
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div style={styles.tableContainer}>
                {filteredReports.length === 0 ? (
                    <div style={styles.noData}>
                        Tidak ada data laporan yang ditemukan
                    </div>
                ) : (
                    <>
                        <table style={styles.table}>
                            <thead style={styles.tableHeader}>
                                <tr>
                                    <th style={styles.tableHeaderCell}>
                                        Tanggal
                                    </th>
                                    <th style={styles.tableHeaderCell}>
                                        Outlet
                                    </th>
                                    <th style={styles.tableHeaderCell}>LOB</th>
                                    <th style={styles.tableHeaderCell}>
                                        Pengunjung
                                    </th>
                                    <th style={styles.tableHeaderCell}>Bill</th>
                                    <th style={styles.tableHeaderCell}>
                                        Total Omzet
                                    </th>
                                    <th style={styles.tableHeaderCell}>
                                        Status
                                    </th>
                                    <th style={styles.tableHeaderCell}>
                                        Dibuat Oleh
                                    </th>
                                    <th style={styles.tableHeaderCell}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReports.map((report) => (
                                    <tr key={report.id}>
                                        <td style={styles.tableCell}>
                                            {new Date(
                                                report.reportDate
                                            ).toLocaleDateString("id-ID")}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={{ fontWeight: "600" }}>
                                                {report.outlet}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "#64748b",
                                                }}
                                            >
                                                {report.outletName}
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            {report.lob}
                                        </td>
                                        <td style={styles.tableCell}>
                                            {report.totalVisitors.toLocaleString()}
                                        </td>
                                        <td style={styles.tableCell}>
                                            {report.totalBills.toLocaleString()}
                                        </td>
                                        <td style={styles.tableCell}>
                                            Rp{" "}
                                            {report.totalOmzet.toLocaleString()}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    color: getStatusColor(
                                                        report.status
                                                    ),
                                                    background:
                                                        getStatusBgColor(
                                                            report.status
                                                        ),
                                                }}
                                            >
                                                {report.status}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div>{report.submittedBy}</div>
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "#64748b",
                                                }}
                                            >
                                                {
                                                    report.submittedAt.split(
                                                        " "
                                                    )[1]
                                                }
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.actionButtons}>
                                                <button
                                                    onClick={() =>
                                                        handleViewReport(
                                                            report.id
                                                        )
                                                    }
                                                    style={{
                                                        ...styles.actionButton,
                                                        ...styles.viewButton,
                                                    }}
                                                    title="Lihat Detail"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditReport(
                                                            report.id
                                                        )
                                                    }
                                                    style={{
                                                        ...styles.actionButton,
                                                        ...styles.editButton,
                                                    }}
                                                    title="Edit"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteReport(
                                                            report.id
                                                        )
                                                    }
                                                    style={{
                                                        ...styles.actionButton,
                                                        ...styles.deleteButton,
                                                    }}
                                                    title="Hapus"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div style={styles.pagination}>
                            <div style={styles.pageInfo}>
                                Menampilkan {startIndex + 1} -{" "}
                                {Math.min(endIndex, filteredReports.length)}{" "}
                                dari {filteredReports.length} laporan
                            </div>
                            <div style={styles.pageButtons}>
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    style={styles.pageButton}
                                >
                                    <FiChevronLeft />
                                </button>

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
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
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

                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    style={styles.pageButton}
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyReport;

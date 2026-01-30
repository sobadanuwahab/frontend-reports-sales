import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faPlus,
    faEdit,
    faTrash,
    faEye,
    faSearch,
    faSync,
    faChartLine,
    faUsers,
    faMoneyBill,
    faExclamationCircle,
    faChevronLeft,
    faChevronRight,
    faSpinner,
    faCalendarAlt,
    faStore,
    faTags,
} from "@fortawesome/free-solid-svg-icons";

const ReportsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State untuk data dan UI
    const [reports, setReports] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOutlets, setLoadingOutlets] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOutlet, setFilterOutlet] = useState("all");
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterLob, setFilterLob] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        id: null,
        outletName: "",
        date: "",
    });

    // API base URL
    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

    // Cek jika user bukan admin
    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/unauthorized");
        }
    }, [user, navigate]);

    // Gunakan useCallback untuk membuat fungsi yang stabil
    const fetchOutlets = useCallback(async () => {
        try {
            setLoadingOutlets(true);
            const token = localStorage.getItem("token") || user?.token;

            if (!token) {
                setError("Token tidak ditemukan. Silakan login kembali.");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.get(`${API_BASE_URL}/outlets`, config);
            const outletsData = response.data?.data || response.data || [];

            // Ambil unique outlets berdasarkan nama
            const uniqueOutlets = [];
            const seenNames = new Set();

            outletsData.forEach((outlet) => {
                if (outlet.nama_outlet && !seenNames.has(outlet.nama_outlet)) {
                    seenNames.add(outlet.nama_outlet);
                    uniqueOutlets.push({
                        id: outlet.id,
                        nama_outlet: outlet.nama_outlet,
                        lob: outlet.lob || "Cafe",
                    });
                }
            });

            setOutlets(uniqueOutlets);
        } catch (error) {
            console.error("Error fetching outlets:", error);
        } finally {
            setLoadingOutlets(false);
        }
    }, [API_BASE_URL, user?.token]); // Tambahkan dependencies

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token") || user?.token;
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
            };

            // Tambahkan filter bulan dan tahun
            const params = {
                month: filterMonth,
                year: filterYear,
            };

            if (filterOutlet !== "all") {
                params.outlet_id = filterOutlet;
            }

            const response = await axios.get(`${API_BASE_URL}/reports`, {
                ...config,
                params,
            });

            if (response.data.success && response.data.data) {
                const reportsData = response.data.data.map((report) => ({
                    ...report,
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    lob: report.lob || report.outlet?.lob || "Cafe",
                }));
                setReports(reportsData);
            } else if (Array.isArray(response.data)) {
                const reportsData = response.data.map((report) => ({
                    ...report,
                    omzet_fnb: parseFloat(report.omzet_fnb) || 0,
                    omzet_cinema: parseFloat(report.omzet_cinema) || 0,
                    total_bills: parseInt(report.total_bills) || 0,
                    total_audience: parseInt(report.total_audience) || 0,
                    target_percentage:
                        parseFloat(report.target_percentage) || 0,
                    target_head: parseInt(report.target_head) || 0,
                    lob: report.lob || report.outlet?.lob || "Cafe",
                }));
                setReports(reportsData);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("Gagal mengambil data laporan. Silakan refresh halaman.");
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, filterMonth, filterYear, filterOutlet, user?.token]); // Tambahkan semua dependencies

    // Fetch data saat komponen mount dan ketika filter berubah
    useEffect(() => {
        if (user && user.role === "admin") {
            fetchOutlets();
            fetchReports();
        }
    }, [fetchOutlets, fetchReports, user]); // Tambahkan dependencies

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

    // Helper function untuk konversi ke number dengan aman
    const safeToNumber = (value) => {
        if (value === null || value === undefined) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Get unique LOB options dari data reports
    const getLobOptions = () => {
        const lobs = reports
            .map((report) => report.lob || report.outlet?.lob)
            .filter((lob) => lob && lob !== "undefined")
            .filter((value, index, self) => self.indexOf(value) === index);

        return lobs.sort();
    };

    // Filter reports
    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            searchTerm === "" ||
            report.outlet?.nama_outlet
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            report.lob?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesOutlet =
            filterOutlet === "all" ||
            report.outlet_id?.toString() === filterOutlet;

        const matchesLob =
            filterLob === "all" ||
            (report.lob || report.outlet?.lob) === filterLob;

        return matchesSearch && matchesOutlet && matchesLob;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = filteredReports.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    // Handle delete
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token") || user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(`${API_BASE_URL}/reports/${id}`, config);

            // Update state setelah delete
            setReports(reports.filter((report) => report.id !== id));
            setDeleteModal({ show: false, id: null, outletName: "", date: "" });

            alert("Laporan berhasil dihapus!");
        } catch (error) {
            console.error("Error deleting report:", error);
            alert("Gagal menghapus laporan. Silakan coba lagi.");
        }
    };

    // Calculate totals
    const calculateTotals = () => {
        return filteredReports.reduce(
            (totals, report) => ({
                totalFnb: totals.totalFnb + safeToNumber(report.omzet_fnb),
                totalCinema:
                    totals.totalCinema + safeToNumber(report.omzet_cinema),
                totalBills:
                    totals.totalBills + safeToNumber(report.total_bills),
                totalAudience:
                    totals.totalAudience + safeToNumber(report.total_audience),
                totalRevenue:
                    totals.totalRevenue +
                    safeToNumber(report.omzet_fnb) +
                    safeToNumber(report.omzet_cinema),
            }),
            {
                totalFnb: 0,
                totalCinema: 0,
                totalBills: 0,
                totalAudience: 0,
                totalRevenue: 0,
            }
        );
    };

    const totals = calculateTotals();

    // Reset filter
    const handleResetFilter = () => {
        setSearchTerm("");
        setFilterOutlet("all");
        setFilterLob("all");
        setCurrentPage(1);
    };

    // Months for filter
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

    // Years for filter (last 5 years and next 1 year)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat...</p>
            </div>
        );
    }

    if (user.role !== "admin") {
        return (
            <div style={styles.unauthorizedContainer}>
                <FontAwesomeIcon
                    icon={faExclamationCircle}
                    style={styles.unauthorizedIcon}
                />
                <h2 style={styles.unauthorizedTitle}>Akses Ditolak</h2>
                <p style={styles.unauthorizedText}>
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <button
                    onClick={() => navigate("/admin/dashboard")}
                    style={styles.backButton}
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    const lobOptions = getLobOptions();

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div style={styles.headerContent}>
                            <h1 style={styles.title}>Data Laporan</h1>
                            <p style={styles.subtitle}>
                                Kelola semua laporan outlet
                            </p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button
                            onClick={fetchReports}
                            style={styles.refreshButton}
                            disabled={loading}
                        >
                            <FontAwesomeIcon
                                icon={faSync}
                                spin={loading}
                                style={{ marginRight: "0.5rem" }}
                            />
                            {loading ? " Memuat..." : " Refresh"}
                        </button>
                        <Link
                            to="/admin/reports/create"
                            style={styles.addButton}
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Tambah Laporan
                        </Link>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorAlert}>
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <span style={{ marginLeft: "0.5rem" }}>{error}</span>
                    </div>
                )}

                {/* Summary Statistics */}
                <div style={styles.statsContainer}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faMoneyBill} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatCurrency(totals.totalRevenue)}
                            </div>
                            <div style={styles.statLabel}>Total Omzet</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatCurrency(totals.totalFnb)}
                            </div>
                            <div style={styles.statLabel}>Omzet F&B</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatCurrency(totals.totalCinema)}
                            </div>
                            <div style={styles.statLabel}>Omzet Cinema</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statValue}>
                                {formatNumber(totals.totalAudience)}
                            </div>
                            <div style={styles.statLabel}>Total Penonton</div>
                        </div>
                    </div>
                </div>

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

                        <div style={styles.filterGroup}>
                            <FontAwesomeIcon
                                icon={faStore}
                                style={styles.filterIcon}
                            />
                            {loadingOutlets ? (
                                <div style={styles.loadingSelect}>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                </div>
                            ) : (
                                <select
                                    value={filterOutlet}
                                    onChange={(e) => {
                                        setFilterOutlet(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={styles.filterSelect}
                                >
                                    <option value="all">Semua Outlet</option>
                                    {outlets.map((outlet) => (
                                        <option
                                            key={outlet.id}
                                            value={outlet.id}
                                        >
                                            {outlet.nama_outlet}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div style={styles.filterGroup}>
                            <FontAwesomeIcon
                                icon={faTags}
                                style={styles.filterIcon}
                            />
                            <select
                                value={filterLob}
                                onChange={(e) => {
                                    setFilterLob(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={styles.filterSelect}
                            >
                                <option value="all">Semua LOB</option>
                                {lobOptions.map((lob) => (
                                    <option key={lob} value={lob}>
                                        {lob}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(searchTerm ||
                            filterOutlet !== "all" ||
                            filterLob !== "all") && (
                            <button
                                onClick={handleResetFilter}
                                style={styles.resetButton}
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabel Data */}
                <div style={styles.tableContainer}>
                    {loading ? (
                        <div style={styles.loadingTable}>
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                style={{
                                    fontSize: "2rem",
                                    color: "#3b82f6",
                                    marginBottom: "1rem",
                                }}
                            />
                            <p>Memuat data laporan...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                style={styles.emptyIcon}
                            />
                            <h3 style={styles.emptyTitle}>
                                {searchTerm ||
                                filterOutlet !== "all" ||
                                filterLob !== "all"
                                    ? "Tidak ada laporan ditemukan"
                                    : "Belum ada laporan"}
                            </h3>
                            <p style={styles.emptyText}>
                                {searchTerm ||
                                filterOutlet !== "all" ||
                                filterLob !== "all"
                                    ? "Tidak ada laporan yang sesuai dengan filter pencarian."
                                    : "Mulai dengan menambahkan laporan pertama."}
                            </p>
                            <Link
                                to="/admin/reports/create"
                                style={styles.emptyButton}
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Tambah Laporan
                            </Link>
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
                                    {filterMonth &&
                                        ` (Bulan: ${
                                            months[filterMonth - 1]?.label
                                        } ${filterYear})`}
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
                                    {currentReports.map((report) => {
                                        const targetPercentage = safeToNumber(
                                            report.target_percentage
                                        );
                                        const lob =
                                            report.lob ||
                                            report.outlet?.lob ||
                                            "Cafe";

                                        return (
                                            <tr
                                                key={report.id}
                                                style={styles.tableRow}
                                            >
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={styles.dateCell}
                                                    >
                                                        <div
                                                            style={
                                                                styles.dateBadge
                                                            }
                                                        >
                                                            {formatDate(
                                                                report.report_date
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.outletCell
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.outletText
                                                            }
                                                        >
                                                            {report.outlet
                                                                ?.nama_outlet ||
                                                                "-"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.lobCell}>
                                                        <span
                                                            style={{
                                                                ...styles.lobBadge,
                                                                backgroundColor:
                                                                    getLobColor(
                                                                        lob
                                                                    ),
                                                            }}
                                                        >
                                                            {lob}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.currencyCell
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.currencyValue
                                                            }
                                                        >
                                                            {formatCurrency(
                                                                safeToNumber(
                                                                    report.omzet_fnb
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.currencyCell
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.currencyValue
                                                            }
                                                        >
                                                            {formatCurrency(
                                                                safeToNumber(
                                                                    report.omzet_cinema
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.numberCell
                                                        }
                                                    >
                                                        {formatNumber(
                                                            safeToNumber(
                                                                report.total_bills
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.numberCell
                                                        }
                                                    >
                                                        {formatNumber(
                                                            safeToNumber(
                                                                report.total_audience
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <span
                                                        style={{
                                                            ...styles.targetBadge,
                                                            backgroundColor:
                                                                targetPercentage >=
                                                                100
                                                                    ? "#10b981"
                                                                    : targetPercentage >=
                                                                      80
                                                                    ? "#f59e0b"
                                                                    : "#ef4444",
                                                        }}
                                                    >
                                                        {targetPercentage.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.numberCell
                                                        }
                                                    >
                                                        {formatNumber(
                                                            safeToNumber(
                                                                report.target_head
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div
                                                        style={
                                                            styles.actionButtons
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/reports/${report.id}`
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
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/reports/edit/${report.id}`
                                                                )
                                                            }
                                                            style={
                                                                styles.editButton
                                                            }
                                                            title="Edit"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faEdit}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteModal({
                                                                    show: true,
                                                                    id: report.id,
                                                                    outletName:
                                                                        report
                                                                            .outlet
                                                                            ?.nama_outlet ||
                                                                        "Laporan",
                                                                    date: formatDate(
                                                                        report.report_date
                                                                    ),
                                                                })
                                                            }
                                                            style={
                                                                styles.deleteButton
                                                            }
                                                            title="Hapus"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                                        <FontAwesomeIcon
                                            icon={faChevronLeft}
                                            style={{ marginRight: "0.5rem" }}
                                        />
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
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            style={{ marginLeft: "0.5rem" }}
                                        />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <FontAwesomeIcon
                                icon={faExclamationCircle}
                                style={styles.modalIcon}
                            />
                            <h3 style={styles.modalTitle}>Konfirmasi Hapus</h3>
                        </div>
                        <div style={styles.modalBody}>
                            <p>
                                Apakah Anda yakin ingin menghapus laporan{" "}
                                <strong>{deleteModal.outletName}</strong> untuk
                                tanggal <strong>{deleteModal.date}</strong>?
                            </p>
                            <p style={styles.warningText}>
                                Tindakan ini tidak dapat dibatalkan. Data
                                laporan akan hilang permanen.
                            </p>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        outletName: "",
                                        date: "",
                                    })
                                }
                                style={styles.modalCancelButton}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal.id)}
                                style={styles.modalDeleteButton}
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function untuk warna LOB
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

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "1rem",
    },
    content: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        margin: "0 auto",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
    },
    spinner: {
        width: "50px",
        height: "50px",
        border: "5px solid #e2e8f0",
        borderTop: "5px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem",
    },
    unauthorizedContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
        padding: "2rem",
        textAlign: "center",
    },
    unauthorizedIcon: {
        fontSize: "4rem",
        color: "#ef4444",
        marginBottom: "1.5rem",
    },
    unauthorizedTitle: {
        fontSize: "1.75rem",
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: "1rem",
    },
    unauthorizedText: {
        fontSize: "1rem",
        color: "#64748b",
        marginBottom: "2rem",
        maxWidth: "400px",
    },
    backButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.9rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
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
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed",
        },
    },
    addButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.875rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#059669",
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
            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        },
    },
    loadingSelect: {
        padding: "0.625rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.875rem",
        backgroundColor: "#f9fafb",
        color: "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "150px",
    },
    resetButton: {
        padding: "0.625rem 1rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.875rem",
        cursor: "pointer",
        fontWeight: "500",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
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
    loadingTable: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        textAlign: "center",
        color: "#64748b",
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
    emptyButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.875rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#059669",
        },
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
    },
    actionButtons: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
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
    editButton: {
        padding: "0.5rem",
        backgroundColor: "#f59e0b",
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
            backgroundColor: "#d97706",
        },
    },
    deleteButton: {
        padding: "0.5rem",
        backgroundColor: "#ef4444",
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
            backgroundColor: "#dc2626",
        },
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
        display: "flex",
        alignItems: "center",
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
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
    },
    modalHeader: {
        padding: "1.5rem",
        backgroundColor: "#fee2e2",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    modalIcon: {
        fontSize: "1.25rem",
        color: "#dc2626",
    },
    modalTitle: {
        margin: 0,
        color: "#1e293b",
        fontSize: "1.125rem",
        fontWeight: "600",
    },
    modalBody: {
        padding: "1.5rem",
        color: "#4b5563",
        lineHeight: "1.6",
        fontSize: "0.95rem",
    },
    warningText: {
        color: "#dc2626",
        fontWeight: "500",
        fontSize: "0.85rem",
        marginTop: "0.75rem",
    },
    modalFooter: {
        padding: "1.5rem",
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.75rem",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
    },
    modalCancelButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.875rem",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    modalDeleteButton: {
        padding: "0.625rem 1.25rem",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.875rem",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#b91c1c",
        },
    },
};

export default ReportsList;

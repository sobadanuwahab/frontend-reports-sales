import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStore,
    faEdit,
    faTrash,
    faEye,
    faPlus,
    faSearch,
    faFilter,
    faSync,
    faExclamationCircle,
    faChevronLeft,
    faChevronRight,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const OutletsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State untuk data dan UI
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLob, setFilterLob] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        id: null,
        name: "",
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

    // Fetch data outlets dari API
    useEffect(() => {
        fetchOutlets();
    }, []);

    const fetchOutlets = async () => {
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

            const response = await axios.get(`${API_BASE_URL}/outlets`, config);

            // Periksa struktur response
            console.log("API Response:", response.data);

            if (response.data.success && response.data.data) {
                setOutlets(response.data.data);
            } else if (Array.isArray(response.data)) {
                setOutlets(response.data);
            } else {
                setOutlets([]);
                setError("Struktur data tidak sesuai");
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError("Sesi telah berakhir. Silakan login kembali.");
                        break;
                    case 403:
                        setError(
                            "Anda tidak memiliki izin untuk mengakses data ini."
                        );
                        break;
                    case 404:
                        setError("Endpoint API tidak ditemukan.");
                        // Fallback ke data dummy untuk development
                        setOutlets(getDummyData());
                        break;
                    default:
                        setError(
                            "Gagal mengambil data outlet. Silakan refresh halaman."
                        );
                }
            } else if (error.request) {
                setError(
                    "Tidak dapat terhubung ke server. Periksa koneksi Anda."
                );
            } else {
                setError("Terjadi kesalahan: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Data dummy untuk testing - SESUAI MODEL TERBARU
    const getDummyData = () => {
        return [
            {
                id: 1,
                kode_outlet: "OUT-001",
                nama_outlet: "Cafe Central Jakarta",
                lob: "Cafe",
                created_at: "2024-01-10 10:30:00",
                updated_at: "2024-01-10 10:30:00",
            },
            {
                id: 2,
                kode_outlet: "OUT_002",
                nama_outlet: "Restaurant Bandung",
                lob: "Restaurant",
                created_at: "2024-01-09 14:20:00",
                updated_at: "2024-01-09 14:20:00",
            },
            {
                id: 3,
                kode_outlet: "CAFE-01",
                nama_outlet: "Cafe Surabaya",
                lob: "Cafe",
                created_at: "2024-01-08 09:15:00",
                updated_at: "2024-01-08 09:15:00",
            },
            {
                id: 4,
                kode_outlet: "RST-001",
                nama_outlet: "Restaurant Bogor",
                lob: "Restaurant",
                created_at: "2024-01-07 16:45:00",
                updated_at: "2024-01-07 16:45:00",
            },
            {
                id: 5,
                kode_outlet: "OUT 003",
                nama_outlet: "Retail Medan",
                lob: "Retail",
                created_at: "2024-01-06 11:10:00",
                updated_at: "2024-01-06 11:10:00",
            },
            {
                id: 6,
                kode_outlet: "SVC-001",
                nama_outlet: "Service Center Jakarta",
                lob: "Service",
                created_at: "2024-01-05 13:30:00",
                updated_at: "2024-01-05 13:30:00",
            },
        ];
    };

    // Filter dan search data
    const filteredOutlets = outlets.filter((outlet) => {
        const matchesSearch =
            (outlet.nama_outlet || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (outlet.kode_outlet || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesLob = filterLob === "all" || outlet.lob === filterLob;

        return matchesSearch && matchesLob;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOutlets = filteredOutlets.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);

    // Handle delete
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token") || user?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(`${API_BASE_URL}/outlets/${id}`, config);

            // Update state setelah delete
            setOutlets(outlets.filter((outlet) => outlet.id !== id));
            setDeleteModal({ show: false, id: null, name: "" });

            alert("Outlet berhasil dihapus!");
        } catch (error) {
            console.error("Error deleting outlet:", error);
            alert("Gagal menghapus outlet. Silakan coba lagi.");
        }
    };

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

    // Get LOB color - DIPERBARUI sesuai opsi LOB
    const getLobColor = (lob) => {
        if (!lob) return "#6b7280";

        switch (lob.toLowerCase()) {
            case "cafe":
                return "#3b82f6";
            case "restaurant":
                return "#8b5cf6";
            case "retail":
                return "#f59e0b";
            case "service":
                return "#10b981";
            case "f&b":
            case "food & beverage":
                return "#ef4444";
            case "hotel":
                return "#ec4899";
            case "entertainment":
                return "#06b6d4";
            default:
                return "#6b7280";
        }
    };

    // Handle view detail
    const handleViewDetail = (id) => {
        navigate(`/admin/outlets/${id}`);
    };

    // Handle edit
    const handleEdit = (id) => {
        navigate(`/admin/outlets/edit/${id}`);
    };

    // Reset filter
    const handleResetFilter = () => {
        setSearchTerm("");
        setFilterLob("all");
        setCurrentPage(1);
    };

    // Jika loading auth
    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat...</p>
            </div>
        );
    }

    // Jika bukan admin
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

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <FontAwesomeIcon icon={faStore} />
                        </div>
                        <div style={styles.headerContent}>
                            <h1 style={styles.title}>Data Outlet</h1>
                            <p style={styles.subtitle}>
                                Kelola semua outlet yang terdaftar dalam sistem
                            </p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button
                            onClick={fetchOutlets}
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
                        <Link to="/admin/outlets/add" style={styles.addButton}>
                            <FontAwesomeIcon
                                icon={faPlus}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Tambah Outlet
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

                {/* Search dan Filter */}
                <div style={styles.toolbar}>
                    <div style={styles.searchContainer}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            style={styles.searchIcon}
                        />
                        <input
                            type="text"
                            placeholder="Cari outlet (nama, kode)..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.filterContainer}>
                        <FontAwesomeIcon
                            icon={faFilter}
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
                            <option value="Cafe">Cafe</option>
                            <option value="Premiere">Premiere</option>
                            <option value="Hello Sunday">Hello Sunday</option>
                        </select>

                        {(searchTerm || filterLob !== "all") && (
                            <button
                                onClick={handleResetFilter}
                                style={styles.resetButton}
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Statistik */}
                <div style={styles.statsContainer}>
                    {(() => {
                        // DEBUG: Lihat semua data
                        console.log("=== DATA ANALYSIS ===");

                        // 1. Hitung Total Outlet UNIK berdasarkan nama_outlet
                        const uniqueOutletNames = new Set();
                        outlets.forEach((outlet) => {
                            if (
                                outlet.nama_outlet &&
                                outlet.nama_outlet.trim() !== ""
                            ) {
                                uniqueOutletNames.add(
                                    outlet.nama_outlet.toLowerCase().trim()
                                );
                            }
                        });
                        const totalUniqueOutlets = uniqueOutletNames.size;

                        console.log(
                            "Unique outlet names:",
                            Array.from(uniqueOutletNames)
                        );
                        console.log(
                            "Total unique outlets:",
                            totalUniqueOutlets
                        );

                        // 2. Hitung statistik LOB - SEMUA DATA dihitung (termasuk duplikat nama)
                        const lobCounts = {
                            Cafe: 0,
                            Premiere: 0,
                            "Hello Sunday": 0,
                            "Tanpa LOB": 0,
                        };

                        // Hitung semua LOB dari semua data
                        outlets.forEach((outlet) => {
                            if (
                                outlet.nama_outlet &&
                                outlet.nama_outlet.trim() !== ""
                            ) {
                                const lob = outlet.lob ? outlet.lob.trim() : "";

                                if (!lob) {
                                    lobCounts["Tanpa LOB"]++;
                                } else {
                                    const lobLower = lob.toLowerCase();

                                    if (lobLower === "cafe" || lob === "Cafe") {
                                        lobCounts["Cafe"]++;
                                    } else if (
                                        lobLower === "premiere" ||
                                        lob === "Premiere"
                                    ) {
                                        lobCounts["Premiere"]++;
                                    } else if (
                                        lobLower === "hello sunday" ||
                                        lobLower === "hellosunday" ||
                                        lob === "Hello Sunday"
                                    ) {
                                        lobCounts["Hello Sunday"]++;
                                    } else {
                                        lobCounts[lob] =
                                            (lobCounts[lob] || 0) + 1;
                                    }
                                }
                            }
                        });

                        console.log("LOB Counts (all data):", lobCounts);

                        return (
                            <>
                                {/* Total Outlet UNIK (1 per nama outlet) */}
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>
                                        {totalUniqueOutlets}
                                    </div>
                                    <div style={styles.statLabel}>
                                        Total Outlet
                                    </div>
                                </div>

                                {/* Cafe - Hitung dari SEMUA DATA */}
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>
                                        {lobCounts["Cafe"] || 0}
                                    </div>
                                    <div style={styles.statLabel}>Cafe</div>
                                </div>

                                {/* Premiere - Hitung dari SEMUA DATA */}
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>
                                        {lobCounts["Premiere"] || 0}
                                    </div>
                                    <div style={styles.statLabel}>Premiere</div>
                                </div>

                                {/* Hello Sunday - Hitung dari SEMUA DATA */}
                                <div style={styles.statCard}>
                                    <div style={styles.statValue}>
                                        {lobCounts["Hello Sunday"] || 0}
                                    </div>
                                    <div style={styles.statLabel}>
                                        Hello Sunday
                                    </div>
                                </div>

                                {/* LOB Lainnya */}
                                {Object.entries(lobCounts)
                                    .filter(
                                        ([lob]) =>
                                            lob !== "Cafe" &&
                                            lob !== "Premiere" &&
                                            lob !== "Hello Sunday" &&
                                            lob !== "Tanpa LOB"
                                    )
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 2) // Maksimal 2 LOB lainnya
                                    .map(([lob, count], index) => (
                                        <div
                                            key={index}
                                            style={styles.statCard}
                                        >
                                            <div style={styles.statValue}>
                                                {count}
                                            </div>
                                            <div style={styles.statLabel}>
                                                {lob}
                                            </div>
                                        </div>
                                    ))}

                                {/* Tanpa LOB (jika ada) */}
                                {lobCounts["Tanpa LOB"] > 0 && (
                                    <div style={styles.statCard}>
                                        <div style={styles.statValue}>
                                            {lobCounts["Tanpa LOB"]}
                                        </div>
                                        <div style={styles.statLabel}>
                                            Tanpa LOB
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
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
                            <p>Memuat data outlet...</p>
                        </div>
                    ) : filteredOutlets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FontAwesomeIcon
                                icon={faStore}
                                style={styles.emptyIcon}
                            />
                            <h3 style={styles.emptyTitle}>
                                {searchTerm || filterLob !== "all"
                                    ? "Tidak ada outlet ditemukan"
                                    : "Belum ada outlet"}
                            </h3>
                            <p style={styles.emptyText}>
                                {searchTerm || filterLob !== "all"
                                    ? "Tidak ada outlet yang sesuai dengan filter pencarian."
                                    : "Mulai dengan menambahkan outlet pertama Anda."}
                            </p>
                            {/* <Link
                                to="/admin/outlets/create"
                                style={styles.emptyButton}
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Tambah Outlet
                            </Link> */}
                        </div>
                    ) : (
                        <>
                            <div style={styles.tableInfo}>
                                <span>
                                    Menampilkan{" "}
                                    <strong>{currentOutlets.length}</strong>{" "}
                                    dari{" "}
                                    <strong>{filteredOutlets.length}</strong>{" "}
                                    outlet
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
                                            Kode Outlet
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Nama Outlet
                                        </th>
                                        <th style={styles.tableHeader}>LOB</th>
                                        <th style={styles.tableHeader}>
                                            Tanggal Dibuat
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Terakhir Diubah
                                        </th>
                                        <th style={styles.tableHeader}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOutlets.map((outlet) => (
                                        <tr
                                            key={outlet.id}
                                            style={styles.tableRow}
                                        >
                                            <td style={styles.tableCell}>
                                                <div style={styles.codeCell}>
                                                    <div
                                                        style={styles.codeBadge}
                                                    >
                                                        {outlet.kode_outlet ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.nameCell}>
                                                    <div
                                                        style={styles.nameText}
                                                    >
                                                        {outlet.nama_outlet ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {outlet.lob ? (
                                                    <span
                                                        style={{
                                                            ...styles.lobBadge,
                                                            backgroundColor:
                                                                getLobColor(
                                                                    outlet.lob
                                                                ),
                                                        }}
                                                    >
                                                        {outlet.lob}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={styles.noLobText}
                                                    >
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {formatDate(outlet.created_at)}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {formatDate(outlet.updated_at)}
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div
                                                    style={styles.actionButtons}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetail(
                                                                outlet.id
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
                                                            handleEdit(
                                                                outlet.id
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
                                                                id: outlet.id,
                                                                name:
                                                                    outlet.nama_outlet ||
                                                                    "Outlet ini",
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
                                Apakah Anda yakin ingin menghapus outlet{" "}
                                <strong>{deleteModal.name}</strong>?
                            </p>
                            <p style={styles.warningText}>
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                terkait outlet ini akan hilang.
                            </p>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        name: "",
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

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
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
        backgroundColor: "#3b82f6",
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
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
    },
    filterContainer: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
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
            borderColor: "#3b82f6",
        },
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
    statsContainer: {
        padding: "1.25rem 2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
    },
    statCard: {
        backgroundColor: "white",
        padding: "1.25rem",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
    },
    statValue: {
        fontSize: "1.75rem",
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
        backgroundColor: "#3b82f6",
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
            backgroundColor: "#2563eb",
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
        "&:first-child": {
            borderLeft: "1px solid #e2e8f0",
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
        },
        "&:last-child": {
            borderRight: "1px solid #e2e8f0",
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
        },
    },
    codeCell: {
        display: "flex",
        alignItems: "center",
    },
    codeBadge: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        padding: "0.375rem 0.75rem",
        borderRadius: "6px",
        fontWeight: "600",
        fontSize: "0.8rem",
        fontFamily: "monospace",
    },
    nameCell: {
        display: "flex",
        flexDirection: "column",
    },
    nameText: {
        fontWeight: "500",
        color: "#1e293b",
        fontSize: "0.9rem",
    },
    lobBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        color: "white",
        fontWeight: "600",
        fontSize: "0.75rem",
    },
    noLobText: {
        color: "#9ca3af",
        fontStyle: "italic",
        fontSize: "0.85rem",
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
        backgroundColor: "#3b82f6",
        color: "white",
        borderColor: "#3b82f6",
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

export default OutletsList;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faEye,
    faSearch,
    faFilter,
    faUserCircle,
    faIdBadge,
    faExclamationTriangle,
    faBuilding,
    faStore,
    faGraduationCap,
    faBriefcase,
    faCalendar,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";

const KaryawanList = () => {
    const [karyawan, setKaryawan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [outlets, setOutlets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterOutlet, setFilterOutlet] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterJenisKaryawan, setFilterJenisKaryawan] = useState(""); // Filter baru
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [karyawanToDelete, setKaryawanToDelete] = useState(null);
    const navigate = useNavigate();

    // Departments untuk filter (sesuai dengan create form)
    const departments = [
        "Marketing",
        "Sales",
        "IT",
        "HRD",
        "Finance",
        "Operations",
        "Customer Service",
        "Produksi",
        "Quality Control",
        "Logistik",
        "R&D",
    ];

    // Status options (sesuai dengan field baru)
    const statusOptions = ["Aktif", "Tidak Aktif", "Cuti"];

    // Jenis karyawan options (sesuai dengan field baru)
    const jenisKaryawanOptions = ["Tetap", "Kontrak", "Freelance", "Magang"];

    useEffect(() => {
        fetchKaryawan();
        fetchOutlets();
    }, []);

    const fetchKaryawan = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Build query parameters sesuai dengan API yang sudah direvisi
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (filterDepartment) params.append("department", filterDepartment);
            if (filterOutlet) params.append("outlet_id", filterOutlet);
            if (filterStatus) params.append("status_karyawan", filterStatus);
            if (filterJenisKaryawan)
                params.append("jenis_karyawan", filterJenisKaryawan);

            const url = `http://localhost:8000/api/karyawan?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setKaryawan(data.data || []);
            } else {
                console.error("API Error:", data.message);
                // Fallback data sudah dihapus karena harus sesuai dengan struktur baru
                setKaryawan([]);
            }
        } catch (error) {
            console.error("Error fetching karyawan:", error);
            setKaryawan([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOutlets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/outlets", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOutlets(data.data || []);
                }
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);
            setOutlets([]);
        }
    };

    const handleApplyFilter = () => {
        setCurrentPage(1);
        fetchKaryawan();
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setFilterDepartment("");
        setFilterOutlet("");
        setFilterStatus("");
        setFilterJenisKaryawan("");
        setCurrentPage(1);
        fetchKaryawan();
    };

    // Filter karyawan client-side
    const filteredKaryawan = karyawan.filter((k) => {
        const matchesSearch =
            searchTerm === "" ||
            k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
            filterDepartment === "" || k.department === filterDepartment;

        const matchesOutlet =
            filterOutlet === "" ||
            (filterOutlet === "null"
                ? k.outlet_id === null
                : k.outlet_id === parseInt(filterOutlet));

        const matchesStatus =
            filterStatus === "" || k.status_karyawan === filterStatus;

        const matchesJenisKaryawan =
            filterJenisKaryawan === "" ||
            k.jenis_karyawan === filterJenisKaryawan;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesOutlet &&
            matchesStatus &&
            matchesJenisKaryawan
        );
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredKaryawan.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredKaryawan.length / itemsPerPage);

    const handleView = (id) => {
        navigate(`/admin/karyawan/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/admin/karyawan/${id}/edit`);
    };

    const handleDeleteClick = (karyawan) => {
        setKaryawanToDelete(karyawan);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch(
                `http://localhost:8000/api/karyawan/${karyawanToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setKaryawan(karyawan.filter((k) => k.id !== karyawanToDelete.id));
            setShowDeleteModal(false);
            setKaryawanToDelete(null);
        } catch (error) {
            console.error("Error deleting karyawan:", error);
            alert("Gagal menghapus karyawan");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Aktif":
                return "#10b981";
            case "Tidak Aktif":
                return "#ef4444";
            case "Cuti":
                return "#f59e0b";
            default:
                return "#6b7280";
        }
    };

    const getJenisKaryawanColor = (jenis) => {
        switch (jenis) {
            case "Tetap":
                return "#3b82f6";
            case "Kontrak":
                return "#8b5cf6";
            case "Freelance":
                return "#f59e0b";
            case "Magang":
                return "#10b981";
            default:
                return "#64748b";
        }
    };

    const getOutletName = (karyawan) => {
        if (!karyawan.outlet_id) return "Tanpa Outlet";
        return karyawan.outlet
            ? karyawan.outlet.nama_outlet
            : `Outlet ${karyawan.outlet_id}`;
    };

    const calculateTenure = (joinDate) => {
        if (!joinDate) return "-";
        const today = new Date();
        const join = new Date(joinDate);
        const diffYears = today.getFullYear() - join.getFullYear();
        const diffMonths = today.getMonth() - join.getMonth();
        const months = diffYears * 12 + diffMonths;

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) {
            return `${remainingMonths} bln`;
        } else if (remainingMonths === 0) {
            return `${years} thn`;
        } else {
            return `${years} thn ${remainingMonths} bln`;
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Data Karyawan</h1>
                    <p style={styles.subtitle}>
                        Kelola data karyawan perusahaan
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/karyawan/create")}
                    style={styles.addButton}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Tambah Karyawan</span>
                </button>
            </div>

            {/* Filters Section */}
            <div style={styles.filterSection}>
                <div style={styles.filterGrid}>
                    {/* Search Input */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={styles.filterIcon}
                            />
                            Cari Karyawan
                        </label>
                        <input
                            type="text"
                            placeholder="NIK, nama, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.filterInput}
                        />
                    </div>

                    {/* Department Filter */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>
                            <FontAwesomeIcon
                                icon={faBuilding}
                                style={styles.filterIcon}
                            />
                            Department
                        </label>
                        <select
                            value={filterDepartment}
                            onChange={(e) =>
                                setFilterDepartment(e.target.value)
                            }
                            style={styles.filterInput}
                        >
                            <option value="">Semua Department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Outlet Filter */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>
                            <FontAwesomeIcon
                                icon={faStore}
                                style={styles.filterIcon}
                            />
                            Outlet
                        </label>
                        <select
                            value={filterOutlet}
                            onChange={(e) => setFilterOutlet(e.target.value)}
                            style={styles.filterInput}
                        >
                            <option value="">Semua Outlet</option>
                            <option value="null">Tanpa Outlet</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.nama_outlet} ({outlet.kode_outlet})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={styles.filterInput}
                        >
                            <option value="">Semua Status</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Jenis Karyawan Filter (Baru) */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Jenis Karyawan</label>
                        <select
                            value={filterJenisKaryawan}
                            onChange={(e) =>
                                setFilterJenisKaryawan(e.target.value)
                            }
                            style={styles.filterInput}
                        >
                            <option value="">Semua Jenis</option>
                            {jenisKaryawanOptions.map((jenis) => (
                                <option key={jenis} value={jenis}>
                                    {jenis}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filter Actions */}
                <div style={styles.filterActions}>
                    <button
                        onClick={handleApplyFilter}
                        style={styles.applyButton}
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        <span>Terapkan Filter</span>
                    </button>
                    <button
                        onClick={handleResetFilter}
                        style={styles.resetButton}
                    >
                        Reset Filter
                    </button>
                </div>

                {/* Stats */}
                <div style={styles.stats}>
                    <span style={styles.statItem}>
                        Total: <strong>{filteredKaryawan.length}</strong>{" "}
                        karyawan
                    </span>
                    <span style={styles.statItem}>
                        Aktif:{" "}
                        <strong style={{ color: "#10b981" }}>
                            {
                                filteredKaryawan.filter(
                                    (k) => k.status_karyawan === "Aktif",
                                ).length
                            }
                        </strong>
                    </span>
                    <span style={styles.statItem}>
                        Tetap:{" "}
                        <strong style={{ color: "#3b82f6" }}>
                            {
                                filteredKaryawan.filter(
                                    (k) => k.jenis_karyawan === "Tetap",
                                ).length
                            }
                        </strong>
                    </span>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Memuat data karyawan...</p>
                </div>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>NIK</th>
                                    <th style={styles.th}>Nama</th>
                                    <th style={styles.th}>Pendidikan</th>
                                    <th style={styles.th}>Posisi</th>
                                    <th style={styles.th}>Outlet</th>
                                    <th style={styles.th}>Status & Jenis</th>
                                    <th style={styles.th}>Masa Kerja</th>
                                    <th style={styles.th}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={styles.noData}>
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                style={styles.noDataIcon}
                                            />
                                            <p>Tidak ada data karyawan</p>
                                            {/* <button
                                                onClick={() =>
                                                    navigate(
                                                        "/admin/karyawan/create"
                                                    )
                                                }
                                                style={styles.addFirstButton}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                />
                                                Tambah Karyawan Pertama
                                            </button> */}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((k) => (
                                        <tr key={k.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.nikCell}>
                                                    <FontAwesomeIcon
                                                        icon={faIdBadge}
                                                        style={styles.nikIcon}
                                                    />
                                                    {k.nik}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.nameCell}>
                                                    {k.foto_profil ? (
                                                        <img
                                                            src={`http://localhost:8000/storage/${k.foto_profil}`}
                                                            alt={k.nama}
                                                            style={
                                                                styles.avatarImage
                                                            }
                                                            onError={(e) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.style.display =
                                                                    "none";
                                                                e.target.parentNode.querySelector(
                                                                    ".avatarIcon",
                                                                ).style.display =
                                                                    "block";
                                                            }}
                                                        />
                                                    ) : null}
                                                    <FontAwesomeIcon
                                                        icon={faUserCircle}
                                                        className="avatarIcon"
                                                        style={{
                                                            ...styles.avatarIcon,
                                                            display:
                                                                k.foto_profil
                                                                    ? "none"
                                                                    : "block",
                                                        }}
                                                    />
                                                    <div>
                                                        <strong>
                                                            {k.nama}
                                                        </strong>
                                                        <div
                                                            style={styles.email}
                                                        >
                                                            {k.email}
                                                        </div>
                                                        <div
                                                            style={styles.phone}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faPhone}
                                                                size="xs"
                                                            />{" "}
                                                            {k.telepon}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div
                                                    style={styles.educationCell}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faGraduationCap}
                                                        style={
                                                            styles.educationIcon
                                                        }
                                                    />
                                                    <div>
                                                        <div>
                                                            {k.pendidikan_terakhir ||
                                                                "-"}
                                                        </div>
                                                        <div
                                                            style={
                                                                styles.school
                                                            }
                                                        >
                                                            {k.nama_sekolah_universitas ||
                                                                "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div
                                                    style={styles.positionCell}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBriefcase}
                                                        style={
                                                            styles.positionIcon
                                                        }
                                                    />
                                                    <div>
                                                        <strong>
                                                            {k.jabatan}
                                                        </strong>
                                                        <div
                                                            style={
                                                                styles.department
                                                            }
                                                        >
                                                            {k.department}
                                                            {k.level_jabatan &&
                                                                ` • ${k.level_jabatan}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.outletCell}>
                                                    {k.outlet_id ? (
                                                        <>
                                                            <FontAwesomeIcon
                                                                icon={faStore}
                                                                style={
                                                                    styles.outletIcon
                                                                }
                                                            />
                                                            <div>
                                                                <strong>
                                                                    {getOutletName(
                                                                        k,
                                                                    )}
                                                                </strong>
                                                                {k.outlet && (
                                                                    <div
                                                                        style={
                                                                            styles.outletCode
                                                                        }
                                                                    >
                                                                        {
                                                                            k
                                                                                .outlet
                                                                                .kode_outlet
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span
                                                            style={
                                                                styles.noOutlet
                                                            }
                                                        >
                                                            Tanpa Outlet
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div
                                                    style={
                                                        styles.statusContainer
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            ...styles.statusBadge,
                                                            backgroundColor:
                                                                getStatusColor(
                                                                    k.status_karyawan,
                                                                ),
                                                        }}
                                                    >
                                                        {k.status_karyawan ||
                                                            "Aktif"}
                                                    </span>
                                                    {k.jenis_karyawan && (
                                                        <span
                                                            style={{
                                                                ...styles.jenisBadge,
                                                                backgroundColor:
                                                                    getJenisKaryawanColor(
                                                                        k.jenis_karyawan,
                                                                    ),
                                                            }}
                                                        >
                                                            {k.jenis_karyawan}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.tenureCell}>
                                                    <FontAwesomeIcon
                                                        icon={faCalendar}
                                                        style={
                                                            styles.tenureIcon
                                                        }
                                                    />
                                                    <div>
                                                        <div
                                                            style={
                                                                styles.tenure
                                                            }
                                                        >
                                                            {calculateTenure(
                                                                k.tanggal_masuk,
                                                            )}
                                                        </div>
                                                        <div
                                                            style={
                                                                styles.joinDate
                                                            }
                                                        >
                                                            {formatDate(
                                                                k.tanggal_masuk,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div
                                                    style={styles.actionButtons}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleView(k.id)
                                                        }
                                                        style={
                                                            styles.actionButton
                                                        }
                                                        title="Lihat Detail"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(k.id)
                                                        }
                                                        style={{
                                                            ...styles.actionButton,
                                                            ...styles.editButton,
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEdit}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteClick(k)
                                                        }
                                                        style={{
                                                            ...styles.actionButton,
                                                            ...styles.deleteButton,
                                                        }}
                                                        title="Hapus"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                style={styles.pageButton}
                            >
                                Previous
                            </button>

                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() =>
                                                setCurrentPage(pageNum)
                                            }
                                            style={{
                                                ...styles.pageButton,
                                                ...(currentPage === pageNum &&
                                                    styles.activePageButton),
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                },
                            )}

                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                style={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Konfirmasi Hapus</h3>
                        </div>
                        <div style={styles.modalBody}>
                            <p>
                                Apakah Anda yakin ingin menghapus karyawan{" "}
                                <strong>{karyawanToDelete?.nama}</strong> (NIK:{" "}
                                {karyawanToDelete?.nik})?
                            </p>
                            <p style={styles.warningText}>
                                <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                                Data yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setKaryawanToDelete(null);
                                }}
                                style={styles.cancelButton}
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={styles.confirmDeleteButton}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #e2e8f0",
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#1e293b",
        margin: 0,
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#64748b",
        margin: "0.25rem 0 0 0",
    },
    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.25rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    filterSection: {
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1.5rem",
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
        gap: "0.5rem",
    },
    filterLabel: {
        fontSize: "0.8rem",
        fontWeight: "600",
        color: "#475569",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    filterIcon: {
        fontSize: "0.8rem",
        color: "#94a3b8",
    },
    filterInput: {
        padding: "0.5rem 0.75rem",
        border: "2px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "white",
        transition: "all 0.2s ease",
        "&:focus": {
            borderColor: "#3b82f6",
            outline: "none",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
    },
    filterActions: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1rem",
    },
    applyButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    resetButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },
    stats: {
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        paddingTop: "0.5rem",
        borderTop: "1px solid #e2e8f0",
    },
    statItem: {
        fontSize: "0.9rem",
        color: "#64748b",
    },
    tableContainer: {
        overflowX: "auto",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1200px",
    },
    th: {
        padding: "1rem",
        textAlign: "left",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        color: "#475569",
        fontWeight: "600",
        fontSize: "0.9rem",
        whiteSpace: "nowrap",
    },
    tr: {
        borderBottom: "1px solid #f1f5f9",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#f8fafc",
        },
    },
    td: {
        padding: "1rem",
        fontSize: "0.9rem",
        color: "#475569",
        verticalAlign: "middle",
    },
    nikCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "monospace",
        fontWeight: "500",
    },
    nikIcon: {
        color: "#3b82f6",
        fontSize: "0.9rem",
    },
    nameCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        position: "relative",
    },
    avatarImage: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
    },
    avatarIcon: {
        color: "#6b7280",
        fontSize: "1.5rem",
        width: "40px",
        height: "40px",
    },
    email: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        marginTop: "0.125rem",
    },
    phone: {
        fontSize: "0.75rem",
        color: "#64748b",
        marginTop: "0.125rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
    },
    educationCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    educationIcon: {
        color: "#8b5cf6",
        fontSize: "0.9rem",
    },
    school: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        marginTop: "0.125rem",
    },
    positionCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    positionIcon: {
        color: "#f59e0b",
        fontSize: "0.9rem",
    },
    department: {
        fontSize: "0.8rem",
        color: "#64748b",
        marginTop: "0.125rem",
    },
    outletCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    outletIcon: {
        color: "#10b981",
        fontSize: "0.9rem",
    },
    outletCode: {
        fontSize: "0.75rem",
        color: "#94a3b8",
        marginTop: "0.125rem",
    },
    noOutlet: {
        color: "#94a3b8",
        fontStyle: "italic",
        fontSize: "0.85rem",
    },
    statusContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        alignItems: "flex-start",
    },
    statusBadge: {
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "500",
        color: "white",
        display: "inline-block",
    },
    jenisBadge: {
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.7rem",
        fontWeight: "500",
        color: "white",
        display: "inline-block",
    },
    tenureCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    tenureIcon: {
        color: "#64748b",
        fontSize: "0.9rem",
    },
    tenure: {
        fontWeight: "500",
        color: "#1e293b",
    },
    joinDate: {
        fontSize: "0.75rem",
        color: "#94a3b8",
        marginTop: "0.125rem",
    },
    actionButtons: {
        display: "flex",
        gap: "0.5rem",
    },
    actionButton: {
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: "0.8rem",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "none",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },
    editButton: {
        color: "#3b82f6",
    },
    deleteButton: {
        color: "#ef4444",
    },
    noData: {
        textAlign: "center",
        padding: "3rem",
        color: "#9ca3af",
    },
    noDataIcon: {
        fontSize: "3rem",
        marginBottom: "1rem",
        opacity: 0.5,
    },
    addFirstButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        marginTop: "1rem",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
        marginTop: "1.5rem",
        paddingTop: "1rem",
        borderTop: "1px solid #e2e8f0",
    },
    pageButton: {
        padding: "0.5rem 0.75rem",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.9rem",
        transition: "all 0.2s ease",
        "&:hover:not(:disabled)": {
            backgroundColor: "#e2e8f0",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    activePageButton: {
        backgroundColor: "#3b82f6",
        color: "white",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    loading: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        color: "#64748b",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem",
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
        zIndex: 2000,
    },
    modal: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        width: "90%",
        maxWidth: "500px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    },
    modalHeader: {
        marginBottom: "1rem",
    },
    modalTitle: {
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    modalBody: {
        marginBottom: "1.5rem",
    },
    warningText: {
        color: "#ef4444",
        fontSize: "0.9rem",
        marginTop: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.75rem",
    },
    cancelButton: {
        padding: "0.75rem 1.25rem",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },
    confirmDeleteButton: {
        padding: "0.75rem 1.25rem",
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#dc2626",
        },
    },
};

// Add spinner animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleElement);

export default KaryawanList;

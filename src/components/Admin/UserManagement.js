import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faFilter,
  faSync,
  faBuilding,
  faKey,
  faExclamationCircle,
  faChevronLeft,
  faChevronRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State untuk data dan UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    name: "",
  });

  // API base URL - sesuaikan dengan URL Laravel Anda
  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://nonspurious-rory-nonacoustically.ngrok-free.dev/api";

  // Cek jika user bukan admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Fetch data users dari API menggunakan useCallback
  const fetchUsers = useCallback(async () => {
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
      };

      try {
        // Fetch users saja
        const response = await axios.get(`${API_BASE_URL}/users`, config);

        // Format data users sesuai response API
        const usersData = response.data?.data || response.data || [];
        console.log("Data users dari database:", usersData);
        setUsers(usersData);

        if (usersData.length === 0) {
          console.warn("Database users kosong");
        }
      } catch (apiError) {
        console.error("API Error:", apiError);

        let errorMessage = "Gagal mengambil data users dari server. ";

        if (apiError.response) {
          // Server responded with error
          errorMessage += `Status: ${apiError.response.status} - ${
            apiError.response.data?.message || apiError.response.statusText
          }`;
          console.error("Response data:", apiError.response.data);
        } else if (apiError.request) {
          // Request made but no response
          errorMessage +=
            "Tidak ada response dari server. Periksa koneksi atau apakah server Laravel berjalan.";
          console.error("No response received:", apiError.request);
        } else {
          // Something else
          errorMessage += apiError.message;
        }

        setError(errorMessage);

        // Kosongkan data jika API error
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Terjadi kesalahan sistem. Silakan refresh halaman.");

      // Kosongkan data
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]); // API_BASE_URL adalah dependency yang diperlukan

  // Fetch data saat komponen mount
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [fetchUsers, user]); // fetchUsers dan user sebagai dependencies

  // Filter dan search data
  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      (userItem.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (userItem.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (userItem.username?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (userItem.phone || "").includes(searchTerm);

    const matchesRole = filterRole === "all" || userItem.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(
        `${API_BASE_URL}/users/${id}`,
        config,
      );

      if (response.data.success) {
        // Update state setelah delete
        setUsers(users.filter((userItem) => userItem.id !== id));
        setDeleteModal({ show: false, id: null, name: "" });
        alert("User berhasil dihapus!");
      } else {
        alert(response.data.message || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Gagal menghapus user. Silakan coba lagi.";
      alert(errorMsg);
    }
  };

  // Reset password
  const handleResetPassword = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin mereset password user ini?")) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.post(
          `${API_BASE_URL}/users/${userId}/reset-password`,
          {},
          config,
        );

        if (response.data.success) {
          alert(
            `Password berhasil direset ke: ${
              response.data.data?.default_password || "password123"
            }`,
          );
        } else {
          alert(response.data.message || "Gagal mereset password");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        const errorMsg =
          error.response?.data?.message ||
          "Gagal mereset password. Silakan coba lagi.";
        alert(errorMsg);
      }
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#ef4444";
      case "suspended":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#8b5cf6";
      case "manager":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "manager":
        return "Manager";
      default:
        return role;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "inactive":
        return "Nonaktif";
      case "suspended":
        return "Ditangguhkan";
      default:
        return status;
    }
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
          onClick={() => navigate("/dashboard")}
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
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div style={styles.headerContent}>
              <h1 style={styles.title}>User Management</h1>
              <p style={styles.subtitle}>Kelola semua user dari tabel users</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={fetchUsers}
              style={styles.refreshButton}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} spin={loading} />
              {loading ? " Memuat..." : " Refresh"}
            </button>
            <Link to="/admin/users/create" style={styles.addButton}>
              <FontAwesomeIcon icon={faUserPlus} />
              Tambah User
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span style={{ marginLeft: "0.5rem" }}>{error}</span>
            <button onClick={fetchUsers} style={styles.retryButton}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Search dan Filter */}
        <div style={styles.toolbar}>
          <div style={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari user (nama, email, username)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterContainer}>
            <FontAwesomeIcon icon={faFilter} style={styles.filterIcon} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Semua Role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Info Statistik */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{users.length}</div>
            <div style={styles.statLabel}>Total User</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {users.filter((u) => u.role === "admin").length}
            </div>
            <div style={styles.statLabel}>Administrator</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {users.filter((u) => u.role === "manager").length}
            </div>
            <div style={styles.statLabel}>Manager</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {users.filter((u) => u.status === "active").length}
            </div>
            <div style={styles.statLabel}>Aktif</div>
          </div>
        </div>

        {/* Tabel Data */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingTable}>
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                style={{ fontSize: "2rem", color: "#3b82f6" }}
              />
              <p>Memuat data user...</p>
              {/* <p style={styles.loadingSubtext}>
                                Menghubungkan ke: {API_BASE_URL}/users
                            </p> */}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <FontAwesomeIcon icon={faUsers} style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>
                {searchTerm || filterRole !== "all"
                  ? "Tidak ada user yang sesuai dengan filter"
                  : "Tabel users kosong di database"}
              </h3>
              <p style={styles.emptyText}>
                {searchTerm || filterRole !== "all"
                  ? "Coba ubah kata kunci pencarian atau filter role."
                  : "Belum ada data user di database. Mulai dengan menambahkan user baru."}
              </p>
              {!searchTerm && filterRole === "all" && (
                <Link to="/admin/users/create" style={styles.emptyButton}>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Tambah User Pertama
                </Link>
              )}
            </div>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Nama User</th>
                    <th style={styles.tableHeader}>Username</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Outlet ID</th>
                    <th style={styles.tableHeader}>Role</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Tanggal Buat</th>
                    <th style={styles.tableHeader}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((userItem) => (
                    <tr key={userItem.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.userCell}>
                          <div style={styles.userAvatar}>
                            {userItem.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div style={styles.userInfoCell}>
                            <div style={styles.userName}>
                              {userItem.name || "-"}
                            </div>
                            <div style={styles.userPhone}>
                              {userItem.phone || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.usernameText}>
                          {userItem.username || "-"}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.emailText}>
                          {userItem.email || "-"}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.outletIdCell}>
                          <FontAwesomeIcon
                            icon={faBuilding}
                            style={styles.outletIcon}
                          />
                          <span>{userItem.outlet_id || "Tidak ada"}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.roleBadge,
                            backgroundColor: getRoleColor(userItem.role),
                          }}
                        >
                          {getRoleLabel(userItem.role)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(
                              userItem.status || "active",
                            ),
                          }}
                        >
                          {getStatusLabel(userItem.status)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(userItem.created_at)}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleResetPassword(userItem.id)}
                            style={styles.resetButton}
                            title="Reset Password"
                          >
                            <FontAwesomeIcon icon={faKey} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/users/${userItem.id}`)
                            }
                            style={styles.viewButton}
                            title="Lihat Detail"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/users/edit/${userItem.id}`)
                            }
                            style={styles.editButton}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                id: userItem.id,
                                name: userItem.name,
                              })
                            }
                            style={styles.deleteButton}
                            title="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrash} />
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
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    style={styles.paginationButton}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Sebelumnya
                  </button>

                  <div style={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            ...styles.pageButton,
                            ...(currentPage === pageNum &&
                              styles.activePageButton),
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    style={styles.paginationButton}
                  >
                    Selanjutnya
                    <FontAwesomeIcon icon={faChevronRight} />
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
                Apakah Anda yakin ingin menghapus user{" "}
                <strong>{deleteModal.name}</strong>?
              </p>
              <p style={styles.warningText}>
                Tindakan ini tidak dapat dibatalkan. Semua data terkait user ini
                akan hilang.
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
    backgroundColor: "#8b5cf6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
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
    fontSize: "0.95rem",
  },
  headerRight: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  refreshButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
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
  addButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
    justifyContent: "space-between",
    fontWeight: "500",
  },
  retryButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    marginLeft: "1rem",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#b91c1c",
    },
  },
  dataStatus: {
    margin: "0 2rem 1rem 2rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "8px",
    fontSize: "0.9rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dataStatusText: {
    fontWeight: "500",
  },
  noDataWarning: {
    color: "#dc2626",
    fontWeight: "600",
  },
  toolbar: {
    padding: "1.5rem 2rem",
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
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "all 0.2s",
    "&:focus": {
      outline: "none",
      borderColor: "#8b5cf6",
      boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
    },
  },
  filterContainer: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  filterIcon: {
    color: "#6b7280",
  },
  filterSelect: {
    padding: "0.75rem 1rem",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    backgroundColor: "white",
    cursor: "pointer",
    minWidth: "150px",
    "&:focus": {
      outline: "none",
      borderColor: "#8b5cf6",
    },
  },
  statsContainer: {
    padding: "1.5rem 2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "500",
  },
  tableContainer: {
    padding: "2rem",
    minHeight: "400px",
  },
  loadingTable: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    textAlign: "center",
    color: "#64748b",
  },
  loadingSubtext: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    marginTop: "0.5rem",
    fontFamily: "monospace",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "4rem",
    color: "#d1d5db",
    marginBottom: "1.5rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "0.75rem",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#64748b",
    marginBottom: "2rem",
    maxWidth: "400px",
  },
  emptyButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#7c3aed",
    },
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 0.75rem",
  },
  tableHeader: {
    padding: "1rem",
    textAlign: "left",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "0.85rem",
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
    padding: "1.25rem 1rem",
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
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#8b5cf6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  userInfoCell: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "0.25rem",
  },
  userPhone: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  usernameText: {
    color: "#374151",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  emailText: {
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  outletIdCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#374151",
    fontSize: "0.9rem",
  },
  outletIcon: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  roleBadge: {
    display: "inline-block",
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    color: "white",
    fontWeight: "600",
    fontSize: "0.75rem",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.3rem 0.8rem",
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
  resetButton: {
    padding: "0.5rem",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#d97706",
    },
  },
  viewButton: {
    padding: "0.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },
  editButton: {
    padding: "0.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#059669",
    },
  },
  deleteButton: {
    padding: "0.5rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e2e8f0",
  },
  paginationButton: {
    padding: "0.75rem 1.25rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
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
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  activePageButton: {
    backgroundColor: "#8b5cf6",
    color: "white",
    borderColor: "#8b5cf6",
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
    fontSize: "1.5rem",
    color: "#dc2626",
  },
  modalTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  modalBody: {
    padding: "1.5rem",
    color: "#4b5563",
    lineHeight: "1.6",
  },
  warningText: {
    color: "#dc2626",
    fontWeight: "500",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  modalFooter: {
    padding: "1.5rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
  },
  modalCancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#e5e7eb",
    },
  },
  modalDeleteButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#b91c1c",
    },
  },
};

export default UserManagement;

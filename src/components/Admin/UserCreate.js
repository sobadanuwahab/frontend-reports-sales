import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faTimes,
    faUserPlus,
    faUser,
    faEnvelope,
    faPhone,
    faKey,
    faBuilding,
    faUserTag,
    faCheckCircle,
    faExclamationCircle,
    faSpinner,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const UserCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        password_confirmation: "",
        phone: "",
        outlet_id: "",
        role: "manager",
        status: "active",
    });

    const [outlets, setOutlets] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

    // Cek authorization
    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/unauthorized");
        }
    }, [user, navigate]);

    // Gunakan useCallback untuk fetchOutlets
    const fetchOutlets = useCallback(async () => {
        try {
            setIsLoadingOutlets(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setStatusMessage(
                    "Token tidak ditemukan. Silakan login kembali."
                );
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

            // FILTER: Ambil hanya nama_outlet yang unik
            const uniqueOutlets = [];
            const seenNames = new Set();

            outletsData.forEach((outlet) => {
                if (outlet.nama_outlet && !seenNames.has(outlet.nama_outlet)) {
                    seenNames.add(outlet.nama_outlet);
                    uniqueOutlets.push({
                        id: outlet.id,
                        nama_outlet: outlet.nama_outlet,
                    });
                }
            });

            // Urutkan berdasarkan nama
            uniqueOutlets.sort((a, b) =>
                a.nama_outlet.localeCompare(b.nama_outlet)
            );

            setOutlets(uniqueOutlets);
            console.log("Data outlets (unik):", uniqueOutlets);
        } catch (error) {
            console.error("Error fetching outlets:", error);
            setStatusMessage("Gagal mengambil data outlet. Silakan coba lagi.");
            setOutlets([]);
        } finally {
            setIsLoadingOutlets(false);
        }
    }, [API_BASE_URL]); // Tambahkan API_BASE_URL sebagai dependency

    // Fetch outlets saat komponen mount dan ketika fetchOutlets berubah
    useEffect(() => {
        if (user && user.role === "admin") {
            fetchOutlets();
        }
    }, [fetchOutlets, user]); // Tambahkan fetchOutlets dan user sebagai dependencies

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (name === "email" && !formData.username && value.includes("@")) {
            const username = value.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
            if (username.length >= 3) {
                setFormData((prev) => ({
                    ...prev,
                    username: username.toLowerCase(),
                }));
            }
        }

        if (!formData.password && !formData.password_confirmation) {
            const defaultPassword = "password123";
            setFormData((prev) => ({
                ...prev,
                password: defaultPassword,
                password_confirmation: defaultPassword,
            }));
        }
    };

    // ... (fungsi-fungsi lainnya tetap sama)
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nama lengkap wajib diisi";
        } else if (formData.name.length > 255) {
            newErrors.name = "Nama maksimal 255 karakter";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email wajib diisi";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username wajib diisi";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username minimal 3 karakter";
        }

        if (!formData.password) {
            newErrors.password = "Password wajib diisi";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password wajib diisi";
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = "Password tidak cocok";
        }

        if (!formData.outlet_id) {
            newErrors.outlet_id = "Outlet wajib dipilih";
        }

        if (!formData.role) {
            newErrors.role = "Role wajib dipilih";
        } else if (!["admin", "manager"].includes(formData.role)) {
            newErrors.role = "Role harus admin atau manager";
        }

        if (
            formData.status &&
            !["active", "inactive", "suspended"].includes(formData.status)
        ) {
            newErrors.status = "Status tidak valid";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateRandomPassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setFormData((prev) => ({
            ...prev,
            password: password,
            password_confirmation: password,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSubmitStatus(null);
        setStatusMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error(
                    "Token tidak ditemukan. Silakan login kembali."
                );
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                username: formData.username.trim(),
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                phone: formData.phone ? formData.phone.trim() : "",
                outlet_id: parseInt(formData.outlet_id),
                role: formData.role,
                status: formData.status,
                email_verified_at: new Date().toISOString(),
            };

            console.log("Membuat user dengan data:", payload);

            const response = await axios.post(
                `${API_BASE_URL}/users`,
                payload,
                config
            );

            console.log("Response dari API:", response.data);

            if (response.data.success) {
                setSubmitStatus("success");
                setStatusMessage("User berhasil dibuat!");

                setTimeout(() => {
                    setFormData({
                        name: "",
                        email: "",
                        username: "",
                        password: "",
                        password_confirmation: "",
                        phone: "",
                        outlet_id: "",
                        role: "manager",
                        status: "active",
                    });

                    setTimeout(() => {
                        navigate("/admin/users");
                    }, 2000);
                }, 1500);
            } else {
                throw new Error(response.data.message || "Gagal membuat user");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            console.error("Error details:", error.response?.data);

            setSubmitStatus("error");

            if (error.response) {
                if (
                    error.response.status === 422 &&
                    error.response.data.errors
                ) {
                    const backendErrors = error.response.data.errors;
                    const formattedErrors = {};

                    Object.keys(backendErrors).forEach((key) => {
                        formattedErrors[key] = backendErrors[key][0];
                    });

                    setErrors(formattedErrors);
                    setStatusMessage(
                        "Mohon periksa kembali data yang dimasukkan"
                    );
                } else if (error.response.status === 401) {
                    setStatusMessage(
                        "Sesi telah berakhir. Silakan login kembali."
                    );
                } else if (error.response.status === 403) {
                    setStatusMessage(
                        "Anda tidak memiliki izin untuk melakukan aksi ini"
                    );
                } else if (error.response.data?.message) {
                    setStatusMessage(error.response.data.message);
                } else {
                    setStatusMessage("Terjadi kesalahan saat membuat user");
                }
            } else if (error.request) {
                setStatusMessage(
                    "Tidak dapat terhubung ke server. Periksa koneksi Anda dan pastikan server Laravel berjalan."
                );
            } else {
                setStatusMessage(error.message || "Terjadi kesalahan");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/users");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

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
                <div style={styles.header}>
                    <div style={styles.headerIcon}>
                        <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>Tambah User Baru</h1>
                        <p style={styles.subtitle}>
                            Isi formulir di bawah untuk menambahkan user baru ke
                            sistem
                        </p>
                        <p style={styles.databaseInfo}>
                            * Semua field wajib diisi kecuali nomor telepon
                        </p>
                    </div>
                </div>

                {submitStatus && (
                    <div
                        style={{
                            ...styles.statusAlert,
                            backgroundColor:
                                submitStatus === "success"
                                    ? "#d1fae5"
                                    : "#fee2e2",
                            color:
                                submitStatus === "success"
                                    ? "#065f46"
                                    : "#dc2626",
                            borderColor:
                                submitStatus === "success"
                                    ? "#a7f3d0"
                                    : "#fca5a5",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={
                                submitStatus === "success"
                                    ? faCheckCircle
                                    : faExclamationCircle
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                        {/* Nama Lengkap */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faUser}
                                    style={styles.labelIcon}
                                />
                                Nama Lengkap *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Masukkan nama lengkap"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.name
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                disabled={isLoading}
                                maxLength="255"
                            />
                            {errors.name && (
                                <p style={styles.errorText}>{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    style={styles.labelIcon}
                                />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="contoh@email.com"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.email
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p style={styles.errorText}>{errors.email}</p>
                            )}
                        </div>

                        {/* Username */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faUser}
                                    style={styles.labelIcon}
                                />
                                Username *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Masukkan username unik"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.username
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                disabled={isLoading}
                            />
                            {errors.username && (
                                <p style={styles.errorText}>
                                    {errors.username}
                                </p>
                            )}
                            <p style={styles.helperText}>
                                Username untuk login ke sistem (unik)
                            </p>
                        </div>

                        {/* Phone */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    style={styles.labelIcon}
                                />
                                Nomor Telepon (Opsional)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="08xxxxxxxxxx"
                                style={styles.input}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Outlet - WAJIB */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faBuilding}
                                    style={styles.labelIcon}
                                />
                                Outlet *
                            </label>
                            {isLoadingOutlets ? (
                                <div style={styles.loadingSelect}>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    <span style={{ marginLeft: "0.5rem" }}>
                                        Memuat data outlet...
                                    </span>
                                </div>
                            ) : outlets.length === 0 ? (
                                <div style={styles.noDataSelect}>
                                    Tidak ada data outlet. Silakan tambahkan
                                    outlet terlebih dahulu.
                                </div>
                            ) : (
                                <select
                                    name="outlet_id"
                                    value={formData.outlet_id}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.select,
                                        borderColor: errors.outlet_id
                                            ? "#ef4444"
                                            : "#d1d5db",
                                    }}
                                    disabled={isLoading}
                                    required
                                >
                                    <option value="">-- Pilih Outlet --</option>
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
                            {errors.outlet_id && (
                                <p style={styles.errorText}>
                                    {errors.outlet_id}
                                </p>
                            )}
                            <p style={styles.helperText}>
                                Pilih outlet tempat user akan ditugaskan
                            </p>
                        </div>

                        {/* Role */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faUserTag}
                                    style={styles.labelIcon}
                                />
                                Role *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.select,
                                    borderColor: errors.role
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                disabled={isLoading}
                            >
                                <option value="admin">Administrator</option>
                                <option value="manager">Manager</option>
                            </select>
                            {errors.role && (
                                <p style={styles.errorText}>{errors.role}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faUserTag}
                                    style={styles.labelIcon}
                                />
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                style={styles.select}
                                disabled={isLoading}
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                                <option value="suspended">Ditangguhkan</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faKey}
                                    style={styles.labelIcon}
                                />
                                Password *
                            </label>
                            <div style={styles.passwordInputGroup}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan password"
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.password
                                            ? "#ef4444"
                                            : "#d1d5db",
                                        paddingRight: "90px",
                                    }}
                                    disabled={isLoading}
                                />
                                <div style={styles.passwordButtons}>
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        style={styles.passwordToggle}
                                        aria-label={
                                            showPassword
                                                ? "Sembunyikan password"
                                                : "Tampilkan password"
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showPassword
                                                    ? faEyeSlash
                                                    : faEye
                                            }
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        style={styles.generateButton}
                                        disabled={isLoading}
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                            {errors.password && (
                                <p style={styles.errorText}>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faKey}
                                    style={styles.labelIcon}
                                />
                                Konfirmasi Password *
                            </label>
                            <div style={styles.passwordInputGroup}>
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    placeholder="Ulangi password"
                                    style={{
                                        ...styles.input,
                                        borderColor:
                                            errors.password_confirmation
                                                ? "#ef4444"
                                                : "#d1d5db",
                                        paddingRight: "40px",
                                    }}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    style={styles.passwordToggle}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Sembunyikan password"
                                            : "Tampilkan password"
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={
                                            showConfirmPassword
                                                ? faEyeSlash
                                                : faEye
                                        }
                                    />
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p style={styles.errorText}>
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={styles.previewSection}>
                        <h3 style={styles.previewTitle}>Preview User</h3>
                        <div style={styles.previewGrid}>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Nama:</span>
                                <span style={styles.previewValue}>
                                    {formData.name || "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Email:</span>
                                <span style={styles.previewValue}>
                                    {formData.email || "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>
                                    Username:
                                </span>
                                <span style={styles.previewValue}>
                                    {formData.username || "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Outlet:</span>
                                <span style={styles.previewValue}>
                                    {formData.outlet_id
                                        ? outlets.find(
                                              (o) =>
                                                  o.id ===
                                                  parseInt(formData.outlet_id)
                                          )?.nama_outlet || "-"
                                        : "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Role:</span>
                                <span style={styles.previewValue}>
                                    {formData.role === "admin"
                                        ? "Administrator"
                                        : "Manager"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Status:</span>
                                <span
                                    style={{
                                        ...styles.previewValue,
                                        color:
                                            formData.status === "active"
                                                ? "#10b981"
                                                : formData.status === "inactive"
                                                ? "#ef4444"
                                                : "#f59e0b",
                                        fontWeight: "600",
                                    }}
                                >
                                    {formData.status === "active"
                                        ? "Aktif"
                                        : formData.status === "inactive"
                                        ? "Nonaktif"
                                        : "Ditangguhkan"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div style={styles.formActions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={styles.cancelButton}
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Batal
                        </button>
                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        spin
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon
                                        icon={faSave}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    Simpan User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
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
        padding: "2rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
    },
    headerIcon: {
        width: "60px",
        height: "60px",
        borderRadius: "12px",
        backgroundColor: "#8b5cf6",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        marginBottom: "1rem",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        margin: "0 0 0.5rem 0",
        color: "#1e293b",
        fontSize: "1.75rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: "0 0 0.25rem 0",
        color: "#64748b",
        fontSize: "0.95rem",
    },
    databaseInfo: {
        margin: 0,
        color: "#ef4444",
        fontSize: "0.85rem",
        fontWeight: "500",
        backgroundColor: "#fef2f2",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        display: "inline-block",
    },
    statusAlert: {
        margin: "1.5rem 2rem",
        padding: "1rem",
        borderRadius: "8px",
        borderLeft: "4px solid",
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
    },
    form: {
        padding: "2rem",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
    },
    formGroup: {
        marginBottom: "1.5rem",
    },
    label: {
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        fontWeight: "600",
        color: "#374151",
        fontSize: "0.95rem",
    },
    labelIcon: {
        marginRight: "0.5rem",
        fontSize: "0.9rem",
        color: "#6b7280",
    },
    passwordInputGroup: {
        position: "relative",
    },
    passwordButtons: {
        position: "absolute",
        right: "0.5rem",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        gap: "0.25rem",
    },
    input: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        boxSizing: "border-box",
        fontFamily: "inherit",
        "&:focus": {
            outline: "none",
            borderColor: "#8b5cf6",
            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
        },
    },
    passwordToggle: {
        background: "transparent",
        border: "none",
        color: "#6b7280",
        cursor: "pointer",
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.9rem",
    },
    select: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        boxSizing: "border-box",
        fontFamily: "inherit",
        cursor: "pointer",
        "&:focus": {
            outline: "none",
            borderColor: "#8b5cf6",
            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
        },
    },
    loadingSelect: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        backgroundColor: "#f9fafb",
        color: "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    noDataSelect: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        backgroundColor: "#f9fafb",
        color: "#9ca3af",
        textAlign: "center",
        fontStyle: "italic",
    },
    generateButton: {
        padding: "0.25rem 0.5rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.2s",
        fontWeight: "500",
        whiteSpace: "nowrap",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    errorText: {
        margin: "0.5rem 0 0 0",
        color: "#ef4444",
        fontSize: "0.85rem",
        fontWeight: "500",
    },
    helperText: {
        margin: "0.5rem 0 0 0",
        color: "#6b7280",
        fontSize: "0.85rem",
        fontStyle: "italic",
    },
    previewSection: {
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "2rem",
    },
    previewTitle: {
        fontSize: "1.1rem",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "1rem",
    },
    previewGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
    },
    previewItem: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
    previewLabel: {
        fontSize: "0.85rem",
        color: "#6b7280",
        fontWeight: "500",
    },
    previewValue: {
        fontSize: "0.95rem",
        color: "#374151",
        fontWeight: "400",
    },
    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        paddingTop: "2rem",
        borderTop: "1px solid #e2e8f0",
    },
    cancelButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    submitButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#8b5cf6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#7c3aed",
        },
    },
};

export default UserCreate;

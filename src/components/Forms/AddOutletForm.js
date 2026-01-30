import React, { useState } from "react";
import {
    Plus,
    Briefcase,
    Hash,
    Tag,
    Save,
    X,
    Coffee,
    Award,
    Clock,
    User,
    Lock,
    Shield,
} from "react-feather";

const AddOutletForm = ({ onAdd, onCancel }) => {
    const [formData, setFormData] = useState({
        kode_outlet: "",
        nama_outlet: "",
        lob: "Cafe",
        class: "B",
        username: "",
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generateLogin, setGenerateLogin] = useState(true);

    // LOB options sesuai dengan database baru
    const lobOptions = [
        {
            value: "Cafe",
            label: "Cafe",
            color: "#8b5cf6",
            icon: <Coffee size={14} />,
        },
        {
            value: "Premiere",
            label: "Premiere",
            color: "#3b82f6",
            icon: <Award size={14} />,
        },
        {
            value: "Hello Sunday",
            label: "Hello Sunday",
            color: "#10b981",
            icon: <Clock size={14} />,
        },
    ];

    // Class options
    const classOptions = [
        { value: "A", label: "Class A", color: "#10b981" },
        { value: "B", label: "Class B", color: "#f59e0b" },
        { value: "C", label: "Class C", color: "#ef4444" },
    ];

    // Fungsi untuk generate username dari kode outlet
    const generateUsername = (kodeOutlet) => {
        return kodeOutlet.toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    // Fungsi untuk generate password random
    const generateRandomPassword = () => {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.kode_outlet.trim()) {
            newErrors.kode_outlet = "Kode outlet wajib diisi";
        } else if (formData.kode_outlet.length < 3) {
            newErrors.kode_outlet = "Kode outlet minimal 3 karakter";
        }

        if (!formData.nama_outlet.trim()) {
            newErrors.nama_outlet = "Nama outlet wajib diisi";
        } else if (formData.nama_outlet.length < 3) {
            newErrors.nama_outlet = "Nama outlet minimal 3 karakter";
        }

        if (!formData.lob) {
            newErrors.lob = "LOB wajib dipilih";
        }

        if (!formData.class) {
            newErrors.class = "Class wajib dipilih";
        }

        // Validasi login credentials jika generateLogin false
        if (!generateLogin) {
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

            if (formData.password !== formData.confirm_password) {
                newErrors.confirm_password = "Password tidak cocok";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Format data sesuai dengan struktur database
            const formattedData = {
                kode_outlet: formData.kode_outlet.trim(),
                nama_outlet: formData.nama_outlet.trim(),
                lob: formData.lob,
                class: formData.class,
                ...(generateLogin
                    ? {
                          username: generateUsername(formData.kode_outlet),
                          password: generateRandomPassword(),
                      }
                    : {
                          username: formData.username.trim(),
                          password: formData.password,
                      }),
            };

            await onAdd(formattedData);
            // Reset form after successful submission
            setFormData({
                kode_outlet: "",
                nama_outlet: "",
                lob: "Cafe",
                class: "B",
                username: "",
                password: "",
                confirm_password: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error adding outlet:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        const newFormData = {
            ...formData,
            [field]: value,
        };

        // Jika kode outlet berubah dan generateLogin aktif, update username
        if (field === "kode_outlet" && generateLogin && !formData.username) {
            newFormData.username = generateUsername(value);
        }

        setFormData(newFormData);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleReset = () => {
        setFormData({
            kode_outlet: "",
            nama_outlet: "",
            lob: "Cafe",
            class: "B",
            username: "",
            password: "",
            confirm_password: "",
        });
        setErrors({});
    };

    const toggleGenerateLogin = () => {
        const newGenerateLogin = !generateLogin;
        setGenerateLogin(newGenerateLogin);

        if (newGenerateLogin) {
            // Jika mengaktifkan generate otomatis
            setFormData((prev) => ({
                ...prev,
                username: generateUsername(prev.kode_outlet),
                password: "",
                confirm_password: "",
            }));
        } else {
            // Jika menonaktifkan generate otomatis
            setFormData((prev) => ({
                ...prev,
                username: "",
                password: "",
                confirm_password: "",
            }));
        }
    };

    // Get selected LOB color and icon
    const getSelectedLob = () => {
        const selected = lobOptions.find((opt) => opt.value === formData.lob);
        return selected || lobOptions[0];
    };

    // Get selected Class color
    const getSelectedClass = () => {
        const selected = classOptions.find(
            (opt) => opt.value === formData.class
        );
        return selected || classOptions[1]; // Default B
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerIcon}>
                    <Plus size={24} />
                </div>
                <div>
                    <h1 style={styles.title}>Tambah Outlet Baru</h1>
                    <p style={styles.subtitle}>
                        Isi formulir di bawah untuk menambahkan outlet baru
                        dengan akses login
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                    {/* Informasi Outlet Section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <Briefcase
                                size={18}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Informasi Outlet
                        </h3>

                        {/* Kode Outlet Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <Hash
                                    size={16}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Kode Outlet
                                <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.kode_outlet}
                                onChange={(e) =>
                                    handleInputChange(
                                        "kode_outlet",
                                        e.target.value
                                    )
                                }
                                placeholder="Contoh: CAF001"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.kode_outlet
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                maxLength="20"
                            />
                            {errors.kode_outlet && (
                                <p style={styles.errorText}>
                                    {errors.kode_outlet}
                                </p>
                            )}
                            <p style={styles.helperText}>
                                Kode unik untuk identifikasi outlet
                            </p>
                        </div>

                        {/* Nama Outlet Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <Tag
                                    size={16}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Nama Outlet
                                <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nama_outlet}
                                onChange={(e) =>
                                    handleInputChange(
                                        "nama_outlet",
                                        e.target.value
                                    )
                                }
                                placeholder="Contoh: Cafe Grand Indonesia"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.nama_outlet
                                        ? "#ef4444"
                                        : "#d1d5db",
                                }}
                                maxLength="100"
                            />
                            {errors.nama_outlet && (
                                <p style={styles.errorText}>
                                    {errors.nama_outlet}
                                </p>
                            )}
                            <p style={styles.helperText}>
                                Nama lengkap outlet sesuai dengan lokasi
                            </p>
                        </div>

                        {/* LOB Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <Briefcase
                                    size={16}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Line of Business (LOB)
                                <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.lobContainer}>
                                <select
                                    value={formData.lob}
                                    onChange={(e) =>
                                        handleInputChange("lob", e.target.value)
                                    }
                                    style={{
                                        ...styles.select,
                                        borderColor: errors.lob
                                            ? "#ef4444"
                                            : "#d1d5db",
                                        color: getSelectedLob().color,
                                    }}
                                >
                                    {lobOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            style={{ color: option.color }}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.lob && (
                                <p style={styles.errorText}>{errors.lob}</p>
                            )}
                            <p style={styles.helperText}>
                                Pilih kategori bisnis outlet
                            </p>
                        </div>

                        {/* Class Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <Shield
                                    size={16}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Class
                                <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.classOptions}>
                                {classOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handleInputChange(
                                                "class",
                                                option.value
                                            )
                                        }
                                        style={{
                                            ...styles.classOption,
                                            backgroundColor:
                                                formData.class === option.value
                                                    ? option.color
                                                    : "#f3f4f6",
                                            color:
                                                formData.class === option.value
                                                    ? "white"
                                                    : option.color,
                                            borderColor: option.color,
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {errors.class && (
                                <p style={styles.errorText}>{errors.class}</p>
                            )}
                            <p style={styles.helperText}>
                                Pilih class performa outlet
                            </p>
                        </div>
                    </div>

                    {/* Login Credentials Section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <User size={18} style={{ marginRight: "0.5rem" }} />
                            Akses Login Outlet
                        </h3>

                        {/* Generate Login Option */}
                        <div style={styles.formGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={generateLogin}
                                    onChange={toggleGenerateLogin}
                                    style={styles.checkbox}
                                />
                                <span style={{ marginLeft: "0.5rem" }}>
                                    Generate username dan password otomatis
                                </span>
                            </label>
                            <p style={styles.helperText}>
                                {generateLogin
                                    ? "Username akan digenerate dari kode outlet, password random"
                                    : "Isi manual username dan password untuk outlet"}
                            </p>
                        </div>

                        {!generateLogin && (
                            <>
                                {/* Username Field */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <User
                                            size={16}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        Username
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "username",
                                                e.target.value
                                            )
                                        }
                                        placeholder="username_outlet"
                                        style={{
                                            ...styles.input,
                                            borderColor: errors.username
                                                ? "#ef4444"
                                                : "#d1d5db",
                                        }}
                                    />
                                    {errors.username && (
                                        <p style={styles.errorText}>
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <Lock
                                            size={16}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        Password
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Minimal 6 karakter"
                                        style={{
                                            ...styles.input,
                                            borderColor: errors.password
                                                ? "#ef4444"
                                                : "#d1d5db",
                                        }}
                                    />
                                    {errors.password && (
                                        <p style={styles.errorText}>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <Lock
                                            size={16}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        Konfirmasi Password
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirm_password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "confirm_password",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ulangi password"
                                        style={{
                                            ...styles.input,
                                            borderColor: errors.confirm_password
                                                ? "#ef4444"
                                                : "#d1d5db",
                                        }}
                                    />
                                    {errors.confirm_password && (
                                        <p style={styles.errorText}>
                                            {errors.confirm_password}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Preview Credentials */}
                        <div style={styles.credentialsPreview}>
                            <h4 style={styles.credentialsTitle}>
                                Preview Login:
                            </h4>
                            <div style={styles.credentialsInfo}>
                                <p>
                                    <strong>Username:</strong>{" "}
                                    {generateLogin
                                        ? generateUsername(
                                              formData.kode_outlet
                                          ) || "-"
                                        : formData.username || "-"}
                                </p>
                                <p>
                                    <strong>Password:</strong>{" "}
                                    {generateLogin
                                        ? "••••••••"
                                        : formData.password
                                        ? "••••••••"
                                        : "-"}
                                </p>
                                <p style={styles.credentialsNote}>
                                    * Informasi login akan diberikan ke outlet
                                    setelah dibuat
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Card */}
                <div style={styles.previewCard}>
                    <h3 style={styles.previewTitle}>
                        <Briefcase
                            size={20}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Preview Data Outlet
                    </h3>
                    <div style={styles.previewContent}>
                        <div style={styles.previewColumn}>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Kode:</span>
                                <span style={styles.previewValue}>
                                    {formData.kode_outlet || "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Nama:</span>
                                <span style={styles.previewValue}>
                                    {formData.nama_outlet || "-"}
                                </span>
                            </div>
                        </div>
                        <div style={styles.previewColumn}>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>LOB:</span>
                                <span
                                    style={{
                                        ...styles.lobBadge,
                                        backgroundColor:
                                            getSelectedLob().color + "20",
                                        color: getSelectedLob().color,
                                    }}
                                >
                                    {formData.lob || "-"}
                                </span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>Class:</span>
                                <span
                                    style={{
                                        ...styles.classBadge,
                                        backgroundColor:
                                            getSelectedClass().color,
                                        color: "white",
                                    }}
                                >
                                    {formData.class || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actionButtons}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            <X size={18} style={{ marginRight: "0.5rem" }} />
                            Batal
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleReset}
                        style={styles.resetButton}
                        disabled={isSubmitting}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div style={styles.spinner}></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save
                                    size={18}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Tambah Outlet
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Form Tips */}
            <div style={styles.tipsContainer}>
                <h4 style={styles.tipsTitle}>
                    <Shield size={18} style={{ marginRight: "0.5rem" }} />
                    Panduan Pengisian
                </h4>
                <ul style={styles.tipsList}>
                    <li style={styles.tipsListItem}>
                        Kode outlet harus unik dan tidak boleh sama dengan
                        outlet lain
                    </li>
                    <li style={styles.tipsListItem}>
                        Pilih LOB sesuai dengan jenis bisnis outlet
                    </li>
                    <li style={styles.tipsListItem}>
                        Class A untuk outlet premium, B untuk medium, C untuk
                        standar
                    </li>
                    <li style={styles.tipsListItem}>
                        Setiap outlet akan mendapatkan akses login untuk melihat
                        data mereka
                    </li>
                    <li style={styles.tipsListItem}>
                        Simpan informasi login dengan aman untuk diberikan ke
                        outlet
                    </li>
                </ul>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                input:focus, select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .classOption:hover:not(:disabled) {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

// Styles
const styles = {
    container: {
        padding: "1.5rem",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2rem",
        paddingBottom: "1.5rem",
        borderBottom: "2px solid #e2e8f0",
    },
    headerIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "12px",
        backgroundColor: "#3b82f6",
        color: "white",
    },
    title: {
        margin: "0",
        color: "#1e293b",
        fontSize: "1.875rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: "0.5rem 0 0 0",
        color: "#64748b",
        fontSize: "1rem",
    },
    form: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "2rem",
        marginBottom: "2rem",
    },
    section: {
        marginBottom: "1rem",
    },
    sectionTitle: {
        display: "flex",
        alignItems: "center",
        margin: "0 0 1.5rem 0",
        color: "#374151",
        fontSize: "1.125rem",
        fontWeight: "600",
        paddingBottom: "0.75rem",
        borderBottom: "2px solid #e5e7eb",
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
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        color: "#374151",
        fontSize: "0.95rem",
        cursor: "pointer",
    },
    checkbox: {
        width: "18px",
        height: "18px",
        cursor: "pointer",
    },
    required: {
        color: "#ef4444",
        marginLeft: "0.25rem",
    },
    input: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "1rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        boxSizing: "border-box",
    },
    select: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "1rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        appearance: "none",
        cursor: "pointer",
        fontWeight: "500",
    },
    classOptions: {
        display: "flex",
        gap: "0.5rem",
    },
    classOption: {
        flex: 1,
        padding: "0.5rem 0.75rem",
        border: "2px solid",
        borderRadius: "6px",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "center",
    },
    helperText: {
        margin: "0.5rem 0 0 0",
        color: "#6b7280",
        fontSize: "0.875rem",
    },
    errorText: {
        margin: "0.5rem 0 0 0",
        color: "#ef4444",
        fontSize: "0.875rem",
    },
    credentialsPreview: {
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        padding: "1rem",
        marginTop: "1rem",
    },
    credentialsTitle: {
        margin: "0 0 0.5rem 0",
        color: "#374151",
        fontSize: "0.95rem",
        fontWeight: "600",
    },
    credentialsInfo: {
        fontSize: "0.875rem",
        color: "#4b5563",
    },
    credentialsNote: {
        marginTop: "0.5rem",
        fontSize: "0.75rem",
        color: "#6b7280",
        fontStyle: "italic",
    },
    previewCard: {
        backgroundColor: "#f9fafb",
        borderRadius: "10px",
        padding: "1.5rem",
        border: "2px dashed #d1d5db",
        marginBottom: "2rem",
    },
    previewTitle: {
        display: "flex",
        alignItems: "center",
        margin: "0 0 1rem 0",
        color: "#374151",
        fontSize: "1.25rem",
        fontWeight: "600",
    },
    previewContent: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2rem",
    },
    previewColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    previewItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
    },
    previewLabel: {
        fontSize: "0.875rem",
        color: "#6b7280",
        fontWeight: "500",
        minWidth: "80px",
    },
    previewValue: {
        fontSize: "0.95rem",
        color: "#1f2937",
        fontWeight: "600",
        textAlign: "right",
        flex: 1,
    },
    lobBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.875rem",
        fontWeight: "600",
    },
    classBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.875rem",
        fontWeight: "600",
        minWidth: "50px",
        textAlign: "center",
    },
    actionButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        paddingTop: "1.5rem",
        borderTop: "2px solid #e5e7eb",
    },
    cancelButton: {
        display: "flex",
        alignItems: "center",
        padding: "0.75rem 1.5rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        backgroundColor: "white",
        color: "#4b5563",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "1rem",
    },
    resetButton: {
        padding: "0.75rem 1.5rem",
        border: "2px solid #f3f4f6",
        borderRadius: "8px",
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "1rem",
    },
    submitButton: {
        display: "flex",
        alignItems: "center",
        padding: "0.75rem 2rem",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#3b82f6",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "1rem",
    },
    spinner: {
        width: "20px",
        height: "20px",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginRight: "0.5rem",
    },
    tipsContainer: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    tipsTitle: {
        display: "flex",
        alignItems: "center",
        margin: "0 0 1rem 0",
        color: "#1e293b",
        fontSize: "1.125rem",
        fontWeight: "600",
    },
    tipsList: {
        margin: "0",
        paddingLeft: "1.5rem",
        color: "#4b5563",
        listStyleType: "disc",
    },
    tipsListItem: {
        marginBottom: "0.5rem",
        lineHeight: "1.5",
    },
};

export default AddOutletForm;

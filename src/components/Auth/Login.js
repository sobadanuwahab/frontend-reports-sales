import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  User,
  Lock,
  AlertCircle,
  BarChart,
  ShoppingBag,
  Users,
  FileText,
  Shield,
  Smartphone,
  TrendingUp,
} from "react-feather";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // Feature highlights
  const features = [
    {
      icon: <BarChart size={20} />,
      title: "Analisis Real-time",
      description:
        "Pantau performa penjualan secara live dengan dashboard interaktif",
      color: "#3b82f6",
    },
    {
      icon: <ShoppingBag size={20} />,
      title: "Kelola Outlet",
      description:
        "Kelola semua outlet dari berbagai line of business secara terpusat",
      color: "#10b981",
    },
    {
      icon: <Users size={20} />,
      title: "Manajemen User",
      description: "Atur akses pengguna dengan sistem role-based yang aman",
      color: "#8b5cf6",
    },
    {
      icon: <FileText size={20} />,
      title: "Laporan Otomatis",
      description:
        "Generate laporan harian, mingguan, dan bulanan secara otomatis",
      color: "#f59e0b",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Prediksi Sales",
      description: "Analisis trend dan prediksi penjualan dengan AI",
      color: "#ec4899",
    },
    {
      icon: <Smartphone size={20} />,
      title: "Mobile Responsive",
      description: "Akses sistem dari desktop, tablet, atau smartphone",
      color: "#06b6d4",
    },
  ];

  // Check if already logged in
  useEffect(() => {
    console.log("🔍 Checking if user is already authenticated...");

    if (isAuthenticated() && user) {
      console.log("✅ User already logged in, redirecting...");
      console.log("👤 Current user role:", user.role);

      setRedirecting(true);

      // Redirect based on role
      const redirectPath =
        location.state?.from?.pathname || getDashboardPath(user.role);

      console.log("📍 Redirecting to:", redirectPath);

      // Small delay to show loading state
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    }
  }, [isAuthenticated, user, navigate, location]);

  const getDashboardPath = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "manager":
      case "outlet":
      case "user":
        return "/user/dashboard";
      default:
        return "/login";
    }
  };

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        console.log("🔄 Testing backend connection...");
        const response = await fetch(
          "https://nonspurious-rory-nonacoustically.ngrok-free.dev/api/test",
          {
            method: "GET",
            mode: "cors",
          },
        );

        if (response.ok) {
          const data = await response.json();
          setBackendStatus("connected");
          console.log("✅ Backend connected:", data);
        } else {
          setBackendStatus("error");
          console.log("❌ Backend responded with error");
        }
      } catch (error) {
        setBackendStatus("error");
        console.log("❌ Cannot connect to backend:", error.message);
      }
    };

    testBackend();
  }, []);

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
    if (authError) setAuthError("");
  };

  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("📤 Submitting login form...");
      const result = await login(formData.username, formData.password);

      if (result.success) {
        console.log("✅ Login successful for user:", result.user);
        console.log("👤 User role:", result.user.role);

        // Force sync storage across tabs
        window.dispatchEvent(new Event("storage"));

        // Redirect immediately based on role
        const redirectPath = getDashboardPath(result.user.role);
        console.log("📍 Redirecting to:", redirectPath);

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      } else {
        console.log("❌ Login failed:", result.error);
        setAuthError(result.error || "Login gagal");
      }
    } catch (error) {
      console.error("🔥 Login error:", error);
      setAuthError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  // Button enable/disable logic
  const isButtonDisabled = isLoading || backendStatus !== "connected";

  // Show loading screen if redirecting
  if (redirecting) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>
          Anda sudah login, mengalihkan ke dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginWrapper}>
        {/* Left Column - App Information */}
        <div style={styles.leftColumn}>
          <div style={styles.appInfo}>
            <div style={styles.appHeader}>
              <div style={styles.appLogo}>
                <BarChart size={32} />
              </div>
              <h1 style={styles.appTitle}>
                <span style={{ color: "#3b82f6" }}>System</span>
                <span style={{ color: "#ffff" }}>Management</span>
                <span style={{ color: "#10b981" }}>Report</span>
              </h1>
              <p style={styles.appTagline}>
                Platform Terintegrasi Monitoring dan Analisis Performa Outlet
              </p>
            </div>

            {/* <div style={styles.statsContainer}>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}>
                                    <Database size={16} />
                                </div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>500+</div>
                                    <div style={styles.statLabel}>
                                        Outlet Terkelola
                                    </div>
                                </div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}>
                                    <Users size={16} />
                                </div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>1,200+</div>
                                    <div style={styles.statLabel}>
                                        Pengguna Aktif
                                    </div>
                                </div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statIcon}>
                                    <Clock size={16} />
                                </div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>24/7</div>
                                    <div style={styles.statLabel}>
                                        Monitoring
                                    </div>
                                </div>
                            </div>
                        </div> */}

            <div style={styles.featuresSection}>
              {/* <h3 style={styles.featuresTitle}>Fitur Unggulan</h3> */}
              <div style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <div key={index} style={styles.featureCard}>
                    <div
                      style={{
                        ...styles.featureIcon,
                        backgroundColor: feature.color + "15",
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <div style={styles.featureContent}>
                      <h4 style={styles.featureTitle}>{feature.title}</h4>
                      <p style={styles.featureDesc}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.securityInfo}>
              <div style={styles.securityHeader}>
                <Shield size={18} />
                <span style={styles.securityTitle}>Keamanan Terjamin</span>
              </div>
              <p style={styles.securityText}>
                Sistem dilengkapi dengan enkripsi end-to-end, autentikasi dua
                faktor, dan audit log untuk keamanan data perusahaan Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div style={styles.rightColumn}>
          <div style={styles.loginCard}>
            <div style={styles.loginHeader}>
              <div style={styles.loginIcon}>
                <LogIn size={28} />
              </div>
              <h2 style={styles.loginTitle}>Masuk ke Akun Anda</h2>
              <p style={styles.loginSubtitle}>
                Gunakan username dan password untuk mengakses dashboard
              </p>
            </div>

            {authError && (
              <div style={styles.alert}>
                <AlertCircle size={18} style={{ marginRight: "0.5rem" }} />
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <User size={16} style={{ marginRight: "0.5rem" }} />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Masukkan username"
                  style={{
                    ...styles.input,
                    borderColor: errors.username ? "#ef4444" : "#d1d5db",
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {errors.username && (
                  <p style={styles.errorText}>{errors.username}</p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Lock size={16} style={{ marginRight: "0.5rem" }} />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  style={{
                    ...styles.input,
                    borderColor: errors.password ? "#ef4444" : "#d1d5db",
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p style={styles.errorText}>{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: isButtonDisabled ? 0.6 : 1,
                  cursor: isButtonDisabled ? "not-allowed" : "pointer",
                }}
                disabled={isButtonDisabled}
              >
                {isLoading ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn size={18} style={{ marginRight: "0.5rem" }} />
                    Login
                  </>
                )}
              </button>

              {/* Demo Account Info */}
              {/* <div style={styles.demoInfo}>
                                <details>
                                    <summary style={styles.demoSummary}>
                                        <Info
                                            size={16}
                                            style={{ marginRight: "8px" }}
                                        />
                                        Informasi Akun Demo
                                    </summary>
                                    <div style={styles.demoContent}>
                                        <div style={styles.demoAccount}>
                                            <strong>Admin:</strong>
                                            <div>
                                                Username:{" "}
                                                <code>superadmin</code>
                                            </div>
                                            <div>
                                                Password:{" "}
                                                <code>password123</code>
                                            </div>
                                        </div>
                                        <div style={styles.demoAccount}>
                                            <strong>Manager:</strong>
                                            <div>
                                                Username: <code>TGRSERO</code>
                                            </div>
                                            <div>
                                                Password:{" "}
                                                <code>password123</code>
                                            </div>
                                        </div>
                                        <div style={styles.demoAccount}>
                                            <strong>User:</strong>
                                            <div>
                                                Username: <code>user123</code>
                                            </div>
                                            <div>
                                                Password:{" "}
                                                <code>password123</code>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div> */}

              {/* Debug Info - Only show in development */}
              {/* {process.env.NODE_ENV === "development" && (
                                <div style={styles.debugInfo}>
                                    <details>
                                        <summary style={styles.debugSummary}>
                                            Debug Information
                                        </summary>
                                        <div style={styles.debugContent}>
                                            <p>
                                                <strong>Status Auth:</strong>{" "}
                                                <span
                                                    style={{
                                                        color: isAuthenticated()
                                                            ? "#065f46"
                                                            : "#991b1b",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {isAuthenticated()
                                                        ? "TERAUTHENTIKASI"
                                                        : "BELUM LOGIN"}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>User Role:</strong>{" "}
                                                {user?.role || "Belum login"}
                                            </p>
                                            <p>
                                                <strong>Backend Status:</strong>{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            backendStatus ===
                                                            "connected"
                                                                ? "#065f46"
                                                                : "#991b1b",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {backendStatus.toUpperCase()}
                                                </span>
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            )} */}
            </form>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                © 2024 Sales Report System. All rights reserved.
                <br />
                <span style={styles.version}>v2.1.0</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }

                .feature-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }

                details[open] summary {
                    margin-bottom: 10px;
                }
            `}</style>
    </div>
  );
};

// Need to add Info icon import
const Info = ({ size, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid rgba(255, 255, 255, 0.3)",
    borderTop: "5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1.5rem",
  },
  loadingText: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    maxWidth: "400px",
    margin: "0",
  },
  loginWrapper: {
    display: "flex",
    width: "100%",
    maxWidth: "1400px",
    minHeight: "90vh",
    backgroundColor: "white",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
    animation: "fadeIn 0.5s ease",
    "@media (max-width: 1024px)": {
      flexDirection: "column",
      minHeight: "auto",
    },
  },
  leftColumn: {
    flex: "1",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    color: "white",
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    "@media (max-width: 1024px)": {
      padding: "2rem",
      minHeight: "400px",
    },
    "@media (max-width: 768px)": {
      padding: "1.5rem",
    },
  },
  rightColumn: {
    flex: "0 0 500px",
    padding: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    "@media (max-width: 1024px)": {
      flex: "1",
      padding: "2rem",
    },
    "@media (max-width: 768px)": {
      padding: "1.5rem",
    },
  },
  appInfo: {
    maxWidth: "600px",
    margin: "0 auto",
    width: "100%",
  },
  appHeader: {
    textAlign: "center",
    marginBottom: "3rem",
    "@media (max-width: 768px)": {
      marginBottom: "2rem",
    },
  },
  appLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    margin: "0 auto 1.5rem",
    boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
  },
  appTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.5px",
    lineHeight: "1.1",
    "@media (max-width: 768px)": {
      fontSize: "2rem",
    },
  },
  appTagline: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    margin: "0",
    lineHeight: "1.5",
    maxWidth: "500px",
    margin: "0 auto",
  },
  // statsContainer: {
  //     display: "grid",
  //     gridTemplateColumns: "repeat(3, 1fr)",
  //     gap: "1.5rem",
  //     marginBottom: "3rem",
  //     "@media (max-width: 768px)": {
  //         gridTemplateColumns: "repeat(3, 1fr)",
  //         gap: "1rem",
  //         marginBottom: "2rem",
  //     },
  // },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#60a5fa",
  },
  statContent: {
    flex: "1",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
    "@media (max-width: 768px)": {
      fontSize: "1.25rem",
    },
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  featuresSection: {
    marginBottom: "3rem",
  },
  featuresTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    color: "#ffffff",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease",
    cursor: "default",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-2px)",
    },
  },
  featureIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
  },
  featureContent: {
    flex: "1",
  },
  featureTitle: {
    fontSize: "0.95rem",
    fontWeight: "600",
    margin: "0 0 0.25rem 0",
    color: "#ffffff",
  },
  featureDesc: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    margin: "0",
    lineHeight: "1.4",
  },
  securityInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  securityHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  securityTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ffffff",
  },
  securityText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: "0",
    lineHeight: "1.5",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
    "@media (max-width: 768px)": {
      maxWidth: "100%",
    },
  },
  loginHeader: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  loginIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    margin: "0 auto 1rem",
    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
  },
  loginTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 0.5rem 0",
  },
  loginSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "0",
  },
  alert: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "10px",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
    borderLeft: "4px solid #dc2626",
    animation: "fadeIn 0.3s ease",
  },
  form: {
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
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "2px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxSizing: "border-box",
    fontFamily: "inherit",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  errorText: {
    margin: "0.5rem 0 0 0",
    color: "#ef4444",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "1rem",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.2s",
    marginTop: "0.5rem",
    fontFamily: "inherit",
  },
  buttonSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "0.5rem",
  },
  demoInfo: {
    marginTop: "1.5rem",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  demoSummary: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
    ":hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  demoContent: {
    padding: "1rem",
    backgroundColor: "white",
  },
  demoAccount: {
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
    ":last-child": {
      marginBottom: "0",
      paddingBottom: "0",
      borderBottom: "none",
    },
  },
  debugInfo: {
    marginTop: "1rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },
  debugSummary: {
    cursor: "pointer",
    color: "#6b7280",
    fontWeight: "600",
    fontSize: "0.85rem",
    padding: "0.5rem",
    borderRadius: "6px",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  debugContent: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    fontSize: "0.75rem",
    color: "#4b5563",
    lineHeight: "1.5",
  },
  footer: {
    textAlign: "center",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  footerText: {
    fontSize: "0.85rem",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.5",
  },
  version: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    fontFamily: "monospace",
  },
};

export default Login;

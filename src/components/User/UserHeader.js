import React, { useState, useEffect } from "react";
import { FiMenu, FiBell, FiSearch, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const UserHeader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get current page title based on route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("/user/dashboard")) return "Dashboard";
        if (path.includes("/user/reports")) return "Laporan";
        if (path.includes("/user/profile")) return "Profil";
        return "Dashboard";
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleProfileClick = () => {
        setShowUserMenu(false);
        navigate("/user/profile");
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showNotifications &&
                !event.target.closest(".notification-container")
            ) {
                setShowNotifications(false);
            }
            if (showUserMenu && !event.target.closest(".user-menu-container")) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showNotifications, showUserMenu]);

    // Get dynamic styles
    const getHeaderStyles = () => {
        const sidebarWidth = isSidebarOpen ? 220 : 70;

        return {
            header: {
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1rem 1.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "fixed",
                top: 0,
                left: isMobile ? 0 : `${sidebarWidth}px`,
                right: 0,
                zIndex: 100,
                height: "70px",
                transition: "all 0.3s ease",
                backdropFilter: "blur(8px)",
                boxSizing: "border-box",
            },
            leftSection: {
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flex: isMobile ? 1 : "none",
                minWidth: 0,
            },
            menuButton: {
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "#4b5563",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                minWidth: "40px",
                minHeight: "40px",
                flexShrink: 0,
            },
            menuButtonHover: {
                backgroundColor: "#f3f4f6",
            },
            headerTitle: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "hidden",
                flex: 1,
                minWidth: 0,
            },
            title: {
                fontSize: isMobile ? "1.1rem" : "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: isMobile ? "150px" : "300px",
            },
            subtitle: {
                fontSize: "0.75rem",
                color: "#6b7280",
                margin: "0.125rem 0 0 0",
                display: isMobile ? "none" : "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
            },
            centerSection: {
                flex: isMobile ? 0 : 1,
                maxWidth: isMobile ? "0" : "400px",
                margin: isMobile ? "0" : "0 1.5rem",
                opacity: isMobile ? 0 : 1,
                width: isMobile ? 0 : "100%",
                transition: "all 0.3s ease",
            },
            searchContainer: {
                position: "relative",
                width: "100%",
            },
            searchInput: {
                width: "100%",
                padding: "0.625rem 1rem 0.625rem 2.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "0.9rem",
                backgroundColor: "#f9fafb",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxSizing: "border-box",
            },
            searchInputFocus: {
                borderColor: "#10b981",
                backgroundColor: "white",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
            },
            searchIcon: {
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "1rem",
                pointerEvents: "none",
            },
            rightSection: {
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "0.5rem" : "0.75rem",
                marginLeft: "auto",
            },
            iconButton: {
                background: "none",
                border: "none",
                color: "#4b5563",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.3s ease",
                minWidth: "40px",
                minHeight: "40px",
            },
            iconButtonHover: {
                backgroundColor: "#f3f4f6",
            },
            notificationBadge: {
                position: "absolute",
                top: "2px",
                right: "2px",
                backgroundColor: "#ef4444",
                color: "white",
                fontSize: "0.7rem",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
            },
            userButton: {
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "none",
                border: "none",
                padding: isMobile
                    ? "0.375rem"
                    : "0.375rem 0.75rem 0.375rem 0.375rem",
                borderRadius: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minWidth: isMobile ? "40px" : "auto",
                minHeight: "40px",
            },
            userButtonHover: {
                backgroundColor: "#f3f4f6",
            },
            userAvatar: {
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #34d399)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "0.9rem",
                flexShrink: 0,
            },
            userInfo: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginRight: "0.5rem",
                overflow: "hidden",
            },
            userName: {
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#1f2937",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
            },
            userRole: {
                fontSize: "0.75rem",
                color: "#6b7280",
                margin: "0.125rem 0 0 0",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100px",
            },
            dropdown: {
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "200px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 101,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
            },
            dropdownHeader: {
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
            },
            dropdownUserInfo: {
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
            },
            dropdownUserName: {
                fontWeight: "600",
                color: "#1f2937",
                fontSize: "0.9rem",
            },
            dropdownUserEmail: {
                fontSize: "0.75rem",
                color: "#6b7280",
            },
            dropdownItem: {
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                width: "100%",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#374151",
                fontSize: "0.875rem",
                textAlign: "left",
                transition: "all 0.2s ease",
                borderBottom: "1px solid #f3f4f6",
            },
            dropdownItemHover: {
                backgroundColor: "#f9fafb",
            },
            dropdownItemLast: {
                borderBottom: "none",
            },
        };
    };

    const styles = getHeaderStyles();

    // Sample notifications
    const notifications = [
        {
            id: 1,
            message: "Data laporan berhasil diupdate",
            time: "10 menit lalu",
            read: false,
        },
        {
            id: 2,
            message: "Target bulan ini tercapai 85%",
            time: "1 jam lalu",
            read: true,
        },
    ];

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Get current time for greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat pagi";
        if (hour < 15) return "Selamat siang";
        if (hour < 18) return "Selamat sore";
        return "Selamat malam";
    };

    return (
        <header style={styles.header}>
            {/* Left Section */}
            <div style={styles.leftSection}>
                {!isMobile && (
                    <button
                        style={styles.menuButton}
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <FiMenu />
                    </button>
                )}
                <div style={styles.headerTitle}>
                    <h1 style={styles.title} title={getPageTitle()}>
                        {getPageTitle()}
                    </h1>
                    {!isMobile && (
                        <p style={styles.subtitle}>
                            {getGreeting()}, {user?.name || "User"}
                        </p>
                    )}
                </div>
            </div>

            {/* Center Section - Search (hidden on mobile) */}
            {!isMobile && (
                <div style={styles.centerSection}>
                    <div style={styles.searchContainer}>
                        <FiSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari laporan..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => {
                                e.target.style = {
                                    ...styles.searchInput,
                                    ...styles.searchInputFocus,
                                };
                            }}
                            onBlur={(e) => {
                                e.target.style = styles.searchInput;
                            }}
                            aria-label="Search"
                        />
                    </div>
                </div>
            )}

            {/* Right Section */}
            <div style={styles.rightSection}>
                {/* User Profile */}
                <div
                    style={{ position: "relative" }}
                    className="user-menu-container"
                >
                    <button
                        style={styles.userButton}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="Menu pengguna"
                        title="Menu pengguna"
                    >
                        <div style={styles.userAvatar}>
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        {!isMobile && (
                            <div style={styles.userInfo}>
                                <div
                                    style={styles.userName}
                                    title={user?.name || "User"}
                                >
                                    {user?.name || "User"}
                                </div>
                                <div
                                    style={styles.userRole}
                                    title={user?.role || "user"}
                                >
                                    {user?.role || "user"}
                                </div>
                            </div>
                        )}
                    </button>

                    {showUserMenu && (
                        <div style={styles.dropdown}>
                            <div style={styles.dropdownHeader}>
                                <div style={styles.dropdownUserInfo}>
                                    <div style={styles.dropdownUserName}>
                                        {user?.name || "User"}
                                    </div>
                                    <div style={styles.dropdownUserEmail}>
                                        {user?.email || "user@example.com"}
                                    </div>
                                </div>
                            </div>

                            <button
                                style={styles.dropdownItem}
                                onClick={handleProfileClick}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "#f9fafb")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "transparent")
                                }
                            >
                                <FiUser size={16} />
                                <span>Profil Saya</span>
                            </button>

                            <button
                                style={{
                                    ...styles.dropdownItem,
                                    ...styles.dropdownItemLast,
                                }}
                                onClick={handleLogout}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#fee2e2";
                                    e.currentTarget.style.color = "#dc2626";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    e.currentTarget.style.color = "#374151";
                                }}
                            >
                                <FiLogOut size={16} />
                                <span
                                    style={{
                                        color: "#ef4444",
                                        fontWeight: "500",
                                    }}
                                >
                                    Keluar
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default UserHeader;

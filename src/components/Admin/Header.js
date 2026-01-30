import React, { useState, useEffect } from "react";
import {
    FiBell,
    FiUser,
    FiSettings,
    FiMenu,
    FiX,
    FiLogOut,
    FiSun,
    FiMoon,
} from "react-icons/fi";
import { MdDashboard, MdNotifications } from "react-icons/md";
import { useAuth } from "../context/AuthContext"; // Import AuthContext

const Header = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
    const { user, logout } = useAuth(); // Get user from context
    const [currentTime, setCurrentTime] = useState("");
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            message: "Target achievement mencapai 95%",
            time: "10 menit lalu",
            read: false,
        },
        {
            id: 2,
            message: "Outlet baru ditambahkan",
            time: "1 jam lalu",
            read: false,
        },
        {
            id: 3,
            message: "Laporan harian telah di-generate",
            time: "2 jam lalu",
            read: true,
        },
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [hoverStates, setHoverStates] = useState({
        sidebarToggle: false,
        themeToggle: false,
        notificationBtn: false,
        userProfileBtn: false,
        viewAllBtn: false,
        logoutBtn: false,
    });

    // Update waktu real-time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            };
            setCurrentTime(now.toLocaleDateString("id-ID", options));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update setiap 1 menit

        return () => clearInterval(interval);
    }, []);

    // Initialize notification hover states
    useEffect(() => {
        const initialHoverStates = {};
        notifications.forEach((notification) => {
            initialHoverStates[notification.id] = false;
        });
        // setNotificationHoverStates(initialHoverStates);
    }, [notifications]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        if (newDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    };

    // Handle notification click
    const handleNotificationClick = (id) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    // Count unread notifications
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    // Handle logout
    const handleLogout = () => {
        logout();
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const notificationContainer = document.querySelector(
                ".notification-container"
            );
            const userProfileContainer = document.querySelector(
                ".user-profile-container"
            );

            if (
                showNotifications &&
                notificationContainer &&
                !notificationContainer.contains(event.target)
            ) {
                setShowNotifications(false);
            }
            if (
                showUserMenu &&
                userProfileContainer &&
                !userProfileContainer.contains(event.target)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showNotifications, showUserMenu]);

    // Handle hover states
    const handleMouseEnter = (element) => {
        setHoverStates((prev) => ({ ...prev, [element]: true }));
    };

    const handleMouseLeave = (element) => {
        setHoverStates((prev) => ({ ...prev, [element]: false }));
    };

    // Styles - Simplified untuk admin dashboard
    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 1.5rem",
            height: "70px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: "1000",
        },
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
        },
        sidebarToggle: {
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "6px",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        sidebarToggleHover: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        logoContainer: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
        },
        logoText: {
            fontSize: "1.2rem",
            fontWeight: "600",
            margin: "0",
        },
        headerCenter: {
            flex: 1,
            textAlign: "center",
            padding: "0 1rem",
        },
        currentDate: {
            fontSize: "0.9rem",
            fontWeight: "500",
        },
        headerRight: {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
        },
        themeToggle: {
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "50%",
            transition: "all 0.3s ease",
        },
        themeToggleHover: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        notificationBtn: {
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "50%",
            position: "relative",
            transition: "all 0.3s ease",
        },
        notificationBtnHover: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        notificationBadge: {
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "#ef4444",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "600",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        userProfileBtn: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "white",
            padding: "0.375rem 0.75rem",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        userProfileBtnHover: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        userAvatar: {
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
        },
        userName: {
            fontSize: "0.9rem",
            fontWeight: "500",
        },
        userRole: {
            fontSize: "0.75rem",
            opacity: "0.9",
        },
        dropdown: {
            position: "absolute",
            top: "60px",
            right: "1rem",
            width: "250px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: "1001",
            overflow: "hidden",
        },
        dropdownItem: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            color: "#334155",
            textDecoration: "none",
            border: "none",
            background: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            transition: "background-color 0.3s",
        },
        dropdownItemHover: {
            backgroundColor: "#f8fafc",
        },
        logoutItem: {
            color: "#ef4444",
            borderTop: "1px solid #e5e7eb",
        },
    };

    // Get user display info
    const getUserDisplayName = () => {
        return user?.name || "Admin";
    };

    const getUserRoleDisplay = () => {
        if (user?.role === "admin") return "Administrator";
        if (user?.role === "outlet") return "Outlet Manager";
        return "User";
    };

    const getUserInitial = () => {
        return user?.name?.charAt(0)?.toUpperCase() || "A";
    };

    return (
        <header style={styles.header}>
            {/* Left Section - Logo & Sidebar Toggle */}
            <div style={styles.headerLeft}>
                <button
                    style={{
                        ...styles.sidebarToggle,
                        ...(hoverStates.sidebarToggle &&
                            styles.sidebarToggleHover),
                    }}
                    onClick={toggleSidebar}
                    onMouseEnter={() => handleMouseEnter("sidebarToggle")}
                    onMouseLeave={() => handleMouseLeave("sidebarToggle")}
                    aria-label={
                        isSidebarOpen ? "Close sidebar" : "Open sidebar"
                    }
                >
                    {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>

                <div style={styles.logoContainer}>
                    <MdDashboard size={24} />
                    <h3 style={styles.logoText}>Sales Report System</h3>
                </div>
            </div>

            {/* Center Section - Current Date */}
            <div style={styles.headerCenter}>
                <div style={styles.currentDate} title={currentTime}>
                    {currentTime}
                </div>
            </div>

            {/* Right Section - User Controls */}
            <div style={styles.headerRight}>
                {/* Dark/Light Mode Toggle */}
                <button
                    style={{
                        ...styles.themeToggle,
                        ...(hoverStates.themeToggle && styles.themeToggleHover),
                    }}
                    onClick={toggleDarkMode}
                    onMouseEnter={() => handleMouseEnter("themeToggle")}
                    onMouseLeave={() => handleMouseLeave("themeToggle")}
                    title={
                        darkMode
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"
                    }
                >
                    {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>

                {/* Notifications */}
                <div
                    className="notification-container"
                    style={{ position: "relative" }}
                >
                    <button
                        style={{
                            ...styles.notificationBtn,
                            ...(hoverStates.notificationBtn &&
                                styles.notificationBtnHover),
                        }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        onMouseEnter={() => handleMouseEnter("notificationBtn")}
                        onMouseLeave={() => handleMouseLeave("notificationBtn")}
                    >
                        <FiBell size={18} />
                        {unreadNotifications > 0 && (
                            <span style={styles.notificationBadge}>
                                {unreadNotifications}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={styles.dropdown}>
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    style={{
                                        ...styles.dropdownItem,
                                        ...(!notification.read && {
                                            backgroundColor: "#f0f9ff",
                                        }),
                                    }}
                                    onClick={() =>
                                        handleNotificationClick(notification.id)
                                    }
                                >
                                    <MdNotifications />
                                    <div style={{ flex: 1, textAlign: "left" }}>
                                        <div
                                            style={{
                                                fontSize: "0.9rem",
                                                fontWeight: notification.read
                                                    ? "normal"
                                                    : "600",
                                            }}
                                        >
                                            {notification.message}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#6b7280",
                                                marginTop: "2px",
                                            }}
                                        >
                                            {notification.time}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div
                    className="user-profile-container"
                    style={{ position: "relative" }}
                >
                    <button
                        style={{
                            ...styles.userProfileBtn,
                            ...(hoverStates.userProfileBtn &&
                                styles.userProfileBtnHover),
                        }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        onMouseEnter={() => handleMouseEnter("userProfileBtn")}
                        onMouseLeave={() => handleMouseLeave("userProfileBtn")}
                    >
                        <div style={styles.userAvatar}>{getUserInitial()}</div>
                        <div style={{ textAlign: "left" }}>
                            <div style={styles.userName}>
                                {getUserDisplayName()}
                            </div>
                            <div style={styles.userRole}>
                                {getUserRoleDisplay()}
                            </div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div style={styles.dropdown}>
                            <div
                                style={{
                                    padding: "1rem",
                                    borderBottom: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {getUserDisplayName()}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    {user?.email || "admin@example.com"}
                                </div>
                            </div>

                            <button
                                style={styles.dropdownItem}
                                onClick={() => {
                                    setShowUserMenu(false);
                                    // Navigate to profile
                                }}
                            >
                                <FiUser size={16} />
                                <span>My Profile</span>
                            </button>

                            <button
                                style={styles.dropdownItem}
                                onClick={() => {
                                    setShowUserMenu(false);
                                    // Navigate to settings
                                }}
                            >
                                <FiSettings size={16} />
                                <span>Settings</span>
                            </button>

                            <button
                                style={{
                                    ...styles.dropdownItem,
                                    ...styles.logoutItem,
                                }}
                                onClick={handleLogout}
                            >
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

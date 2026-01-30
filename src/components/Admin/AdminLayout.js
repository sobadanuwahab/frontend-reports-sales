import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faHome,
    faStore,
    faUsers,
    faChartBar,
    faCog,
    faUserCircle,
    faSignOutAlt,
    faBell,
    faSearch,
    faChevronDown,
    faTimes,
    faCircle,
    faCheck,
    faExclamationTriangle,
    faCalendarAlt,
    faFileAlt,
    faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Refs untuk handle click outside
    const userMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);
    const userButtonRef = useRef(null);
    const notificationButtonRef = useRef(null);

    // Fetch user data on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // Fetch real notifications from API
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    // Handle click outside untuk dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close user menu jika klik di luar
            if (
                userMenuOpen &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(event.target)
            ) {
                setUserMenuOpen(false);
            }

            // Close notification menu jika klik di luar
            if (
                notificationMenuOpen &&
                notificationMenuRef.current &&
                !notificationMenuRef.current.contains(event.target) &&
                notificationButtonRef.current &&
                !notificationButtonRef.current.contains(event.target)
            ) {
                setNotificationMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuOpen, notificationMenuOpen]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Mock data for now
            const mockNotifications = generateMockNotifications();
            setNotifications(mockNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            const mockNotifications = generateMockNotifications();
            setNotifications(mockNotifications);
        }
    };

    const generateMockNotifications = () => {
        return [
            {
                id: 1,
                type: "report",
                title: "Laporan Baru Dikirim",
                message:
                    "Outlet Cinepolis Mall Kota telah mengirim laporan harian",
                time: "5 menit lalu",
                read: false,
                priority: "high",
                data: { outletId: 3, outletName: "Cinepolis Mall Kota" },
            },
            {
                id: 2,
                type: "target",
                title: "Target Tidak Tercapai",
                message:
                    "Outlet Plaza Indonesia belum mencapai target penjualan hari ini",
                time: "1 jam lalu",
                read: false,
                priority: "medium",
                data: {
                    outletId: 5,
                    outletName: "Plaza Indonesia",
                    achievement: 65,
                },
            },
            {
                id: 3,
                type: "system",
                title: "Pembaruan Sistem",
                message: "Versi 2.1.0 telah dirilis dengan perbaikan bug",
                time: "2 jam lalu",
                read: true,
                priority: "low",
            },
            {
                id: 4,
                type: "sales",
                title: "Pencapaian Luar Biasa",
                message:
                    "Outlet Taman Anggrek mencapai 150% dari target harian",
                time: "3 jam lalu",
                read: false,
                priority: "high",
                data: {
                    outletId: 2,
                    outletName: "Taman Anggrek",
                    achievement: 150,
                },
            },
        ];
    };

    const handleLogout = (e) => {
        e.stopPropagation(); // Mencegah event bubbling
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        navigate("/admin/profile");
        setUserMenuOpen(false);
    };

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        navigate("/admin/settings");
        setUserMenuOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        setUserMenuOpen(!userMenuOpen);
        setNotificationMenuOpen(false); // Close notification menu if open
    };

    const toggleNotificationMenu = (e) => {
        e.stopPropagation();
        setNotificationMenuOpen(!notificationMenuOpen);
        setUserMenuOpen(false); // Close user menu if open
    };

    const markNotificationAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            setNotifications(
                notifications.map((notif) =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            setNotifications(
                notifications.map((notif) => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const handleNotificationClick = (notification, e) => {
        if (e) e.stopPropagation();

        // Mark as read first
        markNotificationAsRead(notification.id);

        // Navigate based on notification type
        switch (notification.type) {
            case "report":
                if (notification.data?.outletId) {
                    navigate(
                        `/admin/reports?outlet=${notification.data.outletId}`
                    );
                } else {
                    navigate("/admin/reports");
                }
                break;
            case "target":
                if (notification.data?.outletId) {
                    navigate(
                        `/admin/dashboard?outlet=${notification.data.outletId}`
                    );
                } else {
                    navigate("/admin/dashboard");
                }
                break;
            case "sales":
                navigate("/admin/dashboard");
                break;
            default:
                break;
        }

        setNotificationMenuOpen(false);
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const navigationItems = [
        {
            path: "/admin/dashboard",
            icon: faHome,
            label: "Dashboard",
            active: location.pathname === "/admin/dashboard",
        },
        {
            path: "/admin/outlets",
            icon: faStore,
            label: "Data Outlet",
            active: location.pathname.startsWith("/admin/outlets"),
        },
        {
            path: "/admin/karyawan",
            icon: faUsers,
            label: "Data Karyawan",
            active: location.pathname.startsWith("/admin/karyawan"),
        },
        {
            path: "/admin/users",
            icon: faUsers,
            label: "User Management",
            active: location.pathname.startsWith("/admin/users"),
        },
        {
            path: "/admin/reports",
            icon: faChartBar,
            label: "Report",
            active: location.pathname.startsWith("/admin/reports"),
        },
        {
            path: "/admin/settings",
            icon: faCog,
            label: "Settings",
            active: location.pathname === "/admin/settings",
        },
    ];

    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const highPriorityNotifications = notifications.filter(
        (n) => !n.read && n.priority === "high"
    ).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case "report":
                return faFileAlt;
            case "target":
                return faChartBar;
            case "system":
                return faExclamationTriangle;
            case "sales":
                return faShoppingCart;
            case "reminder":
                return faCalendarAlt;
            default:
                return faBell;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case "report":
                return "#3b82f6";
            case "target":
                return "#f59e0b";
            case "system":
                return "#ef4444";
            case "sales":
                return "#10b981";
            case "reminder":
                return "#8b5cf6";
            default:
                return "#6b7280";
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={toggleSidebar}
                        style={styles.menuButton}
                        aria-label={
                            sidebarCollapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>

                    <div style={styles.brand}>
                        <h1 style={styles.brandTitle}>
                            {user?.name || "Admin"}
                        </h1>
                        <p style={styles.brandSubtitle}>Sales Report System</p>
                    </div>
                </div>

                <div style={styles.headerCenter}>
                    <div style={styles.searchContainer}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            style={styles.searchIcon}
                        />
                        <input
                            type="text"
                            placeholder="Cari outlet, pengguna, atau laporan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                style={styles.clearSearchButton}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.headerRight}>
                    {/* Notifications */}
                    <div style={styles.notificationsContainer}>
                        <button
                            ref={notificationButtonRef}
                            onClick={toggleNotificationMenu}
                            style={styles.notificationButton}
                            aria-expanded={notificationMenuOpen}
                        >
                            <FontAwesomeIcon icon={faBell} />
                            {unreadNotifications > 0 && (
                                <span style={styles.notificationBadge}>
                                    {unreadNotifications > 9
                                        ? "9+"
                                        : unreadNotifications}
                                </span>
                            )}
                            {highPriorityNotifications > 0 && (
                                <span style={styles.priorityIndicator}></span>
                            )}
                        </button>

                        {notificationMenuOpen && (
                            <div
                                ref={notificationMenuRef}
                                style={styles.notificationDropdown}
                            >
                                <div style={styles.notificationHeader}>
                                    <div>
                                        <h4 style={styles.notificationTitle}>
                                            Notifikasi
                                        </h4>
                                        <span style={styles.notificationCount}>
                                            {unreadNotifications} belum dibaca
                                        </span>
                                    </div>
                                    {unreadNotifications > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            style={styles.markAllReadButton}
                                        >
                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                size="xs"
                                            />
                                            <span>Tandai semua dibaca</span>
                                        </button>
                                    )}
                                </div>

                                <div style={styles.notificationList}>
                                    {notifications.length === 0 ? (
                                        <div style={styles.emptyNotifications}>
                                            <FontAwesomeIcon
                                                icon={faBell}
                                                style={styles.emptyIcon}
                                            />
                                            <p style={styles.emptyText}>
                                                Tidak ada notifikasi
                                            </p>
                                        </div>
                                    ) : (
                                        notifications
                                            .slice(0, 10)
                                            .map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    style={{
                                                        ...styles.notificationItem,
                                                        backgroundColor:
                                                            notification.read
                                                                ? "white"
                                                                : "#f0f9ff",
                                                        borderLeft: `4px solid ${getNotificationColor(
                                                            notification.type
                                                        )}`,
                                                    }}
                                                    onClick={(e) =>
                                                        handleNotificationClick(
                                                            notification,
                                                            e
                                                        )
                                                    }
                                                >
                                                    <div
                                                        style={
                                                            styles.notificationIconContainer
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={getNotificationIcon(
                                                                notification.type
                                                            )}
                                                            style={{
                                                                ...styles.notificationIcon,
                                                                color: getNotificationColor(
                                                                    notification.type
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        style={
                                                            styles.notificationContent
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.notificationHeaderRow
                                                            }
                                                        >
                                                            <strong
                                                                style={
                                                                    styles.notificationItemTitle
                                                                }
                                                            >
                                                                {
                                                                    notification.title
                                                                }
                                                            </strong>
                                                            {!notification.read && (
                                                                <span
                                                                    style={
                                                                        styles.unreadIndicator
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faCircle
                                                                        }
                                                                        size="2xs"
                                                                    />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p
                                                            style={
                                                                styles.notificationItemMessage
                                                            }
                                                        >
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                        <div
                                                            style={
                                                                styles.notificationFooterRow
                                                            }
                                                        >
                                                            <span
                                                                style={
                                                                    styles.notificationItemTime
                                                                }
                                                            >
                                                                {
                                                                    notification.time
                                                                }
                                                            </span>
                                                            {notification.priority ===
                                                                "high" && (
                                                                <span
                                                                    style={
                                                                        styles.priorityBadge
                                                                    }
                                                                >
                                                                    Penting
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>

                                {notifications.length > 10 && (
                                    <div style={styles.notificationFooter}>
                                        <button
                                            onClick={() => {
                                                navigate(
                                                    "/admin/notifications"
                                                );
                                                setNotificationMenuOpen(false);
                                            }}
                                            style={styles.viewAllButton}
                                        >
                                            Lihat semua notifikasi (
                                            {notifications.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div style={styles.userMenuContainer}>
                        <button
                            ref={userButtonRef}
                            onClick={toggleUserMenu}
                            style={styles.userButton}
                            aria-expanded={userMenuOpen}
                        >
                            <div style={styles.userInfo}>
                                <FontAwesomeIcon
                                    icon={faUserCircle}
                                    style={styles.userIcon}
                                />
                                <div style={styles.userDetails}>
                                    <span style={styles.userName}>
                                        {user?.name || "Admin"}
                                    </span>
                                    <span style={styles.userRole}>
                                        {user?.role || "Administrator"}
                                    </span>
                                </div>
                            </div>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{
                                    ...styles.chevronIcon,
                                    transform: userMenuOpen
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                }}
                            />
                        </button>

                        {userMenuOpen && (
                            <div ref={userMenuRef} style={styles.userDropdown}>
                                <div style={styles.userProfile}>
                                    <FontAwesomeIcon
                                        icon={faUserCircle}
                                        style={styles.profileIcon}
                                    />
                                    <div>
                                        <h4 style={styles.profileName}>
                                            {user?.name || "Admin"}
                                        </h4>
                                        <p style={styles.profileEmail}>
                                            {user?.email || "admin@example.com"}
                                        </p>
                                    </div>
                                </div>

                                <div style={styles.dropdownMenu}>
                                    <button
                                        onClick={handleProfileClick}
                                        style={styles.dropdownItem}
                                    >
                                        <FontAwesomeIcon icon={faUserCircle} />
                                        <span>Profil Saya</span>
                                    </button>
                                    <button
                                        onClick={handleSettingsClick}
                                        style={styles.dropdownItem}
                                    >
                                        <FontAwesomeIcon icon={faCog} />
                                        <span>Pengaturan</span>
                                    </button>
                                    <div style={styles.divider}></div>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            ...styles.dropdownItem,
                                            color: "#ef4444",
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div style={styles.mainContent}>
                {/* Sidebar */}
                <aside
                    style={{
                        ...styles.sidebar,
                        width: sidebarCollapsed ? "70px" : "250px",
                        minWidth: sidebarCollapsed ? "70px" : "250px",
                    }}
                >
                    <nav style={styles.sidebarNav}>
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                style={{
                                    ...styles.navButton,
                                    ...(item.active && styles.navButtonActive),
                                    justifyContent: sidebarCollapsed
                                        ? "center"
                                        : "flex-start",
                                }}
                                title={sidebarCollapsed ? item.label : ""}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    style={{
                                        ...styles.navIcon,
                                        marginRight: sidebarCollapsed
                                            ? 0
                                            : "12px",
                                    }}
                                />
                                {!sidebarCollapsed && (
                                    <span style={styles.navLabel}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {!sidebarCollapsed && (
                        <div style={styles.sidebarFooter}>
                            <div style={styles.systemStatus}>
                                <span style={styles.statusText}>
                                    © 2026 Danu_WebDevelopment.
                                    <br />
                                    All rights reserved
                                </span>
                            </div>
                            <p style={styles.versionText}>v2.0.0</p>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main
                    style={{
                        ...styles.content,
                        marginLeft: sidebarCollapsed ? "70px" : "250px",
                    }}
                >
                    <div style={styles.contentWrapper}>
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarCollapsed && (
                <div style={styles.mobileOverlay} onClick={toggleSidebar} />
            )}
        </div>
    );
};

// Styles tetap sama seperti sebelumnya, hanya tambah CSS untuk prevent default
const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        overflow: "hidden",
    },

    header: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "70px",
        backgroundColor: "white",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flex: 1,
    },

    menuButton: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: "1.25rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },

    brand: {
        display: "flex",
        flexDirection: "column",
    },

    brandTitle: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1e293b",
        margin: 0,
        lineHeight: 1.2,
    },

    brandSubtitle: {
        fontSize: "0.75rem",
        color: "#64748b",
        margin: 0,
    },

    headerCenter: {
        flex: 2,
        display: "flex",
        justifyContent: "center",
        maxWidth: "600px",
    },

    searchContainer: {
        position: "relative",
        width: "100%",
        maxWidth: "500px",
    },

    searchIcon: {
        position: "absolute",
        left: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        fontSize: "0.9rem",
    },

    searchInput: {
        width: "100%",
        padding: "0.75rem 1rem 0.75rem 2.5rem",
        border: "2px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "#f8fafc",
        transition: "all 0.3s ease",
        "&:focus": {
            borderColor: "#3b82f6",
            backgroundColor: "white",
            outline: "none",
        },
    },

    clearSearchButton: {
        position: "absolute",
        right: "0.75rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        fontSize: "0.8rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.25rem",
        "&:hover": {
            color: "#64748b",
        },
    },

    headerRight: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "1.5rem",
    },

    notificationsContainer: {
        position: "relative",
    },

    notificationButton: {
        position: "relative",
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: "1rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
        border: "none",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },

    notificationBadge: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        backgroundColor: "#ef4444",
        color: "white",
        fontSize: "0.7rem",
        fontWeight: "bold",
        minWidth: "20px",
        height: "20px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "0 4px",
        boxSizing: "border-box",
    },

    priorityIndicator: {
        position: "absolute",
        top: "3px",
        right: "3px",
        width: "8px",
        height: "8px",
        backgroundColor: "#f59e0b",
        borderRadius: "50%",
        border: "2px solid white",
    },

    notificationDropdown: {
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: "400px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        animation: "fadeIn 0.2s ease",
        overflow: "hidden",
        zIndex: 1100,
        maxHeight: "500px",
        display: "flex",
        flexDirection: "column",
    },

    notificationHeader: {
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
    },

    notificationTitle: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },

    notificationCount: {
        fontSize: "0.8rem",
        color: "#64748b",
        display: "block",
        marginTop: "0.25rem",
    },

    markAllReadButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.375rem 0.75rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },

    notificationList: {
        flex: 1,
        overflowY: "auto",
        maxHeight: "350px",
    },

    emptyNotifications: {
        padding: "2rem",
        textAlign: "center",
        color: "#9ca3af",
    },

    emptyIcon: {
        fontSize: "2rem",
        marginBottom: "1rem",
        opacity: 0.5,
    },

    emptyText: {
        fontSize: "0.9rem",
        margin: 0,
    },

    notificationItem: {
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #f1f5f9",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        "&:hover": {
            backgroundColor: "#f8fafc",
        },
    },

    notificationIconContainer: {
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    notificationIcon: {
        fontSize: "1rem",
    },

    notificationContent: {
        flex: 1,
        minWidth: 0,
    },

    notificationHeaderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.25rem",
    },

    notificationItemTitle: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#1e293b",
        flex: 1,
        marginRight: "0.5rem",
    },

    unreadIndicator: {
        color: "#3b82f6",
        fontSize: "0.5rem",
        marginTop: "0.25rem",
    },

    notificationItemMessage: {
        fontSize: "0.85rem",
        color: "#64748b",
        margin: "0 0 0.5rem 0",
        lineHeight: 1.4,
    },

    notificationFooterRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    notificationItemTime: {
        fontSize: "0.75rem",
        color: "#94a3b8",
    },

    priorityBadge: {
        fontSize: "0.7rem",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        padding: "0.125rem 0.5rem",
        borderRadius: "12px",
        fontWeight: "500",
    },

    notificationFooter: {
        padding: "1rem 1.25rem",
        textAlign: "center",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
    },

    viewAllButton: {
        color: "#3b82f6",
        fontSize: "0.85rem",
        fontWeight: "500",
        cursor: "pointer",
        background: "none",
        border: "none",
        "&:hover": {
            textDecoration: "underline",
        },
    },

    userMenuContainer: {
        position: "relative",
    },

    userButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "8px",
        backgroundColor: "#f1f5f9",
        transition: "all 0.3s ease",
        cursor: "pointer",
        border: "none",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },

    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },

    userIcon: {
        fontSize: "1.5rem",
        color: "#475569",
    },

    userDetails: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },

    userName: {
        fontSize: "0.9rem",
        fontWeight: "500",
        color: "#1e293b",
        whiteSpace: "nowrap",
    },

    userRole: {
        fontSize: "0.75rem",
        color: "#64748b",
        whiteSpace: "nowrap",
    },

    chevronIcon: {
        fontSize: "0.8rem",
        color: "#64748b",
        transition: "transform 0.3s ease",
    },

    userDropdown: {
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: "280px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        animation: "fadeIn 0.2s ease",
        overflow: "hidden",
        zIndex: 1100,
    },

    userProfile: {
        padding: "1.25rem",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        borderBottom: "1px solid #e2e8f0",
    },

    profileIcon: {
        fontSize: "2rem",
        color: "#475569",
    },

    profileName: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },

    profileEmail: {
        fontSize: "0.8rem",
        color: "#64748b",
        margin: "0.25rem 0 0 0",
    },

    dropdownMenu: {
        padding: "0.5rem",
    },

    dropdownItem: {
        width: "100%",
        padding: "0.75rem 1rem",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        color: "#475569",
        fontSize: "0.9rem",
        borderRadius: "6px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "none",
        background: "none",
        "&:hover": {
            backgroundColor: "#f1f5f9",
            color: "#1e293b",
        },
    },

    divider: {
        height: "1px",
        backgroundColor: "#e2e8f0",
        margin: "0.5rem 1rem",
    },

    mainContent: {
        display: "flex",
        marginTop: "70px",
        minHeight: "calc(100vh - 70px)",
    },

    sidebar: {
        position: "fixed",
        top: "70px",
        left: 0,
        bottom: 0,
        backgroundColor: "white",
        borderRight: "1px solid #e2e8f0",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "all 0.3s ease",
        zIndex: 900,
    },

    sidebarNav: {
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
    },

    navButton: {
        display: "flex",
        alignItems: "center",
        padding: "0.875rem 1.25rem",
        margin: "0.25rem 1rem",
        color: "#475569",
        fontSize: "0.95rem",
        fontWeight: "500",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        border: "none",
        background: "none",
        "&:hover": {
            backgroundColor: "#f1f5f9",
            color: "#1e293b",
        },
    },

    navButtonActive: {
        backgroundColor: "#3b82f6",
        color: "white",
        "&:hover": {
            backgroundColor: "#2563eb",
            color: "white",
        },
    },

    navIcon: {
        fontSize: "1rem",
        minWidth: "20px",
    },

    navLabel: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    sidebarFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "1rem 1.25rem",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "white",
    },

    systemStatus: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.5rem",
    },

    statusText: {
        fontSize: "0.8rem",
        textAlign: "center",
        color: "#64748b",
    },

    versionText: {
        fontSize: "0.75rem",
        color: "#008211",
        textAlign: "center",
    },

    content: {
        flex: 1,
        transition: "margin-left 0.3s ease",
        padding: "1.5rem",
        overflow: "auto",
    },

    contentWrapper: {
        maxWidth: "1800px",
        margin: "0 auto",
        width: "100%",
    },

    mobileOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 800,
    },
};

// Add CSS animations
const styleElement = document.createElement("style");
styleElement.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
    }

    button {
        cursor: pointer;
        border: none;
        background: none;
        font-family: inherit;
    }

    input:focus {
        outline: none;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;
document.head.appendChild(styleElement);

export default AdminLayout;

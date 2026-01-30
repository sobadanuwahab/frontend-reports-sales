import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faSignOutAlt,
    faChartPie,
    faStore,
    faFileAlt,
    faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const UserSidebar = ({ isOpen, toggleSidebar, isMobile, headerHeight }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isHoveredLogout, setIsHoveredLogout] = useState(false);
    const [showTooltip, setShowTooltip] = useState(null);

    // Sidebar styles untuk user
    const getSidebarStyles = () => {
        const sidebarWidth = isOpen ? 220 : 70;

        return {
            sidebar: {
                width: `${sidebarWidth}px`,
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                height: `calc(100vh - ${headerHeight}px)`,
                position: "fixed",
                left: 0,
                top: `${headerHeight}px`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 90,
                overflowY: "auto",
                overflowX: "hidden",
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "5px 0 15px rgba(0, 0, 0, 0.1)",
                transform:
                    isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
                display: "flex",
                flexDirection: "column",
            },
            sidebarContent: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 0",
            },
            sidebarHeader: {
                padding: "0 1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70px",
                height: "70px",
                position: "relative",
            },
            logoContainer: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "100%" : 0,
                transition: "all 0.3s ease",
                overflow: "hidden",
                whiteSpace: "nowrap",
                marginBottom: 0,
                textAlign: "center",
                flexDirection: "row",
                height: "auto",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            },
            logoIcon: {
                fontSize: "1.5rem",
                color: "#10b981",
            },
            sidebarTitle: {
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            },
            navContainer: {
                flex: 1,
                overflowY: "auto",
                padding: "0 0.5rem",
            },
            navGroup: {
                marginBottom: "1.5rem",
            },
            navGroupTitle: {
                padding: "0.5rem 0.75rem",
                color: "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
                transition: "all 0.3s ease",
                overflow: "hidden",
                whiteSpace: "nowrap",
            },
            navItem: {
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                color: "#cbd5e1",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                margin: "0.25rem 0",
                cursor: "pointer",
                background: "none",
                border: "none",
                width: "100%",
                textAlign: "left",
                position: "relative",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
            },
            navItemHover: {
                background: "rgba(255, 255, 255, 0.08)",
                color: "white",
            },
            navItemActive: {
                background: "linear-gradient(90deg, #10b981, #34d399)",
                color: "white",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            },
            navItemActiveHover: {
                background: "linear-gradient(90deg, #059669, #10b981)",
                color: "white",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
            },
            navIcon: {
                fontSize: "1.2rem",
                width: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.3s ease",
            },
            navLabel: {
                fontWeight: "500",
                fontSize: "0.9rem",
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
                transition: "all 0.3s ease",
                overflow: "hidden",
            },
            navTooltip: {
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#1e293b",
                color: "white",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                pointerEvents: "none",
                marginLeft: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                minWidth: "120px",
                textAlign: "center",
                animation: "fadeIn 0.2s ease-in-out",
            },
            sidebarFooter: {
                marginTop: "auto",
                padding: "1rem 0.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            },
            userInfo: {
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                position: "relative",
            },
            userAvatar: {
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "600",
                fontSize: "0.9rem",
                flexShrink: 0,
            },
            userDetails: {
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
                transition: "all 0.3s ease",
                overflow: "hidden",
            },
            userName: {
                color: "white",
                fontWeight: "600",
                fontSize: "0.85rem",
                margin: 0,
                whiteSpace: "nowrap",
            },
            userRole: {
                color: "#94a3b8",
                fontSize: "0.75rem",
                margin: "0.25rem 0 0 0",
                whiteSpace: "nowrap",
            },
            userTooltip: {
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#1e293b",
                color: "white",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                pointerEvents: "none",
                marginLeft: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                minWidth: "150px",
                animation: "fadeIn 0.2s ease-in-out",
            },
            logoutButton: {
                display: "flex",
                alignItems: "center",
                justifyContent: isOpen ? "flex-start" : "center",
                gap: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "#f87171",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem",
                width: "100%",
                transition: "all 0.3s ease",
                marginTop: "0.5rem",
                position: "relative",
            },
            logoutButtonHover: {
                backgroundColor: "rgba(220, 38, 38, 0.2)",
            },
            mobileToggle: {
                position: "fixed",
                top: `${headerHeight + 20}px`,
                left: "20px",
                zIndex: 100,
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
            },
            overlay: {
                position: "fixed",
                top: `${headerHeight}px`,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 89,
                display: isOpen && isMobile ? "block" : "none",
            },
        };
    };

    const styles = getSidebarStyles();

    // Navigation items untuk user (hanya dashboard dan laporan)
    const userNavItems = [
        {
            path: "/user/dashboard",
            icon: <FontAwesomeIcon icon={faChartPie} />,
            label: "Dashboard",
            group: "Main",
        },
        {
            path: "/user/reports",
            icon: <FontAwesomeIcon icon={faFileAlt} />,
            label: "Laporan",
            group: "Data",
        },
    ];

    // Group navigation items
    const groupedNavItems = userNavItems.reduce((groups, item) => {
        const group = item.group || "Main";
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});

    // Update active item berdasarkan location
    useEffect(() => {
        const currentPath = location.pathname;
        let foundActive = null;

        for (const item of userNavItems) {
            if (
                currentPath === item.path ||
                currentPath.startsWith(item.path + "/")
            ) {
                foundActive = item.path;
                break;
            }
        }

        setActiveItem(foundActive);
    }, [location.pathname]);

    const isActivePath = (path) => {
        return activeItem === path;
    };

    const handleLogout = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        logout();
    };

    const handleNavigation = (path, e) => {
        if (e) e.preventDefault();

        navigate(path);

        if (isMobile) {
            toggleSidebar();
        }
    };

    const handleMouseEnter = (path) => {
        if (!isActivePath(path)) {
            setHoveredItem(path);
        }

        if (!isOpen && !isMobile) {
            setShowTooltip(path);
        }
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
        setShowTooltip(null);
    };

    const renderNavItem = (item) => {
        const isActive = isActivePath(item.path);
        const isHovered = hoveredItem === item.path && !isActive;

        // Tentukan style berdasarkan kondisi
        let itemStyle = { ...styles.navItem };

        if (isActive) {
            itemStyle = {
                ...itemStyle,
                ...styles.navItemActive,
            };
        } else if (isHovered) {
            itemStyle = {
                ...itemStyle,
                ...styles.navItemHover,
            };
        }

        const showItemTooltip = showTooltip === item.path;

        return (
            <button
                key={item.path}
                style={{
                    ...itemStyle,
                    justifyContent: isOpen ? "flex-start" : "center",
                }}
                onMouseEnter={() => handleMouseEnter(item.path)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleNavigation(item.path, e)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
            >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>

                {/* Tooltip untuk menu yang collapsed */}
                {!isOpen && !isMobile && showItemTooltip && (
                    <div style={styles.navTooltip}>{item.label}</div>
                )}
            </button>
        );
    };

    const renderNavGroup = (groupName, items) => {
        return (
            <div key={groupName} style={styles.navGroup}>
                {isOpen && <div style={styles.navGroupTitle}>{groupName}</div>}
                {items.map(renderNavItem)}
            </div>
        );
    };

    // Tambahkan CSS untuk animasi
    const tooltipStyles = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-50%) translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(-50%) translateX(0);
            }
        }

        @media (max-width: 768px) {
            .nav-tooltip, .user-tooltip, .logout-tooltip {
                display: none !important;
            }
        }
    `;

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && !isOpen && (
                <button
                    style={styles.mobileToggle}
                    onClick={toggleSidebar}
                    aria-label="Open menu"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            )}

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    style={styles.overlay}
                    onClick={toggleSidebar}
                    aria-label="Close menu"
                />
            )}

            {/* Sidebar */}
            <aside style={styles.sidebar}>
                {/* Sidebar Header */}
                <div style={styles.sidebarHeader}>
                    {isOpen && (
                        <div style={styles.logoContainer}>
                            <div style={styles.logoIcon}>
                                <FontAwesomeIcon icon={faHome} />
                            </div>
                            <h3 style={styles.sidebarTitle}>User Panel</h3>
                        </div>
                    )}
                </div>

                {/* Navigation Container */}
                <div style={styles.navContainer}>
                    {Object.entries(groupedNavItems).map(([groupName, items]) =>
                        renderNavGroup(groupName, items)
                    )}
                </div>

                {/* User Info & Logout */}
                <div style={styles.sidebarFooter}>
                    {user && (
                        <div
                            style={styles.userInfo}
                            onMouseEnter={() =>
                                !isOpen && !isMobile && setShowTooltip("user")
                            }
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <div style={styles.userAvatar}>
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div style={styles.userDetails}>
                                <div style={styles.userName}>
                                    {user?.name || "User"}
                                </div>
                                <div style={styles.userRole}>User</div>
                            </div>

                            {/* Tooltip untuk user info */}
                            {!isOpen && !isMobile && showTooltip === "user" && (
                                <div style={styles.userTooltip}>
                                    <div style={{ fontWeight: "bold" }}>
                                        {user?.name || "User"}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.7rem",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        User
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        style={{
                            ...styles.logoutButton,
                            ...(isHoveredLogout && styles.logoutButtonHover),
                        }}
                        onClick={handleLogout}
                        onMouseEnter={() => {
                            setIsHoveredLogout(true);
                            setHoveredItem(null);
                            if (!isOpen && !isMobile) {
                                setShowTooltip("logout");
                            }
                        }}
                        onMouseLeave={() => {
                            setIsHoveredLogout(false);
                            setShowTooltip(null);
                        }}
                        aria-label="Logout"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Inject CSS styles */}
            <style>{tooltipStyles}</style>
        </>
    );
};

export default UserSidebar;

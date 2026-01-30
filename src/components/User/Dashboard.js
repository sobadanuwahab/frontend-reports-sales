// src/components/User/Dashboard.js
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

const UserDashboard = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle responsive sidebar
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    };

    React.useEffect(() => {
        handleResize(); // Set initial state
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const styles = {
        container: {
            display: "flex",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
        },
        mainContent: {
            flex: 1,
            marginLeft: isMobile ? 0 : sidebarOpen ? "250px" : "0",
            transition: "margin-left 0.3s ease",
        },
        content: {
            padding: isMobile ? "1rem" : "2rem",
        },
        greetingCard: {
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            marginBottom: "2rem",
        },
        greetingTitle: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1e293b",
            margin: "0 0 0.5rem 0",
        },
        greetingText: {
            color: "#64748b",
            fontSize: "1rem",
            margin: 0,
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
        },
        statCard: {
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
        },
        statTitle: {
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#64748b",
            margin: "0 0 0.5rem 0",
        },
        statValue: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#3b82f6",
            margin: 0,
        },
        recentActivity: {
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        },
        sectionTitle: {
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#1e293b",
            margin: "0 0 1rem 0",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        tableHeader: {
            borderBottom: "2px solid #e2e8f0",
            padding: "0.75rem 0",
            textAlign: "left",
            color: "#64748b",
            fontWeight: "600",
        },
        tableCell: {
            padding: "0.75rem 0",
            borderBottom: "1px solid #f1f5f9",
            color: "#475569",
        },
        emptyState: {
            textAlign: "center",
            padding: "2rem",
            color: "#94a3b8",
        },
    };

    return (
        <div style={styles.container}>
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />

            <div style={styles.mainContent}>
                <Header toggleSidebar={toggleSidebar} />

                <div style={styles.content}>
                    {/* Greeting Card */}
                    <div style={styles.greetingCard}>
                        <h1 style={styles.greetingTitle}>
                            Selamat datang, {user?.name || "User"}! 👋
                        </h1>
                        <p style={styles.greetingText}>
                            Berikut adalah ringkasan aktivitas dan statistik
                            terkini.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <h3 style={styles.statTitle}>Total Penjualan</h3>
                            <p style={styles.statValue}>Rp 12.450.000</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statTitle}>Transaksi Hari Ini</h3>
                            <p style={styles.statValue}>48</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statTitle}>
                                Pendapatan Bulan Ini
                            </h3>
                            <p style={styles.statValue}>Rp 45.670.000</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statTitle}>Outlet Aktif</h3>
                            <p style={styles.statValue}>18</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={styles.recentActivity}>
                        <h2 style={styles.sectionTitle}>Aktivitas Terbaru</h2>

                        {user?.role === "outlet" ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>
                                            Waktu
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Aktivitas
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={styles.tableCell}>
                                            10:30 AM
                                        </td>
                                        <td style={styles.tableCell}>
                                            Laporan harian dibuat
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        "#10b98120",
                                                    color: "#10b981",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "12px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Selesai
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={styles.tableCell}>
                                            09:15 AM
                                        </td>
                                        <td style={styles.tableCell}>
                                            Update data outlet
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        "#f59e0b20",
                                                    color: "#f59e0b",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "12px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Proses
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div style={styles.emptyState}>
                                <p>Tidak ada aktivitas terbaru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        console.log("=== 🔐 PROTECTED ROUTE DEBUG ===");
        console.log("📍 Current path:", location.pathname);
        console.log("🔄 Loading state:", loading);
        console.log("🔐 Auth check result:", isAuthenticated());
        console.log(
            "👤 User data:",
            user
                ? {
                      id: user.id,
                      name: user.name,
                      username: user.username,
                      role: user.role,
                  }
                : "No user"
        );
        console.log("🎯 Allowed roles:", allowedRoles);
        console.log(
            "📝 User role allowed?:",
            allowedRoles.includes(user?.role)
        );
        console.log("=== ===================== ===");
    }, [loading, user, location.pathname, allowedRoles]);

    if (loading) {
        console.log("⏳ Showing loading spinner...");
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Memuat...</p>
            </div>
        );
    }

    const isAuth = isAuthenticated();

    if (!isAuth) {
        console.log("❌ NOT AUTHENTICATED - Redirecting to login");
        console.log(
            "📤 Stored token:",
            localStorage.getItem("token") ? "Exists" : "None"
        );
        console.log(
            "📤 Stored user:",
            localStorage.getItem("user") ? "Exists" : "None"
        );
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        console.log(
            `⛔ ROLE NOT ALLOWED - User role: ${user.role}, Allowed: ${allowedRoles}`
        );
        console.log("🔄 Redirecting based on role...");

        if (user.role === "admin") {
            console.log("↪️ Redirecting admin to /admin/dashboard");
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            console.log(`↪️ Redirecting ${user.role} to /user/dashboard`);
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    console.log(
        `✅ ACCESS GRANTED - Role: ${user?.role}, Path: ${location.pathname}`
    );
    return children;
};

const styles = {
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
    loadingText: {
        color: "#64748b",
        fontSize: "1rem",
        fontWeight: "500",
    },
};

export default ProtectedRoute;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./dashboard/Dashboard";
import AdminDashboard from "./dashboard/AdminDashboard";
import ProtectedRoute from "./User/ProtectedRoute";

const MainApp = () => {
    return (
        <Routes>
            {/* Redirect root ke login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["user", "outlet"]}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* 404 route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default MainApp;

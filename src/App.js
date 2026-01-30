import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Admin Components
import AdminLayout from "./components/Admin/AdminLayout";
import DashboardContent from "./components/Admin/DashboardContent";
import OutletsList from "./components/Admin/OutletsList";
import OutletCreate from "./components/Admin/OutletCreate";
import UserManagement from "./components/Admin/UserManagement";
import UserCreate from "./components/Admin/UserCreate";
import ReportsList from "./components/Admin/ReportsList";
import ReportCreate from "./components/Admin/ReportCreate";

// Tambahkan import untuk Karyawan
import KaryawanList from "./pages/KaryawanList";
import KaryawanForm from "./pages/KaryawanForm";
import KaryawanDetail from "./pages/KaryawanDetail";

// User Components
import UserLayout from "./components/User/UserLayout";
import UserDashboardContent from "./components/User/DashboardContentUser";
import UserReportsView from "./components/User/ReportsView";

import "./App.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Redirect root to login */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* Login route */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes - hanya untuk admin */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Default route untuk /admin */}
                        <Route
                            index
                            element={<Navigate to="dashboard" replace />}
                        />

                        {/* Dashboard admin */}
                        <Route
                            path="dashboard"
                            element={<DashboardContent />}
                        />

                        {/* ===== DATA KARYAWAN ROUTES (TAMBAHAN BARU) ===== */}
                        <Route path="karyawan" element={<KaryawanList />} />
                        <Route
                            path="karyawan/create"
                            element={<KaryawanForm />}
                        />
                        <Route
                            path="karyawan/:id"
                            element={<KaryawanDetail />}
                        />
                        <Route
                            path="karyawan/:id/edit"
                            element={<KaryawanForm />}
                        />
                        {/* ===== END DATA KARYAWAN ===== */}

                        {/* Outlets routes */}
                        <Route path="outlets" element={<OutletsList />} />
                        <Route path="outlets/add" element={<OutletCreate />} />
                        <Route
                            path="outlets/edit/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Edit Outlet</h1>
                                    <p>
                                        Halaman edit outlet akan ditampilkan di
                                        sini
                                    </p>
                                </div>
                            }
                        />
                        <Route
                            path="outlets/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Detail Outlet</h1>
                                    <p>
                                        Halaman detail outlet akan ditampilkan
                                        di sini
                                    </p>
                                </div>
                            }
                        />

                        {/* Users routes */}
                        <Route path="users" element={<UserManagement />} />
                        <Route path="users/create" element={<UserCreate />} />
                        <Route
                            path="users/edit/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Edit User</h1>
                                    <p>
                                        Halaman edit user akan ditampilkan di
                                        sini
                                    </p>
                                </div>
                            }
                        />
                        <Route
                            path="users/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Detail User</h1>
                                    <p>
                                        Halaman detail user akan ditampilkan di
                                        sini
                                    </p>
                                </div>
                            }
                        />

                        {/* Reports routes */}
                        <Route path="reports" element={<ReportsList />} />
                        <Route
                            path="reports/create"
                            element={<ReportCreate />}
                        />
                        <Route
                            path="reports/edit/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Edit Laporan</h1>
                                    <p>
                                        Halaman edit laporan akan ditampilkan di
                                        sini
                                    </p>
                                </div>
                            }
                        />
                        <Route
                            path="reports/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Detail Laporan</h1>
                                    <p>
                                        Halaman detail laporan akan ditampilkan
                                        di sini
                                    </p>
                                </div>
                            }
                        />

                        {/* Settings & Profile */}
                        <Route
                            path="settings"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Pengaturan</h1>
                                    <p>
                                        Halaman pengaturan akan ditampilkan di
                                        sini
                                    </p>
                                </div>
                            }
                        />
                        <Route
                            path="profile"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Profil</h1>
                                    <p>
                                        Halaman profil akan ditampilkan di sini
                                    </p>
                                </div>
                            }
                        />
                    </Route>

                    {/* User/Outlet/Manager Routes */}
                    <Route
                        path="/user/*"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user", "outlet", "manager"]}
                            >
                                <UserLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Default route untuk /user */}
                        <Route
                            index
                            element={<Navigate to="dashboard" replace />}
                        />

                        {/* Dashboard user */}
                        <Route
                            path="dashboard"
                            element={<UserDashboardContent />}
                        />

                        {/* Reports routes for user */}
                        <Route path="reports" element={<UserReportsView />} />
                        <Route
                            path="reports/create"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Buat Laporan Baru</h1>
                                    <p>Halaman untuk membuat laporan baru</p>
                                </div>
                            }
                        />
                        <Route
                            path="reports/:id"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Detail Laporan</h1>
                                    <p>Halaman detail laporan</p>
                                </div>
                            }
                        />

                        {/* User Profile */}
                        <Route
                            path="profile"
                            element={
                                <div style={{ padding: "2rem" }}>
                                    <h1>Profil Pengguna</h1>
                                    <p>
                                        Halaman profil pengguna akan ditampilkan
                                        di sini
                                    </p>
                                </div>
                            }
                        />
                    </Route>

                    {/* Legacy redirects - handle /dashboard */}
                    <Route
                        path="/dashboard"
                        element={<NavigateBasedOnRole />}
                    />

                    {/* 404 route - redirect based on auth status */}
                    <Route path="*" element={<NavigateToDashboard />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

// Component untuk redirect berdasarkan role
const NavigateBasedOnRole = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        console.log("🔄 NavigateBasedOnRole - User role:", user.role);

        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

const NavigateToDashboard = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

export default App;

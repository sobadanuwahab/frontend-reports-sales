const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function untuk fetch dengan auth header
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // Cek jika response adalah HTML
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error(
            `Server returned HTML instead of JSON. Check API endpoint: ${url}`
        );
    }

    if (!response.ok) {
        if (response.status === 401) {
            // Unauthorized - clear local storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
            status: response.status,
            message:
                errorData.message ||
                `Request failed with status ${response.status}`,
            data: errorData,
        };
    }

    return response.json();
};

// Auth API
export const authAPI = {
    login: (credentials) =>
        fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(credentials),
        }).then((res) => res.json()),

    logout: () => fetchWithAuth("/logout", { method: "POST" }),
    me: () => fetchWithAuth("/me"),
};

// Outlet API
export const outletAPI = {
    getAll: () => fetchWithAuth("/outlets"),
    getDashboardData: (role = "user") =>
        fetchWithAuth(role === "admin" ? "/dashboard/admin" : "/dashboard"),
    getById: (id) => fetchWithAuth(`/outlets/${id}`),
    create: (data) =>
        fetchWithAuth("/outlets", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id, data) =>
        fetchWithAuth(`/outlets/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id) => fetchWithAuth(`/outlets/${id}`, { method: "DELETE" }),
    getMyOutlet: () => fetchWithAuth("/outlets/my-outlet"),
};

// Report API
export const reportAPI = {
    getAll: () => fetchWithAuth("/reports"),
    getDaily: () => fetchWithAuth("/reports/daily"),
    getMonthly: () => fetchWithAuth("/reports/monthly"),
    create: (data) =>
        fetchWithAuth("/reports", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    getById: (id) => fetchWithAuth(`/reports/${id}`),
    update: (id, data) =>
        fetchWithAuth(`/reports/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id) => fetchWithAuth(`/reports/${id}`, { method: "DELETE" }),
    getMyReports: () => fetchWithAuth("/reports/my-reports"),
};

// Test API connection
export const testConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email: "test", password: "test" }),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            return {
                connected: false,
                message:
                    "Server is returning HTML (404). API endpoint might not exist.",
            };
        }

        return {
            connected: true,
            message: "API server is reachable.",
        };
    } catch (error) {
        return {
            connected: false,
            message: `Cannot connect to API server: ${error.message}`,
        };
    }
};

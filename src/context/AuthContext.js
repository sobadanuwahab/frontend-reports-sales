import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: "https://nonspurious-rory-nonacoustically.ngrok-free.dev/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token to requests if exists
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Function to validate and refresh token
  const validateToken = useCallback(async (token) => {
    try {
      const response = await api.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return {
          valid: true,
          user: response.data.data,
        };
      }
      return { valid: false };
    } catch (error) {
      console.error("Token validation error:", error);
      return { valid: false };
    }
  }, []);

  // Check authentication on mount AND on refresh
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing authentication...");

      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log("📦 Storage check:", {
        tokenExists: !!storedToken,
        userExists: !!storedUser,
      });

      if (storedToken) {
        try {
          // Validate token with backend
          console.log("🔐 Validating token...");
          const validation = await validateToken(storedToken);

          if (validation.valid) {
            console.log("✅ Token valid, setting user...");
            setToken(storedToken);

            // Use user from API response or localStorage
            const userData = validation.user || JSON.parse(storedUser);
            setUser(userData);

            // Update localStorage with fresh user data
            if (validation.user) {
              localStorage.setItem("user", JSON.stringify(validation.user));
            }
          } else {
            console.log("❌ Token invalid, clearing storage...");
            clearAuth();
          }
        } catch (error) {
          console.error("❌ Auth initialization error:", error);
          clearAuth();
        }
      } else {
        console.log("📭 No token found, setting null state");
        setToken(null);
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();

    // Listen for storage events (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
        if (!e.newValue) {
          setUser(null);
        }
      }
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (error) {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const login = async (username, password) => {
    try {
      console.log("🔑 Attempting login for username:", username);

      const response = await api.post("/login", {
        username,
        password,
      });

      console.log("📦 Login response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setToken(token);
        setUser(user);

        console.log("✅ Login successful for user:", user);
        console.log("👤 User role:", user.role);

        return { success: true, user };
      } else {
        console.log("❌ Login failed:", response.data.message);
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed";

      if (error.response?.status === 404) {
        errorMessage =
          "Login endpoint not found (404). Check if backend is running.";
      } else if (error.response?.status === 422) {
        errorMessage = error.response.data.message || "Validation error";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Network Error")) {
        errorMessage =
          "Cannot connect to server. Please make sure backend is running on port 8000.";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    console.log("🚪 Logging out user:", user?.name);

    // Call backend logout if token exists
    if (token) {
      try {
        await api.post("/logout");
      } catch (err) {
        console.log("Logout API call failed:", err);
      }
    }

    // Clear local storage and state
    clearAuth();
  };

  const isAuthenticated = () => {
    const hasToken = !!localStorage.getItem("token");
    const hasUser = !!localStorage.getItem("user");
    const isAuth = hasToken && hasUser;

    console.log("🔍 isAuthenticated check:", {
      hasToken,
      hasUser,
      result: isAuth,
      userRole: user?.role,
      userName: user?.name,
    });

    return isAuth;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    setUser,
    setToken,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;

// API Client for Smart Traffic Violation Reporting & Management System

const API_BASE_URL = "/api";

export const getToken = () => localStorage.getItem("traffic_token");
export const setToken = (token) => localStorage.setItem("traffic_token", token);
export const removeToken = () => {
  localStorage.removeItem("traffic_token");
  localStorage.removeItem("traffic_user");
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("traffic_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem("traffic_user", JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default content-type is JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Auto logout on 401 Unauthorized
      if (response.status === 401 && endpoint !== "/auth/login") {
        removeToken();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    async register(userData) {
      const res = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      if (res.token && res.user) {
        setToken(res.token);
        setStoredUser(res.user);
      }
      return res;
    },

    async login(credentials) {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (res.token && res.user) {
        setToken(res.token);
        setStoredUser(res.user);
      }
      return res;
    },

    async getMe() {
      return request("/auth/me", { method: "GET" });
    },

    logout() {
      removeToken();
    },
  },

  // Citizen Reports
  reports: {
    async submit(formData) {
      return request("/reports", {
        method: "POST",
        body: formData,
      });
    },

    async getMyReports() {
      return request("/reports/my", { method: "GET" });
    },

    async getReportDetails(id) {
      return request(`/reports/${id}`, { method: "GET" });
    },
  },

  // Admin Operations
  admin: {
    async getReports(params = {}) {
      const query = new URLSearchParams();
      if (params.status && params.status !== "ALL") query.append("status", params.status);
      if (params.violation_type && params.violation_type !== "ALL") query.append("violation_type", params.violation_type);
      if (params.search) query.append("search", params.search);

      const qs = query.toString() ? `?${query.toString()}` : "";
      return request(`/admin/reports${qs}`, { method: "GET" });
    },

    async getStats() {
      return request("/admin/stats", { method: "GET" });
    },

    async updateStatus(id, updateData) {
      return request(`/admin/reports/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
    },

    async deleteReport(id) {
      return request(`/admin/reports/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Helper for evidence URLs
  getEvidenceUrl(filePath) {
    if (!filePath) return "";
    return `/uploads/${filePath}`;
  },
};

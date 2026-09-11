import axios from "axios";

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8082",
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 30000,
};

const http = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// The BFF gateway (see sso-gateway-bff) holds the real OAuth2 tokens; this app only
// ever sees a same-site session cookie, sent automatically by withCredentials.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

class ApiService {
  get(endpoint) {
    return http.get(endpoint).then((r) => r.data);
  }
  post(endpoint, data, config) {
    return http.post(endpoint, data, config).then((r) => r.data);
  }
  put(endpoint, data) {
    return http.put(endpoint, data).then((r) => r.data);
  }
  delete(endpoint) {
    return http.delete(endpoint).then((r) => r.data);
  }
}

export const apiService = new ApiService();

export const ENDPOINTS = {
  ORGANIZATIONS: {
    LIST: "/api/v1/organizations",
    DETAIL: (id) => `/api/v1/organizations/${id}`,
    CREATE: "/api/v1/organizations",
    UPDATE: (id) => `/api/v1/organizations/${id}`,
    DELETE: (id) => `/api/v1/organizations/${id}`,
  },
  MEMBERS: {
    LIST_BY_ORG: (orgId) => `/api/v1/organizations/${orgId}/members`,
    CREATE: (orgId) => `/api/v1/organizations/${orgId}/members`,
    DELETE: (orgId, id) => `/api/v1/organizations/${orgId}/members/${id}`,
  },
  MEETINGS: {
    LIST_BY_ORG: (orgId) => `/api/v1/organizations/${orgId}/meetings`,
    CREATE: (orgId) => `/api/v1/organizations/${orgId}/meetings`,
    UPDATE: (orgId, id) => `/api/v1/organizations/${orgId}/meetings/${id}`,
    DELETE: (orgId, id) => `/api/v1/organizations/${orgId}/meetings/${id}`,
  },
  FINANCE: {
    SUMMARY: (orgId) => `/api/v1/organizations/${orgId}/finance/summary`,
    TRANSACTIONS: (orgId) => `/api/v1/organizations/${orgId}/finance/transactions`,
  },
  BYLAWS: {
    GET: (orgId) => `/api/v1/organizations/${orgId}/bylaws`,
    UPLOAD: (orgId) => `/api/v1/organizations/${orgId}/bylaws`,
  },
  CATEGORIES: {
    LIST: "/api/v1/categories",
    CREATE: "/api/v1/categories",
    DELETE: (id) => `/api/v1/categories/${id}`,
  },
  LOCATIONS: {
    LIST: "/api/v1/locations",
    CREATE: "/api/v1/locations",
    DELETE: (id) => `/api/v1/locations/${id}`,
  },
  USERS: {
    LIST: "/api/v1/users",
  },
  APPROVALS: {
    QUEUE: "/api/v1/approvals",
    APPROVE: (id) => `/api/v1/approvals/${id}`,
    REJECT: (id) => `/api/v1/approvals/${id}`,
  },
};

export default { API_CONFIG, apiService, ENDPOINTS };

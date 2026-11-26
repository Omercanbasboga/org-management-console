import axios from "axios";
import { currentPersona } from "../persona";
import { mockRequest } from "./mock";

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "",
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 30000,
  // Without a backend URL the console runs on its in-browser simulation (the GitHub Pages demo).
  DEMO: !process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_DEMO === "true",
  // Against the backend's demo profile, send the chosen persona as a header.
  DEMO_HEADER: process.env.REACT_APP_DEMO_HEADER === "true",
};

const http = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

http.interceptors.request.use((config) => {
  if (API_CONFIG.DEMO_HEADER) config.headers["X-Demo-User"] = currentPersona();
  return config;
});

// The BFF gateway (see sso-gateway-bff) holds the real OAuth2 tokens; this app only
// ever sees a same-site session cookie, sent automatically by withCredentials.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !API_CONFIG.DEMO_HEADER) {
      window.location.href = `${process.env.PUBLIC_URL}/sign-in`;
    }
    return Promise.reject(error);
  }
);

/** Errors come back as { status, message } whichever transport produced them. */
function normalize(e) {
  const err = new Error(e.response?.data?.error || e.message || "Request failed");
  err.status = e.response?.status ?? e.status;
  return err;
}

async function send(method, url, data) {
  if (API_CONFIG.DEMO && !API_CONFIG.DEMO_HEADER) {
    try {
      return await mockRequest(method, url, data, currentPersona());
    } catch (e) {
      throw normalize(e);
    }
  }
  try {
    const r = await http.request({ method, url, data });
    return r.status === 204 ? null : r.data;
  } catch (e) {
    throw normalize(e);
  }
}

export const apiService = {
  get: (url) => send("get", url),
  post: (url, data) => send("post", url, data),
  put: (url, data) => send("put", url, data),
  delete: (url) => send("delete", url),
};

const org = (id) => `/api/v1/organizations/${id}`;

export const ENDPOINTS = {
  ORGANIZATIONS: {
    LIST: "/api/v1/organizations",
    DETAIL: org,
    CREATE: "/api/v1/organizations",
    UPDATE: org,
    CLOSE: org,
  },
  MEMBERS: {
    LIST_BY_ORG: (orgId) => `${org(orgId)}/members`,
    CREATE: (orgId) => `${org(orgId)}/members`,
    DELETE: (orgId, id) => `${org(orgId)}/members/${id}`,
  },
  MEETINGS: {
    LIST_BY_ORG: (orgId) => `${org(orgId)}/meetings`,
    CREATE: (orgId) => `${org(orgId)}/meetings`,
    UPDATE: (orgId, id) => `${org(orgId)}/meetings/${id}`,
    DELETE: (orgId, id) => `${org(orgId)}/meetings/${id}`,
  },
  FINANCE: {
    SUMMARY: (orgId) => `${org(orgId)}/finance/summary`,
    TRANSACTIONS: (orgId) => `${org(orgId)}/finance/transactions`,
  },
  BYLAWS: {
    LATEST: (orgId) => `${org(orgId)}/bylaws`,
    HISTORY: (orgId) => `${org(orgId)}/bylaws/history`,
    UPLOAD: (orgId) => `${org(orgId)}/bylaws`,
    FILE: (orgId, id) => `${API_CONFIG.BASE_URL}${org(orgId)}/bylaws/${id}/file`,
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
  USERS: { LIST: "/api/v1/users" },
  APPROVALS: {
    QUEUE: "/api/v1/approvals",
    APPROVE: (id) => `/api/v1/approvals/${id}`,
    REJECT: (id, reason) =>
      `/api/v1/approvals/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
  },
};

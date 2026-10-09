import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eaap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eaap_token');
      localStorage.removeItem('eaap_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Dashboard
export const getDashboardMetrics = () => API.get('/dashboard/metrics');

// Dataset
export const uploadDataset = (formData) =>
  API.post('/dataset/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const listDatasets = () => API.get('/dataset/list');
export const previewDataset = (id, page = 0, size = 20) =>
  API.get(`/dataset/preview/${id}?page=${page}&size=${size}`);
export const activateDataset = (id) => API.post(`/dataset/activate/${id}`);
export const getActiveDataset = () => API.get('/dataset/active');

// ML Core
export const trainModel = () => API.post('/ml/train');
export const getMLMetrics = () => API.get('/ml/metrics');
export const predict = (data) => API.post('/ml/predict', data);
export const predictBatch = () => API.post('/ml/predict-batch');
export const getFeatureImportance = () => API.get('/ml/feature-importance');

// ML Monitoring & Health
export const getModelHealth = () => API.get('/ml/health');
export const getPredictionHistory = () => API.get('/ml/history');

// XAI / SHAP
export const getGlobalShap = () => API.get('/ml/shap/global');
export const getLocalShap = (data) => API.post('/ml/shap/local', data);

// Forecasting & Cohorts
export const getForecast = (periods = 12) => API.post(`/ml/forecast?periods=${periods}`);
export const getCohortAnalysis = () => API.post('/ml/cohort');

// EDA
export const getCorrelation = () => API.get('/eda/correlation');
export const getDistributions = () => API.get('/eda/distributions');
export const getAttritionBy = (groupBy = 'Department') =>
  API.get(`/eda/attrition-by?groupBy=${groupBy}`);

// Segmentation
export const runClustering = () => API.post('/segmentation/cluster');

// Notifications / Alerts
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/count');
export const markRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');
export const scanWorkforceAlerts = () => API.post('/notifications/scan');

// Reports
export const generateReport = (type = 'FULL') =>
  API.post(`/reports/generate?reportType=${type}`);
export const listReports = () => API.get('/reports/list');
export const downloadReportUrl = (id) => `http://localhost:8080/api/reports/download/${id}`;

// Users
export const listUsers = () => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/users/${id}`);

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap data standard envelope
client.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return { success: true, data: response.data };
  },
  (error) => {
    const errorRes = error.response?.data || {
      success: false,
      message: error.message || 'An unexpected network error occurred',
      errorCode: 'NETWORK_ERROR',
    };
    return Promise.reject(errorRes);
  }
);

export const studentsApi = {
  getAll: (params) => client.get('/students', { params }),
  getById: (id) => client.get(`/students/${id}`),
  create: (data) => client.post('/students', data),
  update: (id, data) => client.put(`/students/${id}`, data),
  delete: (id) => client.delete(`/students/${id}`),
};

export const companiesApi = {
  getAll: (params) => client.get('/companies', { params }),
  getById: (id) => client.get(`/companies/${id}`),
  create: (data) => client.post('/companies', data),
  update: (id, data) => client.put(`/companies/${id}`, data),
  delete: (id) => client.delete(`/companies/${id}`),
};

export const jobsApi = {
  getAll: (params) => client.get('/jobs', { params }),
  getById: (id) => client.get(`/jobs/${id}`),
  create: (data) => client.post('/jobs', data),
  update: (id, data) => client.put(`/jobs/${id}`, data),
  delete: (id) => client.delete(`/jobs/${id}`),
  checkEligibility: (jobId, studentId) => client.get(`/jobs/${jobId}/eligibility/${studentId}`),
};

export const applicationsApi = {
  getAll: (params) => client.get('/applications', { params }),
  getById: (id) => client.get(`/applications/${id}`),
  apply: (studentId, jobId) => client.post('/applications', { studentId, jobId }),
  updateStatus: (id, status) => client.put(`/applications/${id}/status`, { status }),
  delete: (id) => client.delete(`/applications/${id}`),
};

export const interviewsApi = {
  getAll: (params) => client.get('/interviews', { params }),
  getById: (id) => client.get(`/interviews/${id}`),
  schedule: (data) => client.post('/interviews', data),
  update: (id, data) => client.put(`/interviews/${id}`, data),
  delete: (id) => client.delete(`/interviews/${id}`),
};

export const dashboardApi = {
  getStats: () => client.get('/dashboard/stats'),
  getPlacementsByBranch: () => client.get('/dashboard/placements-by-branch'),
  getApplicationsByCompany: () => client.get('/dashboard/applications-by-company'),
  getPackageDistribution: () => client.get('/dashboard/package-distribution'),
};

export default client;

import axios from 'axios';
import type {
  Annotation,
  Dataset,
  LoginResponse,
  PaginatedResponse,
  Review,
  Task,
  Taxonomy,
  User,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ennlabel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ennlabel_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/login', { email, password }),
  logout: () => api.post('/logout'),
  me: () => api.get<{ user: User }>('/me'),
};

// Datasets
export const datasetApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Dataset>>('/datasets', { params }),
  get: (id: string) => api.get<Dataset>(`/datasets/${id}`),
  create: (formData: FormData) =>
    api.post<Dataset>('/datasets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Taxonomies
export const taxonomyApi = {
  list: () => api.get<Taxonomy[]>('/taxonomies'),
  get: (id: string) => api.get<Taxonomy>(`/taxonomies/${id}`),
  create: (data: { name: string; type?: string; labels: Partial<Taxonomy['labels']> }) =>
    api.post<Taxonomy>('/taxonomies', data),
};

// Tasks
export const taskApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Task>>('/tasks', { params }),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  generate: (datasetId: string, taxonomyId: string) =>
    api.post('/tasks/generate', { dataset_id: datasetId, taxonomy_id: taxonomyId }),
  assign: (taskId: string, annotatorId: string) =>
    api.post('/tasks/assign', { task_id: taskId, annotator_id: annotatorId }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}`, { status }),
};

// Annotations
export const annotationApi = {
  getByTask: (taskId: string) => api.get<Annotation[]>(`/annotations/${taskId}`),
  create: (data: {
    task_id: string;
    label_id: string;
    start_offset: number;
    end_offset: number;
    selected_text: string;
  }) => api.post<Annotation>('/annotations', data),
  update: (id: string, data: Partial<Annotation>) =>
    api.put<Annotation>(`/annotations/${id}`, data),
  delete: (id: string) => api.delete(`/annotations/${id}`),
};

// Reviews
export const reviewApi = {
  getByTask: (taskId: string) => api.get<Review[]>(`/reviews/${taskId}`),
  create: (data: {
    task_id: string;
    decision: string;
    comments?: string;
  }) => api.post<Review>('/reviews', data),
};

// Export
export const exportApi = {
  dataset: (datasetId: string, format: 'json' | 'csv' = 'json') =>
    api.get(`/export/${datasetId}`, { params: { format } }),
};

// QA
export const qaApi = {
  calculate: (taskId: string, annotatorA: string, annotatorB: string) =>
    api.post('/qa/calculate', { task_id: taskId, annotator_a: annotatorA, annotator_b: annotatorB }),
  calculateDataset: (datasetId: string) =>
    api.post('/qa/calculate-dataset', { dataset_id: datasetId }),
  flagged: (params?: Record<string, string>) =>
    api.get('/qa/flagged', { params }),
  resolve: (id: string) =>
    api.patch(`/qa/${id}/resolve`),
  datasetStats: (datasetId: string) =>
    api.get(`/qa/stats/${datasetId}`),
};

// Users
export const userApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: { name: string; email: string; password: string; role_id: string }) =>
    api.post<User>('/users', data),
  update: (id: string, data: Partial<User & { password?: string }>) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  annotators: () => api.get('/users/annotators'),
  roles: () => api.get('/users/roles'),
};

// Audit Logs
export const auditApi = {
  list: (params?: Record<string, string>) =>
    api.get('/audit-logs', { params }),
};

export default api;

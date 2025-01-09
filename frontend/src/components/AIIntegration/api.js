import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/AI';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const AIService = {
  // Predictions
  getPredictions: (page = 1, filters = {}) => api.get('/predictions/', { params: { page, ...filters } }),
  providePredictionFeedback: (id, feedback) => api.post(`/predictions/${id}/feedback/`, feedback),

  // Recommendations
  getRecommendations: (page = 1, filters = {}) => api.get('/recommendations/', { params: { page, ...filters } }),
  applyRecommendation: (id) => api.post(`/recommendations/${id}/apply/`),
  provideRecommendationFeedback: (id, feedback) => api.post(`/recommendations/${id}/feedback/`, feedback),

  // AI Services
  generateTaskSuggestions: () => api.post('/generate-task-suggestions/'),
  optimizeSchedule: () => api.post('/optimize-schedule/'),
  analyzeTaskSentiment: (taskId) => api.post('/analyze-task-sentiment/', { task_id: taskId }),
  predictTaskCompletionTime: (taskId) => api.post('/predict-task-completion-time/', { task_id: taskId }),
  predictTaskPriority: (taskId) => api.post('/predict-task-priority/', { task_id: taskId }),
  createTaskWithNLP: (text) => api.post('/create-task-with-nlp/', { text }),
  getWorkflowSuggestions: () => api.post('/get-workflow-suggestions/'),
  optimizeProjectResources: (projectId) => api.post('/optimize-project-resources/', { project_id: projectId }),
  analyzeTaskDependencies: (projectId) => api.post('/analyze-task-dependencies/', { project_id: projectId }),
  assessProjectRisks: (projectId) => api.post('/assess-project-risks/', { project_id: projectId }),
  suggestCollaborations: (projectId) => api.post('/suggest-collaborations/', { project_id: projectId }),
  comprehensiveProjectAnalysis: (projectId) => api.post('/comprehensive-project-analysis/', { project_id: projectId }),
  generateAIInsightsReport: (projectId) => api.post('/generate-ai-insights-report/', { project_id: projectId }),
};

export const TaskService = {
  getTasks: (page = 1, filters = {}) => api.get('/tasks/', { params: { page, ...filters } }),
  getTask: (id) => api.get(`/tasks/${id}/`),
  createTask: (taskData) => api.post('/tasks/', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}/`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}/`),
};

export const ProjectService = {
  getProjects: (page = 1, filters = {}) => api.get('/projects/', { params: { page, ...filters } }),
  getProject: (id) => api.get(`/projects/${id}/`),
  createProject: (projectData) => api.post('/projects/', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}/`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
};

export default api;

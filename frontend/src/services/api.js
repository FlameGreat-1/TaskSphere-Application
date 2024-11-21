import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Token retrieved from localStorage:', token);
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
      console.log('Authorization header set:', config.headers['Authorization']); 
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Received 401 Unauthorized error:', error.response);
      // You can add logic here to handle the 401 error, such as redirecting to login
    }
    return Promise.reject(error);
  }
);

// User authentication and profile
export const registerUser = (userData) => axiosInstance.post('/accounts/register/', userData);
export const loginUser = ({ email, password }) => axiosInstance.post('/accounts/login/', { email, password });
export const verifyOTP = (otp) => axiosInstance.post('/accounts/verify-otp/', { otp });
export const logoutUser = () => axiosInstance.post('/accounts/logout/');
export const resendActivationEmail = (email) => axiosInstance.post('/accounts/resend-activation/', { email });
export const passwordReset = (email) => axiosInstance.post('/accounts/password-reset/', { email });
export const loginWithGoogle = () => axiosInstance.get('/accounts/google/auth/');
export const registerWithGoogle = (token) => axiosInstance.post('/accounts/google-register/', { token });
export const checkActivationToken = (uidb64, token, userId) => 
  axiosInstance.get(`/accounts/activate/${uidb64}/${token}/${userId}/`);
export const confirmAccountActivation = (uidb64, token, userId) => 
  axiosInstance.post(`/accounts/activate/${uidb64}/${token}/${userId}/`);
export const requestPasswordReset = (email) => 
  axiosInstance.post(`/accounts/password-reset/`, { email });
export const resetPassword = (uid, token, newPassword) => 
  axiosInstance.post(`/accounts/reset-password/${uid}/${token}/`, { new_password: newPassword });
export const resendOTP = (email) => axiosInstance.post('/accounts/resend-otp/', { email });

// Profile and Dashboard
export const fetchProfile = () => axiosInstance.get('/user_profile/Profile/');
export const updateProfile = (userData) => axiosInstance.put('/user_profile/Profile/', userData);
export const fetchDashboardData = () => axiosInstance.get('/user_profile/dashboard/');
export const fetchUserProfile = fetchProfile;

// Tasks
export const fetchTasks = () => axiosInstance.get('/tasks/');
export const fetchTask = (id) => axiosInstance.get(`/tasks/${id}/`);
export const createTask = async (taskData) => {
  console.log('Task payload:', taskData); 
  const response = await axiosInstance.post('/tasks/', taskData);
  return response;
};
export const updateTask = (taskId, taskData) => axiosInstance.put(`/tasks/${taskId}/`, taskData);
export const deleteTask = (taskId) => axiosInstance.delete(`/tasks/${taskId}/`);

// Calendar-related functions
export const fetchCalendarEvents = (start, end) => 
  axiosInstance.get('/tasks/calendar-events/', { params: { start, end } });
export const createCalendarEvent = (eventData) => 
  axiosInstance.post('/tasks/', eventData);
export const updateCalendarEvent = (taskId, eventData) => 
  axiosInstance.put(`/tasks/${taskId}/`, eventData);
export const deleteCalendarEvent = (taskId) => 
  axiosInstance.delete(`/tasks/${taskId}/`);
export const toggleTaskCompletion = (taskId) => 
  axiosInstance.post(`/tasks/${taskId}/toggle-completion/`);
export const rescheduleTask = (taskId, newStart, newEnd) => 
  axiosInstance.post(`/tasks/${taskId}/reschedule/`, { start_date: newStart, end_date: newEnd });

// Subtasks
export const fetchSubTasks = (taskId) => axiosInstance.get(`/tasks/${taskId}/subtasks/`);
export const createSubTask = (taskId, subtaskData) => axiosInstance.post(`/tasks/${taskId}/subtasks/`, subtaskData);
export const updateSubTask = (taskId, subtaskId, subtaskData) => 
  axiosInstance.put(`/tasks/${taskId}/subtasks/${subtaskId}/`, subtaskData);
export const deleteSubTask = (taskId, subtaskId) => 
  axiosInstance.delete(`/tasks/${taskId}/subtasks/${subtaskId}/`);

// Categories
export const fetchCategories = () => axiosInstance.get('/categories/');
export const createCategory = (categoryData) => axiosInstance.post('/categories/', categoryData);
export const deleteCategory = (categoryId) => axiosInstance.delete(`/categories/${categoryId}/`);
export const updateCategory = (categoryId, categoryData) => 
  axiosInstance.put(`/categories/${categoryId}/`, categoryData);

// Tags
export const fetchTags = () => axiosInstance.get('/tags/');
export const createTag = (tagData) => axiosInstance.post('/tags/', tagData);
export const deleteTag = (tagId) => axiosInstance.delete(`/tags/${tagId}/`);
export const updateTag = (tagId, tagData) => axiosInstance.put(`/tags/${tagId}/`, tagData);

// Time Logs
export const fetchTimeLogs = (taskId) => axiosInstance.get(`/tasks/${taskId}/time-logs/`);
export const createTimeLog = (taskId, timeLogData) => axiosInstance.post(`/tasks/${taskId}/time-logs/`, timeLogData);
export const updateTimeLog = (taskId, timeLogId, timeLogData) => 
  axiosInstance.put(`/tasks/${taskId}/time-logs/${timeLogId}/`, timeLogData);
export const deleteTimeLog = (taskId, timeLogId) => 
  axiosInstance.delete(`/tasks/${taskId}/time-logs/${timeLogId}/`);

// Task Assignment
export const assignTask = (taskId, userId) => axiosInstance.post(`/tasks/${taskId}/assign/`, { user_id: userId });
export const unassignTask = (taskId, userId) => axiosInstance.post(`/tasks/${taskId}/unassign/`, { user_id: userId });

// Comments
export const createComment = (taskId, commentData) => axiosInstance.post(`/tasks/${taskId}/comments/`, commentData);
export const updateComment = (taskId, commentId, commentData) => 
  axiosInstance.put(`/tasks/${taskId}/comments/${commentId}/`, commentData);
export const deleteComment = (taskId, commentId) => 
  axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}/`);

// Attachments
export const createAttachment = (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post(`/tasks/${taskId}/attachments/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteAttachment = (taskId, attachmentId) => 
  axiosInstance.delete(`/tasks/${taskId}/attachments/${attachmentId}/`);

// Reminders
export const snoozeReminder = (taskId, snoozeTime) => 
  axiosInstance.post(`/tasks/${taskId}/snooze/`, { snooze_time: snoozeTime });
export const sendTaskReminder = (taskId) => axiosInstance.post(`/tasks/${taskId}/send-reminder/`);
export const updateReminder = (taskId, reminderId, reminderData) => 
  axiosInstance.put(`/tasks/${taskId}/reminders/${reminderId}/`, reminderData);

// Task Progress
export const updateTaskProgress = (taskId, progress) => 
  axiosInstance.put(`/tasks/${taskId}/progress/`, { progress });

// Task Filtering
export const filterTasks = (priority, tag, deadline) => 
  axiosInstance.get('/tasks/filter/', { params: { priority, tag, deadline } });

// Analytics
export const fetchAnalyticsData = () => axiosInstance.get('/tasks/analytics/');

// Google Integration
export const authenticateGoogle = () => axiosInstance.get('/accounts/google/auth/');
export const createGoogleCalendarEvent = (taskId) => axiosInstance.post(`/google/calendar/create/${taskId}/`);
export const uploadToGoogleDrive = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post('/google/drive/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const createGoogleSheet = () => axiosInstance.post('/google/sheets/create/');
export const createGoogleDocument = () => axiosInstance.post('/google/docs/create/');
export const createGoogleForm = () => axiosInstance.post('/google/forms/create/');
export const listGoogleDriveFiles = () => axiosInstance.get('/google/drive/list/');
export const getGoogleSheetData = (spreadsheetId) => axiosInstance.get(`/google/sheets/${spreadsheetId}/`);
export const updateGoogleDocument = (documentId, content) => 
  axiosInstance.put(`/google/docs/${documentId}/`, { content });
export const addQuestionsToGoogleForm = (formId, questions) => 
  axiosInstance.post(`/google/forms/${formId}/questions/`, { questions });
export const listGoogleCalendarEvents = () => axiosInstance.get('/google/calendar/list/');
export const deleteGoogleDriveFile = (fileId) => axiosInstance.delete(`/google/drive/${fileId}/`);
export const updateGoogleSheetData = (spreadsheetId, range, values) => 
  axiosInstance.put(`/google/sheets/${spreadsheetId}/`, { range, values });
export const updateGoogleCalendarEvent = (eventId, eventData) => 
  axiosInstance.put(`/google/calendar/${eventId}/`, eventData);

// Notifications
export const fetchNotifications = () => axiosInstance.get('/notifications/');
export const fetchUnreadNotificationsCount = () => axiosInstance.get('/notifications/unread-count/');
export const markAllNotificationsAsRead = () => axiosInstance.post('/notifications/mark-all-read/');
export const fetchNotificationPreferences = () => axiosInstance.get('/notifications/preferences/');
export const markNotificationAsRead = (notificationId) => axiosInstance.post(`/notifications/${notificationId}/mark-read/`);
export const deleteNotification = (notificationId) => axiosInstance.delete(`/notifications/${notificationId}/`);
export const updateNotificationSettings = (settings) => axiosInstance.put('/notifications/preferences/', settings);

// Export the axiosInstance for any custom use
export { axiosInstance };

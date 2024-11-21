Notification.js:                                                                                 import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow } from 'date-fns';
import { IoMdNotifications, IoMdSettings, IoMdCheckmark, IoMdTrash } from 'react-icons/io';
import { FaBellSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import NotificationPreferences from './NotificationPreferences';
import io from 'socket.io-client';

const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f8f9fa',
  text: '#34495e',
  error: '#e74c3c',
  success: '#27ae60',
  warning: '#f39c12',
  info: '#3498db',
};

const NotificationWrapper = styled.div`
  font-family: 'Roboto', sans-serif;
  max-width: 400px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 1000;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
`;

const NotificationList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled(motion.li)`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  ${({ isRead }) => isRead && `
    opacity: 0.6;
  `}
`;

const NotificationIcon = styled.div`
  margin-right: 16px;
  font-size: 1.5rem;
  color: ${({ theme, priority }) => {
    switch (priority) {
      case 'high':
        return theme.error;
      case 'medium':
        return theme.warning;
      default:
        return theme.info;
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const NotificationTime = styled.span`
  font-size: 0.8rem;
  color: #999;
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  margin-left: 8px;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.secondary};
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.secondary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const EmptyStateIcon = styled(FaBellSlash)`
  font-size: 3rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.primary};
`;

const fetchNotifications = async ({ pageParam = 1 }) => {
  try {
    console.log(`Attempting to fetch notifications for page ${pageParam}`);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication token is missing');
    }

    const response = await axios.get(`/api/notifications?page=${pageParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Notifications fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);

    if (error.response) {
      console.error('Server responded with error:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    console.error('Error config:', error.config);

    throw error;
  }
};

const Notification = ({ onClose }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { notificationCount, setNotificationCount } = useNotification();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery('notifications', fetchNotifications, {
    getNextPageParam: (lastPage) => lastPage.next_page || undefined,
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation(
    (notificationId) => axios.post(`/api/notifications/${notificationId}/mark-read/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
      },
    }
  );

  const deleteNotificationMutation = useMutation(
    (notificationId) => axios.delete(`/api/notifications/${notificationId}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
      },
    }
  );

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }, [markAsReadMutation]);

  const handleMarkAsRead = useCallback((e, notificationId) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleDelete = useCallback((e, notificationId) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io('http://localhost:8000', {
      path: '/socket.io/',
      transports: ['websocket']
    });
  
    socket.on('new_notification', (newNotification) => {
      queryClient.setQueryData('notifications', (old) => {
        if (!old) return { pages: [{ results: [newNotification] }] };
        return {
          ...old,
          pages: [
            { results: [newNotification, ...old.pages[0].results] },
            ...old.pages.slice(1),
          ],
        };
      });
      setNotificationCount((prevCount) => prevCount + 1);
    });
  
    return () => socket.disconnect();
  }, [queryClient, setNotificationCount, isAuthenticated]);

  const renderNotificationIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <IoMdNotifications color={theme.error} />;
      case 'medium':
        return <IoMdNotifications color={theme.warning} />;
      default:
        return <IoMdNotifications color={theme.info} />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <NotificationWrapper>
        <NotificationHeader>
          <Title>Notifications ({notificationCount})</Title>
          <SettingsButton onClick={() => setShowPreferences(true)}>
            <IoMdSettings />
          </SettingsButton>
        </NotificationHeader>
        <NotificationList>
          <AnimatePresence>
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.results.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    isRead={!!notification.read_at}
                    onClick={() => handleNotificationClick(notification)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationIcon priority={notification.priority}>
                      {renderNotificationIcon(notification.priority)}
                    </NotificationIcon>
                    <NotificationContent>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </NotificationTime>
                      <NotificationActions>
                        {!notification.read_at && (
                          <ActionButton onClick={(e) => handleMarkAsRead(e, notification.id)}>
                            <IoMdCheckmark /> Mark as read
                          </ActionButton>
                        )}
                        <ActionButton onClick={(e) => handleDelete(e, notification.id)}>
                          <IoMdTrash /> Delete
                        </ActionButton>
                      </NotificationActions>
                    </NotificationContent>
                  </NotificationItem>
                ))}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </NotificationList>
        {hasNextPage && (
          <LoadMoreButton onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </LoadMoreButton>
        )}
        {data.pages[0].results.length === 0 && (
          <EmptyState>
            <EmptyStateIcon />
            <p>No notifications at the moment</p>
          </EmptyState>
        )}
      </NotificationWrapper>
      {showPreferences && (
        <NotificationPreferences onClose={() => setShowPreferences(false)} />
      )}
    </ThemeProvider>
  );
};

export default Notification;
NotiificationPreference.js:                                                                                      import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

const PreferencesWrapper = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PreferenceItem = styled.div`
  margin-bottom: 15px;
`;

const PreferenceLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const PreferenceCheckbox = styled.input`
  margin-right: 10px;
`;

const NotificationPreferences = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({});

  const { data: userPreferences, isLoading } = useQuery('userPreferences', () =>
    axios.get('/api/notification-preferences/')
  );

  const updatePreferencesMutation = useMutation(
    (newPreferences) => axios.put('/api/notification-preferences/', newPreferences),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userPreferences');
      },
    }
  );

  useEffect(() => {
    if (userPreferences) {
      setPreferences(userPreferences.data);
    }
  }, [userPreferences]);

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
    onClose();
  };

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <PreferencesWrapper>
      <h2>Notification Preferences</h2>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="email_notifications"
            checked={preferences.email_notifications}
            onChange={handlePreferenceChange}
          />
          Email Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="push_notifications"
            checked={preferences.push_notifications}
            onChange={handlePreferenceChange}
          />
          Push Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="sms_notifications"
            checked={preferences.sms_notifications}
            onChange={handlePreferenceChange}
          />
          SMS Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <button onClick={handleSave}>Save Preferences</button>
      <button onClick={onClose}>Cancel</button>
    </PreferencesWrapper>
  );
};

export default NotificationPreferences;
                                                                 
                                                                   
 api.js :                                                                          import axios from 'axios';

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
NotificationContext.js:                                       import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUnreadNotificationsCount } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotifications, 
        toggleNotifications, 
        unreadCount, 
        updateUnreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
NotificationPopup.js:                                                         import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

const PopupContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  width: 300px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const NotificationContent = styled.div`
  margin-bottom: 5px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

const NotificationMessage = styled.p`
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #666;
`;

const MarkAsReadButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.8rem;
`;

const MarkAllAsReadButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
`;

const NoNotifications = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const NotificationPopup = () => {
  const { showNotifications, toggleNotifications, updateUnreadCount } = useNotification();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
        .then(data => {
          if (data && Array.isArray(data)) {
            setNotifications(data);
            updateUnreadCount(data.length);
          } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
            setNotifications(data.results);
            updateUnreadCount(data.results.length);
          } else {
            console.error('Fetched notifications is not in the expected format:', data);
            setNotifications([]);
            updateUnreadCount(0);
          }
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
          updateUnreadCount(0);
        });
    }
  }, [showNotifications, updateUnreadCount]);
  

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.filter(n => n.id !== id);
        updateUnreadCount(updatedNotifications.length);
        return updatedNotifications;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      updateUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!showNotifications) return null;

  return (
    <PopupContainer>
      <PopupHeader>
        <h3>Notifications</h3>
        <CloseButton onClick={toggleNotifications}>&times;</CloseButton>
      </PopupHeader>
      <NotificationList>
        {notifications.length === 0 ? (
          <NoNotifications>No new notifications</NoNotifications>
        ) : (
          notifications.map(notification => (
            <NotificationItem key={notification.id}>
              <NotificationContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
              </NotificationContent>
              <MarkAsReadButton onClick={() => handleMarkAsRead(notification.id)}>
                Mark as read
              </MarkAsReadButton>
            </NotificationItem>
          ))
        )}
      </NotificationList>
      {notifications.length > 0 && (
        <MarkAllAsReadButton onClick={handleMarkAllAsRead}>
          Mark all as read
        </MarkAllAsReadButton>
      )}
    </PopupContainer>
  );
};

export default NotificationPopup;
Navbar.js:                                                   import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FaGoogle, FaArrowRight, FaBell } from 'react-icons/fa';
import NotificationPopup from './NotificationPopup';

const Nav = styled.nav`
  background-color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavList = styled.ul`
  display: flex;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  color: #0056b3;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;

const ArrowIcon = styled(FaArrowRight)`
  margin-left: 5px;
`;

const HiddenNav = styled.div`
  display: none;
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #0056b3;
  font-size: 1.2rem;
  position: relative;
`;

const UnreadBadge = styled.span`
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  position: absolute;
  top: -5px;
  right: -5px;
`;

const Navbar = () => {
  const { isAuthenticated, logout, isGoogleAuthenticated, authenticateWithGoogle } = useAuth();
  const { showNotifications, toggleNotifications, unreadCount } = useNotification();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <Nav>
      <NavList>
        {!isHomePage && (
          <NavItem>
            <NavLink to="/">
              Click here to go back Home <ArrowIcon />
            </NavLink>
          </NavItem>
        )}
        {isAuthenticated && (
          <NavItem>
            <NotificationButton onClick={toggleNotifications}>
              <FaBell />
              {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
            </NotificationButton>
            {showNotifications && <NotificationPopup />}
          </NavItem>
        )}
      </NavList>
      
      <HiddenNav>
        <NavList>
          <NavItem><NavLink to="/">Home</NavLink></NavItem>
          <NavItem><NavLink to="/profile-home">Profile Home</NavLink></NavItem>
          <NavItem><NavLink to="/google-services"><FaGoogle /> Google Services</NavLink></NavItem>
          <NavItem><NavLink to="/analytics">Analytics</NavLink></NavItem>
          <NavItem><NavLink to="/calendar">Calendar</NavLink></NavItem>
          <NavItem><NavLink to="/dashboard">Dashboard</NavLink></NavItem>
          <NavItem><NavLink to="/tasks">Tasks</NavLink></NavItem>
          <NavItem><NavLink to="/calendar">Calendar</NavLink></NavItem>
          <NavItem><NavLink to="/analytics">Analytics</NavLink></NavItem>
          <NavItem><NavLink to="/task-categories">Categories</NavLink></NavItem>
          <NavItem><NavLink to="/task-tags">Tags</NavLink></NavItem>
          <NavItem><NavLink to="/time-tracking">Time Tracking</NavLink></NavItem>
          <NavItem><NavLink to="/profile">Profile</NavLink></NavItem>
          <NavItem><NavLink to="/settings">Settings</NavLink></NavItem>
          <NavItem><NavLink to="/notifications">Notifications</NavLink></NavItem>
          
          {isAuthenticated ? (
            <>
              <NavItem><NavLink to="/profile-home">Profile Home</NavLink></NavItem>
              
              {isGoogleAuthenticated ? (
                <NavItem><NavLink to="/google-services"><FaGoogle /> Google Services</NavLink></NavItem>
              ) : (
                <NavItem><NavLink to="#" onClick={authenticateWithGoogle}><FaGoogle /> Connect Google</NavLink></NavItem>
              )}
              <NavItem><NavLink to="/logout" onClick={logout}>Logout</NavLink></NavItem>
            </>
          ) : (
            <>
              <NavItem><NavLink to="/login">Login</NavLink></NavItem>
              <NavItem><NavLink to="/register">Register</NavLink></NavItem>
            </>
          )}
        </NavList>
      </HiddenNav>
    </Nav>
  );
};

export default Navbar;

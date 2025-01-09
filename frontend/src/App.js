import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { store } from './store'; 

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Profile from './pages/Profile';
import AccountActivation from './components/AccountActivation';
import Navbar from './components/Navbar';
import PasswordReset from './pages/PasswordReset';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetails';
import CreateTask from './components/CreateTask';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import Notification from './components/Notification';
import NotificationPopup from './components/NotificationPopup';
import Settings from './components/Settings';
import FeaturesPage from './pages/FeaturesPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import ProfileHome from './pages/ProfileHome';
import AIIntegration from './components/AIIntegration';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  fetchCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  toggleTaskCompletion, 
  rescheduleTask 
} from './services/api';

const queryClient = new QueryClient();

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const fetchTasksData = useCallback(async () => {
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      console.log('Tasks after fetching:', fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  }, []);

  const fetchCalendarEventsData = useCallback(async (start, end) => {
    try {
      const fetchedEvents = await fetchCalendarEvents(start, end);
      setCalendarEvents(Array.isArray(fetchedEvents) ? fetchedEvents : []);
      console.log('Calendar events after fetching:', fetchedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setCalendarEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  const handleTaskCreated = async (newTask) => {
    try {
      const createdTask = await createTask(newTask);
      setTasks(prevTasks => [...prevTasks, createdTask]);
      fetchTasksData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskUpdated = async (updatedTask) => {
    try {
      const response = await updateTask(updatedTask.id, updatedTask);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? response : task
      ));
      fetchTasksData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDeleted = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      fetchTasksData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCalendarEventCreated = async (newEvent) => {
    try {
      const createdEvent = await createCalendarEvent(newEvent);
      setCalendarEvents(prevEvents => [...prevEvents, createdEvent]);
      fetchCalendarEventsData(newEvent.start, newEvent.end);
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  };

  const handleCalendarEventUpdated = async (updatedEvent) => {
    try {
      const response = await updateCalendarEvent(updatedEvent.id, updatedEvent);
      setCalendarEvents(prevEvents => prevEvents.map(event => 
        event.id === updatedEvent.id ? response : event
      ));
      fetchCalendarEventsData(updatedEvent.start, updatedEvent.end);
    } catch (error) {
      console.error('Error updating calendar event:', error);
    }
  };

  const handleCalendarEventDeleted = async (eventId) => {
    try {
      await deleteCalendarEvent(eventId);
      setCalendarEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  };

  const handleToggleTaskCompletion = async (taskId) => {
    try {
      const updatedTask = await toggleTaskCompletion(taskId);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      fetchTasksData();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleRescheduleTask = async (taskId, newStart, newEnd) => {
    try {
      const updatedTask = await rescheduleTask(taskId, newStart, newEnd);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      fetchTasksData();
      fetchCalendarEventsData(newStart, newEnd);
    } catch (error) {
      console.error('Error rescheduling task:', error);
    }
  };

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId="1087053886578-7vp5m8dr89b5lacu5286a4529ev0ucht.apps.googleusercontent.com">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <SocketProvider>
                <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                  <GlobalStyles />
                  <Router>
                    <Navbar />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/activate/:uidb64/:token/:userId" element={<AccountActivation />} />
                      <Route path="/password-reset" element={<PasswordReset />} />
                      <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirm />} />
                      <Route path="/features" element={<FeaturesPage />} />
                      <Route path="/profile-home" element={<ProfileHome />} />
                      <Route path="/notification" element={<Notification />} />
                      <Route path="/google-services" element={<AIIntegration />} />
                      <Route path="/calendar" element={
                        <Calendar 
                          events={calendarEvents}
                          onEventCreated={handleCalendarEventCreated}
                          onEventUpdated={handleCalendarEventUpdated}
                          onEventDeleted={handleCalendarEventDeleted}
                        />
                      } />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/tasks" element={
                        <TaskList 
                          tasks={tasks}
                          onTaskUpdated={handleTaskUpdated}
                          onTaskDeleted={handleTaskDeleted}
                          onToggleCompletion={handleToggleTaskCompletion}
                        />
                      } />
                      <Route path="/tasks/create" element={<CreateTask onTaskCreated={handleTaskCreated} />} />
                      <Route path="/tasks/:id" element={<TaskDetail />} />
                      <Route path="/settings" element={<Settings toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />} />
                      <Route path="/task-categories" element={<div>Task Categories</div>} />
                      <Route path="/task-tags" element={<div>Task Tags</div>} />
                      <Route path="/time-tracking" element={<div>Time Tracking</div>} />
                      <Route path="/manage-tags" element={<div>Manage Tags</div>} />
                      <Route path="/manage-categories" element={<div>Manage Categories</div>} />
                      <Route path="/ai-insights" element={<AIIntegration />} />
                      
                      {/* Protected routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/profile-home" element={<ProfileHome />} />
                      </Route>

                      {/* Catch-all route for 404 */}
                      <Route path="*" element={<div>Page Not Found</div>} />
                    </Routes>
                    <ToastContainer />
                    <NotificationPopup />
                  </Router>
                </ThemeProvider>
              </SocketProvider>
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
};

export default App;

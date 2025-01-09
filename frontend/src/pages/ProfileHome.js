// ProfileHome.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNotification } from '../context/NotificationContext';
import NotificationPopup from '../components/NotificationPopup';
import Settings from '../components/Settings';
import AIInsights from '../components/AIIntegration/AIInsights';
import { FaRobot } from 'react-icons/fa';




// Icons
import { 
  FaBars, 
  FaTasks, 
  FaCalendarAlt, 
  FaGoogle, 
  FaChartBar, 
  FaUserCircle, 
  FaBell, 
  FaCog, 
  FaSignOutAlt, 
  FaHome, 
  FaClipboardList, 
  FaPlus, 
  FaClock, 
  FaTag, 
  FaFolder, 
  FaArrowLeft, 
} from 'react-icons/fa';

// Context
import { useAuth } from '../context/AuthContext';

// Components
import CreateTask from '../components/CreateTask';
import GoogleServices from '../components/GoogleServices';
import { FilterTasks, ManageCategories, ManageTags, AssignTasks, TaskReminders } from './TasksComponents';

// API Services
import {
  fetchTasks,
  updateTask,
  deleteTask,
  fetchSubTasks,
  createSubTask,
  updateTaskProgress,
  fetchCategories,
  fetchTags,
  fetchTimeLogs,
  createTimeLog,
  createComment,
  createAttachment,
  loginWithGoogle,
  createGoogleCalendarEvent,
  uploadToGoogleDrive,
  createGoogleSheet,
  createGoogleDocument,
  createGoogleForm,
  listGoogleDriveFiles,
  getGoogleSheetData,
  updateGoogleDocument,
  addQuestionsToGoogleForm,
  listGoogleCalendarEvents,
  deleteGoogleDriveFile,
  updateGoogleSheetData,
  updateGoogleCalendarEvent,
} from '../services/api';

// Styled Components
import {
  PageContainer,
  Sidebar,
  MainContent,
  MenuToggle,
  MenuItem,
  DropdownContainer,
  DropdownContent,
  ProfileSection,
  WelcomeMessage,
  QuickActions,
  ActionButton,
  TaskList,
  Task,
  TaskTitle,
  TaskDescription,
  TaskActions,
  TaskActionButton,
  Input,
  TextArea,
  Button,
  FileInput,
  Select,
  Label,
  ErrorMessage,
  Spinner,
  Section,
  SectionTitle,
  Card,
  CardContent,
  Badge,
  ProgressBar,
  ProgressFill,
  Header,
  HeaderTitle,
  DropdownToggle,
  UserIcon,
  ChevronIcon,
  HeaderDropdown,
  DropdownItem,
  DropdownMenu,
  ContentWrapper,
  NotificationButton,
  UnreadBadge,
  FormGroup,
  TaskDetailHeader,
  TaskTitleContainer,
  TaskDetailsContainer,
  TaskInfoCard,
  TagsContainer,
  DetailSection,
  ProgressContainer,
  InputGroup,
  SubtaskList,
  SubtaskItem,
  FileUploadZone,
  TimeTrackingContainer,
  ReminderContainer
} from '../components/ProfileHomeStyles';

const ProfileHome = () => {
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTasksDropdownOpen, setIsTasksDropdownOpen] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const { showNotifications, toggleNotifications, unreadCount } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [newComment, setNewComment] = useState('');
  const [taskProgress, setTaskProgress] = useState(0);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [formId, setFormId] = useState('');
  const [formQuestions, setFormQuestions] = useState([]);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('tasks');

  const navigate = useNavigate();
  const { user, refreshUserProfile, logout } = useAuth();

  // Effect for initial data fetching
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchSubtasks(selectedTask.id);
      fetchTimeLogs(selectedTask.id);
      fetchComments(selectedTask.id);
      fetchAttachments(selectedTask.id);
    }
  }, [selectedTask]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, categoriesData, tagsData] = await Promise.all([
        fetchTasks(),
        fetchCategories(),
        fetchTags()
      ]);
      setTasks(tasksData.data);
      setCategories(categoriesData.data);
      setTags(tagsData.data);
    } catch (error) {
      setError('Error fetching data');
      toast.error('Error fetching data');
    }
    setIsLoading(false);
  };

  // Navigation and Menu Handlers
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTasksDropdown = () => setIsTasksDropdownOpen(!isTasksDropdownOpen);
  const toggleHeaderDropdown = () => setIsHeaderDropdownOpen(!isHeaderDropdownOpen);
  
  // Task Management Handlers
  const handleUpdateTask = async (taskId, updatedData) => {
    setIsLoading(true);
    try {
      const updatedTask = await updateTask(taskId, updatedData);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask.data : task));
      toast.success('Task updated successfully');
    } catch (error) {
      setError('Error updating task');
      toast.error('Error updating task');
    }
    setIsLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      setError('Error deleting task');
      toast.error('Error deleting task');
    }
    setIsLoading(false);
  };

  const handleCreateSubtask = async () => {
    if (!selectedTask || !newSubtask.trim()) return;
    
    setIsLoading(true);
    try {
      const createdSubtask = await createSubTask(selectedTask.id, { title: newSubtask });
      setSelectedTask({ 
        ...selectedTask, 
        subtasks: [...selectedTask.subtasks, createdSubtask.data] 
      });
      setNewSubtask('');
      toast.success('Subtask created successfully');
    } catch (error) {
      setError('Error creating subtask');
      toast.error('Error creating subtask');
    }
    setIsLoading(false);
  };

  const fetchSubtasks = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetchSubTasks(taskId);
      setSelectedTask({
        ...selectedTask,
        subtasks: response.data
      });
    } catch (error) {
      setError('Error fetching subtasks');
      toast.error('Error fetching subtasks');
    }
    setIsLoading(false);
  };

  const handleCreateTimeLog = async () => {
    if (!selectedTask || !logDuration) return;
    
    setIsLoading(true);
    try {
      await createTimeLog(selectedTask.id, { duration: parseInt(logDuration) });
      toast.success('Time log created successfully');
      setLogDuration('');
    } catch (error) {
      setError('Error creating time log');
      toast.error('Error creating time log');
    }
    setIsLoading(false);
  };

  const fetchTimeLogs = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetchTimeLogs(taskId);
      setSelectedTask({
        ...selectedTask,
        timeLogs: response.data
      });
    } catch (error) {
      setError('Error fetching time logs');
      toast.error('Error fetching time logs');
    }
    setIsLoading(false);
  };

  const handleCreateComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    
    setIsLoading(true);
    try {
      await createComment(selectedTask.id, { content: newComment });
      toast.success('Comment added successfully');
      setNewComment('');
    } catch (error) {
      setError('Error adding comment');
      toast.error('Error adding comment');
    }
    setIsLoading(false);
  };

  const fetchComments = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetchComments(taskId);
      setSelectedTask({
        ...selectedTask,
        comments: response.data
      });
    } catch (error) {
      setError('Error fetching comments');
      toast.error('Error fetching comments');
    }
    setIsLoading(false);
  };

  const handleCreateAttachment = async (file) => {
    if (!selectedTask || !file) return;
    
    setIsLoading(true);
    try {
      await createAttachment(selectedTask.id, file);
      toast.success('Attachment added successfully');
    } catch (error) {
      setError('Error adding attachment');
      toast.error('Error adding attachment');
    }
    setIsLoading(false);
  };

  const fetchAttachments = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetchAttachments(taskId);
      setSelectedTask({
        ...selectedTask,
        attachments: response.data
      });
    } catch (error) {
      setError('Error fetching attachments');
      toast.error('Error fetching attachments');
    }
    setIsLoading(false);
  };

  // Task Progress Handler
  const handleUpdateTaskProgress = async () => {
    if (!selectedTask || taskProgress < 0 || taskProgress > 100) return;
    
    setIsLoading(true);
    try {
      await updateTaskProgress(selectedTask.id, taskProgress);
      toast.success('Task progress updated successfully');
      setSelectedTask(prevTask => ({
        ...prevTask,
        progress: taskProgress
      }));
    } catch (error) {
      setError('Error updating task progress');
      toast.error('Error updating task progress');
    }
    setIsLoading(false);
  };

  // Google Integration Handlers
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      setIsGoogleAuthenticated(true);
      toast.success('Google account connected successfully');
    } catch (error) {
      setError('Error connecting Google account');
      toast.error('Error connecting Google account');
    }
  };

  const handleCreateGoogleCalendarEvent = async () => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await createGoogleCalendarEvent(selectedTask.id);
      toast.success('Event added to Google Calendar');
    } catch (error) {
      setError('Error adding event to Google Calendar');
      toast.error('Error adding event to Google Calendar');
    }
    setIsLoading(false);
  };

  const handleUploadToGoogleDrive = async (file) => {
    setIsLoading(true);
    try {
      await uploadToGoogleDrive(file);
      toast.success('File uploaded to Google Drive');
    } catch (error) {
      setError('Error uploading file to Google Drive');
      toast.error('Error uploading file to Google Drive');
    }
    setIsLoading(false);
  };

  const handleCreateGoogleSheet = async () => {
    setIsLoading(true);
    try {
      await createGoogleSheet();
      toast.success('Google Sheet created successfully');
    } catch (error) {
      setError('Error creating Google Sheet');
      toast.error('Error creating Google Sheet');
    }
    setIsLoading(false);
  };

  const handleCreateGoogleDocument = async () => {
    setIsLoading(true);
    try {
      await createGoogleDocument();
      toast.success('Google Document created successfully');
    } catch (error) {
      setError('Error creating Google Document');
      toast.error('Error creating Google Document');
    }
    setIsLoading(false);
  };
  const handleCreateGoogleForm = async () => {
    setIsLoading(true);
    try {
      await createGoogleForm();
      toast.success('Google Form created successfully');
    } catch (error) {
      setError('Error creating Google Form');
      toast.error('Error creating Google Form');
    }
    setIsLoading(false);
  };

  const handleListGoogleDriveFiles = async () => {
    setIsLoading(true);
    try {
      const files = await listGoogleDriveFiles();
      console.log(files);
      toast.success('Google Drive files retrieved successfully');
    } catch (error) {
      setError('Error listing Google Drive files');
      toast.error('Error listing Google Drive files');
    }
    setIsLoading(false);
  };

  const handleGetGoogleSheetData = async (spreadsheetId) => {
    setIsLoading(true);
    try {
      const data = await getGoogleSheetData(spreadsheetId);
      console.log(data);
      toast.success('Google Sheet data retrieved successfully');
    } catch (error) {
      setError('Error retrieving Google Sheet data');
      toast.error('Error retrieving Google Sheet data');
    }
    setIsLoading(false);
  };

  const handleUpdateGoogleDocument = async (documentId, content) => {
    setIsLoading(true);
    try {
      await updateGoogleDocument(documentId, content);
      toast.success('Google Document updated successfully');
    } catch (error) {
      setError('Error updating Google Document');
      toast.error('Error updating Google Document');
    }
    setIsLoading(false);
  };

  const handleAddQuestionsToGoogleForm = async (formId, questions) => {
    setIsLoading(true);
    try {
      await addQuestionsToGoogleForm(formId, questions);
      toast.success('Questions added to Google Form successfully');
    } catch (error) {
      setError('Error adding questions to Google Form');
      toast.error('Error adding questions to Google Form');
    }
    setIsLoading(false);
  };

  const handleListGoogleCalendarEvents = async () => {
    setIsLoading(true);
    try {
      const events = await listGoogleCalendarEvents();
      console.log(events);
      toast.success('Google Calendar events retrieved successfully');
    } catch (error) {
      setError('Error listing Google Calendar events');
      toast.error('Error listing Google Calendar events');
    }
    setIsLoading(false);
  };

  const handleDeleteGoogleDriveFile = async (fileId) => {
    setIsLoading(true);
    try {
      await deleteGoogleDriveFile(fileId);
      toast.success('Google Drive file deleted successfully');
    } catch (error) {
      setError('Error deleting Google Drive file');
      toast.error('Error deleting Google Drive file');
    }
    setIsLoading(false);
  };

  const handleUpdateGoogleSheetData = async (spreadsheetId, range, values) => {
    setIsLoading(true);
    try {
      await updateGoogleSheetData(spreadsheetId, range, values);
      toast.success('Google Sheet data updated successfully');
    } catch (error) {
      setError('Error updating Google Sheet data');
      toast.error('Error updating Google Sheet data');
    }
    setIsLoading(false);
  };

  const handleUpdateGoogleCalendarEvent = async (eventId, eventData) => {
    setIsLoading(true);
    try {
      await updateGoogleCalendarEvent(eventId, eventData);
      toast.success('Google Calendar event updated successfully');
    } catch (error) {
      setError('Error updating Google Calendar event');
      toast.error('Error updating Google Calendar event');
    }
    setIsLoading(false);
  };

  // Menu Configuration
  const menuItems = [
    { 
      icon: <FaTasks />, 
      text: 'Tasks', 
      action: toggleTasksDropdown,
      subItems: [
        { text: 'All Tasks', action: () => setActiveView('tasks') },
        { text: 'Create Task', action: () => setShowCreateTask(true) },
        { text: 'Filter Tasks', action: () => setActiveView('filterTasks') },
        { text: 'Manage Categories', action: () => setActiveView('manageCategories') },
        { text: 'Manage Tags', action: () => setActiveView('manageTags') },
        { text: 'Assign Tasks', action: () => setActiveView('assignTasks') },
        { text: 'Task Reminders', action: () => setActiveView('taskReminders') },
        { text: 'Time Tracking', action: () => setActiveView('timetracking') },
      ]
    },
    { icon: <FaCalendarAlt />, text: 'Calendar', action: () => navigate('/calendar') },
    { icon: <FaGoogle />, text: 'Google Services', action: () => setActiveView('googleServices') },
    { icon: <FaRobot />, text: 'AI Insights', action: () => setActiveView('aiInsights') },
    { icon: <FaChartBar />, text: 'Analytics', action: () => navigate('/analytics') },
  ];

  const headerDropdownItems = [
    { 
      icon: (
        <NotificationButton onClick={(e) => e.stopPropagation()}>
          <FaHome />
        </NotificationButton>
      ),
      text: 'Home',
      action: () => navigate('/')
    },
    { 
      icon: (
        <NotificationButton onClick={(e) => e.stopPropagation()}>
          <FaUserCircle />
        </NotificationButton>
      ),
      text: 'Profile',
      action: () => navigate('/profile')
    },
    { 
      icon: (
        <NotificationButton onClick={(e) => e.stopPropagation()}>
          <FaClipboardList />
        </NotificationButton>
      ),
      text: 'Dashboard',
      action: () => navigate('/dashboard')
    },
    { 
      icon: (
        <NotificationButton onClick={(e) => {
          e.stopPropagation();
          toggleNotifications();
        }}>
          <FaBell />
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </NotificationButton>
      ), 
      text: 'Notifications',
      action: (e) => {
        e.stopPropagation();
        toggleNotifications();
      }
    },
    { 
      icon: (
        <NotificationButton onClick={(e) => e.stopPropagation()}>
          <FaCog />
        </NotificationButton>
      ),
      text: 'Settings',
      action: () => navigate('/settings')
    },
    { 
      icon: (
        <NotificationButton onClick={(e) => e.stopPropagation()}>
          <FaSignOutAlt />
        </NotificationButton>
      ),
      text: 'Logout',
      action: logout
    },
  ];
  

  // Handle task creation callback
  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowCreateTask(false);
    toast.success('Task created successfully');
  };

  return (
    <PageContainer>
      <Header>
        <HeaderTitle>TaskSphere</HeaderTitle>
        <HeaderDropdown>
          <DropdownToggle onClick={toggleHeaderDropdown}>
            <UserIcon />
            <span>{user?.first_name || user?.username}</span>
            <ChevronIcon />
          </DropdownToggle>
          {isHeaderDropdownOpen && (
            <DropdownMenu>
              {headerDropdownItems.map((item, index) => (
                <DropdownItem key={index} onClick={item.action}>
                  {item.icon}
                  {item.text}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </HeaderDropdown>
        {showNotifications && <NotificationPopup />}
      </Header>  

      <ContentWrapper>
        <Sidebar
          initial={false}
          animate={{ width: isMenuOpen ? '250px' : '60px' }}
        >
          <MenuToggle onClick={toggleMenu}>
            <FaBars />
          </MenuToggle>
          <AnimatePresence>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <MenuItem
                  onClick={item.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.icon}
                  {isMenuOpen && item.text}
                </MenuItem>
                {isMenuOpen && item.subItems && isTasksDropdownOpen && (
                  <DropdownContainer>
                    <DropdownContent
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {item.subItems.map((subItem, subIndex) => (
                        <MenuItem key={subIndex} onClick={subItem.action}>
                          {subItem.text}
                        </MenuItem>
                      ))}
                    </DropdownContent>
                  </DropdownContainer>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </Sidebar>

        <MainContent>
          {showCreateTask ? (
            <CreateTask 
              onClose={() => setShowCreateTask(false)}
              onTaskCreated={handleTaskCreated}
            />
          ) : (
            <>
              {activeView === 'tasks' && (
                <>
                  <ProfileSection>
                    <WelcomeMessage>
                      Welcome, {user?.first_name || user?.username}!
                    </WelcomeMessage>
                    {user && (
                      <>
                        <p>Email: {user.email}</p>
                        <p>Last Login: {new Date(user.last_login).toLocaleString()}</p>
                      </>
                    )}
                  </ProfileSection>
                  <Settings/>
                  <QuickActions>
                    <ActionButton onClick={() => setShowCreateTask(true)}>
                      <FaPlus /> Recents
                    </ActionButton>
                    
                  </QuickActions>

                  {isLoading ? (
                    <Spinner />
                  ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                  ) : (
                    <TaskList>
                      {tasks.map(task => (
                        <Task key={task.id}>
                          <TaskTitle>{task.title}</TaskTitle>
                          <TaskDescription>{task.description}</TaskDescription>
                          <Badge>{task.category.name}</Badge>
                          <Badge priority={task.priority}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          <ProgressBar>
                            <ProgressFill width={task.progress || 0} />
                          </ProgressBar>
                          <TaskActions>
                            <TaskActionButton
                              onClick={() => handleUpdateTask(task.id, { completed: !task.completed })}
                            >
                              {task.completed ? 'Unmark Complete' : 'Mark Complete'}
                            </TaskActionButton>
                            <TaskActionButton onClick={() => setSelectedTask(task)}>
                              View Details
                            </TaskActionButton>
                            <TaskActionButton onClick={() => handleDeleteTask(task.id)}>
                              Delete
                            </TaskActionButton>
                          </TaskActions>
                        </Task>
                      ))}
                    </TaskList>
                  )}
                </>
              )}
              {activeView === 'filterTasks' && (
                <FilterTasks tasks={tasks} setTasks={setTasks} categories={categories} tags={tags} />
              )}
              {activeView === 'manageCategories' && (
                <ManageCategories categories={categories} setCategories={setCategories} />
              )}
              {activeView === 'manageTags' && (
                <ManageTags tags={tags} setTags={setTags} />
              )}
              {activeView === 'assignTasks' && (
                <AssignTasks tasks={tasks} setTasks={setTasks} />
              )}
              {activeView === 'taskReminders' && (
                <TaskReminders tasks={tasks} />
              )}
              {activeView === 'aiInsights' && (
                <AIInsights />
              )}
              {activeView === 'googleServices' && (
                <GoogleServices
                  isGoogleAuthenticated={isGoogleAuthenticated}
                  onGoogleLogin={handleGoogleLogin}
                  onCreateCalendarEvent={handleCreateGoogleCalendarEvent}
                  onUploadToDrive={handleUploadToGoogleDrive}
                  onCreateSheet={handleCreateGoogleSheet}
                  onCreateDocument={handleCreateGoogleDocument}
                  onCreateForm={handleCreateGoogleForm}
                  onListDriveFiles={handleListGoogleDriveFiles}
                  onGetSheetData={handleGetGoogleSheetData}
                  onUpdateDocument={handleUpdateGoogleDocument}
                  onAddFormQuestions={handleAddQuestionsToGoogleForm}
                  onListCalendarEvents={handleListGoogleCalendarEvents}
                  onDeleteDriveFile={handleDeleteGoogleDriveFile}
                  onUpdateSheetData={handleUpdateGoogleSheetData}
                  onUpdateCalendarEvent={handleUpdateGoogleCalendarEvent}
                />
              )}
            </>
          )}
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ProfileHome;

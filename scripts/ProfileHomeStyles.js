// React and Router imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Third-party libraries
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

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

// API Services
import {
  // Task Management
  fetchTasks,
  updateTask,
  deleteTask,
  fetchSubTasks,
  createSubTask,
  updateTaskProgress,
  assignTask,
  
  // Categories and Tags
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchTags,
  createTag,
  deleteTag,
  
  // Time and Reminders
  fetchTimeLogs,
  createTimeLog,
  snoozeReminder,
  sendTaskReminder,
  
  // Task Interactions
  createComment,
  createAttachment,
  filterTasks,
  
  // Google Integration
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
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
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
  const [selectedUserId, setSelectedUserId] = useState('');
  const [snoozeTime, setSnoozeTime] = useState('');

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
  

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    
    setIsLoading(true);
    try {
      const createdCategory = await createCategory({ name: newCategory });
      setCategories([...categories, createdCategory.data]);
      setNewCategory('');
      toast.success('Category created successfully');
    } catch (error) {
      setError('Error creating category');
      toast.error('Error creating category');
    }
    setIsLoading(false);
  };


  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    
    setIsLoading(true);
    try {
      const createdTag = await createTag({ name: newTag });
      setTags([...tags, createdTag.data]);
      setNewTag('');
      toast.success('Tag created successfully');
    } catch (error) {
      setError('Error creating tag');
      toast.error('Error creating tag');
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
  

  const handleAssignTask = async (userId) => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await assignTask(selectedTask.id, userId);
      toast.success('Task assigned successfully');
      // Refresh the selected task to reflect the new assignment
      const updatedTask = await fetchTasks(selectedTask.id);
      setSelectedTask(updatedTask.data);
    } catch (error) {
      setError('Error assigning task');
      toast.error('Error assigning task');
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
  

  const handleSnoozeReminder = async (snoozeTime) => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await snoozeReminder(selectedTask.id, snoozeTime);
      toast.success('Reminder snoozed successfully');
    } catch (error) {
      setError('Error snoozing reminder');
      toast.error('Error snoozing reminder');
    }
    setIsLoading(false);
  };

  const handleSendTaskReminder = async () => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await sendTaskReminder(selectedTask.id);
      toast.success('Reminder sent successfully');
    } catch (error) {
      setError('Error sending reminder');
      toast.error('Error sending reminder');
    }
    setIsLoading(false);
  };

  // Task Progress and Filtering Handlers
  const handleUpdateTaskProgress = async () => {
    if (!selectedTask || taskProgress < 0 || taskProgress > 100) return;
    
    setIsLoading(true);
    try {
      await updateTaskProgress(selectedTask.id, taskProgress);
      toast.success('Task progress updated successfully');
      // Update the selected task with the new progress
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


  const handleFilterTasks = async () => {
    setIsLoading(true);
    try {
      const filteredTasks = await filterTasks(filterPriority, filterTag, filterDeadline);
      setTasks(filteredTasks.data);
    } catch (error) {
      setError('Error filtering tasks');
      toast.error('Error filtering tasks');
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
      ]
    },
    { icon: <FaCalendarAlt />, text: 'Calendar', action: () => navigate('/calendar') },
    { icon: <FaGoogle />, text: 'Google Services', action: () => setActiveView('googleServices') },
    { icon: <FaGoogle />, text: 'Google Integration', action: () => setActiveView('googleIntegration') },
    { icon: <FaChartBar />, text: 'Analytics', action: () => navigate('/analytics') },
  ];

  const headerDropdownItems = [
    { icon: <FaHome />, text: 'Home', action: () => navigate('/') },
    { icon: <FaUserCircle />, text: 'Profile', action: () => navigate('/profile') },
    { icon: <FaClipboardList />, text: 'Dashboard', action: () => navigate('/dashboard') },
    { icon: <FaBell />, text: 'Notifications', action: () => navigate('/notifications') },
    { icon: <FaCog />, text: 'Settings', action: () => navigate('/settings') },
    { icon: <FaSignOutAlt />, text: 'Logout', action: logout },
  ];

  // Handle task creation callback
  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowCreateTask(false);
    toast.success('Task created successfully');
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setIsLoading(true);
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      setError('Error deleting category');
      toast.error('Error deleting category');
    }
    setIsLoading(false);
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    
    setIsLoading(true);
    try {
      await deleteTag(tagId);
      setTags(tags.filter(tag => tag.id !== tagId));
      toast.success('Tag deleted successfully');
    } catch (error) {
      setError('Error deleting tag');
      toast.error('Error deleting tag');
    }
    setIsLoading(false);
  };

  return (
    <PageContainer>
      <Header>
        <HeaderTitle>TaskSphere</HeaderTitle>
        <HeaderDropdown>
          <DropdownToggle>
            <UserIcon />
            <span>{user?.first_name || user?.username}</span>
            <ChevronIcon />
          </DropdownToggle>
          <DropdownMenu>
            {headerDropdownItems.map((item, index) => (
              <DropdownItem key={index} onClick={item.action}>
                {item.icon}
                {item.text}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </HeaderDropdown>
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
                  <QuickActions>
                    <ActionButton onClick={() => setShowCreateTask(true)}>
                      <FaPlus /> Create Task
                    </ActionButton>
                    <ActionButton onClick={() => navigate('/time-tracking')}>
                      <FaClock /> Time Tracking
                    </ActionButton>
                    <ActionButton onClick={() => navigate('/manage-tags')}>
                      <FaTag /> Manage Tags
                    </ActionButton>
                    <ActionButton onClick={() => navigate('/manage-categories')}>
                      <FaFolder /> Manage Categories
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

              {(activeView === 'googleServices' || activeView === 'googleIntegration') && (
                <Section>
                  <SectionTitle>
                    {activeView === 'googleServices' ? 'Google Services' : 'Google Integration'}
                  </SectionTitle>
                  {!isGoogleAuthenticated ? (
                    <Card>
                      <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                        <Button 
                          onClick={handleGoogleLogin} 
                          style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                        >
                          <FaGoogle style={{ marginRight: '0.5rem' }} /> Connect Google Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
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
                </Section>
              )}

              {activeView === 'filterTasks' && (
                <Section>
                  <SectionTitle>Filter Tasks</SectionTitle>
                  <FormGroup>
                    <Label>Priority</Label>
                    <Select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Select>

                    <Label>Tag</Label>
                    <Select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                    >
                      <option value="">All</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                      ))}
                    </Select>

                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={filterDeadline}
                      onChange={(e) => setFilterDeadline(e.target.value)}
                    />

                    <Button onClick={handleFilterTasks}>
                      Apply Filters
                    </Button>
                  </FormGroup>
                </Section>
              )}

              {activeView === 'manageCategories' && (
                <Section>
                  <SectionTitle>Manage Categories</SectionTitle>
                  <Input
                   type="text"
                   value={newCategory}
                   onChange={(e) => setNewCategory(e.target.value)}
                   placeholder="New Category Name"
                 />
                 <Button onClick={handleCreateCategory}>Create Category</Button>
                 {/* List existing categories here */}
                 {categories.map(category => (
                   <div key={category.id}>
                     <span>{category.name}</span>
                     <Button onClick={() => handleDeleteCategory(category.id)}>Delete</Button>
                   </div>
                  ))}
                </Section>
              )}

              {activeView === 'manageTags' && (
                <Section>
                  <SectionTitle>Manage Tags</SectionTitle>
                  <Input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="New Tag Name"
                 />
                 <Button onClick={handleCreateTag}>Create Tag</Button>
                 {/* List existing tags here */}
                 {tags.map(tag => (
                   <div key={tag.id}>
                     <span>{tag.name}</span>
                     <Button onClick={() => handleDeleteTag(tag.id)}>Delete</Button>
                   </div>
                  ))}
                </Section>
              )}
              {activeView === 'taskDetails' && selectedTask && (
                <Section>
                  <TaskDetailHeader>
                    <SectionTitle>Task Details</SectionTitle>
                    <Button variant="secondary" onClick={() => setActiveView('tasks')}>
                      <FaArrowLeft /> Back to Tasks
                    </Button>
                  </TaskDetailHeader>

                  <Card>
                    <TaskTitleContainer>
                      <h2>{selectedTask.title}</h2>
                      <Badge priority={selectedTask.priority}>
                        {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                      </Badge>
                    </TaskTitleContainer>

                    <TaskDetailsContainer>
                      <TaskInfoCard>
                        <p>{selectedTask.description}</p>
                        <TagsContainer>
                          <Badge>{selectedTask.category.name}</Badge>
                          <Badge>{new Date(selectedTask.due_date).toLocaleDateString()}</Badge>
                          {selectedTask.tags?.map((tag, index) => (
                            <Badge key={index} style={{ background: '#e9ecef' }}>{tag}</Badge>
                          ))}
                        </TagsContainer>
                      </TaskInfoCard>

                      {selectedTask && (
                         <Section>
                           <SectionTitle>Assign Task</SectionTitle>
                           <Select
                             value={selectedUserId}
                             onChange={(e) => setSelectedUserId(e.target.value)}
                           >
                             {/* Populate with user options */}
                           </Select>
                           <Button onClick={() => handleAssignTask(selectedUserId)}>Assign Task</Button>
                         </Section>
                      )}

                      {/* Progress Section */}
                      <DetailSection>
                        <Label>Progress Tracking</Label>
                        <ProgressBar height="12px" margin="1rem 0">
                          <ProgressFill width={taskProgress} />
                        </ProgressBar>
                        <ProgressContainer>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={taskProgress}
                            onChange={(e) => setTaskProgress(parseInt(e.target.value))}
                          />
                          <span>{taskProgress}%</span>
                          <Button onClick={handleUpdateTaskProgress} minWidth="120px">
                            Update Progress
                          </Button>
                        </ProgressContainer>
                      </DetailSection>

                      {/* Subtasks Section */}
                      <DetailSection>
                        <Label>Subtasks</Label>
                        <InputGroup>
                          <Input
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            placeholder="Enter new subtask"
                          />
                          <Button onClick={handleCreateSubtask}>Add Subtask</Button>
                        </InputGroup>
                        <SubtaskList>
                        {selectedTask.subtasks?.map((subtask, index) => (
                            <SubtaskItem key={subtask.id || index}>
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleUpdateTask(subtask.id, { completed: !subtask.completed })}
                              />
                              <span>{subtask.title}</span>
                            </SubtaskItem>
                          ))}
                        </SubtaskList>
                      </DetailSection>

                      {/* Time Tracking Section */}
                      <DetailSection>
                        <Label>Time Tracking</Label>
                        <TimeTrackingContainer>
                          <Input
                            type="number"
                            value={logDuration}
                            onChange={(e) => setLogDuration(e.target.value)}
                            placeholder="Duration in minutes"
                          />
                          <Button onClick={handleCreateTimeLog}>Log Time</Button>
                        </TimeTrackingContainer>
                      </DetailSection>

                      {/* Comments Section */}
                      <DetailSection>
                        <Label>Comments</Label>
                        <InputGroup>
                          <TextArea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment"
                          />
                          <Button onClick={handleCreateComment}>Add Comment</Button>
                        </InputGroup>
                      </DetailSection>

                      {/* Attachments Section */}
                      <DetailSection>
                        <Label>Attachments</Label>
                        <FileUploadZone>
                          <FileInput
                            type="file"
                            onChange={(e) => handleCreateAttachment(e.target.files[0])}
                          />
                        </FileUploadZone>
                      </DetailSection>

                      {/* Reminders Section */}
                      <DetailSection>
                        <Label>Reminders</Label>
                        <ReminderContainer>
                          <Input
                            type="datetime-local"
                            value={snoozeTime}
                            onChange={(e) => setSnoozeTime(e.target.value)}
                          />
                          <Button onClick={() => handleSnoozeReminder(snoozeTime)}>
                            Snooze Reminder
                          </Button>
                          <Button onClick={handleSendTaskReminder}>
                            Send Reminder Now
                          </Button>
                        </ReminderContainer>
                      </DetailSection>
                    </TaskDetailsContainer>
                  </Card>
                </Section>
              )}
            </>
          )}
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ProfileHome;



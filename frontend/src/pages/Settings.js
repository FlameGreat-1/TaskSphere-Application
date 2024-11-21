import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEllipsisV, FaTimes, FaEdit, FaTrash, FaClock, FaSearch, FaFilter, FaComment, FaPaperclip, FaChartBar, FaMoon, FaSun, FaDownload, FaUpload, FaShare } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useHotkeys } from 'react-hotkeys-hook';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import GanttChart from './GanttChart';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Themes
const lightTheme = {
  background: '#F4F5F7',
  cardBackground: '#FFFFFF',
  text: '#172B4D',
  lightText: '#5E6C84',
  border: '#E2E4E6',
  primary: '#0052CC',
  secondary: '#50C878',
  success: '#36B37E',
  warning: '#FFAB00',
  danger: '#FF5630',
};

const darkTheme = {
  background: '#2C3E50',
  cardBackground: '#34495E',
  text: '#ECF0F1',
  lightText: '#BDC3C7',
  border: '#7F8C8D',
  primary: '#3498DB',
  secondary: '#2ECC71',
  success: '#2ECC71',
  warning: '#F1C40F',
  danger: '#E74C3C',
};

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.3s ease;
  }
`;

// Styled Components
const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.background};
  padding: 20px;
  overflow-x: auto;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BoardTitle = styled.h1`
  font-size: 24px;
  color: ${props => props.theme.text};
  margin: 0;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
`;

const Column = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
`;

const ColumnHeader = styled.div`
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnTitle = styled.h2`
  font-size: 16px;
  margin: 0;
  color: ${props => props.theme.text};
`;

const TaskList = styled.div`
  padding: 8px;
  flex-grow: 1;
  overflow-y: auto;
`;

const Task = styled(motion.div)`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
`;

const TaskTitle = styled.h3`
  font-size: 14px;
  margin: 0 0 8px 0;
  color: ${props => props.theme.text};
`;

const TaskDescription = styled.p`
  font-size: 12px;
  color: ${props => props.theme.lightText};
  margin: 0;
`;

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const TaskDueDate = styled.span`
  font-size: 11px;
  color: ${props => props.theme.lightText};
`;

const TaskPriority = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  color: white;
  background-color: ${props => 
    props.priority === 'high' ? props.theme.danger :
    props.priority === 'medium' ? props.theme.warning :
    props.theme.success
  };
`;

const AddButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  padding: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme.cardBackground};
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background-color: ${props => props.theme.primary}dd;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${props => props.theme.lightText};
`;

const SwimlaneContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Swimlane = styled.div`
  background-color: ${props => props.theme.background};
  border-radius: 8px;
  padding: 16px;
`;

const SwimlaneTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 16px;
`;

const DependencyLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const TimeTracker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
`;

const FilterButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-left: 8px;
`;

const SubtaskList = styled.ul`
  list-style-type: none;
  padding-left: 20px;
`;

const SubtaskItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const CommentSection = styled.div`
  margin-top: 16px;
`;

const Comment = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Attachment = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
`;

const GanttChartContainer = styled.div`
  margin-top: 20px;
  overflow-x: auto;
`;

const AnalyticsDashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AnalyticsCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const KeyboardShortcutsModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const ArchiveContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
`;

const IntegrationButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-right: 8px;
  cursor: pointer;
`;

const WorkflowRuleContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  font-size: 24px;
`;

const EstimationBadge = styled.span`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
`;

const ShareButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
`;

const AddColumnForm = styled.form`
  display: flex;
  margin-top: 8px;
`;


// Mock data
const initialData = {
    tasks: {
      'task-1': { id: 'task-1', title: 'Create login page', description: 'Implement user authentication', dueDate: '2023-06-15', priority: 'high' },
      'task-2': { id: 'task-2', title: 'Design database schema', description: 'Plan the structure for user data', dueDate: '2023-06-20', priority: 'medium' },
      'task-3': { id: 'task-3', title: 'Set up CI/CD pipeline', description: 'Automate deployment process', dueDate: '2023-06-25', priority: 'low' },
      'task-4': { id: 'task-4', title: 'Implement responsive design', description: 'Ensure app works on mobile devices', dueDate: '2023-06-30', priority: 'medium' },
    },
    columns: {
      'column-1': {
        id: 'column-1',
        title: 'To Do',
        taskIds: ['task-1', 'task-2'],
      },
      'column-2': {
        id: 'column-2',
        title: 'In Progress',
        taskIds: ['task-3'],
      },
      'column-3': {
        id: 'column-3',
        title: 'Done',
        taskIds: ['task-4'],
      },
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
  };
  


const KanbanBoard = () => {
    const [boardData, setBoardData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [swimlanes, setSwimlanes] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [timers, setTimers] = useState({});
    const [customFields, setCustomFields] = useState([]);
    const [taskTemplates, setTaskTemplates] = useState([]);
    const [comments, setComments] = useState({});
    const [attachments, setAttachments] = useState({});
    const [showGanttChart, setShowGanttChart] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [boardTemplates, setBoardTemplates] = useState([]);
    const [workflowRules, setWorkflowRules] = useState([]);
    const [socket, setSocket] = useState(null);

  

    useEffect(() => {
        // Fetch initial board data
        const fetchBoardData = async () => {
            try {
                const response = await fetch('/api/board');
                const data = await response.json();
                setBoardData(data);
            } catch (error) {
                console.error('Error fetching board data:', error);
            }
        };
        fetchBoardData();

        // Initialize socket connection
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (boardData) {
            generateAnalyticsData();
        }
    }, [boardData]);

    useEffect(() => {
        if (socket) {
            socket.on('taskUpdate', (updatedTask) => {
                setBoardData(prevData => ({
                    ...prevData,
                    tasks: {
                        ...prevData.tasks,
                        [updatedTask.id]: updatedTask
                    }
                }));
            });
        }
    }, [socket]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'column') {
            const newColumnOrder = Array.from(boardData.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            const newState = {
                ...boardData,
                columnOrder: newColumnOrder,
            };
            setBoardData(newState);
            return;
        }

        const start = boardData.columns[source.droppableId];
        const finish = boardData.columns[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                taskIds: newTaskIds,
            };

            const newState = {
                ...boardData,
                columns: {
                    ...boardData.columns,
                    [newColumn.id]: newColumn,
                },
            };

            setBoardData(newState);
            return;
        }

        // Moving from one list to another
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
            ...start,
            taskIds: startTaskIds,
        };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds,
        };

        const newState = {
            ...boardData,
            columns: {
                ...boardData.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        };
        setBoardData(newState);
    };

    const openModal = (task = null) => {
        setCurrentTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentTask(null);
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const taskData = Object.fromEntries(formData.entries());

        if (currentTask) {
            // Edit existing task
            const updatedTask = { ...currentTask, ...taskData };
            updateTask(updatedTask.id, updatedTask);
        } else {
            // Add new task
            const newTaskId = `task-${Date.now()}`;
            const newTask = { id: newTaskId, ...taskData };
            addTask(newTask);
        }

        closeModal();
    };

    const openFilterModal = () => {
      // Implement the logic to open the filter modal
      console.log('Opening filter modal');
    };

    const getTaskPosition = (taskId) => {
      // Implement logic to get task position
      // This is a placeholder implementation
      return { x: 0, y: 0 };
    };

    const openWorkflowRuleModal = () => {
      // Implement the logic to open the workflow rule modal
      console.log('Opening workflow rule modal');
    };
    
    
    

    const addTask = (task) => {
        setBoardData(prevData => {
            const newTasks = { ...prevData.tasks, [task.id]: task };
            const newColumn = {
                ...prevData.columns['column-1'],
                taskIds: [...prevData.columns['column-1'].taskIds, task.id],
            };
            return {
                ...prevData,
                tasks: newTasks,
                columns: { ...prevData.columns, 'column-1': newColumn },
            };
        });
        socket.emit('taskUpdate', task);
    };

    const updateTask = (taskId, updates) => {
        setBoardData(prevData => {
            const updatedTask = { ...prevData.tasks[taskId], ...updates };
            socket.emit('taskUpdate', updatedTask);
            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            };
        });
    };

    const formatTime = (milliseconds) => {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    };
    

    const deleteTask = (taskId) => {
        setBoardData(prevData => {
            const newTasks = { ...prevData.tasks };
            delete newTasks[taskId];

            const newColumns = Object.entries(prevData.columns).reduce((acc, [columnId, column]) => {
                acc[columnId] = {
                    ...column,
                    taskIds: column.taskIds.filter(id => id !== taskId),
                };
                return acc;
            }, {});

            return {
                ...prevData,
                tasks: newTasks,
                columns: newColumns,
            };
        });
    };

    const addColumn = () => {
        if (!newColumnTitle.trim()) return;

        const newColumnId = `column-${Date.now()}`;
        const newColumn = {
            id: newColumnId,
            title: newColumnTitle,
            taskIds: [],
        };

        setBoardData(prevData => ({
            ...prevData,
            columns: {
                ...prevData.columns,
                [newColumnId]: newColumn,
            },
            columnOrder: [...prevData.columnOrder, newColumnId],
        }));

        setNewColumnTitle('');
    };

    const addSwimlane = (title) => {
        setSwimlanes(prev => [...prev, { id: Date.now(), title }]);
    };

    const addDependency = (taskId, dependentTaskId) => {
        setDependencies(prev => [...prev, { taskId, dependentTaskId }]);
    };

    const startTimer = (taskId) => {
        setTimers(prev => ({
            ...prev,
            [taskId]: { startTime: Date.now(), elapsed: prev[taskId]?.elapsed || 0 }
        }));
    };

    const stopTimer = (taskId) => {
        setTimers(prev => {
            const timer = prev[taskId];
            if (!timer) return prev;
            const elapsed = timer.elapsed + (Date.now() - timer.startTime);
            return { ...prev, [taskId]: { ...timer, elapsed, startTime: null } };
        });
    };

    const addCustomField = (field) => {
        setCustomFields(prev => [...prev, field]);
    };

    const handleSearch = useCallback(
        debounce((term) => {
            setSearchTerm(term);
        }, 300),
        []
    );

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const filteredTasks = useCallback(() => {
        return Object.values(boardData.tasks).filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilters = Object.entries(filters).every(([key, value]) => task[key] === value);
            return matchesSearch && matchesFilters;
        });
    }, [boardData, searchTerm, filters]);

    const addTaskTemplate = (template) => {
        setTaskTemplates(prev => [...prev, template]);
    };

    const useTaskTemplate = (templateId) => {
        const template = taskTemplates.find(t => t.id === templateId);
        if (template) {
            const newTask = {
                ...template,
                id: `task-${Date.now()}`,
            };
            addTask(newTask);
        }
    };

    const addSubtask = (taskId, subtask) => {
        updateTask(taskId, {
            subtasks: [...(boardData.tasks[taskId].subtasks || []), subtask]
        });
    };

    const toggleSubtask = (taskId, subtaskId) => {
        const task = boardData.tasks[taskId];
        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        updateTask(taskId, { subtasks: updatedSubtasks });
    };

    const addComment = (taskId, comment) => {
        setComments(prevComments => ({
            ...prevComments,
            [taskId]: [...(prevComments[taskId] || []), comment]
        }));
    };

    const addAttachment = (taskId, attachment) => {
        setAttachments(prevAttachments => ({
            ...prevAttachments,
            [taskId]: [...(prevAttachments[taskId] || []), attachment]
        }));
    };

    const generateGanttChartData = () => {
        return Object.values(boardData.tasks).map(task => ({
            id: task.id,
            text: task.title,
            start_date: task.startDate,
            end_date: task.dueDate,
            progress: task.progress || 0,
            dependencies: dependencies
                .filter(d => d.taskId === task.id)
                .map(d => d.dependentTaskId)
        }));
    };

    const generateAnalyticsData = () => {
        const data = {
            tasksByStatus: {},
            tasksByPriority: {},
            taskCompletionTrend: [],
        };

        Object.values(boardData.tasks).forEach(task => {
            // Tasks by status
            data.tasksByStatus[task.status] = (data.tasksByStatus[task.status] || 0) + 1;

            // Tasks by priority
            data.tasksByPriority[task.priority] = (data.tasksByPriority[task.priority] || 0) + 1;

            // Task completion trend (simplified - you might want to use actual dates)
            if (task.completed) {
                data.taskCompletionTrend.push({
                    date: task.completedDate,
                    count: 1
                });
            }
        });

        setAnalyticsData(data);
    };

    // Keyboard Shortcuts
    useHotkeys('ctrl+n', () => openModal(), { enableOnFormTags: true });
    useHotkeys('ctrl+f', () => document.querySelector('#search-input').focus(), { enableOnFormTags: true });
    useHotkeys('ctrl+,', () => setShowKeyboardShortcuts(true), { enableOnFormTags: true });
    useHotkeys('esc', () => setShowKeyboardShortcuts(false), { enableOnFormTags: true });

    const archiveTask = (taskId) => {
        setBoardData(prevData => {
            const task = prevData.tasks[taskId];
            const { [taskId]: _, ...remainingTasks } = prevData.tasks;
            setArchivedTasks(prev => [...prev, task]);
            return {
                ...prevData,
                tasks: remainingTasks,
                columns: {
                    ...prevData.columns,
                    [task.column]: {
                        ...prevData.columns[task.column],
                        taskIds: prevData.columns[task.column].taskIds.filter(id => id !== taskId)
                    }
                }
            };
        });
    };

    const saveBoardTemplate = () => {
        const template = {
            id: uuidv4(),
            name: 'New Template',
            data: boardData
        };
        setBoardTemplates(prev => [...prev, template]);
    };

    const loadBoardTemplate = (templateId) => {
        const template = boardTemplates.find(t => t.id === templateId);
        if (template) {
            setBoardData(template.data);
        }
    };

    const integrateWithSlack = () => {
        // Implement Slack integration logic
        console.log('Integrating with Slack...');
    };

    const integrateWithGitHub = () => {
        // Implement GitHub integration logic
        console.log('Integrating with GitHub...');
        // This would typically involve OAuth authentication and API calls to GitHub
    };

    const addWorkflowRule = (rule) => {
        setWorkflowRules(prev => [...prev, rule]);
    };

    const executeWorkflowRules = (task) => {
        workflowRules.forEach(rule => {
            if (rule.condition(task)) {
                rule.action(task);
            }
        });
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const exportBoard = () => {
        const boardJson = JSON.stringify(boardData);
        const blob = new Blob([boardJson], { type: 'application/json' });
        saveAs(blob, 'kanban-board-export.json');
    };

    const importBoard = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedData = JSON.parse(e.target.result);
            setBoardData(importedData);
        };
        reader.readAsText(file);
    };

    const updateTaskEstimation = (taskId, estimation) => {
        updateTask(taskId, { estimation });
    };

    const shareBoard = () => {
        const shareLink = `http://yourdomain.com/board/${boardData.id}`;
        // Implement logic to send this link via email or copy to clipboard
        navigator.clipboard.writeText(shareLink).then(() => {
            alert('Board link copied to clipboard!');
        });
    };

    const renderTask = (task, index) => (
        <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Task
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                >
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Due: {task.dueDate}</p>
                    <p>Priority: {task.priority}</p>
                    <div>
                        Time: {formatTime(timers[task.id]?.elapsed || 0)}
                        {timers[task.id]?.startTime ? (
                            <button onClick={() => stopTimer(task.id)}>Stop</button>
                        ) : (
                            <button onClick={() => startTimer(task.id)}>Start</button>
                        )}
                    </div>
                    {customFields.map(field => (
                        <div key={field.id}>
                            {field.name}: {task[field.id]}
                        </div>
                    ))}
                    {task.subtasks && task.subtasks.map(subtask => (
                        <div key={subtask.id}>
                            <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => toggleSubtask(task.id, subtask.id)}
                            />
                            {subtask.title}
                        </div>
                    ))}
                    {comments[task.id] && comments[task.id].map((comment, index) => (
                        <div key={index}>{comment}</div>
                    ))}
                    {attachments[task.id] && attachments[task.id].map((attachment, index) => (
                        <div key={index}>{attachment.name}</div>
                    ))}
                    <button onClick={() => openModal(task)}>Edit</button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                    <button onClick={() => archiveTask(task.id)}>Archive</button>
                </Task>
            )}
        </Draggable>
    );
    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <GlobalStyle />
          <KanbanContainer>
            <BoardHeader>
              <BoardTitle>TaskSphere Kanban Board</BoardTitle>
              <div>
                <AddButton onClick={() => openModal()}>
                  <FaPlus /> Add Task
                </AddButton>
                <ThemeToggle onClick={toggleDarkMode}>
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </ThemeToggle>
                <IntegrationButton onClick={integrateWithSlack}>
                  Integrate with Slack
                </IntegrationButton>
                <IntegrationButton onClick={integrateWithGitHub}>
                  Integrate with GitHub
                </IntegrationButton>
                <ShareButton onClick={shareBoard}>
                  <FaShare /> Share Board
                </ShareButton>
              </div>
            </BoardHeader>
      
            <SearchContainer>
              <SearchInput
                id="search-input"
                type="text"
                placeholder="Search tasks..."
                onChange={(e) => handleSearch(e.target.value)}
              />
              <FilterButton onClick={() => openFilterModal()}>
                <FaFilter /> Filters
              </FilterButton>
            </SearchContainer>
      
            <DragDropContext onDragEnd={onDragEnd}>
              <SwimlaneContainer>
                {swimlanes.map(swimlane => (
                  <Swimlane key={swimlane.id}>
                    <SwimlaneTitle>{swimlane.title}</SwimlaneTitle>
                    <Droppable droppableId="all-columns" direction="horizontal" type="column">
                      {(provided) => (
                        <ColumnsContainer {...provided.droppableProps} ref={provided.innerRef}>
                          {boardData.columnOrder.map((columnId, index) => {
                            const column = boardData.columns[columnId];
                            const tasks = column.taskIds
                              .map(taskId => boardData.tasks[taskId])
                              .filter(task => task.swimlane === swimlane.id)
                              .filter(task => filteredTasks().includes(task));
      
                            return (
                              <Draggable key={column.id} draggableId={column.id} index={index}>
                                {(provided) => (
                                  <Column
                                    {...provided.draggableProps}
                                    ref={provided.innerRef}
                                  >
                                    <ColumnHeader {...provided.dragHandleProps}>
                                      <ColumnTitle>{column.title}</ColumnTitle>
                                      <FaEllipsisV />
                                    </ColumnHeader>
                                    <Droppable droppableId={column.id} type="task">
                                      {(provided, snapshot) => (
                                        <TaskList
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                          isDraggingOver={snapshot.isDraggingOver}
                                        >
                                          {tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                              {(provided, snapshot) => (
                                                <Task
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  isDragging={snapshot.isDragging}
                                                  onClick={() => openModal(task)}
                                                >
                                                  <TaskTitle>{task.title}</TaskTitle>
                                                  <TaskDescription>{task.description}</TaskDescription>
                                                  <TaskMeta>
                                                    <TaskDueDate>{task.dueDate}</TaskDueDate>
                                                    <TaskPriority priority={task.priority}>
                                                      {task.priority}
                                                    </TaskPriority>
                                                  </TaskMeta>
                                                  <TimeTracker>
                                                    <FaClock />
                                                    {formatTime(timers[task.id]?.elapsed || 0)}
                                                    {timers[task.id]?.startTime ? (
                                                      <button onClick={() => stopTimer(task.id)}>Stop</button>
                                                    ) : (
                                                      <button onClick={() => startTimer(task.id)}>Start</button>
                                                    )}
                                                  </TimeTracker>
                                                  {customFields.map(field => (
                                                    <div key={field.id}>
                                                      {field.name}: {task[field.id]}
                                                    </div>
                                                  ))}
                                                </Task>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </TaskList>
                                      )}
                                    </Droppable>
                                  </Column>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </ColumnsContainer>
                      )}
                    </Droppable>
                  </Swimlane>
                ))}
              </SwimlaneContainer>
            </DragDropContext>
      
            <DependencyLine>
              {dependencies.map(dep => (
                <line
                  key={`${dep.taskId}-${dep.dependentTaskId}`}
                  x1={getTaskPosition(dep.taskId).x}
                  y1={getTaskPosition(dep.taskId).y}
                  x2={getTaskPosition(dep.dependentTaskId).x}
                  y2={getTaskPosition(dep.dependentTaskId).y}
                  stroke="red"
                  strokeWidth="2"
                />
              ))}
            </DependencyLine>
      
            {showGanttChart && (
              <GanttChartContainer>
                <GanttChart data={generateGanttChartData()} />
              </GanttChartContainer>
            )}
      
            <AnalyticsDashboard>
              {analyticsData && (
                <>
                  <AnalyticsCard>
                    <h3>Tasks by Status</h3>
                    <Chart type="bar" data={analyticsData.tasksByStatus} />
                  </AnalyticsCard>
                  <AnalyticsCard>
                    <h3>Tasks by Priority</h3>
                    <Chart type="pie" data={analyticsData.tasksByPriority} />
                  </AnalyticsCard>
                  <AnalyticsCard>
                    <h3>Task Completion Trend</h3>
                    <Chart type="line" data={analyticsData.taskCompletionTrend} />
                  </AnalyticsCard>
                </>
              )}
            </AnalyticsDashboard>
      
            <ArchiveContainer>
              <h3>Archived Tasks</h3>
              {archivedTasks.map(task => (
                <div key={task.id}>{task.title}</div>
              ))}
            </ArchiveContainer>
      
            <WorkflowRuleContainer>
              <h3>Workflow Rules</h3>
              {workflowRules.map((rule, index) => (
                <div key={index}>{rule.name}</div>
              ))}
              <button onClick={() => openWorkflowRuleModal()}>
                Add Workflow Rule
              </button>
            </WorkflowRuleContainer>
      
            <div>
              <button onClick={exportBoard}>
                <FaDownload /> Export Board
              </button>
              <input
                type="file"
                accept=".json"
                onChange={importBoard}
                style={{ display: 'none' }}
                id="import-board"
              />
              <label htmlFor="import-board">
                <button as="span">
                  <FaUpload /> Import Board
                </button>
              </label>
            </div>
      
            <AddColumnForm onSubmit={(e) => { e.preventDefault(); addColumn(); }}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column title"
              />
              <button type="submit">Add Column</button>
            </AddColumnForm>
      
            <AnimatePresence>
              {isModalOpen && (
                <ModalOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ModalContent
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                  >
                    <CloseButton onClick={closeModal}>
                      <FaTimes />
                    </CloseButton>
                    <h2>{currentTask ? 'Edit Task' : 'Add New Task'}</h2>
                    <Form onSubmit={handleSubmit}>
                      <Input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        defaultValue={currentTask?.title || ''}
                        required
                      />
                      <TextArea
                        name="description"
                        placeholder="Task Description"
                        defaultValue={currentTask?.description || ''}
                      />
                      <Input
                        type="date"
                        name="dueDate"
                        defaultValue={currentTask?.dueDate || ''}
                      />
                      <Select
                        name="priority"
                        defaultValue={currentTask?.priority || 'medium'}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                      <Button type="submit">
                        {currentTask ? 'Update Task' : 'Add Task'}
                      </Button>
                    </Form>
                    {currentTask && (
                      <Button onClick={() => deleteTask(currentTask.id)}>
                        Delete Task
                      </Button>
                    )}
                  </ModalContent>
                </ModalOverlay>
              )}
      
              {showKeyboardShortcuts && (
                <KeyboardShortcutsModal
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <h3>Keyboard Shortcuts</h3>
                  <ul>
                    <li>Ctrl + N: New Task</li>
                    <li>Ctrl + F: Focus Search</li>
                    <li>Ctrl + ,: Show/Hide Shortcuts</li>
                    <li>Esc: Close Modals</li>
                  </ul>
                </KeyboardShortcutsModal>
              )}
            </AnimatePresence>
          </KanbanContainer>
        </ThemeProvider>
      );
    };

    export default KanbanBoard;
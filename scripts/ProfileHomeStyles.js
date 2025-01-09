
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaCheck } from 'react-icons/fa';
import { FaPlus, FaEllipsisV, FaTimes, FaTrash, FaList, FaBriefcase, FaDumbbell, FaHome, FaRing, FaRocket, FaBook, FaBox, FaPlane, FaHandHoldingHeart, FaMobileAlt, FaChartLine, FaUtensils, FaMusic, FaSeedling, FaShieldAlt, FaTrophy, FaLeaf, FaMicrophone, FaRobot, FaRecycle, FaLanguage } from 'react-icons/fa';
import { getTemplates, totalTemplateCount } from './Templates';
import { v4 as uuidv4 } from 'uuid';
import TemplateLazyLoader from './TemplateLazyLoader';



// Theme
const theme = {
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#F4F5F7',
  cardBackground: '#FFFFFF',
  text: '#172B4D',
  lightText: '#5E6C84',
  border: '#E2E4E6',
  danger: '#FF5630',
  success: '#36B37E',
  warning: '#FFAB00',
};

// Basic styled components
const Input = styled.input`
  padding: 8px;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background-color: ${theme.primary}dd;
  }
`;

// Styled Components
const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${theme.background};
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
  color: ${theme.text};
  margin: 0;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
`;

const Column = styled.div`
  background-color: ${theme.cardBackground};
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
  border-bottom: 1px solid ${theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnTitle = styled.h2`
  font-size: 16px;
  margin: 0;
  color: ${theme.text};
`;

const TaskList = styled.div`
  padding: 8px;
  flex-grow: 1;
  overflow-y: auto;
`;

const Task = styled(motion.div)`
  background-color: ${theme.cardBackground};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
`;

const TaskTitle = styled.h3`
  font-size: 14px;
  margin: 0 0 8px 0;
  color: ${theme.text};
`;

const TaskDescription = styled.p`
  font-size: 12px;
  color: ${theme.lightText};
  margin: 0;
`;

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const TaskPriority = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  color: white;
  background-color: ${props => 
    props.priority === 'high' ? theme.danger :
    props.priority === 'medium' ? theme.warning :
    theme.success
  };
`;

const AddButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${theme.primary};
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
  background-color: ${theme.cardBackground};
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const SubtaskList = styled.div`
  margin-top: 16px;
`;

const SubtaskItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const SubtaskCheckbox = styled.input`
  margin-right: 8px;
`;

const SubtaskDeleteButton = styled.button`
  background: none;
  border: none;
  color: ${theme.danger};
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
`;

const SubtaskAddButton = styled(Button)`
  padding: 4px 8px;
  font-size: 12px;
`;

const EstimatedTimeInput = styled(Input)`
  width: 100%;
`;

const TaskMetaItem = styled.span`
  font-size: 11px;
  color: ${theme.lightText};
  margin-right: 8px;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubtaskInput = styled(Input)`
  margin-right: 8px;
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid ${theme.border};
  border-radius: 4px;
  font-size: 14px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${theme.lightText};
`;

const TemplateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  background-color: ${theme.cardBackground};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  padding: 12px;
  margin: 8px;
  width: calc(50% - 16px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${theme.primary}10;
    border-color: ${theme.primary};
  }
`;

const TemplateIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
  color: ${props => props.color};
`;

const TemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TemplateName = styled.span`
  font-weight: bold;
  color: ${theme.text};
`;

const TemplateCategory = styled.span`
  font-size: 12px;
  color: ${theme.lightText};
`;

const TemplateGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 8px;
`;

const LoadMoreButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`;


// Mock data
const initialData = {
  tasks: {
    'task-1': { 
      id: 'task-1', 
      title: 'Create login page', 
      description: 'Implement user authentication', 
      dueDate: '2023-06-15', 
      priority: 'high',
      subtasks: [
        { id: 'subtask-1-1', title: 'Design login form', completed: false },
        { id: 'subtask-1-2', title: 'Implement authentication logic', completed: false }
      ],
      estimatedTime: '8h'
    },
    'task-2': { 
      id: 'task-2', 
      title: 'Design database schema', 
      description: 'Plan the structure for user data', 
      dueDate: '2023-06-20', 
      priority: 'medium',
      subtasks: [
        { id: 'subtask-2-1', title: 'Identify data entities', completed: false },
        { id: 'subtask-2-2', title: 'Define relationships', completed: false }
      ],
      estimatedTime: '6h'
    },
    'task-3': { 
      id: 'task-3', 
      title: 'Set up CI/CD pipeline', 
      description: 'Automate deployment process', 
      dueDate: '2023-06-25', 
      priority: 'low',
      subtasks: [
        { id: 'subtask-3-1', title: 'Configure Jenkins', completed: false },
        { id: 'subtask-3-2', title: 'Set up automated testing', completed: false }
      ],
      estimatedTime: '10h'
    },
    'task-4': { 
      id: 'task-4', 
      title: 'Implement responsive design', 
      description: 'Ensure app works on mobile devices', 
      dueDate: '2023-06-30', 
      priority: 'medium',
      subtasks: [
        { id: 'subtask-4-1', title: 'Create mobile layouts', completed: false },
        { id: 'subtask-4-2', title: 'Test on various devices', completed: false }
      ],
      estimatedTime: '12h'
    },
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


const TemplateItem = ({ template, onSelect, getTemplateIcon }) => (
  <TemplateButton
    onClick={() => onSelect(template)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <TemplateIcon color={template.color}>
      {getTemplateIcon(template.icon)}
    </TemplateIcon>
    <TemplateInfo>
      <TemplateName>{template.name}</TemplateName>
      <TemplateCategory>{template.categories.join(', ')}</TemplateCategory>
    </TemplateInfo>
  </TemplateButton>
);

const KanbanBoard = () => {
  const [boardData, setBoardData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showManageTaskModal, setShowManageTaskModal] = useState(false);
  const [taskToManage, setTaskToManage] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isSetTimeModalOpen, setIsSetTimeModalOpen] = useState(false);
  const [showEndTimeInput, setShowEndTimeInput] = useState(false);
  const [taskToSetTime, setTaskToSetTime] = useState(null);
  const [templates, setTemplates] = useState([]);
  const templateLoader = useMemo(() => new TemplateLazyLoader(), []);


  const [templateListColumn, setTemplateListColumn] = useState({
    id: 'template-list',
    title: 'Template List',
    taskIds: [],
  });

  useEffect(() => {
    setBoardData({
      ...initialData,
      columns: {
        ...initialData.columns,
        'template-list': {
          id: 'template-list',
          title: 'Template List',
          taskIds: [],
        },
      },
      columnOrder: [...initialData.columnOrder, 'template-list'],
    });
  }, []);

  useEffect(() => {
    const loadTemplates = async () => {
      const initialChunk = await templateLoader.loadNextChunk();
      setTemplates(initialChunk);
      const allTemplates = getTemplates();
      setTemplates(prevTemplates => [...prevTemplates, ...allTemplates.filter(t => !prevTemplates.some(pt => pt.id === t.id))]);
    };
    loadTemplates();
  }, [templateLoader]);
  
  
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

  const openSubtaskModal = (task) => {
    setCurrentTask(task);
    setIsSubtaskModalOpen(true);
  };

  const closeSubtaskModal = () => {
    setCurrentTask(null);
    setIsSubtaskModalOpen(false);
  };

  const moveTaskToInProgress = useCallback((taskId) => {
    const updatedColumns = { ...boardData.columns };
    const sourceColumn = Object.values(updatedColumns).find(col => col.taskIds.includes(taskId));
    const destinationColumn = updatedColumns['column-2'];

    if (sourceColumn.id !== destinationColumn.id) {
      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
      destinationColumn.taskIds.push(taskId);

      const updatedTasks = { ...boardData.tasks };
      updatedTasks[taskId] = { ...updatedTasks[taskId], status: 'in-progress' };

      setBoardData({
        ...boardData,
        columns: updatedColumns,
        tasks: updatedTasks,
      });
    }
  }, [boardData]);

  const addTasksFromTemplate = (template) => {
    const newTasks = {};
    const newTaskIds = [];
  
    template.tasks.forEach((task) => {
      const newTaskId = uuidv4();
      newTasks[newTaskId] = {
        id: newTaskId,
        title: task.title,
        description: task.description || '',
        dueDate: calculateDueDate(task.dueDate),
        priority: task.priority.toLowerCase(),
        subtasks: task.subtasks || [],
        estimatedTime: task.estimatedTime || '',
      };
      newTaskIds.push(newTaskId);
    });
  
    const updatedTasks = { ...boardData.tasks, ...newTasks };
    const updatedTemplateListColumn = {
      ...boardData.columns['template-list'],
      taskIds: [...boardData.columns['template-list'].taskIds, ...newTaskIds],
    };
  
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: {
        ...boardData.columns,
        'template-list': updatedTemplateListColumn,
      },
    });
  
    setIsTemplateModalOpen(false);
  };

  const getTemplateIcon = (iconName) => {
    const iconMap = {
      briefcase: <FaBriefcase />,
      dumbbell: <FaDumbbell />,
      home: <FaHome />,
      ring: <FaRing />,
      rocket: <FaRocket />,
      book: <FaBook />,
      box: <FaBox />,
      plane: <FaPlane />,
      'hand-holding-heart': <FaHandHoldingHeart />,
      'mobile-alt': <FaMobileAlt />,
      'chart-line': <FaChartLine />,
      utensils: <FaUtensils />,
      music: <FaMusic />,
      seedling: <FaSeedling />,
      'shield-alt': <FaShieldAlt />,
      trophy: <FaTrophy />,
      leaf: <FaLeaf />,
      microphone: <FaMicrophone />,
      robot: <FaRobot />,
      recycle: <FaRecycle />,
      language: <FaLanguage />,
    };

    return iconMap[iconName] || <FaList />;  
  };

  const calculateDueDate = (dueDateString) => {
    if (dueDateString === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    const days = parseInt(dueDateString.replace('+', '').replace('d', ''));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString().split('T')[0];
  };   

  const markTaskAsCompleted = (taskId) => {
    const updatedColumns = { ...boardData.columns };
    const sourceColumn = Object.values(updatedColumns).find(col => col.taskIds.includes(taskId));
    const destinationColumn = updatedColumns['column-3']; // Assuming 'column-3' is "Done"

    sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
    destinationColumn.taskIds.push(taskId);

    const updatedTasks = { ...boardData.tasks };
    updatedTasks[taskId] = { 
      ...updatedTasks[taskId], 
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    setBoardData({
      ...boardData,
      columns: updatedColumns,
      tasks: updatedTasks,
    });
  };

  const openManageTaskModal = (task) => {
    setTaskToManage(task);
    setShowManageTaskModal(true);
  };

  const closeManageTaskModal = () => {
    setTaskToManage(null);
    setShowManageTaskModal(false);
  };

  const loadMoreTemplates = () => {
    templateLoader.loadNextChunk().then(newTemplates => {
      setTemplates(prevTemplates => [...prevTemplates, ...newTemplates]);
    });
  };

  useEffect(() => {
    // Check for tasks that need to be moved to "In Progress"
    const now = new Date();
    Object.values(boardData.tasks).forEach(task => {
      if (task.startTime && new Date(task.startTime) <= now && task.status !== 'in-progress') {
        moveTaskToInProgress(task.id);
      }
    });

    // Set up interval to check for tasks that need to be moved
    const interval = setInterval(() => {
      const currentTime = new Date();
      Object.values(boardData.tasks).forEach(task => {
        if (task.startTime && new Date(task.startTime) <= currentTime && task.status !== 'in-progress') {
          moveTaskToInProgress(task.id);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [boardData, moveTaskToInProgress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData.entries());
    
    const subtasks = formData.getAll('subtasks').map((title, index) => ({
      id: `subtask-${Date.now()}-${index}`,
      title,
      completed: false
    }));
  
    const taskWithSubtasks = {
      ...taskData,
      subtasks,
      estimatedTime: taskData.estimatedTime || ''
    };
  
    let updatedBoardData = { ...boardData };
  
    if (currentTask) {
      const updatedTask = { ...currentTask, ...taskWithSubtasks };
      updatedBoardData.tasks = { ...updatedBoardData.tasks, [updatedTask.id]: updatedTask };
  
      // Remove the task from its current column
      Object.keys(updatedBoardData.columns).forEach(columnId => {
        const column = updatedBoardData.columns[columnId];
        if (column.taskIds.includes(updatedTask.id)) {
          updatedBoardData.columns[columnId] = {
            ...column,
            taskIds: column.taskIds.filter(id => id !== updatedTask.id)
          };
        }
      });
  
      // Add the task to the "To Do" column
      const toDoColumn = updatedBoardData.columns['column-1'];
      updatedBoardData.columns['column-1'] = {
        ...toDoColumn,
        taskIds: [...toDoColumn.taskIds, updatedTask.id]
      };
  
    } else {
      const newTaskId = `task-${Date.now()}`;
      const newTask = { id: newTaskId, ...taskWithSubtasks };
      updatedBoardData.tasks = { ...updatedBoardData.tasks, [newTaskId]: newTask };
      
      // Add the new task to the "To Do" column
      const toDoColumn = updatedBoardData.columns['column-1'];
      updatedBoardData.columns['column-1'] = {
        ...toDoColumn,
        taskIds: [...toDoColumn.taskIds, newTaskId]
      };
    }
  
    // Update the Template List column
    if (templateListColumn) {
      const updatedTemplateListColumn = {
        ...templateListColumn,
        taskIds: []
      };
      updatedBoardData.columns['template-list'] = updatedTemplateListColumn;
      setTemplateListColumn(updatedTemplateListColumn);
    }
  
    setBoardData(updatedBoardData);
    closeModal();
  };

  const deleteTask = (taskId) => {
    const newTasks = { ...boardData.tasks };
    delete newTasks[taskId];

    const newColumns = Object.entries(boardData.columns).reduce((acc, [columnId, column]) => {
      acc[columnId] = {
        ...column,
        taskIds: column.taskIds.filter(id => id !== taskId),
      };
      return acc;
    }, {});

    setBoardData({
      ...boardData,
      tasks: newTasks,
      columns: newColumns,
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
  
    setBoardData({
      ...boardData,
      columns: {
        ...boardData.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...boardData.columnOrder, newColumnId],
    });
  
    setNewColumnTitle('');
  };
  
  const handleSubtaskToggle = (taskId, subtaskId) => {
    const updatedTasks = { ...boardData.tasks };
    const task = updatedTasks[taskId];
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    updatedTasks[taskId] = { ...task, subtasks: updatedSubtasks };
  
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
    });
  };
  
  const handleDeleteSubtask = (taskId, subtaskId) => {
    const updatedTasks = { ...boardData.tasks };
    const task = updatedTasks[taskId];
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    updatedTasks[taskId] = { ...task, subtasks: updatedSubtasks };
  
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
    });
  };
  
  const handleAddSubtask = (taskId) => {
    if (!newSubtaskTitle.trim()) return;
  
    const updatedTasks = { ...boardData.tasks };
    const task = updatedTasks[taskId];
    const newSubtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
    };
    updatedTasks[taskId] = { ...task, subtasks: [...task.subtasks, newSubtask] };
  
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
    });
  
    setNewSubtaskTitle('');
  };
  
  const handleSubtaskChange = (taskId, subtaskId, newTitle) => {
    const updatedTasks = { ...boardData.tasks };
    const task = updatedTasks[taskId];
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, title: newTitle } : subtask
    );
    updatedTasks[taskId] = { ...task, subtasks: updatedSubtasks };
  
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
    });
  };

  const setTaskTime = (taskId) => {
  const task = boardData.tasks[taskId];
  setTaskToSetTime(task);
  setIsSetTimeModalOpen(true);
  setShowEndTimeInput(false);
};

const handleSetTime = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const startTime = formData.get('startTime');
  const endTime = formData.get('endTime');

  if (taskToSetTime) {
    const updatedTask = {
      ...taskToSetTime,
      startTime,
      endTime,
      status: 'in-progress'
    };

    const updatedTasks = {
      ...boardData.tasks,
      [taskToSetTime.id]: updatedTask
    };

    // Move task to "In Progress" column
    const fromColumn = Object.values(boardData.columns).find(col => col.taskIds.includes(taskToSetTime.id));
    const toColumn = boardData.columns['column-2']; // Assuming 'column-2' is "In Progress"

    const updatedColumns = {
      ...boardData.columns,
      [fromColumn.id]: {
        ...fromColumn,
        taskIds: fromColumn.taskIds.filter(id => id !== taskToSetTime.id)
      },
      [toColumn.id]: {
        ...toColumn,
        taskIds: [...toColumn.taskIds, taskToSetTime.id]
      }
    };

    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: updatedColumns
    });

    setIsSetTimeModalOpen(false);
    setTaskToSetTime(null);
    setShowEndTimeInput(false);

    // Set up a timer to move the task when the start time is reached
    const timeUntilStart = new Date(startTime) - new Date();
    if (timeUntilStart > 0) {
      setTimeout(() => {
        moveTaskToInProgress(taskToSetTime.id);
      }, timeUntilStart);
    } else {
      moveTaskToInProgress(taskToSetTime.id);
    }
  }
};


return (
  <KanbanContainer>
    <BoardHeader>
      <BoardTitle>TaskSphere Kanban Board</BoardTitle>
      <div>
        <AddButton onClick={() => openModal()}>
          <FaPlus /> Add Task
        </AddButton>
        <AddButton onClick={() => setIsTemplateModalOpen(true)}>
          <FaList /> Templates
        </AddButton>
      </div>
    </BoardHeader>
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <ColumnsContainer {...provided.droppableProps} ref={provided.innerRef}>
            {boardData.columnOrder.map((columnId, index) => {
              const column = boardData.columns[columnId];
              if (!column) return null;
              const tasks = column.taskIds
                .map(taskId => boardData.tasks[taskId])
                .filter(Boolean);

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
                                      <TaskMetaItem>{task.dueDate}</TaskMetaItem>
                                      <TaskMetaItem>{task.estimatedTime}</TaskMetaItem>
                                      <TaskMetaItem>Subtasks: {task.subtasks?.length || 0}</TaskMetaItem>
                                      <TaskPriority priority={task.priority}>
                                        {task.priority}
                                      </TaskPriority>
                                    </TaskMeta>
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
    </DragDropContext>

    <div>
      <Input
        type="text"
        value={newColumnTitle}
        onChange={(e) => setNewColumnTitle(e.target.value)}
        placeholder="New column title"
      />
      <Button onClick={addColumn}>Add Column</Button>
    </div>

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
              <Select name="priority" defaultValue={currentTask?.priority || 'medium'}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <EstimatedTimeInput
                type="text"
                name="estimatedTime"
                placeholder="Estimated Time (e.g., 2h 30m)"
                defaultValue={currentTask?.estimatedTime || ''}
              />
              <ButtonGroup>
                <Button type="submit">
                  {currentTask ? 'Update Task' : 'Add Task'}
                </Button>
                {currentTask && (
                  <>
                    <Button type="button" onClick={() => openManageTaskModal(currentTask)}>
                      <FaBriefcase /> Manage Task
                    </Button>
                    <Button type="button" onClick={() => openSubtaskModal(currentTask)}>
                      <FaList /> Manage Subtasks
                    </Button>
                  </>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showManageTaskModal && taskToManage && (
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
            <CloseButton onClick={closeManageTaskModal}>
              <FaTimes />
            </CloseButton>
            <h2>Manage Task</h2>
            <ButtonGroup>
              <Button onClick={() => deleteTask(taskToManage.id)}>
                <FaTrash /> Delete Task
              </Button>
              <Button onClick={() => markTaskAsCompleted(taskToManage.id)}>
                <FaCheck /> Mark as Completed
              </Button>
              <Button onClick={() => setTaskTime(taskToManage.id)}>
                <FaClock /> Set Time
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isTemplateModalOpen && (
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
            <CloseButton onClick={() => setIsTemplateModalOpen(false)}>
              <FaTimes />
            </CloseButton>
            <h2>Choose a Template</h2>
            <TemplateGrid>
              {templates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  onSelect={() => addTasksFromTemplate(template)}
                  getTemplateIcon={getTemplateIcon}
                />  
              ))}
              {templates.length < totalTemplateCount && (
                <LoadMoreButton onClick={loadMoreTemplates}>
                  Load More Templates
                </LoadMoreButton>
              )}
            </TemplateGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isSubtaskModalOpen && currentTask && (
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
            <CloseButton onClick={closeSubtaskModal}>
              <FaTimes />
            </CloseButton>
            <h2>Manage Subtasks</h2>
            <SubtaskList>
              {currentTask.subtasks?.map((subtask) => (
                <SubtaskItem key={subtask.id}>
                  <SubtaskCheckbox
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(currentTask.id, subtask.id)}
                  />
                  <SubtaskInput
                    type="text"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(currentTask.id, subtask.id, e.target.value)}
                  />
                  <SubtaskDeleteButton onClick={() => handleDeleteSubtask(currentTask.id, subtask.id)}>
                    <FaTrash />
                  </SubtaskDeleteButton>
                </SubtaskItem>
              ))}
              <SubtaskItem>
                <SubtaskInput
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="New subtask"
                />
                <SubtaskAddButton onClick={() => handleAddSubtask(currentTask.id)}>
                  Add
                </SubtaskAddButton>
              </SubtaskItem>
            </SubtaskList>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isSetTimeModalOpen && (
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
            <CloseButton onClick={() => setIsSetTimeModalOpen(false)}>
              <FaTimes />
            </CloseButton>
            <h2>Set Task Time</h2>
            <Form onSubmit={handleSetTime}>
              <Input
                type="datetime-local"
                name="startTime"
                placeholder="Start Time"
                required
              />
              {showEndTimeInput && (
                <Input
                  type="datetime-local"
                  name="endTime"
                  placeholder="End Time"
                  required
                />
              )}
              <Button type="submit">Set Time</Button>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  </KanbanContainer>
);
}

export default KanbanBoard;

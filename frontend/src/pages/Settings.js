import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEllipsisV, FaTimes, FaEdit, FaTrash, FaList, FaBriefcase, FaDumbbell, FaHome, FaRing, FaRocket, FaBook, FaBox, FaPlane, FaHandHoldingHeart, FaMobileAlt, FaChartLine, FaUtensils, FaMusic, FaSeedling, FaShieldAlt, FaTrophy, FaLeaf, FaMicrophone, FaRobot, FaRecycle, FaLanguage } from 'react-icons/fa';
import Templates from './Templates';


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

const TaskDueDate = styled.span`
  font-size: 11px;
  color: ${theme.lightText};
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

const SubtaskTitle = styled.span`
  font-size: 14px;
  color: ${theme.text};
  flex-grow: 1;
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


const KanbanBoard = () => {
  const [boardData, setBoardData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);



  useEffect(() => {
    // Here you would typically fetch the board data from an API
    // For now, we're using the mock data
    setBoardData(initialData);
  }, []);

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

  const addTasksFromTemplate = (template) => {
    const newTasks = {};
    const newTaskIds = [];

    template.tasks.forEach((task) => {
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newTasks[newTaskId] = {
        id: newTaskId,
        title: task.title,
        description: '',
        dueDate: calculateDueDate(task.dueDate),
        priority: task.priority.toLowerCase(),
      };
      newTaskIds.push(newTaskId);
    });

    const updatedTasks = { ...boardData.tasks, ...newTasks };
    const updatedColumn = {
      ...boardData.columns['column-1'],
      taskIds: [...boardData.columns['column-1'].taskIds, ...newTaskIds],
    };

    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: { ...boardData.columns, 'column-1': updatedColumn },
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

    if (currentTask) {
      const updatedTask = { ...currentTask, ...taskWithSubtasks };
      const newTasks = { ...boardData.tasks, [updatedTask.id]: updatedTask };
      setBoardData({ ...boardData, tasks: newTasks });
    } else {
      const newTaskId = `task-${Date.now()}`;
      const newTask = { id: newTaskId, ...taskWithSubtasks };
      const newTasks = { ...boardData.tasks, [newTaskId]: newTask };
      const newColumn = {
        ...boardData.columns['column-1'],
        taskIds: [...boardData.columns['column-1'].taskIds, newTaskId],
      };
      setBoardData({
        ...boardData,
        tasks: newTasks,
        columns: { ...boardData.columns, 'column-1': newColumn },
      });
    }

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
                const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);

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
                <Select
                  name="priority"
                  defaultValue={currentTask?.priority || 'medium'}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
                <EstimatedTimeInput
                  type="text"
                  name="estimatedTime"
                  placeholder="Estimated Time (e.g., 2h, 30m)"
                  defaultValue={currentTask?.estimatedTime || ''}
                />
                <ButtonGroup>
                  <Button type="submit" primary>
                    {currentTask ? 'Update Task' : 'Add Task'}
                  </Button>
                  {currentTask && (
                    <>
                      <Button type="button" danger onClick={() => deleteTask(currentTask.id)}>
                        Delete Task
                      </Button>
                      <Button type="button" onClick={() => setShowSubtasks(!showSubtasks)}>
                        Manage Subtasks
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </Form>

              {showSubtasks && (
                <SubtaskManager
                  subtasks={currentTask?.subtasks || []}
                  onSubtasksChange={(newSubtasks) => {
                    const updatedTask = { ...currentTask, subtasks: newSubtasks };
                    const newTasks = { ...boardData.tasks, [updatedTask.id]: updatedTask };
                    setBoardData({ ...boardData, tasks: newTasks });
                  }}
                />
              )}
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
                {Templates.map((template) => (
                  <TemplateButton
                    key={template.id}
                    onClick={() => addTasksFromTemplate(template)}
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
                ))}
              </TemplateGrid>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </KanbanContainer>
  );
};

const SubtaskManager = ({ subtasks, onSubtasksChange }) => {
  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const updatedSubtasks = [
        ...subtasks,
        { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
      ];
      onSubtasksChange(updatedSubtasks);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id) => {
    const updatedSubtasks = subtasks.map(subtask =>
      subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
    );
    onSubtasksChange(updatedSubtasks);
  };

  const deleteSubtask = (id) => {
    const updatedSubtasks = subtasks.filter(subtask => subtask.id !== id);
    onSubtasksChange(updatedSubtasks);
  };

  return (
    <SubtaskList>
      <h3>Subtasks</h3>
      {subtasks.map(subtask => (
        <SubtaskItem key={subtask.id}>
          <SubtaskCheckbox
            type="checkbox"
            checked={subtask.completed}
            onChange={() => toggleSubtask(subtask.id)}
          />
          <SubtaskTitle>{subtask.title}</SubtaskTitle>
          <SubtaskDeleteButton onClick={() => deleteSubtask(subtask.id)}>
            <FaTrash />
          </SubtaskDeleteButton>
        </SubtaskItem>
      ))}
      <SubtaskItem>
        <SubtaskInput
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="New subtask"
        />
        <SubtaskAddButton onClick={addSubtask}>Add</SubtaskAddButton>
      </SubtaskItem>
    </SubtaskList>
  );
};

export default KanbanBoard;

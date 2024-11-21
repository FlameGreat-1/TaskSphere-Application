import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/api';
import styled, { keyframes } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { FaArrowLeft, FaPlus, FaTimes, FaChevronDown } from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Theme
const theme = {
  primary: '#4A90E2',
  secondary: '#50C878',
  accent: '#FF6B6B',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#2C3E50',
  border: '#E2E8F0',
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#EF5350',
  hover: '#3A7BC8',
  lightGray: '#F1F5F9',
  darkGray: '#64748B'
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.background};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: ${theme.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: ${theme.primary};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    color: ${theme.hover};
    transform: translateX(-2px);
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${theme.text};
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: ${theme.darkGray};
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${theme.text};
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  span.required {
    color: ${theme.danger};
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${theme.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${theme.background};
  color: ${theme.text};

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}30;
  }

  &::placeholder {
    color: ${theme.darkGray}80;
  }

  &:disabled {
    background: ${theme.lightGray};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${theme.border};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  background: ${theme.background};
  color: ${theme.text};

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}30;
  }

  &::placeholder {
    color: ${theme.darkGray}80;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.background};
  border: 2px solid ${theme.border};
  border-radius: 8px;
  color: ${theme.text};
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}30;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${theme.cardBg};
  border: 2px solid ${theme.border};
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.lightGray};
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CategoryButton = styled.button`
  padding: 0.75rem;
  background: ${props => props.selected ? `${theme.primary}20` : theme.background};
  border: 2px solid ${props => props.selected ? theme.primary : theme.border};
  border-radius: 8px;
  color: ${props => props.selected ? theme.primary : theme.text};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.primary};
    background: ${theme.primary}10;
  }
`;

const PriorityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const PriorityButton = styled.button`
  padding: 0.75rem;
  background: ${props => props.selected ? `${props.color}20` : theme.background};
  border: 2px solid ${props => props.selected ? props.color : theme.border};
  border-radius: 8px;
  color: ${props => props.selected ? props.color : theme.text};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.color};
    background: ${props => `${props.color}10`};
  }
`;

const SubtaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubtaskInput = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SubtaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SubtaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: ${theme.background};
  border-radius: 8px;
  animation: ${slideIn} 0.3s ease-out;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${theme.danger};
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${theme.accent};
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.variant === 'secondary' ? 'transparent' : theme.primary};
  color: ${props => props.variant === 'secondary' ? theme.text : 'white'};
  border: ${props => props.variant === 'secondary' ? `2px solid ${theme.border}` : 'none'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.variant === 'secondary' ? theme.lightGray : theme.hover};
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.primary}30;
  }

  &:disabled {
    background: ${theme.lightGray};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.danger};
  font-size: 0.9rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${theme.danger}10;
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${theme.cardBg};
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function CreateTask({ onClose, onTaskCreated }) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    estimated_time: '',
    subtasks: [],
    tags: [],
    progress: 0
  });

  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const categories = [
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'Education',
    'Home',
    'Finance',
    'Projects',
    'Meetings',
    'Events'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: theme.success },
    { value: 'medium', label: 'Medium', color: theme.warning },
    { value: 'high', label: 'High', color: theme.danger }
  ];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prevTask => ({
      ...prevTask,
      [name]: value
    }));
    setIsFormDirty(true);
  };

  const handleCategorySelect = (category) => {
    setTask(prevTask => ({
      ...prevTask,
      category: prevTask.category === category ? '' : category
    }));
    setIsFormDirty(true);
    setIsCategoryOpen(false);
  };

  const handlePrioritySelect = (priority) => {
    setTask(prevTask => ({
      ...prevTask,
      priority
    }));
    setIsFormDirty(true);
    setIsPriorityOpen(false);
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setTask(prevTask => ({
        ...prevTask,
        subtasks: [...prevTask.subtasks, { title: subtaskInput.trim(), completed: false }]
      }));
      setSubtaskInput('');
      setIsFormDirty(true);
    }
  };

  const removeSubtask = (index) => {
    setTask(prevTask => ({
      ...prevTask,
      subtasks: prevTask.subtasks.filter((_, i) => i !== index)
    }));
    setIsFormDirty(true);
  };

  const validateForm = () => {
    if (!task.title.trim()) {
      setError('Task title is required');
      return false;
    }
    if (!task.due_date) {
      setError('Due date is required');
      return false;
    }
    if (!task.category) {
      setError('Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    setError('');
  
    try {
      const taskData = {
        ...task,
        subtasks: task.subtasks.map(st => ({ title: st.title, completed: st.completed })),
        tags: task.tags.map(tag => tag.name),
        progress: Number(task.progress),
        completed: false
      };
  
      const response = await createTask(taskData);
  
      if (response.status === 201) {
        toast.success('Task created successfully!');
        setIsFormDirty(false);
        onTaskCreated(response.data);
        onClose();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Error creating task. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <PageContainer>
      <ToastContainer position="top-right" />
      <NavigationBar>
        <BackButton onClick={handleCancel}>
          <FaArrowLeft /> Back
        </BackButton>
      </NavigationBar>
      <FormContainer>
        <Header>
          <Title>Create New Task</Title>
          <Subtitle>Add a new task to your TaskSphere</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">
              Task Title <span className="required">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Enter task description"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Category <span className="required">*</span>
            </Label>
            <DropdownContainer>
              <DropdownButton type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                {task.category || 'Select Category'}
                <FaChevronDown />
              </DropdownButton>
              {isCategoryOpen && (
                <DropdownContent>
                  {categories.map(cat => (
                    <DropdownItem key={cat} onClick={() => handleCategorySelect(cat)}>
                      {cat}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              )}
            </DropdownContainer>
          </FormGroup>

          <FormGroup>
            <Label>Priority Level</Label>
            <DropdownContainer>
              <DropdownButton type="button" onClick={() => setIsPriorityOpen(!isPriorityOpen)}>
                {priorities.find(p => p.value === task.priority)?.label || 'Select Priority'}
                <FaChevronDown />
              </DropdownButton>
              {isPriorityOpen && (
                <DropdownContent>
                  {priorities.map(({ value, label, color }) => (
                    <DropdownItem key={value} onClick={() => handlePrioritySelect(value)}>
                      {label}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              )}
            </DropdownContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="due_date">
              Due Date <span className="required">*</span>
            </Label>
            <Input
              id="due_date"
              type="datetime-local"
              name="due_date"
              value={task.due_date}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="estimated_time">Estimated Time</Label>
            <Input
              id="estimated_time"
              type="text"
              name="estimated_time"
              value={task.estimated_time}
              onChange={handleChange}
              placeholder="e.g., 2 hours"
            />
          </FormGroup>

          <FormGroup>
            <Label>Subtasks</Label>
            <SubtaskContainer>
              <SubtaskInput>
                <Input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="Enter subtask"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addSubtask}
                  style={{ 
                    margin: 0, 
                    padding: '0.75rem 1rem',
                    minWidth: '80px'
                  }}
                >
                  <FaPlus /> Add
                </Button>
              </SubtaskInput>
              
              {task.subtasks.length > 0 && (
                <SubtaskList>
                  {task.subtasks.map((subtask, index) => (
                    <SubtaskItem key={index}>
                      <span>• {subtask.title}</span>
                      <DeleteButton
                        type="button"
                        onClick={() => removeSubtask(index)}
                        aria-label="Delete subtask"
                      >
                        <FaTimes />
                      </DeleteButton>
                    </SubtaskItem>
                  ))}
                </SubtaskList>
              )}
            </SubtaskContainer>
          </FormGroup>

          {error && (
            <ErrorMessage>
              <FaTimes /> {error}
            </ErrorMessage>
          )}

          <ButtonGroup>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Create Task'}
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </PageContainer>
  );
}

export default CreateTask;


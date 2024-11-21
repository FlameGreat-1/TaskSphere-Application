import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaClock, FaTags, FaEye } from 'react-icons/fa';
import TaskModal from './TaskModal';
import TaskDetails from './TaskDetails';
import { updateTask, deleteTask } from '../services/api';


const TaskListContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: ${props => props.theme.cardBackground || '#f8f9fa'};
  padding: 20px;
  border-radius: 5px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.cardBackground || 'white'};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TaskCheckbox = styled.input`
  margin-right: 1rem;
`;

const TaskContent = styled.div`
  flex-grow: 1;
`;

const TaskTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.text || '#333'};
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0 0;
  color: ${props => props.theme.textSecondary || '#666'};
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary || '#666'};
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary || '#666'};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.primary || '#007bff'};
  }
`;

const AddTaskButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.primary || '#007bff'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => props.theme.primaryDark || '#0056b3'};
  }
`;

const PriorityIndicator = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${props => 
    props.priority === 'high' ? 'red' : 
    props.priority === 'medium' ? 'orange' : 
    'green'
  };
`;

function TaskList({ tasks, onTaskCreated, onTaskUpdated, onTaskDeleted }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [error, setError] = useState(null);

  const addTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const editTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      onTaskDeleted(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      const updatedTask = { ...taskToUpdate, is_completed: !taskToUpdate.is_completed };
      const response = await updateTask(id, updatedTask);
      onTaskUpdated(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const response = await updateTask(editingTask.id, taskData);
        onTaskUpdated(response.data);
      } else {
        onTaskCreated(taskData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleViewDetails = (taskId) => {
    setViewingTaskId(taskId);
  };

  const handleTaskUpdate = useCallback((updatedTask) => {
    onTaskUpdated(updatedTask);
  }, [onTaskUpdated]);

  const handleTaskDelete = useCallback((deletedTaskId) => {
    onTaskDeleted(deletedTaskId);
    setViewingTaskId(null);
  }, [onTaskDeleted]);

  return (
    <TaskListContainer>
      <h2>My Tasks</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {tasks.map(task => (
        <TaskItem key={task.id}>
          <TaskCheckbox 
            type="checkbox" 
            checked={task.is_completed} 
            onChange={() => toggleTaskCompletion(task.id)} 
          />
          <TaskContent>
            <TaskTitle>
              <PriorityIndicator priority={task.priority} />
              {task.title}
            </TaskTitle>
            <TaskDescription>{task.description}</TaskDescription>
            <TaskMeta>
              <FaClock /> {new Date(task.due_date).toLocaleDateString()} &nbsp;
              <FaTags /> {task.tags && task.tags.length > 0 ? task.tags.join(', ') : 'No tags'}
            </TaskMeta>
          </TaskContent>
          <TaskActions>
            <ActionButton onClick={() => handleViewDetails(task.id)}><FaEye /></ActionButton>
            <ActionButton onClick={() => editTask(task)}><FaEdit /></ActionButton>
            <ActionButton onClick={() => handleDeleteTask(task.id)}><FaTrash /></ActionButton>
          </TaskActions>
        </TaskItem>
      ))}
      <AddTaskButton onClick={addTask}>
        <FaPlus /> Add Task
      </AddTaskButton>
      {isModalOpen && (
        <TaskModal 
          task={editingTask} 
          onSave={handleSaveTask} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      {viewingTaskId && (
        <TaskDetails
          taskId={viewingTaskId}
          onClose={() => setViewingTaskId(null)}
          onTaskUpdated={handleTaskUpdate}
          onTaskDeleted={handleTaskDelete}
        />
      )}
    </TaskListContainer>
  );
}

export default TaskList;

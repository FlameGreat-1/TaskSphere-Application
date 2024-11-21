import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchTask, updateTask, deleteTask } from '../services/api';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.cardBackground || '#ffffff'};
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const TaskTitle = styled.h2`
  color: ${props => props.theme.text || '#333'};
  margin-bottom: 15px;
`;

const TaskInfo = styled.p`
  margin-bottom: 10px;
  color: ${props => props.theme.textSecondary || '#666'};
`;

const Button = styled.button`
  padding: 10px 15px;
  margin-right: 10px;
  margin-top: 10px;
  background-color: ${props => props.theme.primary || '#007bff'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: ${props => props.theme.primaryDark || '#0056b3'};
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  &:hover {
    background-color: #c82333;
  }
`;

function TaskDetails({ taskId, onClose, onTaskUpdated, onTaskDeleted }) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTask(taskId);
      setTask(response.data);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleComplete = async () => {
    try {
      const updatedTask = await updateTask(taskId, { ...task, is_completed: !task.is_completed });
      setTask(updatedTask.data);
      onTaskUpdated(updatedTask.data);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  if (isLoading) return <ModalBackground><ModalContent>Loading...</ModalContent></ModalBackground>;
  if (error) return <ModalBackground><ModalContent>Error: {error}</ModalContent></ModalBackground>;
  if (!task) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <TaskTitle>{task.title}</TaskTitle>
        <TaskInfo><strong>Description:</strong> {task.description}</TaskInfo>
        <TaskInfo><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</TaskInfo>
        <TaskInfo><strong>Priority:</strong> {task.priority}</TaskInfo>
        <TaskInfo><strong>Status:</strong> {task.is_completed ? 'Completed' : 'Pending'}</TaskInfo>
        <TaskInfo><strong>Category:</strong> {task.category || 'Not specified'}</TaskInfo>
        <TaskInfo><strong>Tags:</strong> {task.tags && task.tags.length > 0 ? task.tags.join(', ') : 'None'}</TaskInfo>
        <Button onClick={handleComplete}>
          {task.is_completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </Button>
        <DeleteButton onClick={handleDelete}>Delete Task</DeleteButton>
        <Button onClick={onClose}>Close</Button>
      </ModalContent>
    </ModalBackground>
  );
}

export default TaskDetails;

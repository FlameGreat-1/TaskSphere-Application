import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchDashboardData } from '../services/api';
import { FaCheckCircle, FaClock, FaExclamationCircle, FaList, FaCalendarAlt, FaChartPie } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DashboardHeader = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.primaryText || '#333'};
  margin-bottom: 20px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const DashboardCard = styled.div`
  background-color: ${props => props.theme.cardBackground || '#ffffff'};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h2`
  color: ${props => props.theme.secondaryText || '#555'};
  font-size: 1.2rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`;

const CardIcon = styled.span`
  margin-right: 10px;
  color: ${props => props.theme.primary || '#007bff'};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.primary || '#007bff'};
  margin-bottom: 5px;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary || '#666'};
`;

const TaskList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TaskItem = styled.li`
  margin-bottom: 10px;
  padding: 10px;
  background-color: ${props => props.theme.backgroundLight || '#f8f9fa'};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.theme.backgroundLightHover || '#e9ecef'};
  }
`;

const TaskTitle = styled.strong`
  display: block;
  margin-bottom: 5px;
  color: ${props => props.theme.primaryText || '#333'};
`;

const TaskDate = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary || '#666'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: ${props => props.theme.primary || '#007bff'};
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) return <LoadingSpinner>Loading dashboard...</LoadingSpinner>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!dashboardData) return null;

  const completionRate = dashboardData.total_tasks > 0 
    ? (dashboardData.completed_tasks / dashboardData.total_tasks) * 100 
    : 0;

  return (
    <DashboardContainer>
      <DashboardHeader>Dashboard</DashboardHeader>
      <DashboardGrid>
        <DashboardCard>
          <CardTitle><CardIcon><FaList /></CardIcon>Tasks Overview</CardTitle>
          <StatGrid>
            <StatItem>
              <StatValue>{dashboardData.total_tasks || 0}</StatValue>
              <StatLabel>Total Tasks</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{dashboardData.completed_tasks || 0}</StatValue>
              <StatLabel>Completed</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{dashboardData.overdue_tasks || 0}</StatValue>
              <StatLabel>Overdue</StatLabel>
            </StatItem>
            <StatItem>
              <div style={{ width: '60px', height: '60px' }}>
                <CircularProgressbar
                  value={completionRate}
                  text={`${completionRate.toFixed(0)}%`}
                  styles={buildStyles({
                    textSize: '24px',
                    pathColor: `rgba(62, 152, 199, ${completionRate / 100})`,
                    textColor: '#3e98c7',
                    trailColor: '#d6d6d6',
                  })}
                />
              </div>
              <StatLabel>Completion Rate</StatLabel>
            </StatItem>
          </StatGrid>
        </DashboardCard>

        <DashboardCard>
          <CardTitle><CardIcon><FaClock /></CardIcon>Recent Tasks</CardTitle>
          <TaskList>
            {dashboardData.recent_tasks && dashboardData.recent_tasks.length > 0 ? (
              dashboardData.recent_tasks.map(task => (
                <TaskItem key={task.id}>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDate>Due: {new Date(task.due_date).toLocaleDateString()}</TaskDate>
                </TaskItem>
              ))
            ) : (
              <p>No recent tasks available.</p>
            )}
          </TaskList>
        </DashboardCard>

        <DashboardCard>
          <CardTitle><CardIcon><FaCalendarAlt /></CardIcon>Upcoming Deadlines</CardTitle>
          <TaskList>
            {dashboardData.upcoming_deadlines && dashboardData.upcoming_deadlines.length > 0 ? (
              dashboardData.upcoming_deadlines.map(task => (
                <TaskItem key={task.id}>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDate>Due: {new Date(task.due_date).toLocaleDateString()}</TaskDate>
                </TaskItem>
              ))
            ) : (
              <p>No upcoming deadlines.</p>
            )}
          </TaskList>
        </DashboardCard>

        <DashboardCard>
          <CardTitle><CardIcon><FaChartPie /></CardIcon>Task Categories</CardTitle>
          {dashboardData.task_categories && Object.entries(dashboardData.task_categories).length > 0 ? (
            Object.entries(dashboardData.task_categories).map(([category, count]) => (
              <StatItem key={category}>
                <StatValue>{count}</StatValue>
                <StatLabel>{category}</StatLabel>
              </StatItem>
            ))
          ) : (
            <p>No task categories available.</p>
          )}
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { fetchAnalyticsData } from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title as ChartTitle, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  chartColors: [
    'rgba(74, 144, 226, 0.7)',
    'rgba(80, 200, 120, 0.7)',
    'rgba(255, 107, 107, 0.7)',
    'rgba(255, 167, 38, 0.7)',
    'rgba(156, 39, 176, 0.7)'
  ]
};

// Styled Components
const AnalyticsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${theme.background};
  min-height: 100vh;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const AnalyticsHeader = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const AnalyticsTitle = styled.h1`
  color: ${theme.text};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const AnalyticsSubtitle = styled.p`
  color: ${theme.text}99;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const StatCard = styled.div`
  background: ${theme.cardBg};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatTitle = styled.h3`
  color: ${theme.text}99;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: ${theme.text};
  font-size: 2rem;
  font-weight: 600;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${theme.cardBg};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${slideIn} 1s ease-out;
`;

const ChartCardTitle = styled.h3`
  color: ${theme.text};
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.text}99;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Spinner = styled.div`
  border: 4px solid ${theme.border};
  border-top: 4px solid ${theme.primary};
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

function Analytics() { 
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAnalyticsData();
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner>
        <Spinner />
      </LoadingSpinner>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!analyticsData) {
    return <div>No analytics data available.</div>;
  }

  const { total_tasks, completed_tasks, pending_tasks, completion_rate, priority_distribution, weekly_data } = analyticsData;

  // Chart configurations
  const completionStatusData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [completed_tasks, pending_tasks],
      backgroundColor: [theme.success, theme.warning],
      borderWidth: 0
    }]
  };

  const weeklyProgressData = {
    labels: weekly_data.map(d => d.date),
    datasets: [
      {
        label: 'Total Tasks',
        data: weekly_data.map(d => d.total),
        borderColor: theme.primary,
        backgroundColor: `${theme.primary}33`,
        fill: true
      },
      {
        label: 'Completed Tasks',
        data: weekly_data.map(d => d.completed),
        borderColor: theme.success,
        backgroundColor: `${theme.success}33`,
        fill: true
      }
    ]
  };

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        priority_distribution.high || 0,
        priority_distribution.medium || 0,
        priority_distribution.low || 0
      ],
      backgroundColor: [theme.danger, theme.warning, theme.success],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>TaskSphere Analytics</AnalyticsTitle>
        <AnalyticsSubtitle>Track your productivity and task management metrics</AnalyticsSubtitle>
      </AnalyticsHeader>

      <StatsGrid>
        <StatCard>
          <StatTitle>Total Tasks</StatTitle>
          <StatValue>{total_tasks}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Completed Tasks</StatTitle>
          <StatValue>{completed_tasks}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Pending Tasks</StatTitle>
          <StatValue>{pending_tasks}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Completion Rate</StatTitle>
          <StatValue>{completion_rate}%</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartCardTitle>Weekly Progress</ChartCardTitle>
          {total_tasks > 0 ? (
            <div style={{ height: '300px' }}>
              <Line data={weeklyProgressData} options={chartOptions} />
            </div>
          ) : (
            <NoDataMessage>No tasks available</NoDataMessage>
          )}
        </ChartCard>

        <ChartCard>
          <ChartCardTitle>Task Completion Status</ChartCardTitle>
          {total_tasks > 0 ? (
            <div style={{ height: '300px' }}>
              <Doughnut data={completionStatusData} options={chartOptions} />
            </div>
          ) : (
            <NoDataMessage>No tasks available</NoDataMessage>
          )}
        </ChartCard>

        <ChartCard>
          <ChartCardTitle>Priority Distribution</ChartCardTitle>
          {total_tasks > 0 ? (
            <div style={{ height: '300px' }}>
              <PolarArea data={priorityData} options={chartOptions} />
            </div>
          ) : (
            <NoDataMessage>No tasks available</NoDataMessage>
          )}
        </ChartCard>
      </ChartsGrid>
    </AnalyticsContainer>
  );
}

export default Analytics;

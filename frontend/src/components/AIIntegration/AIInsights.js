import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import {
  fetchPredictions,
  fetchRecommendations,
  generateTaskSuggestions,
  optimizeSchedule,
  getWorkflowSuggestions,
} from './aiActions';
import AIPredictions from './AIPredictions';
import AIRecommendations from './AIRecommendations';
import TaskAIServices from './TaskAIServices';
import ProjectAIServices from './ProjectAIServices';
import TaskForm from './TaskForm';

const AIInsightsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#3498db' : '#ecf0f1'};
  color: ${props => props.active ? 'white' : '#34495e'};
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#bdc3c7'};
  }
`;

const ContentContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DemoModeButton = styled.button`
  display: block;
  margin: 0 auto 2rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#e74c3c' : '#2ecc71'};
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: ${props => props.active ? '#c0392b' : '#27ae60'};
  }
`;

const InputContainer = styled.div`
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
`;

const AIInsights = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoInsights, setDemoInsights] = useState(null);

  const {
    predictions,
    recommendations,
    taskSuggestions,
    optimizedSchedule,
    workflowSuggestions,
    loading,
    error
  } = useSelector(state => state.ai);

  useEffect(() => {
    if (!isDemoMode) {
      dispatch(fetchPredictions());
      dispatch(fetchRecommendations());
      dispatch(generateTaskSuggestions());
      dispatch(optimizeSchedule());
      dispatch(getWorkflowSuggestions());
    }
  }, [dispatch, isDemoMode]);

  const activateDemoMode = async () => {
    setIsDemoMode(true);
    try {
      const response = await axios.post('/api/activate-demo-mode/', {
        num_users: 10,
        num_projects: 30
      });
      alert(`Demo mode activated successfully! Created ${response.data.users_created} users and ${response.data.projects_created} projects.`);
      fetchDemoInsights();
    } catch (error) {
      console.error('Error activating demo mode:', error);
      alert('Failed to activate demo mode');
      setIsDemoMode(false);
    }
  };

  const fetchDemoInsights = async () => {
    try {
      const response = await axios.get('/api/get-ai-insights/');
      setDemoInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      alert('Failed to fetch AI insights');
    }
  };

  const renderContent = () => {
    if (isDemoMode) {
      return renderDemoContent();
    }

    switch (activeTab) {
      case 'predictions':
        return <AIPredictions predictions={predictions} />;
      case 'recommendations':
        return <AIRecommendations recommendations={recommendations} />;
      case 'taskSuggestions':
        return (
          <div>
            <h3>Task Suggestions</h3>
            {taskSuggestions.map((suggestion, index) => (
              <div key={index}>{suggestion.description}</div>
            ))}
          </div>
        );
      case 'optimizedSchedule':
        return (
          <div>
            <h3>Optimized Schedule</h3>
            {optimizedSchedule && (
              <pre>{JSON.stringify(optimizedSchedule, null, 2)}</pre>
            )}
          </div>
        );
      case 'workflowSuggestions':
        return (
          <div>
            <h3>Workflow Suggestions</h3>
            {workflowSuggestions.map((suggestion, index) => (
              <div key={index}>{suggestion.description}</div>
            ))}
          </div>
        );
      case 'taskAIServices':
        return <TaskAIServices taskId={selectedTaskId} />;
      case 'projectAIServices':
        return <ProjectAIServices projectId={selectedProjectId} />;
      case 'createTask':
        return <TaskForm onSubmit={(task) => console.log('New task created:', task)} />;
      default:
        return null;
    }
  };

  const renderDemoContent = () => {
    if (!demoInsights) return 'Loading demo insights...';

    return (
      <div>
        <h3>Demo AI Insights</h3>
        <div className="insights-section">
          <h4>Project Insights</h4>
          <p>Average Efficiency: {demoInsights.project_insights.avg_efficiency.toFixed(2)}</p>
          <p>Average Complexity: {demoInsights.project_insights.avg_complexity.toFixed(2)}</p>
          <p>Total Projects: {demoInsights.project_insights.total_projects}</p>
        </div>
        <div className="insights-section">
          <h4>Task Insights</h4>
          <p>Average Complexity: {demoInsights.task_insights.avg_complexity.toFixed(2)}</p>
          <p>Total Tasks: {demoInsights.task_insights.total_tasks}</p>
          <p>Completed Tasks: {demoInsights.task_insights.completed_tasks}</p>
        </div>
        <div className="insights-section">
          <h4>Productivity Insights</h4>
          <p>Average Productivity: {demoInsights.productivity_insights.avg_productivity.toFixed(2)}</p>
          <p>Average Tasks Completed: {demoInsights.productivity_insights.avg_tasks_completed.toFixed(2)}</p>
        </div>
        <div className="insights-section">
          <h4>AI Recommendations</h4>
          <ul>
            {demoInsights.ai_recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <AIInsightsContainer>
      <Header>AI Insights Dashboard</Header>
      
      <DemoModeButton onClick={activateDemoMode} active={isDemoMode}>
        {isDemoMode ? 'Demo Mode Active' : 'Activate Demo Mode'}
      </DemoModeButton>
      
      <TabContainer>
        {['predictions', 'recommendations', 'taskSuggestions', 'optimizedSchedule', 'workflowSuggestions', 'taskAIServices', 'projectAIServices', 'createTask'].map(tab => (
          <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Tab>
        ))}
      </TabContainer>

      {activeTab === 'taskAIServices' && !isDemoMode && (
        <InputContainer>
          <Input
            type="number"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            placeholder="Enter Task ID"
          />
        </InputContainer>
      )}
      
      {activeTab === 'projectAIServices' && !isDemoMode && (
        <InputContainer>
          <Input
            type="number"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            placeholder="Enter Project ID"
          />
        </InputContainer>
      )}

      <ContentContainer>
        {!isDemoMode && loading && <p>Loading...</p>}
        {!isDemoMode && error && <p>Error: {error}</p>}
        {renderContent()}
      </ContentContainer>
    </AIInsightsContainer>
  );
};

export default AIInsights;

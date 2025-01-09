import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
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
  padding: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightBackground};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: none;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const ContentContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  padding: 20px;
  border-radius: 5px;
`;

const AIInsights = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
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
    dispatch(fetchPredictions());
    dispatch(fetchRecommendations());
    dispatch(generateTaskSuggestions());
    dispatch(optimizeSchedule());
    dispatch(getWorkflowSuggestions());
  }, [dispatch]);

  const renderContent = () => {
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

  return (
    <AIInsightsContainer>
      <h2>AI Insights</h2>
      <TabContainer>
        <Tab active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')}>Predictions</Tab>
        <Tab active={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')}>Recommendations</Tab>
        <Tab active={activeTab === 'taskSuggestions'} onClick={() => setActiveTab('taskSuggestions')}>Task Suggestions</Tab>
        <Tab active={activeTab === 'optimizedSchedule'} onClick={() => setActiveTab('optimizedSchedule')}>Optimized Schedule</Tab>
        <Tab active={activeTab === 'workflowSuggestions'} onClick={() => setActiveTab('workflowSuggestions')}>Workflow Suggestions</Tab>
        <Tab active={activeTab === 'taskAIServices'} onClick={() => setActiveTab('taskAIServices')}>Task AI Services</Tab>
        <Tab active={activeTab === 'projectAIServices'} onClick={() => setActiveTab('projectAIServices')}>Project AI Services</Tab>
        <Tab active={activeTab === 'createTask'} onClick={() => setActiveTab('createTask')}>Create Task with NLP</Tab>
      </TabContainer>
      
      {activeTab === 'taskAIServices' && (
        <div>
          <label>Select Task ID: </label>
          <input type="number" value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} />
        </div>
      )}
      
      {activeTab === 'projectAIServices' && (
        <div>
          <label>Select Project ID: </label>
          <input type="number" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} />
        </div>
      )}

      <ContentContainer>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && renderContent()}
      </ContentContainer>
    </AIInsightsContainer>
  );
};

export default AIInsights;

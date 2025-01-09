import React, { useState } from 'react';
import styled from 'styled-components';
import { AIService } from './api';

const ServicesContainer = styled.div`
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ServiceButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  margin: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: #2980b9;
  }
`;

const ResultDisplay = styled.pre`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #e9ecef;
  margin-top: 1.5rem;
  font-family: 'Courier New', Courier, monospace;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(52, 152, 219, 0.3);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin: 1rem 0;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 1rem;
  background-color: #fadbd8;
  border: 1px solid #f5b7b1;
  border-radius: 4px;
  margin-top: 1rem;
`;

const TaskAIServices = ({ taskId }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleServiceCall = async (serviceFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceFunction(taskId, ...args);
      setResult(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { name: 'Analyze Task Sentiment', func: AIService.analyzeTaskSentiment },
    { name: 'Predict Task Completion Time', func: AIService.predictTaskCompletionTime },
    { name: 'Predict Task Priority', func: AIService.predictTaskPriority },
  ];

  return (
    <ServicesContainer>
      <h2>Task AI Services</h2>
      <div>
        {services.map((service) => (
          <ServiceButton key={service.name} onClick={() => handleServiceCall(service.func)}>
            {service.name}
          </ServiceButton>
        ))}
      </div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {result && <ResultDisplay>{JSON.stringify(result, null, 2)}</ResultDisplay>}
    </ServicesContainer>
  );
};

export default TaskAIServices;

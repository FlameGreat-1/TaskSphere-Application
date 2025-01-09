import React from 'react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import aiReducer from './aiReducer';
import AIInsights from './AIInsights';
import AIPredictions from './AIPredictions';
import AIRecommendations from './AIRecommendations';
import AIFeedbackForm from './AIFeedbackForm';
import TaskAIServices from './TaskAIServices';
import ProjectAIServices from './ProjectAIServices';
import TaskForm from './TaskForm';

// Create the root reducer
const rootReducer = combineReducers({
  ai: aiReducer,
  // Add other reducers here if needed
});

// Create the Redux store
const store = createStore(rootReducer, applyMiddleware(thunk));

// Main AIIntegration component
const AIIntegration = () => (
  <Provider store={store}>
    <AIInsights />
  </Provider>
);

// Export all components and the main AIIntegration component
export {
  AIIntegration as default,
  AIInsights,
  AIPredictions,
  AIRecommendations,
  AIFeedbackForm,
  TaskAIServices,
  ProjectAIServices,
  TaskForm
};

// Export store separately in case it's needed elsewhere
export { store };

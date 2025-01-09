import { configureStore } from '@reduxjs/toolkit';
import aiReducer from './components/AIIntegration/aiReducer';

export const store = configureStore({
  reducer: {
    ai: aiReducer,
    
  },
});

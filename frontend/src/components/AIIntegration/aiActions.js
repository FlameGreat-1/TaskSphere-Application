import { AIService } from './api';

export const FETCH_PREDICTIONS_REQUEST = 'FETCH_PREDICTIONS_REQUEST';
export const FETCH_PREDICTIONS_SUCCESS = 'FETCH_PREDICTIONS_SUCCESS';
export const FETCH_PREDICTIONS_FAILURE = 'FETCH_PREDICTIONS_FAILURE';

export const FETCH_RECOMMENDATIONS_REQUEST = 'FETCH_RECOMMENDATIONS_REQUEST';
export const FETCH_RECOMMENDATIONS_SUCCESS = 'FETCH_RECOMMENDATIONS_SUCCESS';
export const FETCH_RECOMMENDATIONS_FAILURE = 'FETCH_RECOMMENDATIONS_FAILURE';

export const APPLY_RECOMMENDATION_REQUEST = 'APPLY_RECOMMENDATION_REQUEST';
export const APPLY_RECOMMENDATION_SUCCESS = 'APPLY_RECOMMENDATION_SUCCESS';
export const APPLY_RECOMMENDATION_FAILURE = 'APPLY_RECOMMENDATION_FAILURE';

export const PROVIDE_FEEDBACK_REQUEST = 'PROVIDE_FEEDBACK_REQUEST';
export const PROVIDE_FEEDBACK_SUCCESS = 'PROVIDE_FEEDBACK_SUCCESS';
export const PROVIDE_FEEDBACK_FAILURE = 'PROVIDE_FEEDBACK_FAILURE';

export const GENERATE_TASK_SUGGESTIONS_REQUEST = 'GENERATE_TASK_SUGGESTIONS_REQUEST';
export const GENERATE_TASK_SUGGESTIONS_SUCCESS = 'GENERATE_TASK_SUGGESTIONS_SUCCESS';
export const GENERATE_TASK_SUGGESTIONS_FAILURE = 'GENERATE_TASK_SUGGESTIONS_FAILURE';

export const OPTIMIZE_SCHEDULE_REQUEST = 'OPTIMIZE_SCHEDULE_REQUEST';
export const OPTIMIZE_SCHEDULE_SUCCESS = 'OPTIMIZE_SCHEDULE_SUCCESS';
export const OPTIMIZE_SCHEDULE_FAILURE = 'OPTIMIZE_SCHEDULE_FAILURE';

export const ANALYZE_TASK_SENTIMENT_REQUEST = 'ANALYZE_TASK_SENTIMENT_REQUEST';
export const ANALYZE_TASK_SENTIMENT_SUCCESS = 'ANALYZE_TASK_SENTIMENT_SUCCESS';
export const ANALYZE_TASK_SENTIMENT_FAILURE = 'ANALYZE_TASK_SENTIMENT_FAILURE';

export const PREDICT_TASK_COMPLETION_TIME_REQUEST = 'PREDICT_TASK_COMPLETION_TIME_REQUEST';
export const PREDICT_TASK_COMPLETION_TIME_SUCCESS = 'PREDICT_TASK_COMPLETION_TIME_SUCCESS';
export const PREDICT_TASK_COMPLETION_TIME_FAILURE = 'PREDICT_TASK_COMPLETION_TIME_FAILURE';

export const PREDICT_TASK_PRIORITY_REQUEST = 'PREDICT_TASK_PRIORITY_REQUEST';
export const PREDICT_TASK_PRIORITY_SUCCESS = 'PREDICT_TASK_PRIORITY_SUCCESS';
export const PREDICT_TASK_PRIORITY_FAILURE = 'PREDICT_TASK_PRIORITY_FAILURE';

export const CREATE_TASK_WITH_NLP_REQUEST = 'CREATE_TASK_WITH_NLP_REQUEST';
export const CREATE_TASK_WITH_NLP_SUCCESS = 'CREATE_TASK_WITH_NLP_SUCCESS';
export const CREATE_TASK_WITH_NLP_FAILURE = 'CREATE_TASK_WITH_NLP_FAILURE';

export const GET_WORKFLOW_SUGGESTIONS_REQUEST = 'GET_WORKFLOW_SUGGESTIONS_REQUEST';
export const GET_WORKFLOW_SUGGESTIONS_SUCCESS = 'GET_WORKFLOW_SUGGESTIONS_SUCCESS';
export const GET_WORKFLOW_SUGGESTIONS_FAILURE = 'GET_WORKFLOW_SUGGESTIONS_FAILURE';

export const OPTIMIZE_PROJECT_RESOURCES_REQUEST = 'OPTIMIZE_PROJECT_RESOURCES_REQUEST';
export const OPTIMIZE_PROJECT_RESOURCES_SUCCESS = 'OPTIMIZE_PROJECT_RESOURCES_SUCCESS';
export const OPTIMIZE_PROJECT_RESOURCES_FAILURE = 'OPTIMIZE_PROJECT_RESOURCES_FAILURE';

export const ANALYZE_TASK_DEPENDENCIES_REQUEST = 'ANALYZE_TASK_DEPENDENCIES_REQUEST';
export const ANALYZE_TASK_DEPENDENCIES_SUCCESS = 'ANALYZE_TASK_DEPENDENCIES_SUCCESS';
export const ANALYZE_TASK_DEPENDENCIES_FAILURE = 'ANALYZE_TASK_DEPENDENCIES_FAILURE';

export const ASSESS_PROJECT_RISKS_REQUEST = 'ASSESS_PROJECT_RISKS_REQUEST';
export const ASSESS_PROJECT_RISKS_SUCCESS = 'ASSESS_PROJECT_RISKS_SUCCESS';
export const ASSESS_PROJECT_RISKS_FAILURE = 'ASSESS_PROJECT_RISKS_FAILURE';

export const SUGGEST_COLLABORATIONS_REQUEST = 'SUGGEST_COLLABORATIONS_REQUEST';
export const SUGGEST_COLLABORATIONS_SUCCESS = 'SUGGEST_COLLABORATIONS_SUCCESS';
export const SUGGEST_COLLABORATIONS_FAILURE = 'SUGGEST_COLLABORATIONS_FAILURE';

export const COMPREHENSIVE_PROJECT_ANALYSIS_REQUEST = 'COMPREHENSIVE_PROJECT_ANALYSIS_REQUEST';
export const COMPREHENSIVE_PROJECT_ANALYSIS_SUCCESS = 'COMPREHENSIVE_PROJECT_ANALYSIS_SUCCESS';
export const COMPREHENSIVE_PROJECT_ANALYSIS_FAILURE = 'COMPREHENSIVE_PROJECT_ANALYSIS_FAILURE';

export const GENERATE_AI_INSIGHTS_REPORT_REQUEST = 'GENERATE_AI_INSIGHTS_REPORT_REQUEST';
export const GENERATE_AI_INSIGHTS_REPORT_SUCCESS = 'GENERATE_AI_INSIGHTS_REPORT_SUCCESS';
export const GENERATE_AI_INSIGHTS_REPORT_FAILURE = 'GENERATE_AI_INSIGHTS_REPORT_FAILURE';

export const fetchPredictions = (page = 1, filters = {}) => async (dispatch) => {
  dispatch({ type: FETCH_PREDICTIONS_REQUEST });
  try {
    const response = await AIService.getPredictions(page, filters);
    dispatch({ type: FETCH_PREDICTIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_PREDICTIONS_FAILURE, payload: error.message });
  }
};

export const fetchRecommendations = (page = 1, filters = {}) => async (dispatch) => {
  dispatch({ type: FETCH_RECOMMENDATIONS_REQUEST });
  try {
    const response = await AIService.getRecommendations(page, filters);
    dispatch({ type: FETCH_RECOMMENDATIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_RECOMMENDATIONS_FAILURE, payload: error.message });
  }
};

export const applyRecommendation = (id) => async (dispatch) => {
  dispatch({ type: APPLY_RECOMMENDATION_REQUEST });
  try {
    const response = await AIService.applyRecommendation(id);
    dispatch({ type: APPLY_RECOMMENDATION_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: APPLY_RECOMMENDATION_FAILURE, payload: error.message });
  }
};

export const provideFeedback = (type, id, feedback) => async (dispatch) => {
  dispatch({ type: PROVIDE_FEEDBACK_REQUEST });
  try {
    const response = type === 'prediction'
      ? await AIService.providePredictionFeedback(id, feedback)
      : await AIService.provideRecommendationFeedback(id, feedback);
    dispatch({ type: PROVIDE_FEEDBACK_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: PROVIDE_FEEDBACK_FAILURE, payload: error.message });
  }
};

export const generateTaskSuggestions = () => async (dispatch) => {
  dispatch({ type: GENERATE_TASK_SUGGESTIONS_REQUEST });
  try {
    const response = await AIService.generateTaskSuggestions();
    dispatch({ type: GENERATE_TASK_SUGGESTIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GENERATE_TASK_SUGGESTIONS_FAILURE, payload: error.message });
  }
};

export const optimizeSchedule = () => async (dispatch) => {
  dispatch({ type: OPTIMIZE_SCHEDULE_REQUEST });
  try {
    const response = await AIService.optimizeSchedule();
    dispatch({ type: OPTIMIZE_SCHEDULE_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: OPTIMIZE_SCHEDULE_FAILURE, payload: error.message });
  }
};

export const analyzeTaskSentiment = (taskId) => async (dispatch) => {
  dispatch({ type: ANALYZE_TASK_SENTIMENT_REQUEST });
  try {
    const response = await AIService.analyzeTaskSentiment(taskId);
    dispatch({ type: ANALYZE_TASK_SENTIMENT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: ANALYZE_TASK_SENTIMENT_FAILURE, payload: error.message });
  }
};

export const predictTaskCompletionTime = (taskId) => async (dispatch) => {
  dispatch({ type: PREDICT_TASK_COMPLETION_TIME_REQUEST });
  try {
    const response = await AIService.predictTaskCompletionTime(taskId);
    dispatch({ type: PREDICT_TASK_COMPLETION_TIME_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: PREDICT_TASK_COMPLETION_TIME_FAILURE, payload: error.message });
  }
};

export const predictTaskPriority = (taskId) => async (dispatch) => {
  dispatch({ type: PREDICT_TASK_PRIORITY_REQUEST });
  try {
    const response = await AIService.predictTaskPriority(taskId);
    dispatch({ type: PREDICT_TASK_PRIORITY_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: PREDICT_TASK_PRIORITY_FAILURE, payload: error.message });
  }
};

export const createTaskWithNLP = (text) => async (dispatch) => {
  dispatch({ type: CREATE_TASK_WITH_NLP_REQUEST });
  try {
    const response = await AIService.createTaskWithNLP(text);
    dispatch({ type: CREATE_TASK_WITH_NLP_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: CREATE_TASK_WITH_NLP_FAILURE, payload: error.message });
  }
};

export const getWorkflowSuggestions = () => async (dispatch) => {
  dispatch({ type: GET_WORKFLOW_SUGGESTIONS_REQUEST });
  try {
    const response = await AIService.getWorkflowSuggestions();
    dispatch({ type: GET_WORKFLOW_SUGGESTIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GET_WORKFLOW_SUGGESTIONS_FAILURE, payload: error.message });
  }
};

export const provideRecommendationFeedback = (id, feedback) => async (dispatch) => {
  dispatch({ type: PROVIDE_FEEDBACK_REQUEST });
  try {
    const response = await AIService.provideRecommendationFeedback(id, feedback);
    dispatch({ type: PROVIDE_FEEDBACK_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: PROVIDE_FEEDBACK_FAILURE, payload: error.message });
  }
};

export const optimizeProjectResources = () => async (dispatch) => {
  dispatch({ type: OPTIMIZE_PROJECT_RESOURCES_REQUEST });
  try {
    const response = await AIService.optimizeProjectResources();
    dispatch({ type: OPTIMIZE_PROJECT_RESOURCES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: OPTIMIZE_PROJECT_RESOURCES_FAILURE, payload: error.message });
  }
};

export const analyzeTaskDependencies = (taskId) => async (dispatch) => {
  dispatch({ type: ANALYZE_TASK_DEPENDENCIES_REQUEST });
  try {
    const response = await AIService.analyzeTaskDependencies(taskId);
    dispatch({ type: ANALYZE_TASK_DEPENDENCIES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: ANALYZE_TASK_DEPENDENCIES_FAILURE, payload: error.message });
  }
};

export const assessProjectRisks = () => async (dispatch) => {
  dispatch({ type: ASSESS_PROJECT_RISKS_REQUEST });
  try {
    const response = await AIService.assessProjectRisks();
    dispatch({ type: ASSESS_PROJECT_RISKS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: ASSESS_PROJECT_RISKS_FAILURE, payload: error.message });
  }
};

export const suggestCollaborations = () => async (dispatch) => {
  dispatch({ type: SUGGEST_COLLABORATIONS_REQUEST });
  try {
    const response = await AIService.suggestCollaborations();
    dispatch({ type: SUGGEST_COLLABORATIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: SUGGEST_COLLABORATIONS_FAILURE, payload: error.message });
  }
};

export const comprehensiveProjectAnalysis = () => async (dispatch) => {
  dispatch({ type: COMPREHENSIVE_PROJECT_ANALYSIS_REQUEST });
  try {
    const response = await AIService.comprehensiveProjectAnalysis();
    dispatch({ type: COMPREHENSIVE_PROJECT_ANALYSIS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: COMPREHENSIVE_PROJECT_ANALYSIS_FAILURE, payload: error.message });
  }
};

export const generateAIInsightsReport = () => async (dispatch) => {
  dispatch({ type: GENERATE_AI_INSIGHTS_REPORT_REQUEST });
  try {
    const response = await AIService.generateAIInsightsReport();
    dispatch({ type: GENERATE_AI_INSIGHTS_REPORT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GENERATE_AI_INSIGHTS_REPORT_FAILURE, payload: error.message });
  }
};

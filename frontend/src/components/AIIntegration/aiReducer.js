import {
    FETCH_PREDICTIONS_REQUEST,
    FETCH_PREDICTIONS_SUCCESS,
    FETCH_PREDICTIONS_FAILURE,
    FETCH_RECOMMENDATIONS_REQUEST,
    FETCH_RECOMMENDATIONS_SUCCESS,
    FETCH_RECOMMENDATIONS_FAILURE,
    APPLY_RECOMMENDATION_REQUEST,
    APPLY_RECOMMENDATION_SUCCESS,
    APPLY_RECOMMENDATION_FAILURE,
    PROVIDE_FEEDBACK_REQUEST,
    PROVIDE_FEEDBACK_SUCCESS,
    PROVIDE_FEEDBACK_FAILURE,
    GENERATE_TASK_SUGGESTIONS_REQUEST,
    GENERATE_TASK_SUGGESTIONS_SUCCESS,
    GENERATE_TASK_SUGGESTIONS_FAILURE,
    OPTIMIZE_SCHEDULE_REQUEST,
    OPTIMIZE_SCHEDULE_SUCCESS,
    OPTIMIZE_SCHEDULE_FAILURE,
    ANALYZE_TASK_SENTIMENT_REQUEST,
    ANALYZE_TASK_SENTIMENT_SUCCESS,
    ANALYZE_TASK_SENTIMENT_FAILURE,
    PREDICT_TASK_COMPLETION_TIME_REQUEST,
    PREDICT_TASK_COMPLETION_TIME_SUCCESS,
    PREDICT_TASK_COMPLETION_TIME_FAILURE,
    PREDICT_TASK_PRIORITY_REQUEST,
    PREDICT_TASK_PRIORITY_SUCCESS,
    PREDICT_TASK_PRIORITY_FAILURE,
    CREATE_TASK_WITH_NLP_REQUEST,
    CREATE_TASK_WITH_NLP_SUCCESS,
    CREATE_TASK_WITH_NLP_FAILURE,
    GET_WORKFLOW_SUGGESTIONS_REQUEST,
    GET_WORKFLOW_SUGGESTIONS_SUCCESS,
    GET_WORKFLOW_SUGGESTIONS_FAILURE,
  } from './aiActions';
  
  const initialState = {
    predictions: {
      results: [],
      count: 0,
      next: null,
      previous: null,
    },
    recommendations: {
      results: [],
      count: 0,
      next: null,
      previous: null,
    },
    taskSuggestions: [],
    optimizedSchedule: null,
    taskSentiment: null,
    taskCompletionTime: null,
    taskPriority: null,
    createdTask: null,
    workflowSuggestions: [],
    loading: false,
    error: null,
  };
  
  const aiReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_PREDICTIONS_REQUEST:
      case FETCH_RECOMMENDATIONS_REQUEST:
      case APPLY_RECOMMENDATION_REQUEST:
      case PROVIDE_FEEDBACK_REQUEST:
      case GENERATE_TASK_SUGGESTIONS_REQUEST:
      case OPTIMIZE_SCHEDULE_REQUEST:
      case ANALYZE_TASK_SENTIMENT_REQUEST:
      case PREDICT_TASK_COMPLETION_TIME_REQUEST:
      case PREDICT_TASK_PRIORITY_REQUEST:
      case CREATE_TASK_WITH_NLP_REQUEST:
      case GET_WORKFLOW_SUGGESTIONS_REQUEST:
        return { ...state, loading: true, error: null };
  
      case FETCH_PREDICTIONS_SUCCESS:
        return { ...state, loading: false, predictions: action.payload };
  
      case FETCH_RECOMMENDATIONS_SUCCESS:
        return { ...state, loading: false, recommendations: action.payload };
  
      case APPLY_RECOMMENDATION_SUCCESS:
        return {
          ...state,
          loading: false,
          recommendations: {
            ...state.recommendations,
            results: state.recommendations.results.map(rec =>
              rec.id === action.payload.id ? { ...rec, is_applied: true } : rec
            ),
          },
        };
  
      case PROVIDE_FEEDBACK_SUCCESS:
        return { ...state, loading: false };
  
      case GENERATE_TASK_SUGGESTIONS_SUCCESS:
        return { ...state, loading: false, taskSuggestions: action.payload };
  
      case OPTIMIZE_SCHEDULE_SUCCESS:
        return { ...state, loading: false, optimizedSchedule: action.payload };
  
      case ANALYZE_TASK_SENTIMENT_SUCCESS:
        return { ...state, loading: false, taskSentiment: action.payload };
  
      case PREDICT_TASK_COMPLETION_TIME_SUCCESS:
        return { ...state, loading: false, taskCompletionTime: action.payload };
  
      case PREDICT_TASK_PRIORITY_SUCCESS:
        return { ...state, loading: false, taskPriority: action.payload };
  
      case CREATE_TASK_WITH_NLP_SUCCESS:
        return { ...state, loading: false, createdTask: action.payload };
  
      case GET_WORKFLOW_SUGGESTIONS_SUCCESS:
        return { ...state, loading: false, workflowSuggestions: action.payload };
  
      case FETCH_PREDICTIONS_FAILURE:
      case FETCH_RECOMMENDATIONS_FAILURE:
      case APPLY_RECOMMENDATION_FAILURE:
      case PROVIDE_FEEDBACK_FAILURE:
      case GENERATE_TASK_SUGGESTIONS_FAILURE:
      case OPTIMIZE_SCHEDULE_FAILURE:
      case ANALYZE_TASK_SENTIMENT_FAILURE:
      case PREDICT_TASK_COMPLETION_TIME_FAILURE:
      case PREDICT_TASK_PRIORITY_FAILURE:
      case CREATE_TASK_WITH_NLP_FAILURE:
      case GET_WORKFLOW_SUGGESTIONS_FAILURE:
        return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  };
  
  export default aiReducer;
  
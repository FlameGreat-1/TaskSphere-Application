import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchPredictions, provideFeedback as providePredictionFeedback } from './aiActions';
import Pagination from './Pagination';
import AIFeedbackForm from './AIFeedbackForm';

const PredictionContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PredictionCard = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
`;

const PredictionDetails = styled.div`
  margin-top: 10px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 123, 255, 0.3);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const FilterButton = styled.button`
  margin-bottom: 10px;
`;

const AIPredictions = () => {
  const dispatch = useDispatch();
  const { predictions, loading, error } = useSelector((state) => state.ai);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchPredictions(currentPage, filters));
  }, [dispatch, currentPage, filters]);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFeedbackSubmit = (predictionId, feedback) => {
    dispatch(providePredictionFeedback(predictionId, feedback));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!predictions || !predictions.results) return <ErrorMessage>No predictions available.</ErrorMessage>;

  return (
    <PredictionContainer>
      <h2>AI Predictions</h2>
      <FilterButton onClick={() => handleFilterChange({ type: 'all' })}>
        Filter Predictions
      </FilterButton>
      {predictions.results.map((prediction) => (
        <PredictionCard key={prediction.id}>
          <h3>{prediction.prediction_type}</h3>
          <p>Confidence: {prediction.confidence ? prediction.confidence.toFixed(2) : 'N/A'}</p>
          <PredictionDetails>
            {prediction.prediction && Object.entries(prediction.prediction).map(([key, value]) => (
              <p key={key}>{`${key}: ${value}`}</p>
            ))}
          </PredictionDetails>
          <AIFeedbackForm 
            itemId={prediction.id} 
            itemType="prediction" 
            onSubmit={(feedback) => handleFeedbackSubmit(prediction.id, feedback)}
          />
        </PredictionCard>
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={predictions.count ? Math.ceil(predictions.count / 10) : 1}
        onPageChange={handlePageChange}
      />
    </PredictionContainer>
  );
};

export default AIPredictions;

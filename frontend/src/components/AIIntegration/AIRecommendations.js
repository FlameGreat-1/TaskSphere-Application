import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchRecommendations, applyRecommendation, provideRecommendationFeedback } from './aiActions';
import Pagination from './Pagination';
import AIFeedbackForm from './AIFeedbackForm';

const RecommendationContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RecommendationCard = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
`;

const RecommendationDetails = styled.div`
  margin-top: 10px;
`;

const ApplyButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
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

const AIRecommendations = () => {
  const dispatch = useDispatch();
  const { recommendations, loading, error } = useSelector((state) => state.ai);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchRecommendations(currentPage, filters));
  }, [dispatch, currentPage, filters]);

  const handleApply = (id) => {
    dispatch(applyRecommendation(id));
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFeedbackSubmit = (recommendationId, feedback) => {
    dispatch(provideRecommendationFeedback(recommendationId, feedback));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!recommendations || !recommendations.results) return <ErrorMessage>No recommendations available.</ErrorMessage>;

  return (
    <RecommendationContainer>
      <h2>AI Recommendations</h2>
      <FilterButton onClick={() => handleFilterChange({ type: 'all' })}>
        Filter Recommendations
      </FilterButton>
      {recommendations.results.map((recommendation) => (
        <RecommendationCard key={recommendation.id}>
          <h3>{recommendation.recommendation_type}</h3>
          <p>Confidence: {recommendation.confidence ? recommendation.confidence.toFixed(2) : 'N/A'}</p>
          <RecommendationDetails>
            {recommendation.recommendation && Object.entries(recommendation.recommendation).map(([key, value]) => (
              <p key={key}>{`${key}: ${value}`}</p>
            ))}
          </RecommendationDetails>
          {!recommendation.is_applied && (
            <ApplyButton onClick={() => handleApply(recommendation.id)}>
              Apply Recommendation
            </ApplyButton>
          )}
          <AIFeedbackForm 
            itemId={recommendation.id} 
            itemType="recommendation" 
            onSubmit={(feedback) => handleFeedbackSubmit(recommendation.id, feedback)}
          />
        </RecommendationCard>
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={recommendations.count ? Math.ceil(recommendations.count / 10) : 1}
        onPageChange={handlePageChange}
      />
    </RecommendationContainer>
  );
};

export default AIRecommendations;

import React, { useState } from 'react';
import styled from 'styled-components';

const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RatingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const RatingButton = styled.button`
  background-color: ${({ active }) => active ? '#007bff' : '#e9ecef'};
  color: ${({ active }) => active ? 'white' : '#495057'};
  border: 1px solid #ced4da;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ active }) => active ? '#0056b3' : '#ced4da'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
`;

const SubmitButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const AIFeedbackForm = ({ itemId, itemType, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ feedback, rating });
    setFeedback('');
    setRating(0);
  };

  return (
    <FeedbackForm onSubmit={handleSubmit}>
      <RatingContainer>
        {[1, 2, 3, 4, 5].map((value) => (
          <RatingButton
            key={value}
            active={rating === value}
            onClick={() => setRating(value)}
            type="button"
          >
            {value}
          </RatingButton>
        ))}
      </RatingContainer>
      <TextArea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Provide your feedback here..."
        rows={3}
      />
      <SubmitButton type="submit">Submit Feedback</SubmitButton>
    </FeedbackForm>
  );
};

export default AIFeedbackForm;

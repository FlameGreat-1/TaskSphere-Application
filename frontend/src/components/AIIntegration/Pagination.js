import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#007bff' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#007bff'};
  border: 1px solid #007bff;
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    color: #ffffff;
  }

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }
`;

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize = 10 }) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationContainer>
      <PageButton 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
      >
        First
      </PageButton>
      <PageButton 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Previous
      </PageButton>
      {pageNumbers.map(number => (
        <PageButton
          key={number}
          active={currentPage === number}
          onClick={() => onPageChange(number)}
        >
          {number}
        </PageButton>
      ))}
      <PageButton 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Next
      </PageButton>
      <PageButton 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
      >
        Last
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;

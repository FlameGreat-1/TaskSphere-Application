import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FixedSizeGrid as Grid } from 'react-window';
import { getTemplates, totalTemplateCount } from './Templates';



// Styled Components
const TemplateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin: 8px;
  width: calc(100% - 16px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
    border-color: #d0d0d0;
  }
`;

const TemplateIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
  color: ${props => props.color};
`;

const TemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TemplateName = styled.span`
  font-weight: bold;
  color: #333333;
`;

const TemplateCategory = styled.span`
  font-size: 12px;
  color: #666666;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background-color: #3a80d2;
  }
`;

const GridContainer = styled.div`
  width: 100%;
  height: 60vh;
  overflow: hidden;
`;

function TemplateItem({ template, onSelect, getTemplateIcon }) {
  return (
    <TemplateButton
      onClick={() => onSelect(template)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <TemplateIcon color={template.color}>
        {getTemplateIcon(template.icon)}
      </TemplateIcon>
      <TemplateInfo>
        <TemplateName>{template.name}</TemplateName>
        <TemplateCategory>{template.categories.join(', ')}</TemplateCategory>
      </TemplateInfo>
    </TemplateButton>
  );
}

const Cell = ({ columnIndex, rowIndex, style, data }) => {
  const index = rowIndex * 2 + columnIndex;
  if (index >= data.templates.length) return null;
  const template = data.templates[index];
  return (
    <div style={style}>
      <TemplateItem
        template={template}
        onSelect={data.onSelect}
        getTemplateIcon={data.getTemplateIcon}
      />
    </div>
  );
};

export function TemplateList({ onSelect, getTemplateIcon }) {
  const [templates, setTemplates] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreTemplates = useCallback(() => {
    const newTemplates = getTemplates(templates.length, 10);
    setTemplates(prev => [...prev, ...newTemplates]);
    setHasMore(newTemplates.length === 10 && templates.length + newTemplates.length < totalTemplateCount());
  }, [templates.length]);

  useEffect(() => {
    loadMoreTemplates();
  }, []);

  return (
    <>
      <GridContainer>
        <Grid
          columnCount={2}
          columnWidth={200}
          height={400}
          rowCount={Math.ceil(templates.length / 2)}
          rowHeight={100}
          width={400}
          itemData={{ templates, onSelect, getTemplateIcon }}
        >
          {Cell}
        </Grid>
      </GridContainer>
      {hasMore && (
        <LoadMoreButton onClick={loadMoreTemplates}>
          Load More Templates
        </LoadMoreButton>
      )}
    </>
  );
}

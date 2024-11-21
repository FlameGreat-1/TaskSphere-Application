import React, { useState } from 'react';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';

const GanttContainer = styled.div`
  width: 100%;
  height: 500px;
  overflow: auto;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const GanttChart = ({ data }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [criticalPath, setCriticalPath] = useState(false);

  const chartData = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    ...data.map(task => [
      task.id,
      task.title,
      task.resource,
      new Date(task.startDate),
      new Date(task.endDate),
      null,
      task.percentComplete,
      task.dependencies.join(',')
    ])
  ];

  const options = {
    height: 400,
    gantt: {
      criticalPathEnabled: criticalPath,
      percentEnabled: true,
      trackHeight: 30,
    },
    width: zoomLevel + '%',
  };

  return (
    <GanttContainer>
      <ControlPanel>
        <div>
          <label>Zoom: </label>
          <input 
            type="range" 
            min="50" 
            max="200" 
            value={zoomLevel} 
            onChange={(e) => setZoomLevel(Number(e.target.value))} 
          />
          {zoomLevel}%
        </div>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={criticalPath} 
              onChange={() => setCriticalPath(!criticalPath)} 
            />
            Show Critical Path
          </label>
        </div>
      </ControlPanel>
      <Chart
        chartType="Gantt"
        width="100%"
        height="100%"
        data={chartData}
        options={options}
      />
    </GanttContainer>
  );
};

export default GanttChart;

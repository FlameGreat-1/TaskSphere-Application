import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchCalendarEvents } from '../services/api';
import { FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Theme
const theme = {
  primary: '#1a73e8',
  secondary: '#34a853',
  accent: '#fbbc04',
  background: '#ffffff',
  cardBg: '#f8f9fa',
  text: '#202124',
  border: '#dadce0',
  success: '#34a853',
  warning: '#fbbc04',
  danger: '#ea4335',
  hover: '#174ea6',
  lightGray: '#f1f3f4',
  darkGray: '#5f6368'
};

// Styled Components
const CalendarContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  height: 90vh;
  background: ${theme.background};
  font-family: 'Roboto', sans-serif;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
    height: 85vh;
  }

  .rbc-calendar {
    background: ${theme.cardBg};
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    padding: 1rem;
    animation: ${fadeIn} 0.8s ease-out;
  }

  .rbc-header {
    padding: 0.75rem;
    background: ${theme.background};
    color: ${theme.text};
    font-weight: 500;
    border: none;
    border-bottom: 1px solid ${theme.border};
  }

  .rbc-toolbar {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: ${theme.background};
    border-radius: 8px 8px 0 0;
    flex-wrap: wrap;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      background: ${theme.background};
      color: ${theme.primary};
      border: 1px solid ${theme.primary};
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.3s ease;
      min-width: 80px;

      &:hover {
        background: ${theme.primary};
        color: white;
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px ${theme.primary}40;
      }

      &.rbc-active {
        background: ${theme.primary};
        color: white;
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      }
    }
  }

  .rbc-today {
    background-color: ${theme.primary}15;
  }

  .rbc-event {
    background-color: ${theme.primary};
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${theme.primary}40;
    }
  }

  .rbc-off-range-bg {
    background-color: ${theme.lightGray};
  }

  .rbc-date-cell {
    padding: 0.5rem;
    font-weight: 400;

    &.rbc-now {
      color: ${theme.primary};
      font-weight: 500;
    }
  }

  .rbc-show-more {
    color: ${theme.primary};
    font-weight: 500;
    background: transparent;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
      background: ${theme.primary}15;
      color: ${theme.primary};
    }
  }

  .rbc-overlay {
    background: ${theme.cardBg};
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }

  .rbc-agenda-view {
    table {
      border: none;
      border-collapse: separate;
      border-spacing: 0 8px;
    }

    .rbc-agenda-date-cell,
    .rbc-agenda-time-cell,
    .rbc-agenda-event-cell {
      padding: 8px;
      border: none;
      background: ${theme.lightGray};
      transition: all 0.2s ease;

      &:first-child {
        border-radius: 6px 0 0 6px;
      }

      &:last-child {
        border-radius: 0 6px 6px 0;
      }
    }

    .rbc-agenda-date-cell {
      font-weight: 500;
      color: ${theme.primary};
    }

    .rbc-agenda-event-cell {
      cursor: pointer;

      &:hover {
        background: ${theme.primary}15;
      }
    }
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  color: ${theme.text};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 400;
`;

const Subtitle = styled.p`
  color: ${theme.darkGray};
  font-size: 1.1rem;
`;

const TaskDetailsModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.background};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2);
  z-index: 1000;
  min-width: 300px;
  max-width: 90vw;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
`;

const TaskDetail = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: ${theme.text};
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  p {
    color: ${theme.darkGray};
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${theme.text};
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    color: ${theme.danger};
    background: ${theme.danger}15;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.danger}40;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  
  ${props => props.status === 'completed' && css`
    background-color: ${theme.success}20;
    color: ${theme.success};
  `}

  ${props => props.status === 'pending' && css`
    background-color: ${theme.warning}20;
    color: ${theme.warning};
  `}
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 0.5rem;
  
  ${props => props.priority === 'high' && css`
    background-color: ${theme.danger}20;
    color: ${theme.danger};
  `}

  ${props => props.priority === 'medium' && css`
    background-color: ${theme.warning}20;
    color: ${theme.warning};
  `}

  ${props => props.priority === 'low' && css`
    background-color: ${theme.success}20;
    color: ${theme.success};
  `}
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  font-size: 2rem;
  color: ${theme.primary};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const fetchEvents = useCallback(async (start, end) => {
    setIsLoading(true);
    try {
      const response = await fetchCalendarEvents(start, end);
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const start = moment(date).startOf('month').toDate();
    const end = moment(date).endOf('month').toDate();
    fetchEvents(start.toISOString(), end.toISOString());
  }, [fetchEvents, date]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedTask(event.resource);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const eventStyleGetter = useCallback((event) => {
    const isCompleted = event?.resource?.is_completed || false;
    const priority = event?.resource?.priority || 'medium';

    const priorityColors = {
      high: theme.danger,
      medium: theme.primary,
      low: theme.success
    };

    return {
      style: {
        backgroundColor: isCompleted ? theme.success : priorityColors[priority],
        borderRadius: '4px',
        opacity: 0.8,
        color: '#fff',
        border: 'none',
        display: 'block'
      }
    };
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape' && selectedTask) {
      closeModal();
    }
  }, [selectedTask, closeModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleRangeChange = useCallback((range, view) => {
    setView(view);
    let start, end;

    if (view === Views.AGENDA) {
      start = new Date();
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    } else if (Array.isArray(range)) {
      [start, end] = range;
    } else if (range.start && range.end) {
      start = range.start;
      end = range.end;
    } else {
      console.error('Invalid range format received:', range);
      return;
    }

    if (start && end && typeof start.toISOString === 'function' && typeof end.toISOString === 'function') {
      fetchEvents(start.toISOString(), end.toISOString());
    } else {
      console.error('Invalid date range received:', range);
    }
  }, [fetchEvents]);

  const calendarEvents = useMemo(() => events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    resource: event
  })), [events]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <CalendarContainer>
      <Header>
        <Title>TaskSphere Calendar</Title>
        <Subtitle>Visualize your tasks and deadlines</Subtitle>
      </Header>

      <BigCalendar
        localizer={momentLocalizer(moment)}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 100px)' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        defaultView={Views.MONTH}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        onRangeChange={handleRangeChange}
        popup
        selectable
        tooltipAccessor={event => `${event?.title || 'Untitled Task'} (${event?.resource?.is_completed ? 'Completed' : 'Pending'})`}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
      />

      <AnimatePresence>
        {selectedTask && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <TaskDetailsModal
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <CloseButton onClick={closeModal} aria-label="Close modal">×</CloseButton>
              <TaskDetail>
                <h3>{selectedTask.title || 'Untitled Task'}</h3>
                <p>Due Date: {moment(selectedTask.end).format('MMMM Do, YYYY')}</p>
                <div>
                  <StatusBadge status={selectedTask.is_completed ? 'completed' : 'pending'}>
                    {selectedTask.is_completed ? 'Completed' : 'Pending'}
                  </StatusBadge>
                  {selectedTask.priority && (
                    <PriorityBadge priority={selectedTask.priority}>
                      {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                    </PriorityBadge>
                  )}
                </div>
              </TaskDetail>
              {selectedTask.description && (
                <TaskDetail>
                  <h3>Description</h3>
                  <p>{selectedTask.description}</p>
                </TaskDetail>
              )}
            </TaskDetailsModal>
          </>
        )}
      </AnimatePresence>
    </CalendarContainer>
  );
}

const CustomToolbar = ({ label, onNavigate, onView, view }) => (
  <div className="rbc-toolbar">
    <span className="rbc-btn-group">
      <button type="button" onClick={() => onNavigate('PREV')}><FaChevronLeft /></button>
      <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
      <button type="button" onClick={() => onNavigate('NEXT')}><FaChevronRight /></button>
    </span>
    <span className="rbc-toolbar-label">{label}</span>
    <span className="rbc-btn-group">
      {['month', 'week', 'day', 'agenda'].map((viewName) => (
        <button
          key={viewName}
          type="button"
          className={view === viewName ? 'rbc-active' : ''}
          onClick={() => onView(viewName)}
        >
          {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
        </button>
      ))}
    </span>
  </div>
);

const CustomEvent = ({ event }) => (
  <div>
    <strong>{event.title}</strong>
    {event.resource.priority && (
      <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>
        ({event.resource.priority})
      </span>
    )}
  </div>
);

export default Calendar;


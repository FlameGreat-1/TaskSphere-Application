import styled, { createGlobalStyle } from 'styled-components';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Color palette
const colors = {
  primary: '#3f51b5',
  primaryDark: '#303f9f',
  primaryLight: '#c5cae9',
  secondary: '#ff4081',
  secondaryDark: '#f50057',
  background: '#f5f5f5',
  surface: '#ffffff',
  error: '#f44336',
  success: '#4caf50',
  text: '#212121',
  textSecondary: '#757575',
  border: '#e0e0e0',
};

// Breakpoints for responsive design
const breakpoints = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
};

// Media queries
const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
};

export { colors, media };

// Header Styles
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  color: #333;
`;

export const HeaderDropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const DropdownToggle = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const UserIcon = styled(FaUserCircle)`
  font-size: 1.5rem;
  margin-right: 0.5rem;
  color: #333;
`;

export const ChevronIcon = styled(FaChevronDown)`
  font-size: 1rem;
  margin-left: 0.5rem;
  color: #666;
  transition: transform 0.3s ease;

  ${HeaderDropdown}:hover & {
    transform: rotate(180deg);
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;

  ${HeaderDropdown}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1rem;
  }
`;


// Global styles
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    color: ${colors.text};
    background-color: ${colors.background};
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;


export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${colors.background};
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${media.md} {
    flex-direction: row;
  }
`;

export const Sidebar = styled(motion.nav)`
  background-color: ${colors.primary};
  width: 100%;
  transition: width 0.3s ease;
  padding: 20px;
  color: ${colors.surface};
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

  ${media.md} {
    width: ${props => props.isOpen ? '250px' : '60px'};
    height: 100vh;
    position: sticky;
    top: 0;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
`;

export const MenuToggle = styled.button`
  background: none;
  border: none;
  color: ${colors.surface};
  font-size: 24px;
  cursor: pointer;
  margin-bottom: 30px;
  transition: transform 0.3s ease;

  &:hover, &:focus {
    transform: scale(1.1);
    outline: none;
  }
`;

export const MenuItem = styled(motion.a)`
  margin: 15px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: ${colors.surface};

  &:hover, &:focus {
    background-color: ${colors.primaryDark};
    transform: translateX(5px);
    outline: none;
  }

  svg {
    margin-right: 15px;
    font-size: 18px;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

export const DropdownContent = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${colors.primaryDark};
  border-radius: 8px;
  padding: 10px;
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const NotificationButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #0056b3;
  font-size: 1.2rem;
  position: relative;
  display: flex;
  align-items: center;
`;

export const UnreadBadge = styled.span`
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  position: absolute;
  top: -5px;
  right: -5px;
`;


export const ProfileSection = styled.section`
  background-color: ${colors.surface};
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const WelcomeMessage = styled.h1`
  color: ${colors.primary};
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
`;

export const ProfileInfo = styled.p`
  color: ${colors.textSecondary};
  margin-bottom: 10px;
  font-size: 16px;
`;

export const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

export const ActionButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  padding: 15px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover, &:focus {
    background-color: ${colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    outline: none;
  }

  svg {
    margin-right: 10px;
    font-size: 20px;
  }
`;

export const TaskList = styled.div`
  margin-top: 30px;
`;

export const Task = styled.div`
  background-color: ${colors.surface};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const TaskTitle = styled.h3`
  color: ${colors.text};
  margin-bottom: 10px;
  font-weight: 600;
`;

export const TaskDescription = styled.p`
  color: ${colors.textSecondary};
  margin-bottom: 15px;
`;

export const TaskActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const TaskActionButton = styled.button`
  background-color: ${colors.primaryLight};
  color: ${colors.primary};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  font-weight: 500;

  &:hover, &:focus {
    background-color: ${colors.primary};
    color: ${colors.surface};
    outline: none;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: ${colors.surface};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ModalTitle = styled.h2`
  color: ${colors.primary};
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

export const Button = styled.button`
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  margin-right: 10px;

  &:hover, &:focus {
    background-color: ${colors.primaryDark};
    outline: none;
  }

  &:disabled {
    background-color: ${colors.border};
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 16px;
  background-color: ${colors.surface};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

export const FileInput = styled.input.attrs({ type: 'file' })`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 16px;

  &::file-selector-button {
    background-color: ${colors.primary};
    color: ${colors.surface};
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background-color: ${colors.primaryDark};
    }
  }
`;

export const ErrorMessage = styled.p`
  color: ${colors.error};
  margin-top: 5px;
  font-size: 14px;
`;

export const SuccessMessage = styled.p`
  color: ${colors.success};
  margin-top: 5px;
  font-size: 14px;
`;

export const Spinner = styled.div`
  border: 4px solid ${colors.primaryLight};
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Section = styled.section`
  margin-bottom: 30px;
`;

export const SectionTitle = styled.h2`
  color: ${colors.primary};
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

export const Card = styled.div`
  background-color: ${colors.surface};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const CardTitle = styled.h3`
  color: ${colors.primary};
  margin-bottom: 15px;
  font-weight: 600;
`;

export const CardContent = styled.div`
  color: ${colors.textSecondary};
`;

export const Badge = styled.span`
  background-color: ${colors.primaryLight};
  color: ${colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 5px;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
`;

export const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: ${colors.primary};
  transition: width 0.3s ease;
`;

export const Tooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after, &:focus::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${colors.text};
    color: ${colors.surface};
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 10px;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: ${colors.text};
`;

export const CommentList = styled.div`
  margin-top: 20px;
`;

export const Comment = styled.div`
  background-color: ${colors.background};
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
`;

export const CommentContent = styled.p`
  color: ${colors.text};
  margin-bottom: 5px;
`;

export const CommentMeta = styled.small`
  color: ${colors.textSecondary};
`;

export const AttachmentList = styled.div`
  margin-top: 20px;
`;

export const Attachment = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const AttachmentIcon = styled.span`
  margin-right: 10px;
  color: ${colors.primary};
`;

export const AttachmentLink = styled.a`
  color: ${colors.primary};
  text-decoration: none;
  
  &:hover, &:focus {
    text-decoration: underline;
    outline: none;
  }
`;

export const TimeLogList = styled.div`
  margin-top: 20px;
`;

export const TimeLog = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const TimeLogDuration = styled.span`
  font-weight: bold;
`;

export const TimeLogDate = styled.span`
  color: ${colors.textSecondary};
`;

export const GoogleIntegrationSection = styled(Section)`
  background-color: ${colors.primaryLight};
  padding: 20px;
  border-radius: 8px;
`;

export const GoogleButton = styled(Button)`
  background-color: #4285F4;
  
  &:hover, &:focus {
    background-color: #3367D6;
  }
`;

export const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const FilterInput = styled(Input)`
  flex: 1;
  min-width: 200px;
`;

export const DatePicker = styled(Input).attrs({ type: 'date' })`
  flex: 1;
  min-width: 200px;
`;

export const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Tab = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? colors.primary : colors.surface};
  color: ${props => props.active ? colors.surface : colors.primary};
  border: 1px solid ${colors.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover, &:focus {
    background-color: ${colors.primaryLight};
    color: ${colors.primary};
    outline: none;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
`;

export const PageButton = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: ${props => props.active ? colors.primary : colors.surface};
  color: ${props => props.active ? colors.surface : colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover, &:focus {
    background-color: ${colors.primaryLight};
    color: ${colors.primary};
    outline: none;
  }
`;

export const ConfirmationModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.7);
`;

export const ConfirmationContent = styled(ModalContent)`
  text-align: center;
`;

export const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const ConfirmButton = styled(Button)`
  background-color: ${colors.error};

  &:hover, &:focus {
    background-color: ${colors.errorDark};
  }
`;

export const CancelButton = styled(Button)`
  background-color: ${colors.textSecondary};

  &:hover, &:focus {
    background-color: ${colors.text};
  }
`;

export const Toast = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  color: ${colors.surface};
  background-color: ${props => props.type === 'success' ? colors.success : colors.error};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
  transform: translateY(${props => props.show ? 0 : '20px'});
`;

export const Chip = styled.span`
  display: inline-block;
  padding: 4px 8px;
  margin-right: 5px;
  margin-bottom: 5px;
  background-color: ${colors.primaryLight};
  color: ${colors.primary};
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const UserName = styled.span`
  font-weight: bold;
  color: ${colors.text};
`;

export const UserRole = styled.span`
  color: ${colors.textSecondary};
  margin-left: 10px;
`;

export const SearchInput = styled(Input)`
  padding-left: 30px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>');
  background-repeat: no-repeat;
  background-position: 8px center;
`;



export const Logo = styled.h1`
  font-size: 1.5rem;
  color: ${colors.primary};
`;

export const HeaderDropdownToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: ${colors.text};
  display: flex;
  align-items: center;

  &:focus {
    outline: none;
  }
`;

export const HeaderDropdownContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${colors.surface};
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
`;

export const HeaderDropdownItem = styled.a`
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  color: ${colors.text};
  transition: background-color 0.3s ease;

  &:hover, &:focus {
    background-color: ${colors.primaryLight};
    outline: none;
  }
`;

// Responsive adjustments
export const ResponsiveGrid = styled(Grid)`
  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${media.lg} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${media.xl} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const ResponsiveQuickActions = styled(QuickActions)`
  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${media.lg} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// Accessibility improvements
export const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${colors.primary};
  color: white;
  padding: 8px;
  z-index: 100;

  &:focus {
    top: 0;
  }
`;

// Dark mode support
export const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${colors.text};
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover, &:focus {
    color: ${colors.primary};
    outline: none;
  }
`;



// Task Details Styles
export const TaskDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const TaskInfoCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;

  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const DetailSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

export const ProgressContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  input[type="range"] {
    flex: 1;
  }

  span {
    min-width: 4rem;
    text-align: right;
  }
`;

export const SubtaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
`;

export const SubtaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: ${props => props.completed ? '#f8f9fa' : 'transparent'};
  border-radius: 4px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  span {
    flex: 1;
    text-decoration: ${props => props.completed ? 'line-through' : 'none'};
    color: ${props => props.completed ? '#6c757d' : 'inherit'};
  }
`;

export const FileUploadZone = styled.div`
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #6c757d;
    background: #f8f9fa;
  }

  label {
    cursor: pointer;
  }

  div {
    margin-bottom: 1rem;
  }
`;

export const TimeTrackingContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  input {
    flex: 1;
  }
`;

export const ReminderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  div {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }
`;

export const TaskDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TaskTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;

  input, textarea {
    flex: 1;
  }
`;


export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

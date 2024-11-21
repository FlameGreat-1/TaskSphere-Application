import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaTasks, FaCalendar, FaChartBar, FaCog } from 'react-icons/fa';

const SidebarContainer = styled.nav`
  width: 250px;
  background-color: ${props => props.theme.sidebar};
  padding: 2rem;
`;

const Logo = styled.h1`
  color: ${props => props.theme.primary};
  margin-bottom: 2rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.text};
  text-decoration: none;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  
  &:hover {
    color: ${props => props.theme.primary};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

function Sidebar() {
  return (
    <SidebarContainer>
      <Logo>TaskSphere</Logo>
      <NavLink to="/"><FaTasks /> Tasks</NavLink>
      <NavLink to="/calendar"><FaCalendar /> Calendar</NavLink>
      <NavLink to="/analytics"><FaChartBar /> Analytics</NavLink>
      <NavLink to="/settings"><FaCog /> Settings</NavLink>
    </SidebarContainer>
  );
}

export default Sidebar;

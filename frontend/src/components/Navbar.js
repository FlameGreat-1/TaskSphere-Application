import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaArrowRight } from 'react-icons/fa';

const Nav = styled.nav`
  background-color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavList = styled.ul`
  display: flex;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  color: #0056b3;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;

const ArrowIcon = styled(FaArrowRight)`
  margin-left: 5px;
`;

const HiddenNav = styled.div`
  display: none;
`;

const Navbar = () => {
  const { isAuthenticated, logout, isGoogleAuthenticated, authenticateWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  const handleGoHome = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      logout();
    }
    navigate('/');
  };

  return (
    <Nav>
      <NavList>
        {!isHomePage && (
          <NavItem>
            <NavLink to="/" onClick={handleGoHome}>
              Click here to go back Home <ArrowIcon />
            </NavLink>
          </NavItem>
        )}
      </NavList>
      <HiddenNav>
        <NavList>
          <NavItem><NavLink to="/">Home</NavLink></NavItem>
          <NavItem><NavLink to="/profile-home">Profile Home</NavLink></NavItem>
          <NavItem><NavLink to="/google-services"><FaGoogle /> Google Services</NavLink></NavItem>
          <NavItem><NavLink to="/analytics">Analytics</NavLink></NavItem>
          <NavItem><NavLink to="/calendar">Calendar</NavLink></NavItem>
          <NavItem><NavLink to="/dashboard">Dashboard</NavLink></NavItem>
          <NavItem><NavLink to="/tasks">Tasks</NavLink></NavItem>
          <NavItem><NavLink to="/calendar">Calendar</NavLink></NavItem>
          <NavItem><NavLink to="/analytics">Analytics</NavLink></NavItem>
          <NavItem><NavLink to="/task-categories">Categories</NavLink></NavItem>
          <NavItem><NavLink to="/task-tags">Tags</NavLink></NavItem>
          <NavItem><NavLink to="/time-tracking">Time Tracking</NavLink></NavItem>
          <NavItem><NavLink to="/profile">Profile</NavLink></NavItem>
          <NavItem><NavLink to="/settings">Settings</NavLink></NavItem>
          <NavItem><NavLink to="/notifications">Notifications</NavLink></NavItem>
          
          {isAuthenticated ? (
            <>
              <NavItem><NavLink to="/profile-home">Profile Home</NavLink></NavItem>
              
              {isGoogleAuthenticated ? (
                <NavItem><NavLink to="/google-services"><FaGoogle /> Google Services</NavLink></NavItem>
              ) : (
                <NavItem><NavLink to="#" onClick={authenticateWithGoogle}><FaGoogle /> Connect Google</NavLink></NavItem>
              )}
              <NavItem><NavLink to="/Home" onClick={handleLogout}>Logout</NavLink></NavItem>
            </>
          ) : (
            <>
              <NavItem><NavLink to="/login">Login</NavLink></NavItem>
              <NavItem><NavLink to="/register">Register</NavLink></NavItem>
            </>
          )}
        </NavList>
      </HiddenNav>
    </Nav>
  );
};

export default Navbar;

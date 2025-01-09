import React, { useEffect, useState } from 'react';
import { logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageContainer, FormContainer, ErrorMessage } from '../styles/FormStyles';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutUser();
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout failed', error);
        setError('Logout failed. Please try again.');
      }
    };

    performLogout();
  }, [navigate, logout]);

  if (error) {
    return (
      <PageContainer>
        <FormContainer>
          <ErrorMessage>{error}</ErrorMessage>
        </FormContainer>
      </PageContainer>
    );
  }

  return null; // This component doesn't render anything if logout is successful
};

export default Logout;

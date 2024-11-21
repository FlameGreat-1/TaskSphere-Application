
import React from 'react';
import { logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PageContainer, FormContainer, Button, ErrorMessage } from '../styles/FormStyles';

const Logout = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');

  const handleLogout = async () => {
    try {
      await logoutUser();
     
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      setError('Logout failed. Please try again.');
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <h2>Logout</h2>
        <p>Are you sure you want to log out?</p>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button onClick={handleLogout}>Logout</Button>
      </FormContainer>
    </PageContainer>
  );
};

export default Logout;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin-top: 15px;
  text-align: center;
  color: ${props => props.error ? '#dc3545' : '#28a745'};
`;

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // This is where you should put the axios.get call
        await axios.get(`http://localhost:8000/api/accounts/password-reset/${uidb64}/${token}/`);
        setIsLoading(false);
      } catch (error) {
        console.error("Token verification error:", error);
        setIsError(true);
        setMessage('Invalid or expired link');
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [uidb64, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await axios.patch('http://localhost:8000/api/accounts/password-reset-complete/', {
        password,
        token,
        uidb64
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Container><Message>Loading...</Message></Container>;
  }

  if (isError) {
    return <Container><Message error>{message}</Message></Container>;
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Set New Password</Title>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Set New Password'}
        </Button>
      </Form>
      {message && <Message error={isError}>{message}</Message>}
    </Container>
  );
};

export default ResetPasswordConfirm;

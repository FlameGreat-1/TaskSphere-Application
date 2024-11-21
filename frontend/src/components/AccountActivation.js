import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { checkActivationToken, confirmAccountActivation, resendActivationEmail } from '../services/api';
import { toast } from 'react-toastify';

const ActivationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ActivationContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const Message = styled.p`
  color: ${props => props.success ? props.theme.colors.success : props.theme.colors.error};
  text-align: center;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  margin-bottom: 14px;
  padding: 14px;
  border: 2px solid #cdcdcd;
  border-radius: 16px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #0056b3;
  }
`;

const Button = styled.button`
  padding: 14px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  margin: 10px 0;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
  &:hover {
    background-color: #004494;
  }
`;

const Link = styled.a`
  color: #0056b3;
  text-decoration: none;
  margin: 10px 0;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
`;

const AccountActivation = () => {
  const [activationStatus, setActivationStatus] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null);
  const { uidb64, token, userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await checkActivationToken(uidb64, token, userId);
        setIsValidToken(true);
        setActivationStatus({ success: true, message: response.data.message });
        if (response.data.message === 'Account is already active') {
          toast.info('Your account is already active. Redirecting to login...');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (error) {
        setActivationStatus({ success: false, message: error.response?.data?.error || 'Invalid activation link' });
      }
    };
    checkToken();
  }, [uidb64, token, userId, navigate]);

  const handleActivation = async (e) => {
    e.preventDefault();
    try {
      const response = await confirmAccountActivation(uidb64, token, userId);
      setActivationStatus({ success: true, message: response.data.message });
      toast.success('Your account has been successfully activated. Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setActivationStatus({ success: false, message: error.response?.data?.error || 'Activation failed' });
    }
  };

  const handleResendActivation = async (e) => {
    e.preventDefault();
    try {
      const response = await resendActivationEmail(email);
      setResendStatus({ success: true, message: response.data.message });
      if (response.data.message === 'Account is already active') {
        toast.info('Your account is already active. Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.success('Activation email has been resent. Please check your inbox.');
      }
    } catch (error) {
      setResendStatus({ success: false, message: error.response?.data?.error || 'Failed to resend activation email' });
    }
  };

  if (activationStatus === null) {
    return <div>Loading...</div>;
  }

  return (
    <ActivationContainer>
      <ActivationContent>
        <Logo src="/path-to-your-logo.png" alt="TaskSphere Logo" />
        <Title>Account Activation</Title>
        <Message success={activationStatus.success}>{activationStatus.message}</Message>
        {isValidToken && activationStatus.message === 'Token is valid. Please confirm activation.' && (
          <Form onSubmit={handleActivation}>
            <Button type="submit">Activate Account</Button>
          </Form>
        )}
        {!isValidToken && (
          <Form onSubmit={handleResendActivation}>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Button type="submit">Resend Activation Email</Button>
          </Form>
        )}
        {resendStatus && (
          <Message success={resendStatus.success}>{resendStatus.message}</Message>
        )}
        <Link onClick={() => navigate('/')}>Back to Home</Link>
      </ActivationContent>
    </ActivationContainer>
  );
};

export default AccountActivation;

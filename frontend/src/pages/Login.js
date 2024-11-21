import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { loginUser, loginWithGoogle, verifyOTP, resendOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Register from './Register';

const ModalBackground = styled.div`
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

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Logo = styled.img`
  width: 30px;
  height: 30px;
  margin-bottom: 15px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border: 2px solid #cdcdcd;
  border-radius: 12px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #0056b3;
  }
`;

const Button = styled.button`
  padding: 10px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin: 8px 0;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
  &:hover {
    background-color: #004494;
  }
`;

const StyledLink = styled(RouterLink)`
  color: #0056b3;
  text-decoration: none;
  margin: 8px 0;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;

const Text = styled.p`
  font-size: 10px;
  color: #767676;
  text-align: center;
  margin: 8px 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  width: 100%;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #cdcdcd;
  }
  
  span {
    padding: 0 8px;
    color: #767676;
    font-size: 12px;
  }
`;

const GoogleButton = styled(Button)`
  background-color: white;
  color: #0056b3;
  border: 2px solid #0056b3;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ResendLink = styled.span`
  color: #0056b3;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const SlidingSquares = styled.div`
  width: 50px;
  height: 50px;
  position: relative;
  
  .square {
    background-color: #0056b3;
    width: 13px;
    height: 13px;
    position: absolute;
    top: 0;
    left: 0;
    animation: slide 1s infinite;
  }
  
  .square:nth-child(1) { animation-delay: 0s; }
  .square:nth-child(2) { animation-delay: 0.1s; }
  .square:nth-child(3) { animation-delay: 0.2s; }
  .square:nth-child(4) { animation-delay: 0.3s; }
  
  @keyframes slide {
    0% { transform: translate(0, 0); }
    25% { transform: translate(37px, 0); }
    50% { transform: translate(37px, 37px); }
    75% { transform: translate(0, 37px); }
    100% { transform: translate(0, 0); }
  }
`;

const Login = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [step, setStep] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { email, password } = formData;
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      const response = await loginUser({ email, password });
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
      }, 1000);
      toast.success('OTP sent to your email and phone (if available)');
      sessionStorage.setItem('tempTokens', JSON.stringify(response.data.tokens));
      sessionStorage.setItem('tempRedirect', response.data.redirect);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { otp } = formData;
      if (!otp) {
        throw new Error('OTP is required');
      }
      const response = await verifyOTP(otp);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          login(response.data);
          onClose();
          navigate('/Profile-Home');
        }, 1000);
        toast.success('Login successful!');
      } else {
        throw new Error(response.data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const { email } = formData;
      if (!email) {
        throw new Error('Email is required to resend OTP');
      }
      await resendOTP(email);
      toast.success('New OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      setTimeout(() => {
        setIsLoading(false);
        login(response.data);
        onClose();
        navigate('/Profile-Home');
      }, 1000);
      toast.success('Google login successful!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/password-reset');
    onClose();
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackground onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <Logo src="/tasksphere-logo.webp" alt="TaskSphere Logo" />
          <Title>Log in to see more</Title>
          {step === 'login' ? (
            <Form onSubmit={handleSubmit}>
              <Input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <Input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <StyledLink onClick={handleForgotPassword}>Forgot your password?</StyledLink>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleOTPVerification}>
              <Input 
                type="text" 
                name="otp"
                placeholder="Enter OTP" 
                value={formData.otp} 
                onChange={handleChange} 
                required 
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <ResendLink onClick={handleResendOTP} disabled={isLoading}>Resend OTP</ResendLink>
            </Form>
          )}
          <Divider><span>OR</span></Divider>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.error('Google Login Failed');
              toast.error('Google Login Failed');
            }}
            render={renderProps => (
              <GoogleButton onClick={renderProps.onClick} disabled={renderProps.disabled || isLoading}>
                Continue with Google
              </GoogleButton>
            )}
          />
          <Text>
            By continuing, you agree to TaskSphere's <StyledLink to="/terms">Terms of Service</StyledLink> and acknowledge you've read our <StyledLink to="/privacy">Privacy Policy</StyledLink>. <StyledLink to="/notice">Notice at collection</StyledLink>.
          </Text>
          <StyledLink onClick={handleSignUp}>Not on TaskSphere yet? Sign up</StyledLink>
          <Text>
            Are you a business? <StyledLink to="/business" onClick={onClose}>Get started here!</StyledLink>
          </Text>
        </ModalContent>
      </ModalBackground>
      {isRegisterOpen && <Register isOpen={isRegisterOpen} onClose={handleCloseRegister} />}
      {isLoading && (
        <LoadingOverlay>
          <SlidingSquares>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
          </SlidingSquares>
        </LoadingOverlay>
      )}
    </>
  );
};

export default Login;

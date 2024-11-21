// src/components/SocialLogin.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SocialLogin = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/Profile'); // or wherever you want to redirect after successful login
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Google Login Failed')}
      />
    </div>
  );
};

export default SocialLogin;

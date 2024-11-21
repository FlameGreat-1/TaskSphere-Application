import { loginUser, logoutUser } from './api';

export const login = async (credentials) => {
  const response = await loginUser(credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

export const logout = async () => {
  await logoutUser();
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

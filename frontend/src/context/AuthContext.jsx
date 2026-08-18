import { useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';
import api from '../api/api';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (accessToken) {
        try {
          const currentUser = await getMe();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [accessToken]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setAccessToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    setAccessToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', refreshToken, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
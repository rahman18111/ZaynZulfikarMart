import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('zayn_token');
    const savedUser = localStorage.getItem('zayn_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with backend
        api.get('/auth/me')
          .then((res) => {
            if (res.data && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('zayn_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
      const { token, user: userData } = response.data;
      localStorage.setItem('zayn_token', token);
      localStorage.setItem('zayn_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(response.data.message || 'Login gagal');
  };

  const logout = () => {
    localStorage.removeItem('zayn_token');
    localStorage.removeItem('zayn_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

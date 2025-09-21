import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const verifyToken = async () => {
    if (!state.token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const data = await authAPI.verifyToken();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: state.token }
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await authAPI.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await authAPI.register(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await authAPI.googleLogin(tokenId);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const facebookLogin = async (accessToken) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await authAPI.facebookLogin(accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authAPI.updateProfile(profileData);
      dispatch({ type: 'UPDATE_USER', payload: data.user });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    facebookLogin,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
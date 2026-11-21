import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/vendedora" replace />;
  }

  return children;
};

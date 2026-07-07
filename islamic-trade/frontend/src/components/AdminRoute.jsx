import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/login" />;
};

export default AdminRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedAuth from '@/components/EnhancedAuth';
import { PageLoader } from '@/components/LoadingStates';

const SecureAuth = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <EnhancedAuth />;
};

export default SecureAuth;

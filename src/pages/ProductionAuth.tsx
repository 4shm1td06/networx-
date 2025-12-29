
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProductionAuthFlow from '@/components/ProductionAuthFlow';
import { PageLoader } from '@/components/LoadingStates';

const ProductionAuth = () => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect authenticated users to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Show auth flow for unauthenticated users
  return <ProductionAuthFlow />;
};

export default ProductionAuth;

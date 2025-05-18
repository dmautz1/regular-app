import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useAuthUser } from 'react-auth-kit';
import { AuthHandler } from '../../utils/authHandler';

/**
 * A wrapper component that protects routes requiring authentication
 * It redirects unauthenticated users to the login page with the original location saved
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @returns {React.ReactNode}
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  const location = useLocation();
  
  // Check both the isAuthenticated function and the auth user object
  const userIsAuthenticated = isAuthenticated() && !!auth();
  
  // If not authenticated, redirect to login with the current location
  if (!userIsAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If authenticated, render the children wrapped in the AuthHandler
  return <AuthHandler>{children}</AuthHandler>;
}

export default ProtectedRoute; 
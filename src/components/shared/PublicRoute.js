import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useAuthUser } from 'react-auth-kit';

/**
 * Component for public routes like login and register
 * If the user is already authenticated, they get redirected to the home page
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if not authenticated
 * @returns {React.ReactNode}
 */
function PublicRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  const location = useLocation();
  
  // Log authentication state for debugging
  console.log('PublicRoute - Authentication check:', { 
    path: location.pathname,
    isAuthenticated: isAuthenticated(), 
    hasAuth: !!auth()
  });
  
  // Check both the isAuthenticated function and the auth user object
  const userIsAuthenticated = isAuthenticated() && !!auth();
  
  // If user is already authenticated, redirect to home
  if (userIsAuthenticated) {
    console.log('User is already authenticated, redirecting to home from public route');
    // Preserve intended destination if it was passed in state
    const destination = location.state?.from || '/home';
    return <Navigate to={destination} replace />;
  }
  
  // If not authenticated, render the public route component
  return children;
}

export default PublicRoute; 
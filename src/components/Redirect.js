import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useAuthUser } from 'react-auth-kit';

/**
 * Component to handle initial navigation
 * Redirects to home if authenticated, login if not
 */
const Redirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  
  useEffect(() => {
    // Log authentication state for debugging
    console.log('Redirect component - Authentication check:', { 
      isAuthenticated: isAuthenticated(), 
      hasAuth: !!auth()
    });
    
    // Check both the authentication function and the auth user object
    const userIsAuthenticated = isAuthenticated() && !!auth();
    
    // More robust authentication check
    if (userIsAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      navigate('/home');
    } else {
      console.log('User is NOT authenticated, redirecting to login');
      // Force navigation by using replace instead of navigate
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, auth, navigate]);
  
  // Return loading text while redirecting
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Redirecting...</div>;
};

export default Redirect; 
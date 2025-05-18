import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useAuthUser } from 'react-auth-kit';
import { useApi } from '../utils/api';

/**
 * Component to handle initial navigation
 * Redirects to user's default page if authenticated, login if not
 */
const Redirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  const api = useApi();
  
  useEffect(() => {
    const handleRedirect = async () => {      
      // Check both the authentication function and the auth user object
      const userIsAuthenticated = isAuthenticated() && !!auth();
      
      // More robust authentication check
      if (userIsAuthenticated) {
        try {
          // Fetch user settings to get default page
          const settings = await api.get('/settings');
          const defaultPage = settings?.default_page?.toLowerCase() || 'dashboard';
          navigate(`/${defaultPage}`);
        } catch (error) {
          console.error('Error fetching settings:', error);
          // Fallback to dashboard if settings fetch fails
          navigate('/dashboard');
        }
      } else {
        // Force navigation by using replace instead of navigate
        navigate('/login', { replace: true });
      }
    };

    handleRedirect();
  }, [isAuthenticated, auth, navigate, api]);
  
  // Return loading text while redirecting
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Redirecting...</div>;
};

export default Redirect; 
import { useEffect } from 'react';
import { useIsAuthenticated, useSignOut, useAuthUser } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle global authentication lifecycle
 * - Monitors auth status and redirects on expiration
 * - Can be placed in a parent component to monitor auth globally
 */
export const useAuthHandler = () => {
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  const signOut = useSignOut();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Function to check authentication status
    const checkAuth = () => {
      // Check both isAuthenticated and auth user object
      const userIsAuthenticated = isAuthenticated() && !!auth();
      
      if (!userIsAuthenticated) {
        console.log('Session expired or invalid');
        signOut();
        navigate('/login', { state: { expired: true }, replace: true });
      }
    };
    
    // Check authentication immediately
    checkAuth();
    
    // Set up an interval to check periodically
    const intervalId = setInterval(checkAuth, 60000); // Check every minute
    
    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, auth, signOut, navigate]);
  
  return null; // This hook doesn't render anything
};

/**
 * Component wrapper to add auth handling to any component or app
 */
export const AuthHandler = ({ children }) => {
  useAuthHandler();
  return children;
}; 